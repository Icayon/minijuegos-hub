/**
 * ArcadeHub - Main Application & Game Manager
 */

// --- Firebase Realtime Database Configuration ---
const FIREBASE_URL = 'https://minigames-5c4ef-default-rtdb.firebaseio.com';

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        player: {
            name: '',
            title: 'Entrenador Novato'
        },
        stats: {
            totalGames: 0,
            bestReaction: null,
            
            // Untangle Records
            bestUntangleFacil: null,    
            bestUntangleMedio: null,    
            bestUntangleRealista: null, 
            
            // PrintLock Records
            bestPrintLockFacil: null,    
            bestPrintLockMedio: null,    
            bestPrintLockRealista: null,

            // PathFind Records
            bestPathFindFacil: null,
            bestPathFindMedio: null,
            bestPathFindRealista: null
        },
        reactionGame: {
            currentState: 'waiting', 
            timeoutId: null,
            startTime: null,
            sessionScores: [] 
        },
        untangleGame: {
            currentMode: 'facil', 
            realisticRoundsCleared: 0,
            realisticTimes: [],
            nodes: [],
            edges: [],
            draggingNode: null,
            dragOffset: { x: 0, y: 0 },
            isSolved: false,
            isFailed: false,
            startTime: null,
            timerIntervalId: null
        },
        printlockGame: {
            currentMode: 'facil', 
            targetPrint: 0,      
            lockedSlice: 0,      
            selectedSlices: [],  
            optionsMapping: [],  
            realisticRoundsCleared: 0, 
            realisticTimes: [], 
            isSolved: false,
            isFailed: false,
            startTime: null,
            timerIntervalId: null
        },
        pathfindGame: {
            currentMode: 'facil', // facil, medio, realista
            nodes: [],
            connectedPath: [],    // Stores indices of selected nodes in sequence
            realisticRoundsCleared: 0, // goes from 0 to 3
            realisticTimes: [],   // stores elapsed times for each round
            isSolved: false,
            isFailed: false,
            startTime: null,
            timerIntervalId: null
        },
        leaderboard: {
            data: null,
            pollingIntervalId: null
        }
    };

    // --- DOM Elements ---
    // Navbar
    const elPlayerName = document.getElementById('nav-player-name');
    const elEditNameBtn = document.getElementById('nav-edit-name-btn');

    // Dummy refs (no longer in DOM — kept to avoid reference errors)
    const elStatTotalGames        = { textContent: '' };
    const elStatBestReaction      = { textContent: '' };
    const elStatBestUntangleFacil    = { textContent: '' };
    const elStatBestUntangleMedio    = { textContent: '' };
    const elStatBestUntangleRealista = { textContent: '' };
    const elStatBestPrintLockFacil    = { textContent: '' };
    const elStatBestPrintLockMedio    = { textContent: '' };
    const elStatBestPrintLockRealista = { textContent: '' };
    const elStatBestPathFindFacil    = { textContent: '' };
    const elStatBestPathFindMedio    = { textContent: '' };
    const elStatBestPathFindRealista = { textContent: '' };
    const elResetStatsBtn = null;
    const elTabMyRecordsBtn = null; const elTabGlobalRecordsBtn = null;
    const elPanelMyRecords = null; const elPanelGlobalRecords = null;
    const elLeaderboardGameSelector = null; const elLeaderboardTableBody = null;
    const elLeaderboardLoadingMsg = null; const elLeaderboardErrorMsg = null;
    const elSuggestForm = null; const elSuggestInput = null; const elSuggestFeedback = null;

    // Views
    const elHubView = document.getElementById('home-view'); // mapped to new home view
    const elGameReactionView = document.getElementById('game-reaction-view');
    const elGameUntangleView = document.getElementById('game-untangle-view');
    const elGamePrintLockView = document.getElementById('game-printlock-view');
    const elGamePathFindView = document.getElementById('game-pathfind-view');

    const elPlayReactionBtn = null; const elBackToHubBtn = document.getElementById('back-to-hub-btn');
    const elPlayUntangleBtn = null; const elBackUntangleToHubBtn = document.getElementById('back-untangle-to-hub-btn');
    const elPlayPrintLockBtn = null; const elBackPrintLockToHubBtn = document.getElementById('back-printlock-to-hub-btn');
    const elPlayPathFindBtn = null; const elBackPathFindToHubBtn = document.getElementById('back-pathfind-to-hub-btn');

    // Reaction Game Elements
    const elReactionScreen = document.getElementById('reaction-screen');
    const elReactionIcon = document.getElementById('reaction-icon');
    const elReactionInstruction = document.getElementById('reaction-instruction');
    const elReactionTip = document.getElementById('reaction-tip');
    const elReactionScoresList = document.getElementById('reaction-scores-list');
    const elReactionBestValue = document.getElementById('reaction-best-value');
    const elCardReactionRecord = document.getElementById('card-reaction-record');

    // Untangle Game Elements
    const elUntangleSvg = document.getElementById('untangle-svg');
    const elUntangleTimer = document.getElementById('untangle-timer');
    const elUntangleIntersections = document.getElementById('untangle-intersections');
    const elUntangleWinOverlay = document.getElementById('untangle-win-overlay');
    const elUntangleNextBtn = document.getElementById('untangle-next-btn');
    const elUntangleRestartBtn = document.getElementById('untangle-restart-btn');
    const elUntangleRulesDesc = document.getElementById('untangle-rules-desc');
    
    // Untangle Mode UI
    const elUntangleModeLabel = document.getElementById('untangle-mode-label');
    const elUntangleRoundsIndicator = document.getElementById('untangle-rounds-indicator');
    const elUntangleRoundVal = document.getElementById('untangle-round-val');
    
    const elModeFacilBtn = document.getElementById('mode-facil-btn');
    const elModeMedioBtn = document.getElementById('mode-medio-btn');
    const elModeRealistaBtn = document.getElementById('mode-realista-btn');

    // Untangle Score Panel Values
    const elUntangleBestFacilVal = document.getElementById('untangle-best-facil-val');
    const elUntangleBestMedioVal = document.getElementById('untangle-best-medio-val');
    const elUntangleBestRealistaVal = document.getElementById('untangle-best-realista-val');
    
    const elCardUntangleRecordFacil = document.getElementById('card-untangle-record-facil');
    const elCardUntangleRecordMedio = document.getElementById('card-untangle-record-medio');
    const elCardUntangleRecordRealista = document.getElementById('card-untangle-record-realista');

    // PrintLock Game Elements
    const elPrintLockCanvas = document.getElementById('printlock-canvas');
    const elPrintLockTimer = document.getElementById('printlock-timer');
    const elPrintLockStatusLabel = document.getElementById('printlock-status-label');
    const elPrintLockStatusIcon = document.getElementById('printlock-status-icon');
    const elPrintLockWinOverlay = document.getElementById('printlock-win-overlay');
    const elPrintLockNextBtn = document.getElementById('printlock-next-btn');
    const elPrintLockRestartBtn = document.getElementById('printlock-restart-btn');
    
    // PrintLock Score Panel Values
    const elPrintLockBestFacilVal = document.getElementById('printlock-best-facil-val');
    const elPrintLockBestMedioVal = document.getElementById('printlock-best-medio-val');
    const elPrintLockBestRealistaVal = document.getElementById('printlock-best-realista-val');
    const elCardPrintLockRecordFacil = document.getElementById('card-printlock-record-facil');
    const elCardPrintLockRecordMedio = document.getElementById('card-printlock-record-medio');
    const elCardPrintLockRecordRealista = document.getElementById('card-printlock-record-realista');
    
    const elPrintLockRoundsIndicator = document.getElementById('printlock-rounds-indicator');
    const elPrintLockRoundVal = document.getElementById('printlock-round-val');
    const elPrintLockRulesDesc = document.getElementById('printlock-rules-desc');
    const elPrintLockScannerBox = document.getElementById('printlock-scanner-box');

    // Difficulty buttons for PrintLock
    const elPrintLockModeFacilBtn = document.getElementById('printlock-mode-facil-btn');
    const elPrintLockModeMedioBtn = document.getElementById('printlock-mode-medio-btn');
    const elPrintLockModeRealistaBtn = document.getElementById('printlock-mode-realista-btn');

    // PathFind Game Elements
    const elPathFindSvg = document.getElementById('pathfind-svg');
    const elPathFindTimer = document.getElementById('pathfind-timer');
    const elPathFindModeLabel = document.getElementById('pathfind-mode-label');
    const elPathFindRoundsIndicator = document.getElementById('pathfind-rounds-indicator');
    const elPathFindRoundVal = document.getElementById('pathfind-round-val');
    const elPathFindRulesDesc = document.getElementById('pathfind-rules-desc');
    const elPathFindWinOverlay = document.getElementById('pathfind-win-overlay');
    const elPathFindNextBtn = document.getElementById('pathfind-next-btn');
    const elPathFindRestartBtn = document.getElementById('pathfind-restart-btn');
    const elPathFindProgressBar = document.getElementById('pathfind-progress-bar');
    const elPathFindCanvasContainer = document.getElementById('pathfind-canvas-container');

    // Difficulty buttons for PathFind
    const elPathFindModeFacilBtn = document.getElementById('pathfind-mode-facil-btn');
    const elPathFindModeMedioBtn = document.getElementById('pathfind-mode-medio-btn');
    const elPathFindModeRealistaBtn = document.getElementById('pathfind-mode-realista-btn');

    // PathFind Score Panel Values
    const elPathFindBestFacilVal = document.getElementById('pathfind-best-facil-val');
    const elPathFindBestMedioVal = document.getElementById('pathfind-best-medio-val');
    const elPathFindBestRealistaVal = document.getElementById('pathfind-best-realista-val');
    
    const elCardPathFindRecordFacil = document.getElementById('card-pathfind-record-facil');
    const elCardPathFindRecordMedio = document.getElementById('card-pathfind-record-medio');
    const elCardPathFindRecordRealista = document.getElementById('card-pathfind-record-realista');

    // Modal Elements
    const elEditModal = document.getElementById('edit-profile-modal');
    const elModalInput = document.getElementById('edit-name-input');
    const elModalCancelBtn = document.getElementById('modal-cancel-btn');
    const elModalSaveBtn = document.getElementById('modal-save-btn');

    // Onboarding Modal Elements
    const elWelcomeModal = document.getElementById('welcome-modal');
    const elWelcomeNameInput = document.getElementById('welcome-name-input');
    const elWelcomeSaveBtn = document.getElementById('welcome-save-btn');

    // --- Biometric Fingerprint Vector Templates ---
    const fingerprintTemplates = [
        // Print 0
        [
            { r: 25, arcs: [[0, 2]] },
            { r: 50, arcs: [[0.1, 0.9], [1.1, 1.8]] },
            { r: 75, arcs: [[0.3, 1.2], [1.4, 1.9]] },
            { r: 100, arcs: [[0.5, 1.5], [1.7, 0.2]] },
            { r: 125, arcs: [[0.0, 0.8], [1.0, 1.7]] },
            { r: 150, arcs: [[0.2, 1.1], [1.3, 1.9]] },
            { r: 175, arcs: [[0.4, 1.4], [1.6, 0.1]] },
            { r: 200, arcs: [[0.1, 1.8]] }
        ],
        // Print 1
        [
            { r: 15, arcs: [[0, 2]] },
            { r: 40, arcs: [[0.3, 1.5], [1.7, 0.1]] },
            { r: 65, arcs: [[0.0, 1.1], [1.3, 1.8]] },
            { r: 90, arcs: [[0.2, 0.9], [1.2, 1.9]] },
            { r: 115, arcs: [[0.4, 1.3], [1.5, 0.1]] },
            { r: 140, arcs: [[0.1, 1.0], [1.2, 1.7]] },
            { r: 165, arcs: [[0.3, 1.2], [1.4, 1.9]] },
            { r: 190, arcs: [[0.5, 1.8]] }
        ],
        // Print 2
        [
            { r: 20, arcs: [[0, 1.9]] },
            { r: 45, arcs: [[0.2, 1.1], [1.3, 1.7]] },
            { r: 70, arcs: [[0.5, 1.4], [1.6, 0.0]] },
            { r: 95, arcs: [[0.1, 0.8], [1.0, 1.9]] },
            { r: 120, arcs: [[0.3, 1.2], [1.4, 1.7]] },
            { r: 145, arcs: [[0.0, 0.9], [1.1, 1.8]] },
            { r: 170, arcs: [[0.2, 1.3], [1.5, 1.9]] },
            { r: 195, arcs: [[0.4, 1.9]] }
        ],
        // Print 3
        [
            { r: 30, arcs: [[0.1, 1.7]] },
            { r: 55, arcs: [[0.0, 0.8], [1.0, 1.9]] },
            { r: 80, arcs: [[0.3, 1.2], [1.4, 1.7]] },
            { r: 105, arcs: [[0.5, 1.5], [1.8, 0.2]] },
            { r: 130, arcs: [[0.2, 1.1], [1.3, 1.9]] },
            { r: 155, arcs: [[0.4, 1.4], [1.6, 0.1]] },
            { r: 180, arcs: [[0.1, 1.0], [1.2, 1.8]] },
            { r: 205, arcs: [[0.3, 1.9]] }
        ]
    ];

    // --- Checksum Generator (Anti-Cheat protection) ---
    function getChecksum(game, player, score) {
        const salt = "ArcadeHubSecretSalt2026!";
        const str = `${game}:${player}:${score}:${salt}`;
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return (hash >>> 0).toString(16);
    }

    // --- Init & Load ---
    function initialize() {
        const storedName = localStorage.getItem('arcade_player_name');

        if (storedName) {
            state.player.name = storedName;
            loadDataFromStorage();
            updateDashboardUI();
            // Skip welcome modal — go straight to app
            startHomeLbPolling();
        } else {
            elWelcomeModal.classList.remove('hidden');
            elWelcomeNameInput.focus();
        }

        // Navbar buttons
        document.getElementById('nav-home-btn')?.addEventListener('click', () => switchView('home'));
        document.getElementById('nav-games-btn')?.addEventListener('click', () => switchView('games'));
        document.getElementById('nav-leaderboard-btn')?.addEventListener('click', () => switchView('leaderboard'));

        // Home game cards
        document.querySelectorAll('.home-game-card').forEach(card => {
            card.addEventListener('click', () => switchView(card.dataset.game));
        });

        // Hero CTA → goes to games page
        document.getElementById('hero-play-btn')?.addEventListener('click', () => switchView('games'));

        // Games page cards
        document.querySelectorAll('.game-page-card').forEach(card => {
            card.addEventListener('click', () => switchView(card.dataset.game));
        });



        setupEventListeners();
        setupUntangleListeners();
        startHomeLbPolling();
    }

    // --- Data Persistence ---
    function loadDataFromStorage() {
        const storedName = localStorage.getItem('arcade_player_name');
        if (storedName) {
            state.player.name = storedName;
        }

        const storedStats = localStorage.getItem('arcade_stats');
        if (storedStats) {
            try {
                const parsed = JSON.parse(storedStats);
                state.stats.totalGames = parsed.totalGames || 0;
                state.stats.bestReaction = parsed.bestReaction || null;
                
                // Untangle
                state.stats.bestUntangleFacil = parsed.bestUntangleFacil || parsed.bestUntangle || null;
                state.stats.bestUntangleMedio = parsed.bestUntangleMedio || null;
                state.stats.bestUntangleRealista = parsed.bestUntangleRealista || null;
                
                // PrintLock
                state.stats.bestPrintLockFacil = parsed.bestPrintLockFacil || parsed.bestPrintLock || null;
                state.stats.bestPrintLockMedio = parsed.bestPrintLockMedio || null;
                state.stats.bestPrintLockRealista = parsed.bestPrintLockRealista || null;

                // PathFind
                state.stats.bestPathFindFacil = parsed.bestPathFindFacil || null;
                state.stats.bestPathFindMedio = parsed.bestPathFindMedio || null;
                state.stats.bestPathFindRealista = parsed.bestPathFindRealista || null;
            } catch (e) {
                console.error("Error reading saved stats", e);
            }
        }
    }

    function saveDataToStorage() {
        localStorage.setItem('arcade_player_name', state.player.name);
        localStorage.setItem('arcade_stats', JSON.stringify(state.stats));
    }

    // --- UI Update Functions ---
    function updateDashboardUI() {
        if (elPlayerName) elPlayerName.textContent = state.player.name;

        // Update in-game personal best panels
        const bestTimeStr = state.stats.bestReaction ? `${state.stats.bestReaction} ms` : '-- ms';
        if (elReactionBestValue) elReactionBestValue.textContent = bestTimeStr;
        if (elCardReactionRecord) elCardReactionRecord.textContent = bestTimeStr;

        const ufStr = state.stats.bestUntangleFacil ? `${state.stats.bestUntangleFacil.toFixed(1)} s` : '-- s';
        const umStr = state.stats.bestUntangleMedio ? `${state.stats.bestUntangleMedio.toFixed(1)} s` : '-- s';
        const urStr = state.stats.bestUntangleRealista ? `${state.stats.bestUntangleRealista.toFixed(1)} s` : '-- s';
        if (elUntangleBestFacilVal) elUntangleBestFacilVal.textContent = ufStr;
        if (elUntangleBestMedioVal) elUntangleBestMedioVal.textContent = umStr;
        if (elUntangleBestRealistaVal) elUntangleBestRealistaVal.textContent = urStr;

        const pfStr = state.stats.bestPrintLockFacil ? `${state.stats.bestPrintLockFacil.toFixed(1)} s` : '-- s';
        const pmStr = state.stats.bestPrintLockMedio ? `${state.stats.bestPrintLockMedio.toFixed(1)} s` : '-- s';
        const prStr = state.stats.bestPrintLockRealista ? `${state.stats.bestPrintLockRealista.toFixed(1)} s` : '-- s';
        if (elPrintLockBestFacilVal) elPrintLockBestFacilVal.textContent = pfStr;
        if (elPrintLockBestMedioVal) elPrintLockBestMedioVal.textContent = pmStr;
        if (elPrintLockBestRealistaVal) elPrintLockBestRealistaVal.textContent = prStr;

        const pathfStr = state.stats.bestPathFindFacil ? `${state.stats.bestPathFindFacil.toFixed(1)} s` : '-- s';
        const pathmStr = state.stats.bestPathFindMedio ? `${state.stats.bestPathFindMedio.toFixed(1)} s` : '-- s';
        const pathrStr = state.stats.bestPathFindRealista ? `${state.stats.bestPathFindRealista.toFixed(1)} s` : '-- s';
        if (elPathFindBestFacilVal) elPathFindBestFacilVal.textContent = pathfStr;
        if (elPathFindBestMedioVal) elPathFindBestMedioVal.textContent = pathmStr;
        if (elPathFindBestRealistaVal) elPathFindBestRealistaVal.textContent = pathrStr;
    }

    // --- Global Live Leaderboard Operations ---
    function submitScoreToFirebase(gameKey, scoreValue) {
        const player = state.player.name;
        const listUrl = `${FIREBASE_URL}/leaderboard/${gameKey}.json`;

        // Step 1 — fetch existing entries for this game to find player's current best
        fetch(listUrl)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                let existingKey = null;
                let existingScore = null;

                if (data && typeof data === 'object') {
                    for (const [key, entry] of Object.entries(data)) {
                        if (entry.name === player) {
                            if (existingScore === null || entry.score < existingScore) {
                                existingScore = entry.score;
                                existingKey = key;
                            }
                        }
                    }
                }

                // Step 2 — compare scores (lower = better for all games)
                if (existingScore !== null && scoreValue >= existingScore) {
                    // Not better — skip upload
                    const formatted = gameKey === 'reaction'
                        ? `${Math.round(existingScore)} ms`
                        : `${existingScore.toFixed(1)} s`;
                    showToast(`Tu récord anterior (${formatted}) es mejor. No se ha subido.`, 'info');
                    return;
                }

                // Step 3 — delete old entry if exists, then upload new one
                const doUpload = () => {
                    const entry = {
                        name: player,
                        score: scoreValue,
                        date: new Date().toISOString().split('T')[0],
                        hash: getChecksum(gameKey, player, scoreValue)
                    };
                    return fetch(listUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(entry)
                    });
                };

                const afterDelete = existingKey
                    ? fetch(`${FIREBASE_URL}/leaderboard/${gameKey}/${existingKey}.json`, { method: 'DELETE' })
                    : Promise.resolve();

                afterDelete
                    .then(() => doUpload())
                    .then(res => {
                        if (!res.ok) throw new Error('Firebase write failed');
                        return res.json();
                    })
                    .then(() => {
                        const formatted = gameKey === 'reaction'
                            ? `${Math.round(scoreValue)} ms`
                            : `${scoreValue.toFixed(1)} s`;
                        const msg = existingScore !== null
                            ? `🏆 ¡Nuevo récord personal! ${formatted} subido al ranking global.`
                            : `✅ Puntuación (${formatted}) subida al ranking global.`;
                        showToast(msg, 'success');
                        // Refresh leaderboard immediately
                        if (state.leaderboard.data) delete state.leaderboard.data[gameKey];
                        loadHomeLb(); loadFullLeaderboard();
                        // Refresh side lb for current game
                        if (gameKey === 'reaction') loadSideLeaderboard('reaction', true, 'reaction-side-lb');
                        else if (gameKey === 'untangle_realista') loadSideLeaderboard('untangle_realista', false, 'untangle-side-lb');
                        else if (gameKey === 'printlock_realista') loadSideLeaderboard('printlock_realista', false, 'printlock-side-lb');
                        else if (gameKey === 'pathfind_realista') loadSideLeaderboard('pathfind_realista', false, 'pathfind-side-lb');
                    })
                    .catch(err => {
                        console.warn('Score upload failed:', err);
                        showToast('Error al subir la puntuación. Comprueba tu conexión.', 'error');
                    });
            })
            .catch(err => {
                console.warn('Score check failed:', err);
                showToast('Error de conexión al comprobar el ranking.', 'error');
            });
    }

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.className = `toast toast-${type} toast-show`;
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.classList.remove('toast-show');
        }, 4000);
    }


    function loadSideLeaderboard(firebaseKey, isReaction, elementId) {
        const tbody = document.getElementById(elementId);
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="3" class="lb-loading">Cargando...</td></tr>';
        const url = `${FIREBASE_URL}/leaderboard/${firebaseKey}.json`;
        fetch(url)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                let entries = [];
                if (data && typeof data === 'object') {
                    const unique = {};
                    Object.values(data).filter(e => {
                        return e && e.hash === getChecksum(firebaseKey, e.name, e.score);
                    }).forEach(e => {
                        if (!unique[e.name] || e.score < unique[e.name].score) {
                            unique[e.name] = e;
                        }
                    });
                    entries = Object.values(unique).sort((a, b) => a.score - b.score).slice(0, 10);
                }
                if (entries.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" class="lb-empty" style="padding: 0.5rem 0;">¡Sé el primero!</td></tr>';
                    return;
                }
                const medals = ['🥇', '🥈', '🥉'];
                const playerName = state.player.name;
                tbody.innerHTML = entries.map((e, i) => {
                    const pos = i < 3 ? medals[i] : `#${i + 1}`;
                    const sc  = isReaction ? `${Math.round(e.score)} ms` : `${e.score.toFixed(1)} s`;
                    const mine = e.name === playerName ? 'my-row' : '';
                    return `<tr class="${mine}">
                        <td style="padding: 0.35rem 0.5rem; font-size: 0.78rem;">${pos}</td>
                        <td style="padding: 0.35rem 0.5rem; font-size: 0.78rem; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e.name}</td>
                        <td style="padding: 0.35rem 0.5rem; font-size: 0.78rem; text-align: right;">${sc}</td>
                    </tr>`;
                }).join('');
            })
            .catch(() => {
                tbody.innerHTML = '<tr><td colspan="3" class="lb-empty">Error</td></tr>';
            });
    }

    // --- Navigation ---
    const ALL_VIEWS = ['home-view','games-view','leaderboard-view',
        'game-reaction-view','game-untangle-view','game-printlock-view','game-pathfind-view'];

    function setActiveNavBtn(viewName) {
        ['nav-home-btn','nav-games-btn','nav-leaderboard-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('active');
        });
        if (viewName === 'home')        document.getElementById('nav-home-btn')?.classList.add('active');
        else if (viewName === 'games')  document.getElementById('nav-games-btn')?.classList.add('active');
        else if (viewName === 'leaderboard') document.getElementById('nav-leaderboard-btn')?.classList.add('active');
    }

    function switchView(viewToShow) {
        ALL_VIEWS.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active-view');
        });

        // Stop running timers
        if (state.untangleGame.timerIntervalId) { clearInterval(state.untangleGame.timerIntervalId); state.untangleGame.timerIntervalId = null; }
        if (state.printlockGame.timerIntervalId) { clearInterval(state.printlockGame.timerIntervalId); state.printlockGame.timerIntervalId = null; }
        if (state.pathfindGame.timerIntervalId) { clearInterval(state.pathfindGame.timerIntervalId); state.pathfindGame.timerIntervalId = null; }

        setActiveNavBtn(viewToShow);

        if (viewToShow === 'home' || viewToShow === 'hub') {
            document.getElementById('home-view').classList.add('active-view');
            updateDashboardUI();
        } else if (viewToShow === 'games') {
            document.getElementById('games-view').classList.add('active-view');
        } else if (viewToShow === 'leaderboard') {
            document.getElementById('leaderboard-view').classList.add('active-view');
            loadFullLeaderboard();
        } else if (viewToShow === 'reaction') {
            elGameReactionView.classList.add('active-view');
            loadSideLeaderboard('reaction', true, 'reaction-side-lb');
            showPregameOverlay('reaction');
        } else if (viewToShow === 'untangle') {
            elGameUntangleView.classList.add('active-view');
            state.untangleGame.currentMode = 'facil';
            updateModeButtonsUI();
            state.untangleGame.realisticRoundsCleared = 0;
            state.untangleGame.realisticTimes = [];
            loadSideLeaderboard('untangle_realista', false, 'untangle-side-lb');
            showPregameOverlay('untangle');
        } else if (viewToShow === 'printlock') {
            elGamePrintLockView.classList.add('active-view');
            state.printlockGame.currentMode = 'facil';
            updatePrintLockModeButtonsUI();
            state.printlockGame.realisticRoundsCleared = 0;
            state.printlockGame.realisticTimes = [];
            loadSideLeaderboard('printlock_realista', false, 'printlock-side-lb');
            showPregameOverlay('printlock');
        } else if (viewToShow === 'pathfind') {
            elGamePathFindView.classList.add('active-view');
            state.pathfindGame.currentMode = 'facil';
            updatePathFindModeButtonsUI();
            state.pathfindGame.realisticRoundsCleared = 0;
            state.pathfindGame.realisticTimes = [];
            loadSideLeaderboard('pathfind_realista', false, 'pathfind-side-lb');
            showPregameOverlay('pathfind');
        }
    }

    // ── Full Leaderboard Page ──────────────────────────────────────────────────
    const LB_CATEGORIES = [
        { key: 'reaction',          label: 'Reflejos Rápidos',    sub: '',         icon: '⚡', isReaction: true  },
        { key: 'untangle_realista', label: 'Desenredar Nodos',    sub: 'Realista', icon: '🟣', isReaction: false },
        { key: 'printlock_realista',label: 'Pirateo de Huella',   sub: 'Realista', icon: '🟢', isReaction: false },
        { key: 'pathfind_realista', label: 'Conector de Puntos',  sub: 'Realista', icon: '🟡', isReaction: false },
    ];

    function loadFullLeaderboard() {
        const grid = document.getElementById('lb-full-grid');
        const champTable = document.getElementById('champions-table');
        const champTbody = document.getElementById('champions-tbody');
        const champLoading = document.getElementById('champions-loading');
        if (!grid) return;
        const playerName = state.player.name;

        // Build skeleton cards for category grids
        grid.innerHTML = LB_CATEGORIES.map(cat => `
            <div class="lb-card" id="lbcard-${cat.key}">
                <div class="lb-card-header">
                    <span class="lb-card-icon">${cat.icon}</span>
                    <div>
                        <div class="lb-card-title">${cat.label}</div>
                        ${cat.sub ? `<div class="lb-card-subtitle">${cat.sub}</div>` : ''}
                    </div>
                </div>
                <div class="lb-card-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
            </div>
        `).join('');

        if (champLoading) {
            champLoading.style.display = 'block';
            champLoading.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando puntos...';
        }
        if (champTable) champTable.classList.add('hidden');

        const top1Points = {}; // name -> count of Top 1s

        // Fetch each category in parallel
        const promises = LB_CATEGORIES.map(cat => {
            const card = document.getElementById(`lbcard-${cat.key}`);
            return fetch(`${FIREBASE_URL}/leaderboard/${cat.key}.json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    let entries = [];
                    if (data && typeof data === 'object') {
                        const unique = {};
                        Object.values(data).filter(e => {
                            return e && e.hash === getChecksum(cat.key, e.name, e.score);
                        }).forEach(e => {
                            if (!unique[e.name] || e.score < unique[e.name].score) {
                                unique[e.name] = e;
                            }
                        });
                        entries = Object.values(unique).sort((a,b) => a.score - b.score).slice(0, 10);
                    }

                    // Process Top 1 point
                    if (entries.length > 0) {
                        const topPlayer = entries[0].name;
                        top1Points[topPlayer] = (top1Points[topPlayer] || 0) + 1;
                    }

                    const medals = ['🥇','🥈','🥉'];
                    if (entries.length === 0) {
                        if (card) {
                            card.innerHTML = card.innerHTML.replace(/<div class="lb-card-loading">.*?<\/div>/s,
                                '<div class="lb-card-loading" style="font-style:italic">¡Sé el primero!</div>');
                        }
                        return;
                    }
                    const rows = entries.map((e,i) => {
                        const pos = i < 3 ? medals[i] : `#${i+1}`;
                        const sc  = cat.isReaction ? `${Math.round(e.score)} ms` : `${e.score.toFixed(1)} s`;
                        const mine = e.name === playerName ? 'my-row' : '';
                        return `<tr class="${mine}"><td>${pos}</td><td>${e.name}</td><td>${sc}</td></tr>`;
                    }).join('');
                    if (card) {
                        card.querySelector('.lb-card-loading').outerHTML = `<table class="lb-card-table"><tbody>${rows}</tbody></table>`;
                    }
                })
                .catch(() => {
                    if (card) {
                        card.querySelector('.lb-card-loading').textContent = 'Error de conexión';
                    }
                });
        });

        // Wait for all fetches to complete to compute the Hall of Fame
        Promise.all(promises)
            .then(() => {
                if (champLoading) champLoading.style.display = 'none';
                if (!champTbody || !champTable) return;

                // Sort players by total points
                const sortedPlayers = Object.entries(top1Points)
                    .map(([name, pts]) => ({ name, points: pts }))
                    .sort((a,b) => b.points - a.points);

                if (sortedPlayers.length === 0) {
                    champTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:1.5rem">Aún no hay récords para calcular puntos.</td></tr>';
                } else {
                    const medals = ['🥇','🥈','🥉'];
                    champTbody.innerHTML = sortedPlayers.map((p, i) => {
                        const pos = i < 3 ? medals[i] : `#${i+1}`;
                        const ptsStr = p.points === 1 ? '1 punto' : `${p.points} puntos`;
                        const mine = p.name === playerName ? 'my-row' : '';
                        return `<tr class="${mine}">
                            <td style="font-weight:700;">${pos}</td>
                            <td style="font-weight:600;">${p.name}</td>
                            <td style="text-align:right;font-weight:700;color:var(--accent-yellow);">${ptsStr}</td>
                        </tr>`;
                    }).join('');
                }
                champTable.classList.remove('hidden');
            })
            .catch(err => {
                console.warn('Error computing Hall of Fame', err);
                if (champLoading) champLoading.innerHTML = 'Error al calcular Hall of Fame.';
            });
    }

    // ── Home Leaderboard Widget ───────────────────────────────────────────────
    let homeLbInterval = null;

    function loadHomeLb() {
        const tbody  = document.getElementById('home-lb-tbody');
        const status = document.getElementById('home-lb-loading');
        if (!tbody) return;
        if (status) { status.style.display = 'block'; }

        const playerName = state.player.name;
        const top1Points = {};

        const promises = LB_CATEGORIES.map(cat => {
            return fetch(`${FIREBASE_URL}/leaderboard/${cat.key}.json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    let entries = [];
                    if (data && typeof data === 'object') {
                        const unique = {};
                        Object.values(data).filter(e => {
                            return e && e.hash === getChecksum(cat.key, e.name, e.score);
                        }).forEach(e => {
                            if (!unique[e.name] || e.score < unique[e.name].score) {
                                unique[e.name] = e;
                            }
                        });
                        entries = Object.values(unique).sort((a,b) => a.score - b.score).slice(0, 1);
                    }
                    if (entries.length > 0) {
                        const topPlayer = entries[0].name;
                        top1Points[topPlayer] = (top1Points[topPlayer] || 0) + 1;
                    }
                });
        });

        Promise.all(promises)
            .then(() => {
                if (status) status.style.display = 'none';
                
                const sortedPlayers = Object.entries(top1Points)
                    .map(([name, pts]) => ({ name, points: pts }))
                    .sort((a,b) => b.points - a.points);

                if (sortedPlayers.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:1.5rem">Aún sin récords.</td></tr>';
                    return;
                }

                const medals = ['🥇','🥈','🥉'];
                tbody.innerHTML = sortedPlayers.map((p, i) => {
                    const pos = i < 3 ? medals[i] : `#${i+1}`;
                    const ptsStr = p.points === 1 ? '1 pt' : `${p.points} pts`;
                    const mine = p.name === playerName ? 'my-row' : '';
                    return `<tr class="${mine}">
                        <td>${pos}</td>
                        <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</td>
                        <td>${ptsStr}</td>
                    </tr>`;
                }).join('');
            })
            .catch(() => {
                if (status) status.style.display = 'none';
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:1.5rem">Error de conexión.</td></tr>';
            });
    }

    function startHomeLbPolling() {
        loadHomeLb();
        if (homeLbInterval) clearInterval(homeLbInterval);
        homeLbInterval = setInterval(() => loadHomeLb(), 10000);
    }

    // --- Pre-Game Overlay Logic ---

    // Maps game keys to Firebase leaderboard keys
    const PREGAME_LB_KEY = {
        reaction:  { reaction: 'reaction' },
        untangle:  { facil: 'untangle_facil', medio: 'untangle_medio', realista: 'untangle_realista' },
        printlock: { facil: 'printlock_facil', medio: 'printlock_medio', realista: 'printlock_realista' },
        pathfind:  { facil: 'pathfind_facil',  medio: 'pathfind_medio',  realista: 'pathfind_realista' }
    };

    const DIFF_LABELS = { facil: 'Fácil', medio: 'Medio', realista: 'Realista' };

    function fetchPregameLeaderboard(firebaseKey, tbodyEl, isReaction) {
        tbodyEl.innerHTML = '<tr><td colspan="3" class="lb-loading">Cargando...</td></tr>';
        const url = `${FIREBASE_URL}/leaderboard/${firebaseKey}.json`;
        fetch(url)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                let entries = [];
                if (data && typeof data === 'object') {
                    const unique = {};
                    Object.values(data).filter(e => {
                        return e && e.hash === getChecksum(firebaseKey, e.name, e.score);
                    }).forEach(e => {
                        if (!unique[e.name] || e.score < unique[e.name].score) {
                            unique[e.name] = e;
                        }
                    });
                    entries = Object.values(unique).sort((a, b) => a.score - b.score).slice(0, 10);
                }
                if (entries.length === 0) {
                    tbodyEl.innerHTML = '<tr><td colspan="3" class="lb-empty">¡Sé el primero en el ranking!</td></tr>';
                    return;
                }
                const medals = ['🥇', '🥈', '🥉'];
                tbodyEl.innerHTML = entries.map((e, i) => {
                    const pos = i < 3 ? medals[i] : `#${i + 1}`;
                    const sc  = isReaction ? `${Math.round(e.score)} ms` : `${e.score.toFixed(1)} s`;
                    return `<tr><td>${pos}</td><td>${e.name}</td><td>${sc}</td></tr>`;
                }).join('');
            })
            .catch(() => {
                tbodyEl.innerHTML = '<tr><td colspan="3" class="lb-empty">Sin conexión</td></tr>';
            });
    }

    function showPregameOverlay(game) {
        const overlay = document.getElementById(`${game}-pregame`);
        if (!overlay) return;
        overlay.classList.remove('hidden', 'hiding');

        if (game === 'reaction') {
            fetchPregameLeaderboard('reaction', document.getElementById('reaction-pregame-lb'), true);
            document.getElementById('reaction-start-btn').onclick = () => hidePregameOverlay(game, () => resetReactionGame());
        } else {
            // Initialize pregame diff buttons for multi-difficulty games
            const diffBtns = overlay.querySelectorAll('.pregame-diff-btn');
            const lbBody   = document.getElementById(`${game}-pregame-lb`);
            const diffLabel = document.getElementById(`${game}-pregame-diff-label`);
            let activeDiff  = 'facil';

            const loadForDiff = (diff) => {
                activeDiff = diff;
                if (diffLabel) diffLabel.textContent = DIFF_LABELS[diff];
                if (diff === 'realista') {
                    fetchPregameLeaderboard(PREGAME_LB_KEY[game][diff], lbBody, false);
                } else {
                    lbBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);font-style:italic;padding:1.5rem;">Modo Práctica (No registra ranking global)</td></tr>';
                }
            };

            diffBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.diff === 'facil');
                btn.onclick = () => {
                    diffBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Sync game mode selectors
                    const modeMap = { facil: 0, medio: 1, realista: 2 };
                    const modeKeys = ['facil', 'medio', 'realista'];
                    const diff = btn.dataset.diff;
                    if (game === 'untangle') {
                        state.untangleGame.currentMode = diff;
                        updateModeButtonsUI();
                    } else if (game === 'printlock') {
                        state.printlockGame.currentMode = diff;
                        updatePrintLockModeButtonsUI();
                    } else if (game === 'pathfind') {
                        state.pathfindGame.currentMode = diff;
                        updatePathFindModeButtonsUI();
                    }
                    loadForDiff(diff);
                };
            });

            loadForDiff('facil');

            document.getElementById(`${game}-start-btn`).onclick = () => {
                hidePregameOverlay(game, () => {
                    if (game === 'untangle') initUntangleGame();
                    else if (game === 'printlock') initPrintLockGame();
                    else if (game === 'pathfind') initPathFindGame();
                });
            };
        }
    }

    function hidePregameOverlay(game, callback) {
        const overlay = document.getElementById(`${game}-pregame`);
        if (!overlay) { if (callback) callback(); return; }
        overlay.classList.add('hiding');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('hiding');
            if (callback) callback();
        }, 260);
    }

    // --- Onboarding / Name Saving ---
    function saveWelcomeName() {
        const newName = elWelcomeNameInput.value.trim();
        if (newName) {
            state.player.name = newName;
            saveDataToStorage();
            elWelcomeModal.classList.add('hidden');
            loadDataFromStorage();
            updateDashboardUI();
            startHomeLbPolling();
        }
    }

    function openEditProfileModal() {
        elModalInput.value = state.player.name;
        elEditModal.classList.remove('hidden');
        elModalInput.focus();
    }

    function closeEditProfileModal() {
        elEditModal.classList.add('hidden');
    }

    function saveProfileName() {
        const newName = elModalInput.value.trim();
        if (newName) {
            state.player.name = newName;
            saveDataToStorage();
            updateDashboardUI();
            closeEditProfileModal();
        }
    }

    // --- Game Logic: Reaction Time ---
    function resetReactionGame() {
        if (state.reactionGame.timeoutId) {
            clearTimeout(state.reactionGame.timeoutId);
        }
        state.reactionGame.currentState = 'waiting';
        state.reactionGame.timeoutId = null;
        state.reactionGame.startTime = null;
        
                setReactionScreenState('waiting', 'Haz clic para comenzar', 'Cuando la pantalla se vuelva VERDE, haz clic lo más rápido que puedas.', 'fa-circle-play');
    }

    function handleReactionScreenClick() {
        const game = state.reactionGame;

        switch (game.currentState) {
            case 'waiting':
                game.currentState = 'countdown';
                setReactionScreenState('ready', '¡Prepárate...!', 'Espera al color verde. No hagas clic antes.', 'fa-bolt');
                
                const randomTime = 1500 + Math.random() * 2500;
                game.timeoutId = setTimeout(triggerGreenScreen, randomTime);
                break;

            case 'countdown':
                if (game.timeoutId) {
                    clearTimeout(game.timeoutId);
                }
                game.currentState = 'failed';
                setReactionScreenState('failed', '¡NO HAGAS PREDICT!', 'Juega limpio. Haz clic para volver a intentarlo.', 'fa-circle-exclamation');
                break;

            case 'green':
                const clickTime = performance.now();
                const reactionTime = Math.round(clickTime - game.startTime);

                // Anti-cheat & clock-safety check: Reaction time < 60ms is physically impossible
                // and indicates either a clock jitter, a bot, or a lucky "predict" click.
                if (reactionTime < 60) {
                    game.currentState = 'failed';
                    setReactionScreenState('failed', '¡NO HAGAS PREDICT!', 'Intento inválido por hacer predict. Haz clic para reintentar.', 'fa-circle-exclamation');
                    break;
                }

                game.currentState = 'result';
                
                state.stats.totalGames++;
                
                let isNewBest = false;
                if (state.stats.bestReaction === null || reactionTime < state.stats.bestReaction) {
                    state.stats.bestReaction = reactionTime;
                    isNewBest = true;
                }
                
                saveDataToStorage();
                
                game.sessionScores.unshift({
                    time: reactionTime,
                    isBest: isNewBest
                });
                
                if (game.sessionScores.length > 5) {
                    game.sessionScores.pop();
                }

                submitScoreToFirebase('reaction', reactionTime);

                const instructionText = `¡${reactionTime} ms!`;
                const tipText = isNewBest ? '🏆 ¡NUEVO RÉCORD PERSONAL! Haz clic para continuar.' : 'Buen intento. Haz clic para jugar otra vez.';
                setReactionScreenState('result', instructionText, tipText, 'fa-trophy');
                
                updateReactionScoreboard();
                updateDashboardUI();
                break;

            case 'result':
            case 'failed':
                resetReactionGame();
                break;
        }
    }

    function triggerGreenScreen() {
        const game = state.reactionGame;
        game.currentState = 'green';
        game.startTime = performance.now();
        setReactionScreenState('green', '¡HAZ CLIC YA!', '¡RÁPIDO!', 'fa-bolt-lightning');
    }

    function setReactionScreenState(stateName, instruction, tip, iconClass) {
        elReactionScreen.className = 'reaction-screen';
        elReactionScreen.classList.add(`state-${stateName}`);
        
        elReactionInstruction.textContent = instruction;
        elReactionTip.textContent = tip;
        
        elReactionIcon.className = `fa-solid ${iconClass} screen-icon`;
    }

    function updateReactionScoreboard() {
        elReactionScoresList.innerHTML = '';

        if (state.reactionGame.sessionScores.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'empty-list-msg';
            emptyMsg.textContent = 'Aún no has realizado intentos.';
            elReactionScoresList.appendChild(emptyMsg);
            return;
        }

        state.reactionGame.sessionScores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'score-row-item';
            
            const numLabel = document.createElement('span');
            numLabel.textContent = `Intento #${state.stats.totalGames - index}`;
            
            const valLabel = document.createElement('span');
            valLabel.className = 'score-badge';
            valLabel.textContent = `${score.time} ms`;

            if (score.isBest) {
                valLabel.classList.add('personal-best');
                valLabel.innerHTML = `<i class="fa-solid fa-crown"></i> ${score.time} ms`;
            }

            li.appendChild(numLabel);
            li.appendChild(valLabel);
            elReactionScoresList.appendChild(li);
        });
    }

    // --- Game Logic: Desenredar Nodos (Untangle) ---
    function initUntangleGame() {
        const game = state.untangleGame;
        
        generateUntangleLoop();
        elUntangleWinOverlay.classList.add('hidden');
                game.isSolved = false;
        game.isFailed = false;
        game.draggingNode = null;
        
        const intersections = checkUntangleIntersections();
        elUntangleIntersections.textContent = intersections;
        
        renderUntangle();

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
        }

        if (game.currentMode === 'facil') {
            elUntangleModeLabel.textContent = 'Fácil';
            elUntangleRoundsIndicator.classList.add('hidden');
            elUntangleRulesDesc.textContent = 'Mueve los 12 nodos para desenredar el anillo. Las cuerdas cruzadas se iluminan en rojo brillante.';
            
            game.startTime = performance.now();
            elUntangleTimer.textContent = '0.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    elUntangleTimer.textContent = `${elapsed.toFixed(1)}s`;
                }
            }, 100);
            
        } else if (game.currentMode === 'medio') {
            elUntangleModeLabel.textContent = 'Medio';
            elUntangleRoundsIndicator.classList.add('hidden');
            elUntangleRulesDesc.textContent = 'Mueve los 12 nodos para desenredar el anillo. Todas las líneas son de color oscuro constante, sin pista visual sobre cuáles se están cruzando.';
            
            game.startTime = performance.now();
            elUntangleTimer.textContent = '0.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    elUntangleTimer.textContent = `${elapsed.toFixed(1)}s`;
                }
            }, 100);
            
        } else if (game.currentMode === 'realista') {
            elUntangleModeLabel.textContent = 'Realista';
            elUntangleRoundsIndicator.classList.remove('hidden');
            elUntangleRoundVal.textContent = `${game.realisticRoundsCleared + 1}/3`;
            elUntangleRulesDesc.textContent = 'Modo Realista: Resuelve la red 3 veces consecutivas. Tienes un límite de 14 segundos para cada intento. Todas las líneas son oscuras y no se marcan cruces.';

            game.startTime = performance.now();
            elUntangleTimer.textContent = '14.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved && !game.isFailed) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    const timeLeft = Math.max(0, 14.0 - elapsed);
                    elUntangleTimer.textContent = `${timeLeft.toFixed(1)}s`;

                    if (timeLeft <= 0) {
                        triggerUntangleFailure();
                    }
                }
            }, 100);
        }
    }

    function generateUntangleLoop() {
        const game = state.untangleGame;
        const N = 12;
        const R = 150;
        const CX = 250;
        const CY = 250;
        
        const rawNodes = [];
        for (let i = 0; i < N; i++) {
            rawNodes.push({
                id: i,
                circleX: CX + R * Math.cos((2 * Math.PI * i) / N),
                circleY: CY + R * Math.sin((2 * Math.PI * i) / N),
                x: 0,
                y: 0
            });
        }
        
        const edges = [];
        for (let i = 0; i < N; i++) {
            edges.push({ from: i, to: (i + 1) % N, crossing: false });
        }
        
        for (let i = 0; i < N; i++) {
            let x, y, attempts = 0;
            let farEnough = false;
            while (!farEnough && attempts < 200) {
                x = 60 + Math.random() * 380;
                y = 60 + Math.random() * 380;
                farEnough = true;
                for (let j = 0; j < i; j++) {
                    const dist = Math.hypot(x - rawNodes[j].x, y - rawNodes[j].y);
                    if (dist < 60) {
                        farEnough = false;
                        break;
                    }
                }
                attempts++;
            }
            rawNodes[i].x = x;
            rawNodes[i].y = y;
        }

        game.nodes = rawNodes;
        game.edges = edges;
    }

    function ccw(A, B, C) {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }

    function checkSegmentsIntersect(A, B, C, D) {
        if (A.id === C.id || A.id === D.id || B.id === C.id || B.id === D.id) {
            return false;
        }
        return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
    }

    function checkUntangleIntersections() {
        const game = state.untangleGame;
        const nodes = game.nodes;
        const edges = game.edges;

        edges.forEach(e => e.crossing = false);

        let intersectionPairs = 0;
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                if (checkSegmentsIntersect(nodes[edges[i].from], nodes[edges[i].to], nodes[edges[j].from], nodes[edges[j].to])) {
                    edges[i].crossing = true;
                    edges[j].crossing = true;
                    intersectionPairs++;
                }
            }
        }

        return intersectionPairs;
    }

    function renderUntangle() {
        const game = state.untangleGame;
        const svg = elUntangleSvg;

        svg.innerHTML = '';

        const borderBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        borderBox.setAttribute('x', '16');
        borderBox.setAttribute('y', '16');
        borderBox.setAttribute('width', '468');
        borderBox.setAttribute('height', '468');
        borderBox.setAttribute('rx', '12');
        borderBox.setAttribute('ry', '12');
        borderBox.setAttribute('fill', 'none');
        borderBox.setAttribute('stroke', 'hsla(265, 85%, 66%, 0.15)');
        borderBox.setAttribute('stroke-width', '2');
        borderBox.setAttribute('stroke-dasharray', '6 6');
        svg.appendChild(borderBox);

        game.edges.forEach((edge, index) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const fromNode = game.nodes[edge.from];
            const toNode = game.nodes[edge.to];

            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.setAttribute('id', `edge-${index}`);

            if (game.isSolved && !game.isFailed) {
                line.className.baseVal = 'edge edge-solved';
            } else if (game.currentMode === 'facil' && edge.crossing) {
                line.className.baseVal = 'edge edge-crossing';
            } else {
                if (game.currentMode === 'facil') {
                    line.className.baseVal = 'edge edge-clear';
                } else {
                    line.className.baseVal = 'edge edge-neutral';
                }
            }

            svg.appendChild(line);
        });

        game.nodes.forEach(node => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '14');
            circle.setAttribute('class', 'node');
            circle.setAttribute('data-id', node.id);

            if (game.draggingNode && game.draggingNode.id === node.id) {
                circle.classList.add('dragging');
            }

            svg.appendChild(circle);
        });
    }

    function getSvgCoordinates(event, svgElement) {
        const point = svgElement.createSVGPoint();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        point.x = clientX;
        point.y = clientY;

        const svgPoint = point.matrixTransform(svgElement.getScreenCTM().inverse());

        return {
            x: svgPoint.x,
            y: svgPoint.y
        };
    }

    function setupUntangleListeners() {
        const svg = elUntangleSvg;
        const game = state.untangleGame;

        function startDrag(e) {
            if (game.isSolved || game.isFailed) return;

            const target = e.target;
            if (target && target.tagName === 'circle') {
                const nodeId = parseInt(target.getAttribute('data-id'), 10);
                game.draggingNode = game.nodes.find(n => n.id === nodeId);
                
                target.classList.add('dragging');
                
                const coords = getSvgCoordinates(e, svg);
                game.dragOffset = {
                    x: game.draggingNode.x - coords.x,
                    y: game.draggingNode.y - coords.y
                };

                if (e.cancelable) e.preventDefault();
            }
        }

        function drag(e) {
            if (!game.draggingNode || game.isSolved || game.isFailed) return;

            const coords = getSvgCoordinates(e, svg);
            
            let targetX = coords.x + game.dragOffset.x;
            let targetY = coords.y + game.dragOffset.y;
            
            for (let step = 0; step < 2; step++) {
                game.nodes.forEach(otherNode => {
                    if (otherNode.id === game.draggingNode.id) return;
                    
                    const dx = targetX - otherNode.x;
                    const dy = targetY - otherNode.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = 32;
                    
                    if (dist < minDist) {
                        if (dist > 0) {
                            targetX = otherNode.x + (dx / dist) * minDist;
                            targetY = otherNode.y + (dy / dist) * minDist;
                        } else {
                            targetX += minDist;
                        }
                    }
                });
            }
            
            targetX = Math.max(30, Math.min(470, targetX));
            targetY = Math.max(30, Math.min(470, targetY));

            game.draggingNode.x = targetX;
            game.draggingNode.y = targetY;

            const circle = svg.querySelector(`circle[data-id="${game.draggingNode.id}"]`);
            if (circle) {
                circle.setAttribute('cx', targetX);
                circle.setAttribute('cy', targetY);
            }

            const intersections = checkUntangleIntersections();
            elUntangleIntersections.textContent = intersections;

            game.edges.forEach((edge, index) => {
                const line = svg.getElementById(`edge-${index}`);
                if (line) {
                    const fromNode = game.nodes[edge.from];
                    const toNode = game.nodes[edge.to];

                    line.setAttribute('x1', fromNode.x);
                    line.setAttribute('y1', fromNode.y);
                    line.setAttribute('x2', toNode.x);
                    line.setAttribute('y2', toNode.y);

                    if (game.currentMode === 'facil' && edge.crossing) {
                        line.className.baseVal = 'edge edge-crossing';
                    } else {
                        if (game.currentMode === 'facil') {
                            line.className.baseVal = 'edge edge-clear';
                        } else {
                            line.className.baseVal = 'edge edge-neutral';
                        }
                    }
                }
            });

            if (e.cancelable) e.preventDefault();
        }

        function endDrag(e) {
            if (!game.draggingNode) return;

            const circle = svg.querySelector(`circle[data-id="${game.draggingNode.id}"]`);
            if (circle) {
                circle.classList.remove('dragging');
            }

            game.draggingNode = null;

            const intersections = checkUntangleIntersections();
            if (intersections === 0 && !game.isSolved && !game.isFailed) {
                triggerUntangleWin();
            } else {
                renderUntangle();
            }
        }

        svg.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);

        svg.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', drag, { passive: false });
        window.addEventListener('touchend', endDrag);
    }

    function triggerUntangleWin() {
        const game = state.untangleGame;
        game.isSolved = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        const elapsed = (performance.now() - game.startTime) / 1000;
        renderUntangle();

        if (game.currentMode === 'facil') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestUntangleFacil === null || elapsed < state.stats.bestUntangleFacil) {
                state.stats.bestUntangleFacil = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Modo Fácil Completado!',
                `Has desenredado los 12 nodos en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('untangle_facil', elapsed); (Practice mode)
            elUntangleWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'medio') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestUntangleMedio === null || elapsed < state.stats.bestUntangleMedio) {
                state.stats.bestUntangleMedio = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Modo Medio Completado!',
                `¡Excelente vista! Desenredaste la red a ciegas en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('untangle_medio', elapsed); (Practice mode)
            elUntangleWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'realista') {
            game.realisticTimes.push(elapsed);
            game.realisticRoundsCleared++;

            if (game.realisticRoundsCleared < 3) {
                setWinOverlayContent(
                    'fa-circle-check',
                    'text-green',
                    `¡Ronda ${game.realisticRoundsCleared}/3 Completada!`,
                    `Has superado este intento en ${elapsed.toFixed(1)}s. Prepárate para el siguiente.`,
                    `Siguiente Ronda ${game.realisticRoundsCleared + 1}/3 <i class="fa-solid fa-chevron-right"></i>`
                );
                
                elUntangleNextBtn.onclick = () => {
                    initUntangleGame();
                };
                elUntangleWinOverlay.classList.remove('hidden');
                
            } else {
                state.stats.totalGames++;
                const totalAccumulatedTime = game.realisticTimes.reduce((a, b) => a + b, 0);
                
                let isNewBest = false;
                if (state.stats.bestUntangleRealista === null || totalAccumulatedTime < state.stats.bestUntangleRealista) {
                    state.stats.bestUntangleRealista = totalAccumulatedTime;
                    isNewBest = true;
                }
                
                saveDataToStorage();
                updateDashboardUI();

                setWinOverlayContent(
                    'fa-trophy',
                    'text-green',
                    '¡Desafío Realista Superado!',
                    `¡Increíble! Completaste las 3 rondas seguidas con éxito. Tiempo total: ${totalAccumulatedTime.toFixed(1)}s.`,
                    'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
                );

                submitScoreToFirebase('untangle_realista', totalAccumulatedTime);
                
                game.realisticRoundsCleared = 0;
                game.realisticTimes = [];
                
                elUntangleNextBtn.onclick = () => {
                    initUntangleGame();
                };
                elUntangleWinOverlay.classList.remove('hidden');
            }
        }
    }

    function triggerUntangleFailure() {
        const game = state.untangleGame;
        game.isFailed = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        renderUntangle();

        state.stats.totalGames++;
        saveDataToStorage();
        updateDashboardUI();

        setWinOverlayContent(
            'fa-circle-xmark',
            'text-red',
            '¡Tiempo Agotado!',
            `No lograste desenredar el anillo a tiempo en la ronda ${game.realisticRoundsCleared + 1}/3.`,
            'Reintentar Desafío <i class="fa-solid fa-rotate-left"></i>'
        );
        
        game.realisticRoundsCleared = 0;
        game.realisticTimes = [];
        elUntangleNextBtn.onclick = () => {
            initUntangleGame();
        };

        elUntangleWinOverlay.classList.remove('hidden');
    }

    function setWinOverlayContent(iconClass, colorClass, title, text, btnHtml) {
        const winCard = elUntangleWinOverlay.querySelector('.win-card');
        winCard.querySelector('.win-icon').className = `fa-solid ${iconClass} win-icon ${colorClass}`;
        winCard.querySelector('h3').textContent = title;
        winCard.querySelector('p').textContent = text;
        elUntangleNextBtn.innerHTML = btnHtml;
    }

    function updateModeButtonsUI() {
        elModeFacilBtn.classList.remove('active');
        elModeMedioBtn.classList.remove('active');
        elModeRealistaBtn.classList.remove('active');

        if (state.untangleGame.currentMode === 'facil') {
            elModeFacilBtn.classList.add('active');
        } else if (state.untangleGame.currentMode === 'medio') {
            elModeMedioBtn.classList.add('active');
        } else if (state.untangleGame.currentMode === 'realista') {
            elModeRealistaBtn.classList.add('active');
        }
    }

    // --- Game Logic: Pirateo de Huella (PrintLock) ---
    function initPrintLockGame() {
        const game = state.printlockGame;
        const isRealista = game.currentMode === 'realista';
        const numRows = isRealista ? 8 : 4;
        
        elPrintLockScannerBox.className = `printlock-scanner-box rows-${numRows}`;
        
        game.targetPrint = Math.floor(Math.random() * 4);
        game.lockedSlice = Math.floor(Math.random() * numRows);
        
        game.optionsMapping = [];
        game.selectedSlices = [];
        
        for (let i = 0; i < numRows; i++) {
            const mapping = [0, 1, 2, 3];
            for (let j = mapping.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [mapping[j], mapping[k]] = [mapping[k], mapping[j]];
            }
            game.optionsMapping.push(mapping);
            
            if (i === game.lockedSlice) {
                const correctOptionIdx = mapping.indexOf(game.targetPrint);
                game.selectedSlices.push(correctOptionIdx);
            } else {
                let randomOpt;
                do {
                    randomOpt = Math.floor(Math.random() * 4);
                } while (mapping[randomOpt] === game.targetPrint);
                game.selectedSlices.push(randomOpt);
            }
        }
        
        game.isSolved = false;
        game.isFailed = false;
        elPrintLockWinOverlay.classList.add('hidden');
                
        renderPrintLockControls();

        if (game.currentMode === 'facil') {
            elPrintLockRoundsIndicator.classList.add('hidden');
            elPrintLockRulesDesc.innerHTML = 'Modo Fácil: 4 franjas. Las secciones que coinciden con la huella objetivo se iluminan en <strong>verde neón</strong>.';
        } else if (game.currentMode === 'medio') {
            elPrintLockRoundsIndicator.classList.add('hidden');
            elPrintLockRulesDesc.innerHTML = 'Modo Medio: 4 franjas. Todas las secciones se muestran en blanco/celeste constante. Guíate puramente por el alineamiento de las curvas.';
        } else if (game.currentMode === 'realista') {
            elPrintLockRoundsIndicator.classList.remove('hidden');
            elPrintLockRoundVal.textContent = `${game.realisticRoundsCleared + 1}/3`;
            elPrintLockRulesDesc.innerHTML = 'Modo Realista: 8 franjas de Cayo Perico. Debes piratear 3 terminales seguidas. Límite de 14 segundos por intento.';
        }

        elPrintLockStatusLabel.textContent = 'SISTEMA BLOQUEADO';
        elPrintLockStatusLabel.className = 'text-red';
        elPrintLockStatusIcon.className = 'fa-solid fa-shield-halved text-red';

        drawPrintLockCanvas();

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
        }

        if (game.currentMode !== 'realista') {
            game.startTime = performance.now();
            elPrintLockTimer.textContent = '0.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    elPrintLockTimer.textContent = `${elapsed.toFixed(1)}s`;
                }
            }, 100);
        } else {
            game.startTime = performance.now();
            elPrintLockTimer.textContent = '14.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved && !game.isFailed) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    const timeLeft = Math.max(0, 14.0 - elapsed);
                    elPrintLockTimer.textContent = `${timeLeft.toFixed(1)}s`;

                    if (timeLeft <= 0) {
                        triggerPrintLockFailure();
                    }
                }
            }, 100);
        }
    }

    function renderPrintLockControls() {
        const game = state.printlockGame;
        const leftPanel = document.querySelector('.printlock-ctrl-panel.left');
        const rightPanel = document.querySelector('.printlock-ctrl-panel.right');
        
        leftPanel.innerHTML = '';
        rightPanel.innerHTML = '';
        
        const numRows = game.currentMode === 'realista' ? 8 : 4;
        
        for (let i = 0; i < numRows; i++) {
            const btnLeft = document.createElement('button');
            btnLeft.setAttribute('data-row', i);
            btnLeft.id = `printlock-btn-left-${i}`;
            btnLeft.setAttribute('aria-label', `Fila ${i + 1} Anterior`);
            
            const btnRight = document.createElement('button');
            btnRight.setAttribute('data-row', i);
            btnRight.id = `printlock-btn-right-${i}`;
            btnRight.setAttribute('aria-label', `Fila ${i + 1} Siguiente`);
            
            if (i === game.lockedSlice) {
                btnLeft.className = 'printlock-block-btn prev locked-white';
                btnRight.className = 'printlock-block-btn next locked-white';
                btnLeft.disabled = true;
                btnRight.disabled = true;
            } else {
                btnLeft.className = 'printlock-block-btn prev active-blue';
                btnRight.className = 'printlock-block-btn next active-blue';
                
                btnLeft.addEventListener('click', () => cyclePrintSlice(i, false));
                btnRight.addEventListener('click', () => cyclePrintSlice(i, true));
            }
            
            leftPanel.appendChild(btnLeft);
            rightPanel.appendChild(btnRight);
        }
    }

    function cyclePrintSlice(row, isNext) {
        const game = state.printlockGame;
        if (game.isSolved || game.isFailed || row === game.lockedSlice) return;

        if (isNext) {
            game.selectedSlices[row] = (game.selectedSlices[row] + 1) % 4;
        } else {
            game.selectedSlices[row] = (game.selectedSlices[row] - 1 + 4) % 4;
        }

        drawPrintLockCanvas();

        const allCorrect = game.selectedSlices.every((optIdx, rowIdx) => {
            const chosenPrintIdx = game.optionsMapping[rowIdx][optIdx];
            return chosenPrintIdx === game.targetPrint;
        });

        if (allCorrect) {
            triggerPrintLockWin();
        }
    }

    function drawPrintLockCanvas() {
        const game = state.printlockGame;
        const canvas = elPrintLockCanvas;
        const ctx = canvas.getContext('2d');
        const numRows = game.currentMode === 'realista' ? 8 : 4;
        const sliceHeight = 400 / numRows;

        ctx.clearRect(0, 0, 400, 400);

        for (let i = 0; i < numRows; i++) {
            const chosenPrintIdx = game.optionsMapping[i][game.selectedSlices[i]];
            drawFingerprintSlice(ctx, game.targetPrint, chosenPrintIdx, i, numRows, sliceHeight);
        }
    }

    function drawFingerprintSlice(ctx, targetPrintIndex, chosenPrintIndex, sliceIndex, numRows, sliceHeight) {
        ctx.save();
        
        ctx.beginPath();
        ctx.rect(0, sliceIndex * sliceHeight, 400, sliceHeight);
        ctx.clip();
        
        const template = fingerprintTemplates[chosenPrintIndex];
        
        const isCorrect = (chosenPrintIndex === targetPrintIndex);
        if (state.printlockGame.currentMode === 'facil' && isCorrect) {
            ctx.strokeStyle = 'hsl(145, 85%, 60%)'; 
            ctx.shadowColor = 'rgba(0, 255, 128, 0.6)';
        } else {
            ctx.strokeStyle = '#f8fafc'; 
            ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
        }
        
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        
        template.forEach(ring => {
            ring.arcs.forEach(arcRange => {
                ctx.beginPath();
                ctx.arc(200, 200, ring.r, arcRange[0] * Math.PI, arcRange[1] * Math.PI);
                ctx.stroke();
            });
        });
        
        ctx.beginPath();
        ctx.arc(200, 200, 28, 0, 2 * Math.PI);
        ctx.fillStyle = '#7b8de6';
        ctx.shadowColor = 'rgba(123, 141, 230, 0.7)';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.restore();
    }

    function triggerPrintLockWin() {
        const game = state.printlockGame;
        game.isSolved = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        const elapsed = (performance.now() - game.startTime) / 1000;
        drawPrintLockCanvas();

        elPrintLockStatusLabel.textContent = 'ACCESO PERMITIDO';
        elPrintLockStatusLabel.className = 'text-green';
        elPrintLockStatusIcon.className = 'fa-solid fa-shield-halved text-green';

        if (game.currentMode === 'facil') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestPrintLockFacil === null || elapsed < state.stats.bestPrintLockFacil) {
                state.stats.bestPrintLockFacil = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setPrintLockWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Firma Obtenida: Fácil!',
                `Acceso desbloqueado en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('printlock_facil', elapsed); (Practice mode)
            elPrintLockWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'medio') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestPrintLockMedio === null || elapsed < state.stats.bestPrintLockMedio) {
                state.stats.bestPrintLockMedio = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setPrintLockWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Firma Obtenida: Medio!',
                `¡Excelente vista! Red hackeada a ciegas en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('printlock_medio', elapsed); (Practice mode)
            elPrintLockWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'realista') {
            game.realisticTimes.push(elapsed);
            game.realisticRoundsCleared++;

            if (game.realisticRoundsCleared < 3) {
                setPrintLockWinOverlayContent(
                    'fa-circle-check',
                    'text-green',
                    `¡Intento ${game.realisticRoundsCleared}/3 Completado!`,
                    `Firma parcial obtenida en ${elapsed.toFixed(1)}s. Prepárate para el siguiente.`,
                    `Siguiente Hack ${game.realisticRoundsCleared + 1}/3 <i class="fa-solid fa-chevron-right"></i>`
                );
                
                elPrintLockNextBtn.onclick = () => {
                    initPrintLockGame();
                };
                elPrintLockWinOverlay.classList.remove('hidden');
                
            } else {
                state.stats.totalGames++;
                const totalAccumulatedTime = game.realisticTimes.reduce((a, b) => a + b, 0);
                
                let isNewBest = false;
                if (state.stats.bestPrintLockRealista === null || totalAccumulatedTime < state.stats.bestPrintLockRealista) {
                    state.stats.bestPrintLockRealista = totalAccumulatedTime;
                    isNewBest = true;
                }
                
                saveDataToStorage();
                updateDashboardUI();

                setPrintLockWinOverlayContent(
                    'fa-trophy',
                    'text-green',
                    '¡Pirateo Realista Completado!',
                    `¡Pirata experto! Has superado las 3 terminales consecutivas en ${totalAccumulatedTime.toFixed(1)}s.`,
                    'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
                );

                submitScoreToFirebase('printlock_realista', totalAccumulatedTime);
                
                game.realisticRoundsCleared = 0;
                game.realisticTimes = [];
                
                elPrintLockNextBtn.onclick = () => {
                    initPrintLockGame();
                };
                elPrintLockWinOverlay.classList.remove('hidden');
            }
        }
    }

    function triggerPrintLockFailure() {
        const game = state.printlockGame;
        game.isFailed = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        drawPrintLockCanvas();

        state.stats.totalGames++;
        saveDataToStorage();
        updateDashboardUI();

        setPrintLockWinOverlayContent(
            'fa-circle-xmark',
            'text-red',
            '¡Tiempo Agotado!',
            `Se agotaron los 14 segundos en el intento ${game.realisticRoundsCleared + 1}/3.`,
            'Reintentar Hacking <i class="fa-solid fa-rotate-left"></i>'
        );
        
        game.realisticRoundsCleared = 0;
        game.realisticTimes = [];
        elPrintLockNextBtn.onclick = () => {
            initPrintLockGame();
        };

        elPrintLockWinOverlay.classList.remove('hidden');
    }

    function setPrintLockWinOverlayContent(iconClass, colorClass, title, text, btnHtml) {
        const winCard = elPrintLockWinOverlay.querySelector('.win-card');
        winCard.querySelector('.win-icon').className = `fa-solid ${iconClass} win-icon ${colorClass}`;
        winCard.querySelector('h3').textContent = title;
        winCard.querySelector('p').textContent = text;
        elPrintLockNextBtn.innerHTML = btnHtml;
    }

    function updatePrintLockModeButtonsUI() {
        elPrintLockModeFacilBtn.classList.remove('active');
        elPrintLockModeMedioBtn.classList.remove('active');
        elPrintLockModeRealistaBtn.classList.remove('active');

        if (state.printlockGame.currentMode === 'facil') {
            elPrintLockModeFacilBtn.classList.add('active');
        } else if (state.printlockGame.currentMode === 'medio') {
            elPrintLockModeMedioBtn.classList.add('active');
        } else if (state.printlockGame.currentMode === 'realista') {
            elPrintLockModeRealistaBtn.classList.add('active');
        }
    }

    // --- Game Logic: Conectar Puntos (PathFind) ---
    function initPathFindGame() {
        const game = state.pathfindGame;
        const numNodes = game.currentMode === 'realista' ? 12 : (game.currentMode === 'medio' ? 8 : 6);

        // 1. Generate non-overlapping node positions inside SVG bounds [30, 470]
        generatePathFindNodes(numNodes);
        
        // 2. Select starting node index randomly
        const startNodeIdx = Math.floor(Math.random() * numNodes);
        game.connectedPath = [startNodeIdx];
        
        // Reset states
        game.isSolved = false;
        game.isFailed = false;
        elPathFindWinOverlay.classList.add('hidden');
        
        // Set difficulty parameters
        if (game.currentMode === 'facil') {
            elPathFindModeLabel.textContent = 'Fácil';
            elPathFindRoundsIndicator.classList.add('hidden');
            elPathFindRulesDesc.textContent = 'Modo Fácil: Conecta 6 nodos. El nodo más cercano se resalta con un resplandor púrpura de guía.';
        } else if (game.currentMode === 'medio') {
            elPathFindModeLabel.textContent = 'Medio';
            elPathFindRoundsIndicator.classList.add('hidden');
            elPathFindRulesDesc.textContent = 'Modo Medio: Conecta 8 nodos. Sin guías. Tienes un límite de 14 segundos para resolver la ruta.';
        } else if (game.currentMode === 'realista') {
            elPathFindModeLabel.textContent = 'Realista';
            elPathFindRoundsIndicator.classList.remove('hidden');
            elPathFindRoundVal.textContent = `${game.realisticRoundsCleared + 1}/3`;
            elPathFindRulesDesc.textContent = 'Modo Realista: Conecta 12 nodos. Resuelve la secuencia 3 veces seguidas. Límite de 14 segundos por ronda.';
        }

        // Draw initial state
        drawPathFind();
        updatePathFindProgress();

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
        }

        if (game.currentMode === 'facil') {
            // Count up timer
            game.startTime = performance.now();
            elPathFindTimer.textContent = '0.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    elPathFindTimer.textContent = `${elapsed.toFixed(1)}s`;
                }
            }, 100);
        } else {
            // Count down timer from 14.0s (For Medio and Realista)
            game.startTime = performance.now();
            elPathFindTimer.textContent = '14.0s';
            game.timerIntervalId = setInterval(() => {
                if (!game.isSolved && !game.isFailed) {
                    const elapsed = (performance.now() - game.startTime) / 1000;
                    const timeLeft = Math.max(0, 14.0 - elapsed);
                    elPathFindTimer.textContent = `${timeLeft.toFixed(1)}s`;

                    if (timeLeft <= 0) {
                        triggerPathFindFailure();
                    }
                }
            }, 100);
        }
    }

    function generatePathFindNodes(numNodes) {
        const game = state.pathfindGame;
        const nodes = [];
        
        for (let i = 0; i < numNodes; i++) {
            let x, y, attempts = 0;
            let valid = false;

            while (!valid && attempts < 200) {
                // Nodes coordinates boundaries
                x = 40 + Math.random() * 420;
                y = 40 + Math.random() * 380; // slightly lower height margin for progress bar
                valid = true;

                // Check distance against previous nodes to guarantee space (at least 75px)
                for (let j = 0; j < nodes.length; j++) {
                    const dist = Math.hypot(x - nodes[j].x, y - nodes[j].y);
                    if (dist < 75) {
                        valid = false;
                        break;
                    }
                }
                attempts++;
            }

            nodes.push({ id: i, x: x, y: y });
        }

        game.nodes = nodes;
    }

    function findClosestUnselectedNode() {
        const game = state.pathfindGame;
        if (game.connectedPath.length === 0 || game.connectedPath.length === game.nodes.length) {
            return null;
        }

        const lastNodeIdx = game.connectedPath[game.connectedPath.length - 1];
        const lastNode = game.nodes[lastNodeIdx];
        
        let closestNode = null;
        let minDist = Infinity;

        game.nodes.forEach(node => {
            if (game.connectedPath.includes(node.id)) return;
            
            const dist = Math.hypot(lastNode.x - node.x, lastNode.y - node.y);
            if (dist < minDist) {
                minDist = dist;
                closestNode = node;
            }
        });

        return closestNode;
    }

    function drawPathFind() {
        const game = state.pathfindGame;
        const svg = elPathFindSvg;

        svg.innerHTML = '';

        // Dotted neon border
        const borderBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        borderBox.setAttribute('x', '16');
        borderBox.setAttribute('y', '16');
        borderBox.setAttribute('width', '468');
        borderBox.setAttribute('height', '468');
        borderBox.setAttribute('rx', '12');
        borderBox.setAttribute('ry', '12');
        borderBox.setAttribute('fill', 'none');
        borderBox.setAttribute('stroke', 'hsla(265, 85%, 66%, 0.15)');
        borderBox.setAttribute('stroke-width', '2');
        borderBox.setAttribute('stroke-dasharray', '6 6');
        svg.appendChild(borderBox);

        // 1. Draw connecting lines (edges) between selected nodes
        for (let i = 0; i < game.connectedPath.length - 1; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const n1 = game.nodes[game.connectedPath[i]];
            const n2 = game.nodes[game.connectedPath[i + 1]];

            line.setAttribute('x1', n1.x);
            line.setAttribute('y1', n1.y);
            line.setAttribute('x2', n2.x);
            line.setAttribute('y2', n2.y);
            line.setAttribute('class', 'pathfind-edge');

            svg.appendChild(line);
        }

        // Find the mathematically correct next node
        const correctNext = findClosestUnselectedNode();

        // 2. Draw dots (nodes)
        game.nodes.forEach(node => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '12');
            
            // Add click listener
            circle.addEventListener('click', () => clickPathFindNode(node.id));

            // Visual Classes
            const isLast = game.connectedPath[game.connectedPath.length - 1] === node.id;
            const isConnected = game.connectedPath.includes(node.id);

            if (isLast) {
                circle.setAttribute('class', 'pathfind-node active-purple');
            } else if (isConnected) {
                circle.setAttribute('class', 'pathfind-node connected');
            } else if (game.currentMode === 'facil' && correctNext && correctNext.id === node.id) {
                circle.setAttribute('class', 'pathfind-node correct-hint');
            } else {
                circle.setAttribute('class', 'pathfind-node');
            }

            svg.appendChild(circle);
        });
    }

    function clickPathFindNode(nodeId) {
        const game = state.pathfindGame;
        if (game.isSolved || game.isFailed) return;

        // Ignore if already connected in the path
        if (game.connectedPath.includes(nodeId)) return;

        const correctNext = findClosestUnselectedNode();

        if (correctNext && nodeId === correctNext.id) {
            // Correct Node clicked!
            game.connectedPath.push(nodeId);
            updatePathFindProgress();

            if (game.connectedPath.length === game.nodes.length) {
                triggerPathFindWin();
            } else {
                drawPathFind();
            }
        } else {
            // Incorrect Node clicked! Trigger Penalty & Reset
            triggerPathFindError();
        }
    }

    function triggerPathFindError() {
        const game = state.pathfindGame;

        // Apply 2 seconds penalty to the start time (moves elapsed forward)
        game.startTime -= 2000;

        // Reset path back to first starting node
        game.connectedPath = [game.connectedPath[0]];
        updatePathFindProgress();

        // Shake screen layout
        elPathFindCanvasContainer.classList.add('screen-error');
        setTimeout(() => {
            elPathFindCanvasContainer.classList.remove('screen-error');
        }, 400000 / 1000); // 400ms

        // Redraw
        drawPathFind();
    }

    function updatePathFindProgress() {
        const game = state.pathfindGame;
        const percentage = (game.connectedPath.length / game.nodes.length) * 100;
        elPathFindProgressBar.style.width = `${percentage}%`;
    }

    function triggerPathFindWin() {
        const game = state.pathfindGame;
        game.isSolved = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        const elapsed = (performance.now() - game.startTime) / 1000;
        drawPathFind();

        if (game.currentMode === 'facil') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestPathFindFacil === null || elapsed < state.stats.bestPathFindFacil) {
                state.stats.bestPathFindFacil = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setPathFindWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Camino Fácil Completado!',
                `Has conectado los 8 nodos en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('pathfind_facil', elapsed); (Practice mode)
            elPathFindWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'medio') {
            state.stats.totalGames++;
            
            let isNewBest = false;
            if (state.stats.bestPathFindMedio === null || elapsed < state.stats.bestPathFindMedio) {
                state.stats.bestPathFindMedio = elapsed;
                isNewBest = true;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            
            setPathFindWinOverlayContent(
                'fa-circle-check',
                'text-green',
                '¡Camino Medio Completado!',
                `¡Excelente percepción! Has conectado los 8 nodos en ${elapsed.toFixed(1)} segundos.`,
                'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
            );

            // if (isNewBest) submitScoreToFirebase('pathfind_medio', elapsed); (Practice mode)
            elPathFindWinOverlay.classList.remove('hidden');

        } else if (game.currentMode === 'realista') {
            game.realisticTimes.push(elapsed);
            game.realisticRoundsCleared++;

            if (game.realisticRoundsCleared < 3) {
                // Instant round transition: as soon as you finish one the next starts!
                initPathFindGame();
                return;
            } else {
                state.stats.totalGames++;
                const totalAccumulatedTime = game.realisticTimes.reduce((a, b) => a + b, 0);
                
                let isNewBest = false;
                if (state.stats.bestPathFindRealista === null || totalAccumulatedTime < state.stats.bestPathFindRealista) {
                    state.stats.bestPathFindRealista = totalAccumulatedTime;
                    isNewBest = true;
                }
                
                saveDataToStorage();
                updateDashboardUI();

                setPathFindWinOverlayContent(
                    'fa-trophy',
                    'text-green',
                    '¡Desafío Realista Superado!',
                    `¡Increíble rapidez! Completaste los 3 mapas en ${totalAccumulatedTime.toFixed(1)}s.`,
                    'Jugar de Nuevo <i class="fa-solid fa-rotate"></i>'
                );

                submitScoreToFirebase('pathfind_realista', totalAccumulatedTime);
                
                game.realisticRoundsCleared = 0;
                game.realisticTimes = [];
                
                elPathFindNextBtn.onclick = () => {
                    initPathFindGame();
                };
                elPathFindWinOverlay.classList.remove('hidden');
            }
        }
    }

    function triggerPathFindFailure() {
        const game = state.pathfindGame;
        game.isFailed = true;

        if (game.timerIntervalId) {
            clearInterval(game.timerIntervalId);
            game.timerIntervalId = null;
        }

        drawPathFind();

        state.stats.totalGames++;
        saveDataToStorage();
        updateDashboardUI();

        setPathFindWinOverlayContent(
            'fa-circle-xmark',
            'text-red',
            '¡Tiempo Agotado!',
            `Se agotó el tiempo en la ronda ${game.realisticRoundsCleared + 1}/3.`,
            'Reintentar Conexión <i class="fa-solid fa-rotate-left"></i>'
        );
        
        game.realisticRoundsCleared = 0;
        game.realisticTimes = [];
        elPathFindNextBtn.onclick = () => {
            initPathFindGame();
        };

        elPathFindWinOverlay.classList.remove('hidden');
    }

    function setPathFindWinOverlayContent(iconClass, colorClass, title, text, btnHtml) {
        const winCard = elPathFindWinOverlay.querySelector('.win-card');
        winCard.querySelector('.win-icon').className = `fa-solid ${iconClass} win-icon ${colorClass}`;
        winCard.querySelector('h3').textContent = title;
        winCard.querySelector('p').textContent = text;
        elPathFindNextBtn.innerHTML = btnHtml;
    }

    function updatePathFindModeButtonsUI() {
        elPathFindModeFacilBtn.classList.remove('active');
        elPathFindModeMedioBtn.classList.remove('active');
        elPathFindModeRealistaBtn.classList.remove('active');

        if (state.pathfindGame.currentMode === 'facil') {
            elPathFindModeFacilBtn.classList.add('active');
        } else if (state.pathfindGame.currentMode === 'medio') {
            elPathFindModeMedioBtn.classList.add('active');
        } else if (state.pathfindGame.currentMode === 'realista') {
            elPathFindModeRealistaBtn.classList.add('active');
        }
    }


    // --- Suggestions Form ---
    function handleSuggestionSubmit(event) {
        event.preventDefault();
        const suggestion = elSuggestInput.value.trim();
        if (suggestion) {
            let savedSuggestions = [];
            const rawSuggestions = localStorage.getItem('arcade_suggestions');
            if (rawSuggestions) {
                try {
                    savedSuggestions = JSON.parse(rawSuggestions);
                } catch(e) {
                    console.error("Error reading saved suggestions", e);
                }
            }

            savedSuggestions.push({
                text: suggestion,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('arcade_suggestions', JSON.stringify(savedSuggestions));
            
            elSuggestInput.value = '';
            elSuggestFeedback.classList.remove('hidden');
            setTimeout(() => {
                elSuggestFeedback.classList.add('hidden');
            }, 3000);
        }
    }

    // --- Reset Stats ---
    function resetPlayerStats() {
        if (confirm('¿Estás seguro de que deseas borrar todas tus estadísticas y puntuaciones? Esto no afectará a tu nombre.')) {
            state.stats.totalGames = 0;
            state.stats.bestReaction = null;
            state.stats.bestUntangleFacil = null;
            state.stats.bestUntangleMedio = null;
            state.stats.bestUntangleRealista = null;
            state.stats.bestPrintLockFacil = null;
            state.stats.bestPrintLockMedio = null;
            state.stats.bestPrintLockRealista = null;
            state.stats.bestPathFindFacil = null;
            state.stats.bestPathFindMedio = null;
            state.stats.bestPathFindRealista = null;
            
            state.reactionGame.sessionScores = [];
            
            state.untangleGame.realisticRoundsCleared = 0;
            state.untangleGame.realisticTimes = [];

            state.printlockGame.realisticRoundsCleared = 0;
            state.printlockGame.realisticTimes = [];

            state.pathfindGame.realisticRoundsCleared = 0;
            state.pathfindGame.realisticTimes = [];

            if (state.untangleGame.timerIntervalId) {
                clearInterval(state.untangleGame.timerIntervalId);
                state.untangleGame.timerIntervalId = null;
            }
            if (state.printlockGame.timerIntervalId) {
                clearInterval(state.printlockGame.timerIntervalId);
                state.printlockGame.timerIntervalId = null;
            }
            if (state.pathfindGame.timerIntervalId) {
                clearInterval(state.pathfindGame.timerIntervalId);
                state.pathfindGame.timerIntervalId = null;
            }
            
            saveDataToStorage();
            updateDashboardUI();
            updateReactionScoreboard();
            
            if (elGameUntangleView.classList.contains('active-view')) {
                initUntangleGame();
            } else if (elGamePrintLockView.classList.contains('active-view')) {
                initPrintLockGame();
            } else if (elGamePathFindView.classList.contains('active-view')) {
                initPathFindGame();
            }
        }
    }

    // --- Setup Listeners ---
    function setupEventListeners() {
        // Onboarding Save
        elWelcomeSaveBtn.addEventListener('click', saveWelcomeName);
        elWelcomeNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveWelcomeName();
        });

        // Navigation clicks
        elPlayReactionBtn?.addEventListener('click', () => switchView('reaction'));
        elBackToHubBtn.addEventListener('click', () => switchView('home'));
        
        elBackUntangleToHubBtn.addEventListener('click', () => switchView('home'));
        elBackPrintLockToHubBtn.addEventListener('click', () => switchView('home'));
        elBackPathFindToHubBtn.addEventListener('click', () => switchView('home'));
        
        // Mode clicks (Untangle)
        elModeFacilBtn.addEventListener('click', () => {
            state.untangleGame.currentMode = 'facil';
            updateModeButtonsUI();
            initUntangleGame();
        });
        elModeMedioBtn.addEventListener('click', () => {
            state.untangleGame.currentMode = 'medio';
            updateModeButtonsUI();
            initUntangleGame();
        });
        elModeRealistaBtn.addEventListener('click', () => {
            state.untangleGame.currentMode = 'realista';
            state.untangleGame.realisticRoundsCleared = 0;
            state.untangleGame.realisticTimes = [];
            updateModeButtonsUI();
            initUntangleGame();
        });

        // Mode clicks (PrintLock)
        elPrintLockModeFacilBtn.addEventListener('click', () => {
            state.printlockGame.currentMode = 'facil';
            updatePrintLockModeButtonsUI();
            initPrintLockGame();
        });
        elPrintLockModeMedioBtn.addEventListener('click', () => {
            state.printlockGame.currentMode = 'medio';
            updatePrintLockModeButtonsUI();
            initPrintLockGame();
        });
        elPrintLockModeRealistaBtn.addEventListener('click', () => {
            state.printlockGame.currentMode = 'realista';
            state.printlockGame.realisticRoundsCleared = 0;
            state.printlockGame.realisticTimes = [];
            updatePrintLockModeButtonsUI();
            initPrintLockGame();
        });

        // Mode clicks (PathFind)
        elPathFindModeFacilBtn.addEventListener('click', () => {
            state.pathfindGame.currentMode = 'facil';
            updatePathFindModeButtonsUI();
            initPathFindGame();
        });
        elPathFindModeMedioBtn.addEventListener('click', () => {
            state.pathfindGame.currentMode = 'medio';
            updatePathFindModeButtonsUI();
            initPathFindGame();
        });
        elPathFindModeRealistaBtn.addEventListener('click', () => {
            state.pathfindGame.currentMode = 'realista';
            state.pathfindGame.realisticRoundsCleared = 0;
            state.pathfindGame.realisticTimes = [];
            updatePathFindModeButtonsUI();
            initPathFindGame();
        });

        // Profile modal clicks
        elEditNameBtn.addEventListener('click', openEditProfileModal);
        elModalCancelBtn.addEventListener('click', closeEditProfileModal);
        elModalSaveBtn.addEventListener('click', saveProfileName);
        elModalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveProfileName();
        });
        elEditModal.addEventListener('click', (e) => {
            if (e.target === elEditModal) closeEditProfileModal();
        });

        // Reaction Game Click Area
        elReactionScreen.addEventListener('mousedown', handleReactionScreenClick);
        elReactionScreen.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleReactionScreenClick();
        });

        // Untangle Game actions
        elUntangleRestartBtn.addEventListener('click', () => {
            if (state.untangleGame.currentMode === 'realista') {
                state.untangleGame.realisticRoundsCleared = 0;
                state.untangleGame.realisticTimes = [];
            }
            initUntangleGame();
        });
        
        elUntangleNextBtn.addEventListener('click', () => {
            if (state.untangleGame.currentMode !== 'realista') {
                initUntangleGame();
            }
        });

        // PrintLock actions
        elPrintLockRestartBtn.addEventListener('click', () => {
            if (state.printlockGame.currentMode === 'realista') {
                state.printlockGame.realisticRoundsCleared = 0;
                state.printlockGame.realisticTimes = [];
            }
            initPrintLockGame();
        });
        elPrintLockNextBtn.addEventListener('click', () => {
            if (state.printlockGame.currentMode !== 'realista') {
                initPrintLockGame();
            }
        });

        // PathFind actions
        elPathFindRestartBtn.addEventListener('click', () => {
            if (state.pathfindGame.currentMode === 'realista') {
                state.pathfindGame.realisticRoundsCleared = 0;
                state.pathfindGame.realisticTimes = [];
            }
            initPathFindGame();
        });
        elPathFindNextBtn.addEventListener('click', () => {
            if (state.pathfindGame.currentMode !== 'realista') {
                initPathFindGame();
            }
        });
    }

    // Run Initialization
    initialize();
});
