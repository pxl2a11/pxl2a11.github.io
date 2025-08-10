// js/apps/timer.js

let timerInterval = null;
let totalSeconds = 0;
let eventListeners = [];

// Элементы UI
let hoursInput, minutesInput, secondsInput;
let timerDisplay;
let startPauseButton, resetButton, presetsContainer;
let notificationSound;

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

function updateTitle() {
    if (timerInterval) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} | Mini Apps`;
    } else {
        document.title = 'Таймер | Mini Apps';
    }
}

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    timerDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    updateTitle();
}

function startTimer() {
    if (totalSeconds <= 0 && timerInterval === null) {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;
        const s = parseInt(secondsInput.value) || 0;
        totalSeconds = h * 3600 + m * 60 + s;
    }
    
    if (totalSeconds <= 0) return;

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
            updateTitle(); // Сбросить заголовок
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startPauseButton.textContent = 'Продолжить';
    updateTitle();
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
            <audio id="timer-notification" src="sounds/notification.wav" preload="auto"></audio>

            <div id="timer-display" class="text-6xl md:text-8xl font-mono font-bold mb-6 w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">00:00:00</div>

            <div class="flex justify-center items-center space-x-2 mb-4">
                <input type="number" id="timer-hours" placeholder="ЧЧ" min="0" class="timer-input">
                <span class="text-2xl font-bold">:</span>
                <input type="number" id="timer-minutes" placeholder="ММ" min="0" max="59" class="timer-input">
                <span class="text-2xl font-bold">:</span>
                <input type="number" id="timer-seconds" placeholder="СС" min="0" max="59" class="timer-input">
            </div>
            
            <!-- НОВЫЙ БЛОК: Пресеты -->
            <div id="timer-presets" class="flex justify-center flex-wrap gap-2 mb-6">
                <button data-time="60" class="preset-btn">1 мин</button>
                <button data-time="300" class="preset-btn">5 мин</button>
                <button data-time="600" class="preset-btn">10 мин</button>
                <button data-time="900" class="preset-btn">15 мин</button>
            </div>

            <div class="flex space-x-4">
                <button id="timer-start-pause" class="w-32 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg transition">Старт</button>
                <button id="timer-reset" class="w-32 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg text-lg transition">Сброс</button>
            </div>
        </div>
        <style>
            .timer-input { width: 80px; padding: 10px; font-size: 1.5rem; text-align: center; border-radius: 8px; border: 1px solid #D1D5DB; background-color: white; }
            .dark .timer-input { border-color: #4B5563; background-color: #374151; }
            .preset-btn { padding: 0.5rem 1rem; font-size: 0.875rem; background-color: #E5E7EB; color: #374151; border-radius: 9999px; transition: background-color 0.2s; }
            .dark .preset-btn { background-color: #4B5563; color: #D1D5DB; }
            .preset-btn:hover { background-color: #D1D5DB; }
            .dark .preset-btn:hover { background-color: #6B7280; }
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
    presetsContainer = document.getElementById('timer-presets');
    
    addListener(startPauseButton, 'click', handleStartPause);
    addListener(resetButton, 'click', handleReset);
    addListener(presetsContainer, 'click', (e) => {
        const target = e.target.closest('.preset-btn');
        if (target && target.dataset.time) {
            handleReset(); // Сначала сбрасываем всё
            totalSeconds = parseInt(target.dataset.time, 10);
            updateDisplay();
            startTimer();
        }
    });
}

export function cleanup() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.title = 'Mini Apps'; // Восстанавливаем исходный заголовок
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
