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
