export function getHtml() {
    return `
        <div class="p-4 space-y-6">
            <div class="relative">
                <input id="password-output" type="text" readonly class="w-full p-4 pr-12 text-lg font-mono rounded-lg border dark:bg-gray-700 dark:border-gray-600" placeholder="Нажмите 'Сгенерировать'">
                <button id="copy-password-btn" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            </div>
            <!-- Индикатор надежности -->
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div id="strength-bar" class="h-2.5 rounded-full transition-all" style="width: 0%"></div>
            </div>
            <p id="strength-text" class="text-center text-sm font-semibold text-gray-500 dark:text-gray-400"></p>
            
            <div class="space-y-4">
                <div>
                    <label for="length" class="flex justify-between text-sm font-medium">Длина пароля: <span id="length-val">16</span></label>
                    <input id="length" type="range" min="8" max="32" value="16" class="w-full">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <label class="flex items-center"><input type="checkbox" id="uppercase" class="h-4 w-4 rounded" checked><span class="ml-2">Прописные буквы</span></label>
                    <label class="flex items-center"><input type="checkbox" id="lowercase" class="h-4 w-4 rounded" checked><span class="ml-2">Строчные буквы</span></label>
                    <label class="flex items-center"><input type="checkbox" id="numbers" class="h-4 w-4 rounded" checked><span class="ml-2">Цифры</span></label>
                    <label class="flex items-center"><input type="checkbox" id="symbols" class="h-4 w-4 rounded"><span class="ml-2">Символы</span></label>
                </div>
            </div>
            <button id="generate-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Сгенерировать</button>
        </div>`;
}

export function init() {
    const lengthSlider = document.getElementById('length'), lengthVal = document.getElementById('length-val'), outputEl = document.getElementById('password-output'), generateBtn = document.getElementById('generate-btn'), copyBtn = document.getElementById('copy-password-btn');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    const randomFunc = { lower: () => String.fromCharCode(Math.floor(Math.random() * 26) + 97), upper: () => String.fromCharCode(Math.floor(Math.random() * 26) + 65), num: () => String.fromCharCode(Math.floor(Math.random() * 10) + 48), sym: () => '!@#$%^&*(){}[]=<>/,.'.charAt(Math.floor(Math.random() * '!@#$%^&*(){}[]=<>/,.'.length)) };
    
    function checkPasswordStrength(password, options) {
        let score = 0;
        if (password.length > 8) score++;
        if (password.length > 12) score++;
        if (password.length > 16) score++;
        if (options.upper) score++;
        if (options.lower) score++;
        if (options.numbers) score++;
        if (options.symbols) score++;

        let strength = {
            text: '',
            color: 'bg-gray-400',
            width: '0%'
        };

        if (score < 3) {
            strength.text = 'Очень слабый'; strength.color = 'bg-red-700'; strength.width = '10%';
        } else if (score < 5) {
            strength.text = 'Слабый'; strength.color = 'bg-red-500'; strength.width = '30%';
        } else if (score < 6) {
            strength.text = 'Средний'; strength.color = 'bg-yellow-500'; strength.width = '60%';
        } else if (score < 7) {
            strength.text = 'Надежный'; strength.color = 'bg-green-500'; strength.width = '80%';
        } else {
            strength.text = 'Очень надежный'; strength.color = 'bg-green-700'; strength.width = '100%';
        }
        
        strengthBar.className = `h-2.5 rounded-full transition-all ${strength.color}`;
        strengthBar.style.width = strength.width;
        strengthText.textContent = strength.text;
    }

    function generatePassword(upper, lower, num, sym, len) {
        let generatedPassword = '';
        const typesCount = upper + lower + num + sym;
        if (typesCount === 0) {
            checkPasswordStrength('', {});
            return '';
        }

        const typesArr = [{upper}, {lower}, {num}, {sym}].filter(item => Object.values(item)[0]);
        for (let i = 0; i < len; i += typesCount) {
            typesArr.forEach(type => {
                const funcName = Object.keys(type)[0];
                generatedPassword += randomFunc[funcName]();
            });
        }
        const finalPassword = generatedPassword.slice(0, len).split('').sort(() => Math.random() - 0.5).join('');
        checkPasswordStrength(finalPassword, { upper, lower, numbers: num, symbols: sym });
        return finalPassword;
    }
    
    function handleGenerate() {
        const length = +lengthSlider.value;
        const hasUpper = document.getElementById('uppercase').checked;
        const hasLower = document.getElementById('lowercase').checked;
        const hasNumbers = document.getElementById('numbers').checked;
        const hasSymbols = document.getElementById('symbols').checked;
        outputEl.value = generatePassword(hasUpper, hasLower, hasNumbers, hasSymbols, length);
    }

    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
        handleGenerate(); // Пересчитываем при изменении длины
    });
    
    ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
        document.getElementById(id).addEventListener('change', handleGenerate);
    });

    generateBtn.onclick = handleGenerate;
    copyBtn.onclick = () => { if(outputEl.value) { navigator.clipboard.writeText(outputEl.value); alert('Пароль скопирован!'); } };

    // Initial generation
    handleGenerate();
}

export function cleanup() {
    // No cleanup needed for this app
}```

---
### **Секундомер (stopwatch.js)**
*   **Что нового:**
    *   Добавлена кнопка "Экспорт" для копирования всего списка кругов в буфер обмена.

```javascript
let stopwatchInterval;

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-6">
            <p id="stopwatch-display" class="text-6xl font-mono">00:00:00.000</p>
            <div class="flex space-x-4">
                <button id="sw-lap-reset-btn" class="w-28 bg-gray-500 text-white font-bold py-2 px-4 rounded-full">Сброс</button>
                <button id="sw-start-stop-btn" class="w-28 bg-green-500 text-white font-bold py-2 px-4 rounded-full">Старт</button>
            </div>
            <div id="laps-container" class="w-full max-w-sm mt-4">
                <div id="laps-list" class="w-full space-y-2 max-h-48 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"></div>
                <button id="sw-export-btn" class="w-full mt-2 bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600 hidden">Экспорт</button>
            </div>
        </div>`;
}

export function init() {
    const display = document.getElementById('stopwatch-display'), startStopBtn = document.getElementById('sw-start-stop-btn'), lapResetBtn = document.getElementById('sw-lap-reset-btn'), lapsList = document.getElementById('laps-list'), exportBtn = document.getElementById('sw-export-btn');
    let startTime, updatedTime, difference, tInterval, running = false, savedTime = 0, lapCounter = 0;
    
    const formatTime = time => {
        let h = Math.floor((time % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60)).toString().padStart(2, '0');
        let m = Math.floor((time % (1e3 * 60 * 60)) / (1e3 * 60)).toString().padStart(2, '0');
        let s = Math.floor((time % (1e3 * 60)) / 1e3).toString().padStart(2, '0');
        let ms = Math.floor(time % 1e3).toString().padStart(3, '0');
        return `${h}:${m}:${s}.${ms}`;
    };

    const updateDisplay = () => { updatedTime = new Date().getTime(); difference = savedTime + (updatedTime - startTime); display.textContent = formatTime(difference); };
    
    const start = () => { if (!running) { startTime = new Date().getTime(); stopwatchInterval = setInterval(updateDisplay, 10); running = true; startStopBtn.textContent = 'Стоп'; startStopBtn.classList.replace('bg-green-500', 'bg-red-500'); lapResetBtn.textContent = 'Круг'; } };
    
    const stop = () => { if (running) { clearInterval(stopwatchInterval); savedTime = difference; running = false; startStopBtn.textContent = 'Продолжить'; startStopBtn.classList.replace('bg-red-500', 'bg-green-500'); lapResetBtn.textContent = 'Сброс'; } };
    
    const reset = () => { clearInterval(stopwatchInterval); savedTime = 0; running = false; difference = 0; lapCounter = 0; display.textContent = "00:00:00.000"; lapsList.innerHTML = ''; exportBtn.classList.add('hidden'); startStopBtn.textContent = 'Старт'; startStopBtn.classList.replace('bg-red-500', 'bg-green-500'); lapResetBtn.textContent = 'Сброс'; };
    
    const lap = () => { if (running) { lapCounter++; const lapTime = formatTime(difference); const lapEl = document.createElement('div'); lapEl.className = 'flex justify-between p-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm'; lapEl.innerHTML = `<span>Круг ${lapCounter}</span><span class="font-mono">${lapTime}</span>`; lapsList.prepend(lapEl); exportBtn.classList.remove('hidden'); } };
    
    const exportLaps = () => {
        const laps = Array.from(lapsList.children).reverse(); // reverse to get in chronological order
        if(laps.length === 0) return;
        const textToCopy = laps.map(lap => lap.innerText.replace('\t', ': ')).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = exportBtn.textContent;
            exportBtn.textContent = 'Скопировано!';
            setTimeout(() => { exportBtn.textContent = originalText; }, 1500);
        });
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
