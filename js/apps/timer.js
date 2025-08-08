// js/apps/timer.js

let timerInterval = null;
let totalSeconds = 0;
let isPaused = false;
let eventListeners = [];

// Элементы UI
let hoursInput, minutesInput, secondsInput;
let timerDisplay;
let startPauseButton, resetButton;
let notificationSound;

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    timerDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
    if (totalSeconds <= 0) {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;
        const s = parseInt(secondsInput.value) || 0;
        totalSeconds = h * 3600 + m * 60 + s;
    }
    
    if (totalSeconds <= 0) return;

    isPaused = false;
    startPauseButton.textContent = 'Пауза';
    
    timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            startPauseButton.textContent = 'Старт';
            notificationSound.play();
            timerDisplay.classList.add('animate-pulse', 'text-red-500');
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = true;
    clearInterval(timerInterval);
    timerInterval = null;
    startPauseButton.textContent = 'Продолжить';
}

function handleStartPause() {
    timerDisplay.classList.remove('animate-pulse', 'text-red-500');
    if (timerInterval) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function handleReset() {
    clearInterval(timerInterval);
    timerInterval = null;
    totalSeconds = 0;
    isPaused = false;
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
    startPauseButton.textContent = 'Старт';
    timerDisplay.classList.remove('animate-pulse', 'text-red-500');
    updateDisplay();
}

export function getHtml() {
    return `
        <div class="flex flex-col items-center text-center">
            <!-- Аудио для оповещения -->
            <audio id="timer-notification" src="sounds/notification.mp3" preload="auto"></audio>

            <!-- Дисплей таймера -->
            <div id="timer-display" class="text-6xl md:text-8xl font-mono font-bold mb-6 w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">00:00:00</div>

            <!-- Поля для ввода времени -->
            <div class="flex justify-center items-center space-x-2 mb-6">
                <input type="number" id="timer-hours" placeholder="ЧЧ" min="0" class="timer-input">
                <span class="text-2xl font-bold">:</span>
                <input type="number" id="timer-minutes" placeholder="ММ" min="0" max="59" class="timer-input">
                <span class="text-2xl font-bold">:</span>
                <input type="number" id="timer-seconds" placeholder="СС" min="0" max="59" class="timer-input">
            </div>

            <!-- Кнопки управления -->
            <div class="flex space-x-4">
                <button id="timer-start-pause" class="w-32 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition">Старт</button>
                <button id="timer-reset" class="w-32 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg text-lg transition">Сброс</button>
            </div>
        </div>
        <style>
            .timer-input {
                width: 80px;
                padding: 10px;
                font-size: 1.5rem;
                text-align: center;
                border-radius: 8px;
                border: 1px solid #D1D5DB;
                background-color: white;
            }
            .dark .timer-input {
                border-color: #4B5563;
                background-color: #374151;
            }
        </style>
    `;
}

export function init() {
    hoursInput = document.getElementById('timer-hours');
    minutesInput = document.getElementById('timer-minutes');
    secondsInput = document.getElementById('timer-seconds');
    timerDisplay = document.getElementById('timer-display');
    startPauseButton = document.getElementById('timer-start-pause');
    resetButton = document.getElementById('timer-reset');
    notificationSound = document.getElementById('timer-notification');
    
    addListener(startPauseButton, 'click', handleStartPause);
    addListener(resetButton, 'click', handleReset);
}

export function cleanup() {
    clearInterval(timerInterval);
    timerInterval = null;
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
