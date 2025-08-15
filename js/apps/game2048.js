// apps/game2048.js

// Constants
const GRID_SIZE = 4;
const START_TILES = 2; // Number of tiles to spawn at the start
const TILE_APPEAR_ANIMATION_DURATION = 200; // ms

// DOM Elements (will be set in init)
let gameContainer2048;
let gridContainer2048;
let tileContainer2048;
let scoreElement2048;
let bestScoreElement2048;
let newGameButton2048;
let undoButton2048;
let gameMessage2048;
let messageText2048;
let keepPlayingButton2048;
let tryAgainButton2048;

// Game State
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let gameWon = false;
let gameStateHistory = []; // To store previous states for undo

// Helper Functions
// Function to generate a random integer up to (but not including) max
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Function to initialize the grid with empty cells
function initializeGrid() {
    grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    gameOver = false;
    gameWon = false;
    gameStateHistory = []; // Clear history for new game
    updateScore(0);
    hideGameMessage();
    renderGrid(); // Render the empty grid cells
    addStartTiles(); // Add initial tiles
    saveGameState(); // Save initial state
}

// Function to update the score display
function updateScore(newScore) {
    score = newScore;
    scoreElement2048.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement2048.textContent = bestScore;
        localStorage.setItem('2048_best_score', bestScore); // Save best score to local storage
    }
}

// Function to add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[getRandomInt(emptyCells.length)];
        const newValue = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
        grid[randomCell.r][randomCell.c] = newValue;
        renderTile(randomCell.r, randomCell.c, newValue, true); // Render as new tile
    }
}

// Function to add the initial tiles at the start of the game
function addStartTiles() {
    for (let i = 0; i < START_TILES; i++) {
        addRandomTile();
    }
}

// Function to render the grid cells (static background elements)
function renderGrid() {
    gridContainer2048.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell-2048'); // Updated class name
            gridContainer2048.appendChild(cell);
        }
    }
    tileContainer2048.innerHTML = ''; // Clear existing tiles
}

// Function to render a single tile on the board
function renderTile(row, col, value, isNew = false, isMerged = false) {
    const tile = document.createElement('div');
    tile.classList.add('tile-2048', `tile-${value}`); // Updated class name
    if (isNew) tile.classList.add('tile-new');
    if (isMerged) tile.classList.add('tile-merged');

    // Handle larger numbers for font size
    if (value >= 128 && value < 1024) {
        tile.style.fontSize = '45px';
    } else if (value >= 1024) {
        tile.style.fontSize = '35px';
    } else if (value > 2048) { // For numbers beyond 2048
        tile.classList.add('super');
    }

    tile.textContent = value;
    tile.dataset.x = col;
    tile.dataset.y = row;
    tile.style.left = `${col * (100 / GRID_SIZE)}%`;
    tile.style.top = `${row * (100 / GRID_SIZE)}%`;

    // Slight adjustment for gap (since tiles are smaller than cells)
    const offset = 10 / (GRID_SIZE * 2); // Half of the gap size relative to cell size
    tile.style.left = `calc(${col * (100 / GRID_SIZE)}% + ${offset}px)`;
    tile.style.top = `calc(${row * (100 / GRID_SIZE)}% + ${offset}px)`;
    tile.style.width = `calc(${100 / GRID_SIZE}% - ${10}px)`;
    tile.style.height = `calc(${100 / GRID_SIZE}% - ${10}px)`;


    tileContainer2048.appendChild(tile);
}

// Function to re-render all tiles after a move
function refreshTiles() {
    tileContainer2048.innerHTML = ''; // Clear all existing tiles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] !== 0) {
                renderTile(r, c, grid[r][c]);
            }
        }
    }
}

// Function to display the game message (win/lose)
function showGameMessage(type) {
    gameMessage2048.style.display = 'flex';
    if (type === 'win') {
        messageText2048.textContent = 'Ты победил!';
        keepPlayingButton2048.style.display = 'inline-block';
        tryAgainButton2048.style.display = 'none';
    } else if (type === 'lose') {
        messageText2048.textContent = 'Игра окончена!';
        keepPlayingButton2048.style.display = 'none';
        tryAgainButton2048.style.display = 'inline-block';
    }
}

// Function to hide the game message
function hideGameMessage() {
    gameMessage2048.style.display = 'none';
}

// Game Logic
// Function to check if the game is over (no more moves possible)
function isGameOver() {
    // Check for empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) return false;
        }
    }

    // Check for possible merges (horizontal and vertical)
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const value = grid[r][c];
            // Check right
            if (c < GRID_SIZE - 1 && grid[r][c + 1] === value) return false;
            // Check down
            if (r < GRID_SIZE - 1 && grid[r + 1][c] === value) return false;
        }
    }
    return true;
}

// Function to save the current game state to history
function saveGameState() {
    if (gameStateHistory.length >= 10) { // Limit history to 10 states
        gameStateHistory.shift();
    }
    gameStateHistory.push({
        grid: JSON.parse(JSON.stringify(grid)), // Deep copy
        score: score,
        bestScore: bestScore,
        gameWon: gameWon
    });
}

// Function to restore the previous game state
function undoMove() {
    if (gameStateHistory.length > 1) { // Need at least two states (current + previous)
        gameStateHistory.pop(); // Remove current state
        const prevState = gameStateHistory[gameStateHistory.length - 1]; // Get previous state
        grid = JSON.parse(JSON.stringify(prevState.grid));
        score = prevState.score;
        bestScore = prevState.bestScore;
        gameWon = prevState.gameWon;
        scoreElement2048.textContent = score;
        bestScoreElement2048.textContent = bestScore;
        hideGameMessage();
        refreshTiles(); // Re-render tiles based on restored grid
    } else {
        console.warn("No more moves to undo.");
    }
}

// Core move logic (applies to a single row/column based on direction)
function operateLine(line) {
    let changed = false;
    let newScoreAdd = 0;

    // 1. Move all non-zero numbers to the left
    let filteredLine = line.filter(val => val !== 0);
    let newLine = Array(GRID_SIZE).fill(0);
    for (let i = 0; i < filteredLine.length; i++) {
        newLine[i] = filteredLine[i];
    }

    if (JSON.stringify(line) !== JSON.stringify(newLine)) {
        changed = true;
    }

    // 2. Merge adjacent identical numbers
    for (let i = 0; i < GRID_SIZE - 1; i++) {
        if (newLine[i] !== 0 && newLine[i] === newLine[i + 1]) {
            newLine[i] *= 2;
            newScoreAdd += newLine[i]; // Add merged tile value to score
            newLine[i + 1] = 0; // Remove the merged tile
            changed = true;
            if (newLine[i] === 2048) {
                gameWon = true; // Set game won flag
            }
        }
    }

    // 3. Move all non-zero numbers to the left again after merging
    filteredLine = newLine.filter(val => val !== 0);
    newLine = Array(GRID_SIZE).fill(0);
    for (let i = 0; i < filteredLine.length; i++) {
        newLine[i] = filteredLine[i];
    }

    return { newLine, changed, newScoreAdd };
}

// Function to handle a move in any direction
function move(direction) {
    if (gameOver || gameWon) return;

    saveGameState(); // Save state before attempting a move

    let gridChanged = false;
    let currentMoveScore = 0;

    if (direction === 'left' || direction === 'right') {
        for (let r = 0; r < GRID_SIZE; r++) {
            let line = grid[r];
            if (direction === 'right') {
                line.reverse(); // Reverse for right move
            }

            const { newLine, changed, newScoreAdd } = operateLine(line);
            currentMoveScore += newScoreAdd;

            if (direction === 'right') {
                newLine.reverse(); // Reverse back for right move
            }

            if (changed) {
                gridChanged = true;
                grid[r] = newLine;
            }
        }
    } else if (direction === 'up' || direction === 'down') {
        for (let c = 0; c < GRID_SIZE; c++) {
            let line = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                line.push(grid[r][c]);
            }

            if (direction === 'down') {
                line.reverse(); // Reverse for down move
            }

            const { newLine, changed, newScoreAdd } = operateLine(line);
            currentMoveScore += newScoreAdd;

            if (direction === 'down') {
                newLine.reverse(); // Reverse back for down move
            }

            if (changed) {
                gridChanged = true;
                for (let r = 0; r < GRID_SIZE; r++) {
                    grid[r][c] = newLine[r];
                }
            }
        }
    }

    if (gridChanged) {
        updateScore(score + currentMoveScore);
        // After successful move, add a new tile and then refresh
        setTimeout(() => {
            addRandomTile();
            refreshTiles();
            // Check win/lose conditions after rendering new tile
            if (gameWon && !gameOver) {
                showGameMessage('win');
                gameOver = true; // Prevent further moves
            } else if (isGameOver() && !gameWon) {
                showGameMessage('lose');
                gameOver = true; // Prevent further moves
            }
        }, TILE_APPEAR_ANIMATION_DURATION); // Wait for tile animations
    } else {
        // If no tiles moved or merged, revert the state as it was not a valid move
        gameStateHistory.pop();
        // Optionally, give visual feedback that no move was possible
    }
}

// Event Handlers
function handleKeyDown(e) {
    if (gameOver || gameWon) return; // Ignore input if game is over or won

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'ф': // Russian 'f'
            e.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'в': // Russian 'v'
            e.preventDefault();
            move('right');
            break;
        case 'ArrowUp':
        case 'w':
        case 'ц': // Russian 'c'
            e.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'ы': // Russian 'y'
            e.preventDefault();
            move('down');
            break;
        case 'z': // Undo key
        case 'я': // Russian 'z'
            e.preventDefault();
            undoMove();
            break;
    }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    if (gameOver || gameWon) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault(); // Prevent default scrolling/zooming
}

function handleTouchEnd(e) {
    if (gameOver || gameWon) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Determine if horizontal or vertical swipe and apply a threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) { // Horizontal swipe
        if (dx > 0) {
            move('right');
        } else {
            move('left');
        }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) { // Vertical swipe
        if (dy > 0) {
            move('down');
        } else {
            move('up');
        }
    }
    e.preventDefault(); // Prevent default scrolling/zooming
}

export function getHtml() {
    return `
        <div class="game-container-2048">
            <div class="heading-2048">
                <h1 class="title-2048">2048</h1>
                <div class="scores-container">
                    <div class="score-container-2048" id="score-2048">0</div>
                    <div class="best-container-2048" id="best-score-2048">0</div>
                </div>
            </div>

            <div class="buttons-container-2048">
                <button class="button-2048" id="new-game-button-2048">Новая игра</button>
                <button class="button-2048" id="undo-button-2048">Отменить</button>
            </div>

            <div class="game-board">
                <div class="grid-container-2048" id="grid-container-2048">
                    <!-- Grid cells will be generated by JavaScript -->
                </div>
                <div class="tile-container-2048" id="tile-container-2048">
                    <!-- Tiles will be generated by JavaScript -->
                </div>
            </div>

            <div class="game-message-2048" id="game-message-2048" style="display: none;">
                <p id="message-text-2048"></p>
                <button class="button-2048" id="keep-playing-button-2048" style="display: none;">Продолжить</button>
                <button class="button-2048" id="try-again-button-2048" style="display: none;">Попробовать снова</button>
            </div>
        </div>
    `;
}

export function init() {
    // Get DOM elements after HTML is loaded
    gameContainer2048 = document.querySelector('.game-container-2048');
    gridContainer2048 = document.getElementById('grid-container-2048');
    tileContainer2048 = document.getElementById('tile-container-2048');
    scoreElement2048 = document.getElementById('score-2048');
    bestScoreElement2048 = document.getElementById('best-score-2048');
    newGameButton2048 = document.getElementById('new-game-button-2048');
    undoButton2048 = document.getElementById('undo-button-2048');
    gameMessage2048 = document.getElementById('game-message-2048');
    messageText2048 = document.getElementById('message-text-2048');
    keepPlayingButton2048 = document.getElementById('keep-playing-button-2048');
    tryAgainButton2048 = document.getElementById('try-again-button-2048');

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    gameContainer2048.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameContainer2048.addEventListener('touchend', handleTouchEnd, { passive: false });
    newGameButton2048.addEventListener('click', initializeGrid);
    undoButton2048.addEventListener('click', undoMove);
    keepPlayingButton2048.addEventListener('click', () => {
        gameWon = false; // Allow further moves
        hideGameMessage();
    });
    tryAgainButton2048.addEventListener('click', initializeGrid);

    // Load best score and initialize grid
    bestScore = parseInt(localStorage.getItem('2048_best_score') || '0', 10);
    bestScoreElement2048.textContent = bestScore;
    initializeGrid();

    // Apply dark mode class to body if needed (main.js handles the toggle button)
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

export function cleanup() {
    // Remove event listeners to prevent memory leaks or unexpected behavior
    document.removeEventListener('keydown', handleKeyDown);
    if (gameContainer2048) { // Check if element exists before removing listener
        gameContainer2048.removeEventListener('touchstart', handleTouchStart);
        gameContainer2048.removeEventListener('touchend', handleTouchEnd);
    }
    // No need to remove click listeners from buttons as they are removed with innerHTML
}
