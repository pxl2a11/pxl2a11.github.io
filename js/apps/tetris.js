// 17js/apps/tetris.js

let canvas, ctx, nextCanvas, nextCtx;
let board;
let score, level, lines;
let currentPiece, nextPiece;
let gameLoopId;
let isGameOver, isPaused;
let keydownHandler;
// ИЗМЕНЕНИЕ: Добавлена переменная для скорости игры
let gameSpeed;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // O
    '#F538FF', // L
    '#FF8E0D', // J
    '#FFE138', // S
    '#3877FF', // Z
];

const SHAPES = [
    [],
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[1, 1], [1, 1]], // O
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
];

class Piece {
    constructor(shape, ctx, shapeIndex) {
        this.shape = shape;
        this.ctx = ctx;
        this.shapeIndex = shapeIndex;
        this.color = COLORS[this.shapeIndex];
        this.x = 3;
        this.y = 0;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        // ИЗМЕНЕНИЕ: Добавлена обводка для блоков
        this.ctx.strokeStyle = '#000'; // Черная обводка
        this.ctx.lineWidth = 2;

        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    const currentX = (this.x + x) * BLOCK_SIZE;
                    const currentY = (this.y + y) * BLOCK_SIZE;
                    this.ctx.fillRect(currentX, currentY, BLOCK_SIZE, BLOCK_SIZE);
                    this.ctx.strokeRect(currentX, currentY, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

function getNewPiece() {
    const rand = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return new Piece(SHAPES[rand], ctx, rand);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                ctx.fillStyle = COLORS[value];
                // ИЗМЕНЕНИЕ: Добавлена обводка для блоков
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                const currentX = x * BLOCK_SIZE;
                const currentY = y * BLOCK_SIZE;
                ctx.fillRect(currentX, currentY, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(currentX, currentY, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = nextPiece.color;
    nextCtx.strokeStyle = '#000';
    nextCtx.lineWidth = 1;
    const smallBlockSize = BLOCK_SIZE / 1.5;

    const shape = nextPiece.shape;
    let minX = shape[0].length, maxX = -1, minY = shape.length, maxY = -1;

    // Находим границы фигуры, чтобы отбросить пустые строки/столбцы
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        });
    });

    const pieceWidth = (maxX - minX + 1) * smallBlockSize;
    const pieceHeight = (maxY - minY + 1) * smallBlockSize;

    // Вычисляем смещение для центрирования
    const offsetX = (nextCanvas.width - pieceWidth) / 2;
    const offsetY = (nextCanvas.height - pieceHeight) / 2;

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                // Рисуем блок с учетом смещения и границ фигуры
                const currentX = offsetX + (x - minX) * smallBlockSize;
                const currentY = offsetY + (y - minY) * smallBlockSize;
                nextCtx.fillRect(currentX, currentY, smallBlockSize, smallBlockSize);
                nextCtx.strokeRect(currentX, currentY, smallBlockSize, smallBlockSize);
            }
        });
    });
}

// ИЗМЕНЕНИЕ: Более надежная функция проверки хода
function isValidMove(piece) {
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            if (value === 0) {
                return true;
            }

            let x = piece.x + dx;
            let y = piece.y + dy;

            if (x < 0 || x >= COLS || y >= ROWS) {
                return false;
            }

            if (y < 0) {
                return true;
            }

            return board[y][x] === 0;
        });
    });
}


function rotatePiece(piece) {
    const shape = piece.shape;
    const N = shape.length;
    let result = [];
    for (let i = 0; i < N; i++) {
        result.push(new Array(N).fill(0));
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            result[j][N - 1 - i] = shape[i][j];
        }
    }
    return result;
}

function freezePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                if (currentPiece.y + y >= 0 && currentPiece.y + y < ROWS) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.shapeIndex;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value > 0)) {
            linesCleared++;
            board.splice(y, 1);
            board.unshift(new Array(COLS).fill(0));
            y++;
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        score += 10 * Math.pow(2, linesCleared-1);
        
        const newLevel = Math.floor(lines / 10);
        if (newLevel > level) {
            level = newLevel;
            clearInterval(gameLoopId);
            gameSpeed = Math.max(100, 1000 - level * 75); 
            gameLoopId = setInterval(gameStep, gameSpeed);
        }
        
        document.getElementById('tetris-score').textContent = score;
        document.getElementById('tetris-lines').textContent = lines;
        document.getElementById('tetris-level').textContent = level;
    }
}

function gameStep() {
    if (isGameOver || isPaused) return;

    let p = { ...currentPiece, y: currentPiece.y + 1 };
    if (isValidMove(p)) {
        currentPiece.y++;
    } else {
        freezePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = getNewPiece();
        drawNextPiece();
        if (!isValidMove(currentPiece)) {
            gameOver();
            return;
        }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    currentPiece.draw();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopId);
    document.getElementById('tetris-overlay').style.display = 'flex';
    document.getElementById('tetris-overlay-title').textContent = 'Игра окончена!';
    document.getElementById('tetris-overlay-text').textContent = `Ваш счет: ${score}`;
}

function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    const pauseButton = document.getElementById('tetris-btn-pause');
    const overlay = document.getElementById('tetris-overlay');

    if (isPaused) {
        clearInterval(gameLoopId);
        overlay.style.display = 'flex';
        document.getElementById('tetris-overlay-title').textContent = 'Пауза';
        document.getElementById('tetris-overlay-text').textContent = 'Нажмите "Продолжить" или P, чтобы возобновить';
        pauseButton.textContent = 'Продолжить';
    } else {
        overlay.style.display = 'none';
        gameLoopId = setInterval(gameStep, gameSpeed);
        pauseButton.textContent = 'Пауза';
    }
}


function startGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 0;
    lines = 0;
    gameSpeed = 1000;
    currentPiece = getNewPiece();
    nextPiece = getNewPiece();
    isGameOver = false;
    isPaused = false;
    
    document.getElementById('tetris-score').textContent = score;
    document.getElementById('tetris-lines').textContent = lines;
    document.getElementById('tetris-level').textContent = level;
    document.getElementById('tetris-overlay').style.display = 'none';
    document.getElementById('tetris-btn-pause').textContent = 'Пауза';

    drawNextPiece();
    clearInterval(gameLoopId);
    gameLoopId = setInterval(gameStep, gameSpeed);
}

export function getHtml() {
    return `
        <style>
            #tetris-board {
                background-color: #0f172a; /* slate-900 */
                border: 4px solid #475569; /* slate-600 */
            }
            .dark #tetris-board {
                 border-color: #94a3b8; /* slate-400 */
            }
            /* ИЗМЕНЕНИЕ: Стили для центрирования холста следующей фигуры */
            #tetris-next-piece-canvas {
                background-color: transparent;
                border: none;
                display: block;
                margin: 4px auto 0;
            }
             .tetris-game-overlay {
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                display: none; flex-direction: column; justify-content: center; align-items: center;
                background-color: rgba(255, 255, 255, 0.8);
                color: #1e293b;
                text-align: center;
                cursor: pointer;
            }
            .dark .tetris-game-overlay {
                background-color: rgba(0, 0, 0, 0.8);
                color: #f1f5f9;
            }
            .tetris-control-btn {
                width: 60px; height: 60px;
                border-radius: 9999px;
                background-color: #cbd5e1; /* slate-300 */
                color: #1e293b;
                display: flex; justify-content: center; align-items: center;
                font-size: 2rem;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            }
             .dark .tetris-control-btn {
                background-color: #334155; /* slate-700 */
                color: #f1f5f9;
            }
            #tetris-btn-pause {
                width: 100%;
                padding: 8px 16px;
                border-radius: 8px;
                background-color: #e2e8f0; /* slate-200 */
                font-weight: bold;
            }
            .dark #tetris-btn-pause {
                 background-color: #475569; /* slate-600 */
            }
        </style>
        <div class="flex flex-col lg:flex-row items-center justify-center gap-8">
            <!-- Game Board -->
            <div class="relative">
                <canvas id="tetris-board" width="${COLS * BLOCK_SIZE}" height="${ROWS * BLOCK_SIZE}"></canvas>
                <div id="tetris-overlay" class="tetris-game-overlay" style="display: flex;">
                    <h3 id="tetris-overlay-title" class="text-2xl font-bold">Тетрис</h3>
                    <p id="tetris-overlay-text" class="mt-2">Нажмите, чтобы начать</p>
                </div>
            </div>
            
            <!-- Info and Controls -->
            <div class="flex flex-col items-center gap-4 w-48">
                <!-- Info Panel -->
                <div class="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center space-y-2">
                    <div><strong>Счет:</strong> <span id="tetris-score">0</span></div>
                    <div><strong>Линии:</strong> <span id="tetris-lines">0</span></div>
                    <div><strong>Уровень:</strong> <span id="tetris-level">0</span></div>
                </div>
                <!-- Next Piece Preview -->
                <div class="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <strong>Далее:</strong>
                    <canvas id="tetris-next-piece-canvas" width="${4 * (BLOCK_SIZE/1.5)}" height="${4 * (BLOCK_SIZE/1.5)}"></canvas>
                </div>

                <button id="tetris-btn-pause" class="mt-4">Пауза</button>

                 <!-- On-screen controls for mobile -->
                 <div class="grid grid-cols-3 gap-2 w-full mt-4 lg:hidden">
                    <div></div>
                    <button id="tetris-btn-up" class="tetris-control-btn">▲</button>
                    <div></div>
                    <button id="tetris-btn-left" class="tetris-control-btn">◀</button>
                    <button id="tetris-btn-down" class="tetris-control-btn">▼</button>
                    <button id="tetris-btn-right" class="tetris-control-btn">▶</button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    canvas = document.getElementById('tetris-board');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('tetris-next-piece-canvas');
    nextCtx = nextCanvas.getContext('2d');
    const overlay = document.getElementById('tetris-overlay');

    overlay.addEventListener('click', () => {
        if (isGameOver) {
            startGame();
        } else if (isPaused) {
            togglePause();
        } else {
             startGame();
        }
    });

    keydownHandler = (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        if (e.key === 'p') {
            togglePause();
            return;
        }

        if (isGameOver || isPaused) return;

        let p;
        switch (e.key) {
            case 'ArrowLeft':
                p = { ...currentPiece, x: currentPiece.x - 1 };
                if (isValidMove(p)) currentPiece.x--;
                break;
            case 'ArrowRight':
                p = { ...currentPiece, x: currentPiece.x + 1 };
                if (isValidMove(p)) currentPiece.x++;
                break;
            case 'ArrowDown':
                 p = { ...currentPiece, y: currentPiece.y + 1 };
                if (isValidMove(p)) currentPiece.y++;
                break;
            case 'ArrowUp':
                const rotatedShape = rotatePiece(currentPiece);
                let testPiece = { ...currentPiece, shape: rotatedShape };

                // ИЗМЕНЕНИЕ: Улучшенная логика "wall kick" для вращения
                const kickOffsets = currentPiece.shapeIndex === 2 // Это фигура 'I'?
                    ? [ [0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2], [-1, 0], [2, 0] ] 
                    : [ [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1] ]; 

                for (const offset of kickOffsets) {
                    const tempX = testPiece.x + offset[0];
                    const tempY = testPiece.y + offset[1];
                    const p = { ...testPiece, x: tempX, y: tempY };

                    if (isValidMove(p)) {
                        currentPiece.shape = rotatedShape;
                        currentPiece.x = tempX;
                        currentPiece.y = tempY;
                        break;
                    }
                }
                break;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        currentPiece.draw();
    };
    
    window.addEventListener('keydown', keydownHandler);

    // Mobile controls
    document.getElementById('tetris-btn-left').addEventListener('click', () => dispatchKeyEvent('ArrowLeft'));
    document.getElementById('tetris-btn-right').addEventListener('click', () => dispatchKeyEvent('ArrowRight'));
    document.getElementById('tetris-btn-down').addEventListener('click', () => dispatchKeyEvent('ArrowDown'));
    document.getElementById('tetris-btn-up').addEventListener('click', () => dispatchKeyEvent('ArrowUp'));
    
    document.getElementById('tetris-btn-pause').addEventListener('click', togglePause);

    function dispatchKeyEvent(key) {
         window.dispatchEvent(new KeyboardEvent('keydown', {'key': key}));
    }
}

export function cleanup() {
    clearInterval(gameLoopId);
    window.removeEventListener('keydown', keydownHandler);
}
