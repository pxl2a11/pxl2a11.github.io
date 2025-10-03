// 27js/apps/game2048.js

let grid = [];
let score = 0;
const gridSize = 4;
let isGameOver = false;

// --- НОВОЕ: Переменные для режима игры на время ---
let timerInterval = null; // ID интервала для его последующей остановки
let timeLeft = 0; // Оставшееся время в секундах
const TIME_ATTACK_DURATION = 120; // Длительность игры в секундах (2 минуты)
let isTimeAttackMode = false; // Флаг, указывающий на активный режим "игры на время"
// --- КОНЕЦ НОВОГО ---

// --- НОВОЕ: Переменные для звуков ---
let mergeHappened = false; // Флаг для отслеживания слияния плиток за один ход
const slideSound = new Audio('sounds/games/2048/slide.mp3');
const associationSound = new Audio('sounds/games/2048/association.mp3');
// --- КОНЕЦ НОВОГО ---

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


/**
 * ИЗМЕНЕНО: Добавлены элементы для таймера и новая кнопка для запуска игры на время.
 */
export function getHtml() {
    return `
        <div class="flex flex-col items-center">
            <div class="flex justify-between items-center w-full max-w-md mb-4">
                <div>
                    <span class="text-lg font-bold">СЧЕТ:</span>
                    <span id="score" class="text-lg font-bold">0</span>
                </div>
                <!-- НОВОЕ: Контейнер для таймера -->
                <div id="timer-container" class="text-lg font-bold text-red-600 hidden">
                    <span>ВРЕМЯ:</span>
                    <span id="timer">02:00</span>
                </div>
                <!-- КОНЕЦ НОВОГО -->
                <div class="flex space-x-2">
                    <button id="new-game-btn" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">Новая игра</button>
                    <!-- НОВОЕ: Кнопка для игры на время -->
                    <button id="time-attack-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">На время</button>
                    <!-- КОНЕЦ НОВОГО -->
                </div>
            </div>
            <div class="relative" style="width: 100%; max-width: 420px; aspect-ratio: 1 / 1;">
                <div id="game-board" class="grid grid-cols-4 grid-rows-4 gap-3 p-3 bg-gray-400 dark:bg-gray-600 rounded-md w-full h-full">
                </div>
                <!-- ИЗМЕНЕНО: Добавлен span для кастомизации сообщения о конце игры -->
                <div id="game-over-overlay" class="absolute inset-0 bg-black bg-opacity-50 flex-col justify-center items-center text-white text-4xl font-bold hidden rounded-md z-20">
                    <span id="game-over-message">Конец игры!</span>
                    <button id="retry-btn" class="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-xl">Попробовать снова</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * ИЗМЕНЕНО: Добавлены слушатели для новой кнопки и изменена логика старых.
 */
export function init() {
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const timeAttackBtn = document.getElementById('time-attack-btn'); // Новая кнопка
    const retryBtn = document.getElementById('retry-btn');

    newGameBtn.addEventListener('click', () => {
        isTimeAttackMode = false; // Обычный режим
        startGame();
    });
    timeAttackBtn.addEventListener('click', () => {
        isTimeAttackMode = true; // Режим на время
        startGame();
    });
    retryBtn.addEventListener('click', startGame); // "Попробовать снова" перезапускает игру в том же режиме

    document.addEventListener('keydown', handleKeydown);
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd);

    startGame(); // Начинаем обычную игру при первой загрузке
}

/**
 * ИЗМЕНЕНО: Добавлена остановка таймера при очистке.
 */
export function cleanup() {
    const gameBoard = document.getElementById('game-board');
    document.removeEventListener('keydown', handleKeydown);
    if (gameBoard) {
        gameBoard.removeEventListener('touchstart', handleTouchStart);
        gameBoard.removeEventListener('touchmove', handleTouchMove);
        gameBoard.removeEventListener('touchend', handleTouchEnd);
    }
    stopTimer(); // Останавливаем таймер, если он был запущен
}

/**
 * ИЗМЕНЕНО: Функция теперь управляет запуском таймера в зависимости от режима.
 */
function startGame() {
    stopTimer(); // Всегда останавливаем предыдущий таймер
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    score = 0;
    isGameOver = false;
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.remove('flex');
    updateScore();
    addRandomTile();
    addRandomTile();
    renderBoard();

    // НОВОЕ: Логика для режима игры на время
    const timerContainer = document.getElementById('timer-container');
    if (isTimeAttackMode) {
        timeLeft = TIME_ATTACK_DURATION;
        timerContainer.classList.remove('hidden');
        updateTimerDisplay();
        startTimer();
    } else {
        timerContainer.classList.add('hidden');
    }
    // --- КОНЕЦ НОВОГО ---
}

// --- НОВЫЕ ФУНКЦИИ ДЛЯ ТАЙМЕРА ---
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            stopTimer();
            showGameOverOverlay("Время вышло!"); // Завершаем игру, когда время вышло
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
// --- КОНЕЦ НОВЫХ ФУНКЦИЙ ---


function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const backgroundCell = document.createElement('div');
            backgroundCell.className = 'w-full h-full bg-gray-300 dark:bg-gray-500 rounded-md';
            backgroundCell.style.gridRow = `${r + 1}`;
            backgroundCell.style.gridColumn = `${c + 1}`;
            gameBoard.appendChild(backgroundCell);
            if (grid[r][c] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile z-10 flex items-center justify-center font-bold text-2xl md:text-4xl rounded-md transition-all duration-200 ${tileColors[grid[r][c]] || 'bg-black text-white'}`;
                tile.style.gridRow = `${r + 1}`;
                tile.style.gridColumn = `${c + 1}`;
                tile.textContent = grid[r][c];
                gameBoard.appendChild(tile);
            }
        }
    }
}

/**
 * ИЗМЕНЕНО: Добавлен сброс флага слияния и вызов общей функции postMoveActions.
 */
function handleKeydown(e) {
    if (isGameOver) return;
    let moved = false;
    mergeHappened = false; // Сбрасываем флаг перед каждым ходом
    switch (e.key) {
        case 'ArrowUp': e.preventDefault(); moved = moveUp(); break;
        case 'ArrowDown': e.preventDefault(); moved = moveDown(); break;
        case 'ArrowLeft': e.preventDefault(); moved = moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moved = moveRight(); break;
        default: return;
    }
    postMoveActions(moved); // Общая логика после хода
}

// --- Функции для управления свайпом (без изменений) ---
function handleTouchStart(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}
function handleTouchMove(e) { e.preventDefault(); }
function handleTouchEnd(e) {
    if (isGameOver) return;
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}

/**
 * ИЗМЕНЕНО: Добавлен сброс флага слияния и вызов общей функции postMoveActions.
 */
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    let moved = false;
    mergeHappened = false; // Сбрасываем флаг перед каждым ходом
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) moved = (deltaX > 0) ? moveRight() : moveLeft();
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) moved = (deltaY > 0) ? moveDown() : moveUp();
    }
    postMoveActions(moved); // Общая логика после хода
}

/**
 * НОВАЯ ФУНКЦИЯ: Обрабатывает все действия после совершения хода.
 * Воспроизводит нужный звук и обновляет игровое поле.
 */
function postMoveActions(moved) {
    if (moved) {
        if (mergeHappened) {
            associationSound.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
        } else {
            slideSound.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
        }
        addRandomTile();
        renderBoard();
        checkGameOver();
    }
}


// --- Основная логика игры (с минимальными изменениями) ---
function slide(row) {
    let arr = row.filter(val => val);
    return arr.concat(Array(gridSize - arr.length).fill(0));
}

/**
 * ИЗМЕНЕНО: Устанавливает флаг mergeHappened при слиянии плиток.
 */
function combine(row) {
    for (let i = 0; i < gridSize - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
            mergeHappened = true; // Устанавливаем флаг, что слияние произошло
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
function updateScore() { document.getElementById('score').textContent = score; }
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
    if (!isGameOver && !canMove()) {
        showGameOverOverlay("Конец игры!");
    }
}

/**
 * НОВАЯ ФУНКЦИЯ: Централизованная функция для отображения оверлея "Конец игры".
 * Позволяет показывать разные сообщения о причине завершения.
 */
function showGameOverOverlay(message) {
    isGameOver = true;
    stopTimer(); // На всякий случай останавливаем таймер, если он еще работает
    const overlay = document.getElementById('game-over-overlay');
    document.getElementById('game-over-message').textContent = message;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}
