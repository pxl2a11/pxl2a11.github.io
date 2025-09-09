// js/apps/game2048.js

let grid = [];
let score = 0;
const gridSize = 4;
let isGameOver = false;

// Переменные для обработки свайпов
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;


// Цвета для плиток
const tileColors = {
    2: 'bg-gray-200 text-gray-800', 4: 'bg-yellow-200 text-gray-800',
    8: 'bg-orange-300 text-white', 16: 'bg-orange-400 text-white',
    32: 'bg-red-400 text-white', 64: 'bg-red-500 text-white',
    128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white', 1024: 'bg-indigo-400 text-white',
    2048: 'bg-indigo-600 text-white', 4096: 'bg-purple-700 text-white'
};

export function getHtml() {
    return `
        <div class="flex flex-col items-center">
            <div class="flex justify-between items-center w-full max-w-md mb-4">
                <div>
                    <span class="text-lg font-bold">СЧЕТ:</span>
                    <span id="score" class="text-lg font-bold">0</span>
                </div>
                <button id="new-game-btn" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">Новая игра</button>
            </div>
            <div id="game-board" class="grid grid-cols-4 grid-rows-4 gap-3 p-3 bg-gray-400 dark:bg-gray-600 rounded-md relative" style="width: 100%; max-width: 420px; aspect-ratio: 1 / 1;">
                <!-- Ячейки и плитки будут добавлены динамически -->
                 <div id="game-over-overlay" class="absolute inset-0 bg-black bg-opacity-50 flex-col justify-center items-center text-white text-4xl font-bold hidden rounded-md z-20">
                    <span>Конец игры!</span>
                    <button id="retry-btn" class="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-xl">Попробовать снова</button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const gameBoard = document.getElementById('game-board');

    document.getElementById('new-game-btn').addEventListener('click', startGame);
    document.getElementById('retry-btn').addEventListener('click', startGame);

    // Управление с клавиатуры
    document.addEventListener('keydown', handleKeydown);

    // Управление с тачскрина
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd);

    startGame();
}

export function cleanup() {
    const gameBoard = document.getElementById('game-board');

    document.removeEventListener('keydown', handleKeydown);

    // Убираем слушатели тачскрина
    if (gameBoard) {
        gameBoard.removeEventListener('touchstart', handleTouchStart);
        gameBoard.removeEventListener('touchmove', handleTouchMove);
        gameBoard.removeEventListener('touchend', handleTouchEnd);
    }
}

function startGame() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    score = 0;
    isGameOver = false;
    document.getElementById('game-over-overlay').classList.add('hidden');
    updateScore();
    addRandomTile();
    addRandomTile();
    renderBoard();
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    // Сохраняем оверлей и очищаем доску от старых плиток
    const overlay = document.getElementById('game-over-overlay');
    gameBoard.innerHTML = '';
    gameBoard.appendChild(overlay);

    // Пересоздаем сетку с нуля на основе массива 'grid'
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            // 1. Создаем фоновую ячейку для каждой позиции
            const backgroundCell = document.createElement('div');
            backgroundCell.className = 'w-full h-full bg-gray-300 dark:bg-gray-500 rounded-md';
            // Позиционируем в сетке (CSS grid строки/колонки начинаются с 1)
            backgroundCell.style.gridRow = `${r + 1}`;
            backgroundCell.style.gridColumn = `${c + 1}`;
            gameBoard.appendChild(backgroundCell);

            // 2. Если в этой позиции есть плитка, создаем и размещаем ее поверх
            if (grid[r][c] !== 0) {
                const tile = document.createElement('div');
                // Плитка также является элементом сетки, без абсолютного позиционирования
                // z-10 гарантирует, что плитка будет поверх фоновой ячейки
                tile.className = `tile z-10 flex items-center justify-center font-bold text-2xl md:text-4xl rounded-md transition-all duration-200 ${tileColors[grid[r][c]] || 'bg-black text-white'}`;
                
                // Помещаем плитку в ту же ячейку сетки, что и фон
                tile.style.gridRow = `${r + 1}`;
                tile.style.gridColumn = `${c + 1}`;

                tile.textContent = grid[r][c];
                gameBoard.appendChild(tile);
            }
        }
    }
}

function handleKeydown(e) {
    if (isGameOver) return;
    let moved = false;
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            moved = moveUp();
            break;
        case 'ArrowDown':
            e.preventDefault();
            moved = moveDown();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            moved = moveLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            moved = moveRight();
            break;
        default: return;
    }
    if (moved) {
        addRandomTile();
        renderBoard();
        checkGameOver();
    }
}

// --- НОВЫЕ ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ СВАЙПОМ ---

function handleTouchStart(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (isGameOver) return;

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    handleSwipe();
}

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30; // Минимальная дистанция свайпа в пикселях
    let moved = false;

    // Определяем, был ли свайп больше горизонтальным или вертикальным
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Горизонтальный свайп
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                moved = moveRight();
            } else {
                moved = moveLeft();
            }
        }
    } else {
        // Вертикальный свайп
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                moved = moveDown();
            } else {
                moved = moveUp();
            }
        }
    }

    if (moved) {
        addRandomTile();
        renderBoard();
        checkGameOver();
    }
}

// --- ОСНОВНАЯ ЛОГИКА ИГРЫ (без изменений) ---

function slide(row) {
    let arr = row.filter(val => val);
    let missing = gridSize - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
}

function combine(row) {
    for (let i = 0; i < gridSize - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }
    updateScore();
    return row;
}

function operate(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
    return row;
}

function moveUp() {
    let moved = false;
    for (let c = 0; c < gridSize; c++) {
        let col = [];
        for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
        const originalCol = [...col];
        col = operate(col);
        if (originalCol.join(',') !== col.join(',')) moved = true;
        for (let r = 0; r < gridSize; r++) grid[r][c] = col[r];
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let c = 0; c < gridSize; c++) {
        let col = [];
        for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
        const originalCol = [...col];
        col.reverse();
        col = operate(col);
        col.reverse();
        if (originalCol.join(',') !== col.join(',')) moved = true;
        for (let r = 0; r < gridSize; r++) grid[r][c] = col[r];
    }
    return moved;
}

function moveLeft() {
    let moved = false;
    for (let r = 0; r < gridSize; r++) {
        const originalRow = [...grid[r]];
        grid[r] = operate(grid[r]);
        if (originalRow.join(',') !== grid[r].join(',')) moved = true;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let r = 0; r < gridSize; r++) {
        const originalRow = [...grid[r]];
        grid[r].reverse();
        grid[r] = operate(grid[r]);
        grid[r].reverse();
        if (originalRow.join(',') !== grid[r].join(',')) moved = true;
    }
    return moved;
}

function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        let spot = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[spot.r][spot.c] = Math.random() > 0.9 ? 4 : 2;
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function canMove() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) return true;
            if (r < gridSize - 1 && grid[r][c] === grid[r + 1][c]) return true;
            if (c < gridSize - 1 && grid[r][c] === grid[r][c + 1]) return true;
        }
    }
    return false;
}

function checkGameOver() {
    if (!canMove()) {
        isGameOver = true;
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('game-over-overlay').classList.add('flex');
    }
}
