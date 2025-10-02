// js/apps/mahjongSolitaire.js

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
            .mahjong-tile {
                position: absolute;
                width: calc(100% / 15); /* Ширина кости относительно ширины доски */
                height: calc(100% / 10); /* Высота кости */
                background-color: #f7fafc; /* gray-50 */
                border: 1px solid #a0aec0; /* gray-400 */
                border-radius: 4px;
                box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: clamp(12px, 4vmin, 24px); /* Адаптивный размер шрифта */
                font-weight: bold;
                cursor: pointer;
                transition: all 0.15s ease-in-out;
            }
            .dark .mahjong-tile {
                background-color: #2d3748; /* gray-800 */
                border-color: #4a5568; /* gray-600 */
                color: #e2e8f0; /* gray-200 */
            }
            .mahjong-tile.selectable {
                border-color: #3b82f6; /* blue-500 */
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
            }
            .mahjong-tile.selected {
                transform: scale(1.05);
                background-color: #dbeafe; /* blue-100 */
                border-color: #2563eb; /* blue-600 */
            }
            .dark .mahjong-tile.selected {
                 background-color: #1e3a8a; /* blue-900 */
                 border-color: #60a5fa; /* blue-400 */
            }
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

// --- Логика игры ---

const TILE_SYMBOLS = [
    '龍','風','竹','菊','蘭','梅','春','夏','秋','冬', // Драконы, Ветры, Растения, Сезоны
    '一','二','三','四','五','六','七','八','九', // Китайские цифры
    '東','南','西','北','中','發','白', // Стороны света и доп. драконы
    '🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡' // Символы из Юникода
];

// Классическая раскладка "Черепаха"
// [z, y, x] - слой, строка, столбец
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
    [0,3.5,13],[0,3.5,14],[0,3.5,15] // Правое крыло (15я - особая)
];

function startGame() {
    // 1. Создание и тасование колоды
    let deck = [];
    for (let i = 0; i < TILE_SYMBOLS.length; i++) {
        for (let j = 0; j < 4; j++) {
            deck.push({ symbol: TILE_SYMBOLS[i], id: `${TILE_SYMBOLS[i]}_${j}` });
        }
    }
    // Добавляем 4 кости сезона и 4 кости цветов (они могут сочетаться друг с другом)
    ['🌸','🌼','🍂','❄️'].forEach(s => deck.push({ symbol: s, id: s, group: 'season' }));
    ['🌺','🌻','🍁','🍃'].forEach(f => deck.push({ symbol: f, id: f, group: 'flower' }));

    // Тасование
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // 2. Сброс состояния
    board = [];
    selectedTile = null;
    document.getElementById('mahjong-overlay').style.display = 'none';

    // 3. Раздача костей по раскладке
    LAYOUT.forEach((pos, index) => {
        const cardData = deck[index];
        board.push({
            ...cardData,
            z: pos[0],
            y: pos[1],
            x: pos[2],
            isRemoved: false,
        });
    });

    tilesLeft = board.length;
    renderBoard();
}

function renderBoard() {
    const boardEl = document.getElementById('mahjong-board');
    const tilesLeftEl = document.getElementById('mahjong-tiles-left');
    boardEl.innerHTML = '';
    
    // Сортируем по Z-индексу, чтобы правильно отрисовать тени
    const sortedBoard = [...board].sort((a,b) => a.z - b.z);

    sortedBoard.forEach(tile => {
        if (tile.isRemoved) return;
        
        const tileEl = document.createElement('div');
        tileEl.className = 'mahjong-tile';
        tileEl.textContent = tile.symbol;
        tileEl.dataset.id = tile.id;
        
        // Позиционирование кости
        tileEl.style.left = `calc(${tile.x * (100 / 15)}% + ${tile.z * -4}px)`;
        tileEl.style.top = `calc(${tile.y * (100 / 10)}% + ${tile.z * -4}px)`;
        tileEl.style.zIndex = tile.z * 10 + tile.y;

        boardEl.appendChild(tileEl);
        tile.element = tileEl; // Сохраняем ссылку на DOM-элемент
    });
    
    tilesLeftEl.textContent = tilesLeft;
    updateSelectableTiles();
}

function isTileBlocked(tile) {
    // Проверка, есть ли что-то сверху
    const isCovered = board.some(other => 
        !other.isRemoved && 
        other.z > tile.z && 
        Math.abs(other.x - tile.x) < 2 && 
        Math.abs(other.y - tile.y) < 2
    );
    if (isCovered) return true;

    // Проверка боков
    const isBlockedOnLeft = board.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x - 2 &&
        Math.abs(other.y - tile.y) < 2
    );
    const isBlockedOnRight = board.some(other =>
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
    
    // После обновления проверяем, есть ли ходы
    setTimeout(checkForAvailableMoves, 10);
}

function checkForAvailableMoves() {
    const selectableTiles = board.filter(t => !t.isRemoved && t.element.classList.contains('selectable'));
    const counts = {};
    selectableTiles.forEach(tile => {
        const key = tile.group || tile.symbol;
        counts[key] = (counts[key] || 0) + 1;
    });

    const hasMoves = Object.values(counts).some(count => count >= 2);
    const shuffleBtn = document.getElementById('mahjong-shuffle-btn');

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

    if (selectedTile) { // Вторая кость в паре
        if (selectedTile.id === clickedTileData.id) { // Кликнули на ту же самую
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            return;
        }

        // Проверка совпадения
        const isMatch = (selectedTile.symbol === clickedTileData.symbol) || 
                        (selectedTile.group && selectedTile.group === clickedTileData.group);

        if (isMatch) {
            // Удаляем кости
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
            // Не совпали, выбираем новую
            selectedTile.element.classList.remove('selected');
            selectedTile = clickedTileData;
            selectedTile.element.classList.add('selected');
        }

    } else { // Первая кость в паре
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
    const symbolsToShuffle = remainingTiles.map(t => ({ symbol: t.symbol, id: t.id, group: t.group }));

    // Тасуем символы
    for (let i = symbolsToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [symbolsToShuffle[i], symbolsToShuffle[j]] = [symbolsToShuffle[j], symbolsToShuffle[i]];
    }

    // Присваиваем новые символы оставшимся костям
    remainingTiles.forEach((tile, index) => {
        const newSymbolData = symbolsToShuffle[index];
        tile.symbol = newSymbolData.symbol;
        tile.id = newSymbolData.id;
        tile.group = newSymbolData.group;
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
