// js/apps/flappyBird.js

let canvas, ctx;
let bird, pipes, score, gameSpeed, gravity;
let gameLoopId, isGameOver;

// Размеры и константы игры
const BIRD_SIZE = 20;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;

function getHtml() {
    return `
        <style>
            #flappy-bird-canvas-container {
                position: relative;
                width: 100%;
                max-width: 400px; /* Оптимальная ширина для игры */
                aspect-ratio: 9 / 16; /* Вертикальная ориентация */
                margin: auto;
            }
            #flappy-bird-canvas {
                display: block;
                width: 100%;
                height: 100%;
                background-color: #87CEEB; /* Sky blue */
                border-radius: 0.5rem;
                border: 2px solid #334155;
            }
            .dark #flappy-bird-canvas {
                background-color: #0f172a; /* Dark blue night */
                border-color: #475569;
            }
            #flappy-bird-overlay {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                text-align: center;
                cursor: pointer;
                border-radius: 0.5rem;
            }
        </style>
        <div class=\"flex flex-col items-center gap-4\">
            <div class=\"font-bold text-2xl\">Счет: <span id=\"flappy-score\">0</span></div>
            <div id=\"flappy-bird-canvas-container\">
                <canvas id=\"flappy-bird-canvas\"></canvas>
                <div id=\"flappy-bird-overlay\">
                    <h3 id=\"flappy-overlay-title\" class=\"text-2xl font-bold\">Flappy Bird</h3>
                    <p id=\"flappy-overlay-text\" class=\"mt-2\">Нажмите, чтобы начать</p>
                </div>
            </div>
        </div>
    `;
}

function resetGame() {
    const { width, height } = canvas;
    bird = {
        x: 50,
        y: height / 2,
        velocityY: 0
    };
    pipes = [];
    score = 0;
    gameSpeed = 2;
    gravity = 0.3;
    isGameOver = false;

    // Создаем первую пару труб
    pipes.push(createPipe(width));
}

function createPipe(startX) {
    const { height } = canvas;
    const topPipeHeight = Math.random() * (height - PIPE_GAP - 100) + 50;
    return {
        x: startX,
        topHeight: topPipeHeight,
        bottomY: topPipeHeight + PIPE_GAP,
        passed: false
    };
}

function gameLoop() {
    if (isGameOver) {
        return;
    }

    update();
    draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
    // Движение птицы
    bird.velocityY += gravity;
    bird.y += bird.velocityY;

    // Движение труб
    pipes.forEach(pipe => {
        pipe.x -= gameSpeed;
    });

    // Добавление новых труб
    if (pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
        pipes.push(createPipe(pipes[pipes.length - 1].x + 200));
    }

    // Проверка столкновений
    const { x, y } = bird;
    if (y > canvas.height - BIRD_SIZE || y < 0) {
        endGame();
    }

    pipes.forEach(pipe => {
        if (
            x + BIRD_SIZE > pipe.x &&
            x < pipe.x + PIPE_WIDTH &&
            (y < pipe.topHeight || y + BIRD_SIZE > pipe.bottomY)
        ) {
            endGame();
        }

        // Подсчет очков
        if (pipe.x + PIPE_WIDTH < x && !pipe.passed) {
            score++;
            pipe.passed = true;
        }
    });
}

function draw() {
    const { width, height } = canvas;
    // Фон
    ctx.clearRect(0, 0, width, height);

    // Птица
    ctx.fillStyle = '#FFD700'; // Yellow
    ctx.fillRect(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE);

    // Трубы
    ctx.fillStyle = '#008000'; // Green
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, height - pipe.bottomY);
    });

    // Счет
    document.getElementById('flappy-score').textContent = score;
}

function birdJump() {
    if (!isGameOver) {
        bird.velocityY = -6;
    }
}

function startGame() {
    const overlay = document.getElementById('flappy-bird-overlay');
    overlay.style.display = 'none';
    isGameOver = false;
    resetGame();
    gameLoop();
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);

    const overlay = document.getElementById('flappy-bird-overlay');
    document.getElementById('flappy-overlay-title').textContent = 'Игра окончена!';
    document.getElementById('flappy-overlay-text').textContent = `Ваш счет: ${score}. Нажмите, чтобы начать заново.`;
    overlay.style.display = 'flex';
}

// --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
export function init(appContentContainer) {
    // Ищем элементы внутри предоставленного контейнера
    const container = appContentContainer.querySelector('#flappy-bird-canvas-container');
    canvas = appContentContainer.querySelector('#flappy-bird-canvas');
    const overlay = appContentContainer.querySelector('#flappy-bird-overlay');
    
    // Проверка, что все элементы найдены
    if (!container || !canvas || !overlay) {
        console.error("Не удалось инициализировать игру Flappy Bird: один из ключевых элементов не найден.");
        return;
    }
    
    // Устанавливаем размеры canvas на основе контейнера
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    ctx = canvas.getContext('2d');

    overlay.addEventListener('click', startGame);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            birdJump();
        }
    });
    canvas.addEventListener('click', birdJump);
}

export function cleanup() {
    cancelAnimationFrame(gameLoopId);
    isGameOver = true;
    // Важно удалить глобальные обработчики событий, чтобы они не мешали другим приложениям
    window.removeEventListener('keydown', birdJump);
}
