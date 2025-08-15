// js/apps/game2048.js

let scoreEl, boardEl, tileContainerEl;
const size = 4;
let grid = []; // Сетка для хранения объектов плиток
let score = 0;
let isGameOver = false;
let isMoving = false; // Флаг для блокировки ввода во время анимации
let tileIdCounter = 0;

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
            <div id="game2048-board">
                <div id="game2048-tile-container"></div>
            </div>
        </div>
    `;
}

function init() {
    boardEl = document.getElementById('game2048-board');
    tileContainerEl = document.getElementById('game2048-tile-container');
    scoreEl = document.getElementById('game2048-score');
    document.getElementById('game2048-new-game-btn').addEventListener('click', setupGame);
    
    setupGame();
    
    document.addEventListener('keydown', handleKeydown);

    let touchStartX = 0, touchStartY = 0;
    boardEl.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    boardEl.addEventListener('touchend', e => {
        if (isMoving) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    });
}

function setupGame() {
    isGameOver = false;
    isMoving = false;
    tileIdCounter = 0;
    score = 0;
    updateScore();
    
    boardEl.querySelector('.game2048-overlay')?.remove();
    tileContainerEl.innerHTML = '';
    grid = Array.from({ length: size }, () => Array(size).fill(null));

    // Создаем ячейки фона, только если их еще нет
    if (boardEl.childElementCount <= 1) {
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game2048-cell');
            boardEl.prepend(cell);
        }
    }

    addRandomTile();
    addRandomTile();
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === null) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        const newTile = {
            id: tileIdCounter++,
            value: value,
            r: r,
            c: c,
        };
        grid[r][c] = newTile;
        createTileElement(newTile);
    }
}

function createTileElement(tile) {
    const tileEl = document.createElement('div');
    tileEl.classList.add('game2048-tile');
    tileEl.dataset.id = tile.id;
    updateTileElement(tileEl, tile);
    tileContainerEl.appendChild(tileEl);
    
    requestAnimationFrame(() => {
        tileEl.classList.add('tile-new');
    });
}

function updateTileElement(tileEl, tile) {
    tileEl.textContent = tile.value;
    tileEl.dataset.value = tile.value;
    
    const cellSize = boardEl.clientWidth / size;
    const gap = 10;
    
    tileEl.style.width = `${cellSize - gap}px`;
    tileEl.style.height = `${cellSize - gap}px`;
    // Новая позиция задается через CSS transform для плавной анимации
    tileEl.style.transform = `translate(${tile.c * cellSize + gap/2}px, ${tile.r * cellSize + gap/2}px)`;
    
    if (tile.value > 9999) tileEl.style.fontSize = "0.8em";
    else if (tile.value > 999) tileEl.style.fontSize = "1em";
    else if (tile.value > 99) tileEl.style.fontSize = "1.3em";
    else tileEl.style.fontSize = "1.5em";
}

function handleKeydown(e) {
    if (isMoving || isGameOver) return;
    switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
    }
}

function handleSwipe(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? 'right' : 'left');
        } else {
            move(dy > 0 ? 'down' : 'up');
        }
    }
}

async function move(direction) {
    isMoving = true;
    const vector = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } }[direction];
    
    const rows = direction === 'down' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    const cols = direction === 'right' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    
    let hasMoved = false;
    const promises = [];

    // Сбрасываем флаги слияния
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c]) grid[r][c].mergedFrom = null;
        }
    }

    for (const r of rows) {
        for (const c of cols) {
            const tile = grid[r][c];
            if (tile) {
                let currentR = r, currentC = c;
                let nextR, nextC;
                
                do {
                    nextR = currentR + vector.r;
                    nextC = currentC + vector.c;
                } while (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size && !grid[nextR][nextC]);

                if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size && grid[nextR][nextC].value === tile.value && !grid[nextR][nextC].mergedFrom) {
                    const targetTile = grid[nextR][nextC];
                    promises.push(animateTileMove(tile, nextR, nextC, true));
                    targetTile.mergedFrom = tile;
                    grid[r][c] = null;
                    hasMoved = true;
                } else {
                    nextR -= vector.r;
                    nextC -= vector.c;
                    if (nextR !== r || nextC !== c) {
                        promises.push(animateTileMove(tile, nextR, nextC, false));
                        grid[nextR][nextC] = tile;
                        grid[r][c] = null;
                        hasMoved = true;
                    }
                }
            }
        }
    }

    await Promise.all(promises);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = grid[r][c];
            if (tile && tile.mergedFrom) {
                tile.value *= 2;
                score += tile.value;
                const targetEl = document.querySelector(`[data-id="${tile.id}"]`);
                const mergedEl = document.querySelector(`[data-id="${tile.mergedFrom.id}"]`);
                mergedEl.remove();
                updateTileElement(targetEl, tile);
                targetEl.classList.add('tile-merged');
                targetEl.addEventListener('animationend', () => targetEl.classList.remove('tile-merged'), {once: true});
            }
        }
    }

    if (hasMoved) {
        updateScore();
        addRandomTile();
        if (checkGameOver()) {
            gameOver();
        }
    }
    
    isMoving = false;
}

function animateTileMove(tile, r, c, isMerging) {
    return new Promise(resolve => {
        const tileEl = document.querySelector(`[data-id="${tile.id}"]`);
        tile.r = r;
        tile.c = c;
        updateTileElement(tileEl, tile);
        
        tileEl.addEventListener('transitionend', resolve, { once: true });
    });
}

function checkGameOver() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) return false;
            if (c < size - 1 && grid[r][c].value === grid[r][c + 1].value) return false;
            if (r < size - 1 && grid[r][c].value === grid[r + 1][c].value) return false;
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

function updateScore() {
    scoreEl.textContent = score;
}

function cleanup() {
    document.removeEventListener('keydown', handleKeydown);
}

export { getHtml, init, cleanup };
