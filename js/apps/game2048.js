// js/apps/game2048.js

let board, scoreEl, boardEl, size = 4;
let grid = [];
let score = 0;
let isGameOver = false;

function getHtml() {
    return `
        <div class="game2048-container">
            <div class="game2048-header">
                <div class="game2048-score-box">
                    <span>СЧЕТ</span>
                    <div id="game2048-score">0</div>
                </div>
                <button id="game2048-new-game-btn" class="filter-btn">Новая игра</button>
            </div>
            <div id="game2048-board"></div>
        </div>
    `;
}

function init() {
    boardEl = document.getElementById('game2048-board');
    scoreEl = document.getElementById('game2048-score');
    document.getElementById('game2048-new-game-btn').addEventListener('click', setupGame);
    
    setupGame();
    
    document.addEventListener('keydown', handleKeydown);

    // Обработка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchStartY = 0;
    boardEl.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    boardEl.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    });
}

function setupGame() {
    isGameOver = false;
    score = 0;
    updateScore();
    boardEl.innerHTML = '';
    grid = [];
    
    const tileContainer = document.createElement('div');
    tileContainer.id = 'tile-container';

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('game2048-cell');
        boardEl.appendChild(cell);
    }
    boardEl.appendChild(tileContainer);

    for (let i = 0; i < size; i++) {
        grid[i] = [];
        for (let j = 0; j < size; j++) {
            grid[i][j] = 0;
        }
    }
    addRandomTile();
    addRandomTile();
    renderBoard();
}

function renderBoard() {
    const tileContainer = document.getElementById('tile-container');
    if (!tileContainer) return;
    tileContainer.innerHTML = '';

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] !== 0) {
                const tile = document.createElement('div');
                const value = grid[i][j];
                tile.textContent = value;
                tile.classList.add('game2048-tile');
                tile.dataset.value = value;
                
                // Рассчитываем ширину и позицию
                const cellWidth = boardEl.clientWidth / size;
                const gap = 10;
                
                tile.style.width = `${cellWidth - gap}px`;
                tile.style.height = `${cellWidth - gap}px`;
                tile.style.top = `${i * cellWidth + gap/2}px`;
                tile.style.left = `${j * cellWidth + gap/2}px`;

                // Динамический размер шрифта
                if (value > 999) tile.style.fontSize = "0.7em";
                else if (value > 99) tile.style.fontSize = "0.9em";

                tileContainer.appendChild(tile);
            }
        }
    }
}

function addRandomTile() {
    if (isGameOver) return;
    const emptyCells = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ x: i, y: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        // Можно добавить анимацию появления
    }
    
    if (checkGameOver()) {
        gameOver();
    }
}

function handleKeydown(e) {
    if (isGameOver) return;
    let moved = false;
    switch (e.key) {
        case 'ArrowUp': moved = moveUp(); break;
        case 'ArrowDown': moved = moveDown(); break;
        case 'ArrowLeft': moved = moveLeft(); break;
        case 'ArrowRight': moved = moveRight(); break;
        default: return;
    }
    if (moved) {
        addRandomTile();
        renderBoard();
    }
}

function handleSwipe(startX, startY, endX, endY) {
    if (isGameOver) return;
    const dx = endX - startX;
    const dy = endY - startY;
    let moved = false;

    if (Math.abs(dx) > Math.abs(dy)) { // Горизонтальный свайп
        if (Math.abs(dx) > 30) moved = dx > 0 ? moveRight() : moveLeft();
    } else { // Вертикальный свайп
        if (Math.abs(dy) > 30) moved = dy > 0 ? moveDown() : moveUp();
    }
     if (moved) {
        addRandomTile();
        renderBoard();
    }
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < size; i++) {
        const row = grid[i];
        const newRow = slide(row);
        grid[i] = merge(newRow);
        if (grid[i].join(',') !== row.join(',')) moved = true;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let i = 0; i < size; i++) {
        const row = grid[i].reverse();
        const newRow = slide(row);
        grid[i] = merge(newRow).reverse();
        if (grid[i].join(',') !== grid[i].reverse().join(',')) moved = true;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let j = 0; j < size; j++) {
        const col = [];
        for (let i = 0; i < size; i++) col.push(grid[i][j]);
        
        const newCol = merge(slide(col));

        for (let i = 0; i < size; i++) {
            if(grid[i][j] !== newCol[i]) moved = true;
            grid[i][j] = newCol[i];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let j = 0; j < size; j++) {
        const col = [];
        for (let i = 0; i < size; i++) col.push(grid[i][j]);
        col.reverse();

        const newCol = merge(slide(col));
        newCol.reverse();
        
        for (let i = 0; i < size; i++) {
            if(grid[i][j] !== newCol[i]) moved = true;
            grid[i][j] = newCol[i];
        }
    }
    return moved;
}

function slide(row) {
    let newRow = row.filter(val => val);
    let zeros = Array(size - newRow.length).fill(0);
    return newRow.concat(zeros);
}

function merge(row) {
    for (let i = 0; i < size - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            updateScore();
            row[i + 1] = 0;
        }
    }
    return slide(row);
}

function updateScore() {
    scoreEl.textContent = score;
}

function checkGameOver() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) return false; // Есть пустые ячейки
            if (i < size - 1 && grid[i][j] === grid[i + 1][j]) return false; // Можно объединить по вертикали
            if (j < size - 1 && grid[i][j] === grid[i][j + 1]) return false; // Можно объединить по горизонтали
        }
    }
    return true;
}

function gameOver() {
    isGameOver = true;
    const overlay = document.createElement('div');
    overlay.classList.add('game2048-overlay');
    overlay.innerHTML = `<h2>Игра окончена!</h2><p>Ваш счет: ${score}</p>`;
    boardEl.appendChild(overlay);
}

function cleanup() {
    document.removeEventListener('keydown', handleKeydown);
}

export { getHtml, init, cleanup };
