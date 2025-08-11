/**
 * Файл: minesweeper.js
 * Описание: Реализация игры "Сапер" с уровнями сложности, таймером и функцией "аккорда".
 */

// --- НАСТРОЙКИ СЛОЖНОСТИ ---
const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 30, cols: 16, mines: 99 },
};

let rows, cols, minesCount;
let board = []; // { isMine, isRevealed, isFlagged, neighbors }
let mineLocations = [];
let revealedCount = 0;
let flagsPlaced = 0;
let isGameOver = false;
let isFirstClick = true;
let timerInterval;
let timeElapsed = 0;

// --- ЭЛЕМЕНТЫ DOM ---
const gameContainer = document.getElementById('game-container'); // Убедитесь, что у вас есть <div id="game-container"></div> в HTML
const timerElement = document.getElementById('timer');
const mineCounterElement = document.getElementById('mine-counter');
const restartButton = document.getElementById('restart-btn');
const difficultySelector = document.getElementById('difficulty-selector');

/**
 * Инициализация игры
 * @param {string} difficulty - Название уровня сложности ('beginner', 'intermediate', 'expert')
 */
function init(difficulty = 'beginner') {
    const settings = DIFFICULTIES[difficulty];
    rows = settings.rows;
    cols = settings.cols;
    minesCount = settings.mines;

    resetGame();
    createBoard();
    updateMineCounter();
}

/**
 * Сброс всех игровых переменных в начальное состояние
 */
function resetGame() {
    isGameOver = false;
    isFirstClick = true;
    revealedCount = 0;
    flagsPlaced = 0;
    timeElapsed = 0;
    board = [];
    mineLocations = [];

    // Сброс таймера
    clearInterval(timerInterval);
    timerInterval = null;
    timerElement.textContent = '000';

    // Сброс кнопки перезапуска
    restartButton.textContent = '😊';
}

/**
 * Создание и отрисовка игрового поля в DOM
 */
function createBoard() {
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0,
            };

            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Обработчики событий
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('mousedown', () => {
                if (!isGameOver) restartButton.textContent = '😮';
            });
            cell.addEventListener('mouseup', () => {
                if (!isGameOver) restartButton.textContent = '😊';
            });

            gameContainer.appendChild(cell);
        }
    }
}

/**
 * Расстановка мин на поле после первого клика
 * @param {number} initialRow - Ряд, по которому кликнули
 * @param {number} initialCol - Колонка, по которой кликнули
 */
function placeMines(initialRow, initialCol) {
    let minesToPlace = minesCount;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        // Не ставим мину на первый клик и если она там уже есть
        if ((r === initialRow && c === initialCol) || board[r][c].isMine) {
            continue;
        }

        board[r][c].isMine = true;
        mineLocations.push({ r, c });
        minesToPlace--;
    }

    // Рассчитываем количество соседей-мин для каждой ячейки
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborCount = countNeighborMines(r, c);
            }
        }
    }
}

/**
 * Подсчет мин вокруг ячейки
 * @param {number} row
 * @param {number} col
 * @returns {number} Количество мин
 */
function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].isMine) {
                count++;
            }
        }
    }
    return count;
}


/**
 * Обработчик клика по ячейке
 * @param {MouseEvent} event
 */
function handleCellClick(event) {
    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (isGameOver || cellData.isFlagged) return;

    // Первый клик
    if (isFirstClick) {
        placeMines(row, col);
        startTimer();
        isFirstClick = false;
    }
    
    // Если ячейка уже открыта, пробуем "аккорд"
    if (cellData.isRevealed && cellData.neighborCount > 0) {
        handleChord(row, col);
        return;
    }

    if (cellData.isMine) {
        endGame(false); // Проигрыш
        return;
    }

    revealCell(row, col);
    checkWinCondition();
}

/**
 * Обработчик правого клика (установка флага)
 * @param {MouseEvent} event
 */
function handleRightClick(event) {
    event.preventDefault();
    if (isGameOver) return;

    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (cellData.isRevealed) return;
    
    if (!isFirstClick && !timerInterval) {
        startTimer();
    }

    cellData.isFlagged = !cellData.isFlagged;
    cellElement.classList.toggle('flagged', cellData.isFlagged);
    cellElement.textContent = cellData.isFlagged ? '🚩' : '';

    flagsPlaced += cellData.isFlagged ? 1 : -1;
    updateMineCounter();
}

/**
 * Открытие ячейки
 * @param {number} row
 * @param {number} col
 */
function revealCell(row, col) {
    const cellData = board[row][col];
    if (row < 0 || row >= rows || col < 0 || col >= cols || cellData.isRevealed || cellData.isFlagged) {
        return;
    }

    cellData.isRevealed = true;
    revealedCount++;
    const cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.classList.add('revealed');

    if (cellData.neighborCount > 0) {
        cellElement.textContent = cellData.neighborCount;
        cellElement.classList.add(`c${cellData.neighborCount}`);
    } else {
        // Рекурсивно открываем соседей, если ячейка пустая
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                revealCell(row + i, col + j);
            }
        }
    }
}

/**
 * Реализация "аккорда"
 * @param {number} row
 * @param {number} col
 */
function handleChord(row, col) {
    let flaggedNeighbors = 0;
    const neighbors = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                neighbors.push({r, c});
                if (board[r][c].isFlagged) {
                    flaggedNeighbors++;
                }
            }
        }
    }
    
    // Если количество флагов совпадает с цифрой, открываем остальных соседей
    if (flaggedNeighbors === board[row][col].neighborCount) {
        neighbors.forEach(n => {
            const neighborData = board[n.r][n.c];
            if (!neighborData.isRevealed && !neighborData.isFlagged) {
                 if (neighborData.isMine) {
                    endGame(false);
                    return;
                }
                revealCell(n.r, n.c);
            }
        });
        checkWinCondition();
    }
}

/**
 * Обновление счетчика мин
 */
function updateMineCounter() {
    const remaining = minesCount - flagsPlaced;
    mineCounterElement.textContent = String(remaining).padStart(3, '0');
}

/**
 * Логика завершения игры
 * @param {boolean} isWin - true, если игрок выиграл
 */
function endGame(isWin) {
    isGameOver = true;
    clearInterval(timerInterval);
    timerInterval = null;

    if (isWin) {
        restartButton.textContent = '😎';
        // Можно добавить дополнительную логику для победы
    } else {
        restartButton.textContent = '😵';
        // Показываем все мины
        mineLocations.forEach(loc => {
            const cellElement = document.querySelector(`[data-row='${loc.r}'][data-col='${loc.c}']`);
            if (!board[loc.r][loc.c].isFlagged) {
                cellElement.classList.add('mine');
                cellElement.textContent = '💣';
            }
        });
        // Показываем неверно поставленные флаги
         for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isFlagged && !board[r][c].isMine) {
                    const cellElement = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
                    cellElement.classList.add('mine-wrong');
                }
            }
         }
    }
}

/**
 * Проверка условия победы
 */
function checkWinCondition() {
    if (!isGameOver && (rows * cols - revealedCount) === minesCount) {
        endGame(true);
    }
}

// --- Таймер ---
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = String(timeElapsed).padStart(3, '0');
    }, 1000);
}

// --- Привязка событий к элементам управления ---
restartButton.addEventListener('click', () => init(difficultySelector.value));
difficultySelector.addEventListener('change', (e) => init(e.target.value));


// --- Первый запуск ---
document.addEventListener('DOMContentLoaded', () => {
    init('beginner');
});
