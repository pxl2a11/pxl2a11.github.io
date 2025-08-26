// --- Переменные состояния модуля ---
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
let highlightedCells = [];

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
        <style>
            /* --- Цветовая гамма для "Сапера" --- */
            .ms-cell {
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.1s ease;
                /* Светлая тема: закрытая ячейка */
                background-color: #cbd5e1; /* slate-300 */
                border-style: solid;
                border-width: 2px;
                border-color: #e2e8f0 #94a3b8 #94a3b8 #e2e8f0; /* slate-200, slate-400 */
                border-radius: 2px;
            }

            .dark .ms-cell {
                /* Темная тема: закрытая ячейка */
                background-color: #334155; /* slate-700 */
                border-color: #475569 #1e293b #1e293b #475569; /* slate-600, slate-800 */
            }

            /* **НОВЫЙ СТИЛЬ**: Для подсветки ячеек */
            .ms-cell-highlight {
                background-color: #e2e8f0; /* slate-200 */
                border-style: inset;
                border-color: #94a3b8;
            }
            .dark .ms-cell-highlight {
                background-color: #1e293b; /* slate-800 */
                border-color: #0f172a;
            }

            .ms-cell.revealed {
                /* Светлая тема: открытая ячейка */
                background-color: #f1f5f9; /* slate-100 */
                border: 1px solid #e2e8f0; /* slate-200 */
                cursor: default;
            }

            .dark .ms-cell.revealed {
                /* Темная тема: открытая ячейка */
                background-color: #273345;
                border: 1px solid #1e293b; /* slate-800 */
            }

            /* --- Стили для мин и флагов --- */
            .ms-cell.mine {
                color: #1f2937;
            }
            .dark .ms-cell.mine {
                color: #e2e8f0;
            }

            .ms-cell.mine-hit {
                background-color: #ef4444 !important;
                color: #1f2937;
            }

            .ms-cell.wrong-flag {
                position: relative;
            }
            .ms-cell.wrong-flag svg {
                visibility: hidden;
            }
            .ms-cell.wrong-flag::after {
                content: '\\00D7';
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5em;
                line-height: 1;
                color: #ef4444;
            }

            /* --- Палитра для цифр --- */
            .ms-c1 { color: #2563eb; } .ms-c2 { color: #16a34a; } .ms-c3 { color: #dc2626; }
            .ms-c4 { color: #0f172a; } .ms-c5 { color: #9a3412; } .ms-c6 { color: #0e7490; }
            .ms-c7 { color: #581c87; } .ms-c8 { color: #7f1d1d; }

            .dark .ms-c1 { color: #60a5fa; } .dark .ms-c2 { color: #4ade80; } .dark .ms-c3 { color: #f87171; }
            .dark .ms-c4 { color: #e2e8f0; } .dark .ms-c5 { color: #fb923c; } .dark .ms-c6 { color: #67e8f9; }
            .dark .ms-c7 { color: #d8b4fe; } .dark .ms-c8 { color: #fca5a5; }

            /* --- Кнопки выбора сложности --- */
            .ms-difficulty-btn {
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                border: 1px solid transparent;
                font-weight: 600;
                color: #4b5563;
                background-color: #e5e7eb;
                transition: all 0.2s;
            }
            .ms-difficulty-btn:hover {
                border-color: #3b82f6;
                background-color: #dbeafe;
                color: #1e40af;
            }
            .dark .ms-difficulty-btn {
                color: #d1d5db;
                background-color: #374151;
            }
            .dark .ms-difficulty-btn:hover {
                border-color: #60a5fa;
                background-color: #4b5563;
                color: #eff6ff;
            }
        </style>
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
    boardContainer.addEventListener('mousedown', handleMouseDown);
    boardContainer.addEventListener('mouseup', handleMouseUp);
    boardContainer.addEventListener('mouseleave', clearHighlights);
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

function handleMouseDown(e) {
    if (gameOver || e.button !== 0) return;

    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl) return;
    
    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed && cell.neighborMines > 0) {
        highlightNeighbors(row, col);
    }
}

function handleMouseUp(e) {
    // **ИСПРАВЛЕНИЕ**: Добавляем проверку на левую кнопку мыши
    if (e.button !== 0) {
        clearHighlights();
        return;
    }

    clearHighlights();

    if (gameOver) return;

    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl) return;
    
    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed && cell.neighborMines > 0) {
        performChord(row, col);
        return;
    }

    if (cell.isRevealed || cell.isFlagged) return;

    if (firstClick) {
        placeMines(row, col);
        calculateAllNeighbors();
        startTimer();
        firstClick = false;
    }

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
