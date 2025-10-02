// 09js/apps/mahjongSolitaire.js

// --- Глобальные переменные модуля ---
let board = []; // Массив всех костей на поле { id, symbol, x, y, z, element }
let selectedTile = null;
let tilesLeft = 0;
let hintTimeout;

// --- HTML и CSS ---

export function getHtml() {
    return `
        <style>
            .mahjong-container {
                position: relative;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                aspect-ratio: 1.5 / 1; /* Соотношение сторон для доски */
            }
            #mahjong-board {
                position: relative;
                width: 100%;
                height: 100%;
                user-select: none;
            }

            /* --- ИЗМЕНЕНИЕ: Улучшенный 3D-эффект для костей --- */
            .mahjong-tile {
                position: absolute;
                width: calc(100% / 15);
                height: calc(100% / 10);
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: clamp(12px, 4vmin, 24px);
                font-weight: bold;
                cursor: pointer;
                transition: all 0.15s ease-in-out;
                border-radius: 4px;
                
                /* Светлая тема: 3D-эффект */
                background-color: #f7fafc; /* gray-50 */
                border-width: 1px 2px 2px 1px; /* top, right, bottom, left */
                border-style: solid;
                border-color: #ffffff #a0aec0 #a0aec0 #ffffff; /* Светлые грани сверху/слева, темные снизу/справа */
                box-shadow: 3px 3px 5px rgba(0,0,0,0.25);
            }
            
            /* Темная тема: 3D-эффект */
            .dark .mahjong-tile {
                background-color: #2d3748; /* gray-800 */
                border-color: #4a5568 #1a202c #1a202c #4a5568;
                color: #e2e8f0; /* gray-200 */
                box-shadow: 3px 3px 6px rgba(0,0,0,0.4);
            }

            .mahjong-tile.selectable {
                /* Эффект свечения для доступных костей */
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
            }

            .mahjong-tile.selected {
                /* Эффект "приподнятости" для выбранной кости */
                transform: scale(1.08) translate(-1px, -1px);
                box-shadow: 5px 5px 15px rgba(0,0,0,0.4);
                z-index: 100 !important; /* Всегда поверх других при выборе */
            }
            /* --- КОНЕЦ ИЗМЕНЕНИЙ --- */

            .mahjong-tile.hint {
                animation: hint-pulse 0.8s infinite;
            }
            @keyframes hint-pulse {
                0% { box-shadow: 0 0 8px rgba(234, 179, 8, 0.7); }
                50% { box-shadow: 0 0 16px rgba(234, 179, 8, 1); }
                100% { box-shadow: 0 0 8px rgba(234, 179, 8, 0.7); }
            }
            .mahjong-overlay {
                position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: none;
                justify-content: center; align-items: center; text-align: center;
                border-radius: 0.5rem; z-index: 100;
            }
            
            /* Стили для пустых ячеек подложки (без изменений) */
            .pile { 
                width: 100px; 
                height: 145px; 
                border: 2px solid transparent; 
                border-radius: 8px; 
                position: relative; 
                flex-shrink: 0;
            }
            .pile:empty::before {
                content: '';
                position: absolute;
                inset: 0;
                border: 2px solid rgba(0,0,0,0.2);
                border-radius: 8px;
            }
            .dark .pile:empty::before {
                border-color: rgba(255,255,255,0.2);
            }
        </style>
        <div class="flex flex-col items-center gap-4">
            <div class="flex justify-between items-center w-full max-w-2xl p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div class="font-semibold">Осталось костей: <span id="mahjong-tiles-left">0</span></div>
                <div class="flex gap-2">
                    <button id="mahjong-shuffle-btn" class="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600" disabled>Перемешать</button>
                    <button id="mahjong-hint-btn" class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Подсказка</button>
                    <button id="mahjong-new-game-btn" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Новая игра</button>
                </div>
            </div>

            <div class="mahjong-container">
                <div id="mahjong-board"></div>
                <div id="mahjong-overlay" class="mahjong-overlay">
                    <div class="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                        <h2 id="mahjong-overlay-title" class="text-3xl font-bold text-green-500">Победа!</h2>
                        <p id="mahjong-overlay-text" class="mt-2"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Логика игры (остается без изменений) ---

const TILE_SYMBOLS = [
    '龍','風','竹','菊','蘭','梅','春','夏','秋','冬',
    '一','二','三','四','五','六','七','八','九',
    '東','南','西','北','中','發','白',
    '🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡'
];

const LAYOUT = [
    [0,3,0],[0,3,1],[0,3,2],[0,3,3],[0,3,4],[0,3,5],[0,3,6],[0,3,7],[0,3,8],[0,3,9],[0,3,10],[0,3,11],
    [0,4,0],[0,4,1],[0,4,2],[0,4,3],[0,4,4],[0,4,5],[0,4,6],[0,4,7],[0,4,8],[0,4,9],[0,4,10],[0,4,11],
    [0,2,1],[0,2,2],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,2,7],[0,2,8],[0,2,9],[0,2,10],
    [0,5,1],[0,5,2],[0,5,3],[0,5,4],[0,5,5],[0,5,6],[0,5,7],[0,5,8],[0,5,9],[0,5,10],
    [0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,1,7],[0,1,8],[0,1,9],
    [0,6,2],[0,6,3],[0,6,4],[0,6,5],[0,6,6],[0,6,7],[0,6,8],[0,6,9],
    [0,0,3],[0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],
    [0,7,3],[0,7,4],[0,7,5],[0,7,6],[0,7,7],[0,7,8],
    [1,3,2],[1,3,3],[1,3,4],[1,3,5],[1,3,6],[1,3,7],[1,3,8],[1,3,9],
    [1,4,2],[1,4,3],[1,4,4],[1,4,5],[1,4,6],[1,4,7],[1,4,8],[1,4,9],
    [1,2,3],[1,2,4],[1,2,5],[1,2,6],[1,2,7],[1,2,8],
    [1,5,3],[1,5,4],[1,5,5],[1,5,6],[1,5,7],[1,5,8],
    [2,3,4],[2,3,5],[2,3,6],[2,3,7],
    [2,4,4],[2,4,5],[2,4,6],[2,4,7],
    [3,3.5,5.5],
    [0,3.5,13],[0,3.5,14],[0,3.5,15]
];

function hasAvailableMoves(currentBoard) {
    const selectableTiles = currentBoard.filter(t => !t.isRemoved && !isTileBlocked(t, currentBoard));
    const counts = {};
    selectableTiles.forEach(tile => {
        const key = tile.group || tile.symbol;
        counts[key] = (counts[key] || 0) + 1;
    });
    return Object.values(counts).some(count => count >= 2);
}

function startGame() {
    let deck;
    let attempts = 0;

    do {
        deck = [];
        for (let i = 0; i < TILE_SYMBOLS.length; i++) {
            for (let j = 0; j < 4; j++) {
                deck.push({ symbol: TILE_SYMBOLS[i], id: `${TILE_SYMBOLS[i]}_${j}` });
            }
        }
        ['🌸','🌼','🍂','❄️'].forEach(s => deck.push({ symbol: s, id: s, group: 'season' }));
        ['🌺','🌻','🍁','🍃'].forEach(f => deck.push({ symbol: f, id: f, group: 'flower' }));

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        board = [];
        LAYOUT.forEach((pos, index) => {
            const cardData = deck[index];
            board.push({ ...cardData, z: pos[0], y: pos[1], x: pos[2], isRemoved: false });
        });

        attempts++;
        if (attempts > 100) {
            console.error("Не удалось сгенерировать поле с доступными ходами.");
            break;
        }

    } while (!hasAvailableMoves(board));

    selectedTile = null;
    document.getElementById('mahjong-overlay').style.display = 'none';
    tilesLeft = board.length;
    renderBoard();
}


function renderBoard() {
    const boardEl = document.getElementById('mahjong-board');
    const tilesLeftEl = document.getElementById('mahjong-tiles-left');
    boardEl.innerHTML = '';
    
    const sortedBoard = [...board].sort((a,b) => a.z - b.z);

    sortedBoard.forEach(tile => {
        if (tile.isRemoved) return;
        
        const tileEl = document.createElement('div');
        tileEl.className = 'mahjong-tile';
        tileEl.textContent = tile.symbol;
        tileEl.dataset.id = tile.id;
        
        tileEl.style.left = `calc(${tile.x * (100 / 15)}% + ${tile.z * -4}px)`;
        tileEl.style.top = `calc(${tile.y * (100 / 10)}% + ${tile.z * -4}px)`;
        tileEl.style.zIndex = tile.z * 10 + tile.y;

        boardEl.appendChild(tileEl);
        tile.element = tileEl;
    });
    
    tilesLeftEl.textContent = tilesLeft;
    updateSelectableTiles();
}

function isTileBlocked(tile, currentBoard = board) {
    const isCovered = currentBoard.some(other => 
        !other.isRemoved && 
        other.z > tile.z && 
        Math.abs(other.x - tile.x) < 2 && 
        Math.abs(other.y - tile.y) < 2
    );
    if (isCovered) return true;

    const isBlockedOnLeft = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x - 2 &&
        Math.abs(other.y - tile.y) < 2
    );
    const isBlockedOnRight = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x + 2 &&
        Math.abs(other.y - tile.y) < 2
    );

    return isBlockedOnLeft && isBlockedOnRight;
}

function updateSelectableTiles() {
    let selectableCount = 0;
    board.forEach(tile => {
        if (tile.isRemoved) return;
        if (!isTileBlocked(tile)) {
            tile.element.classList.add('selectable');
            selectableCount++;
        } else {
            tile.element.classList.remove('selectable');
        }
    });
    
    setTimeout(checkForAvailableMoves, 10);
}

function checkForAvailableMoves() {
    const shuffleBtn = document.getElementById('mahjong-shuffle-btn');
    if (!hasAvailableMoves(board) && tilesLeft > 0) {
        shuffleBtn.disabled = false;
        showOverlay("Нет ходов!", "Нажмите 'Перемешать' или 'Новая игра'.");
    } else {
        shuffleBtn.disabled = true;
    }
    document.getElementById('mahjong-hint-btn').disabled = !hasAvailableMoves(board);
}

function handleTileClick(tileEl) {
    if (!tileEl.classList.contains('selectable')) return;
    
    const clickedTileData = board.find(t => t.id === tileEl.dataset.id);

    if (selectedTile) {
        if (selectedTile.id === clickedTileData.id) {
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            return;
        }

        const isMatch = (selectedTile.symbol === clickedTileData.symbol) || 
                        (selectedTile.group && selectedTile.group === clickedTileData.group);

        if (isMatch) {
            selectedTile.isRemoved = true;
            clickedTileData.isRemoved = true;
            selectedTile.element.remove();
            clickedTileData.element.remove();
            tilesLeft -= 2;

            selectedTile = null;
            renderBoard();
            
            if (tilesLeft === 0) {
                showOverlay("Победа!", "Вы очистили всё поле!");
            }
        } else {
            selectedTile.element.classList.remove('selected');
            selectedTile = clickedTileData;
            selectedTile.element.classList.add('selected');
        }

    } else {
        selectedTile = clickedTileData;
        selectedTile.element.classList.add('selected');
    }
}

function showOverlay(title, text) {
    document.getElementById('mahjong-overlay-title').textContent = title;
    document.getElementById('mahjong-overlay-text').textContent = text;
    document.getElementById('mahjong-overlay').style.display = 'flex';
}

function findHint() {
    clearTimeout(hintTimeout);
    document.querySelectorAll('.hint').forEach(el => el.classList.remove('hint'));

    const selectableTiles = board.filter(t => !t.isRemoved && t.element.classList.contains('selectable'));
    const groups = {};
    for (const tile of selectableTiles) {
        const key = tile.group || tile.symbol;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tile);
    }
    
    for (const key in groups) {
        if (groups[key].length >= 2) {
            const tile1 = groups[key][0];
            const tile2 = groups[key][1];
            tile1.element.classList.add('hint');
            tile2.element.classList.add('hint');
            
            hintTimeout = setTimeout(() => {
                tile1.element.classList.remove('hint');
                tile2.element.classList.remove('hint');
            }, 2000);
            return;
        }
    }
}

function shuffleBoard() {
    const remainingTiles = board.filter(t => !t.isRemoved);
    const tilesToShuffle = remainingTiles.map(t => ({ symbol: t.symbol, id: t.id, group: t.group }));

    for (let i = tilesToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilesToShuffle[i], tilesToShuffle[j]] = [tilesToShuffle[j], tilesToShuffle[i]];
    }

    remainingTiles.forEach((tile, index) => {
        const newTileData = tilesToShuffle[index];
        tile.symbol = newTileData.symbol;
        tile.id = newTileData.id;
        tile.group = newTileData.group;
    });
    
    document.getElementById('mahjong-overlay').style.display = 'none';
    renderBoard();
}

export function init() {
    const boardEl = document.getElementById('mahjong-board');
    const newGameBtn = document.getElementById('mahjong-new-game-btn');
    const hintBtn = document.getElementById('mahjong-hint-btn');
    const shuffleBtn = document.getElementById('mahjong-shuffle-btn');

    boardEl.addEventListener('click', (e) => {
        const tileEl = e.target.closest('.mahjong-tile');
        if (tileEl) handleTileClick(tileEl);
    });

    newGameBtn.addEventListener('click', startGame);
    hintBtn.addEventListener('click', findHint);
    shuffleBtn.addEventListener('click', shuffleBoard);
    
    startGame();
}

export function cleanup() {
    clearTimeout(hintTimeout);
    board = [];
    selectedTile = null;
}
