// --- Переменные состояния модуля ---
let rows, cols, mineCount;
let board = []; // 2D массив объектов ячеек: { isMine, isRevealed, isFlagged, neighborMines }
let mineLocations = [];
let flagsPlaced = 0;
let cellsRevealed = 0;
let gameOver = false;
let firstClick = true;
let timerInterval;
let startTime;

// --- DOM-элементы ---
let boardContainer, flagsCountEl, timerEl, statusEl, newGameBtn;

/**
 * Генерирует HTML-структуру для приложения "Сапер".
 * @returns {string} HTML-разметка.
 */
export function getHtml() {
    return `
        <div class="space-y-4 max-w-2xl mx-auto">
            <!-- Панель управления -->
            <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <div class="col-span-2 sm:col-span-4 text-center sm:text-left mb-2 sm:mb-0">
                        <p class="font-semibold text-lg">Настройки игры</p>
                    </div>
                    <div>
                        <label for="ms-rows" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ряды</label>
                        <input type="number" id="ms-rows" value="10" min="5" max="30" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <div>
                        <label for="ms-cols" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Колонки</label>
                        <input type="number" id="ms-cols" value="10" min="5" max="30" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <div>
                        <label for="ms-mines" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Мины</label>
                        <input type="number" id="ms-mines" value="15" min="1" max="200" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <button id="ms-new-game-btn" class="col-span-2 sm:col-span-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors h-10 mt-1 sm:mt-6">
                        Новая игра
                    </button>
                </div>
                 <div class="flex justify-center gap-2 mt-4 flex-wrap">
                    <button class="ms-difficulty-btn" data-rows="9" data-cols="9" data-mines="10">Легко</button>
                    <button class="ms-difficulty-btn" data-rows="16" data-cols="16" data-mines="40">Средне</button>
                    <button class="ms-difficulty-btn" data-rows="16" data-cols="30" data-mines="99">Сложно</button>
                </div>
            </div>

            <!-- Статус игры -->
            <div class="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow">
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                    <span id="ms-flags-count" class="font-mono text-xl font-bold">0</span>
                </div>
                <div id="ms-status-indicator" class="font-bold text-xl">🙂</div>
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="ms-timer" class="font-mono text-xl font-bold">0</span>
                </div>
            </div>

            <!-- Игровое поле -->
            <div id="minesweeper-board-container" class="flex justify-center p-2 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-inner overflow-auto">
                 <div id="minesweeper-board" class="grid" style="user-select: none;"></div>
            </div>
        </div>
    `;
}

/**
 * Инициализация приложения.
 */
export function init() {
    // Находим DOM-элементы после их отрисовки
    boardContainer = document.getElementById('minesweeper-board');
    flagsCountEl = document.getElementById('ms-flags-count');
    timerEl = document.getElementById('ms-timer');
    statusEl = document.getElementById('ms-status-indicator');
    newGameBtn = document.getElementById('ms-new-game-btn');

    // Назначаем обработчики событий
    newGameBtn.addEventListener('click', startGame);
    boardContainer.addEventListener('click', handleCellClick);
    boardContainer.addEventListener('contextmenu', handleRightClick);

    // Кнопки сложности
    document.querySelectorAll('.ms-difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { rows, cols, mines } = e.target.dataset;
            document.getElementById('ms-rows').value = rows;
            document.getElementById('ms-cols').value = cols;
            document.getElementById('ms-mines').value = mines;
            startGame();
        });
    });

    startGame();
}

/**
 * Очистка ресурсов при выходе из приложения.
 */
export function cleanup() {
    clearInterval(timerInterval);
    timerInterval = null;
    // Можно также удалить обработчики, но они удалятся вместе с DOM
}

/**
 * Начинает новую игру.
 */
function startGame() {
    // Получаем настройки
    const rowsInput = document.getElementById('ms-rows');
    const colsInput = document.getElementById('ms-cols');
    const minesInput = document.getElementById('ms-mines');

    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    mineCount = parseInt(minesInput.value);
    
    // Валидация
    if (mineCount >= rows * cols) {
        alert("Количество мин должно быть меньше, чем общее количество ячеек.");
        mineCount = rows * cols - 1;
        minesInput.value = mineCount;
    }

    // Сброс состояния
    gameOver = false;
    firstClick = true;
    flagsPlaced = 0;
    cellsRevealed = 0;
    board = [];
    mineLocations = [];

    // Сброс таймера и статуса
    clearInterval(timerInterval);
    timerInterval = null;
    timerEl.textContent = '0';
    statusEl.textContent = '🙂';

    updateFlagsCount();
    createBoardDOM();
}

/**
 * Создает DOM-структуру игрового поля.
 */
function createBoardDOM() {
    boardContainer.innerHTML = '';
    boardContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    boardContainer.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    
    const cellSize = Math.min(35, Math.floor(Math.min(window.innerWidth - 60, 672) / cols));
    
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.className = 'ms-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize * 0.6}px`;

            boardContainer.appendChild(cell);
            board[r][c] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                element: cell,
            };
        }
    }
}

/**
 * Обработчик левого клика по ячейке.
 * @param {Event} e - Событие клика.
 */
function handleCellClick(e) {
    const cellEl = e.target.closest('.ms-cell');
    if (gameOver || !cellEl || cellEl.classList.contains('revealed')) return;

    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    if (cell.isFlagged) return;

    if (firstClick) {
        placeMines(row, col);
        calculateAllNeighbors();
        startTimer();
        firstClick = false;
    }

    if (cell.isMine) {
        endGame(false);
        return;
    }

    revealCell(row, col);
    checkWinCondition();
}

/**
 * Обработчик правого клика (установка флага).
 * @param {Event} e - Событие клика.
 */
function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    
    const cellEl = e.target.closest('.ms-cell');
    if (!cellEl || cellEl.classList.contains('revealed')) return;

    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const cell = board[row][col];

    toggleFlag(cell);
}

/**
 * Устанавливает или снимает флаг с ячейки.
 * @param {object} cell - Объект ячейки.
 */
function toggleFlag(cell) {
    if (!cell.isFlagged && flagsPlaced < mineCount) {
        cell.isFlagged = true;
        cell.element.innerHTML = '🚩';
        flagsPlaced++;
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.innerHTML = '';
        flagsPlaced--;
    }
    updateFlagsCount();
}

/**
 * Открывает ячейку и, если нужно, соседние.
 * @param {number} row - Ряд ячейки.
 * @param {number} col - Колонка ячейки.
 */
function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    cellsRevealed++;

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.classList.add(`ms-c${cell.neighborMines}`);
    } else {
        // Рекурсивно открываем соседей, если ячейка пустая
        for (let rOffset = -1; rOffset <= 1; rOffset++) {
            for (let cOffset = -1; cOffset <= 1; cOffset++) {
                if (rOffset === 0 && cOffset === 0) continue;
                revealCell(row + rOffset, col + cOffset);
            }
        }
    }
}

/**
 * Проверяет условие победы.
 */
function checkWinCondition() {
    if (cellsRevealed === rows * cols - mineCount) {
        endGame(true);
    }
}

/**
 * Завершает игру.
 * @param {boolean} isWin - `true`, если игра выиграна.
 */
function endGame(isWin) {
    gameOver = true;
    clearInterval(timerInterval);
    timerInterval = null;
    statusEl.textContent = isWin ? '😎' : '😵';

    // Показываем все мины
    for (const loc of mineLocations) {
        const cell = board[loc.row][loc.col];
        if (!cell.isRevealed) {
            cell.element.classList.add(cell.isFlagged ? 'correct-flag' : 'mine');
            if(!cell.isFlagged) cell.element.innerHTML = '💣';
        }
    }

    if (!isWin) {
        // Помечаем неправильно поставленные флаги
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                if (cell.isFlagged && !cell.isMine) {
                    cell.element.classList.add('wrong-flag');
                }
            }
        }
    }
}

/**
 * Размещает мины на поле, избегая первую кликнутую ячейку.
 * @param {number} initialRow - Ряд первого клика.
 * @param {number} initialCol - Колонка первого клика.
 */
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

/**
 * Вычисляет количество мин-соседей для всех ячеек.
 */
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

/**
 * Обновляет счетчик флагов на экране.
 */
function updateFlagsCount() {
    flagsCountEl.textContent = mineCount - flagsPlaced;
}

/**
 * Запускает игровой таймер.
 */
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        timerEl.textContent = seconds;
    }, 1000);
}
