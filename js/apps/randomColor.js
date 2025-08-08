export function getHtml() {
    return `
        <!-- Внешний контейнер для идеального центрирования компонента -->
        <div class="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
            
            <!-- Основная карточка компонента -->
            <div class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6">
                
                <!-- Главный flex-контейнер: вертикальный на мобильных, горизонтальный на десктопах -->
                <div class="flex flex-col md:flex-row md:gap-8">
                    
                    <!-- Левая колонка: Дисплей цвета и кнопка -->
                    <div class="flex-shrink-0 flex flex-col items-center gap-4 mb-6 md:mb-0 md:w-56">
                        <div id="color-display" class="w-full h-56 rounded-xl shadow-lg transition-colors duration-300 border-4 border-gray-200 dark:border-gray-700"></div>
                        <button id="generate-color-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105">
                            Новый цвет
                        </button>
                    </div>

                    <!-- Правая колонка: Информация и палитры. min-w-0 исправляет ошибки переполнения flexbox -->
                    <div class="flex-grow flex flex-col space-y-5 min-w-0">
                        
                        <!-- Секция с кодами цветов -->
                        <div class="space-y-3">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Коды цвета</h3>
                            <div class="space-y-2">
                                 <div class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                    <span id="color-code-hex" class="text-base md:text-lg font-mono text-gray-900 dark:text-gray-200 truncate">#ffffff</span>
                                    <button id="copy-hex" title="Скопировать" class="flex-shrink-0 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </button>
                                </div>
                                <div class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                    <span id="color-code-rgb" class="text-base md:text-lg font-mono text-gray-900 dark:text-gray-200 truncate">rgb(255, 255, 255)</span>
                                     <button id="copy-rgb" title="Скопировать" class="flex-shrink-0 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </button>
                                </div>
                                <div class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                    <span id="color-code-hsl" class="text-base md:text-lg font-mono text-gray-900 dark:text-gray-200 truncate">hsl(0, 0%, 100%)</span>
                                     <button id="copy-hsl" title="Скопировать" class="flex-shrink-0 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Секция с палитрами -->
                        <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <h4 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">Комплементарная палитра</h4>
                                <div id="complementary-palette" class="flex gap-3"></div>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">Аналоговая палитра</h4>
                                <div id="analogous-palette" class="flex gap-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

export function init() {
    // --- Получение элементов ---
    const display = document.getElementById('color-display');
    const codeHex = document.getElementById('color-code-hex');
    const codeRgb = document.getElementById('color-code-rgb');
    const codeHsl = document.getElementById('color-code-hsl');
    const btn = document.getElementById('generate-color-btn');
    const complementaryPaletteEl = document.getElementById('complementary-palette');
    const analogousPaletteEl = document.getElementById('analogous-palette');

    // --- Функции-конвертеры (без изменений) ---
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6];
        }
        return { r: +r, g: +g, b: +b };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) { h = s = 0; } 
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    function hslToHex(h, s, l) {
        s /= 100; l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2, r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; } 
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; } 
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; } 
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; } 
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);
        if (r.length == 1) r = "0" + r;
        if (g.length == 1) g = "0" + g;
        if (b.length == 1) b = "0" + b;
        return "#" + r + g + b;
    }

    // --- Основная логика ---
    const renderPalette = (el, colors) => {
        el.innerHTML = '';
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'w-12 h-12 rounded-lg shadow-inner cursor-pointer border-2 border-gray-200 dark:border-gray-700';
            swatch.style.backgroundColor = color;
            swatch.title = `Нажмите, чтобы выбрать ${color}`;
            swatch.onclick = () => generateColor(color);
            el.appendChild(swatch);
        });
    };

    const generateColor = (baseHex = null) => {
        const randomColor = baseHex || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        display.style.backgroundColor = randomColor;
        codeHex.textContent = randomColor;

        const rgb = hexToRgb(randomColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        codeRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        codeHsl.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        
        const complementaryH = (hsl.h + 180) % 360;
        const complementaryHex = hslToHex(complementaryH, hsl.s, hsl.l);
        renderPalette(complementaryPaletteEl, [randomColor, complementaryHex]);
        
        const analogousH1 = (hsl.h + 30) % 360;
        const analogousH2 = (hsl.h - 30 + 360) % 360;
        const analogousHex1 = hslToHex(analogousH2, hsl.s, hsl.l);
        const analogousHex2 = hslToHex(analogousH1, hsl.s, hsl.l);
        renderPalette(analogousPaletteEl, [analogousHex1, randomColor, analogousHex2]);
    };

    // --- Функция копирования ---
    const copyToClipboard = (text, btnEl) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = btnEl.innerHTML;
            btnEl.innerHTML = `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            setTimeout(() => {
                btnEl.innerHTML = originalIcon;
            }, 1500);
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
        });
    };
    
    // --- Слушатели событий ---
    btn.addEventListener('click', () => generateColor());
    
    document.getElementById('copy-hex').addEventListener('click', (e) => copyToClipboard(codeHex.textContent, e.currentTarget));
    document.getElementById('copy-rgb').addEventListener('click', (e) => copyToClipboard(codeRgb.textContent, e.currentTarget));
    document.getElementById('copy-hsl').addEventListener('click', (e) => copyToClipboard(codeHsl.textContent, e.currentTarget));

    generateColor(); // Генерируем начальный цвет
}

export function cleanup() {}
