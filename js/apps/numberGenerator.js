// js/apps/numberGenerator.js

export function getHtml() {
    return `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
            <div id="rng-result" class="text-5xl font-bold transition-all duration-300 ease-in-out min-h-[140px] flex flex-wrap justify-center items-center gap-4 text-center bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-6 p-4">?</div>
            
            <div class="w-full space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 items-end gap-4">
                    <div>
                        <label for="min-num" class="text-sm font-medium text-gray-700 dark:text-gray-300">От</label>
                        <input id="min-num" type="number" value="1" class="w-full mt-1 p-2 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-center no-spinner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="max-num" class="text-sm font-medium text-gray-700 dark:text-gray-300">До</label>
                        <input id="max-num" type="number" value="100" class="w-full mt-1 p-2 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-center no-spinner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                     <div>
                        <label for="num-count" class="text-sm font-medium text-gray-700 dark:text-gray-300">Количество</label>
                        <input id="num-count" type="number" value="1" min="1" max="100" class="w-full mt-1 p-2 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-center no-spinner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                </div>
                <label class="flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" id="unique-numbers" class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900">
                    <span class="ml-3 text-gray-800 dark:text-gray-300">Только уникальные числа</span>
                </label>
                <p id="rng-error" class="text-red-500 text-center h-4 transition-opacity duration-300"></p>
            </div>
            
            <div class="mt-6 w-full flex flex-col sm:flex-row gap-3">
                <button id="generate-num-btn" class="w-full sm:w-1/2 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 generate-btn-bg">Сгенерировать</button>
                <button id="copy-num-btn" class="w-full sm:w-1/2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50 invisible">Копировать</button>
            </div>
        </div>
        <style>
            .no-spinner::-webkit-outer-spin-button,
            .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .no-spinner { -moz-appearance: textfield; }
            
            .generate-btn-bg {
                background-image: linear-gradient(to right, #4f46e5, #818cf8);
                background-size: 200% auto;
            }

            .generate-btn-bg:hover {
                background-position: right center;
            }

            #rng-result span {
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        </style>
    `;
}

export function init() {
    const resultEl = document.getElementById('rng-result');
    const minInput = document.getElementById('min-num');
    const maxInput = document.getElementById('max-num');
    const countInput = document.getElementById('num-count');
    const uniqueCheck = document.getElementById('unique-numbers');
    const generateBtn = document.getElementById('generate-num-btn');
    const copyBtn = document.getElementById('copy-num-btn');
    const errorEl = document.getElementById('rng-error');
    let currentNumbers = [];

    generateBtn.addEventListener('click', () => {
        const min = parseInt(minInput.value, 10);
        const max = parseInt(maxInput.value, 10);
        const count = parseInt(countInput.value, 10);
        const unique = uniqueCheck.checked;
        errorEl.textContent = '';
        copyBtn.classList.add('invisible');

        if (isNaN(min) || isNaN(max) || isNaN(count)) { errorEl.textContent = 'Пожалуйста, введите числа.'; return; }
        if (min > max) { errorEl.textContent = 'Минимальное значение не может быть больше максимального.'; return; }
        if (count < 1 || count > 100) { errorEl.textContent = 'Количество должно быть от 1 до 100.'; return; }
        if (unique && count > (max - min + 1)) { errorEl.textContent = 'Невозможно сгенерировать столько уникальных чисел в этом диапазоне.'; return; }

        resultEl.style.transform = 'scale(0.8)';
        resultEl.style.opacity = '0.5';

        setTimeout(() => {
            resultEl.innerHTML = '';
            let numbersArray = [];

            if (unique) {
                const numbers = new Set();
                while(numbers.size < count) {
                    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                    numbers.add(randomNumber);
                }
                numbersArray = [...numbers];
            } else {
                for (let i = 0; i < count; i++) {
                    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                    numbersArray.push(randomNumber);
                }
            }
            currentNumbers = numbersArray;

            if (count === 1) {
                resultEl.style.fontSize = '4.5rem';
                resultEl.textContent = numbersArray[0];
            } else {
                resultEl.style.fontSize = '2rem';
                numbersArray.forEach(num => {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'bg-gray-200 dark:bg-gray-800 rounded-lg py-1 px-3';
                    numberSpan.textContent = num;
                    resultEl.appendChild(numberSpan);
                });
            }
            
            copyBtn.classList.remove('invisible');
            resultEl.style.transform = 'scale(1)';
            resultEl.style.opacity = '1';
        }, 150);
    });

    copyBtn.addEventListener('click', () => {
        if (currentNumbers.length > 0) {
            navigator.clipboard.writeText(currentNumbers.join(', ')).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!';
                setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
            });
        }
    });
}

export function cleanup() {}
