// js/apps/ticTacToe.js

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center">
            <div id="ttt-mode-selection" class="flex flex-col items-center space-y-4 w-full">
                <h3 class="text-xl font-semibold mb-2">Выберите режим игры</h3>
                <button id="ttt-player-vs-player" class="w-full max-w-xs bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Играть на двоих</button>
                <div class="w-full max-w-xs p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3">
                    <h4 class="text-center font-semibold">Играть с компьютером</h4>
                    <button id="ttt-player-vs-cpu-easy" class="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-600">Легкий</button>
                    <button id="ttt-player-vs-cpu-hard" class="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600">Сложный</button>
                </div>
            </div>
            <div id="ttt-game-container" class="hidden w-full flex flex-col items-center space-y-4">
                 <!-- НОВЫЙ БЛОК: СЧЕТЧИК ПОБЕД -->
                 <div class="flex justify-around w-full max-w-xs text-lg font-bold">
                    <div class="p-2 rounded-lg">Игрок X: <span id="ttt-score-x" class="text-blue-500">0</span></div>
                    <div class="p-2 rounded-lg">Игрок O: <span id="ttt-score-o" class="text-pink-500">0</span></div>
                 </div>
                 <h3 id="ttt-status" class="text-2xl font-semibold mb-2 h-8"></h3>
                 <div id="ttt-board" class="w-full max-w-xs sm:max-w-sm mx-auto grid grid-cols-3 gap-2">
                    ${Array.from({ length: 9 }).map((_, i) => `<div data-cell-index="${i}" class="ttt-cell bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-5xl sm:text-6xl font-bold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 aspect-square"></div>`).join('')}
                 </div>
                 <div class="w-full max-w-xs sm:max-w-sm flex flex-col sm:flex-row gap-2 mt-2">
                     <button id="ttt-play-again-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Повторить игру</button>
                     <button id="ttt-change-mode-btn" class="w-full bg-gray-500 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-600">Сменить режим</button>
                 </div>
            </div>
        </div>
    `;
}

export function init() {
    const modeSelection = document.getElementById('ttt-mode-selection');
    const gameContainer = document.getElementById('ttt-game-container');
    const pvpBtn = document.getElementById('ttt-player-vs-player');
    const pvcEasyBtn = document.getElementById('ttt-player-vs-cpu-easy');
    const pvcHardBtn = document.getElementById('ttt-player-vs-cpu-hard');
    const statusDisplay = document.getElementById('ttt-status');
    const changeModeBtn = document.getElementById('ttt-change-mode-btn');
    const playAgainBtn = document.getElementById('ttt-play-again-btn');
    const cells = document.querySelectorAll('.ttt-cell');
    const scoreXEl = document.getElementById('ttt-score-x'); // Новый элемент
    const scoreOEl = document.getElementById('ttt-score-o'); // Новый элемент

    let gameActive, currentPlayer, gameState, gameMode, cpuDifficulty;
    let scoreX = 0, scoreO = 0; // Новые переменные
    const player = 'X', cpu = 'O';
    const winningConditions = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];

    const messages = { winning: () => `Игрок ${currentPlayer} победил!`, draw: () => `Ничья!`, turn: () => `Ход игрока ${currentPlayer}` };

    const updateScoreDisplay = () => { scoreXEl.textContent = scoreX; scoreOEl.textContent = scoreO; };
    const initializeGame = () => { gameActive = true; currentPlayer = "X"; gameState = Array(9).fill(""); statusDisplay.innerHTML = messages.turn(); cells.forEach(c => { c.innerHTML = ""; c.classList.remove('text-blue-500', 'text-pink-500'); }); };
    const startGame = (mode, difficulty = null) => { gameMode = mode; cpuDifficulty = difficulty; scoreX = 0; scoreO = 0; updateScoreDisplay(); initializeGame(); modeSelection.classList.add('hidden'); gameContainer.classList.remove('hidden'); };
    const handleCellPlayed = (cell, index) => { gameState[index] = currentPlayer; cell.innerHTML = currentPlayer; cell.classList.add(currentPlayer === 'X' ? 'text-blue-500' : 'text-pink-500'); };
    const handleResultValidation = () => {
        let roundWon = winningConditions.some(cond => cond.every(i => gameState[i] === currentPlayer));
        if (roundWon) {
            statusDisplay.innerHTML = messages.winning();
            currentPlayer === "X" ? scoreX++ : scoreO++; // Обновляем счет
            updateScoreDisplay();
            return gameActive = false;
        }
        if (!gameState.includes("")) { statusDisplay.innerHTML = messages.draw(); return gameActive = false; }
        return true;
    };
    const handlePlayerChange = () => { currentPlayer = currentPlayer === "X" ? "O" : "X"; statusDisplay.innerHTML = messages.turn(); };

    // AI Logic (без изменений)
    const handleEasyComputerMove = () => { let move; do { move = Math.floor(Math.random() * 9); } while (gameState[move] !== ""); return move; };
    const evaluate = b => { for (let cond of winningConditions) { const [a, c, d] = cond; if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] === cpu ? 10 : -10; } return 0; };
    const minimax = (board, depth, isMax) => {
        let score = evaluate(board);
        if (score === 10 || score === -10 || !board.includes('')) return score;
        let best = isMax ? -Infinity : Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = isMax ? cpu : player;
                best = isMax ? Math.max(best, minimax(board, depth + 1, !isMax)) : Math.min(best, minimax(board, depth + 1, !isMax));
                board[i] = '';
            }
        }
        return best;
    };
    const findBestMove = board => { let bestVal = -Infinity, bestMove = -1; for (let i = 0; i < 9; i++) { if (board[i] === '') { board[i] = cpu; let moveVal = minimax(board, 0, false); board[i] = ''; if (moveVal > bestVal) { bestMove = i; bestVal = moveVal; } } } return bestMove; };
    const handleComputerMove = () => {
        gameContainer.style.pointerEvents = 'none';
        setTimeout(() => {
            const move = cpuDifficulty === 'easy' ? handleEasyComputerMove() : findBestMove(gameState);
            if (move !== -1) { handleCellPlayed(document.querySelector(`.ttt-cell[data-cell-index='${move}']`), move); if (handleResultValidation()) handlePlayerChange(); }
            gameContainer.style.pointerEvents = 'auto';
        }, 500);
    };

    const handleCellClick = e => {
        const cell = e.target, index = parseInt(cell.getAttribute('data-cell-index'));
        if (!gameActive || gameState[index] !== "" || (gameMode === 'cpu' && currentPlayer === 'O')) return;
        handleCellPlayed(cell, index);
        if (handleResultValidation()) { handlePlayerChange(); if (gameMode === 'cpu' && gameActive) handleComputerMove(); }
    };
    
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    pvpBtn.addEventListener('click', () => startGame('player'));
    pvcEasyBtn.addEventListener('click', () => startGame('cpu', 'easy'));
    pvcHardBtn.addEventListener('click', () => startGame('cpu', 'hard'));
    changeModeBtn.addEventListener('click', () => { gameActive = false; modeSelection.classList.remove('hidden'); gameContainer.classList.add('hidden'); });
    playAgainBtn.addEventListener('click', initializeGame);
}

export function cleanup() {}
