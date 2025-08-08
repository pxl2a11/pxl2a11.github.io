let stopwatchInterval;

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-6">
            <p id="stopwatch-display" class="text-6xl font-mono">00:00:00.000</p>
            <div class="flex space-x-4">
                <button id="sw-lap-reset-btn" class="w-28 bg-gray-500 text-white font-bold py-2 px-4 rounded-full">Сброс</button>
                <button id="sw-start-stop-btn" class="w-28 bg-green-500 text-white font-bold py-2 px-4 rounded-full">Старт</button>
            </div>
            <div id="laps-list" class="w-full max-w-sm mt-4 space-y-2 max-h-48 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"></div>
        </div>`;
}

export function init() {
    const display = document.getElementById('stopwatch-display'), startStopBtn = document.getElementById('sw-start-stop-btn'), lapResetBtn = document.getElementById('sw-lap-reset-btn'), lapsList = document.getElementById('laps-list');
    let startTime, updatedTime, difference, tInterval, running = false, savedTime = 0, lapCounter = 0;
    const formatTime = time => {
        let h = Math.floor((time % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60)).toString().padStart(2, '0');
        let m = Math.floor((time % (1e3 * 60 * 60)) / (1e3 * 60)).toString().padStart(2, '0');
        let s = Math.floor((time % (1e3 * 60)) / 1e3).toString().padStart(2, '0');
        let ms = Math.floor(time % 1e3).toString().padStart(3, '0');
        return `${h}:${m}:${s}.${ms}`;
    };
    const updateDisplay = () => { updatedTime = new Date().getTime(); difference = updatedTime - startTime; display.textContent = formatTime(difference); };
    const start = () => { if (!running) { startTime = new Date().getTime() - savedTime; stopwatchInterval = setInterval(updateDisplay, 10); running = true; startStopBtn.textContent = 'Стоп'; startStopBtn.classList.replace('bg-green-500', 'bg-red-500'); lapResetBtn.textContent = 'Круг'; } };
    const stop = () => { if (running) { clearInterval(stopwatchInterval); savedTime = new Date().getTime() - startTime; running = false; startStopBtn.textContent = 'Продолжить'; startStopBtn.classList.replace('bg-red-500', 'bg-green-500'); lapResetBtn.textContent = 'Сброс'; } };
    const reset = () => { clearInterval(stopwatchInterval); savedTime = 0; running = false; difference = 0; lapCounter = 0; display.textContent = "00:00:00.000"; lapsList.innerHTML = ''; startStopBtn.textContent = 'Старт'; startStopBtn.classList.replace('bg-red-500', 'bg-green-500'); lapResetBtn.textContent = 'Сброс'; };
    const lap = () => { if (running) { lapCounter++; const lapTime = formatTime(difference); const lapEl = document.createElement('div'); lapEl.className = 'flex justify-between p-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm'; lapEl.innerHTML = `<span>Круг ${lapCounter}</span><span class="font-mono">${lapTime}</span>`; lapsList.prepend(lapEl); } };
    startStopBtn.addEventListener('click', () => running ? stop() : start());
    lapResetBtn.addEventListener('click', () => running ? lap() : reset());
}

export function cleanup() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}
