// 43js/apps/timer.js

let timerInterval = null;
let totalSeconds = 0;
let eventListeners = [];

let hoursInput, minutesInput, secondsInput, timerDisplay, startPauseButton, resetButton, presetsContainer, soundSelect;
let notificationSounds = {};

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

function validateInputs() {
    if (timerInterval) return;
    const h = parseInt(hoursInput.value) || 0;
    const m = parseInt(minutesInput.value) || 0;
    const s = parseInt(secondsInput.value) || 0;
    const total = h * 3600 + m * 60 + s;
    startPauseButton.disabled = total <= 0;
}

function updateTitle() {
    if (timerInterval && totalSeconds > 0) {
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        document.title = `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}] Таймер`;
    } else {
        document.title = 'Таймер | Mini Apps';
    }
}

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    timerDisplay.innerHTML = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

    startPauseButton.disabled = false;
    startPauseButton.textContent = 'Пауза';
    startPauseButton.classList.replace('bg-blue-500', 'bg-amber-500');
    startPauseButton.classList.replace('hover:bg-blue-600', 'hover:bg-amber-600');
    resetButton.disabled = false;
    
    timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            startPauseButton.textContent = 'Старт';
            startPauseButton.classList.replace('bg-amber-500', 'bg-blue-500');
            startPauseButton.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
            
            const selectedSound = soundSelect.value;
            if (notificationSounds[selectedSound]) {
                notificationSounds[selectedSound].play();
            }

            timerDisplay.classList.add('animate-pulse', 'text-red-500');
            validateInputs();
            updateTitle();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startPauseButton.textContent = 'Далее';
    startPauseButton.classList.replace('bg-amber-500', 'bg-blue-500');
    startPauseButton.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
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
    startPauseButton.classList.replace('bg-amber-500', 'bg-blue-500');
    startPauseButton.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
    timerDisplay.classList.remove('animate-pulse', 'text-red-500');
    resetButton.disabled = true;
    startPauseButton.disabled = true;
    updateDisplay();
}

export function getHtml() {
    return `
        <div class="flex flex-col items-center text-center max-w-md mx-auto space-y-8">
            <audio id="timer-notification-1" src="sounds/notification.mp3" preload="auto"></audio>
            <audio id="timer-notification-2" src="sounds/notification2.mp3" preload="auto"></audio>
            <audio id="timer-notification-3" src="sounds/notification3.mp3" preload="auto"></audio>
            <audio id="timer-notification-4" src="sounds/notification4.mp3" preload="auto"></audio>

            <p id="timer-display" class="text-7xl font-mono font-light tracking-tighter">00:00:00</p>

            <div class="flex justify-center items-center space-x-2">
                <input type="number" id="timer-hours" placeholder="ЧЧ" min="0" class="timer-input">
                <span class="text-2xl font-light text-gray-400">:</span>
                <input type="number" id="timer-minutes" placeholder="ММ" min="0" max="59" class="timer-input">
                <span class="text-2xl font-light text-gray-400">:</span>
                <input type="number" id="timer-seconds" placeholder="СС" min="0" max="59" class="timer-input">
            </div>
            
            <div id="timer-presets" class="flex justify-center flex-wrap gap-2">
                <button data-time="60" class="preset-btn">1 мин</button>
                <button data-time="300" class="preset-btn">5 мин</button>
                <button data-time="600" class="preset-btn">10 мин</button>
                <button data-time="900" class="preset-btn">15 мин</button>
            </div>

             <!-- Новый блок выбора звука -->
            <div class="w-full max-w-xs">
                <label for="timer-sound-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Звук уведомления</label>
                <select id="timer-sound-select" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <option value="1">Звук 1 (Стандартный)</option>
                    <option value="2">Звук 2</option>
                    <option value="3">Звук 3</option>
                    <option value="4">Звук 4</option>
                </select>
            </div>

            <div class="flex items-center justify-center space-x-6 w-full">
                <button id="timer-start-pause" class="sw-btn-primary bg-blue-500 hover:bg-blue-600" disabled>Старт</button>
                <button id="timer-reset" class="sw-btn-secondary" disabled>Сброс</button>
            </div>
        </div>
        <style>
            .timer-input { width: 70px; padding: 8px; font-size: 1.25rem; text-align: center; border-radius: 8px; border: 2px solid #F3F4F6; background-color: #F3F4F6; transition: all .2s; -moz-appearance: textfield; }
            .timer-input::-webkit-outer-spin-button, .timer-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .dark .timer-input { border-color: #374151; background-color: #374151; }
            .timer-input:focus { border-color: #3B82F6; background-color: white; }
            .dark .timer-input:focus { background-color: #4B5563; }
            .preset-btn { padding: 0.5rem 1rem; font-size: 0.875rem; background-color: #E5E7EB; color: #374151; border-radius: 9999px; transition: background-color 0.2s; border: 1px solid transparent }
            .dark .preset-btn { background-color: #4B5563; color: #D1D5DB; }
            .preset-btn:hover { background-color: #D1D5DB; border-color: #9CA3AF; }
            .dark .preset-btn:hover { background-color: #6B7280; border-color: #9CA3AF; }
            .sw-btn-primary { width: 100px; height: 100px; font-size: 1.25rem; color: white; font-weight: 600; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all .2s; }
            .sw-btn-primary:hover:not(:disabled) { transform: scale(1.05); }
            .sw-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
            .sw-btn-secondary { width: 80px; height: 80px; font-size: 1rem; color: #374151; background-color: #E5E7EB; border-radius: 50%; transition: all .2s; }
            .dark .sw-btn-secondary { background-color: #374151; color: #D1D5DB; }
            .sw-btn-secondary:not(:disabled):hover { background-color: #D1D5DB; transform: scale(1.05); }
            .dark .sw-btn-secondary:not(:disabled):hover { background-color: #4B5563; }
            .sw-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
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
    presetsContainer = document.getElementById('timer-presets');
    soundSelect = document.getElementById('timer-sound-select');
    
    notificationSounds = {
        '1': document.getElementById('timer-notification-1'),
        '2': document.getElementById('timer-notification-2'),
        '3': document.getElementById('timer-notification-3'),
        '4': document.getElementById('timer-notification-4'),
    };
    
    const savedSound = localStorage.getItem('timerSound') || '1';
    soundSelect.value = savedSound;

    addListener(startPauseButton, 'click', handleStartPause);
    addListener(resetButton, 'click', handleReset);
    addListener(hoursInput, 'input', validateInputs);
    addListener(minutesInput, 'input', validateInputs);
    addListener(secondsInput, 'input', validateInputs);
    
    addListener(soundSelect, 'change', () => {
        localStorage.setItem('timerSound', soundSelect.value);
    });

    addListener(presetsContainer, 'click', (e) => {
        const target = e.target.closest('.preset-btn');
        if (target && target.dataset.time) {
            handleReset();
            totalSeconds = parseInt(target.dataset.time, 10);
            updateDisplay();
            startTimer();
        }
    });
}

export function cleanup() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.title = 'Mini Apps';
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
