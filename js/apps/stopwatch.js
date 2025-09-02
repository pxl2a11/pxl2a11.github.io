// js/apps/stopwatch.js

import { auth } from '../firebaseConfig.js';
import { getUserData, saveUserData } from '../dataManager.js';

let stopwatchInterval;
let eventListeners = [];

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
            <p id="stopwatch-display" class="text-7xl font-mono font-light tracking-tighter">00:00:00<span class="text-4xl text-gray-500">.000</span></p>
            <div class="flex items-center justify-center space-x-6 w-full">
                <button id="sw-start-stop-btn" class="sw-btn-primary bg-green-500 hover:bg-green-600">Старт</button>
                <button id="sw-lap-reset-btn" class="sw-btn-secondary" disabled>Сброс</button>
            </div>
            <div id="laps-container" class="w-full mt-4">
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <h3 class="font-bold text-lg">Круги</h3>
                    <div class="flex items-center gap-2">
                        <button id="sw-save-session-btn" class="hidden bg-purple-500 text-white font-bold py-1 px-3 text-sm rounded-lg hover:bg-purple-600">Сохранить</button>
                        <button id="sw-export-btn" class="hidden bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg hover:bg-blue-600">Экспорт</button>
                    </div>
                </div>
                <div id="laps-list" class="w-full space-y-2 p-2 rounded-lg">
                    <p id="laps-placeholder" class="text-center text-gray-500 py-4">Нет зафиксированных кругов.</p>
                </div>
            </div>
            <!-- Новый блок для сохраненных сессий -->
            <div id="sw-sessions-container" class="hidden w-full mt-4">
                 <h3 class="font-bold text-lg mb-2 text-center">Сохраненные сессии</h3>
                 <select id="sw-sessions-select" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <option value="">-- Выберите сессию для просмотра --</option>
                 </select>
            </div>
        </div>
        <style>
          .sw-btn-primary { width: 100px; height: 100px; font-size: 1.25rem; color: white; font-weight: 600; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all .2s; }
          .sw-btn-primary:hover { transform: scale(1.05); }
          .sw-btn-secondary { width: 80px; height: 80px; font-size: 1rem; color: #374151; background-color: #E5E7EB; border-radius: 50%; transition: all .2s; }
          .dark .sw-btn-secondary { background-color: #374151; color: #D1D5DB; }
          .sw-btn-secondary:not(:disabled):hover { background-color: #D1D5DB; transform: scale(1.05); }
          .dark .sw-btn-secondary:not(:disabled):hover { background-color: #4B5563; }
          .sw-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        </style>
        `;
}

export async function init() {
    const display = document.getElementById('stopwatch-display');
    const startStopBtn = document.getElementById('sw-start-stop-btn');
    const lapResetBtn = document.getElementById('sw-lap-reset-btn');
    const lapsList = document.getElementById('laps-list');
    const lapsPlaceholder = document.getElementById('laps-placeholder');
    const exportBtn = document.getElementById('sw-export-btn');
    const saveSessionBtn = document.getElementById('sw-save-session-btn');
    const sessionsContainer = document.getElementById('sw-sessions-container');
    const sessionsSelect = document.getElementById('sw-sessions-select');

    let startTime, updatedTime, difference, running = false, savedTime = 0, lapCounter = 0;
    let currentLaps = [];

    const formatTime = (time, forDisplay = true) => {
        let h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        let m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        let s = Math.floor((time % (1000 * 60)) / 1000).toString().padStart(2, '0');
        let ms = Math.floor(time % 1000).toString().padStart(3, '0');
        if (forDisplay) {
            return `${h}:${m}:${s}<span class="text-4xl text-gray-500">.${ms}</span>`;
        }
        return `${h}:${m}:${s}.${ms}`;
    };

    const updateDisplay = () => {
        updatedTime = new Date().getTime();
        difference = (updatedTime - startTime) + savedTime;
        display.innerHTML = formatTime(difference);
    };

    const start = () => {
        if (!running) {
            startTime = new Date().getTime();
            stopwatchInterval = setInterval(updateDisplay, 10);
            running = true;
            startStopBtn.textContent = 'Пауза';
            startStopBtn.classList.replace('bg-green-500', 'bg-red-500');
            startStopBtn.classList.replace('hover:bg-green-600', 'hover:bg-red-600');
            lapResetBtn.textContent = 'Круг';
            lapResetBtn.disabled = false;
        }
    };
    
    const renderLaps = (laps) => {
        lapsList.innerHTML = '';
        if (laps.length === 0) {
            lapsList.appendChild(lapsPlaceholder);
            return;
        }
         laps.forEach((lapData, index) => {
            const lapEl = document.createElement('div');
            lapEl.className = 'flex justify-between items-baseline p-2 border-b border-gray-200 dark:border-gray-700 text-lg';
            const lapTime = formatTime(lapData.time, true).replace(/<span.*span>/, (match) => match.replace('text-4xl', 'text-base'));
            lapEl.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400">Круг ${laps.length - index}</span><span class="font-mono">${lapTime}</span>`;
            lapsList.prepend(lapEl);
        });
    };

    const stop = () => {
        if (running) {
            clearInterval(stopwatchInterval);
            savedTime = difference;
            running = false;
            startStopBtn.textContent = 'Далее';
            startStopBtn.classList.replace('bg-red-500', 'bg-green-500');
            startStopBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
            lapResetBtn.textContent = 'Сброс';
        }
    };

    const reset = () => {
        clearInterval(stopwatchInterval);
        savedTime = 0;
        difference = 0;
        lapCounter = 0;
        running = false;
        currentLaps = [];
        display.innerHTML = '00:00:00<span class="text-4xl text-gray-500">.000</span>';
        renderLaps([]);
        startStopBtn.textContent = 'Старт';
        startStopBtn.classList.replace('bg-red-500', 'bg-green-500');
        startStopBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
        lapResetBtn.textContent = 'Сброс';
        lapResetBtn.disabled = true;
        exportBtn.classList.add('hidden');
        if (auth.currentUser) saveSessionBtn.classList.add('hidden');
    };

    const lap = () => {
        if (running) {
            lapCounter++;
            currentLaps.push({ lap: lapCounter, time: difference });
            renderLaps(currentLaps);
            if (exportBtn.classList.contains('hidden')) {
                exportBtn.classList.remove('hidden');
            }
            if (auth.currentUser && saveSessionBtn.classList.contains('hidden')) {
                saveSessionBtn.classList.remove('hidden');
            }
        }
    };

    const saveSession = async () => {
        if (!auth.currentUser || currentLaps.length === 0) return;
        const sessions = getUserData('stopwatchSessions', []);
        const sessionName = new Date().toLocaleString('ru-RU');
        sessions.unshift({ name: sessionName, laps: currentLaps });
        if (sessions.length > 20) sessions.pop(); // Ограничение на 20 сессий
        await saveUserData('stopwatchSessions', sessions);
        
        saveSessionBtn.textContent = 'Сохранено!';
        setTimeout(() => { saveSessionBtn.textContent = 'Сохранить'; }, 2000);
        await populateSessions();
    };

    const populateSessions = async () => {
        if (!auth.currentUser) return;
        const sessions = getUserData('stopwatchSessions', []);
        if (sessions.length > 0) {
            sessionsContainer.classList.remove('hidden');
            sessionsSelect.innerHTML = '<option value="">-- Выберите сессию для просмотра --</option>';
            sessions.forEach((session, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = session.name;
                sessionsSelect.appendChild(option);
            });
        }
    };

    const loadSession = () => {
        const index = sessionsSelect.value;
        if (index === '') return;
        reset();
        const sessions = getUserData('stopwatchSessions', []);
        const session = sessions[index];
        if (session) {
            currentLaps = session.laps;
            const lastLap = session.laps[session.laps.length - 1];
            difference = lastLap.time;
            display.innerHTML = formatTime(difference);
            renderLaps(currentLaps);
            exportBtn.classList.remove('hidden');
        }
    };
    
    const exportLaps = () => {
        const lapsData = currentLaps
            .map(lapData => `Круг ${lapData.lap}: ${formatTime(lapData.time, false)}`)
            .join('\\n');

        if (lapsData && navigator.clipboard) {
            navigator.clipboard.writeText(lapsData).then(() => {
                const originalText = exportBtn.textContent;
                exportBtn.textContent = 'Скопировано!';
                setTimeout(() => { exportBtn.textContent = 'Экспорт'; }, 2000);
            });
        }
    };
    
    addListener(startStopBtn, 'click', () => running ? stop() : start());
    addListener(lapResetBtn, 'click', () => running ? lap() : reset());
    addListener(exportBtn, 'click', exportLaps);
    addListener(saveSessionBtn, 'click', saveSession);
    addListener(sessionsSelect, 'change', loadSession);

    if (auth.currentUser) {
        await populateSessions();
    }
}

export function cleanup() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
