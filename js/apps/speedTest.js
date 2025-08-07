let speedTestAbortController;

export function getHtml() {
    return `
        <div class="max-w-lg w-full mx-auto text-center p-4">
            <p id="status" class="text-xl text-slate-600 dark:text-gray-400 mb-6">Нажмите "Начать тест", чтобы проверить скорость.</p>
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div id="pingResultContainer" class="hidden"><p class="text-lg font-medium text-slate-600 dark:text-gray-400">Пинг</p><p id="pingResult" class="text-5xl font-extralight">-</p><p class="text-xl text-slate-500 dark:text-gray-500 mt-1">мс</p></div>
                <div id="downloadResultContainer" class="hidden"><p class="text-lg font-medium text-slate-600 dark:text-gray-400">Загрузка</p><p id="downloadResult" class="text-5xl font-extralight">-</p><p class="text-xl text-slate-500 dark:text-gray-500 mt-1">Мбит/с</p></div>
            </div>
            <div id="progressBarContainer" class="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2 mb-4 hidden"><div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-150 ease-in-out" style="width: 0%;"></div></div>
            <p id="progressText" class="text-slate-500 dark:text-gray-500 hidden mb-4">0%</p>
            <button id="startButton" class="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Начать тест</button>
        </div>`;
}

export function init() {
    const startButton = document.getElementById('startButton'), statusElement = document.getElementById('status'), pingResultContainer = document.getElementById('pingResultContainer'), pingResultElement = document.getElementById('pingResult'), downloadResultContainer = document.getElementById('downloadResultContainer'), downloadResultElement = document.getElementById('downloadResult'), progressBarContainer = document.getElementById('progressBarContainer'), progressBar = document.getElementById('progressBar'), progressText = document.getElementById('progressText'), downloadFileUrl = 'https://cachefly.cachefly.net/100mb.test', testDuration = 10000, pingCount = 5;
    const updateSpeedColor = (element, speed) => { element.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500'); if (speed < 10) element.classList.add('text-red-500'); else if (speed >= 10 && speed < 80) element.classList.add('text-yellow-500'); else element.classList.add('text-green-500'); };
    const measurePing = async () => { statusElement.textContent = 'Измерение пинга...'; pingResultElement.textContent = '...'; let pings = []; for (let i = 0; i < pingCount; i++) { const startTime = performance.now(); try { await fetch(downloadFileUrl, { method: 'HEAD', cache: 'no-store', mode: 'cors' }); pings.push(performance.now() - startTime); } catch (e) {} } if (pings.length > 0) pingResultElement.textContent = Math.round(Math.min(...pings)); else pingResultElement.textContent = 'X'; };
    const runDownloadTest = async () => { let receivedBytes = 0; const startTime = performance.now(); speedTestAbortController = new AbortController(); const signal = speedTestAbortController.signal; let testIsActive = true; setTimeout(() => { testIsActive = false; if(speedTestAbortController) speedTestAbortController.abort(); }, testDuration); const updateUI = () => { if (!testIsActive) return; const elapsedTime = performance.now() - startTime; const progress = (elapsedTime / testDuration) * 100; progressBar.style.width = `${Math.min(progress, 100)}%`; progressText.textContent = `${Math.min(Math.round(progress), 100)}%`; const speedInMbps = (receivedBytes * 8 / (elapsedTime / 1000)) / (1024 * 1024); if (isFinite(speedInMbps)) { downloadResultElement.textContent = speedInMbps.toFixed(2); updateSpeedColor(downloadResultElement, speedInMbps); } requestAnimationFrame(updateUI); }; requestAnimationFrame(updateUI); const downloadAndMeasure = async () => { const response = await fetch(downloadFileUrl, { cache: 'no-store', signal, mode: 'cors' }); if (!response.ok) throw new Error(`HTTP error ${response.status}`); if (response.body) { const reader = response.body.getReader(); while (testIsActive) { const { done, value } = await reader.read(); if (done) break; if (value) receivedBytes += value.length; } } }; while(testIsActive) { try { await downloadAndMeasure(); } catch (error) { if (error.name !== 'AbortError') { console.error(`Ошибка при тесте загрузки:`, error); downloadResultElement.textContent = 'X'; } break; } } };
    const startFullTest = async () => { startButton.disabled = true; startButton.textContent = 'Тестирование...'; pingResultElement.textContent = '-'; downloadResultElement.textContent = '-'; [...document.querySelectorAll('.text-red-500, .text-yellow-500, .text-green-500')].forEach(el => el.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500')); pingResultContainer.classList.remove('hidden'); downloadResultContainer.classList.remove('hidden'); await measurePing(); statusElement.textContent = 'Проверка скорости загрузки...'; progressBarContainer.classList.remove('hidden'); progressText.classList.remove('hidden'); await runDownloadTest(); statusElement.textContent = 'Тест завершен.'; progressBarContainer.classList.add('hidden'); progressText.classList.add('hidden'); startButton.disabled = false; startButton.textContent = 'Начать тест'; };
    startButton.addEventListener('click', startFullTest);
}

export function cleanup() {
    if (speedTestAbortController) {
        speedTestAbortController.abort();
        speedTestAbortController = null;
    }
}
