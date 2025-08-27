// js/modules/barcodeGenerator.js

/**
 * ВАЖНО: Этот код будет работать, только если библиотека JsBarcode
 * была успешно загружена в index.html (локально или через CDN).
 */

/**
 * Инициализирует мини-приложение "Генератор штрих-кодов".
 * @param {HTMLElement} container - DOM-элемент, в который будет встроено приложение.
 */
export function initBarcodeGenerator(container) {
    const appHTML = `
        <div class="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Генератор штрих-кодов</h2>

            <div class="w-full space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div>
                    <label for="barcode-data" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Данные для кодирования:</label>
                    <input type="text" id="barcode-data" placeholder="Введите текст или цифры" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                    <label for="barcode-type" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Формат штрих-кода:</label>
                    <select id="barcode-type" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="CODE128" selected>CODE128</option>
                        <option value="EAN13">EAN-13 (12 цифр)</option>
                        <option value="UPC">UPC-A (11 цифр)</option>
                        <option value="CODE39">CODE39</option>
                        <option value="ITF">ITF-14</option>
                        <option value="MSI">MSI</option>
                    </select>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 mt-4">
                    <button id="generate-btn" class="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors">Сгенерировать</button>
                    <button id="download-btn" class="w-full px-5 py-3 text-base font-medium text-center text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-700 transition-colors" disabled>Скачать PNG</button>
                </div>
                 <p id="error-message" class="text-sm text-red-500 mt-2 text-center h-4"></p>
            </div>

            <div id="barcode-container" class="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex justify-center items-center min-h-[150px]">
                <svg id="barcode-svg"></svg>
            </div>
        </div>
    `;

    container.innerHTML = appHTML;

    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const dataInput = document.getElementById('barcode-data');
    const typeSelect = document.getElementById('barcode-type');
    const barcodeSvg = document.getElementById('barcode-svg');
    const errorMessage = document.getElementById('error-message');

    const generateBarcode = () => {
        const data = dataInput.value;
        const format = typeSelect.value;
        errorMessage.textContent = '';
        
        if (!data.trim()) {
            errorMessage.textContent = 'Поле данных не может быть пустым.';
            downloadBtn.disabled = true;
            barcodeSvg.innerHTML = '';
            return;
        }

        try {
            const isDark = document.documentElement.classList.contains('dark');
            JsBarcode(barcodeSvg, data, {
                format: format,
                lineColor: isDark ? "#FFFFFF" : "#000000",
                width: 2,
                height: 80,
                displayValue: true,
                fontOptions: "bold",
                fontColor: isDark ? "#FFFFFF" : "#000000",
                background: "transparent",
                margin: 10
            });
            downloadBtn.disabled = false;
        } catch (e) {
            console.error(e);
            barcodeSvg.innerHTML = '';
            downloadBtn.disabled = true;
            errorMessage.textContent = 'Ошибка: Неверные данные для выбранного формата.';
        }
    };

    const downloadBarcode = () => {
        if (!barcodeSvg.innerHTML) return;

        const svgString = new XMLSerializer().serializeToString(barcodeSvg);
        const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }));

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const bbox = barcodeSvg.getBBox();
            canvas.width = bbox.width + 20; // +20 for margin
            canvas.height = bbox.height + 20; // +20 for margin
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 10, 10); // draw with 10px margin

            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `barcode-${dataInput.value || 'generated'}.png`;
            a.click();
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };
    
    generateBtn.addEventListener('click', generateBarcode);
    downloadBtn.addEventListener('click', downloadBarcode);
    
    // Перерисовываем штрих-код при смене темы
    new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (barcodeSvg.innerHTML) { // Перерисовать, только если штрих-код уже сгенерирован
                    generateBarcode();
                }
            }
        }
    }).observe(document.documentElement, { attributes: true });
}
