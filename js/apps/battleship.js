//46 js/apps/battleship.js

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
                transition: background-color 0.2s;
            }
            /* Стили для поля противника */
            #computer-game-grid .bs-cell {
                 cursor: pointer;
            }
             #computer-game-grid .bs-cell:hover:not(.hit):not(.miss):not(.sunk) {
                background-color: #60a5fa; /* blue-400 */
            }
            /* Общие стили состояний клеток */
            .bs-cell.ship { background-color: #4b5563; border-color: #6b7280; } /* gray-600 */
            .dark .bs-cell.ship { background-color: #9ca3af; border-color: #d1d5db; }
            .bs-cell.miss { background-color: #9ca3af; cursor: not-allowed; } /* gray-400 */
            .bs-cell.hit { background-color: #f59e0b; } /* amber-500 */
            .bs-cell.sunk { background-color: #ef4444; border-color: #b91c1c; } /* red-500 */
            
            /* Стили для предпросмотра расстановки */
            .bs-cell.preview-valid { background-color: #22c55e; } /* green-500 */
            .bs-cell.preview-invalid { background-color: #f43f5e; } /* rose-500 */

            /* Стили для списка кораблей */
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
                <p class="mb-4 text-gray-600 dark:text-gray-400">Выберите корабль из списка, затем кликните на поле для его размещения.</p>
                <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <!-- Панель выбора кораблей -->
                    <div class="w-full md:w-1/3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h3 class="font-semibold mb-2">Ваши корабли:</h3>
                        <div id="ship-selection-list" class="space-y-2"></div>
                        <div class="mt-4 flex flex-col space-y-2">
                             <label class="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                <input type="checkbox" id="orientation-checkbox" class="h-4 w-4 rounded">
                                <span class="ml-2">Вертикально</span>
                            </label>
                            <button id="random-place-btn" class="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600">Расставить случайно</button>
                             <button id="reset-btn" class="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600">Сбросить</button>
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
        { id: 0, name: "Линкор", size: 4 },
        { id: 1, name: "Крейсер", size: 3 },
        { id: 2, name: "Крейсер", size: 3 },
        { id: 3, name: "Эсминец", size: 2 },
        { id: 4, name: "Эсминец", size: 2 },
        { id: 5, name: "Эсминец", size: 2 },
        { id: 6, name: "Торпедный катер", size: 1 },
        { id: 7, name: "Торпедный катер", size: 1 },
        { id: 8, name: "Торпедный катер", size: 1 },
        { id: 9, name: "Торпедный катер", size: 1 }
    ];

    let playerBoard, computerBoard, shipsToPlace, selectedShip, isVertical, isPlayerTurn, isGameOver, computerAi;

    // Получение элементов DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const playerSetupGrid = document.getElementById('player-setup-grid');
    const shipSelectionList = document.getElementById('ship-selection-list');
    const orientationCheckbox = document.getElementById('orientation-checkbox');
    const randomPlaceBtn = document.getElementById('random-place-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    const gameStatus = document.getElementById('game-status');
    const playerGameGrid = document.getElementById('player-game-grid');
    const computerGameGrid = document.getElementById('computer-game-grid');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameOverMessage = document.getElementById('game-over-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // ИЗМЕНЕНО: Функция для создания пустой доски с более детальной информацией о клетке
    function createEmptyBoard() {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({
            shipId: null,
            isHit: false,
            isSunk: false
        })));
    }

    // ИЗМЕНЕНО: Функция рендеринга теперь обрабатывает потопленные корабли
    function renderGrid(gridElement, board, isPlayer) {
        gridElement.innerHTML = '';
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'bs-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                const cellState = board[y][x];

                if (cellState.shipId !== null && (isPlayer || cellState.isHit)) {
                    cell.classList.add('ship');
                }
                if (cellState.isHit && cellState.shipId !== null) {
                    cell.classList.add('hit');
                }
                if (cellState.isHit && cellState.shipId === null) {
                    cell.classList.add('miss');
                }
                if (cellState.isSunk) {
                    cell.classList.add('sunk');
                }
                gridElement.appendChild(cell);
            }
        }
    }
    
    // ИЗМЕНЕНО: Рендеринг списка выбора кораблей
    function renderShipSelection() {
        shipSelectionList.innerHTML = '';
        if (shipsToPlace.length === 0) {
             shipSelectionList.innerHTML = '<p>Все корабли расставлены!</p>';
        }
        shipsToPlace.forEach((ship, index) => {
            const item = document.createElement('div');
            item.className = 'ship-item';
            item.textContent = `${ship.name} (${ship.size} кл.)`;
            item.dataset.index = index;
            if (ship.id === selectedShip?.id) {
                item.classList.add('selected');
            }
            item.addEventListener('click', () => {
                selectedShip = shipsToPlace[index];
                renderShipSelection();
            });
            shipSelectionList.appendChild(item);
        });
        startGameBtn.disabled = shipsToPlace.length > 0;
    }

    function isValidPlacement(board, ship, x, y, isVertical) {
        if (!ship) return false;
        if (isVertical) {
            if (y + ship.size > GRID_SIZE) return false;
        } else {
            if (x + ship.size > GRID_SIZE) return false;
        }
        for (let i = 0; i < ship.size; i++) {
            const currentX = isVertical ? x : x + i;
            const currentY = isVertical ? y + i : y;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const checkX = currentX + dx;
                    const checkY = currentY + dy;
                    if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE) {
                        if (board[checkY][checkX].shipId !== null) return false;
                    }
                }
            }
        }
        return true;
    }

    // ИЗМЕНЕНО: Функция размещения теперь сохраняет ID корабля
    function placeShip(board, ship, x, y, isVertical) {
        for (let i = 0; i < ship.size; i++) {
            if (isVertical) {
                board[y + i][x].shipId = ship.id;
            } else {
                board[y][x + i].shipId = ship.id;
            }
        }
    }
    
    // НОВОЕ: Функции для предпросмотра расстановки
    function handleSetupCellMouseOver(e) {
        if (!selectedShip || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const valid = isValidPlacement(playerBoard, selectedShip, x, y, isVertical);
        
        for (let i = 0; i < selectedShip.size; i++) {
            const previewX = isVertical ? x : x + i;
            const previewY = isVertical ? y + i : y;
            if (previewX < GRID_SIZE && previewY < GRID_SIZE) {
                const cell = playerSetupGrid.querySelector(`[data-x='${previewX}'][data-y='${previewY}']`);
                if(cell) cell.classList.add(valid ? 'preview-valid' : 'preview-invalid');
            }
        }
    }
    function handleSetupCellMouseOut() {
        playerSetupGrid.querySelectorAll('.bs-cell').forEach(c => {
            c.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    function handleSetupCellClick(e) {
        if (!selectedShip || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        if (isValidPlacement(playerBoard, selectedShip, x, y, isVertical)) {
            placeShip(playerBoard, selectedShip, x, y, isVertical);
            shipsToPlace = shipsToPlace.filter(s => s.id !== selectedShip.id);
            selectedShip = shipsToPlace[0] || null;
            renderGrid(playerSetupGrid, playerBoard, true);
            renderShipSelection();
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

        const cell = computerBoard[y][x];
        if (cell.isHit) return;
        cell.isHit = true;
        
        const hitShip = cell.shipId !== null;
        if (hitShip) {
             checkAndMarkSunkShips(computerBoard, x, y);
        }

        renderGrid(computerGameGrid, computerBoard, false);

        if (checkWinCondition(computerBoard)) {
            endGame(true);
            return;
        }

        isPlayerTurn = false;
        gameStatus.textContent = hitShip ? "Попадание! Ход противника..." : "Промах. Ход противника...";
        setTimeout(computerTurn, 1500);
    }
    
    function computerTurn() {
        if (isGameOver) return;
        const { x, y } = computerAi.makeMove(playerBoard);
        
        const cell = playerBoard[y][x];
        cell.isHit = true;

        const hitShip = cell.shipId !== null;
        computerAi.reportResult(x, y, hitShip);
        
        if (hitShip) {
             const sunkShipId = checkAndMarkSunkShips(playerBoard, x, y);
             if (sunkShipId !== null) {
                 computerAi.reportSunk(sunkShipId);
             }
        }
        
        renderGrid(playerGameGrid, playerBoard, true);

        if (checkWinCondition(playerBoard)) {
            endGame(false);
            return;
        }
        
        isPlayerTurn = true;
        gameStatus.textContent = "Ваш ход";
    }

    // НОВОЕ: Проверка и отметка потопленных кораблей
    function checkAndMarkSunkShips(board, x, y) {
        const shipId = board[y][x].shipId;
        if (shipId === null) return null;

        const shipCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c].shipId === shipId) {
                    shipCells.push({x: c, y: r});
                }
            }
        }

        const isSunk = shipCells.every(cell => board[cell.y][cell.x].isHit);

        if (isSunk) {
            shipCells.forEach(cell => {
                board[cell.y][cell.x].isSunk = true;
                // Отмечаем клетки вокруг
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const checkX = cell.x + dx;
                        const checkY = cell.y + dy;
                        if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE) {
                            if (!board[checkY][checkX].isHit) {
                                board[checkY][checkX].isHit = true; // Отмечаем как "промах"
                            }
                        }
                    }
                }
            });
            return shipId;
        }
        return null;
    }

    function checkWinCondition(board) {
        return SHIPS_CONFIG.every(ship => {
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (board[y][x].shipId === ship.id && !board[y][x].isHit) {
                        return false; // Нашли хотя бы одну не подбитую часть корабля
                    }
                }
            }
            return true; // Все части этого корабля подбиты
        });
    }

    function endGame(playerWon) {
        isGameOver = true;
        gameOverOverlay.classList.remove('hidden');
        gameStatus.textContent = "Игра окончена!";
        gameOverMessage.textContent = playerWon ? "Поздравляем, вы победили!" : "Вы проиграли. Попробуйте снова!";
    }
    
    function resetSetup() {
        playerBoard = createEmptyBoard();
        shipsToPlace = JSON.parse(JSON.stringify(SHIPS_CONFIG)); // Глубокое копирование
        selectedShip = shipsToPlace[0];
        renderGrid(playerSetupGrid, playerBoard, true);
        renderShipSelection();
    }
    
    function startGame() {
        // Инициализация переменных состояния
        playerBoard = createEmptyBoard();
        computerBoard = createEmptyBoard();
        shipsToPlace = JSON.parse(JSON.stringify(SHIPS_CONFIG));
        selectedShip = shipsToPlace[0];
        isVertical = false;
        isPlayerTurn = true;
        isGameOver = false;
        computerAi = new ComputerAI();
        
        // Сброс и настройка UI
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        gameOverOverlay.classList.add('hidden');
        orientationCheckbox.checked = false;
        
        renderGrid(playerSetupGrid, playerBoard, true);
        renderShipSelection();
    }
    
    // Запуск игры при первой загрузке
    startGame();

    // Назначение обработчиков
    playerSetupGrid.addEventListener('click', handleSetupCellClick);
    playerSetupGrid.addEventListener('mouseover', handleSetupCellMouseOver);
    playerSetupGrid.addEventListener('mouseout', handleSetupCellMouseOut);
    
    orientationCheckbox.addEventListener('change', (e) => isVertical = e.target.checked);
    
    randomPlaceBtn.addEventListener('click', () => {
        playerBoard = createEmptyBoard();
        randomlyPlaceShips(playerBoard, shipsToPlace);
        shipsToPlace = [];
        selectedShip = null;
        renderGrid(playerSetupGrid, playerBoard, true);
        renderShipSelection();
    });

    resetBtn.addEventListener('click', resetSetup);
    
    startGameBtn.addEventListener('click', () => {
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        computerBoard = createEmptyBoard();
        randomlyPlaceShips(computerBoard, SHIPS_CONFIG);
        renderGrid(playerGameGrid, playerBoard, true);
        renderGrid(computerGameGrid, computerBoard, false);
    });

    computerGameGrid.addEventListener('click', handleComputerGridClick);
    playAgainBtn.addEventListener('click', startGame);
}

/**
 * ИЗМЕНЕНО: Класс AI теперь "знает" о потопленных кораблях
 */
class ComputerAI {
    constructor() {
        this.reset();
    }
    reset() {
        this.shots = Array(10).fill(null).map(() => Array(10).fill(false));
        this.mode = 'hunt'; // 'hunt' или 'target'
        this.targetQueue = [];
        this.currentHits = [];
    }
    makeMove(board) {
        let x, y;
        // Если есть приоритетные цели, атакуем их
        if (this.mode === 'target' && this.targetQueue.length > 0) {
            const move = this.targetQueue.shift();
            x = move.x;
            y = move.y;
        } else {
            // Иначе ищем новую цель
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
            this.currentHits.push({x, y});
            
            // Если это второе попадание в один корабль, можно определить направление
            if (this.currentHits.length >= 2) {
                const isVertical = this.currentHits[0].x === this.currentHits[1].x;
                this.targetQueue = []; // Очищаем старые догадки
                this.currentHits.forEach(hit => {
                    if (isVertical) {
                        this.addToQueue(hit.x, hit.y + 1);
                        this.addToQueue(hit.x, hit.y - 1);
                    } else {
                        this.addToQueue(hit.x + 1, hit.y);
                        this.addToQueue(hit.x - 1, hit.y);
                    }
                });
            } else { // Если это первое попадание, добавляем все соседние клетки
                 this.addToQueue(x + 1, y);
                 this.addToQueue(x - 1, y);
                 this.addToQueue(x, y + 1);
                 this.addToQueue(x, y - 1);
            }
        }
    }
    reportSunk() {
        // Корабль потоплен, возвращаемся в режим охоты
        this.mode = 'hunt';
        this.targetQueue = [];
        this.currentHits = [];
    }
    addToQueue(x, y) {
        if (x >= 0 && x < 10 && y >= 0 && y < 10 && !this.shots[y][x]) {
            if (!this.targetQueue.some(p => p.x === x && p.y === y)) {
                this.targetQueue.push({ x, y });
            }
        }
    }
}
