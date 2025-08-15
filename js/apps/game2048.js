// js/apps/game2048.js

let scoreEl, boardEl, tileContainerEl;
const size = 4;
let grid = [];
let score = 0;
let isGameOver = false;
let isMoving = false; // Флаг для блокировки ввода во время анимации
let tileIdCounter = 0; // Для уникальных ID каждой плитки

// --- HTML-структура приложения ---
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

// --- Инициализация игры ---
function init() {
    boardEl = document.getElementById('game2048-board');
    tileContainerEl = document.getElementById('game2048-tile-container');
    scoreEl = document.getElementById('game2048-score');
    document.getElementById('game2048-new-game-btn').addEventListener('click', setupGame);
    
    setupGame();
    
    document.addEventListener('keydown', handleKeydown);

    // Обработка свайпов для мобильных устройств
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

// --- Настройка новой игры ---
function setupGame() {
    isGameOver = false;
    isMoving = false;
    tileIdCounter = 0;
    score = 0;
    updateScore();
    
    // Очищаем игровое поле и сетку
    boardEl.querySelector('.game2048-overlay')?.remove();
    tileContainerEl.innerHTML = '';
    grid = Array.from({ length: size }, () => Array(size).fill(null));

    // Создаем ячейки фона
    if (boardEl.childElementCount <= 1) { // Добавляем фон только один раз
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game2048-cell');
            boardEl.prepend(cell);
        }
    }

    addRandomTile();
    addRandomTile();
}


// --- Добавление новой плитки на поле ---
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

// --- Создание DOM-элемента для плитки ---
function createTileElement(tile) {
    const tileEl = document.createElement('div');
    tileEl.classList.add('game2048-tile', 'tile-new');
    tileEl.dataset.id = tile.id;
    updateTileElement(tileEl, tile);
    tileContainerEl.appendChild(tileEl);
}

// --- Обновление вида и позиции плитки ---
function updateTileElement(tileEl, tile) {
    tileEl.textContent = tile.value;
    tileEl.dataset.value = tile.value;
    const cellSize = boardEl.clientWidth / size;
    const gap = 10;
    tileEl.style.width = `${cellSize - gap}px`;
    tileEl.style.height = `${cellSize - gap}px`;
    tileEl.style.transform = `translate(${tile.c * cellSize + gap/2}px, ${tile.r * cellSize + gap/2}px)`;
}


// --- Обработка ввода ---
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

// --- Главная функция движения ---
async function move(direction) {
    isMoving = true;
    const vector = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } }[direction];
    
    // Определяем порядок обхода ячеек
    const rows = direction === 'down' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    const cols = direction === 'right' ? Array.from({length: size}, (_, i) => size - 1 - i) : Array.from({length: size}, (_, i) => i);
    
    let moved = false;
    const mergePromises = [];

    for (const r of rows) {
        for (const c of cols) {
            const tile = grid[r][c];
            if (tile) {
                let currentR = r, currentC = c;
                let nextR = currentR + vector.r, nextC = currentC + vector.c;

                // Находим самую дальнюю пустую ячейку или ячейку для слияния
                while (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size) {
                    const nextTile = grid[nextR][nextC];
                    if (nextTile) {
                        if (nextTile.value === tile.value && !nextTile.mergedThisTurn) {
                            currentR = nextR;
                            currentC = nextC;
                        }
                        break;
                    }
                    currentR = nextR;
                    currentC = nextC;
                    nextR += vector.r;
                    nextC += vector.c;
                }

                if (currentR !== r || currentC !== c) {
                    const targetTile = grid[currentR][currentC];
                    if (targetTile && targetTile.value === tile.value) {
                        // Слияние
                        const tileToMerge = tile;
                        targetTile.value *= 2;
                        targetTile.mergedThisTurn = true;
                        grid[r][c] = null;
                        score += targetTile.value;
                        
                        mergePromises.push(animateMerge(tileToMerge, targetTile));

                    } else {
                        // Перемещение
                        grid[currentR][currentC] = tile;
                        grid[r][c] = null;
                        tile.r = currentR;
                        tile.c = currentC;
                        const tileEl = document.querySelector(`[data-id="${tile.id}"]`);
                        updateTileElement(tileEl, tile);
                    }
                    moved = true;
                }
            }
        }
    }

    // Ждем завершения всех анимаций слияния
    await Promise.all(mergePromises);

    if (moved) {
        updateScore();
        addRandomTile();
        if (checkGameOver()) {
            gameOver();
        }
    }
    
    // Сбрасываем флаги слияния
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c]) grid[r][c].mergedThisTurn = false;
        }
    }
    isMoving = false;
}

// --- Анимация слияния ---
function animateMerge(tileToMerge, targetTile) {
    return new Promise(resolve => {
        const mergingEl = document.querySelector(`[data-id="${tileToMerge.id}"]`);
        const targetEl = document.querySelector(`[data-id="${targetTile.id}"]`);
        
        // Перемещаем плитку на позицию целевой плитки
        updateTileElement(mergingEl, targetTile);

        // Ждем завершения анимации перемещения
        mergingEl.addEventListener('transitionend', () => {
            mergingEl.remove(); // Удаляем элемент сливаемой плитки
            targetEl.textContent = targetTile.value; // Обновляем значение целевой
            targetEl.dataset.value = targetTile.value;
            targetEl.classList.add('tile-merged'); // Добавляем класс для анимации "пульсации"
            targetEl.addEventListener('animationend', () => {
                targetEl.classList.remove('tile-merged');
                resolve();
            }, { once: true });
        }, { once: true });
    });
}


// --- Проверка на конец игры ---
function checkGameOver() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) return false; // Есть пустые ячейки
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

// --- Очистка при выходе из приложения ---
function cleanup() {
    document.removeEventListener('keydown', handleKeydown);
}

export { getHtml, init, cleanup };
