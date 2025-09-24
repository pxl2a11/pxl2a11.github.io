// js/apps/pomodoroTimer.js

// --- Глобальные переменные модуля ---
let timerInterval;
let remainingTime = 1500; // в секундах, по умолчанию 25 минут
let isPaused = true;
let currentMode = 'pomodoro';
let pomodoroCount = 0;

const TIME_SETTINGS = {
    pomodoro: 1500,    // 25 минут
    shortBreak: 300,   // 5 минут
    longBreak: 900,    // 15 минут
};

// --- Ссылки на DOM-элементы ---
let display, startPauseBtn, resetBtn, modeButtons, progressRing, pomodoroCounterEl, notificationSound;

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <style>
            #progress-ring-circle {
                transition: stroke-dashoffset 0.5s linear;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
            }
        </style>
        <div class="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center flex flex-col items-center space-y-6">
            
            <!-- Аудио для уведомления -->
            <audio id="pomodoro-sound" src="sounds/notification.mp3" preload="auto"></audio>

            <!-- Режимы таймера -->
            <div id="pomodoro-mode-buttons" class="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <button data-mode="pomodoro" class="pomodoro-mode-btn active">Помидор</button>
                <button data-mode="shortBreak" class="pomodoro-mode-btn">Короткий перерыв</button>
                <button data-mode="longBreak" class="pomodoro-mode-btn">Длинный перерыв</button>
            </div>

            <!-- Дисплей таймера с кольцом прогресса -->
            <div class="relative w-64 h-64 flex justify-center items-center">
                <svg id="progress-ring" class="w-full h-full" viewBox="0 0 120 120">
                    <circle class="text-gray-200 dark:text-gray-600" stroke-width="8" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60"/>
                    <circle id="progress-ring-circle" class="text-blue-500 dark:text-blue-400" stroke-width="8" stroke-linecap="round" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60"/>
                </svg>
                <div id="pomodoro-display" class="absolute text-5xl font-mono font-bold">25:00</div>
            </div>
            
            <!-- Кнопки управления -->
            <div class="flex items-center justify-center space-x-6 w-full">
                <button id="pomodoro-start-pause-btn" class="w-40 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all">Старт</button>
                <button id="pomodoro-reset-btn" class="w-24 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold py-3 px-6 rounded-full transition-all">Сброс</button>
            </div>

            <!-- Счетчик "помидоров" -->
            <div class="pt-4 text-lg">
                <span class="font-bold">Помидоры: </span>
                <span id="pomodoro-counter">0</span>
            </div>
        </div>
        <style>
            .pomodoro-mode-btn { padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 500; transition: all 0.2s; border: none; background: none; }
            .pomodoro-mode-btn.active { background-color: white; color: #3b82f6; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
            .dark .pomodoro-mode-btn.active { background-color: #374151; color: #60a5fa; }
        </style>
    `;
}

/**
 * Инициализация логики приложения.
 */
export function init() {
    // Получаем элементы
    display = document.getElementById('pomodoro-display');
    startPauseBtn = document.getElementById('pomodoro-start-pause-btn');
    resetBtn = document.getElementById('pomodoro-reset-btn');
    modeButtons = document.getElementById('pomodoro-mode-buttons');
    progressRing = document.getElementById('progress-ring-circle');
    pomodoroCounterEl = document.getElementById('pomodoro-counter');
    notificationSound = document.getElementById('pomodoro-sound');

    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

    // --- Функции управления таймером ---

    function updateDisplay() {
        const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
        document.title = `[${minutes}:${seconds}] Pomodoro | Mini Apps`;
    }
    
    function updateProgressRing() {
        const totalDuration = TIME_SETTINGS[currentMode];
        const offset = circumference - (remainingTime / totalDuration) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }
    
    function startTimer() {
        isPaused = false;
        startPauseBtn.textContent = 'Пауза';
        startPauseBtn.classList.replace('bg-blue-500', 'bg-amber-500');
        startPauseBtn.classList.replace('hover:bg-blue-600', 'hover:bg-amber-600');

        timerInterval = setInterval(() => {
            remainingTime--;
            updateDisplay();
            updateProgressRing();

            if (remainingTime < 0) {
                timerEnd();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        isPaused = true;
        clearInterval(timerInterval);
        startPauseBtn.textContent = 'Старт';
        startPauseBtn.classList.replace('bg-amber-500', 'bg-blue-500');
        startPauseBtn.classList.replace('hover:bg-amber-600', 'hover:bg-blue-600');
    }

    function timerEnd() {
        clearInterval(timerInterval);
        notificationSound.play();
        
        if (currentMode === 'pomodoro') {
            pomodoroCount++;
            pomodoroCounterEl.textContent = pomodoroCount;
            // После 4-х "помидоров" - длинный перерыв, иначе - короткий
            const nextMode = (pomodoroCount % 4 === 0) ? 'longBreak' : 'shortBreak';
            switchMode(nextMode);
        } else {
            switchMode('pomodoro');
        }
    }
    
    function resetTimer() {
        pauseTimer();
        remainingTime = TIME_SETTINGS[currentMode];
        updateDisplay();
        updateProgressRing();
        document.title = 'Pomodoro | Mini Apps';
    }

    function switchMode(mode) {
        currentMode = mode;
        isPaused = true;
        
        // Обновляем активную кнопку
        modeButtons.querySelector('.active').classList.remove('active');
        modeButtons.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        resetTimer();
    }

    // --- Назначаем обработчики событий ---

    startPauseBtn.addEventListener('click', () => {
        isPaused ? startTimer() : pauseTimer();
    });
    
    resetBtn.addEventListener('click', resetTimer);

    modeButtons.addEventListener('click', (e) => {
        const target = e.target.closest('.pomodoro-mode-btn');
        if (target) {
            switchMode(target.dataset.mode);
        }
    });

    // --- Инициализация состояния ---
    resetTimer(); // Устанавливаем начальное состояние
}

/**
 * Очистка ресурсов при выходе из приложения.
 */
export function cleanup() {
    clearInterval(timerInterval);
    document.title = 'Mini Apps'; // Восстанавливаем исходный заголовок
}
