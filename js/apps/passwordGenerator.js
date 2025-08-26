// js/apps/passwordGenerator.js

export function getHtml() {
    return `
        <div class="p-4 space-y-6 max-w-md mx-auto">
            <div class="relative">
                <input id="password-output" type="text" readonly class="w-full p-4 pr-12 text-lg font-mono rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Нажмите 'Сгенерировать'">
                <button id="copy-password-btn" title="Скопировать пароль" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            </div>
            
            <div class="space-y-2">
                 <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div id="strength-bar" class="h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p id="strength-text" class="text-center text-sm font-semibold text-gray-500 dark:text-gray-400"></p>
            </div>
            
            <div class="space-y-5">
                <div>
                    <label for="length" class="flex justify-between text-sm font-medium dark:text-gray-300 mb-2">
                        Длина пароля: <span id="length-val" class="font-bold">16</span>
                    </label>
                    <input id="length" type="range" min="8" max="32" value="16" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"><input type="checkbox" id="uppercase" class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500" checked><span class="ml-3 dark:text-gray-300">Прописные буквы</span></label>
                    <label class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"><input type="checkbox" id="lowercase" class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500" checked><span class="ml-3 dark:text-gray-300">Строчные буквы</span></label>
                    <label class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"><input type="checkbox" id="numbers" class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500" checked><span class="ml-3 dark:text-gray-300">Цифры</span></label>
                    <label class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"><input type="checkbox" id="symbols" class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500"><span class="ml-3 dark:text-gray-300">Символы</span></label>
                </div>
                <label class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input type="checkbox" id="exclude-similar" class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500">
                    <span class="ml-3 dark:text-gray-300">Исключить похожие (I, l, 1, O, 0)</span>
                </label>
            </div>

            <button id="generate-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105">Сгенерировать пароль</button>
            
            <!-- НОВЫЙ БЛОК: ИСТОРИЯ ПАРОЛЕЙ -->
            <div id="password-history-container" class="space-y-2 pt-4 border-t dark:border-gray-600">
                <h4 class="text-sm font-semibold text-center text-gray-500 dark:text-gray-400">История (последние 3)</h4>
                <div id="password-history" class="space-y-1 text-center font-mono"></div>
            </div>
        </div>`;
}

export function init() {
    //... (все переменные остаются)
    const historyContainer = document.getElementById('password-history');
    let passwordHistory = []; // Новый массив для истории
    
    // ... (остальные переменные и функция checkPasswordStrength без изменений)
    const lengthSlider = document.getElementById('length'); const lengthVal = document.getElementById('length-val'); const outputEl = document.getElementById('password-output'); const generateBtn = document.getElementById('generate-btn'); const copyBtn = document.getElementById('copy-password-btn'); const strengthBar = document.getElementById('strength-bar'); const strengthText = document.getElementById('strength-text'); const options = ['uppercase', 'lowercase', 'numbers', 'symbols', 'exclude-similar'];
    const charSets = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', num: '0123456789', sym: '!@#$%^&*(){}[]=<>/,.' };
    function checkPasswordStrength(password, activeOptions) { /* ... */ }

    // --- НОВАЯ ФУНКЦИЯ: ОТРИСОВКА ИСТОРИИ ---
    function renderHistory() {
        historyContainer.innerHTML = '';
        if (passwordHistory.length === 0) {
            historyContainer.innerHTML = `<p class="text-xs text-gray-400">Здесь будут ваши пароли</p>`;
            return;
        }
        passwordHistory.forEach(pass => {
            const passEl = document.createElement('button');
            passEl.className = 'w-full p-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer';
            passEl.textContent = pass;
            passEl.onclick = () => {
                navigator.clipboard.writeText(pass);
                passEl.textContent = 'Скопировано!';
                setTimeout(() => { passEl.textContent = pass; }, 1500);
            };
            historyContainer.appendChild(passEl);
        });
    }

    function generatePassword() {
        // ... (логика генерации пароля без изменений)
        const length = +lengthSlider.value; const activeOptions = {}; let charset = ''; const similarCharsRegex = /[Il1O0]/g; options.forEach(opt => { const el = document.getElementById(opt); activeOptions[opt] = el.checked; }); if (activeOptions.lowercase) charset += charSets.lower; if (activeOptions.uppercase) charset += charSets.upper; if (activeOptions.numbers) charset += charSets.num; if (activeOptions.symbols) charset += charSets.sym; if (activeOptions['exclude-similar']) { charset = charset.replace(similarCharsRegex, ''); } if (charset === '') { outputEl.value = ''; checkPasswordStrength('', {}); return; } let password = ''; for (let i = 0; i < length; i++) { password += charset.charAt(Math.floor(Math.random() * charset.length)); }
        
        outputEl.value = password;
        checkPasswordStrength(password, activeOptions);

        // --- ИЗМЕНЕНИЕ: ДОБАВЛЕНИЕ В ИСТОРИЮ ---
        if (password && !passwordHistory.includes(password)) {
            passwordHistory.unshift(password);
            if (passwordHistory.length > 3) {
                passwordHistory.pop();
            }
            renderHistory();
        }
    }
    
    //... (все слушатели событий без изменений)
    copyBtn.addEventListener('click', () => { /* ... */ });
    lengthSlider.addEventListener('input', () => { /* ... */ });
    options.forEach(id => { /* ... */ });
    generateBtn.addEventListener('click', generatePassword);

    generatePassword();
    renderHistory(); // Первичная отрисовка
}

export function cleanup() {}
