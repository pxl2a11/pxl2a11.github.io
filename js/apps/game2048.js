// js/apps/game2048.js

let grid = [];
let score = 0;
const gridSize = 4;
let isGameOver = false;

// ИЗМЕНЕНИЕ: Возвращена первоначальная цветовая схема
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
            <!-- ИЗМЕНЕНИЕ: Убраны классы для темной темы и touch-событий -->
            <div id="game-board" class="grid grid-cols-4 gap-3 p-3 bg-gray-400 rounded-md relative" style="width: 100%; max-width: 420px; aspect-ratio: 1 / 1;">
                 <div id="game-over-overlay" class="absolute inset-0 bg-black bg-opacity-50 flex-col justify-center items-center text-white text-4xl font-bold hidden rounded-md">
                    <span>Конец игры!</span>
                    <button id="retry-btn" class="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-xl">Попробовать снова</button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    document.getElementById('new-game-btn').addEventListener('click', startGame);
    document.getElementById('retry-btn').addEventListener('click', startGame);
    // ИЗМЕНЕНИЕ: Обработчик событий возвращен на 'document'
    document.addEventListener('keydown', handleKeydown);
    startGame();
}

export function cleanup() {
    // ИЗМЕНЕНИЕ: Обработчик событий убирается с 'document'
    document.removeEventListener('keydown', handleKeydown);
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

// ИЗМЕНЕНИЕ: Полностью переписанная функция для простого и корректного отображения
function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    const overlay = document.getElementById('game-over-overlay');
    gameBoard.innerHTML = ''; // Очищаем всё содержимое доски
    gameBoard.appendChild(overlay); // Возвращаем оверлей на место

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const tileValue = grid[r][c];
            const cell = document.createElement('div');
            
            if (tileValue === 0) {
                // Это пустая ячейка
                cell.className = 'w-full h-full bg-gray-300 rounded-md';
            } else {
                // Это ячейка с плиткой
                const colorClass = tileColors[tileValue] || 'bg-black text-white';
                cell.className = `tile w-full h-full flex items-center justify-center font-bold text-2xl md:text-4xl rounded-md ${colorClass}`;
                cell.textContent = tileValue;
            }
            gameBoard.appendChild(cell);
        }
    }
}


function handleKeydown(e) {
    // ИЗМЕНЕНИЕ: Убрана проверка и preventDefault для возврата к первоначальному поведению
    if (isGameOver) return;
    let moved = false;
    switch (e.key) {
        case 'ArrowUp': moved = moveUp(); break;
        case 'ArrowDown': moved = moveDown(); break;
        case 'ArrowLeft': moved = moveLeft(); break;
        case 'ArrowRight': moved = moveRight(); break;
        default: return;
    }
    if (moved) {
        addRandomTile();
        renderBoard();
        checkGameOver();
    }
}

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
        const overlay = document.getElementById('game-over-overlay');
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    }
}
