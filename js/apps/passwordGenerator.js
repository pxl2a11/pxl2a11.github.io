export function getHtml() {
    return `
        <div class="p-4 space-y-6">
            <div class="relative">
                <input id="password-output" type="text" readonly class="w-full p-4 pr-12 text-lg font-mono rounded-lg border dark:bg-gray-700 dark:border-gray-600" placeholder="Нажмите 'Сгенерировать'">
                <button id="copy-password-btn" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            </div>
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
    const randomFunc = { lower: () => String.fromCharCode(Math.floor(Math.random() * 26) + 97), upper: () => String.fromCharCode(Math.floor(Math.random() * 26) + 65), num: () => String.fromCharCode(Math.floor(Math.random() * 10) + 48), sym: () => '!@#$%^&*(){}[]=<>/,.'.charAt(Math.floor(Math.random() * '!@#$%^&*(){}[]=<>/,.'.length)) };
    
    function generatePassword(upper, lower, num, sym, len) {
        let generatedPassword = '';
        const typesCount = upper + lower + num + sym;
        if (typesCount === 0) return '';
        const typesArr = [{upper}, {lower}, {num}, {sym}].filter(item => Object.values(item)[0]);
        for (let i = 0; i < len; i += typesCount) {
            typesArr.forEach(type => {
                const funcName = Object.keys(type)[0];
                generatedPassword += randomFunc[funcName]();
            });
        }
        return generatedPassword.slice(0, len).split('').sort(() => Math.random() - 0.5).join('');
    }
    
    lengthSlider.oninput = () => lengthVal.textContent = lengthSlider.value;
    generateBtn.onclick = () => {
        const length = +lengthSlider.value;
        const hasUpper = document.getElementById('uppercase').checked;
        const hasLower = document.getElementById('lowercase').checked;
        const hasNumbers = document.getElementById('numbers').checked;
        const hasSymbols = document.getElementById('symbols').checked;
        outputEl.value = generatePassword(hasUpper, hasLower, hasNumbers, hasSymbols, length);
    };
    copyBtn.onclick = () => { if(outputEl.value) { navigator.clipboard.writeText(outputEl.value); alert('Пароль скопирован!'); } };
}

export function cleanup() {
    // No cleanup needed for this app
}
