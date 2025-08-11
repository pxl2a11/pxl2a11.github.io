let minesweeperTimer;

export function getHtml() {
    return `
        <div id="minesweeper-game" class="p-2 flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg">
            <div id="ms-settings" class="flex flex-wrap justify-center gap-3 mb-4">
                <button data-difficulty="easy" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">Новичок</button>
                <button data-difficulty="medium" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105">Любитель</button>
                <button data-difficulty="hard" class="ms-difficulty-btn text-white font-bold py-2 px-5 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105">Профи</button>
            </div>
            <div id="ms-status-bar" class="w-full max-w-lg flex justify-between items-center bg-gray-200 dark:bg-gray-800 p-2 rounded-lg mb-4 hidden shadow-inner">
                <div class="w-24 font-mono text-lg text-red-500 text-left bg-gray-800 dark:bg-gray-900 p-2 rounded-md">🚩 <span id="ms-mines-left">0</span></div>
                <div class="flex-1 text-center"><button id="ms-face-btn" class="text-4xl transform transition-transform duration-200 hover:scale-110">🙂</button></div>
                <div id="ms-timer" class="w-24 font-mono text-lg text-right bg-gray-800 dark:bg-gray-900 text-white p-2 rounded-md">0</div>
            </div>
            <div id="ms-board-container" class="bg-gray-300 dark:bg-gray-700 p-1 sm:p-2 rounded-md shadow-lg">
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
    
    const bombSVG = `<svg class="w-full h-full text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C10.8954 2 10 2.89543 10 4V6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6V4C14 2.89543 13.1046 2 12 2Z" fill="currentColor"/><path d="M12 16C10.8954 16 10 16.8954 10 18V20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20V18C14 16.8954 13.1046 16 12 16Z" fill="currentColor"/><path d="M22 12C22 10.8954 21.1046 10 20 10H18C16.8954 10 16 10.8954 16 12C16 13.1046 16.8954 14 18 14H20C21.1046 14 22 13.1046 22 12Z" fill="currentColor"/><path d="M8 12C8 10.8954 7.10457 10 6 10H4C2.89543 10 2 10.8954 2 12C2 13.1046 2.89543 14 4 14H6C7.10457 14 8 13.1046 8 12Z" fill="currentColor"/><path d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6Z" fill="currentColor"/></svg>`;

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
        return neighbors.filter(nId => board[nId]);
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

        // Создаем доску из "пустых" ячеек для инициализации
        board = Array.from({ length: currentDifficulty.width * currentDifficulty.height }, (_, i) => ({ id: i, isBomb: false, isRevealed: false, isFlagged: false, neighbors: 0 }));

        for (let i = 0; i < currentDifficulty.width * currentDifficulty.height; i++) {
            const cell = document.createElement('div');
            cell.dataset.id = i;
            cell.className = `ms-cell ms-${difficulty.name} flex items-center justify-center font-bold bg-gray-400 dark:bg-gray-600 rounded-sm cursor-pointer transition-colors duration-200 hover:bg-gray-500/80 dark:hover:bg-gray-500/80`;
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
        
        // Гарантируем, что первый клик не будет по бомбе
        while (gameArray[firstClickId] === 'bomb') {
             gameArray.sort(() => Math.random() - 0.5);
        }

        for(let i=0; i< board.length; i++) {
            board[i].isBomb = (gameArray[i] === 'bomb');
        }
        
        for (let i = 0; i < board.length; i++) {
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
        cellEl.classList.add('bg-gray-300', 'dark:bg-gray-700');

        if (cell.isBomb) { gameOver(false, id); return; }
        if (cell.neighbors > 0) {
            cellEl.textContent = cell.neighbors;
            cellEl.classList.add(`ms-cell-${cell.neighbors}`);
        } else { // Пустая ячейка, рекурсивно открываем соседей
            setTimeout(() => getNeighbors(id).forEach(neighborId => revealCell(neighborId)), 10);
        }
        checkForWin();
    };
    
    // Новая функция "Аккорд"
    const chord = (id) => {
        const cell = board[id];
        const neighbors = getNeighbors(id);
        const flaggedNeighbors = neighbors.filter(nId => board[nId].isFlagged).length;

        if (cell.neighbors === flaggedNeighbors) {
            neighbors.forEach(nId => revealCell(nId));
        }
    };

    const gameOver = (win, clickedBombId) => {
        if(isGameOver) return;
        isGameOver = true;
        clearInterval(minesweeperTimer);
        faceBtn.textContent = win ? '😎' : '😵';
        faceBtn.classList.add(win ? 'animate-bounce' : 'animate-spin');

        board.forEach((cell, i) => {
            if (cell.isBomb) {
                cells[i].classList.remove('bg-gray-400', 'dark:bg-gray-600');
                cells[i].classList.add('bg-gray-300', 'dark:bg-gray-700', 'p-1');
                cells[i].innerHTML = bombSVG;
            }
            if (i === clickedBombId) {
                cells[i].classList.remove('bg-gray-300', 'dark:bg-gray-700');
                cells[i].classList.add('bg-red-500', 'animate-pulse');
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
        if (cell.isRevealed && cell.neighbors > 0) {
            chord(id); // Выполняем "аккорд", если клик по открытой ячейке
        } else if (!cell.isFlagged) {
            revealCell(id);
        }
    };

    const onRightClick = (e) => {
        e.preventDefault();
        const cellEl = e.target.closest('.ms-cell');
        if (!cellEl) return;
        const id = parseInt(cellEl.dataset.id);
        
        if (isGameOver || isFirstClick || board[id].isRevealed) return;
        
        board[id].isFlagged = !board[id].isFlagged;
        flags += board[id].isFlagged ? 1 : -1;
        cells[id].textContent = board[id].isFlagged ? '🚩' : '';
        cells[id].classList.toggle('text-xl', board[id].isFlagged)
        minesLeftEl.textContent = currentDifficulty.bombs - flags;
    };
    
    settingsEl.addEventListener('click', e => {
        const btn = e.target.closest('.ms-difficulty-btn');
        if (btn && difficulties[btn.dataset.difficulty]) {
            startGame(difficulties[btn.dataset.difficulty]);
            faceBtn.classList.remove('animate-bounce', 'animate-spin');
        }
    });

    faceBtn.addEventListener('click', () => {
        if (currentDifficulty) {
             startGame(currentDifficulty);
             faceBtn.classList.remove('animate-bounce', 'animate-spin');
        }
    });
}

export function cleanup() {
    if (minesweeperTimer) {
        clearInterval(minesweeperTimer);
        minesweeperTimer = null;
    }
}
