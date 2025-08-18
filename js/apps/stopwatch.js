let stopwatchInterval;

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
            <p id="stopwatch-display" class="text-7xl font-mono font-light tracking-tighter">00:00:00<span class="text-4xl text-gray-500">.000</span></p>
            <div class="flex items-center justify-center space-x-6 w-full">
                <button id="sw-lap-reset-btn" class="sw-btn-secondary" disabled>Сброс</button>
                <button id="sw-start-stop-btn" class="sw-btn-primary bg-green-500 hover:bg-green-600">Старт</button>
            </div>
            <div id="laps-container" class="w-full mt-4">
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <h3 class="font-bold text-lg">Круги</h3>
                    <button id="sw-export-btn" class="hidden bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg hover:bg-blue-600">Экспорт</button>
                </div>
                <div id="laps-list" class="w-full space-y-2 p-2 rounded-lg">
                    <p id="laps-placeholder" class="text-center text-gray-500 py-4">Нет зафиксированных кругов.</p>
                </div>
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

export function init() {
    const display = document.getElementById('stopwatch-display'),
        startStopBtn = document.getElementById('sw-start-stop-btn'),
        lapResetBtn = document.getElementById('sw-lap-reset-btn'),
        lapsList = document.getElementById('laps-list'),
        lapsPlaceholder = document.getElementById('laps-placeholder'),
        exportBtn = document.getElementById('sw-export-btn');

    let startTime, updatedTime, difference, running = false, savedTime = 0, lapCounter = 0;

    const formatTime = time => {
        let h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        let m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        let s = Math.floor((time % (1000 * 60)) / 1000).toString().padStart(2, '0');
        let ms = Math.floor(time % 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s}<span class="text-4xl text-gray-500">.${ms}</span>`;
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
            startStopBtn.textContent = 'Стоп';
            startStopBtn.classList.replace('bg-green-500', 'bg-red-500');
            startStopBtn.classList.replace('hover:bg-green-600', 'hover:bg-red-600');
            lapResetBtn.textContent = 'Круг';
            lapResetBtn.disabled = false;
        }
    };

    const stop = () => {
        if (running) {
            clearInterval(stopwatchInterval);
            savedTime = difference;
            running = false;
            startStopBtn.textContent = 'Старт';
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
        display.innerHTML = '00:00:00<span class="text-4xl text-gray-500">.000</span>';
        lapsList.innerHTML = '';
        lapsList.appendChild(lapsPlaceholder);
        startStopBtn.textContent = 'Старт';
        startStopBtn.classList.replace('bg-red-500', 'bg-green-500');
        startStopBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
        lapResetBtn.textContent = 'Сброс';
        lapResetBtn.disabled = true;
        exportBtn.classList.add('hidden');
    };

    const lap = () => {
        if (running) {
            if (lapsPlaceholder) lapsPlaceholder.remove();
            lapCounter++;
            const lapTime = formatTime(difference).replace(/<span.*span>/, (match) => match.replace('text-4xl', 'text-base'));
            const lapEl = document.createElement('div');
            lapEl.className = 'flex justify-between items-baseline p-2 border-b border-gray-200 dark:border-gray-700 text-lg';
            lapEl.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400">Круг ${lapCounter}</span><span class="font-mono">${lapTime}</span>`;
            lapsList.prepend(lapEl);
            if (exportBtn.classList.contains('hidden')) {
                exportBtn.classList.remove('hidden');
            }
        }
    };

    const exportLaps = () => {
        const lapsData = Array.from(lapsList.children)
            .map(lapEl => lapEl.innerText.replace('\t', ': '))
            .reverse()
            .join('\n');

        if (lapsData && navigator.clipboard) {
            navigator.clipboard.writeText(lapsData).then(() => {
                const originalText = exportBtn.textContent;
                exportBtn.textContent = 'Скопировано!';
                exportBtn.disabled = true;
                setTimeout(() => {
                    exportBtn.textContent = originalText;
                    exportBtn.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования в буфер обмена: ', err);
                alert('Не удалось скопировать.');
            });
        }
    };

    startStopBtn.addEventListener('click', () => running ? stop() : start());
    lapResetBtn.addEventListener('click', () => running ? lap() : reset());
    exportBtn.addEventListener('click', exportLaps);
}

export function cleanup() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}
