export function getHtml() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="flex justify-center">
                <div id="color-preview" class="w-48 h-48 rounded-full border-4 border-gray-200 dark:border-gray-600" style="background-color: #3B82F6;"></div>
            </div>
            <div class="flex flex-col gap-4">
                 <div class="relative">
                    <input type="color" id="color-picker" value="#3B82F6" class="absolute w-full h-full opacity-0 cursor-pointer">
                    <div class="p-3 text-center border rounded-lg">Выберите цвет</div>
                 </div>
                <div>
                    <label for="hex-input" class="block text-sm font-medium">HEX</label>
                    <input type="text" id="hex-input" class="w-full p-2 mt-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                </div>
                <div>
                    <label for="rgb-input" class="block text-sm font-medium">RGB</label>
                    <input type="text" id="rgb-input" class="w-full p-2 mt-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                </div>
                <div>
                    <label for="hsl-input" class="block text-sm font-medium">HSL</label>
                    <input type="text" id="hsl-input" class="w-full p-2 mt-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                </div>
                 <div>
                    <label for="hsv-input" class="block text-sm font-medium">HSV</label>
                    <input type="text" id="hsv-input" class="w-full p-2 mt-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                </div>
                <div>
                    <label for="cmyk-input" class="block text-sm font-medium">CMYK</label>
                    <input type="text" id="cmyk-input" class="w-full p-2 mt-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                </div>
            </div>
        </div>
        <!-- Разделитель -->
        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>
        <!-- Новая секция для извлечения палитры -->
        <div class="space-y-4">
            <h3 class="text-xl font-semibold text-center">Извлечь палитру из изображения</h3>
            <div>
                <input type="file" id="image-palette-input" class="hidden" accept="image/png, image/jpeg">
                <label for="image-palette-input" class="inline-block w-full text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение
                </label>
            </div>
            <div id="palette-container" class="flex flex-wrap justify-center gap-3 min-h-[50px]">
                 <p id="palette-placeholder" class="text-gray-500 dark:text-gray-400">Палитра появится здесь...</p>
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
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3];
        } else if (hex.length === 7) {
            r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6];
        }
        r = +r; g = +g; b = +b;
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
    
    // --- НОВЫЙ КОД: Логика для извлечения палитры ---
    
    imagePaletteInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                palettePlaceholder.textContent = 'Анализ цветов...';
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
        const ctx = canvas.getContext('2d');
        const width = canvas.width = img.width;
        const height = canvas.height = img.height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const colorMap = {};
        const colorStep = 40; 

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
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        });

        return palette;
    }

    function renderPalette(palette) {
        paletteContainer.innerHTML = '';
        if (palette.length === 0) {
            paletteContainer.appendChild(palettePlaceholder);
            palettePlaceholder.textContent = 'Не удалось извлечь цвета.';
            return;
        }

        palette.forEach(colorHex => {
            const swatch = document.createElement('div');
            swatch.className = 'w-12 h-12 rounded-lg shadow-inner cursor-pointer border-2 border-white dark:border-gray-500';
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
