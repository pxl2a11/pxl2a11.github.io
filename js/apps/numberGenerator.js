export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-6">
            <div id="rng-result" class="text-7xl font-bold transition-transform duration-300 ease-in-out">?</div>
            <div class="w-full space-y-4">
                <div class="flex items-center gap-4">
                    <div class="flex-1">
                        <label for="min-num" class="text-sm font-medium">От</label>
                        <input id="min-num" type="number" value="1" class="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-center">
                    </div>
                    <div class="flex-1">
                        <label for="max-num" class="text-sm font-medium">До</label>
                        <input id="max-num" type="number" value="100" class="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-center">
                    </div>
                </div>
                <p id="rng-error" class="text-red-500 text-center h-4"></p>
            </div>
            <button id="generate-num-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Сгенерировать число</button>
        </div>`;
}

export function init() {
    const resultEl = document.getElementById('rng-result');
    const minInput = document.getElementById('min-num');
    const maxInput = document.getElementById('max-num');
    const generateBtn = document.getElementById('generate-num-btn');
    const errorEl = document.getElementById('rng-error');

    generateBtn.addEventListener('click', () => {
        const min = parseInt(minInput.value, 10);
        const max = parseInt(maxInput.value, 10);
        errorEl.textContent = ''; 
        if (isNaN(min) || isNaN(max)) { errorEl.textContent = 'Пожалуйста, введите числа.'; return; }
        if (min >= max) { errorEl.textContent = 'Минимальное значение должно быть меньше максимального.'; return; }
        resultEl.style.transform = 'scale(0.8)';
        resultEl.style.opacity = '0.5';
        setTimeout(() => {
            resultEl.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
            resultEl.style.transform = 'scale(1)';
            resultEl.style.opacity = '1';
        }, 150);
    });
}

export function cleanup() {}
