// 58js/apps/battleship.js

/**
 * Возвращает HTML-структуру для игры "Морской бой".
 * @returns {string} HTML-разметка.
 */
export function getHtml() {
    return `
        <style>
            /* НОВАЯ КОНТРАСТНАЯ ЦВЕТОВАЯ ПАЛИТРА */
            .bs-grid {
                display: grid;
                grid-template-columns: repeat(10, 1fr);
                gap: 2px;
            }
            .bs-cell {
                width: 100%;
                aspect-ratio: 1 / 1;
                /* 1. Вода: Тёмно-синий */
                background-color: #1e40af; /* blue-800 */
                border: 1px solid #1d4ed8; /* blue-700 */
                transition: background-color 0.2s;
            }
            #computer-game-grid .bs-cell { cursor: pointer; }
            #computer-game-grid .bs-cell:hover:not(.hit):not(.miss):not(.sunk) { background-color: #2563eb; }
            
            /* 2. Корабль: Тёмно-зелёный */
            .bs-cell.ship { background-color: #166534; border-color: #15803d; } /* green-800 */
            .dark .bs-cell.ship { background-color: #15803d; border-color: #16a34a; }

            /* 3. Промах: Светло-серый */
            .bs-cell.miss { background-color: #94a3b8; cursor: not-allowed; } /* slate-400 */
            
            /* 4. Попадание: Тёмно-оранжевый */
            .bs-cell.hit { background-color: #c2410c; } /* orange-700 */
            
            /* 5. Потопленный корабль: Тёмно-красный */
            .bs-cell.sunk { background-color: #b91c1c; border-color: #991b1b; } /* red-700 */

            .bs-cell.preview-valid { background-color: #22c55e; }
            .bs-cell.preview-invalid { background-color: #f43f5e; }

            /* Стили для списка кораблей с новым цветом */
            #ship-selection-list .ship-item { display: flex; align-items: center; cursor: pointer; padding: 8px; border: 2px solid transparent; border-radius: 6px; transition: all 0.2s; }
            #ship-selection-list .ship-item.horizontal { flex-direction: row; }
            #ship-selection-list .ship-item.vertical { flex-direction: column; align-items: flex-start; }
            #ship-selection-list .ship-item .ship-name { margin-left: 10px; margin-top: 0; }
            #ship-selection-list .ship-item.vertical .ship-name { margin-left: 0; margin-top: 5px; }
            #ship-selection-list .ship-item.selected { border-color: #3b82f6; background-color: #dbeafe; }
            .dark #ship-selection-list .ship-item.selected { background-color: #1e3a8a; }
            #ship-selection-list .ship-item.placed { opacity: 0.4; cursor: not-allowed; background-color: transparent; border-color: transparent; }
            .ship-preview-container { display: flex; gap: 2px; }
            .ship-item.vertical .ship-preview-container { flex-direction: column; }
            .ship-item.horizontal .ship-preview-container { flex-direction: row; }
            .ship-preview-cell {
                width: 18px;
                height: 18px;
                background-color: #166534; /* green-800 */
                border: 1px solid #15803d;
                border-radius: 2px;
            }
            .dark .ship-preview-cell { background-color: #15803d; border-color: #16a34a; }
        </style>
        
        <div class="max-w-4xl mx-auto text-center">
            <div id="setup-screen">
                <h2 class="text-2xl font-bold mb-4">Расстановка кораблей</h2>
                <p class="mb-4 text-gray-600 dark:text-gray-400">Выберите корабль, ориентацию и кликните на поле для размещения.</p>
                <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div class="w-full md:w-1/3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h3 class="font-semibold mb-2">Ваш флот:</h3>
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
                    <div class="w-full md:w-2/3">
                        <div id="player-setup-grid" class="bs-grid shadow-lg"></div>
                    </div>
                </div>
            </div>
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
                     <h2 id="game-over-message" class="text-3xl font-bold"></h2>
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
    const getShipsConfig = () => JSON.parse(JSON.stringify([
        { id: 0, name: "Линкор", size: 4, isPlaced: false }, { id: 1, name: "Крейсер", size: 3, isPlaced: false },
        { id: 2, name: "Крейсер", size: 3, isPlaced: false }, { id: 3, name: "Эсминец", size: 2, isPlaced: false },
        { id: 4, name: "Эсминец", size: 2, isPlaced: false }, { id: 5, name: "Эсминец", size: 2, isPlaced: false },
        { id: 6, name: "Торпедный катер", size: 1, isPlaced: false }, { id: 7, name: "Торпедный катер", size: 1, isPlaced: false },
        { id: 8, name: "Торпедный катер", size: 1, isPlaced: false }, { id: 9, name: "Торпедный катер", size: 1, isPlaced: false }
    ]));
    let playerBoard, computerBoard, playerShips, selectedShip, isVertical, isPlayerTurn, isGameOver, computerAi;
    const dom = {
        setupScreen: document.getElementById('setup-screen'), gameScreen: document.getElementById('game-screen'),
        playerSetupGrid: document.getElementById('player-setup-grid'), shipSelectionList: document.getElementById('ship-selection-list'),
        orientationCheckbox: document.getElementById('orientation-checkbox'), randomPlaceBtn: document.getElementById('random-place-btn'),
        startGameBtn: document.getElementById('start-game-btn'), resetBtn: document.getElementById('reset-btn'),
        gameStatus: document.getElementById('game-status'), playerGameGrid: document.getElementById('player-game-grid'),
        computerGameGrid: document.getElementById('computer-game-grid'), gameOverOverlay: document.getElementById('game-over-overlay'),
        gameOverMessage: document.getElementById('game-over-message'), playAgainBtn: document.getElementById('play-again-btn'),
    };
    function createEmptyBoard() { return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ shipId: null, isHit: false, isSunk: false }))); }
    function renderGrid(gridElement, board, isPlayer) {
        gridElement.innerHTML = '';
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'bs-cell';
                cell.dataset.x = x; cell.dataset.y = y;
                const cellState = board[y][x];
                if (cellState.shipId !== null && (isPlayer || cellState.isHit)) cell.classList.add('ship');
                if (cellState.isHit && cellState.shipId !== null) cell.classList.add('hit');
                if (cellState.isHit && cellState.shipId === null) cell.classList.add('miss');
                if (cellState.isSunk) cell.classList.add('sunk');
                gridElement.appendChild(cell);
            }
        }
    }
    function renderShipSelection() {
        dom.shipSelectionList.innerHTML = '';
        const orientationClass = isVertical ? 'vertical' : 'horizontal';
        playerShips.forEach(ship => {
            const item = document.createElement('div');
            item.className = `ship-item ${orientationClass}`;
            const previewContainer = document.createElement('div');
            previewContainer.className = 'ship-preview-container';
            for (let i = 0; i < ship.size; i++) {
                const cell = document.createElement('div');
                cell.className = 'ship-preview-cell';
                previewContainer.appendChild(cell);
            }
            const name = document.createElement('span');
            name.className = 'ship-name';
            name.textContent = `${ship.name}`;
            item.appendChild(previewContainer);
            item.appendChild(name);
            if (ship.isPlaced) {
                item.classList.add('placed');
            } else {
                 item.addEventListener('click', () => { selectedShip = ship; renderShipSelection(); });
            }
            if (selectedShip && ship.id === selectedShip.id) item.classList.add('selected');
            dom.shipSelectionList.appendChild(item);
        });
        const allPlaced = playerShips.every(s => s.isPlaced);
        dom.startGameBtn.disabled = !allPlaced;
        if (allPlaced) dom.shipSelectionList.innerHTML = '<p class="p-2 text-green-600 dark:text-green-400">Флот готов к бою!</p>';
    }
    function isValidPlacement(board, ship, x, y, isVertical) {
        if (!ship) return false;
        if ((isVertical ? y + ship.size : x + ship.size) > GRID_SIZE) return false;
        for (let i = 0; i < ship.size; i++) {
            const currentX = isVertical ? x : x + i;
            const currentY = isVertical ? y + i : y;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const checkX = currentX + dx, checkY = currentY + dy;
                if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10 && board[checkY][checkX].shipId !== null) return false;
            }
        }
        return true;
    }
    function placeShip(board, ship, x, y, isVertical) { for (let i = 0; i < ship.size; i++) { if (isVertical) board[y + i][x].shipId = ship.id; else board[y][x + i].shipId = ship.id; } }
    function handleSetupCellMouseOver(e) {
        if (!selectedShip || selectedShip.isPlaced || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x), y = parseInt(e.target.dataset.y);
        const valid = isValidPlacement(playerBoard, selectedShip, x, y, isVertical);
        for (let i = 0; i < selectedShip.size; i++) {
            const previewX = isVertical ? x : x + i, previewY = isVertical ? y + i : y;
            if (previewX < 10 && previewY < 10) dom.playerSetupGrid.querySelector(`[data-x='${previewX}'][data-y='${previewY}']`)?.classList.add(valid ? 'preview-valid' : 'preview-invalid');
        }
    }
    function handleSetupCellMouseOut() { dom.playerSetupGrid.querySelectorAll('.bs-cell').forEach(c => c.classList.remove('preview-valid', 'preview-invalid')); }
    function handleSetupCellClick(e) {
        if (!selectedShip || selectedShip.isPlaced || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x), y = parseInt(e.target.dataset.y);
        if (isValidPlacement(playerBoard, selectedShip, x, y, isVertical)) {
            placeShip(playerBoard, selectedShip, x, y, isVertical);
            selectedShip.isPlaced = true;
            selectedShip = playerShips.find(s => !s.isPlaced) || null;
            renderGrid(dom.playerSetupGrid, playerBoard, true);
            renderShipSelection();
        }
    }
    function randomlyPlaceShips(board, ships) {
        ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const isVertical = Math.random() < 0.5, x = Math.floor(Math.random() * 10), y = Math.floor(Math.random() * 10);
                if (isValidPlacement(board, ship, x, y, isVertical)) {
                    placeShip(board, ship, x, y, isVertical);
                    ship.isPlaced = true;
                    placed = true;
                }
            }
        });
    }
    /**
     * ИЗМЕНЕНО: Логика обработки хода игрока
     */
    function handleComputerGridClick(e) {
        if (!isPlayerTurn || isGameOver || !e.target.dataset.x) return;
        const x = parseInt(e.target.dataset.x), y = parseInt(e.target.dataset.y);
        const cell = computerBoard[y][x];
        if (cell.isHit) return;
        cell.isHit = true;
        
        const hitShip = cell.shipId !== null;
        if (hitShip) checkAndMarkSunkShips(computerBoard, x, y);
        renderGrid(dom.computerGameGrid, computerBoard, false);

        if (checkWinCondition(computerBoard)) {
            endGame(true);
            return;
        }

        if (hitShip) {
            dom.gameStatus.textContent = "Попадание! Ваш ход снова.";
            // Не передаем ход компьютеру
        } else {
            dom.gameStatus.textContent = "Промах. Ход противника...";
            isPlayerTurn = false;
            setTimeout(computerTurn, 1500);
        }
    }
    /**
     * ИЗМЕНЕНО: Логика обработки хода компьютера
     */
    function computerTurn() {
        if (isGameOver) return;
        const { x, y } = computerAi.makeMove(playerBoard);
        const cell = playerBoard[y][x];
        cell.isHit = true;
        const hitShip = cell.shipId !== null;
        computerAi.reportResult(x, y, hitShip);
        if (hitShip) {
            const sunkShipId = checkAndMarkSunkShips(playerBoard, x, y);
            if (sunkShipId !== null) computerAi.reportSunk();
        }
        renderGrid(dom.playerGameGrid, playerBoard, true);

        if (checkWinCondition(playerBoard)) {
            endGame(false);
            return;
        }

        if (hitShip) {
            dom.gameStatus.textContent = "Противник попал! Его ход снова.";
            setTimeout(computerTurn, 1500); // Компьютер ходит еще раз
        } else {
            dom.gameStatus.textContent = "Противник промахнулся. Ваш ход.";
            isPlayerTurn = true;
        }
    }
    function checkAndMarkSunkShips(board, x, y) {
        const shipId = board[y][x].shipId;
        if (shipId === null) return null;
        const shipCells = [];
        board.forEach((row, r_idx) => row.forEach((cell, c_idx) => { if (cell.shipId === shipId) shipCells.push({x: c_idx, y: r_idx}); }));
        if (shipCells.every(cell => board[cell.y][cell.x].isHit)) {
            shipCells.forEach(cell => {
                board[cell.y][cell.x].isSunk = true;
                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                    const checkX = cell.x + dx, checkY = cell.y + dy;
                    if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10 && !board[checkY][checkX].isHit) board[checkY][checkX].isHit = true;
                }
            });
            return shipId;
        }
        return null;
    }
    function checkWinCondition(board) {
        return getShipsConfig().every(ship => {
            const shipCells = [];
            board.forEach((row, r_idx) => row.forEach((cell, c_idx) => { if (cell.shipId === ship.id) shipCells.push(cell); }));
            return shipCells.every(c => c.isHit);
        });
    }
    function endGame(playerWon) {
        isGameOver = true;
        dom.gameOverOverlay.classList.remove('hidden');
        dom.gameStatus.textContent = "Игра окончена!";
        dom.gameOverMessage.textContent = playerWon ? "Поздравляем, вы победили!" : "Вы проиграли. Попробуйте снова!";
        dom.gameOverMessage.className = playerWon ? 'text-3xl font-bold text-green-500' : 'text-3xl font-bold text-red-500';
    }
    function resetSetup() {
        playerBoard = createEmptyBoard();
        playerShips = getShipsConfig();
        selectedShip = playerShips.find(s => !s.isPlaced);
        renderGrid(dom.playerSetupGrid, playerBoard, true);
        renderShipSelection();
    }
    function initGame() {
        playerBoard = createEmptyBoard(); computerBoard = createEmptyBoard();
        playerShips = getShipsConfig(); selectedShip = playerShips[0];
        isVertical = false; isPlayerTurn = true; isGameOver = false;
        computerAi = new ComputerAI();
        dom.gameScreen.classList.add('hidden'); dom.setupScreen.classList.remove('hidden');
        dom.gameOverOverlay.classList.add('hidden'); dom.orientationCheckbox.checked = false;
        renderGrid(dom.playerSetupGrid, playerBoard, true);
        renderShipSelection();
    }
    initGame();
    dom.playerSetupGrid.addEventListener('click', handleSetupCellClick);
    dom.playerSetupGrid.addEventListener('mouseover', handleSetupCellMouseOver);
    dom.playerSetupGrid.addEventListener('mouseout', handleSetupCellMouseOut);
    dom.orientationCheckbox.addEventListener('change', (e) => { isVertical = e.target.checked; renderShipSelection(); });
    dom.randomPlaceBtn.addEventListener('click', () => {
        playerBoard = createEmptyBoard(); playerShips = getShipsConfig();
        randomlyPlaceShips(playerBoard, playerShips);
        selectedShip = null;
        renderGrid(dom.playerSetupGrid, playerBoard, true); renderShipSelection();
    });
    dom.resetBtn.addEventListener('click', resetSetup);
    dom.startGameBtn.addEventListener('click', () => {
        dom.setupScreen.classList.add('hidden'); dom.gameScreen.classList.remove('hidden');
        computerBoard = createEmptyBoard();
        randomlyPlaceShips(computerBoard, getShipsConfig());
        renderGrid(dom.playerGameGrid, playerBoard, true);
        renderGrid(dom.computerGameGrid, computerBoard, false);
    });
    dom.computerGameGrid.addEventListener('click', handleComputerGridClick);
    dom.playAgainBtn.addEventListener('click', initGame);
}
class ComputerAI {
    constructor() { this.reset(); }
    reset() { this.shots = Array(10).fill(null).map(() => Array(10).fill(false)); this.mode = 'hunt'; this.targetQueue = []; this.currentHits = []; }
    makeMove() {
        let x, y;
        if (this.mode === 'target' && this.targetQueue.length > 0) {
            const move = this.targetQueue.shift();
            x = move.x; y = move.y;
        } else {
            this.mode = 'hunt';
            const possibleMoves = [];
            for(let r=0; r<10; r++) for(let c=0; c<10; c++) if(!this.shots[r][c]) possibleMoves.push({x:c, y:r});
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            x = move.x; y = move.y;
        }
        this.shots[y][x] = true;
        return { x, y };
    }
    reportResult(x, y, isHit) {
        if (isHit) {
            this.mode = 'target';
            this.currentHits.push({x, y});
            if (this.currentHits.length >= 2) {
                const isVertical = this.currentHits[0].x === this.currentHits[1].x;
                this.targetQueue = [];
                const allCoords = this.currentHits.map(h => isVertical ? h.y : h.x);
                const min = Math.min(...allCoords), max = Math.max(...allCoords);
                if(isVertical) { this.addToQueue(x, min - 1); this.addToQueue(x, max + 1); }
                else { this.addToQueue(min - 1, y); this.addToQueue(max + 1, y); }
            } else { this.addToQueue(x + 1, y); this.addToQueue(x - 1, y); this.addToQueue(x, y + 1); this.addToQueue(x, y - 1); }
        }
    }
    reportSunk() { this.mode = 'hunt'; this.targetQueue = []; this.currentHits = []; }
    addToQueue(x, y) { if (x >= 0 && x < 10 && y >= 0 && y < 10 && !this.shots[y][x] && !this.targetQueue.some(p => p.x === x && p.y === y)) this.targetQueue.push({ x, y }); }
}
