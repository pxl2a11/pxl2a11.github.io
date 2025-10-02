//56 js/apps/mahjongSolitaire.js

// --- Глобальные переменные модуля ---
let board = []; // Массив всех костей на поле { id, symbol, x, y, z, element }
let selectedTile = null;
let tilesLeft = 0;
let hintTimeout;

// НОВОЕ: Добавляем звуковые эффекты с обработкой ошибок
const clickSound = new Audio('sounds/games/mahjong/click.mp3');
const matchSound = new Audio('sounds/games/mahjong/double.mp3');
clickSound.onerror = () => console.warn("Не удалось загрузить звук клика.");
matchSound.onerror = () => console.warn("Не удалось загрузить звук совпадения.");


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
    { symbol: '梅', category: 'flower', group: 'flower' }, { symbol: '蘭', category: 'flower', group: 'flower' }, { symbol: '菊', category: 'flower', group: 'flower' }, { symbol: '竹', category: 'flower', group: 'flower' },
    { symbol: '春', category: 'season', group: 'season' }, { symbol: '夏', category: 'season', group: 'season' }, { symbol: '秋', category: 'season', group: 'season' }, { symbol: '冬', category: 'season', group: 'season' }
];

// Раскладка "Черепаха"
const LAYOUT = [
    // z=0
    [0,3,0],[0,3,1],[0,3,2],[0,3,3],[0,3,4],[0,3,5],[0,3,6],[0,3,7],[0,3,8],[0,3,9],[0,3,10],[0,3,11],
    [0,4,0],[0,4,1],[0,4,2],[0,4,3],[0,4,4],[0,4,5],[0,4,6],[0,4,7],[0,4,8],[0,4,9],[0,4,10],[0,4,11],
    [0,2,1],[0,2,2],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,2,7],[0,2,8],[0,2,9],[0,2,10],
    [0,5,1],[0,5,2],[0,5,3],[0,5,4],[0,5,5],[0,5,6],[0,5,7],[0,5,8],[0,5,9],[0,5,10],
    [0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,1,7],[0,1,8],[0,1,9],
    [0,6,2],[0,6,3],[0,6,4],[0,6,5],[0,6,6],[0,6,7],[0,6,8],[0,6,9],
    [0,0,3],[0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],
    [0,7,3],[0,7,4],[0,7,5],[0,7,6],[0,7,7],[0,7,8],
    [0,3.5,12],[0,3.5,13], // Special two on the far right
    [0,0.5,0.5], // Special tile on the far left
    // z=1
    [1,3,2],[1,3,3],[1,3,4],[1,3,5],[1,3,6],[1,3,7],[1,3,8],[1,3,9],
    [1,4,2],[1,4,3],[1,4,4],[1,4,5],[1,4,6],[1,4,7],[1,4,8],[1,4,9],
    [1,2,3],[1,2,4],[1,2,5],[1,2,6],[1,2,7],[1,2,8],
    [1,5,3],[1,5,4],[1,5,5],[1,5,6],[1,5,7],[1,5,8],
    // z=2
    [2,3,4],[2,3,5],[2,3,6],[2,3,7],
    [2,4,4],[2,4,5],[2,4,6],[2,4,7],
    // z=3
    [3,3.5,5.5] // Top tile
].map((pos, index) => ({ id: index, z: pos[0], y: pos[1], x: pos[2] }));


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
            
            /* =============================================================== */
            /* ============ ИЗМЕНЕНИЕ: Улучшенный дизайн фишек ================ */
            /* =============================================================== */

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
                border-radius: 4px;
                background: linear-gradient(145deg, #FEFBF0, #F8F2E0);
                border: 1px solid #C8C0B0;

                /* Более плавная и быстрая анимация */
                transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out;

                /* Внутренняя тень для символа остается, она создает эффект гравировки */
                 box-shadow: inset 0 0 5px 2px rgba(185, 105, 40, 0.35);
            }
            
            /* --- Состояние: ЗАБЛОКИРОВАНА --- */
            /* Выглядит "вдавленной", тусклая, с минимальной тенью */
            .mahjong-tile.blocked {
                filter: brightness(0.85) saturate(0.6);
                cursor: default;
                /* Маленькая, четкая тень, будто фишка лежит на поле */
                box-shadow: inset 0 0 5px 2px rgba(185, 105, 40, 0.2), 
                            2px 2px 4px rgba(0,0,0,0.3);
            }
            
            /* --- Состояние: АКТИВНА (можно выбрать) --- */
            /* Выглядит "парящей" над полем, готова к нажатию */
            .mahjong-tile.selectable {
                /* Слегка приподнимаем фишку */
                transform: translateY(-2px);
                /* Тень становится больше и мягче, создавая ощущение высоты */
                box-shadow: inset 0 0 5px 2px rgba(185, 105, 40, 0.35), 
                            5px 5px 12px rgba(0, 0, 0, 0.3);
            }

            /* --- Состояние: НАВЕДЕНИЕ на активную фишку --- */
            /* Приподнимается еще выше, тень усиливается */
            .mahjong-tile.selectable:hover {
                background: linear-gradient(145deg, #fff, #fef4e5);
                border-color: #a8a29e;
                transform: translateY(-5px) scale(1.03);
                box-shadow: inset 0 0 5px 2px rgba(185, 105, 40, 0.35), 
                            8px 8px 18px rgba(0, 0, 0, 0.35);
            }

            /* --- Состояние: ВЫБРАНА --- */
            /* Максимально выделяется, яркая рамка и большая тень */
            .mahjong-tile.selected {
                background: linear-gradient(145deg, #dcfce7, #bbf7d0);
                border-color: #4ade80;
                transform: scale(1.08) translateY(-4px);
                box-shadow: inset 0 0 4px 1px rgba(74, 222, 128, 0.5),
                            12px 16px 25px rgba(0,0,0,0.4);
                filter: none; /* Сбрасываем фильтры, если они были */
            }

            /* --- Состояние: ПОДСКАЗКА --- */
            .mahjong-tile.hint { animation: hint-pulse 0.8s infinite alternate; }
            @keyframes hint-pulse {
                to { 
                    background: linear-gradient(145deg, #fef3c7, #fde68a);
                    border-color: #f59e0b;
                    transform: translateY(-4px) scale(1.02); /* Адаптируем transform */
                    box-shadow: inset 0 0 5px 2px rgba(245, 158, 11, 0.4),
                                9px 9px 16px rgba(0,0,0,0.3); /* Адаптируем тень */
                }
            }

            /* =============================================================== */
            /* ================= Конец изменений в дизайне =================== */
            /* =============================================================== */

            .mahjong-overlay {
                position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: none;
                justify-content: center; align-items: center; text-align: center;
                border-radius: 0.5rem; z-index: 200;
            }

            /* --- Цветные символы --- */
            .mahjong-tile .symbol { font-weight: bold; }
            .mahjong-tile.character .symbol { color: #1e3a8a; }
            .mahjong-tile.bamboo .symbol { color: #065f46; }
            .mahjong-tile.circle .symbol { color: #991b1b; }
            .mahjong-tile.wind .symbol { color: #1e293b; }
            .mahjong-tile.dragon-red .symbol { color: #dc2626; }
            .mahjong-tile.dragon-green .symbol { color: #16a34a; }
            .mahjong-tile.dragon-white .symbol { 
                width: 50%; 
                height: 70%; 
                border: 2px solid #60a5fa; 
                border-radius: 4px;
                box-shadow: inset 0 0 0 2px #1e40af;
                background-color: rgba(239, 246, 255, 0.7);
            }
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

function generateSolvableBoard() {
    // 1. Создаем колоду пар
    const pairs = [];
    TILE_DEFINITIONS.forEach(def => {
        if (def.group) { // Цветы и сезоны
            // Они не образуют строгие пары, их нужно обработать отдельно
        } else {
            // Обычные кости образуют 2 пары (всего 4 одинаковых)
            const tileData = { ...def };
            delete tileData.group;
            pairs.push([ { ...tileData, id: `${def.symbol}_0` }, { ...tileData, id: `${def.symbol}_1` } ]);
            pairs.push([ { ...tileData, id: `${def.symbol}_2` }, { ...tileData, id: `${def.symbol}_3` } ]);
        }
    });

    // Добавляем цветы и сезоны как группы, которые могут сочетаться друг с другом
    const flowers = TILE_DEFINITIONS.filter(t => t.group === 'flower').map((t, i) => ({ ...t, id: `flower_${i}`}));
    const seasons = TILE_DEFINITIONS.filter(t => t.group === 'season').map((t, i) => ({ ...t, id: `season_${i}`}));
    
    // Создаем из них случайные пары
    pairs.push([flowers[0], flowers[1]], [flowers[2], flowers[3]]);
    pairs.push([seasons[0], seasons[1]], [seasons[2], seasons[3]]);

    // 2. Перемешиваем пары
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    let remainingPositions = [...LAYOUT];
    const finalBoard = [];

    // 3. "Разбираем" поле в обратном порядке
    while (remainingPositions.length > 0) {
        if (pairs.length === 0) {
            console.error("Закончились пары костей, а места еще есть. Проверьте раскладку и количество костей.");
            return null; // Ошибка
        }

        // a. Находим все "свободные" позиции в текущем списке
        const openPositions = remainingPositions.filter(p1 => {
            const isCovered = remainingPositions.some(p2 =>
                p1.id !== p2.id && p2.z > p1.z && Math.abs(p2.x - p1.x) < 1 && Math.abs(p2.y - p1.y) < 1
            );
            if (isCovered) return false;

            const isBlockedOnLeft = remainingPositions.some(p2 =>
                p1.id !== p2.id && p2.z === p1.z && p2.x === p1.x - 1 && Math.abs(p2.y - p1.y) < 1
            );
            const isBlockedOnRight = remainingPositions.some(p2 =>
                p1.id !== p2.id && p2.z === p1.z && p2.x === p1.x + 1 && Math.abs(p2.y - p1.y) < 1
            );
            return !(isBlockedOnLeft && isBlockedOnRight);
        });

        // b. Если свободных позиций для создания пары не нашлось, генерация считается неуспешной
        if (openPositions.length < 2) {
            console.warn("Попытка генерации не удалась: не нашлось двух свободных мест для размещения пары. Повтор...");
            return null; // Сигнал для startGame, чтобы попробовать снова
        }

        // c. Берем пару костей из колоды
        const [tile1Data, tile2Data] = pairs.pop();

        // d. Выбираем две случайные свободные позиции
        const pos1Index = Math.floor(Math.random() * openPositions.length);
        const [pos1] = openPositions.splice(pos1Index, 1);
        
        const pos2Index = Math.floor(Math.random() * openPositions.length);
        const [pos2] = openPositions.splice(pos2Index, 1);

        // e. Присваиваем кости этим позициям и добавляем в финальный массив
        finalBoard.push({ ...tile1Data, z: pos1.z, y: pos1.y, x: pos1.x, isRemoved: false });
        finalBoard.push({ ...tile2Data, z: pos2.z, y: pos2.y, x: pos2.x, isRemoved: false });

        // f. Удаляем выбранные позиции из основного списка для следующей итерации
        remainingPositions = remainingPositions.filter(p => p.id !== pos1.id && p.id !== pos2.id);
    }

    return finalBoard;
}


function startGame() {
    clearAllHints();
    
    let newBoard = null;
    let attempts = 0;
    // Используем цикл, чтобы избежать переполнения стека при рекурсии
    do {
        newBoard = generateSolvableBoard();
        attempts++;
    } while (!newBoard && attempts < 100); // Повторяем, пока не сгенерируется поле (с защитой от вечного цикла)

    // Если после 100 попыток поле так и не создано, показываем ошибку
    if (!newBoard) {
        console.error("Не удалось сгенерировать решаемое поле после 100 попыток.");
        showOverlay("Ошибка генерации", "Не удалось создать игровое поле. Пожалуйста, обновите страницу.");
        return;
    }

    board = newBoard;
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
        
        // Смещаем каждую фишку в зависимости от слоя для создания 3D-эффекта
        const xOffset = -tile.z * 6;
        const yOffset = -tile.z * 6;

        tileEl.style.top = `calc(${tile.y * (100 / 8)}% + ${yOffset}px)`;
        tileEl.style.left = `calc(${tile.x * (100 / 15)}% + ${xOffset}px)`;
        tileEl.style.zIndex = tile.z * 10 + Math.floor(tile.y);

        boardEl.appendChild(tileEl);
        tile.element = tileEl; // Сохраняем ссылку на DOM-элемент
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
    const TILE_WIDTH = 1;
    const TILE_HEIGHT = 1;

    // Проверка, есть ли кость НАД текущей
    const isCovered = currentBoard.some(other => 
        !other.isRemoved && 
        other.z > tile.z && 
        Math.abs(other.x - tile.x) < TILE_WIDTH && 
        Math.abs(other.y - tile.y) < TILE_HEIGHT
    );
    if (isCovered) return true;

    // Проверка, заблокирована ли кость с обеих сторон (слева и справа)
    const isBlockedOnLeft = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x - TILE_WIDTH &&
        Math.abs(other.y - tile.y) < TILE_HEIGHT
    );
    
    const isBlockedOnRight = currentBoard.some(other =>
        !other.isRemoved &&
        other.z === tile.z &&
        other.x === tile.x + TILE_WIDTH &&
        Math.abs(other.y - tile.y) < TILE_HEIGHT
    );

    return isBlockedOnLeft && isBlockedOnRight;
}

function updateSelectableTiles() {
    board.forEach(tile => {
        if (tile.isRemoved || !tile.element) return;
        
        if (!isTileBlocked(tile)) {
            tile.element.classList.add('selectable');
            tile.element.classList.remove('blocked');
        } else {
            tile.element.classList.remove('selectable');
            tile.element.classList.add('blocked');
        }
    });
    // Небольшая задержка, чтобы дать DOM обновиться перед проверкой
    setTimeout(checkForAvailableMoves, 50);
}

function hasAvailableMoves(currentBoard) {
    const selectableTiles = currentBoard.filter(t => !t.isRemoved && !isTileBlocked(t, currentBoard));
    if (selectableTiles.length < 2) return false;

    const counts = new Map();
    for (const tile of selectableTiles) {
        const key = tile.group || tile.symbol; // Группируем по "flower"/"season" или по символу
        const currentCount = counts.get(key) || 0;
        counts.set(key, currentCount + 1);
    }
    
    for (const count of counts.values()) {
        if (count >= 2) {
            return true; // Нашли как минимум одну возможную пару
        }
    }
    
    return false;
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
    
    clickSound.play().catch(e => console.warn("Ошибка воспроизведения звука:", e));
    
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
            matchSound.play().catch(e => console.warn("Ошибка воспроизведения звука:", e));

            selectedTile.isRemoved = true;
            clickedTileData.isRemoved = true;
            
            clearAllHints();

            selectedTile.element?.remove();
            clickedTileData.element?.remove();
            
            tilesLeft -= 2;
            document.getElementById('mahjong-tiles-left').textContent = tilesLeft;

            selectedTile = null;
            
            updateSelectableTiles();
            
            if (tilesLeft === 0) {
                showOverlay("Победа!", "Вы очистили всё поле!");
            }
        } else {
            selectedTile.element?.classList.remove('selected');
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

function clearAllHints() {
    clearTimeout(hintTimeout);
    document.querySelectorAll('.hint').forEach(el => el.classList.remove('hint'));
}

function findHint() {
    clearAllHints();

    const selectableTiles = board.filter(t => !t.isRemoved && !isTileBlocked(t));
    
    // Группируем доступные кости по ключу
    const groups = {};
    for (const tile of selectableTiles) {
        const key = tile.group || tile.symbol;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tile);
    }

    // Ищем первую группу, в которой есть пара
    for (const key in groups) {
        if (groups[key].length >= 2) {
            const tile1 = groups[key][0];
            const tile2 = groups[key][1];
            
            tile1.element?.classList.add('hint');
            tile2.element?.classList.add('hint');
            hintTimeout = setTimeout(clearAllHints, 2000);
            return;
        }
    }
}

function shuffleBoard() {
    clearAllHints();
    
    const remainingTiles = board.filter(t => !t.isRemoved);
    const tilesDataToShuffle = remainingTiles.map(t => ({ 
        symbol: t.symbol, id: t.id, group: t.group, category: t.category 
    }));

    for (let i = tilesDataToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilesDataToShuffle[i], tilesDataToShuffle[j]] = [tilesDataToShuffle[j], tilesDataToShuffle[i]];
    }

    remainingTiles.forEach((tile, index) => {
        const newTileData = tilesDataToShuffle[index];
        tile.symbol = newTileData.symbol;
        tile.id = newTileData.id;
        tile.group = newTileData.group;
        tile.category = newTileData.category;
        
        if (tile.element) {
            tile.element.className = `mahjong-tile ${tile.category || ''}`;
            tile.element.dataset.id = tile.id;
            tile.element.innerHTML = tile.category === 'dragon-white' 
                ? `<span class="symbol"></span>` 
                : `<span class="symbol">${tile.symbol}</span>`;
        }
    });
    
    document.getElementById('mahjong-overlay').style.display = 'none';
    if(selectedTile) {
        selectedTile.element?.classList.remove('selected');
        selectedTile = null;
    }
    
    updateSelectableTiles();
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
    
    // Проверяем, достаточно ли костей для раскладки
    if (TILE_DEFINITIONS.reduce((acc, def) => acc + (def.group ? 1 : 4), 0) < LAYOUT.length) {
         console.error(`Ошибка конфигурации: В раскладке (${LAYOUT.length}) больше мест, чем доступно костей.`);
         showOverlay("Ошибка", "В раскладке больше мест, чем костей. Игра не может быть запущена.");
         return;
    }
    
    startGame();
}

export function cleanup() {
    clearAllHints();
    board = [];
    selectedTile = null;
}
