export function getHtml() {
    return `
        <div class="p-4 space-y-6 max-w-md mx-auto">
            <!-- Блок вывода пароля и кнопки копирования -->
            <div class="relative">
                <input id="password-output" type="text" readonly class="w-full p-4 pr-12 text-lg font-mono rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Нажмите 'Сгенерировать'">
                <button id="copy-password-btn" title="Скопировать пароль" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <!-- Иконка будет меняться при клике -->
                    <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            </div>
            
            <!-- Индикатор надежности пароля -->
            <div class="space-y-2">
                 <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div id="strength-bar" class="h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p id="strength-text" class="text-center text-sm font-semibold text-gray-500 dark:text-gray-400"></p>
            </div>
            
            <!-- Настройки генерации -->
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
            </div>

            <!-- Кнопка генерации -->
            <button id="generate-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105">Сгенерировать пароль</button>
        </div>`;
}

export function init() {
    // Получение элементов
    const lengthSlider = document.getElementById('length');
    const lengthVal = document.getElementById('length-val');
    const outputEl = document.getElementById('password-output');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-password-btn');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const options = ['uppercase', 'lowercase', 'numbers', 'symbols'];

    // Наборы символов
    const charSets = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        num: '0123456789',
        sym: '!@#$%^&*(){}[]=<>/,.'
    };
    
    // Функция оценки надежности
    function checkPasswordStrength(password, activeOptions) {
        let score = 0;
        if (!password) {
            strengthBar.style.width = '0%';
            strengthText.textContent = '';
            return;
        }

        if (password.length >= 8) score++;
        if (password.length > 12) score++;
        if (password.length > 16) score++;
        if (activeOptions.uppercase) score++;
        if (activeOptions.lowercase) score++;
        if (activeOptions.numbers) score++;
        if (activeOptions.symbols) score++;
        if (activeOptions.uppercase && activeOptions.lowercase && activeOptions.numbers && activeOptions.symbols && password.length >= 12) {
            score++;
        }

        let strength = { text: 'Очень слабый', color: 'bg-red-700', width: '10%' };
        if (score >= 8) strength = { text: 'Очень надежный', color: 'bg-green-700', width: '100%' };
        else if (score >= 6) strength = { text: 'Надежный', color: 'bg-green-500', width: '75%' };
        else if (score >= 4) strength = { text: 'Средний', color: 'bg-yellow-500', width: '50%' };
        else if (score >= 2) strength = { text: 'Слабый', color: 'bg-red-500', width: '25%' };
        
        strengthBar.className = `h-2.5 rounded-full transition-all duration-300 ${strength.color}`;
        strengthBar.style.width = strength.width;
        strengthText.textContent = strength.text;
    }

    // Основная функция генерации пароля
    function generatePassword() {
        const length = +lengthSlider.value;
        const activeOptions = {};
        let charset = '';
        
        options.forEach(opt => {
            const el = document.getElementById(opt);
            activeOptions[opt] = el.checked;
            if (el.checked) {
                charset += charSets[opt.slice(0, 3)];
            }
        });

        if (charset === '') {
            outputEl.value = '';
            checkPasswordStrength('', {});
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        outputEl.value = password;
        checkPasswordStrength(password, activeOptions);
    }
    
    // Обработчик копирования
    copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 1500);
        });
    });

    // Слушатели событий
    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
        generatePassword();
    });
    
    options.forEach(id => {
        document.getElementById(id).addEventListener('change', generatePassword);
    });

    generateBtn.addEventListener('click', generatePassword);

    // Первоначальная генерация
    generatePassword();
}

export function cleanup() {}
