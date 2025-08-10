export function getHtml() {
    return `
        <div class="flex flex-col items-center gap-4">
            <input type="file" id="image-input" accept="image/*" class="w-full max-w-md p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <div id="image-preview-container" class="hidden w-full max-w-md p-4 border-dashed border-2 rounded-lg text-center">
                <img id="image-preview" class="max-w-full max-h-64 mx-auto"/>
            </div>
            <div id="controls-container" class="hidden flex flex-col sm:flex-row items-center gap-4">
                <select id="format-select" class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                </select>
                <div id="quality-control" class="flex items-center gap-2">
                    <label for="quality-slider">Качество:</label>
                    <input type="range" id="quality-slider" min="10" max="100" value="80" class="w-32">
                    <span id="quality-value">80%</span>
                </div>
                <button id="convert-btn" class="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600">Конвертировать и скачать</button>
            </div>
        </div>
    `;
}

export function init() {
    const imageInput = document.getElementById('image-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const controlsContainer = document.getElementById('controls-container');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const convertBtn = document.getElementById('convert-btn');
    let originalImage = new Image();
    let originalFileName = '';

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        originalFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.src = event.target.result;
            previewImage.src = event.target.result;
            previewContainer.classList.remove('hidden');
            controlsContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    formatSelect.addEventListener('change', () => {
        qualityControl.style.display = formatSelect.value === 'png' ? 'none' : 'flex';
    });
    
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    convertBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);

        const format = formatSelect.value;
        const mimeType = `image/${format}`;
        const quality = parseInt(qualitySlider.value, 10) / 100;

        const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality : undefined);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${originalFileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}```

#### 3. `apps/colorConverter.js`

```javascript
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
            </div>
        </div>
    `;
}

export function init() {
    const preview = document.getElementById('color-preview');
    const picker = document.getElementById('color-picker');
    const hexInput = document.getElementById('hex-input');
    const rgbInput = document.getElementById('rgb-input');
    const hslInput = document.getElementById('hsl-input');

    let isUpdating = false;

    function updateAll(color) {
        if (isUpdating) return;
        isUpdating = true;

        const hex = color.hex;
        const rgb = color.rgb;
        const hsl = color.hsl;

        preview.style.backgroundColor = hex;
        picker.value = hex;
        hexInput.value = hex.toUpperCase();
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslInput.value = `hsl(${hsl.h}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
        
        isUpdating = false;
    }

    picker.addEventListener('input', () => updateAll(hexToRgb(picker.value)));
    hexInput.addEventListener('input', () => updateAll(hexToRgb(hexInput.value)));
    rgbInput.addEventListener('input', () => updateAll(parseRgb(rgbInput.value)));
    hslInput.addEventListener('input', () => updateAll(parseHsl(hslInput.value)));
    
    // Initial color
    updateAll(hexToRgb('#3B82F6'));

    // --- Conversion Functions ---
    function hexToRgb(hex) {
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

    function rgbToAll({r, g, b}) {
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        const hex = "#" + ((1 << 24) + ((r*255)<<16) + ((g*255)<<8) + (b*255)).toString(16).slice(1);
        return { hex, rgb: {r:r*255,g:g*255,b:b*255}, hsl: {h,s,l} };
    }

    function hslToAll({h, s, l}) {
        let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c/2, r=0, g=0, b=0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
        return rgbToAll({r,g,b});
    }
}
