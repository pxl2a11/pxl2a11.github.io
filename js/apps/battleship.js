// js/apps/battleship.js

/**
 * Возвращает HTML-структуру для игры "Морской бой".
 * @returns {string} HTML-разметка.
 */
export function getHtml() {
    return `
        <style>
            .bs-grid {
                display: grid;
                grid-template-columns: repeat(10, 1fr);
                gap: 2px;
            }
            .bs-cell {
                width: 100%;
                aspect-ratio: 1 / 1;
                background-color: #3b82f6; /* blue-500 */
                border: 1px solid #60a5fa; /* blue-400 */
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .bs-cell:hover:not(.hit):not(.miss):not(.sunk) {
                background-color: #60a5fa; /* blue-400 */
            }
            .bs-cell.ship { background-color: #4b5563; border-color: #6b7280; } /* gray-600 */
            .dark .bs-cell.ship { background-color: #9ca3af; border-color: #d1d5db; }
            .bs-cell.miss { background-color: #9ca3af; cursor: not-allowed; } /* gray-400 */
            .bs-cell.hit { background-color: #f59e0b; } /* amber-500 */
            .bs-cell.sunk { background-color: #ef4444; border-color: #b91c1c; } /* red-500 */
            #ship-selection-list .ship-item {
                cursor: pointer;
                padding: 8px;
                border: 2px solid transparent;
                border-radius: 6px;
            }
            #ship-selection-list .ship-item.selected {
                border-color: #3b82f6;
                background-color: #dbeafe;
            }
            .dark #ship-selection-list .ship-item.selected {
                background-color: #1e3a8a;
            }
        </style>
        <div class="max-w-4xl mx-auto text-center">
            <!-- Экран расстановки кораблей -->
            <div id="setup-screen">
                <h2 class="text-2xl font-bold mb-4">Расстановка кораблей</h2>
                <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <!-- Панель выбора кораблей -->
                    <div class="w-full md:w-1/3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h3 class="font-semibold mb-2">Ваши корабли:</h3>
                        <div id="ship-selection-list" class="space-y-2"></div>
                        <div class="mt-4 flex flex-col space-y-2">
                             <label class="flex items-center cursor-pointer">
                                <input type="checkbox" id="orientation-checkbox" class="h-4 w-4 rounded">
                                <span class="ml-2">Вертикально</span>
                            </label>
                            <button id="random-place-btn" class="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600">Расставить случайно</button>
                            <button id="start-game-btn" class="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:opacity-50" disabled>Начать игру</button>
                        </div>
                    </div>
                    <!-- Поле для расстановки -->
                    <div class="w-full md:w-2/3">
                        <div id="player-setup-grid" class="bs-grid shadow-lg"></div>
                    </div>
                </div>
            </div>

            <!-- Экран игры -->
            <div id="game-screen" class="hidden">
                <h2 id="game-status" class="text-2xl font-bold mb-4">Ваш ход</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-semibold mb-2">Ваш флот</h3>
                        <div id="player-game-grid" class="bs-grid shadow-md"></div>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold mb-2">Флот противника</h3>
                        <div id="computer-game-grid" class="bs-grid shadow-md"></div>
                    </div>
                </div>
                 <div id="game-over-overlay" class="hidden mt-4">
                     <h2 id="game-over-message" class="text-3xl font-bold text-red-500"></h2>
                     <button id="play-again-btn" class="mt-4 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 text-lg">Играть снова</button>
                 </div>
            </div>
        </div>
    `;
}

/**
 * Инициализирует логику игры.
 */
export function init() {
    const GRID_SIZE = 10;
    const SHIPS_CONFIG = [
        { name: "Линкор", size: 4 },
        { name: "Крейсер", size: 3 },
        { name: "Крейсер", size: 3 },
        { name: "Эсминец", size: 2 },
        { name: "Эсминец", size: 2 },
        { name: "Эсминец", size: 2 },
        { name: "Торпедный катер", size: 1 },
        { name: "Торпедный катер", size: 1 },
        { name: "Торпедный катер", size: 1 },
        { name: "Торпедный катер", size: 1 }
    ];

    let playerBoard = createEmptyBoard();
    let computerBoard = createEmptyBoard();
    let shipsToPlace = [...SHIPS_CONFIG];
    let selectedShipIndex = 0;
    let isVertical = false;
    let isPlayerTurn = true;
    let isGameOver = false;
    let computerAi = new ComputerAI();

    // Получение элементов DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const playerSetupGrid = document.getElementById('player-setup-grid');
    const shipSelectionList = document.getElementById('ship-selection-list');
    const orientationCheckbox = document.getElementById('orientation-checkbox');
    const randomPlaceBtn = document.getElementById('random-place-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const gameStatus = document.getElementById('game-status');
    const playerGameGrid = document.getElementById('player-game-grid');
    const computerGameGrid = document.getElementById('computer-game-grid');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameOverMessage = document.getElementById('game-over-message');
    const playAgainBtn = document.getElementById('play-again-btn');

    function createEmptyBoard() {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ ship: false, hit: false }));
    }

    function renderGrid(gridElement, board, isPlayer) {
        gridElement.innerHTML = '';
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'bs-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                const cellState = board[y][x];
                if (cellState.ship && (isPlayer || cellState.hit)) {
                    cell.classList.add('ship');
                }
                if (cellState.hit && cellState.ship) {
                    cell.classList.add('hit');
                }
                if (cellState.hit && !cellState.ship) {
                    cell.classList.add('miss');
                }
                gridElement.appendChild(cell);
            }
        }
    }

    function renderShipSelection() {
        shipSelectionList.innerHTML = '';
        shipsToPlace.forEach((ship, index) => {
            const item = document.createElement('div');
            item.className = 'ship-item';
            item.textContent = `${ship.name} (${ship.size} кл.)`;
            item.dataset.index = index;
            if (index === selectedShipIndex) {
                item.classList.add('selected');
            }
            item.addEventListener('click', () => {
                selectedShipIndex = index;
                renderShipSelection();
            });
            shipSelectionList.appendChild(item);
        });
        startGameBtn.disabled = shipsToPlace.length > 0;
    }

    function isValidPlacement(board, ship, x, y, isVertical) {
        // Проверка выхода за границы
        if (isVertical) {
            if (y + ship.size > GRID_SIZE) return false;
        } else {
            if (x + ship.size > GRID_SIZE) return false;
        }
        // Проверка наложения и соседних клеток
        for (let i = 0; i < ship.size; i++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const checkX = isVertical ? x + dx : x + i + dx;
                    const checkY = isVertical ? y + i + dy : y + dy;

                    if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE) {
                        if (board[checkY][checkX].ship) return false;
                    }
                }
            }
        }
        return true;
    }

    function placeShip(board, ship, x, y, isVertical) {
        for (let i = 0; i < ship.size; i++) {
            if (isVertical) {
                board[y + i][x] = { ship: true, hit: false };
            } else {
                board[y][x + i] = { ship: true, hit: false };
            }
        }
    }

    function handleSetupCellClick(e) {
        if (shipsToPlace.length === 0) return;
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const ship = shipsToPlace[selectedShipIndex];

        if (isValidPlacement(playerBoard, ship, x, y, isVertical)) {
            placeShip(playerBoard, ship, x, y, isVertical);
            shipsToPlace.splice(selectedShipIndex, 1);
            selectedShipIndex = 0;
            renderGrid(playerSetupGrid, playerBoard, true);
            renderShipSelection();
        } else {
            alert("Невозможно разместить корабль здесь!");
        }
    }

    function randomlyPlaceShips(board, ships) {
        ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const isVertical = Math.random() < 0.5;
                const x = Math.floor(Math.random() * GRID_SIZE);
                const y = Math.floor(Math.random() * GRID_SIZE);
                if (isValidPlacement(board, ship, x, y, isVertical)) {
                    placeShip(board, ship, x, y, isVertical);
                    placed = true;
                }
            }
        });
    }

    function handleComputerGridClick(e) {
        if (!isPlayerTurn || isGameOver || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        if (computerBoard[y][x].hit) return;

        computerBoard[y][x].hit = true;
        renderGrid(computerGameGrid, computerBoard, false);

        if (checkWinCondition(computerBoard)) {
            endGame(true);
            return;
        }

        isPlayerTurn = false;
        gameStatus.textContent = "Ход противника...";
        setTimeout(computerTurn, 1000);
    }
    
    function computerTurn() {
        if (isGameOver) return;
        const { x, y } = computerAi.makeMove(playerBoard);
        playerBoard[y][x].hit = true;
        computerAi.reportResult(x, y, playerBoard[y][x].ship);
        renderGrid(playerGameGrid, playerBoard, true);

        if (checkWinCondition(playerBoard)) {
            endGame(false);
            return;
        }

        isPlayerTurn = true;
        gameStatus.textContent = "Ваш ход";
    }

    function checkWinCondition(board) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (board[y][x].ship && !board[y][x].hit) {
                    return false;
                }
            }
        }
        return true;
    }

    function endGame(playerWon) {
        isGameOver = true;
        gameOverOverlay.classList.remove('hidden');
        gameStatus.textContent = "Игра окончена!";
        gameOverMessage.textContent = playerWon ? "Поздравляем, вы победили!" : "Вы проиграли. Попробуйте снова!";
    }

    // Инициализация игры
    renderGrid(playerSetupGrid, playerBoard, true);
    renderShipSelection();

    // Назначение обработчиков
    playerSetupGrid.addEventListener('click', handleSetupCellClick);
    orientationCheckbox.addEventListener('change', (e) => isVertical = e.target.checked);
    randomPlaceBtn.addEventListener('click', () => {
        playerBoard = createEmptyBoard();
        randomlyPlaceShips(playerBoard, shipsToPlace);
        shipsToPlace = [];
        renderGrid(playerSetupGrid, playerBoard, true);
        renderShipSelection();
    });
    startGameBtn.addEventListener('click', () => {
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        computerBoard = createEmptyBoard();
        randomlyPlaceShips(computerBoard, SHIPS_CONFIG);
        renderGrid(playerGameGrid, playerBoard, true);
        renderGrid(computerGameGrid, computerBoard, false);
    });
    computerGameGrid.addEventListener('click', handleComputerGridClick);
    playAgainBtn.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        gameOverOverlay.classList.add('hidden');
        playerBoard = createEmptyBoard();
        shipsToPlace = [...SHIPS_CONFIG];
        selectedShipIndex = 0;
        isGameOver = false;
        isPlayerTurn = true;
        computerAi.reset();
        renderGrid(playerSetupGrid, playerBoard, true);
        renderShipSelection();
    });
}

/**
 * Класс для простого AI компьютера.
 */
class ComputerAI {
    constructor() {
        this.reset();
    }
    reset() {
        this.shots = Array(10).fill(null).map(() => Array(10).fill(false));
        this.mode = 'hunt'; // 'hunt' или 'target'
        this.targetQueue = [];
        this.lastHit = null;
    }
    makeMove(board) {
        let x, y;
        if (this.mode === 'target' && this.targetQueue.length > 0) {
            const move = this.targetQueue.shift();
            x = move.x;
            y = move.y;
        } else {
            this.mode = 'hunt';
            do {
                x = Math.floor(Math.random() * 10);
                y = Math.floor(Math.random() * 10);
            } while (this.shots[y][x]);
        }
        this.shots[y][x] = true;
        return { x, y };
    }
    reportResult(x, y, isHit) {
        if (isHit) {
            this.mode = 'target';
            this.lastHit = { x, y };
            // Добавляем соседние клетки в очередь на проверку
            this.addToQueue(x + 1, y);
            this.addToQueue(x - 1, y);
            this.addToQueue(x, y + 1);
            this.addToQueue(x, y - 1);
        }
    }
    addToQueue(x, y) {
        if (x >= 0 && x < 10 && y >= 0 && y < 10 && !this.shots[y][x]) {
            // Убедимся, что не добавляем дубликаты
            if (!this.targetQueue.some(p => p.x === x && p.y === y)) {
                this.targetQueue.push({ x, y });
            }
        }
    }
}
