// js/apps/sudoku.js

// Базовый класс для генерации и решения Судоку
class Sudoku {
    constructor(size = 9) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(0));
    }

    // Генерация решенной доски
    generateSolution(grid) {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (grid[row][col] === 0) {
                    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of numbers) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.generateSolution(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Создание головоломки путем "выкалывания" ячеек
    generatePuzzle(difficulty) {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.generateSolution(this.grid);
        
        this.solution = JSON.parse(JSON.stringify(this.grid));

        let attempts = difficulty;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * this.size);
            let col = Math.floor(Math.random() * this.size);
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                attempts--;
            }
        }
        return this.grid;
    }

    // Проверка, является ли число допустимым для ячейки
    isValid(grid, row, col, num) {
        for (let i = 0; i < this.size; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

let sudoku;
let timerInterval;
let seconds = 0;
let puzzleGrid;
let solutionGrid;

function renderBoard(grid) {
    const board = document.getElementById('sudoku-board');
    if (!board) return;
    board.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.className = 'sudoku-cell w-full h-full text-center text-lg sm:text-2xl font-semibold border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10';
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (grid[row][col] !== 0) {
                cell.value = grid[row][col];
                cell.readOnly = true;
                cell.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            } else {
                cell.classList.add('bg-white', 'dark:bg-gray-800', 'text-blue-600', 'dark:text-blue-400');
            }

            // Добавляем жирные границы для 3x3 квадратов
            if (row % 3 === 2 && row !== 8) cell.style.borderBottomWidth = '3px';
            if (col % 3 === 2 && col !== 8) cell.style.borderRightWidth = '3px';
            if (row % 3 === 0 && row !== 0) cell.style.borderTopWidth = '3px';
            if (col % 3 === 0 && col !== 0) cell.style.borderLeftWidth = '3px';

            cell.addEventListener('input', (e) => {
                if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1);
                if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
            });
            board.appendChild(cell);
        }
    }
}

function startTimer() {
    stopTimer();
    seconds = 0;
    const timerEl = document.getElementById('sudoku-timer');
    timerInterval = setInterval(() => {
        seconds++;
        const min = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = (seconds % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${min}:${sec}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function startNewGame(difficulty = 40) { // 40 = easy, 50 = medium, 60 = hard
    sudoku = new Sudoku();
    puzzleGrid = sudoku.generatePuzzle(difficulty);
    solutionGrid = sudoku.solution;
    renderBoard(puzzleGrid);
    document.getElementById('sudoku-message').textContent = '';
    startTimer();
}

function checkSolution() {
    const cells = document.querySelectorAll('.sudoku-cell');
    let isCorrect = true;
    let isComplete = true;

    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = parseInt(cell.value);

        cell.classList.remove('bg-red-200', 'dark:bg-red-800', 'bg-green-200', 'dark:bg-green-800');

        if (!value) {
            isComplete = false;
            return;
        }

        if (value !== solutionGrid[row][col]) {
            isCorrect = false;
            cell.classList.add('bg-red-200', 'dark:bg-red-800');
        } else {
            if (!cell.readOnly) {
                cell.classList.add('bg-green-200', 'dark:bg-green-800');
            }
        }
    });

    const messageEl = document.getElementById('sudoku-message');
    if (!isComplete) {
        messageEl.textContent = 'Доска не заполнена полностью!';
        messageEl.className = 'text-center text-yellow-500 font-bold';
    } else if (isCorrect) {
        messageEl.textContent = 'Поздравляем! Вы решили Судоку!';
        messageEl.className = 'text-center text-green-500 font-bold';
        stopTimer();
    } else {
        messageEl.textContent = 'Найдены ошибки. Неправильные ячейки подсвечены красным.';
        messageEl.className = 'text-center text-red-500 font-bold';
    }
}

export function getHtml() {
    return `
        <style>
            #sudoku-board { display: grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr); aspect-ratio: 1 / 1; border: 3px solid #374151; dark:border-gray-400; border-radius: 8px; overflow: hidden; }
            .sudoku-cell::-webkit-outer-spin-button, .sudoku-cell::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .sudoku-cell { -moz-appearance: textfield; }
        </style>
        <div class="flex flex-col items-center space-y-4">
            <div class="flex flex-wrap justify-center gap-2 mb-2">
                <div class="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="sudoku-timer" class="font-mono text-lg font-bold">00:00</span>
                </div>
            </div>

            <div id="sudoku-board" class="w-full max-w-md mx-auto shadow-lg">
                <!-- Ячейки будут сгенерированы JavaScript -->
            </div>
            
            <div id="sudoku-message" class="text-center font-bold h-6"></div>

            <div class="flex flex-wrap justify-center gap-3">
                <div class="relative inline-block text-left">
                    <button type="button" id="new-game-dropdown-btn" class="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                        Новая игра
                        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                    <div id="difficulty-menu" class="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none hidden">
                        <div class="py-1" role="none">
                            <a href="#" class="difficulty-option block px-4 py-2 text-sm" data-difficulty="40">Легко</a>
                            <a href="#" class="difficulty-option block px-4 py-2 text-sm" data-difficulty="50">Средне</a>
                            <a href="#" class="difficulty-option block px-4 py-2 text-sm" data-difficulty="60">Сложно</a>
                        </div>
                    </div>
                </div>
                <button id="check-solution-btn" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Проверить</button>
                <button id="reset-board-btn" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Сбросить</button>
            </div>
        </div>
    `;
}

export function init() {
    startNewGame();
    
    document.getElementById('check-solution-btn')?.addEventListener('click', checkSolution);
    document.getElementById('reset-board-btn')?.addEventListener('click', () => renderBoard(puzzleGrid));
    
    const newGameBtn = document.getElementById('new-game-dropdown-btn');
    const difficultyMenu = document.getElementById('difficulty-menu');
    
    newGameBtn?.addEventListener('click', () => {
        difficultyMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const difficulty = parseInt(e.target.dataset.difficulty);
            startNewGame(difficulty);
            difficultyMenu.classList.add('hidden');
        });
    });

    // Скрывать меню, если клик был вне его
    document.addEventListener('click', (e) => {
        if (!newGameBtn?.contains(e.target)) {
            difficultyMenu?.classList.add('hidden');
        }
    });
}

export function cleanup() {
    stopTimer();
}
