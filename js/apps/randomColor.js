export function getHtml() {
    return `
        <div class="p-3 flex flex-col items-center space-y-4 w-full max-w-xs">
            {/* Блок отображения цвета теперь содержит текстовую информацию */}
            <div id="color-display" class="relative w-40 h-40 rounded-2xl shadow-lg transition-colors duration-300 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center text-white" style="background-color: #ffffff;">
                <div class="p-3 text-center bg-black bg-opacity-50 rounded-lg">
                    <p id="color-code-hex" class="text-xl font-mono">#ffffff</p>
                    <p id="color-code-rgb" class="text-sm font-mono text-gray-300">rgb(255, 255, 255)</p>
                    <p id="color-code-hsl" class="text-sm font-mono text-gray-300">hsl(0, 0%, 100%)</p>
                </div>
            </div>
            
            <button id="generate-color-btn" class="w-full bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600">Новый цвет</button>
            
            {/* Палитры */}
            <div id="palettes-container" class="w-full space-y-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                <div>
                    <h4 class="text-center font-semibold mb-2">Комплементарная палитра</h4>
                    <div id="complementary-palette" class="flex justify-center gap-2"></div>
                </div>
                <div>
                    <h4 class="text-center font-semibold mb-2">Аналоговая палитра</h4>
                    <div id="analogous-palette" class="flex justify-center gap-2"></div>
                </div>
            </div>
        </div>`;
}

export function init() {
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
            // Уменьшаем размер плашек в палитре
            swatch.className = 'w-10 h-10 rounded-md shadow-inner cursor-pointer';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.onclick = () => generateColor(color);
            el.appendChild(swatch);
        });
    };

    const generateColor = (baseHex = null) => {
        const randomColor = baseHex || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        // Обновляем основной цвет
        display.style.backgroundColor = randomColor;
        codeHex.textContent = randomColor;

        // Конвертируем и обновляем RGB/HSL
        const rgb = hexToRgb(randomColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        codeRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        codeHsl.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        
        // Генерируем палитры
        const complementaryH = (hsl.h + 180) % 360;
        const complementaryHex = hslToHex(complementaryH, hsl.s, hsl.l);
        renderPalette(complementaryPaletteEl, [randomColor, complementaryHex]);
        
        const analogousH1 = (hsl.h + 30) % 360;
        const analogousH2 = (hsl.h - 30 + 360) % 360;
        const analogousHex1 = hslToHex(analogousH2, hsl.s, hsl.l);
        const analogousHex2 = hslToHex(analogousH1, hsl.s, hsl.l);
        renderPalette(analogousPaletteEl, [analogousHex1, randomColor, analogousHex2]);
    };

    btn.addEventListener('click', () => generateColor());
    generateColor(); // Initial color
}

export function cleanup() {}
