let minesweeperTimer;

export function getHtml() {
    return `
        <div id="minesweeper-game" class="p-2 flex flex-col items-center">
            <div id="ms-settings" class="flex flex-wrap justify-center gap-2 mb-4">
                <button data-difficulty="easy" class="ms-difficulty-btn bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600">Новичок</button>
                <button data-difficulty="medium" class="ms-difficulty-btn bg-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:bg-yellow-600">Любитель</button>
                <button data-difficulty="hard" class="ms-difficulty-btn bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600">Профи</button>
            </div>
            <div id="ms-status-bar" class="w-full max-w-lg flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-2 rounded-lg mb-4 hidden">
                <div class="w-20 font-mono text-lg text-red-500 text-left">🚩 <span id="ms-mines-left">0</span></div>
                <div class="flex-1 text-center"><button id="ms-face-btn" class="text-3xl">🙂</button></div>
                <div id="ms-timer" class="w-20 font-mono text-lg text-right">0</div>
            </div>
            <div id="ms-board-container" class="bg-gray-300 dark:bg-gray-800 p-1 sm:p-2 rounded-md shadow-inner">
                <div id="ms-board" class="grid" style="grid-template-columns: repeat(var(--ms-width, 10), 1fr); gap: 1px;"></div>
            </div>
            <p id="ms-instructions" class="mt-4 text-center text-gray-500 dark:text-gray-400">Выберите уровень сложности, чтобы начать игру.</p>
        </div>`;
}

export function init() {
    const difficulties = {
        easy: { width: 10, height: 10, bombs: 10, name: 'easy' },
        medium: { width: 16, height: 16, bombs: 40, name: 'medium' },
        hard: { width: 20, height: 16, bombs: 60, name: 'hard' }
    };
    let currentDifficulty;
    let board = [], cells = [];
    let isGameOver = false, isFirstClick = true, flags = 0, time = 0;

    const boardEl = document.getElementById('ms-board');
    const minesLeftEl = document.getElementById('ms-mines-left');
    const faceBtn = document.getElementById('ms-face-btn');
    const timerEl = document.getElementById('ms-timer');
    const settingsEl = document.getElementById('ms-settings');
    const statusBarEl = document.getElementById('ms-status-bar');
    const instructionsEl = document.getElementById('ms-instructions');
    
    const bombSVG = `<svg class="w-full h-full text-gray-800 dark:text-gray-200" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="14" fill="currentColor"/><path d="M32 18L32 10M32 54L32 46M18 32L10 32M54 32L46 32M20 20L14 14M44 44L50 50M20 44L14 50M44 20L50 14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;

    const getNeighbors = (id) => {
        const neighbors = [];
        const isLeftEdge = (id % currentDifficulty.width === 0);
        const isRightEdge = (id % currentDifficulty.width === currentDifficulty.width - 1);
        const width = currentDifficulty.width;
        const offsets = [-width-1, -width, -width+1, -1, 1, width-1, width, width+1];
        offsets.forEach(offset => {
            const neighborIndex = id + offset;
            if (neighborIndex >= 0 && neighborIndex < (currentDifficulty.width * currentDifficulty.height) ) {
                 if (isLeftEdge && (neighborIndex % width === width - 1)) return;
                 if (isRightEdge && (neighborIndex % width === 0)) return;
                 neighbors.push(neighborIndex);
            }
        });
        return neighbors;
    };

    const startGame = (difficulty) => {
        if (minesweeperTimer) clearInterval(minesweeperTimer);
        currentDifficulty = difficulty;
        isGameOver = false; isFirstClick = true; flags = 0; time = 0; board = [];
        
        statusBarEl.classList.remove('hidden');
        instructionsEl.classList.add('hidden');
        minesLeftEl.textContent = currentDifficulty.bombs;
        timerEl.textContent = time;
        faceBtn.textContent = '🙂';
        
        boardEl.innerHTML = '';
        boardEl.style.setProperty('--ms-width', currentDifficulty.width);
        cells = [];

        for (let i = 0; i < currentDifficulty.width * currentDifficulty.height; i++) {
            const cell = document.createElement('div');
            cell.dataset.id = i;
            cell.className = `ms-cell ms-${difficulty.name} flex items-center justify-center font-bold bg-gray-400 dark:bg-gray-600 rounded-sm cursor-pointer hover:bg-gray-400/80`;
            boardEl.appendChild(cell);
            cells.push(cell);
            cell.addEventListener('click', onCellClick);
            cell.addEventListener('contextmenu', onRightClick);
        }
    };

    const createBoard = (firstClickId) => {
        const bombsArray = Array(currentDifficulty.bombs).fill('bomb');
        const emptyArray = Array(currentDifficulty.width * currentDifficulty.height - currentDifficulty.bombs).fill('valid');
        let gameArray = emptyArray.concat(bombsArray).sort(() => Math.random() - 0.5);
        
        if (gameArray[firstClickId] === 'bomb') {
            let validIndex = gameArray.findIndex(sq => sq === 'valid');
            if (validIndex !== -1) [gameArray[firstClickId], gameArray[validIndex]] = [gameArray[validIndex], gameArray[firstClickId]];
        }

        board = [];
        for(let i=0; i<currentDifficulty.width * currentDifficulty.height; i++) {
            board.push({ isBomb: gameArray[i] === 'bomb', isRevealed: false, isFlagged: false, neighbors: 0, id: i });
        }
        
        for (let i = 0; i < board.length; i++) {
            if (board[i].isBomb) continue;
            let total = 0;
            getNeighbors(i).forEach(neighborId => { if(board[neighborId]?.isBomb) total++; });
            board[i].neighbors = total;
        }
    };
    
    const revealCell = (id) => {
        if (id < 0 || id >= board.length || !board[id] || board[id].isRevealed || board[id].isFlagged) return;
        
        const cell = board[id];
        cell.isRevealed = true;
        const cellEl = cells[id];
        cellEl.classList.remove('bg-gray-400', 'dark:bg-gray-600', 'hover:bg-gray-400/80');
        cellEl.classList.add('bg-gray-200', 'dark:bg-gray-700');

        if (cell.isBomb) { gameOver(false, id); return; }
        if (cell.neighbors > 0) {
            cellEl.textContent = cell.neighbors;
            cellEl.classList.add(`ms-cell-${cell.neighbors}`);
        } else {
            setTimeout(() => getNeighbors(id).forEach(neighborId => revealCell(neighborId)), 10);
        }
    };

    const gameOver = (win, clickedBombId) => {
        isGameOver = true;
        clearInterval(minesweeperTimer);
        faceBtn.textContent = win ? '😎' : '😵';

        board.forEach((cell, i) => {
            if (cell.isBomb) {
                cells[i].classList.remove('bg-gray-400', 'dark:bg-gray-600', 'hover:bg-gray-400/80');
                cells[i].classList.add('bg-gray-200', 'dark:bg-gray-700', 'p-0.5');
                cells[i].innerHTML = bombSVG;
            }
            if (i === clickedBombId) cells[i].classList.add('bg-red-500');
        });
    };

    const checkForWin = () => {
        const revealedCount = board.filter(cell => cell.isRevealed).length;
        if (board.length > 0 && revealedCount === (currentDifficulty.width * currentDifficulty.height - currentDifficulty.bombs)) {
            gameOver(true);
        }
    };

    const onCellClick = (e) => {
        const cellEl = e.target.closest('.ms-cell');
        if (!cellEl) return;
        const id = parseInt(cellEl.dataset.id);
        
        if (isGameOver) return;
        if (isFirstClick) {
            createBoard(id);
            isFirstClick = false;
            minesweeperTimer = setInterval(() => { time++; timerEl.textContent = time; }, 1000);
        }
        if (board[id].isRevealed || board[id].isFlagged) return;
        if (board[id].isBomb) { gameOver(false, id); return; }
        revealCell(id);
        checkForWin();
    };

    const onRightClick = (e) => {
        e.preventDefault();
        const cellEl = e.target.closest('.ms-cell');
        if (!cellEl) return;
        const id = parseInt(cellEl.dataset.id);
        
        if (isGameOver || board.length === 0 || board[id].isRevealed) return;
        
        board[id].isFlagged = !board[id].isFlagged;
        flags += board[id].isFlagged ? 1 : -1;
        cells[id].textContent = board[id].isFlagged ? '🚩' : '';
        minesLeftEl.textContent = currentDifficulty.bombs - flags;
        checkForWin();
    };
    
    settingsEl.addEventListener('click', e => {
        const btn = e.target.closest('.ms-difficulty-btn');
        if (btn && difficulties[btn.dataset.difficulty]) {
            startGame(difficulties[btn.dataset.difficulty]);
        }
    });

    faceBtn.addEventListener('click', () => {
        if (currentDifficulty) startGame(currentDifficulty);
    });
}

export function cleanup() {
    if (minesweeperTimer) {
        clearInterval(minesweeperTimer);
        minesweeperTimer = null;
    }
}
