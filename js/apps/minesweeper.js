/**
 * 53Файл: /apps/minesweeper.js
 * Описание: Улучшенная реализация игры "Сапер" для проекта Mini Apps.
 * Изменения: Адаптивное поле, поэтапный запуск (выбор сложности -> игра), кастомная иконка мины.
 */

// --- КОНСТАНТЫ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---

// Новая иконка для мины в формате SVG
const MINE_SVG_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full p-0.5 fill-current text-gray-800 dark:text-gray-200">
    <path d="M 60.375 6.53125 C 59.227574 6.53125 58.3125 7.4463238 58.3125 8.59375 L 58.3125 18.8125 C 50.001587 19.848917 42.388944 23.143974 36.09375 28.03125 L 28.84375 20.78125 C 28.032397 19.969897 26.748853 19.969897 25.9375 20.78125 L 20.78125 25.9375 C 19.969897 26.748853 19.969897 28.032397 20.78125 28.84375 L 28.03125 36.09375 C 23.143974 42.388944 19.848917 50.001587 18.8125 58.3125 L 8.59375 58.3125 C 7.4463238 58.3125 6.53125 59.227574 6.53125 60.375 L 6.53125 67.625 C 6.53125 68.772426 7.4463238 69.6875 8.59375 69.6875 L 18.8125 69.6875 C 19.849759 78.005162 23.134066 85.604772 28.03125 91.90625 L 20.78125 99.15625 C 19.969897 99.967603 19.969897 101.25115 20.78125 102.0625 L 25.9375 107.21875 C 26.748853 108.0301 28.032397 108.0301 28.84375 107.21875 L 36.09375 99.96875 C 42.395228 104.86593 49.994838 108.15024 58.3125 109.1875 L 58.3125 119.40625 C 58.3125 120.55368 59.227574 121.46875 60.375 121.46875 L 67.625 121.46875 C 68.772426 121.46875 69.6875 120.55368 69.6875 119.40625 L 69.6875 109.1875 C 77.998413 108.15108 85.611055 104.85603 91.90625 99.96875 L 99.15625 107.21875 C 99.967603 108.0301 101.25115 108.0301 102.0625 107.21875 L 107.21875 102.0625 C 108.0301 101.25115 108.0301 99.967603 107.21875 99.15625 L 99.96875 91.90625 C 104.85603 85.611055 108.15108 77.998413 109.1875 69.6875 L 119.40625 69.6875 C 120.55368 69.6875 121.46875 68.772426 121.46875 67.625 L 121.46875 60.375 C 121.46875 59.227574 120.55368 58.3125 119.40625 58.3125 L 109.1875 58.3125 C 108.15024 49.994838 104.86593 42.395228 99.96875 36.09375 L 107.21875 28.84375 C 108.0301 28.032397 108.0301 26.748853 107.21875 25.9375 L 102.0625 20.78125 C 101.25115 19.969897 99.967603 19.969897 99.15625 20.78125 L 91.90625 28.03125 C 85.604772 23.134066 78.005162 19.849759 69.6875 18.8125 L 69.6875 8.59375 C 69.6875 7.4463238 68.772426 6.53125 67.625 6.53125 L 60.375 6.53125 z"/>
</svg>`;

const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
};

let rows, cols, minesCount;
let board = [], mineLocations = [];
let revealedCount = 0, flagsPlaced = 0;
let isGameOver = false, isFirstClick = true;
let timerInterval = null, timeElapsed = 0;

// Ссылки на DOM-элементы
let gameBoardElement, mineCounterElement, timerElement, restartButton;
let difficultySelectionScreen, mainGameScreen;


/**
 * Возвращает HTML-структуру для игры.
 */
export function getHtml() {
    return `
        <div class="minesweeper-container bg-gray-200 dark:bg-gray-700 p-2 sm:p-4 rounded-lg shadow-inner flex flex-col items-center">
            
            <!-- Экран выбора сложности (виден сначала) -->
            <div id="difficulty-selection-screen" class="w-full text-center">
                <h3 class="text-xl font-bold mb-4">Выберите уровень сложности</h3>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button data-difficulty="beginner" class="difficulty-btn w-full sm:w-auto text-lg font-semibold py-3 px-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all">
                        Новичок <span class="block text-sm font-normal opacity-80">9x9, 10 мин</span>
                    </button>
                    <button data-difficulty="intermediate" class="difficulty-btn w-full sm:w-auto text-lg font-semibold py-3 px-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all">
                        Любитель <span class="block text-sm font-normal opacity-80">16x16, 40 мин</span>
                    </button>
                    <button data-difficulty="expert" class="difficulty-btn w-full sm:w-auto text-lg font-semibold py-3 px-6 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all">
                        Эксперт <span class="block text-sm font-normal opacity-80">16x30, 99 мин</span>
                    </button>
                </div>
            </div>

            <!-- Основной экран игры (скрыт сначала) -->
            <div id="main-game-screen" class="w-full hidden">
                 <!-- Панель управления -->
                <div class="grid grid-cols-3 gap-2 sm:gap-4 items-center mb-4 p-2 bg-gray-300 dark:bg-gray-800 rounded-md max-w-md mx-auto">
                    <div id="mine-counter" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
                    <button id="restart-btn" class="text-3xl sm:text-4xl text-center hover:scale-110 transition-transform">😊</button>
                    <div id="timer" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
                </div>

                <!-- Адаптивное игровое поле -->
                <div id="minesweeper-board" class="mx-auto w-full max-w-full select-none">
                    <!-- Ячейки будут сгенерированы здесь -->
                </div>
            </div>
        </div>
    `;
}

/**
 * Инициализирует игру, находит элементы и вешает обработчики.
 */
export function init() {
    // Находим основные экраны
    difficultySelectionScreen = document.getElementById('difficulty-selection-screen');
    mainGameScreen = document.getElementById('main-game-screen');

    // Находим элементы управления игрой
    gameBoardElement = document.getElementById('minesweeper-board');
    mineCounterElement = document.getElementById('mine-counter');
    timerElement = document.getElementById('timer');
    restartButton = document.getElementById('restart-btn');
    
    // Обработчик для кнопок выбора сложности
    difficultySelectionScreen.addEventListener('click', (e) => {
        const button = e.target.closest('.difficulty-btn');
        if (!button) return;

        const difficulty = button.dataset.difficulty;
        
        // Переключаем экраны
        difficultySelectionScreen.classList.add('hidden');
        mainGameScreen.classList.remove('hidden');
        
        // Начинаем игру с выбранной сложностью
        startGame(difficulty);
    });

    // Обработчики для уже игрового процесса
    restartButton.addEventListener('click', () => {
        // При рестарте возвращаемся к выбору сложности
        mainGameScreen.classList.add('hidden');
        difficultySelectionScreen.classList.remove('hidden');
        cleanup(); // Сбрасываем таймер
    });
    
    gameBoardElement.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * Очищает ресурсы (таймеры) при уходе со страницы или рестарте.
 */
export function cleanup() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}


// --- ВНУТРЕННЯЯ ЛОГИКА ИГРЫ ---

/**
 * Начинает или перезапускает игру с выбранной сложностью.
 * @param {string} difficultyKey - Ключ сложности ('beginner', 'intermediate', 'expert')
 */
function startGame(difficultyKey) {
    const settings = DIFFICULTIES[difficultyKey];
    rows = settings.rows;
    cols = settings.cols;
    minesCount = settings.mines;

    isGameOver = false;
    isFirstClick = true;
    revealedCount = 0;
    flagsPlaced = 0;
    timeElapsed = 0;
    board = [];
    mineLocations = [];

    cleanup();
    timerElement.textContent = String(timeElapsed).padStart(3, '0');
    
    restartButton.textContent = '😊';
    updateMineCounter();
    createBoard();
}

/**
 * Создает АДАПТИВНОЕ игровое поле в DOM.
 */
function createBoard() {
    gameBoardElement.innerHTML = '';
    gameBoardElement.style.display = 'grid';
    gameBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    // Убираем фиксированную ширину, поле станет 100% ширины родителя.
    
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = { isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0 };

            const cell = document.createElement('div');
            // Используем aspect-square для сохранения пропорций ячеек при изменении размера поля
            cell.className = "aspect-square w-full flex items-center justify-center font-bold text-base sm:text-lg bg-gray-400 dark:bg-gray-600 rounded-sm shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4),inset_-1px_-1px_1px_rgba(0,0,0,0.4)] transition-all duration-100";
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('mousedown', (e) => {
                if (!isGameOver && e.button === 0) restartButton.textContent = '😮';
            });
            cell.addEventListener('mouseup', () => {
                if (!isGameOver) restartButton.textContent = '😊';
            });
            cell.addEventListener('mouseleave', () => {
                if (!isGameOver) restartButton.textContent = '😊';
            });

            gameBoardElement.appendChild(cell);
        }
    }
}


/**
 * Обработчик левого клика по ячейке.
 * @param {MouseEvent} event
 */
function handleCellClick(event) {
    const cellElement = event.target.closest('div[data-row]');
    if (!cellElement) return;

    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (isGameOver || cellData.isFlagged) return;

    if (isFirstClick) {
        placeMines(row, col);
        startTimer();
        isFirstClick = false;
    }

    if (cellData.isRevealed && cellData.neighborCount > 0) {
        handleChord(row, col);
        return;
    }

    if (cellData.isMine) {
        endGame(false);
        revealMine(cellElement, true);
        return;
    }
    
    revealCell(row, col);
    checkWinCondition();
}


/**
 * Обработчик правого клика (установка флага).
 * @param {MouseEvent} event
 */
function handleRightClick(event) {
    event.preventDefault();
    if (isGameOver) return;
    
    const cellElement = event.target.closest('div[data-row]');
    if (!cellElement) return;

    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (cellData.isRevealed) return;
    
    if (isFirstClick) {
        startTimer();
        isFirstClick = false;
    }

    cellData.isFlagged = !cellData.isFlagged;
    cellElement.innerHTML = cellData.isFlagged ? '🚩' : '';
    flagsPlaced += cellData.isFlagged ? 1 : -1;
    updateMineCounter();
}


/**
 * Рекурсивно открывает ячейки.
 * @param {number} row
 * @param {number} col
 */
function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col].isRevealed || board[row][col].isFlagged) {
        return;
    }

    const cellData = board[row][col];
    cellData.isRevealed = true;
    revealedCount++;

    const cellElement = gameBoardElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.className = "aspect-square w-full flex items-center justify-center font-bold text-base sm:text-lg bg-gray-300 dark:bg-gray-500 rounded-sm border-gray-400/50 border";

    if (cellData.neighborCount > 0) {
        cellElement.textContent = cellData.neighborCount;
        cellElement.classList.add(`c${cellData.neighborCount}`);
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                revealCell(row + i, col + j);
            }
        }
    }
}


/**
 * Реализация "аккорда": открытие соседних ячеек.
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
                neighbors.push({ r, c });
                if (board[r][c].isFlagged) flaggedNeighbors++;
            }
        }
    }
    
    if (flaggedNeighbors === board[row][col].neighborCount) {
        for (const n of neighbors) {
            if (!board[n.r][n.c].isRevealed && !board[n.r][n.c].isFlagged) {
                if (board[n.r][n.c].isMine) {
                    endGame(false);
                    revealMine(gameBoardElement.querySelector(`[data-row='${n.r}'][data-col='${n.c}']`), true);
                    return;
                }
                revealCell(n.r, n.c);
            }
        }
        checkWinCondition();
    }
}


/**
 * Логика завершения игры.
 * @param {boolean} isWin - true, если игрок победил.
 */
function endGame(isWin) {
    isGameOver = true;
    cleanup();

    if (isWin) {
        restartButton.textContent = '😎';
        mineCounterElement.textContent = 'WIN!';
    } else {
        restartButton.textContent = '😵';
        mineLocations.forEach(loc => {
            const cell = gameBoardElement.querySelector(`[data-row='${loc.r}'][data-col='${loc.c}']`);
            if (!board[loc.r][loc.c].isFlagged) {
                revealMine(cell, false);
            }
        });
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isFlagged && !board[r][c].isMine) {
                    const cell = gameBoardElement.querySelector(`[data-row='${r}'][data-col='${c}']`);
                    cell.innerHTML = '❌';
                }
            }
        }
    }
}

/**
 * Визуально отображает мину на поле с использованием SVG.
 * @param {HTMLElement} cellElement
 * @param {boolean} isTrigger - Была ли это мина, на которую нажал игрок.
 */
function revealMine(cellElement, isTrigger) {
    cellElement.innerHTML = MINE_SVG_ICON;
    cellElement.className = `aspect-square w-full flex items-center justify-center rounded-sm ${isTrigger ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-500'}`;
}


/**
 * Проверяет, выполнены ли условия победы.
 */
function checkWinCondition() {
    if (!isGameOver && (rows * cols - revealedCount) === minesCount) {
        endGame(true);
    }
}


/**
 * Обновляет счетчик оставшихся мин.
 */
function updateMineCounter() {
    const remaining = minesCount - flagsPlaced;
    mineCounterElement.textContent = String(remaining).padStart(3, '0');
}


/**
 * Запускает игровой таймер.
 */
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timeElapsed++;
        if (timeElapsed <= 999) {
            timerElement.textContent = String(timeElapsed).padStart(3, '0');
        }
    }, 1000);
}


/**
 * Генерирует мины после первого клика.
 */
function placeMines(initialRow, initialCol) {
    let minesToPlace = minesCount;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if ((r === initialRow && c === initialCol) || board[r][c].isMine) {
            continue;
        }
        board[r][c].isMine = true;
        mineLocations.push({ r, c });
        minesToPlace--;
    }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborCount = countNeighborMines(r, c);
            }
        }
    }
}


/**
 * Считает количество мин-соседей для ячейки.
 */
function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].isMine) {
                count++;
            }
        }
    }
    return count;
}
