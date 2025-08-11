let minesweeperTimer;

export function getHtml() {
    return `
        <div id="minesweeper-game" class="p-4 flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl font-sans">
            <div id="ms-settings" class="flex flex-wrap justify-center gap-3 mb-5">
                <button data-difficulty="easy" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md">Новичок</button>
                <button data-difficulty="medium" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md">Любитель</button>
                <button data-difficulty="hard" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md">Профи</button>
            </div>
            <div id="ms-status-bar" class="w-full max-w-md flex justify-between items-center bg-gray-200 dark:bg-gray-800 p-2 rounded-lg mb-4 hidden shadow-inner">
                <div class="w-24 font-mono text-xl text-center text-white bg-gray-800 dark:bg-black/20 p-2 rounded-md">🚩 <span id="ms-mines-left">0</span></div>
                <div class="flex-1 text-center"><button id="ms-face-btn" class="text-4xl transform transition-transform duration-200 hover:scale-110 focus:outline-none">🙂</button></div>
                <div id="ms-timer" class="w-24 font-mono text-xl text-center text-white bg-gray-800 dark:bg-black/20 p-2 rounded-md">0</div>
            </div>
            <div id="ms-board-container" class="bg-gray-400/50 dark:bg-gray-700/50 p-2 rounded-md shadow-lg">
                <div id="ms-board" class="grid" style="grid-template-columns: repeat(var(--ms-width, 10), 1fr); gap: 2px;"></div>
            </div>
            <p id="ms-instructions" class="mt-4 text-center text-gray-600 dark:text-gray-400">Выберите уровень сложности, чтобы начать игру.</p>
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
    
    const bombSVG = `<svg class="w-full h-full text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C9.23858 2 7 4.23858 7 7C7 9.45862 8.79815 11.5168 11.0625 11.9375L7.5 19H16.5L12.9375 11.9375C15.2018 11.5168 17 9.45862 17 7C17 4.23858 14.7614 2 12 2ZM12 4C13.6569 4 15 5.34315 15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4Z"/></svg>`;

    const getNeighbors = (id) => {
        const neighbors = [];
        const isLeftEdge = (id % currentDifficulty.width === 0);
        const isRightEdge = (id % currentDifficulty.width === currentDifficulty.width - 1);
        const width = currentDifficulty.width;
        const totalCells = currentDifficulty.width * currentDifficulty.height;

        const offsets = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1];

        offsets.forEach(offset => {
            const neighborIndex = id + offset;
            if (neighborIndex >= 0 && neighborIndex < totalCells) {
                 if (isLeftEdge && ((id + offset) % width === width - 1)) return;
                 if (isRightEdge && ((id + offset) % width === 0)) return;
                 neighbors.push(neighborIndex);
            }
        });
        return neighbors.filter(nId => board[nId] !== undefined);
    };

    const startGame = (difficulty) => {
        if (minesweeperTimer) clearInterval(minesweeperTimer);
        currentDifficulty = difficulty;
        isGameOver = false; isFirstClick = true; flags = 0; time = 0; board = [];
        
        statusBarEl.classList.remove('hidden');
        instructionsEl.classList.add('hidden');
        faceBtn.classList.remove('animate-bounce', 'animate-spin');
        minesLeftEl.textContent = currentDifficulty.bombs;
        timerEl.textContent = time;
        faceBtn.textContent = '🙂';
        
        boardEl.innerHTML = '';
        boardEl.style.setProperty('--ms-width', currentDifficulty.width);
        cells = [];

        board = Array.from({ length: currentDifficulty.width * currentDifficulty.height }, (_, i) => ({ id: i, isBomb: false, isRevealed: false, isFlagged: false, neighbors: 0 }));

        for (let i = 0; i < currentDifficulty.width * currentDifficulty.height; i++) {
            const cell = document.createElement('div');
            cell.dataset.id = i;
            // FIX: Added 'aspect-square' to ensure cells are visible
            cell.className = `ms-cell aspect-square ms-${difficulty.name} flex items-center justify-center font-bold text-xl bg-gray-400 dark:bg-gray-600 rounded-sm cursor-pointer transition-colors duration-200 hover:bg-gray-500/80 dark:hover:bg-gray-500/80`;
            boardEl.appendChild(cell);
            cells.push(cell);
            cell.addEventListener('click', onCellClick);
            cell.addEventListener('contextmenu', onRightClick);
        }
    };

    const createBoard = (firstClickId) => {
        const totalCells = currentDifficulty.width * currentDifficulty.height;
        const bombsArray = Array(currentDifficulty.bombs).fill('bomb');
        const emptyArray = Array(totalCells - currentDifficulty.bombs).fill('valid');
        let gameArray = emptyArray.concat(bombsArray).sort(() => Math.random() - 0.5);
        
        while (gameArray[firstClickId] === 'bomb' || getNeighbors(firstClickId).some(n => gameArray[n] === 'bomb')) {
             gameArray.sort(() => Math.random() - 0.5);
        }

        for(let i=0; i < totalCells; i++) {
            board[i].isBomb = (gameArray[i] === 'bomb');
        }
        
        for (let i = 0; i < totalCells; i++) {
            if (board[i].isBomb) continue;
            let total = 0;
            getNeighbors(i).forEach(neighborId => { if(board[neighborId]?.isBomb) total++; });
            board[i].neighbors = total;
        }
    };
    
    const revealCell = (id) => {
        const cell = board[id];
        if (!cell || cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        const cellEl = cells[id];
        cellEl.classList.remove('bg-gray-400', 'dark:bg-gray-600', 'hover:bg-gray-500/80', 'dark:hover:bg-gray-500/80');
        cellEl.classList.add('bg-gray-300', 'dark:bg-gray-800/60');
        cellEl.style.cursor = 'default';

        if (cell.isBomb) { gameOver(false, id); return; }
        if (cell.neighbors > 0) {
            cellEl.textContent = cell.neighbors;
            // Added text colors for numbers
            const colorClasses = ['', 'text-blue-500', 'text-green-600', 'text-red-500', 'text-blue-800', 'text-red-800', 'text-teal-500', 'text-black', 'text-gray-500'];
            cellEl.classList.add(colorClasses[cell.neighbors]);
        } else {
            setTimeout(() => getNeighbors(id).forEach(neighborId => revealCell(neighborId)), 10);
        }
        checkForWin();
    };
    
    const chord = (id) => {
        const cell = board[id];
        if (!cell.isRevealed || cell.neighbors === 0) return;

        const neighbors = getNeighbors(id);
        const flaggedNeighbors = neighbors.filter(nId => board[nId].isFlagged).length;

        if (cell.neighbors === flaggedNeighbors) {
            neighbors.forEach(nId => {
                if (!board[nId].isFlagged && !board[nId].isRevealed) {
                    revealCell(nId);
                }
            });
        }
    };

    const gameOver = (win, clickedBombId) => {
        if(isGameOver) return;
        isGameOver = true;
        clearInterval(minesweeperTimer);
        faceBtn.textContent = win ? '😎' : '😵';
        faceBtn.classList.add(win ? 'animate-bounce' : 'animate-spin');

        board.forEach((cell, i) => {
            cells[i].removeEventListener('click', onCellClick);
            cells[i].removeEventListener('contextmenu', onRightClick);

            if (cell.isBomb && !cell.isFlagged) {
                cells[i].classList.remove('bg-gray-400', 'dark:bg-gray-600');
                cells[i].classList.add('bg-gray-300', 'dark:bg-gray-700', 'p-1');
                cells[i].innerHTML = bombSVG;
            }
            if (cell.isFlagged && !cell.isBomb) {
                 cells[i].classList.add('bg-yellow-400'); // Wrong flag
            }
            if (i === clickedBombId) {
                cells[i].classList.add('bg-red-500/70', 'animate-pulse');
            }
        });
    };

    const checkForWin = () => {
        if(isGameOver) return;
        const revealedCount = board.filter(cell => cell.isRevealed).length;
        if (revealedCount === (currentDifficulty.width * currentDifficulty.height - currentDifficulty.bombs)) {
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
        
        const cell = board[id];
        if (cell.isRevealed) {
            chord(id);
        } else if (!cell.isFlagged) {
            revealCell(id);
        }
    };

    const onRightClick = (e) => {
        e.preventDefault();
        const cellEl = e.target.closest('.ms-cell');
        if (!cellEl) return;
        const id = parseInt(cellEl.dataset.id);
        
        if (isGameOver || board[id].isRevealed) return;
        
        if (!isFirstClick && !board[id].isFlagged && flags >= currentDifficulty.bombs) return;

        board[id].isFlagged = !board[id].isFlagged;
        flags += board[id].isFlagged ? 1 : -1;
        cells[id].textContent = board[id].isFlagged ? '🚩' : '';
        cells[id].classList.toggle('text-xl', board[id].isFlagged);
        minesLeftEl.textContent = currentDifficulty.bombs - flags;
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
