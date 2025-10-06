// js/apps/tabataTimer.js

// --- Глобальные переменные модуля ---
let timerInterval;
let remainingTime = 0;
let state = 'idle'; // 'idle', 'prepare', 'work', 'rest', 'paused', 'finished'
let workDuration = 20, restDuration = 10, totalRounds = 8;
let currentRound = 1;

// --- Ссылки на DOM-элементы и звуки ---
let display, statusDisplay, roundDisplay, startPauseBtn, resetBtn;
let workInput, restInput, roundsInput;
let countdownSound, whistleSound;
let eventListeners = [];

/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <style>
            .tabata-input { -moz-appearance: textfield; text-align: center; }
            .tabata-input::-webkit-outer-spin-button, .tabata-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            #timer-display-container.prepare { background-color: #f59e0b; } /* amber-500 */
            #timer-display-container.work { background-color: #22c55e; } /* green-500 */
            #timer-display-container.rest { background-color: #3b82f6; } /* blue-500 */
            #timer-display-container.paused { background-color: #6b7280; } /* gray-500 */
            #timer-display-container.finished { background-color: #10b981; } /* emerald-500 */
        </style>
        <div class="max-w-sm mx-auto p-4 space-y-6 flex flex-col items-center">
            
            <audio id="tabata-countdown" src="sounds/tabata-countdown.mp3" preload="auto"></audio>
            <audio id="tabata-whistle" src="sounds/tabata-whistle.mp3" preload="auto"></audio>

            <!-- Панель настроек -->
            <div id="tabata-settings" class="w-full grid grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                <div class="text-center">
                    <label for="work-time" class="block text-sm font-medium">Работа (с)</label>
                    <input type="number" id="work-time" value="20" class="tabata-input mt-1 w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div class="text-center">
                    <label for="rest-time" class="block text-sm font-medium">Отдых (с)</label>
                    <input type="number" id="rest-time" value="10" class="tabata-input mt-1 w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div class="text-center">
                    <label for="rounds-count" class="block text-sm font-medium">Раунды</label>
                    <input type="number" id="rounds-count" value="8" class="tabata-input mt-1 w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
            </div>
            
            <!-- Дисплей таймера -->
            <div id="timer-display-container" class="w-64 h-64 rounded-full flex flex-col justify-center items-center text-white transition-colors duration-300 shadow-lg">
                <div id="status-display" class="text-xl font-semibold uppercase tracking-wider">Готов</div>
                <div id="timer-display" class="text-7xl font-mono font-bold">00:00</div>
                <div id="round-display" class="text-lg opacity-80"></div>
            </div>

            <!-- Кнопки управления -->
            <div class="flex items-center justify-center space-x-6 w-full">
                <button id="start-pause-btn" class="w-32 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all">Старт</button>
                <button id="reset-btn" class="w-32 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold py-3 px-6 rounded-full transition-all">Сброс</button>
            </div>
        </div>
    `;
}

/**
 * Инициализация логики приложения.
 */
export function init() {
    // --- Получение элементов ---
    display = document.getElementById('timer-display');
    statusDisplay = document.getElementById('status-display');
    roundDisplay = document.getElementById('round-display');
    startPauseBtn = document.getElementById('start-pause-btn');
    resetBtn = document.getElementById('reset-btn');
    workInput = document.getElementById('work-time');
    restInput = document.getElementById('rest-time');
    roundsInput = document.getElementById('rounds-count');
    countdownSound = document.getElementById('tabata-countdown');
    whistleSound = document.getElementById('tabata-whistle');

    // --- Функции управления состоянием ---
    
    function start() {
        if (state === 'paused') {
            state = 'resumed'; // Временное состояние для возобновления
        } else {
            workDuration = parseInt(workInput.value) || 20;
            restDuration = parseInt(restInput.value) || 10;
            totalRounds = parseInt(roundsInput.value) || 8;
            currentRound = 1;
            state = 'prepare';
            remainingTime = 5; // 5 секунд на подготовку
            whistleSound.play().catch(e => console.log("Audio play failed: " + e));
        }

        // Переключение состояния кнопок и полей
        startPauseBtn.textContent = 'Пауза';
        startPauseBtn.classList.replace('bg-blue-500', 'bg-amber-500');
        startPauseBtn.classList.replace('hover:bg-blue-600', 'hover:bg-amber-600');
        [workInput, restInput, roundsInput].forEach(el => el.disabled = true);

        timerInterval = setInterval(tick, 1000);
    }

    function pause() {
        state = 'paused';
        clearInterval(timerInterval);
        startPauseBtn.textContent = 'Далее';
        startPauseBtn.classList.replace('bg-amber-500', 'bg-blue-500');
        startPauseBtn.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
        updateDisplay();
    }

    function reset() {
        clearInterval(timerInterval);
        state = 'idle';
        remainingTime = 0;
        currentRound = 1;
        startPauseBtn.textContent = 'Старт';
        startPauseBtn.classList.replace('bg-amber-500', 'bg-blue-500');
        startPauseBtn.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
        [workInput, restInput, roundsInput].forEach(el => el.disabled = false);
        updateDisplay();
    }

    function tick() {
        if (state === 'resumed') {
             // Восстанавливаем предыдущее состояние после паузы
            const wasWork = document.getElementById('timer-display-container').classList.contains('work');
            state = wasWork ? 'work' : 'rest';
        }
        
        remainingTime--;
        updateDisplay();

        if (remainingTime <= 3 && remainingTime > 0 && state !== 'rest') {
            countdownSound.play().catch(e => console.log("Audio play failed: " + e));
        }

        if (remainingTime < 0) {
            whistleSound.play().catch(e => console.log("Audio play failed: " + e));
            
            if (state === 'prepare') {
                state = 'work';
                remainingTime = workDuration;
            } else if (state === 'work') {
                if (currentRound >= totalRounds) {
                    state = 'finished';
                    clearInterval(timerInterval);
                    updateDisplay();
                } else {
                    state = 'rest';
                    remainingTime = restDuration;
                }
            } else if (state === 'rest') {
                currentRound++;
                state = 'work';
                remainingTime = workDuration;
            }
            updateDisplay();
        }
    }
    
    // --- Функции обновления UI ---

    function updateDisplay() {
        const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;

        const container = document.getElementById('timer-display-container');
        container.className = 'w-64 h-64 rounded-full flex flex-col justify-center items-center text-white transition-colors duration-300 shadow-lg'; // Сброс классов

        switch (state) {
            case 'prepare':
                statusDisplay.textContent = 'Приготовьтесь';
                roundDisplay.textContent = `Раунд ${currentRound} из ${totalRounds}`;
                container.classList.add('prepare');
                break;
            case 'work':
                statusDisplay.textContent = 'Работа';
                roundDisplay.textContent = `Раунд ${currentRound} из ${totalRounds}`;
                container.classList.add('work');
                break;
            case 'rest':
                statusDisplay.textContent = 'Отдых';
                roundDisplay.textContent = `Раунд ${currentRound} из ${totalRounds}`;
                container.classList.add('rest');
                break;
            case 'paused':
                statusDisplay.textContent = 'Пауза';
                container.classList.add('paused');
                break;
            case 'finished':
                statusDisplay.textContent = 'Готово!';
                roundDisplay.textContent = 'Тренировка окончена';
                container.classList.add('finished');
                break;
            case 'idle':
            default:
                statusDisplay.textContent = 'Готов';
                display.textContent = '00:00';
                roundDisplay.textContent = '';
                break;
        }
    }
    
    // --- Назначение обработчиков ---

    addListener(startPauseBtn, 'click', () => {
        if (state === 'idle' || state === 'paused' || state === 'finished') {
            // Если тренировка завершена, кнопка "Старт" начинает всё заново
            if (state === 'finished') reset();
            start();
        } else {
            pause();
        }
    });

    addListener(resetBtn, 'click', reset);
    
    // Инициализация
    reset();
}

/**
 * Очистка ресурсов при выходе из приложения.
 */
export function cleanup() {
    clearInterval(timerInterval);
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
