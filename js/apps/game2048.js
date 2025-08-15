// js/apps/game2048.js

let scoreEl, boardEl, tileContainerEl, descriptionEl, statusEl;
const size = 4;
let grid = [];
let score = 0;
let isGameOver = false;
let isMoving = false;
let tileIdCounter = 0;

function getHtml() {
    return `
      <div class="game-2048-new-container">
        <div class="head">
          <div class="a">2048 <button class="info">i</button> <button id="repeat" class="info repeat">↻</button></div>
          <div class="score">Score<br/><span id="value">0</span></div>
        </div>
        <div class="description" id="description">
          How to play:<br/><br/>
          Use your arrow-keys or swipe to slide the tiles. <br/>
          Two tiles with the same value in line can be merged. The goal is to merge the tiles and get the 2048 tile.<br/><br/>
          The score is a sum of the merged tiles.
        </div>
        <div class="field" id="game-2048-board">
            <div id="game-2048-tile-container"></div>
        </div>
        <div class="status-overlay" id="status"></div>
      </div>
    `;
}

function init() {
    const gameContainer = document.querySelector('.game-2048-new-container');
    boardEl = gameContainer.querySelector('#game-2048-board');
    tileContainerEl = gameContainer.querySelector('#game-2048-tile-container');
    scoreEl = gameContainer.querySelector('#value');
    descriptionEl = gameContainer.querySelector('#description');
    statusEl = gameContainer.querySelector('#status');
    
    gameContainer.querySelector('.info').addEventListener('click', toggleInfo);
    gameContainer.querySelector('#repeat').addEventListener('click', setupGame);
    
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
    
    statusEl.className = 'status-overlay';
    descriptionEl.classList.remove('show');
    tileContainerEl.innerHTML = '';
    grid = Array.from({ length: size }, () => Array(size).fill(null));

    if (boardEl.querySelectorAll('.cell').length === 0) {
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
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
            if (grid[r][c] === null) emptyCells.push({ r, c });
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        const newTile = { id: tileIdCounter++, value, r, c };
        grid[r][c] = newTile;
        createTileElement(newTile);
    }
}

function createTileElement(tile) {
    const tileEl = document.createElement('div');
    tileEl.classList.add('tile');
    tileEl.dataset.id = tile.id;
    updateTileElement(tileEl, tile);
    tileContainerEl.appendChild(tileEl);
    
    requestAnimationFrame(() => {
        tileEl.classList.add('tile-new');
    });
}

function updateTileElement(tileEl, tile) {
    tileEl.textContent = tile.value;
    tileEl.className = `tile v${tile.value}`;
    
    const cellSize = (boardEl.clientWidth - 10 * (size + 1)) / size;
    const gap = 10;
    
    tileEl.style.width = `${cellSize}px`;
    tileEl.style.height = `${cellSize}px`;
    tileEl.style.transform = `translate(${tile.c * (cellSize + gap) + gap}px, ${tile.r * (cellSize + gap) + gap}px)`;
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
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
        else move(dy > 0 ? 'down' : 'up');
    }
}

async function move(direction) {
    isMoving = true;
    const vector = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } }[direction];
    
    const rows = direction === 'down' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    const cols = direction === 'right' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    
    let hasMoved = false;
    const promises = [];

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
                    promises.push(animateTileMove(tile, nextR, nextC));
                    targetTile.mergedFrom = tile;
                    grid[r][c] = null;
                    hasMoved = true;
                } else {
                    nextR -= vector.r;
                    nextC -= vector.c;
                    if (nextR !== r || nextC !== c) {
                        promises.push(animateTileMove(tile, nextR, nextC));
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
                if (mergedEl) mergedEl.remove();
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

function animateTileMove(tile, r, c) {
    return new Promise(resolve => {
        const tileEl = document.querySelector(`[data-id="${tile.id}"]`);
        if (tileEl) {
            tile.r = r;
            tile.c = c;
            updateTileElement(tileEl, tile);
            tileEl.addEventListener('transitionend', resolve, { once: true });
        } else {
            resolve();
        }
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
    statusEl.classList.add('lose');
}

function updateScore() {
    scoreEl.textContent = score;
    if (!isGameOver && score > 0 && grid.flat().some(t => t && t.value === 2048)) {
        statusEl.classList.add('won');
    }
}

function toggleInfo() {
    descriptionEl.classList.toggle('show');
}

function cleanup() {
    document.removeEventListener('keydown', handleKeydown);
}

export { getHtml, init, cleanup };
