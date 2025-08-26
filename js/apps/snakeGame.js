let canvas, ctx;
let gameInterval, keydownHandler, resizeObserver;
const gridSize = 20;
let snake, food, score, direction, gameActive, gamePaused, canChangeDirection;

// --- ПАРАМЕТРЫ СКОРОСТИ ---
const INITIAL_SPEED = 666;
const SPEED_INCREMENT = 12;
const MAX_SPEED = 60;
let currentSpeed;

export function getHtml() {
    return `
        <style>
            /* --- Стили для игры "Змейка" --- */
            .snake-game-container {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            #snake-canvas {
                background-color: #f1f5f9; /* slate-100 */
                border-radius: 0.5rem;
                border: 2px solid #94a3b8; /* slate-400 */
            }

            .dark #snake-canvas {
                background-color: #0f172a; /* slate-900 */
                border-color: #334155; /* slate-700 */
            }

            .snake-game-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: rgba(31, 41, 55, 0.7); /* gray-800 with opacity */
                color: white;
                text-align: center;
                border-radius: 0.5rem;
                cursor: pointer;
            }

            .dark .snake-game-overlay {
                background-color: rgba(226, 232, 240, 0.7); /* slate-200 with opacity */
                color: #1e293b; /* gray-800 */
            }
        </style>
        <div class="snake-game-container">
            <div class="flex justify-between items-center w-full max-w-md mb-2">
                <span class="font-bold text-lg">Счет: <span id="snake-score">0</span></span>
                <button id="pause-btn" class="px-3 py-1 rounded bg-yellow-500 text-white">Пауза</button>
            </div>
            <div id="snake-canvas-container" class="relative w-full max-w-md" style="aspect-ratio: 1/1;">
                 <canvas id="snake-canvas"></canvas>
                 <div id="game-overlay" class="snake-game-overlay">
                     <h3 id="overlay-title" class="text-2xl font-bold">Нажмите, чтобы начать</h3>
                     <p id="overlay-text" class="mt-2">Используйте стрелки для управления</p>
                 </div>
            </div>
        </div>
    `;
}

function resetAndDraw() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);
    
    snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
    
    score = 0;
    currentSpeed = INITIAL_SPEED;
    direction = 'right';
    document.getElementById('snake-score').textContent = score;
    placeFood();
    draw();
}

function placeFood() {
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY)
    };
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

function draw() {
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#0f172a' : '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#10b981' : '#16a34a';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
}

function updateGameSpeed() {
    const newSpeed = INITIAL_SPEED - (score * SPEED_INCREMENT);
    currentSpeed = Math.max(newSpeed, MAX_SPEED);
    
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}

function gameLoop() {
    if (!gameActive || gamePaused) return;

    canChangeDirection = true;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);

    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        endGame();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('snake-score').textContent = score;
        updateGameSpeed();
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}

function startGame() {
    const overlay = document.getElementById('game-overlay');
    overlay.style.display = 'none';
    gameActive = true;
    gamePaused = false;
    document.getElementById('pause-btn').textContent = "Пауза";
    gameInterval = setInterval(gameLoop, currentSpeed);
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    const overlay = document.getElementById('game-overlay');
    document.getElementById('overlay-title').textContent = 'Игра окончена!';
    document.getElementById('overlay-text').textContent = `Ваш счет: ${score}. Нажмите, чтобы начать заново.`;
    overlay.style.display = 'flex';
}

function togglePause() {
    if (!gameActive) return;
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pause-btn');
    const overlay = document.getElementById('game-overlay');
    if (gamePaused) {
        pauseBtn.textContent = "Продолжить";
        document.getElementById('overlay-title').textContent = 'Пауза';
        document.getElementById('overlay-text').textContent = 'Нажмите, чтобы продолжить';
        overlay.style.display = 'flex';
    } else {
        pauseBtn.textContent = "Пауза";
        overlay.style.display = 'none';
    }
}

export function init() {
    canvas = document.getElementById('snake-canvas');
    const canvasContainer = document.getElementById('snake-canvas-container');
    ctx = canvas.getContext('2d');
    const overlay = document.getElementById('game-overlay');
    const pauseBtn = document.getElementById('pause-btn');

    gameActive = false;
    gamePaused = false;
    canChangeDirection = true;

    overlay.addEventListener('click', () => {
        if (gameActive) {
            if (gamePaused) togglePause();
        } else {
            resetAndDraw();
            startGame();
        }
    });

    pauseBtn.addEventListener('click', togglePause);
    
    keydownHandler = (e) => {
        const key = e.key;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
        }
        
        if (!canChangeDirection) return;

        let newDirection = null;
        if (key === 'ArrowUp' && direction !== 'down') newDirection = 'up';
        else if (key === 'ArrowDown' && direction !== 'up') newDirection = 'down';
        else if (key === 'ArrowLeft' && direction !== 'right') newDirection = 'left';
        else if (key === 'ArrowRight' && direction !== 'left') newDirection = 'right';

        if (newDirection) {
            direction = newDirection;
            canChangeDirection = false;
        }
    };

    window.addEventListener('keydown', keydownHandler);
    
    resizeObserver = new ResizeObserver(() => {
        if (!gameActive) {
            resetAndDraw();
        }
    });

    resizeObserver.observe(canvasContainer);
    resetAndDraw();
}

export function cleanup() {
    clearInterval(gameInterval);
    window.removeEventListener('keydown', keydownHandler);
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
}
