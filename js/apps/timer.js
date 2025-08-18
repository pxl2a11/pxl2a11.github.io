// js/apps/timer.js

let timerInterval = null;
let totalSeconds = 0;
let eventListeners = [];

// Элементы UI
let hoursInput, minutesInput, secondsInput;
let timerDisplay;
let startPauseButton, resetButton, presetsContainer;
let playIcon, pauseIcon;
let notificationSound;

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
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

    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    startPauseButton.classList.replace('bg-blue-500', 'bg-amber-500');
    startPauseButton.classList.replace('hover:bg-blue-600', 'hover:bg-amber-600');
    
    timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            startPauseButton.classList.replace('bg-amber-500', 'bg-blue-500');
            startPauseButton.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
            notificationSound.play();
            timerDisplay.classList.add('animate-pulse', 'text-red-500');
            updateTitle(); // Сбросить заголовок
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
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
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    startPauseButton.classList.replace('bg-amber-500', 'bg-blue-500');
    startPauseButton.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
    timerDisplay.classList.remove('animate-pulse', 'text-red-500');
    updateDisplay();
}

export function getHtml() {
    return `
        <div class="flex flex-col items-center text-center max-w-md mx-auto">
            <audio id="timer-notification" src="sounds/notification.wav" preload="auto"></audio>

            <div id="timer-display" class="text-7xl md:text-8xl font-mono font-light mb-6 w-full p-4 rounded-lg">00:00:00</div>

            <div class="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-inner mb-6">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Установить время</p>
                <div class="flex justify-center items-center space-x-2">
                    <input type="number" id="timer-hours" placeholder="ЧЧ" min="0" class="timer-input">
                    <span class="text-2xl font-light text-gray-400">:</span>
                    <input type="number" id="timer-minutes" placeholder="ММ" min="0" max="59" class="timer-input">
                    <span class="text-2xl font-light text-gray-400">:</span>
                    <input type="number" id="timer-seconds" placeholder="СС" min="0" max="59" class="timer-input">
                </div>
            </div>
            
            <div id="timer-presets" class="flex justify-center flex-wrap gap-2 mb-8">
                <button data-time="60" class="preset-btn">1 мин</button>
                <button data-time="300" class="preset-btn">5 мин</button>
                <button data-time="600" class="preset-btn">10 мин</button>
                <button data-time="900" class="preset-btn">15 мин</button>
            </div>

            <div class="flex items-center space-x-6">
                <button id="timer-reset" class="control-btn-secondary" title="Сброс">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 13M20 20l-1.5-1.5A9 9 0 012.5 11" /></svg>
                </button>
                <button id="timer-start-pause" class="control-btn-primary bg-blue-500 hover:bg-blue-600">
                    <svg id="timer-play-icon" class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 15.132A8.996 8.996 0 012 10c0-4.962 4.038-9 9-9s9 4.038 9 9-4.038 9-9 9a8.996 8.996 0 01-5.132-1.518L3 18l1.018-2.868zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2H8z" clip-rule="evenodd" /></svg>
                    <svg id="timer-pause-icon" class="w-10 h-10 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2H8z" clip-rule="evenodd" /></svg>
                </button>
                <div class="w-16 h-16"></div> <!-- Spacer -->
            </div>
        </div>
        <style>
            .timer-input { width: 70px; padding: 8px; font-size: 1.25rem; text-align: center; border-radius: 8px; border: 2px solid transparent; background-color: #F3F4F6; transition: all .2s; }
            .dark .timer-input { background-color: #374151; }
            .timer-input:focus { border-color: #3B82F6; background-color: white; }
            .dark .timer-input:focus { background-color: #4B5563; }
            .preset-btn { padding: 0.5rem 1rem; font-size: 0.875rem; background-color: #E5E7EB; color: #374151; border-radius: 9999px; transition: background-color 0.2s; border: 1px solid transparent }
            .dark .preset-btn { background-color: #4B5563; color: #D1D5DB; }
            .preset-btn:hover { background-color: #D1D5DB; border-color: #9CA3AF; }
            .dark .preset-btn:hover { background-color: #6B7280; border-color: #9CA3AF; }
            .control-btn-primary { width: 80px; height: 80px; border-radius: 50%; display:flex; justify-content:center; align-items:center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all .2s; }
            .control-btn-primary svg { margin-left: 4px; }
            #timer-pause-icon { margin: 0; }
            .control-btn-primary:hover { transform: scale(1.05); }
            .control-btn-secondary { width: 64px; height: 64px; border-radius: 50%; display:flex; justify-content:center; align-items:center; background-color: #E5E7EB; color: #4B5563; transition: all .2s; }
            .dark .control-btn-secondary { background-color: #4B5563; color: #D1D5DB; }
            .control-btn-secondary:hover { background-color: #D1D5DB; transform: scale(1.05); }
            .dark .control-btn-secondary:hover { background-color: #6B7280; }
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
    playIcon = document.getElementById('timer-play-icon');
    pauseIcon = document.getElementById('timer-pause-icon');
    
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
