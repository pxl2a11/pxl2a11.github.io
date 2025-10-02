//17 js/apps/mahjongSolitaire.js

// --- Глобальные переменные модуля ---
let board = []; // Массив всех костей на поле { id, symbol, x, y, z, element }
let selectedTile = null;
let tilesLeft = 0;
let hintTimeout;

// --- Определение костей и их категорий для стилизации ---
const TILE_DEFINITIONS = [
    // Масти (по 9 костей, каждая 4 раза)
    ...Array.from({ length: 9 }, (_, i) => ({ symbol: ['一','二','三','四','五','六','七','八','九'][i], category: 'character' })),
    ...Array.from({ length: 9 }, (_, i) => ({ symbol: ['🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘'][i], category: 'bamboo' })),
    ...Array.from({ length: 9 }, (_, i) => ({ symbol: ['🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡'][i], category: 'circle' })),
    // Ветры и Драконы (Козыри)
    { symbol: '東', category: 'wind' }, { symbol: '南', category: 'wind' }, { symbol: '西', category: 'wind' }, { symbol: '北', category: 'wind' },
    { symbol: '中', category: 'dragon-red' }, { symbol: '發', category: 'dragon-green' }, { symbol: '白', category: 'dragon-white' },
    // Цветы и Сезоны (по 1 кости)
    { symbol: '梅', category: 'flower' }, { symbol: '蘭', category: 'flower' }, { symbol: '菊', category: 'flower' }, { symbol: '竹', category: 'flower' },
    { symbol: '春', category: 'season' }, { symbol: '夏', category: 'season' }, { symbol: '秋', category: 'season' }, { symbol: '冬', category: 'season' }
];

// Раскладка "Черепаха"
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

// --- HTML и CSS ---

export function getHtml() {
    return `
        <style>
            .mahjong-board-container {
                position: relative;
                width: 100%;
                padding: 10px;
                background-color: #056642;
                background-image: radial-gradient(rgba(255, 255, 255, 0.05) 10%, transparent 10%);
                background-size: 15px 15px;
                border-radius: 12px;
                box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .dark .mahjong-board-container { background-color: #064e3b; }
            #mahjong-board {
                position: relative;
                width: 100%;
                max-width: 800px;
                aspect-ratio: 1.5 / 1;
                user-select: none;
            }
            
            .mahjong-tile {
                position: absolute;
                width: calc(100% / 15);
                height: calc(100% / 10);
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: clamp(12px, 4vmin, 24px);
                font-family: 'Noto Sans', sans-serif;
                cursor: pointer;
                transition: all 0.15s ease-in-out;
                border-radius: 4px;
                
                background: linear-gradient(145deg, #FEFBF0, #F8F2E0);
                border: 1px solid #C8C0B0;
                box-shadow: 
                    inset 0 0 5px 2px rgba(185, 105, 40, 0.35), /* Ржавый градиент */
                    1px 1px 0 #069564, 2px 2px 0 #057a55, 3px 3px 0 #046c4e, 4px 4px 0 #065f46, 
                    5px 5px 0 #065f46, 6px 6px 0 #065f46, 7px 7px 0 #065f46, /* Толщина сбоку и снизу */
                    8px 8px 15px rgba(0, 0, 0, 0.4); /* Основная тень */
            }
            
            .dark .mahjong-tile {
                box-shadow: 
                    inset 0 0 5px 2px rgba(185, 105, 40, 0.35),
                    1px 1px 0 #069564, 2px 2px 0 #057a55, 3px 3px 0 #046c4e, 4px 4px 0 #065f46, 
                    5px 5px 0 #065f46, 6px 6px 0 #065f46, 7px 7px 0 #065f46,
                    8px 8px 15px rgba(0, 0, 0, 0.5);
            }
            
            .mahjong-tile.selectable:hover {
                background: linear-gradient(145deg, #fff, #fef4e5);
                border-color: #a8a29e;
                transform: translateY(-2px);
                box-shadow: 
                    inset 0 0 5px 2px rgba(185, 105, 40, 0.35),
                    1px 1px 0 #069564, 2px 2px 0 #057a55, 3px 3px 0 #046c4e, 4px 4px 0 #065f46,
                    5px 5px 0 #065f46, 6px 6px 0 #065f46, 7px 7px 0 #065f46,
                    10px 10px 18px rgba(0, 0, 0, 0.45);
            }

            /* ИСПРАВЛЕНО: Выбранная фишка теперь окрашивается в светло-зеленый цвет. */
            .mahjong-tile.selected {
                background: linear-gradient(145deg, #dcfce7, #bbf7d0); /* Светло-зеленый фон */
                border-color: #4ade80; /* Яркая зеленая рамка */
                transform: scale(1.08) translate(-4px, -4px);
                box-shadow: 
                    inset 0 0 4px 1px rgba(74, 222, 128, 0.5), /* Внутреннее свечение в тон */
                    1px 1px #069564, 2px 2px #057a55, 3px 3px #046c4e, 4px 4px #065f46, 
                    5px 5px #065f46, 6px 6px #065f46, 7px 7px #065f46, 8px 8px #065f46,
                    12px 16px 25px rgba(0,0,0,0.4);
                z-index: 100 !important;
            }
            
            .mahjong-tile.hint { animation: hint-pulse 0.8s infinite alternate; }
            @keyframes hint-pulse {
                to { 
                    background: linear-gradient(145deg, #fef3c7, #fde68a);
                    border-color: #f59e0b;
                    box-shadow: 
                        inset 0 0 5px 2px rgba(185, 105, 40, 0.35),
                        1px 1px 0 #069564, 2px 2px 0 #057a55, 3px 3px 0 #046c4e, 4px 4px 0 #065f46,
                        5px 5px 0 #065f46, 6px 6px 0 #065f46, 7px 7px 0 #065f46,
                        8px 8px 15px rgba(0,0,0,0.35);
                }
            }

            .mahjong-overlay {
                position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: none;
                justify-content: center; align-items: center; text-align: center;
                border-radius: 0.5rem; z-index: 100;
            }

            /* --- Цветные символы --- */
            .mahjong-tile .symbol { font-weight: bold; }
            .mahjong-tile.character .symbol { color: #1e3a8a; }
            .mahjong-tile.bamboo .symbol { color: #065f46; }
            .mahjong-tile.circle .symbol { color: #991b1b; }
            .mahjong-tile.wind .symbol { color: #1e293b; }
            .mahjong-tile.dragon-red .symbol { color: #dc2626; }
            .mahjong-tile.dragon-green .symbol { color: #16a34a; }
            .mahjong-tile.dragon-white .symbol { width: 50%; height: 70%; border: 2px solid #3b82f6; border-radius: 4px; }
            .mahjong-tile.flower .symbol { color: #db2777; }
            .mahjong-tile.season .symbol { color: #ca8a04; }
        </style>

        <div class="flex flex-col items-center gap-4 py-4 sm:py-8">
            <div class="flex justify-between items-center w-full max-w-2xl p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div class="font-semibold">Осталось костей: <span id="mahjong-tiles-left">0</span></div>
                <div class="flex gap-2">
                    <button id="mahjong-shuffle-btn" class="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600" disabled>Перемешать</button>
                    <button id="mahjong-hint-btn" class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Подсказка</button>
                    <button id="mahjong-new-game-btn" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Новая игра</button>
                </div>
            </div>

            <div class="mahjong-board-container">
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

// --- Логика игры ---

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
        TILE_DEFINITIONS.forEach(def => {
            if (def.category === 'season' || def.category === 'flower') {
                deck.push({ ...def, id: def.symbol, group: def.category });
            } else {
                for (let i = 0; i < 4; i++) {
                    deck.push({ ...def, id: `${def.symbol}_${i}` });
                }
            }
        });

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        board = [];
        LAYOUT.forEach((pos, index) => {
            if(deck[index]) {
                board.push({ ...deck[index], z: pos[0], y: pos[1], x: pos[2], isRemoved: false });
            }
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
    
    const sortedBoard = [...board].sort((a,b) => a.z - b.z || a.y - b.y || a.x - a.x);

    sortedBoard.forEach(tile => {
        if (tile.isRemoved) return;
        
        const tileEl = createCardElement(tile);
        
        tileEl.style.top = `calc(12% + ${tile.y * (100 / 10)}% + ${tile.z * -7}px)`;
        tileEl.style.left = `calc(${tile.x * (100 / 15)}% + ${tile.z * -7}px)`;
        tileEl.style.zIndex = tile.z * 10 + tile.y;

        boardEl.appendChild(tileEl);
        tile.element = tileEl;
    });
    
    tilesLeftEl.textContent = tilesLeft;
    updateSelectableTiles();
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className = `mahjong-tile ${card.category || ''}`;
    el.dataset.id = card.id;
    el.innerHTML = card.category === 'dragon-white' ? `<span class="symbol"></span>` : `<span class="symbol">${card.symbol}</span>`;
    return el;
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
    board.forEach(tile => {
        if (tile.isRemoved) return;
        if (!isTileBlocked(tile)) {
            tile.element.classList.add('selectable');
        } else {
            tile.element.classList.remove('selectable');
        }
    });
    setTimeout(checkForAvailableMoves, 10);
}

function checkForAvailableMoves() {
    const shuffleBtn = document.getElementById('mahjong-shuffle-btn');
    const hasMoves = hasAvailableMoves(board);
    if (!hasMoves && tilesLeft > 0) {
        shuffleBtn.disabled = false;
        showOverlay("Нет ходов!", "Нажмите 'Перемешать' или 'Новая игра'.");
    } else {
        shuffleBtn.disabled = true;
    }
    document.getElementById('mahjong-hint-btn').disabled = !hasMoves;
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
    
    for (let i = 0; i < selectableTiles.length; i++) {
        const tile1 = selectableTiles[i];
        
        for (let j = i + 1; j < selectableTiles.length; j++) {
            const tile2 = selectableTiles[j];
            
            const isMatch = (tile1.symbol === tile2.symbol) || (tile1.group && tile1.group === tile2.group);
            
            if (isMatch) {
                tile1.element.classList.add('hint');
                tile2.element.classList.add('hint');
                
                hintTimeout = setTimeout(() => {
                    if (tile1.element) tile1.element.classList.remove('hint');
                    if (tile2.element) tile2.element.classList.remove('hint');
                }, 2000);
                return;
            }
        }
    }
}

function shuffleBoard() {
    const remainingTiles = board.filter(t => !t.isRemoved);
    const tilesToShuffle = remainingTiles.map(t => ({ symbol: t.symbol, id: t.id, group: t.group, category: t.category }));

    for (let i = tilesToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilesToShuffle[i], tilesToShuffle[j]] = [tilesToShuffle[j], tilesToShuffle[i]];
    }

    remainingTiles.forEach((tile, index) => {
        const newTileData = tilesToShuffle[index];
        tile.symbol = newTileData.symbol;
        tile.id = newTileData.id;
        tile.group = newTileData.group;
        tile.category = newTileData.category;
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
