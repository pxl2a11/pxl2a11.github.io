// js/apps/flappyBird.js

let canvas, ctx;
let bird, pipes, score, gameSpeed, gravity;
let gameLoopId, isGameOver;
let keydownHandler; // Переменная для хранения обработчика событий

// Переменные для хранения DOM-элементов
let scoreEl, overlay, overlayTitle, overlayText;

// --- НОВЫЙ КОД: SVG ПТИЧКИ ---
const SVG_BIRD = `<svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><path style="fill:#FF9900;" d="M186.66,354.216v15.627c0,21.846-17.773,39.619-39.619,39.619h-27.39	c-7.602-21.434-28.071-36.831-52.079-36.831v36.831c10.154,0,18.415,8.261,18.415,18.415s-8.261,18.415-18.415,18.415v36.831	c24.008,0,44.477-15.397,52.079-36.831h27.39c42.154,0,76.45-34.296,76.45-76.45v-15.627H186.66z"/><path style="fill:#FFE981;" d="M373.544,197.231l-5.395-8.756H253.476L13.795,30.963L6.292,53.826	c-21.371,65.134,17.236,124.475,33.433,145.498c-2,9.165-4.136,23.542-2.884,39.817c2.888,37.514,21.813,67.408,54.731,86.455	c7.253,4.198,14.79,7.534,22.487,10.025c7.471,16.258,17.945,31.193,31.112,44.057c27.228,26.601,63.034,41.533,100.825,42.049	c0.691,0.009,1.379,0.013,2.07,0.013c38.982,0,75.647-15.025,103.437-42.439c28.287-27.904,43.866-65.153,43.866-104.885	C395.369,247.093,387.822,220.403,373.544,197.231z"/><path style="fill:#FFDB2D;" d="M373.544,197.231l-5.395-8.756H254.182v233.13c36.689-1.488,70.988-16.331,97.32-42.307	c28.287-27.904,43.866-65.153,43.866-104.885C395.369,247.093,387.822,220.403,373.544,197.231z"/><polygon style="fill:#FF9900;" points="450.615,120.953 512,108.676 487.446,145.507 512,182.338 450.615,170.061 "/><path style="fill:#FFE257;" d="M358.538,28.876c-67.695,0-122.77,55.073-122.77,122.77s55.075,122.77,122.77,122.77	s122.77-55.073,122.77-122.77S426.233,28.876,358.538,28.876z"/><circle style="fill:#804D00;" cx="383.092" cy="139.369" r="18.415"/></svg>`;
let birdImage = new Image();

// Размеры и константы игры
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;

export function getHtml() {
    return `
        <style>
            #flappy-bird-canvas-container {
                position: relative;
                width: 100%;
                max-width: 400px;
                aspect-ratio: 9 / 16;
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
        <div class="flex flex-col items-center gap-4">
            <div class="font-bold text-2xl">Счет: <span id="flappy-score">0</span></div>
            <div id="flappy-bird-canvas-container">
                <canvas id="flappy-bird-canvas"></canvas>
                <div id="flappy-bird-overlay">
                    <h3 id="flappy-overlay-title" class="text-2xl font-bold">Flappy Bird</h3>
                    <p id="flappy-overlay-text" class="mt-2">Нажмите, чтобы начать</p>
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
    // --- ИЗМЕНЕНИЕ: Уменьшена чувствительность ---
    gravity = 0.25; // Птичка падает медленнее
    isGameOver = false;

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
    if (isGameOver) return;
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
    bird.velocityY += gravity;
    bird.y += bird.velocityY;

    pipes.forEach(pipe => { pipe.x -= gameSpeed; });

    if (pipes.length > 0 && pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
        const lastPipeX = pipes.length > 0 ? pipes[pipes.length - 1].x : canvas.width;
        pipes.push(createPipe(lastPipeX + 200));
    }
    
    const { x, y } = bird;
    if (y > canvas.height - BIRD_HEIGHT || y < 0) {
        endGame();
    }

    pipes.forEach(pipe => {
        if (
            x + BIRD_WIDTH > pipe.x &&
            x < pipe.x + PIPE_WIDTH &&
            (y < pipe.topHeight || y + BIRD_HEIGHT > pipe.bottomY)
        ) {
            endGame();
        }
        if (pipe.x + PIPE_WIDTH < x && !pipe.passed) {
            score++;
            pipe.passed = true;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (birdImage.complete) {
        ctx.drawImage(birdImage, bird.x, bird.y, BIRD_WIDTH, BIRD_HEIGHT);
    }
    
    ctx.fillStyle = '#008000';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    });
    if (scoreEl) scoreEl.textContent = score;
}

function birdJump(e) {
    if (e && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
    }
    if (!isGameOver) {
        // --- ИЗМЕНЕНИЕ: Уменьшена чувствительность ---
        bird.velocityY = -5.5; // Прыжок стал ниже и плавнее
    }
}

function startGame() {
    if (overlay) overlay.style.display = 'none';
    isGameOver = false;
    resetGame();
    gameLoop();
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);

    if (overlay && overlayTitle && overlayText) {
        overlayTitle.textContent = 'Игра окончена!';
        overlayText.textContent = `Ваш счет: ${score}. Нажмите, чтобы начать заново.`;
        overlay.style.display = 'flex';
    }
}

export function init(appContentContainer) {
    const container = appContentContainer.querySelector('#flappy-bird-canvas-container');
    canvas = appContentContainer.querySelector('#flappy-bird-canvas');
    overlay = appContentContainer.querySelector('#flappy-bird-overlay');
    scoreEl = appContentContainer.querySelector('#flappy-score');
    overlayTitle = appContentContainer.querySelector('#flappy-overlay-title');
    overlayText = appContentContainer.querySelector('#flappy-overlay-text');
    
    if (!container || !canvas || !overlay || !scoreEl) {
        console.error("Не удалось инициализировать игру Flappy Bird: один из ключевых элементов не найден.");
        return;
    }
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx = canvas.getContext('2d');

    const svg_url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG_BIRD);
    birdImage.src = svg_url;
    
    keydownHandler = (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            birdJump(e);
        }
    };
    
    overlay.addEventListener('click', startGame);
    window.addEventListener('keydown', keydownHandler);
    canvas.addEventListener('click', birdJump);
}

export function cleanup() {
    cancelAnimationFrame(gameLoopId);
    isGameOver = true;
    if (keydownHandler) {
        window.removeEventListener('keydown', keydownHandler);
        keydownHandler = null;
    }
}
