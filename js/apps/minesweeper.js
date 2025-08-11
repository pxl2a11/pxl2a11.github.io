/**
 * Файл: /apps/minesweeper.js
 * Описание: Финальная, рабочая реализация с фиксированным размером ячеек и локальной прокруткой поля.
 */

// --- КОНСТАНТЫ И СОСТОЯНИЕ ---

const MINE_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full p-0.5 fill-current text-gray-800 dark:text-gray-200"><path d="M 60.375 6.53125 C 59.227574 6.53125 58.3125 7.4463238 58.3125 8.59375 L 58.3125 18.8125 C 50.001587 19.848917 42.388944 23.143974 36.09375 28.03125 L 28.84375 20.78125 C 28.032397 19.969897 26.748853 19.969897 25.9375 20.78125 L 20.78125 25.9375 C 19.969897 26.748853 19.969897 28.032397 20.78125 28.84375 L 28.03125 36.09375 C 23.143974 42.388944 19.848917 50.001587 18.8125 58.3125 L 8.59375 58.3125 C 7.4463238 58.3125 6.53125 59.227574 6.53125 60.375 L 6.53125 67.625 C 6.53125 68.772426 7.4463238 69.6875 8.59375 69.6875 L 18.8125 69.6875 C 19.849759 78.005162 23.134066 85.604772 28.03125 91.90625 L 20.78125 99.15625 C 19.969897 99.967603 19.969897 101.25115 20.78125 102.0625 L 25.9375 107.21875 C 26.748853 108.0301 28.032397 108.0301 28.84375 107.21875 L 36.09375 99.96875 C 42.395228 104.86593 49.994838 108.15024 58.3125 109.1875 L 58.3125 119.40625 C 58.3125 120.55368 59.227574 121.46875 60.375 121.46875 L 67.625 121.46875 C 68.772426 121.46875 69.6875 120.55368 69.6875 119.40625 L 69.6875 109.1875 C 77.998413 108.15108 85.611055 104.85603 91.90625 99.96875 L 99.15625 107.21875 C 99.967603 108.0301 101.25115 108.0301 102.0625 107.21875 L 107.21875 102.0625 C 108.0301 101.25115 108.0301 99.967603 107.21875 99.15625 L 99.96875 91.90625 C 104.85603 85.611055 108.15108 77.998413 109.1875 69.6875 L 119.40625 69.6875 C 120.55368 69.6875 121.46875 68.772426 121.46875 67.625 L 121.46875 60.375 C 121.46875 59.227574 120.55368 58.3125 119.40625 58.3125 L 109.1875 58.3125 C 108.15024 49.994838 104.86593 42.395228 99.96875 36.09375 L 107.21875 28.84375 C 108.0301 28.032397 108.0301 26.748853 107.21875 25.9375 L 102.0625 20.78125 C 101.25115 19.969897 99.967603 19.969897 99.15625 20.78125 L 91.90625 28.03125 C 85.604772 23.134066 78.005162 19.849759 69.6875 18.8125 L 69.6875 8.59375 C 69.6875 7.4463238 68.772426 6.53125 67.625 6.53125 L 60.375 6.53125 z"/></svg>`;
const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
};
const CELL_SIZE = 28; // Фиксированный размер ячейки, как в режиме "Эксперт"

let state = {};
const dom = {};

export function getHtml() {
    return `
        <div class="minesweeper-container bg-gray-200 dark:bg-gray-700 p-2 sm:p-4 rounded-lg shadow-inner flex flex-col items-center w-full">
            <div class="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center mb-4 p-2 bg-gray-300 dark:bg-gray-800 rounded-md w-full">
                <div id="mine-counter" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
                <div class="flex items-center gap-2 sm:gap-4">
                    <button id="restart-btn" class="text-3xl sm:text-4xl text-center hover:scale-110 transition-transform">😊</button>
                    <select id="difficulty-selector" class="p-2 h-12 text-base rounded-md bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="beginner">Новичок</option>
                        <option value="intermediate">Любитель</option>
                        <option value="expert">Эксперт</option>
                    </select>
                </div>
                <div id="timer" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
            </div>
            <!-- Обертка для корректной прокрутки -->
            <div class="w-full overflow-x-auto">
                <div id="minesweeper-board" class="select-none" style="display: grid; width: max-content;"></div>
            </div>
        </div>
    `;
}

export function init() {
    Object.assign(dom, {
        board: document.getElementById('minesweeper-board'),
        mineCounter: document.getElementById('mine-counter'),
        timer: document.getElementById('timer'),
        restartButton: document.getElementById('restart-btn'),
        difficultySelector: document.getElementById('difficulty-selector'),
    });

    const restartGame = () => startGame(dom.difficultySelector.value);

    dom.board.addEventListener('click', handleLeftClick);
    dom.board.addEventListener('contextmenu', handleRightClick);
    dom.board.addEventListener('mousedown', (e) => { if (!state.isGameOver && e.button === 0) dom.restartButton.textContent = '😮'; });
    dom.board.addEventListener('mouseup', () => { if (!state.isGameOver) dom.restartButton.textContent = '😊'; });
    
    dom.restartButton.addEventListener('click', restartGame);
    dom.difficultySelector.addEventListener('change', restartGame);

    restartGame();
}

export function cleanup() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function startGame(difficultyKey) {
    cleanup();
    const settings = DIFFICULTIES[difficultyKey];
    state = { ...settings, board: [], mineLocations: [], revealedCount: 0, flagsPlaced: 0, isGameOver: false, isFirstClick: true, timerInterval: null, timeElapsed: 0 };

    dom.timer.textContent = '000';
    dom.restartButton.textContent = '😊';
    updateMineCounter();
    createBoard();
}

function createBoard() {
    dom.board.innerHTML = '';
    dom.board.style.gridTemplateColumns = `repeat(${state.cols}, ${CELL_SIZE}px)`;
    dom.board.style.gap = '2px';

    for (let r = 0; r < state.rows; r++) {
        state.board[r] = [];
        for (let c = 0; c < state.cols; c++) {
            state.board[r][c] = { isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0 };
            const cell = document.createElement('div');
            cell.className = "flex items-center justify-center font-bold text-lg bg-gray-400 dark:bg-gray-600 rounded-sm shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4),inset_-1px_-1px_1px_rgba(0,0,0,0.4)]";
            cell.style.width = `${CELL_SIZE}px`;
            cell.style.height = `${CELL_SIZE}px`;
            cell.dataset.row = r;
            cell.dataset.col = c;
            dom.board.appendChild(cell);
        }
    }
}

function placeMines(initialRow, initialCol) {
    let minesToPlace = state.minesCount;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * state.rows);
        const c = Math.floor(Math.random() * state.cols);
        if ((r === initialRow && c === initialCol) || state.board[r][c].isMine) continue;
        state.board[r][c].isMine = true;
        state.mineLocations.push({ r, c });
        minesToPlace--;
    }
    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            if (!state.board[r][c].isMine) state.board[r][c].neighborCount = countNeighborMines(r, c);
        }
    }
}

function handleLeftClick(event) {
    const cellElement = event.target.closest('[data-row]');
    if (!cellElement || state.isGameOver) return;
    const row = parseInt(cellElement.dataset.row), col = parseInt(cellElement.dataset.col);
    const cellData = state.board[row][col];
    if (cellData.isFlagged) return;

    if (state.isFirstClick) {
        placeMines(row, col);
        startTimer();
        state.isFirstClick = false;
    }
    if (cellData.isRevealed) {
        if (cellData.neighborCount > 0) handleChord(row, col);
    } else if (cellData.isMine) {
        endGame(false);
        revealMine(cellElement, true);
    } else {
        revealCell(row, col);
    }
    checkWinCondition();
}

function handleRightClick(event) {
    event.preventDefault();
    const cellElement = event.target.closest('[data-row]');
    if (!cellElement || state.isGameOver) return;
    const row = parseInt(cellElement.dataset.row), col = parseInt(cellElement.dataset.col);
    const cellData = state.board[row][col];
    if (cellData.isRevealed) return;

    if (state.isFirstClick) startTimer();
    
    cellData.isFlagged = !cellData.isFlagged;
    cellElement.innerHTML = cellData.isFlagged ? '🚩' : '';
    state.flagsPlaced += cellData.isFlagged ? 1 : -1;
    updateMineCounter();
}

function revealCell(row, col) {
    if (row < 0 || row >= state.rows || col < 0 || col >= state.cols) return;
    const cellData = state.board[row][col];
    if (cellData.isRevealed || cellData.isFlagged) return;

    cellData.isRevealed = true;
    state.revealedCount++;
    const cellElement = dom.board.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.className = "flex items-center justify-center font-bold text-lg bg-gray-300 dark:bg-gray-500 rounded-sm border-gray-400/50 border";
    cellElement.style.width = `${CELL_SIZE}px`; cellElement.style.height = `${CELL_SIZE}px`;

    if (cellData.neighborCount > 0) {
        cellElement.textContent = cellData.neighborCount;
        cellElement.classList.add(`c${cellData.neighborCount}`);
    } else {
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (i !== 0 || j !== 0) revealCell(row + i, col + j);
    }
}

function handleChord(row, col) {
    let flaggedNeighbors = 0;
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i, c = col + j;
            if (r >= 0 && r < state.rows && c >= 0 && c < state.cols) {
                neighbors.push({ r, c });
                if (state.board[r][c].isFlagged) flaggedNeighbors++;
            }
        }
    }
    if (flaggedNeighbors === state.board[row][col].neighborCount) {
        for (const n of neighbors) {
            if (!state.board[n.r][n.c].isRevealed && !state.board[n.r][n.c].isFlagged) {
                if (state.board[n.r][n.c].isMine) {
                    endGame(false);
                    revealMine(dom.board.querySelector(`[data-row='${n.r}'][data-col='${n.c}']`), true);
                    return;
                }
                revealCell(n.r, n.c);
            }
        }
    }
}

function endGame(isWin) {
    state.isGameOver = true;
    cleanup();
    dom.restartButton.textContent = isWin ? '😎' : '😵';
    if (isWin) {
        dom.mineCounter.textContent = 'ПОБЕДА!';
    } else {
        state.mineLocations.forEach(loc => {
            const cell = dom.board.querySelector(`[data-row='${loc.r}'][data-col='${loc.c}']`);
            if (!state.board[loc.r][loc.c].isFlagged) revealMine(cell, false);
        });
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (state.board[r][c].isFlagged && !state.board[r][c].isMine) {
                    dom.board.querySelector(`[data-row='${r}'][data-col='${c}']`).innerHTML = '❌';
                }
            }
        }
    }
}

function revealMine(cellElement, isTrigger) {
    cellElement.innerHTML = MINE_SVG_ICON;
    cellElement.className = `flex items-center justify-center rounded-sm ${isTrigger ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-500'}`;
    cellElement.style.width = `${CELL_SIZE}px`; cellElement.style.height = `${CELL_SIZE}px`;
}

function checkWinCondition() {
    if (!state.isGameOver && (state.rows * state.cols - state.revealedCount) === state.minesCount) {
        endGame(true);
    }
}

function updateMineCounter() {
    const remaining = state.minesCount - state.flagsPlaced;
    dom.mineCounter.textContent = String(remaining).padStart(3, '0');
}

function startTimer() {
    cleanup();
    state.timerInterval = setInterval(() => {
        state.timeElapsed++;
        if (state.timeElapsed <= 999) dom.timer.textContent = String(state.timeElapsed).padStart(3, '0');
    }, 1000);
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i, c = col + j;
            if (r >= 0 && r < state.rows && c >= 0 && c < state.cols && state.board[r][c].isMine) count++;
        }
    }
    return count;
}
