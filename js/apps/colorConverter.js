export function getHtml() {
    return `
        <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                <!-- Левая колонка: Предпросмотр и Палитра -->
                <div class="lg:col-span-2 flex flex-col items-center space-y-8">
                    <div id="color-preview" class="w-56 h-56 rounded-full shadow-lg transition-colors duration-300" style="background-color: #3B82F6;"></div>
                    
                    <div class="w-full text-center">
                         <div class="relative inline-block w-full group">
                            <input type="color" id="color-picker" value="#3B82F6" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                            <div class="bg-blue-600 text-white group-hover:bg-blue-700 font-bold py-3 px-6 rounded-full transition-transform transform group-hover:scale-105 shadow-md w-full">
                                Выбрать цвет
                            </div>
                        </div>
                    </div>

                    <!-- Разделитель -->
                    <div class="w-full border-t border-gray-200 dark:border-gray-700 my-4 lg:hidden"></div>

                    <!-- Секция извлечения палитры -->
                    <div class="w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-4 text-center">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Извлечь палитру</h3>
                        <input type="file" id="image-palette-input" class="hidden" accept="image/png, image/jpeg">
                        <label for="image-palette-input" class="group flex flex-col justify-center items-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg class="w-10 h-10 mb-2 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H12a4 4 0 014 4v1m-6 4h6m-3-3v6"></path></svg>
                            <p id="palette-placeholder" class="text-sm text-gray-500 dark:text-gray-400">Перетащите или <span class="font-semibold text-blue-600">выберите изображение</span></p>
                        </label>
                        <div id="palette-container" class="flex flex-wrap justify-center gap-4 pt-4 min-h-[48px]">
                            <!-- Палитра появится здесь -->
                        </div>
                    </div>
                </div>

                <!-- Правая колонка: Поля ввода -->
                <div class="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                    <div class="space-y-5">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Цветовые модели</h3>
                        <!-- HEX -->
                        <div class="relative">
                            <label for="hex-input" class="absolute -top-2 left-2 inline-block bg-white dark:bg-gray-800 px-1 text-xs font-medium text-gray-900 dark:text-gray-300">HEX</label>
                            <input type="text" id="hex-input" class="w-full p-3 pl-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700">
                        </div>
                        <!-- RGB -->
                        <div class="relative">
                            <label for="rgb-input" class="absolute -top-2 left-2 inline-block bg-white dark:bg-gray-800 px-1 text-xs font-medium text-gray-900 dark:text-gray-300">RGB</label>
                            <input type="text" id="rgb-input" class="w-full p-3 pl-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700">
                        </div>
                        <!-- HSL -->
                        <div class="relative">
                            <label for="hsl-input" class="absolute -top-2 left-2 inline-block bg-white dark:bg-gray-800 px-1 text-xs font-medium text-gray-900 dark:text-gray-300">HSL</label>
                            <input type="text" id="hsl-input" class="w-full p-3 pl-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700">
                        </div>
                        <!-- HSV -->
                        <div class="relative">
                            <label for="hsv-input" class="absolute -top-2 left-2 inline-block bg-white dark:bg-gray-800 px-1 text-xs font-medium text-gray-900 dark:text-gray-300">HSV</label>
                            <input type="text" id="hsv-input" class="w-full p-3 pl-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700">
                        </div>
                        <!-- CMYK -->
                        <div class="relative">
                            <label for="cmyk-input" class="absolute -top-2 left-2 inline-block bg-white dark:bg-gray-800 px-1 text-xs font-medium text-gray-900 dark:text-gray-300">CMYK</label>
                            <input type="text" id="cmyk-input" class="w-full p-3 pl-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export function init() {
    // Получаем все элементы DOM
    const preview = document.getElementById('color-preview');
    const picker = document.getElementById('color-picker');
    const hexInput = document.getElementById('hex-input');
    const rgbInput = document.getElementById('rgb-input');
    const hslInput = document.getElementById('hsl-input');
    const hsvInput = document.getElementById('hsv-input');
    const cmykInput = document.getElementById('cmyk-input');
    // Новые элементы для палитры
    const imagePaletteInput = document.getElementById('image-palette-input');
    const paletteContainer = document.getElementById('palette-container');
    const palettePlaceholder = document.getElementById('palette-placeholder');

    let isUpdating = false;

    // Главная функция обновления всех полей
    function updateAll(colorData) {
        if (isUpdating || !colorData) return;
        isUpdating = true;

        const { hex, rgb, hsl, hsv, cmyk } = colorData;

        preview.style.backgroundColor = hex;
        picker.value = hex;
        hexInput.value = hex.toUpperCase();
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslInput.value = `hsl(${hsl.h}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
        hsvInput.value = `hsv(${hsv.h}, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`;
        cmykInput.value = `cmyk(${Math.round(cmyk.c * 100)}%, ${Math.round(cmyk.m * 100)}%, ${Math.round(cmyk.y * 100)}%, ${Math.round(cmyk.k * 100)}%)`;
        
        isUpdating = false;
    }

    // Добавляем слушатели событий
    picker.addEventListener('input', () => updateAll(hexToAll(picker.value)));
    hexInput.addEventListener('input', () => updateAll(hexToAll(hexInput.value)));
    rgbInput.addEventListener('input', () => updateAll(parseRgb(rgbInput.value)));
    hslInput.addEventListener('input', () => updateAll(parseHsl(hslInput.value)));
    hsvInput.addEventListener('input', () => updateAll(parseHsv(hsvInput.value)));
    cmykInput.addEventListener('input', () => updateAll(parseCmyk(cmykInput.value)));
    
    // Начальный цвет
    updateAll(hexToAll('#3B82F6'));

    // --- Функции парсинга входных данных ---
    function hexToAll(hex) {
        if (!hex || typeof hex !== 'string') return;
        hex = hex.trim();
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) return;


        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        return rgbToAll({r, g, b});
    }
    
    function parseRgb(rgbStr) {
        const [r, g, b] = (rgbStr.match(/\d+/g) || [0,0,0]).map(Number);
        return rgbToAll({r,g,b});
    }

    function parseHsl(hslStr) {
        const [h, s, l] = (hslStr.match(/\d+(\.\d+)?/g) || [0,0,0]).map(Number);
        return hslToAll({h, s: s/100, l: l/100});
    }

    function parseHsv(hsvStr) {
        const [h, s, v] = (hsvStr.match(/\d+(\.\d+)?/g) || [0,0,0]).map(Number);
        return hsvToAll({h, s: s/100, v: v/100});
    }

    function parseCmyk(cmykStr) {
        const [c, m, y, k] = (cmykStr.match(/\d+(\.\d+)?/g) || [0,0,0,0]).map(Number);
        return cmykToAll({c: c/100, m: m/100, y: y/100, k: k/100});
    }

    // --- Функции конвертации ---

    function rgbToAll({r, g, b}) {
        // Нормализация RGB
        let r_norm = r / 255, g_norm = g / 255, b_norm = b / 255;
        let cmin = Math.min(r_norm,g_norm,b_norm), cmax = Math.max(r_norm,g_norm,b_norm), delta = cmax - cmin;
        
        // HEX
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

        // HSL
        let h_hsl = 0, s_hsl = 0, l_hsl = 0;
        if (delta === 0) h_hsl = 0;
        else if (cmax === r_norm) h_hsl = ((g_norm - b_norm) / delta) % 6;
        else if (cmax === g_norm) h_hsl = (b_norm - r_norm) / delta + 2;
        else h_hsl = (r_norm - g_norm) / delta + 4;
        h_hsl = Math.round(h_hsl * 60);
        if (h_hsl < 0) h_hsl += 360;
        l_hsl = (cmax + cmin) / 2;
        s_hsl = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l_hsl - 1));

        // HSV
        let h_hsv = h_hsl, s_hsv = 0, v_hsv = cmax;
        s_hsv = cmax === 0 ? 0 : delta / cmax;

        // CMYK
        let c = 0, m = 0, y = 0, k = 1 - cmax;
        if (k < 1) {
            c = (1 - r_norm - k) / (1 - k);
            m = (1 - g_norm - k) / (1 - k);
            y = (1 - b_norm - k) / (1 - k);
        }

        return { 
            hex, 
            rgb: { r, g, b }, 
            hsl: { h: h_hsl, s: s_hsl, l: l_hsl },
            hsv: { h: h_hsv, s: s_hsv, v: v_hsv },
            cmyk: { c, m, y, k }
        };
    }

    function hslToAll({h, s, l}) {
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return rgbToAll({r,g,b});
    }

    function hsvToAll({h, s, v}) {
        let c = v * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = v - c,
            r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return rgbToAll({r, g, b});
    }

    function cmykToAll({c, m, y, k}) {
        let r = 255 * (1 - c) * (1 - k);
        let g = 255 * (1 - m) * (1 - k);
        let b = 255 * (1 - y) * (1 - k);
        return rgbToAll({r: Math.round(r), g: Math.round(g), b: Math.round(b)});
    }
    
    // --- Логика для извлечения палитры ---
    
    imagePaletteInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                palettePlaceholder.textContent = 'Анализ цветов...';
                paletteContainer.innerHTML = ''; // Очищаем контейнер перед анализом
                const placeholderWrapper = document.createElement('div');
                placeholderWrapper.className = 'flex justify-center items-center w-full';
                placeholderWrapper.appendChild(palettePlaceholder);
                paletteContainer.appendChild(placeholderWrapper);

                setTimeout(() => {
                    const palette = extractPalette(img);
                    renderPalette(palette);
                }, 50);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractPalette(img, colorCount = 6) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Масштабируем изображение для производительности
        const MAX_WIDTH = 100;
        const MAX_HEIGHT = 100;
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const colorMap = {};
        const colorStep = 32; 

        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i + 3] < 128) continue; 
            
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            const rKey = Math.round(r / colorStep) * colorStep;
            const gKey = Math.round(g / colorStep) * colorStep;
            const bKey = Math.round(b / colorStep) * colorStep;
            const key = `${rKey},${gKey},${bKey}`;

            if (!colorMap[key]) {
                colorMap[key] = { count: 0, r: 0, g: 0, b: 0 };
            }
            colorMap[key].count++;
            colorMap[key].r += r;
            colorMap[key].g += g;
            colorMap[key].b += b;
        }

        const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);

        const palette = sortedColors.slice(0, colorCount).map(colorData => {
            const r = Math.round(colorData.r / colorData.count);
            const g = Math.round(colorData.g / colorData.count);
            const b = Math.round(colorData.b / colorData.count);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        });

        return palette;
    }

    function renderPalette(palette) {
        paletteContainer.innerHTML = '';
        if (palette.length === 0) {
            const originalPlaceholder = document.createElement('p');
            originalPlaceholder.id = 'palette-placeholder';
            originalPlaceholder.className = 'text-sm text-gray-500 dark:text-gray-400';
            originalPlaceholder.textContent = 'Не удалось извлечь цвета.';
            paletteContainer.appendChild(originalPlaceholder);
            return;
        }

        palette.forEach(colorHex => {
            const swatch = document.createElement('div');
            swatch.className = 'w-10 h-10 rounded-full cursor-pointer shadow-md transform hover:scale-110 transition-transform border-2 border-white dark:border-gray-600';
            swatch.style.backgroundColor = colorHex;
            swatch.title = `Нажмите, чтобы выбрать ${colorHex}`;
            swatch.addEventListener('click', () => {
                updateAll(hexToAll(colorHex));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paletteContainer.appendChild(swatch);
        });
    }
}
