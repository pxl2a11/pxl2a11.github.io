// js/apps/metronome.js

// --- Глобальные переменные модуля ---
let audioContext;
let isPlaying = false;
let bpm = 120;
let schedulerId = null;
let nextNoteTime = 0.0;
const scheduleAheadTime = 0.1; // (в секундах) как далеко вперед планировать звук
const lookahead = 25.0;      // (в миллисекундах) как часто запускается планировщик

// --- Ссылки на DOM-элементы ---
let bpmDisplay, bpmSlider, startStopBtn, visualIndicator;

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <style>
            #metronome-visual-indicator {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #cbd5e1; /* slate-300 */
                transition: background-color 0.1s ease-in-out, transform 0.1s ease-in-out;
            }
            .dark #metronome-visual-indicator {
                background-color: #334155; /* slate-700 */
            }
            #metronome-visual-indicator.active {
                background-color: #f59e0b; /* amber-500 */
                transform: scale(1.1);
            }
        </style>
        <div class="max-w-xs mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center space-y-6">
            
            <div id="metronome-visual-indicator"></div>

            <div class="text-center">
                <div id="bpm-display" class="text-6xl font-bold font-mono">${bpm}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">ударов в минуту</div>
            </div>

            <div>
                <input id="bpm-slider" type="range" min="40" max="220" value="${bpm}" class="w-64">
            </div>

            <button id="start-stop-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors">
                Старт
            </button>
        </div>
    `;
}

/**
 * Воспроизводит звук щелчка в заданное время.
 * @param {number} time - Время для воспроизведения из audioContext.currentTime.
 */
function scheduleClick(time) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, time); // Высокая частота для "клика"
    gainNode.gain.setValueAtTime(1, time);
    
    // Короткая атака и затухание для имитации щелчка
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    oscillator.start(time);
    oscillator.stop(time + 0.05);

    // Визуальная индикация
    setTimeout(() => {
        visualIndicator.classList.add('active');
        setTimeout(() => visualIndicator.classList.remove('active'), 100);
    }, (time - audioContext.currentTime) * 1000);
}

/**
 * Планировщик, который проверяет, не пора ли запланировать следующий щелчок.
 */
function scheduler() {
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        scheduleClick(nextNoteTime);
        const secondsPerBeat = 60.0 / bpm;
        nextNoteTime += secondsPerBeat;
    }
}

/**
 * Запускает метроном.
 */
function startMetronome() {
    if (isPlaying) return;

    // Создаем AudioContext при первом запуске
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            alert('Ваш браузер не поддерживает Web Audio API.');
            return;
        }
    }
    
    // Возобновляем контекст, если он был приостановлен
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    isPlaying = true;
    startStopBtn.textContent = 'Стоп';
    startStopBtn.classList.replace('bg-blue-500', 'bg-red-500');
    startStopBtn.classList.replace('hover:bg-blue-600', 'hover:bg-red-600');

    nextNoteTime = audioContext.currentTime + 0.1; // Небольшая задержка перед первым ударом
    schedulerId = setInterval(scheduler, lookahead);
}

/**
 * Останавливает метроном.
 */
function stopMetronome() {
    if (!isPlaying) return;

    isPlaying = false;
    clearInterval(schedulerId);
    schedulerId = null;

    startStopBtn.textContent = 'Старт';
    startStopBtn.classList.replace('bg-red-500', 'bg-blue-500');
    startStopBtn.classList.replace('hover:bg-red-600', 'hover:bg-blue-600');
}

/**
 * Инициализация логики приложения.
 */
export function init() {
    // Получаем элементы DOM
    bpmDisplay = document.getElementById('bpm-display');
    bpmSlider = document.getElementById('bpm-slider');
    startStopBtn = document.getElementById('start-stop-btn');
    visualIndicator = document.getElementById('metronome-visual-indicator');

    // Назначаем обработчики событий
    startStopBtn.addEventListener('click', () => {
        isPlaying ? stopMetronome() : startMetronome();
    });

    bpmSlider.addEventListener('input', () => {
        bpm = parseInt(bpmSlider.value, 10);
        bpmDisplay.textContent = bpm;
    });
}

/**
 * Очистка ресурсов при выходе из приложения.
 */
export function cleanup() {
    stopMetronome();
    if (audioContext) {
        audioContext.close().then(() => {
            audioContext = null;
        });
    }
}
