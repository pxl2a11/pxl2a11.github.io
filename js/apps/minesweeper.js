// ---6 Переменные состояния модуля ---
// Устанавливаем сложность по умолчанию
let rows = 9, cols = 9, mineCount = 10;
let board = []; // 2D массив объектов ячеек
let mineLocations = [];
let flagsPlaced = 0;
let cellsRevealed = 0;
let gameOver = false;
let firstClick = true;
let timerInterval;
let startTime;
let highlightedCells = []; // **НОВОЕ**: Хранит ячейки для подсветки

// SVG иконка для мины
const mineSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full p-1" fill="currentColor">
    <path d="M 60.375 6.53125 C 59.227574 6.53125 58.3125 7.4463238 58.3125 8.59375 L 58.3125 18.8125 C 50.001587 19.848917 42.388944 23.143974 36.09375 28.03125 L 28.84375 20.78125 C 28.032397 19.969897 26.748853 19.969897 25.9375 20.78125 L 20.78125 25.9375 C 19.969897 26.748853 19.969897 28.032397 20.78125 28.84375 L 28.03125 36.09375 C 23.143974 42.388944 19.848917 50.001587 18.8125 58.3125 L 8.59375 58.3125 C 7.4463238 58.3125 6.53125 59.227574 6.53125 60.375 L 6.53125 67.625 C 6.53125 68.772426 7.4463238 69.6875 8.59375 69.6875 L 18.8125 69.6875 C 19.849759 78.005162 23.134066 85.604772 28.03125 91.90625 L 20.78125 99.15625 C 19.969897 99.967603 19.969897 101.25115 20.78125 102.0625 L 25.9375 107.21875 C 26.748853 108.0301 28.032397 108.0301 28.84375 107.21875 L 36.09375 99.96875 C 42.395228 104.86593 49.994838 108.15024 58.3125 109.1875 L 58.3125 119.40625 C 58.3125 120.55368 59.227574 121.46875 60.375 121.46875 L 67.625 121.46875 C 68.772426 121.46875 69.6875 120.55368 69.6875 119.40625 L 69.6875 109.1875 C 77.998413 108.15108 85.611055 104.85603 91.90625 99.96875 L 99.15625 107.21875 C 99.967603 108.0301 101.25115 108.0301 102.0625 107.21875 L 107.21875 102.0625 C 108.0301 101.25115 108.0301 99.967603 107.21875 99.15625 L 99.96875 91.90625 C 104.85603 85.611055 108.15108 77.998413 109.1875 69.6875 L 119.40625 69.6875 C 120.55368 69.6875 121.46875 68.772426 121.46875 67.625 L 121.46875 60.375 C 121.46875 59.227574 120.55368 58.3125 119.40625 58.3125 L 109.1875 58.3125 C 108.15024 49.994838 104.86593 42.395228 99.96875 36.09375 L 107.21875 28.84375 C 108.0301 28.032397 108.0301 26.748853 107.21875 25.9375 L 102.0625 20.78125 C 101.25115 19.969897 99.967603 19.969897 99.15625 20.78125 L 91.90625 28.03125 C 85.604772 23.134066 78.005162 19.849759 69.6875 18.8125 L 69.6875 8.59375 C 69.6875 7.4463238 68.772426 6.53125 67.625 6.53125 L 60.375 6.53125 z "/>
</svg>
`;

const flagSvg = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="w-full h-full p-1">
    <path d="M26.2 61.5c0 1.4-4.3 2.5-9.7 2.5c-5.4 0-9.7-1.1-9.7-2.5s4.3-2.5 9.7-2.5c5.3 0 9.7 1.2 9.7 2.5" fill="#ccc"></path>
    <path d="M56.1 17.7C54.2 16.8 23 2.1 18.4 0v39.5c4.5-2.1 35.7-16.8 37.6-17.7c1.6-.7 1.6-3.4.1-4.1" fill="#ed4c5c"></path>
    <path fill="#d3976e" d="M14.5 0h3.9v61.5h-3.9z"></path>
</svg>
`;

// --- DOM-элементы ---
let boardContainer, flagsCountEl, timerEl, statusEl;

export function getHtml() {
    return `
        <div class="space-y-4">
            <div class="max-w-2xl mx-auto">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                     <div class="flex justify-center gap-2 sm:gap-4 flex-wrap">
                        <button class="ms-difficulty-btn" data-rows="9" data-cols="9" data-mines="10">Легко</button>
                        <button class="ms-difficulty-btn" data-rows="16" data-cols="16" data-mines="40">Средне</button>
                        <button class="ms-difficulty-btn" data-rows="16" data-cols="30" data-mines="99">Сложно</button>
                    </div>
                </div>
                <div class="flex justify-between items-center p-3 mt-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                    <div class="flex items-center gap-2 text-red-500">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                        <span id="ms-flags-count" class="font-mono text-xl font-bold w-12 text-center">0</span>
                    </div>
                    <button id="ms-status-indicator" class="font-bold text-3xl transform hover:scale-110 transition-transform">🙂</button>
                    <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span id="ms-timer" class="font-mono text-xl font-bold w-12 text-center">0</span>
                    </div>
                </div>
            </div>
            <div id="minesweeper-board-container" class="flex justify-center p-2 bg-gray-400 dark:bg-gray-700 rounded-lg shadow-inner">
                 <div id="minesweeper-board" class="grid" style="user-select: none;"></div>
            </div>
        </div>
    `;
}

export function init() {
    boardContainer = document.getElementById('minesweeper-board');
    flagsCountEl = document.getElementById('ms-flags-count');
    timerEl = document.getElementById('ms-timer');
    statusEl = document.getElementById('ms-status-indicator');

    statusEl.addEventListener('click', startGame);
    // **ИЗМЕНЕНО**: Заменяем 'click' на 'mousedown' и 'mouseup' для новой логики
    boardContainer.addEventListener('mousedown', handleMouseDown);
    boardContainer.addEventListener('mouseup', handleMouseUp);
    boardContainer.addEventListener('mouseleave', clearHighlights); // Убираем подсветку, если мышь ушла с поля
    boardContainer.addEventListener('contextmenu', handleRightClick);

    document.querySelectorAll('.ms-difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { rows: newRows, cols: newCols, mines: newMines } = e.target.closest('button').dataset;
            rows = parseInt(newRows);
            cols = parseInt(newCols);
            mineCount = parseInt(newMines);
            startGame();
        });
    });

    startGame();
}

export function cleanup() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function startGame() {
    gameOver = false;
    firstClick = true;
    flagsPlaced = 0;
    cellsRevealed = 0;
    board = [];
    mineLocations = [];

    clearInterval(timerInterval);
    timerInterval = null;
    timerEl.textContent = '0';
    statusEl.textContent = '🙂';

    updateFlagsCount();
    createBoardDOM();
}

function createBoardDOM() {
    boardContainer.innerHTML = '';
    boardContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const cellSize = 26; 

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            const cellEl = document.createElement('div');
            cellEl.dataset.row = r;
            cellEl.dataset.col = c;
            cellEl.className = 'ms-cell';
            cellEl.style.width = `${cellSize}px`;
            cellEl.style.height = `${cellSize}px`;
            cellEl.style.fontSize = `${Math.max(12, cellSize * 0.6)}px`;

            boardContainer.appendChild(cellEl);
            board[r][c] = {
                isMine: false, isRevealed: false, isFlagged: false,
                neighborMines: 0, element: cellEl,
            };
        }
    }
}

// **НОВАЯ ФУНКЦИЯ**: Обрабатывает нажатие кнопки мыши для подсветки
function handleMouseDown(e) {
    if (gameOver || e.button !== 0) return; // Только левая кнопка

    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl) return;
    
    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed && cell.neighborMines > 0) {
        highlightNeighbors(row, col);
    }
}

// **НОВАЯ ФУНКЦИЯ**: Обрабатывает отпускание кнопки мыши для выполнения действия
function handleMouseUp(e) {
    // Всегда убираем подсветку после действия
    clearHighlights();

    if (gameOver) return;

    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl) return;
    
    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    // Логика аккорда
    if (cell.isRevealed && cell.neighborMines > 0) {
        performChord(row, col);
        return;
    }

    if (cell.isRevealed || cell.isFlagged) return;

    // Логика первого клика
    if (firstClick) {
        placeMines(row, col);
        calculateAllNeighbors();
        startTimer();
        firstClick = false;
    }

    // Открытие ячейки
    if (cell.isMine) {
        cell.element.classList.add('mine-hit');
        endGame(false);
        return;
    }

    revealCell(row, col);
    checkWinCondition();
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    
    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl || cellEl.classList.contains('revealed')) return;

    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    toggleFlag(board[row][col]);
}

function toggleFlag(cell) {
    if (!cell.isRevealed) {
        if (!cell.isFlagged && flagsPlaced < mineCount) {
            cell.isFlagged = true;
            cell.element.innerHTML = flagSvg; 
            flagsPlaced++;
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.element.innerHTML = '';
            flagsPlaced--;
        }
        updateFlagsCount();
    }
}

function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    cellsRevealed++;

    if (cell.isMine) {
        cell.element.classList.add('mine-hit');
        endGame(false);
        return;
    }

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.classList.add(`ms-c${cell.neighborMines}`);
    } else {
        for (let rOffset = -1; rOffset <= 1; rOffset++) {
            for (let cOffset = -1; cOffset <= 1; cOffset++) {
                if (rOffset === 0 && cOffset === 0) continue;
                revealCell(row + rOffset, col + cOffset);
            }
        }
    }
}

// **НОВАЯ ФУНКЦИЯ**: Подсвечивает соседние ячейки
function highlightNeighbors(row, col) {
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
        for (let cOffset = -1; cOffset <= 1; cOffset++) {
            const newR = row + rOffset;
            const newC = col + cOffset;
            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
                const neighbor = board[newR][newC];
                if (!neighbor.isRevealed && !neighbor.isFlagged) {
                    neighbor.element.classList.add('ms-cell-highlight');
                    highlightedCells.push(neighbor);
                }
            }
        }
    }
}

// **НОВАЯ ФУНКЦИЯ**: Убирает всю подсветку
function clearHighlights() {
    for (const cell of highlightedCells) {
        cell.element.classList.remove('ms-cell-highlight');
    }
    highlightedCells = [];
}

function performChord(row, col) {
    const cell = board[row][col];
    let flaggedNeighbors = 0;
    
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
        for (let cOffset = -1; cOffset <= 1; cOffset++) {
            const newR = row + rOffset;
            const newC = col + cOffset;
            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && board[newR][newC].isFlagged) {
                flaggedNeighbors++;
            }
        }
    }

    if (flaggedNeighbors === cell.neighborMines) {
        for (let rOffset = -1; rOffset <= 1; rOffset++) {
            for (let cOffset = -1; cOffset <= 1; cOffset++) {
                if (rOffset === 0 && cOffset === 0) continue;
                const newR = row + rOffset;
                const newC = col + cOffset;
                if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
                    const neighbor = board[newR][newC];
                    if (!neighbor.isRevealed && !neighbor.isFlagged) {
                        revealCell(newR, newC);
                    }
                }
            }
        }
        checkWinCondition();
    }
}

function checkWinCondition() {
    if (!gameOver && cellsRevealed === rows * cols - mineCount) {
        endGame(true);
    }
}

function endGame(isWin) {
    gameOver = true;
    clearInterval(timerInterval);
    timerInterval = null;
    statusEl.textContent = isWin ? '😎' : '😵';

    for (const loc of mineLocations) {
        const cell = board[loc.row][loc.col];
        if (!cell.isRevealed && !cell.isFlagged) {
            cell.element.classList.add('revealed', 'mine');
            cell.element.innerHTML = mineSvg;
        }
    }

    if (!isWin) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                if (cell.isFlagged && !cell.isMine) {
                    cell.element.classList.add('wrong-flag');
                }
            }
        }
    } else {
         for (const loc of mineLocations) {
            const cell = board[loc.row][loc.col];
            if (!cell.isFlagged) {
                cell.isFlagged = true;
                cell.element.innerHTML = flagSvg;
            }
        }
        updateFlagsCount();
    }
}

function placeMines(initialRow, initialCol) {
    let minesToPlace = mineCount;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        if ((r === initialRow && c === initialCol) || board[r][c].isMine) {
            continue;
        }

        board[r][c].isMine = true;
        mineLocations.push({ row: r, col: c });
        minesToPlace--;
    }
}

function calculateAllNeighbors() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].isMine) continue;
            let count = 0;
            for (let rOffset = -1; rOffset <= 1; rOffset++) {
                for (let cOffset = -1; cOffset <= 1; cOffset++) {
                    const newR = r + rOffset;
                    const newC = c + cOffset;
                    if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && board[newR][newC].isMine) {
                        count++;
                    }
                }
            }
            board[r][c].neighborMines = count;
        }
    }
}

function updateFlagsCount() {
    flagsCountEl.textContent = Math.max(0, mineCount - flagsPlaced);
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        if (!gameOver) {
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            timerEl.textContent = seconds;
        }
    }, 1000);
}
