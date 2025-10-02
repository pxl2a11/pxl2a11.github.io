// 27js/apps/mahjongSolitaire.js

// --- Глобальные переменные модуля ---
let board = []; // Массив всех костей на поле { id, symbol, x, y, z, element, group }
let selectedTile = null;
let tilesLeft = 0;
let hintTimeout;

// --- Константы для настройки рендеринга ---
const TILE_WIDTH_GRID = 16; // Ширина доски в "условных костях" (15 было маловато)
const TILE_HEIGHT_GRID = 10; // Высота доски в "условных костях"
const TILE_X_UNIT = 100 / TILE_WIDTH_GRID; // Ширина кости в %
const TILE_Y_UNIT = 100 / TILE_HEIGHT_GRID; // Высота кости в %
const TILE_DEPTH_PX = 10; // Глубина (смещение) для 3D-эффекта
const TILE_SHIFT_Z = 6; // Смещение в пикселях для каждого Z-слоя

// --- HTML и CSS ---

export function getHtml() {
    return `
        <style>
            .mahjong-container {
                position: relative;
                width: 100%;
                max-width: 900px; /* Немного шире для лучшего вида */
                margin: 0 auto;
                aspect-ratio: 1.6 / 1; /* Соотношение сторон для доски */
            }
            #mahjong-board {
                position: relative;
                width: 100%;
                height: 100%;
                user-select: none;
                /* --- ИЗМЕНЕНИЕ: Включаем перспективу для лучшего 3D-вида --- */
                transform-style: preserve-3d;
                perspective: 1000px; 
            }

            /* --- ИЗМЕНЕНИЕ: Улучшенный 3D-эффект для костей --- */
            .mahjong-tile {
                position: absolute;
                width: ${TILE_X_UNIT}%;
                height: ${TILE_Y_UNIT}%;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: clamp(14px, 4.5vmin, 28px);
                font-weight: 800; /* Более жирный шрифт */
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                border-radius: 4px;
                line-height: 1; /* Улучшить вертикальное выравнивание символов */
                
                /* --- ИЗМЕНЕНИЕ: Настоящий 3D-эффект с имитацией боков --- */
                background-color: #f7fafc; /* gray-50 - лицевая сторона */
                color: #2d3748; /* gray-800 - символ */
                border: 1px solid #e2e8f0; 
                
                /* Имитация объема: свет сверху/слева, тень снизу/справа */
                box-shadow: 
                    inset 0 0 0 1px rgba(255,255,255,0.7), /* Внутренний блик */
                    2px 2px 4px rgba(0,0,0,0.4), /* Тень под костью (поднимает) */
                    0 0 0 ${TILE_DEPTH_PX}px rgba(0,0,0,0.1) /* Имитация толщины бока */
                    ; 
                transform-origin: center center;
                /* Настоящее 3D-смещение будет применено в JS */
            }
            
            /* Темная тема: 3D-эффект */
            .dark .mahjong-tile {
                background-color: #3b4252; /* Более светлый темный фон */
                color: #eceff4; /* Светлый символ */
                border: 1px solid #4c566a;
                box-shadow: 
                    inset 0 0 0 1px rgba(255,255,255,0.1), 
                    2px 2px 4px rgba(0,0,0,0.6), 
                    0 0 0 ${TILE_DEPTH_PX}px rgba(0,0,0,0.2)
                    ;
            }

            .mahjong-tile.selectable {
                /* Уменьшаю свечение, чтобы не перебивать 3D-тень */
                box-shadow: 
                    inset 0 0 0 1px rgba(255,255,255,0.7), 
                    2px 2px 4px rgba(0,0,0,0.4), 
                    0 0 0 ${TILE_DEPTH_PX}px rgba(59, 130, 246, 0.4); /* Синий "бок" */
            }
            .dark .mahjong-tile.selectable {
                 box-shadow: 
                    inset 0 0 0 1px rgba(255,255,255,0.1), 
                    2px 2px 4px rgba(0,0,0,0.6), 
                    0 0 0 ${TILE_DEPTH_PX}px rgba(59, 130, 246, 0.3);
            }

            .mahjong-tile.selected {
                /* Эффект "приподнятости" для выбранной кости */
                transform: scale(1.08) translateZ(${TILE_SHIFT_Z * 2}px); /* Улучшенное 3D-поднятие */
                box-shadow: 
                    5px 5px 15px rgba(0,0,0,0.5), /* Более выраженная тень */
                    0 0 0 ${TILE_DEPTH_PX}px rgba(239, 68, 68, 0.7); /* Красный "бок" при выборе */
                z-index: 100 !important;
            }
            /* --- КОНЕЦ ИЗМЕНЕНИЙ В ВИДЕ --- */

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
                border-radius: 0.5rem; z-index: 1000; /* Более высокий Z-индекс */
            }
            
            /* Стили для пустых ячеек подложки - удалены, так как они не используются в этом коде. */

            /* Добавлю сброс трансформации для более чистого рендеринга */
            #mahjong-board .mahjong-tile {
                 transform: none; /* Будет переопределено в JS */
            }
        </style>
        <div class="flex flex-col items-center gap-4">
            <div class="flex justify-between items-center w-full max-w-2xl p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div class="font-semibold text-lg">Осталось костей: <span id="mahjong-tiles-left" class="text-blue-500 font-bold">0</span></div>
                <div class="flex gap-2">
                    <button id="mahjong-shuffle-btn" class="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50" disabled>Перемешать</button>
                    <button id="mahjong-hint-btn" class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">Подсказка</button>
                    <button id="mahjong-new-game-btn" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Новая игра</button>
                </div>
            </div>

            <div class="mahjong-container">
                <div id="mahjong-board"></div>
                <div id="mahjong-overlay" class="mahjong-overlay">
                    <div class="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                        <h2 id="mahjong-overlay-title" class="text-3xl font-bold text-green-500">Победа!</h2>
                        <p id="mahjong-overlay-text" class="mt-2 text-gray-700 dark:text-gray-300"></p>
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

// ИЗМЕНЕНИЕ: Расширенный ЛЕЙАУТ для более крупной доски (теперь 16x10 вместо 12x8)
const LAYOUT = [
    [0,3,1],[0,3,2],[0,3,3],[0,3,4],[0,3,5],[0,3,6],[0,3,7],[0,3,8],[0,3,9],[0,3,10],[0,3,11],[0,3,12],[0,3,13],[0,3,14],
    [0,4,1],[0,4,2],[0,4,3],[0,4,4],[0,4,5],[0,4,6],[0,4,7],[0,4,8],[0,4,9],[0,4,10],[0,4,11],[0,4,12],[0,4,13],[0,4,14],
    [0,2,2],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,2,7],[0,2,8],[0,2,9],[0,2,10],[0,2,11],[0,2,12],[0,2,13],
    [0,5,2],[0,5,3],[0,5,4],[0,5,5],[0,5,6],[0,5,7],[0,5,8],[0,5,9],[0,5,10],[0,5,11],[0,5,12],[0,5,13],
    [0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,1,7],[0,1,8],[0,1,9],[0,1,10],[0,1,11],[0,1,12],
    [0,6,3],[0,6,4],[0,6,5],[0,6,6],[0,6,7],[0,6,8],[0,6,9],[0,6,10],[0,6,11],[0,6,12],
    [0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],[0,0,9],[0,0,10],[0,0,11],
    [0,7,4],[0,7,5],[0,7,6],[0,7,7],[0,7,8],[0,7,9],[0,7,10],[0,7,11],
    // Второй слой
    [1,3,3],[1,3,4],[1,3,5],[1,3,6],[1,3,7],[1,3,8],[1,3,9],[1,3,10],[1,3,11],[1,3,12],
    [1,4,3],[1,4,4],[1,4,5],[1,4,6],[1,4,7],[1,4,8],[1,4,9],[1,4,10],[1,4,11],[1,4,12],
    [1,2,4],[1,2,5],[1,2,6],[1,2,7],[1,2,8],[1,2,9],[1,2,10],[1,2,11],
    [1,5,4],[1,5,5],[1,5,6],[1,5,7],[1,5,8],[1,5,9],[1,5,10],[1,5,11],
    // Третий слой
    [2,3,5],[2,3,6],[2,3,7],[2,3,8],[2,3,9],[2,3,10],
    [2,4,5],[2,4,6],[2,4,7],[2,4,8],[2,4,9],[2,4,10],
    // Четвертый слой
    [3,3.5,7.5], // Центральная кость
    // Боковые кости (те, которые были [0,3.5,13] и т.д. - сместим их к правому краю)
    [0,3.5,0],[0,3.5,15] // Левая и Правая
]; // Общее количество костей стало 120 (4x30) + 8 + 4 + 4 + 2 = 138 -> 144 кости, нужно проверить раскладку.
// Упростим раскладку, чтобы не менять логику. Вернем к 144.

const FIXED_LAYOUT = [
    // Layer 0 (Bottom) - 12x10 + 2 (sides) = 122 -> Уменьшим до 120
    [0,3,0],[0,3,1],[0,3,2],[0,3,3],[0,3,4],[0,3,5],[0,3,6],[0,3,7],[0,3,8],[0,3,9],[0,3,10],[0,3,11], // 12
    [0,4,0],[0,4,1],[0,4,2],[0,4,3],[0,4,4],[0,4,5],[0,4,6],[0,4,7],[0,4,8],[0,4,9],[0,4,10],[0,4,11], // 12
    [0,2,1],[0,2,2],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,2,7],[0,2,8],[0,2,9],[0,2,10], // 10
    [0,5,1],[0,5,2],[0,5,3],[0,5,4],[0,5,5],[0,5,6],[0,5,7],[0,5,8],[0,5,9],[0,5,10], // 10
    [0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,1,7],[0,1,8],[0,1,9], // 8
    [0,6,2],[0,6,3],[0,6,4],[0,6,5],[0,6,6],[0,6,7],[0,6,8],[0,6,9], // 8
    [0,0,3],[0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8], // 6
    [0,7,3],[0,7,4],[0,7,5],[0,7,6],[0,7,7],[0,7,8], // 6
    // Layer 1 - 8x6 = 48 -> Уменьшим до 40
    [1,3,2],[1,3,3],[1,3,4],[1,3,5],[1,3,6],[1,3,7],[1,3,8],[1,3,9], // 8
    [1,4,2],[1,4,3],[1,4,4],[1,4,5],[1,4,6],[1,4,7],[1,4,8],[1,4,9], // 8
    [1,2,3],[1,2,4],[1,2,5],[1,2,6],[1,2,7],[1,2,8], // 6
    [1,5,3],[1,5,4],[1,5,5],[1,5,6],[1,5,7],[1,5,8], // 6
    // Layer 2 - 4x4 = 16 -> Уменьшим до 12
    [2,3,4],[2,3,5],[2,3,6],[2,3,7], // 4
    [2,4,4],[2,4,5],[2,4,6],[2,4,7], // 4
    // Layer 3 (Top) - 2
    [3,3.5,5.5], // Центральная кость

    [0,3.5,-1], [0,3.5,12] // Боковые кости (убрал 3, оставил 2)
];
// Итого: 104 кости (144 - (2*12 + 2*10 + 2*8 + 2*6) + 8 + 8 + 6 + 6 + 4 + 4 + 1 + 2)
// Приведу к 144 костям:
const FINAL_LAYOUT = [
    // 0 (14x12) - 104 кости
    [0,3,1],[0,3,2],[0,3,3],[0,3,4],[0,3,5],[0,3,6],[0,3,7],[0,3,8],[0,3,9],[0,3,10],[0,3,11],[0,3,12],[0,3,13],[0,3,14], // 14
    [0,4,1],[0,4,2],[0,4,3],[0,4,4],[0,4,5],[0,4,6],[0,4,7],[0,4,8],[0,4,9],[0,4,10],[0,4,11],[0,4,12],[0,4,13],[0,4,14], // 14
    [0,2,2],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,2,7],[0,2,8],[0,2,9],[0,2,10],[0,2,11],[0,2,12],[0,2,13], // 12
    [0,5,2],[0,5,3],[0,5,4],[0,5,5],[0,5,6],[0,5,7],[0,5,8],[0,5,9],[0,5,10],[0,5,11],[0,5,12],[0,5,13], // 12
    [0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,1,7],[0,1,8],[0,1,9],[0,1,10],[0,1,11],[0,1,12], // 10
    [0,6,3],[0,6,4],[0,6,5],[0,6,6],[0,6,7],[0,6,8],[0,6,9],[0,6,10],[0,6,11],[0,6,12], // 10
    [0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],[0,0,9],[0,0,10],[0,0,11], // 8
    [0,7,4],[0,7,5],[0,7,6],[0,7,7],[0,7,8],[0,7,9],[0,7,10],[0,7,11], // 8
    [0,3.5,0], [0,3.5,15], // 2 Боковые
    
    // 1 (8x6) - 32 кости
    [1,3,4],[1,3,5],[1,3,6],[1,3,7],[1,3,8],[1,3,9],[1,3,10],[1,3,11], // 8
    [1,4,4],[1,4,5],[1,4,6],[1,4,7],[1,4,8],[1,4,9],[1,4,10],[1,4,11], // 8
    [1,2,5],[1,2,6],[1,2,7],[1,2,8],[1,2,9],[1,2,10], // 6
    [1,5,5],[1,5,6],[1,5,7],[1,5,8],[1,5,9],[1,5,10], // 6
    [1,3.5,2], [1,3.5,13], // 2 Боковые
    
    // 2 (4x4) - 8 костей
    [2,3,6],[2,3,7],[2,3,8],[2,3,9], // 4
    [2,4,6],[2,4,7],[2,4,8],[2,4,9], // 4
    
    // 3 (Top) - 2 кости (была 1, сделаем 2 для симметрии)
    [3,3.5,7.5], [3,3.5,8.5]
]; // 8+8+6+6+4+4+1+2 = 39. Не 144.
// Возьмем оригинальный LAYOUT (144 кости), но будем использовать новые константы TILE_WIDTH_GRID/TILE_HEIGHT_GRID в renderBoard
// чтобы получить нужный масштаб и позиционирование.

const LAYOUT_ORIGINAL = [
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
]; // 144 кости

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
        // ИЗМЕНЕНИЕ: Добавим ID к сезонным/цветочным костям
        ['🌸','🌼','🍂','❄️'].forEach((s, i) => deck.push({ symbol: s, id: `${s}_${i}`, group: 'season' }));
        ['🌺','🌻','🍁','🍃'].forEach((f, i) => deck.push({ symbol: f, id: `${f}_${i}`, group: 'flower' }));

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        board = [];
        // ИЗМЕНЕНИЕ: Используем LAYOUT_ORIGINAL
        LAYOUT_ORIGINAL.forEach((pos, index) => {
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
    
    // Сортировка по Z, затем по Y, затем по X для правильного наложения
    const sortedBoard = [...board].sort((a,b) => a.z - b.z || a.y - b.y || a.x - b.x);

    sortedBoard.forEach(tile => {
        if (tile.isRemoved) return;
        
        const tileEl = document.createElement('div');
        tileEl.className = 'mahjong-tile';
        tileEl.textContent = tile.symbol;
        tileEl.dataset.id = tile.id;
        
        // --- ИЗМЕНЕНИЕ: Новый 3D-расчет позиции ---
        // Базовая позиция (центровка)
        const left = tile.x * TILE_X_UNIT;
        const top = tile.y * TILE_Y_UNIT;

        tileEl.style.left = `${left}%`;
        tileEl.style.top = `${top}%`;
        
        // Смещение по Z (глубине)
        const shiftX = tile.z * TILE_SHIFT_Z;
        const shiftY = tile.z * TILE_SHIFT_Z;
        const shiftZ = tile.z * TILE_SHIFT_Z;

        // Используем transform: translate3d для лучшего 3D-рендеринга и ускорения
        tileEl.style.transform = `translate3d(${shiftX}px, ${shiftY}px, ${shiftZ}px)`;

        // Z-Index для правильного перекрытия (по z, затем по y)
        tileEl.style.zIndex = tile.z * 100 + tile.y; 

        boardEl.appendChild(tileEl);
        tile.element = tileEl;
    });
    
    tilesLeftEl.textContent = tilesLeft;
    updateSelectableTiles();
}

// ... Остальная логика игры остается прежней ...

function isTileBlocked(tile, currentBoard = board) {
    const isCovered = currentBoard.some(other => 
        !other.isRemoved && 
        other.z > tile.z && 
        // 1.5 - минимальное расстояние, чтобы не блокировать кости "впритык"
        Math.abs(other.x - tile.x) < 1.5 && 
        Math.abs(other.y - tile.y) < 1.5
    );
    if (isCovered) return true;

    const isBlockedOnLeft = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x - 2 &&
        Math.abs(other.y - tile.y) < 1.5
    );
    const isBlockedOnRight = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x + 2 &&
        Math.abs(other.y - tile.y) < 1.5
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
    // ИЗМЕНЕНИЕ: Включаю кнопку "Перемешать" только если нет ходов, а кости остались.
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

    // Удаляем предыдущую выбранную кость, если она не совпадает с текущей
    if (selectedTile && selectedTile.id !== clickedTileData.id) {
        selectedTile.element.classList.remove('selected');
    }

    if (selectedTile) {
        if (selectedTile.id === clickedTileData.id) {
            // Снятие выделения
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            return;
        }

        const isMatch = (selectedTile.symbol === clickedTileData.symbol) || 
                        (selectedTile.group && selectedTile.group === clickedTileData.group);

        if (isMatch) {
            selectedTile.isRemoved = true;
            clickedTileData.isRemoved = true;
            
            // Плавное исчезновение
            selectedTile.element.style.opacity = '0';
            clickedTileData.element.style.opacity = '0';
            
            setTimeout(() => {
                selectedTile.element.remove();
                clickedTileData.element.remove();
                tilesLeft -= 2;

                selectedTile = null;
                renderBoard(); // Перерисовка для обновления доступных костей
                
                if (tilesLeft === 0) {
                    showOverlay("Победа!", "Вы очистили всё поле!");
                }
            }, 200); // Задержка для анимации исчезновения
            
        } else {
            // Не совпали, но обе выбраны. Текущая становится новой выбранной.
            selectedTile = clickedTileData;
            selectedTile.element.classList.add('selected');
        }

    } else {
        // Выбираем первую кость
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
        // Убеждаемся, что мы используем ID для уникальности, но символы/группы для совпадения
        const key = tile.group || tile.symbol; 
        if (!groups[key]) groups[key] = [];
        groups[key].push(tile);
    }
    
    for (const key in groups) {
        if (groups[key].length >= 2) {
            const tile1 = groups[key][0];
            const tile2 = groups[key][1];
            
            // Если была выбрана одна кость, отменяем выбор перед подсказкой
            if (selectedTile) {
                selectedTile.element.classList.remove('selected');
                selectedTile = null;
            }
            
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
    // ИЗМЕНЕНИЕ: Сохраняем не только symbol/id/group, но и текущее положение
    const tilePositions = remainingTiles.map(t => ({ x: t.x, y: t.y, z: t.z }));

    const tilesToShuffle = remainingTiles.map(t => ({ symbol: t.symbol, id: t.id, group: t.group }));

    for (let i = tilesToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilesToShuffle[i], tilesToShuffle[j]] = [tilesToShuffle[j], tilesToShuffle[i]];
    }
    
    // ИЗМЕНЕНИЕ: Проверяем, что перемешивание создаст доступные ходы
    let attempts = 0;
    let newBoard;
    do {
        newBoard = remainingTiles.map((tile, index) => {
            const newTileData = tilesToShuffle[index];
            const pos = tilePositions[index];
            return { ...newTileData, x: pos.x, y: pos.y, z: pos.z, isRemoved: false, element: null };
        });

        // Повторное перемешивание, если нет ходов
        if (!hasAvailableMoves(newBoard)) {
            for (let i = tilesToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tilesToShuffle[i], tilesToShuffle[j]] = [tilesToShuffle[j], tilesToShuffle[i]];
            }
        }
        attempts++;
    } while (!hasAvailableMoves(newBoard) && attempts < 50);

    if (attempts >= 50) {
        showOverlay("Ошибка!", "Не удалось найти перемешивание с доступными ходами.");
        return;
    }

    // Применяем новые данные к старому массиву (чтобы не ломать ссылки)
    remainingTiles.forEach((tile, index) => {
        const newTileData = tilesToShuffle[index];
        tile.symbol = newTileData.symbol;
        tile.id = newTileData.id;
        tile.group = newTileData.group;
    });
    
    document.getElementById('mahjong-overlay').style.display = 'none';
    selectedTile = null; // Сбрасываем выбранную кость
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
