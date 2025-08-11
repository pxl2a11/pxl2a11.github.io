/**
 * 35Файл: /apps/minesweeper.js
 * Описание: Реализация игры "Сапер" для проекта Mini Apps.
 * Включает уровни сложности, таймер, кнопку перезапуска и функцию "аккорд".
 */

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ МОДУЛЯ ---

// Настройки сложности
const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10, name: 'Новичок' },
    intermediate: { rows: 16, cols: 16, mines: 40, name: 'Любитель' },
    expert: { rows: 16, cols: 30, mines: 99, name: 'Эксперт' },
};

// Состояние игры
let currentDifficulty = 'beginner';
let rows, cols, minesCount;
let board = []; // Массив объектов ячеек: { isMine, isRevealed, isFlagged, neighborCount }
let mineLocations = [];
let revealedCount = 0;
let flagsPlaced = 0;
let isGameOver = false;
let isFirstClick = true;
let timerInterval = null;
let timeElapsed = 0;

// Ссылки на DOM-элементы (будут определены в init)
let gameBoardElement, mineCounterElement, timerElement, restartButton, difficultySelector;

// --- ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ ---

/**
 * Возвращает HTML-структуру для игры.
 * @returns {string} HTML-строка
 */
export function getHtml() {
    return `
        <div class="minesweeper-container bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
            <!-- Панель управления -->
            <div class="grid grid-cols-3 gap-4 items-center mb-4 p-2 bg-gray-300 dark:bg-gray-800 rounded-md">
                <div id="mine-counter" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
                <button id="restart-btn" class="text-3xl sm:text-4xl text-center hover:scale-110 transition-transform">😊</button>
                <div id="timer" class="font-mono text-2xl sm:text-3xl text-red-500 bg-black rounded-md text-center py-1"></div>
            </div>

            <!-- Выбор сложности -->
            <div class="mb-4 text-center">
                <select id="difficulty-selector" class="p-2 rounded-md bg-white dark:bg-gray-600 border border-gray-400 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="beginner">Новичок (9x9, 10 мин)</option>
                    <option value="intermediate">Любитель (16x16, 40 мин)</option>
                    <option value="expert">Эксперт (16x30, 99 мин)</option>
                </select>
            </div>

            <!-- Игровое поле -->
            <div id="minesweeper-board" class="mx-auto w-max select-none">
                <!-- Ячейки будут сгенерированы здесь -->
            </div>
        </div>
    `;
}

/**
 * Инициализирует игру, находит элементы и вешает обработчики.
 */
export function init() {
    // Находим все необходимые элементы в DOM
    gameBoardElement = document.getElementById('minesweeper-board');
    mineCounterElement = document.getElementById('mine-counter');
    timerElement = document.getElementById('timer');
    restartButton = document.getElementById('restart-btn');
    difficultySelector = document.getElementById('difficulty-selector');
    
    // Устанавливаем обработчики событий
    restartButton.addEventListener('click', () => startGame(currentDifficulty));
    difficultySelector.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        startGame(currentDifficulty);
    });
    // Предотвращаем стандартное контекстное меню на всем поле
    gameBoardElement.addEventListener('contextmenu', e => e.preventDefault());

    // Запускаем первую игру
    startGame(currentDifficulty);
}

/**
 * Очищает ресурсы (таймеры) при уходе со страницы приложения.
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

    // Сброс состояния игры
    isGameOver = false;
    isFirstClick = true;
    revealedCount = 0;
    flagsPlaced = 0;
    timeElapsed = 0;
    board = [];
    mineLocations = [];

    // Сброс таймера
    cleanup(); // Останавливаем предыдущий таймер, если он был
    timerElement.textContent = String(timeElapsed).padStart(3, '0');
    
    // Сброс UI
    restartButton.textContent = '😊';
    updateMineCounter();
    createBoard();
}

/**
 * Создает игровое поле в DOM и инициализирует массив board.
 */
function createBoard() {
    gameBoardElement.innerHTML = '';
    gameBoardElement.style.display = 'grid';
    gameBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoardElement.style.width = `${cols * 28}px`; // 28px = 24px width + 4px gap, подберите размер

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
            cell.className = "h-7 w-7 flex items-center justify-center font-bold text-lg bg-gray-400 dark:bg-gray-600 rounded-sm shadow-[inset_2px_2px_2px_rgba(255,255,255,0.4),inset_-2px_-2px_2px_rgba(0,0,0,0.4)] transition-all duration-100";
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Обработчики мыши для ячейки
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('mousedown', (e) => {
                if (!isGameOver && e.button === 0) { // Только для левой кнопки мыши
                    restartButton.textContent = '😮';
                }
            });
            cell.addEventListener('mouseup', () => {
                if (!isGameOver) {
                    restartButton.textContent = '😊';
                }
            });
             cell.addEventListener('mouseleave', () => {
                if (!isGameOver) {
                    restartButton.textContent = '😊';
                }
            });

            gameBoardElement.appendChild(cell);
        }
    }
}

/**
 * Генерирует мины после первого клика.
 * @param {number} initialRow - Ряд, по которому кликнули.
 * @param {number} initialCol - Колонка, по которой кликнули.
 */
function placeMines(initialRow, initialCol) {
    let minesToPlace = minesCount;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        // Мина не должна быть в месте первого клика или там, где уже есть мина
        if ((r === initialRow && c === initialCol) || board[r][c].isMine) {
            continue;
        }

        board[r][c].isMine = true;
        mineLocations.push({ r, c });
        minesToPlace--;
    }

    // Рассчитываем цифры для всех ячеек
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborCount = countNeighborMines(r, c);
            }
        }
    }
}

/**
 * Обработчик левого клика по ячейке.
 * @param {MouseEvent} event
 */
function handleCellClick(event) {
    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (isGameOver || cellData.isFlagged) return;

    // Действия при первом клике
    if (isFirstClick) {
        placeMines(row, col);
        startTimer();
        isFirstClick = false;
    }

    // "Аккорд" - клик по уже открытой ячейке с цифрой
    if (cellData.isRevealed && cellData.neighborCount > 0) {
        handleChord(row, col);
        return;
    }

    // Клик по мине
    if (cellData.isMine) {
        endGame(false); // Проигрыш
        revealMine(cellElement, true); // Показать нажатую мину
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
    event.preventDefault(); // Отменяем контекстное меню
    if (isGameOver) return;

    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (cellData.isRevealed) return;
    
    // Запускаем таймер, если он еще не запущен
    if (isFirstClick) {
        startTimer();
        isFirstClick = false; // Установка флага считается первым ходом
    }

    cellData.isFlagged = !cellData.isFlagged;
    cellElement.textContent = cellData.isFlagged ? '🚩' : '';
    flagsPlaced += cellData.isFlagged ? 1 : -1;
    updateMineCounter();
}

/**
 * Рекурсивно открывает ячейки.
 * @param {number} row
 * @param {number} col
 */
function revealCell(row, col) {
    // Проверка границ и состояния ячейки
    if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col].isRevealed || board[row][col].isFlagged) {
        return;
    }

    const cellData = board[row][col];
    cellData.isRevealed = true;
    revealedCount++;

    const cellElement = gameBoardElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.className = "h-7 w-7 flex items-center justify-center font-bold text-lg bg-gray-300 dark:bg-gray-500 rounded-sm border border-gray-400";

    if (cellData.neighborCount > 0) {
        cellElement.textContent = cellData.neighborCount;
        cellElement.classList.add(`c${cellData.neighborCount}`); // Класс для цвета цифры
    } else {
        // Если ячейка пустая, рекурсивно открываем соседей
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

    // Подсчет флагов и сбор соседей
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                neighbors.push({ r, c });
                if (board[r][c].isFlagged) {
                    flaggedNeighbors++;
                }
            }
        }
    }
    
    // Если число флагов совпадает с цифрой, открываем остальных
    if (flaggedNeighbors === board[row][col].neighborCount) {
        for (const n of neighbors) {
            if (!board[n.r][n.c].isRevealed && !board[n.r][n.c].isFlagged) {
                if (board[n.r][n.c].isMine) {
                    endGame(false); // Проигрыш, если флаг стоял неверно
                    revealMine(gameBoardElement.querySelector(`[data-row='${n.r}'][data-col='${n.c}']`), true);
                    return; // Прерываем выполнение
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
    cleanup(); // Останавливаем таймер

    if (isWin) {
        restartButton.textContent = '😎';
        mineCounterElement.textContent = 'WIN!';
    } else {
        restartButton.textContent = '😵';
        // Показать все мины
        mineLocations.forEach(loc => {
            const cell = gameBoardElement.querySelector(`[data-row='${loc.r}'][data-col='${loc.c}']`);
            if (!board[loc.r][loc.c].isFlagged) {
                revealMine(cell, false);
            }
        });
        // Показать неверно поставленные флаги
         for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isFlagged && !board[r][c].isMine) {
                     const cell = gameBoardElement.querySelector(`[data-row='${r}'][data-col='${c}']`);
                     cell.textContent = '❌';
                }
            }
         }
    }
}

/**
 * Визуально отображает мину на поле.
 * @param {HTMLElement} cellElement - Элемент ячейки.
 * @param {boolean} isTrigger - Была ли это мина, на которую нажал игрок.
 */
function revealMine(cellElement, isTrigger) {
    cellElement.textContent = '💣';
    cellElement.className = `h-7 w-7 flex items-center justify-center text-lg rounded-sm ${isTrigger ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-500'}`;
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
        if (timeElapsed <= 999) { // Ограничение таймера
            timerElement.textContent = String(timeElapsed).padStart(3, '0');
        }
    }, 1000);
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
