// js/apps/barcodeGenerator.js

/**
 * Возвращает HTML-структуру для приложения "Генератор штрих-кодов".
 * @returns {string} HTML-разметка.
 */
function getHtml() {
    return `
        <div class="space-y-6">
            <!-- Поле для ввода данных -->
            <div>
                <label for="barcode-data" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Данные для кодирования</label>
                <input type="text" id="barcode-data" class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите текст или цифры">
            </div>

            <!-- Выбор формата и основные опции -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="barcode-format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Формат штрих-кода</label>
                    <select id="barcode-format" class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="CODE128" selected>CODE128</option>
                        <option value="EAN13">EAN-13</option>
                        <option value="UPC">UPC</option>
                        <option value="CODE39">CODE39</option>
                        <option value="ITF">ITF</option>
                        <option value="MSI">MSI</option>
                    </select>
                    <p id="format-hint" class="text-xs text-gray-500 dark:text-gray-400 mt-1 h-4"></p>
                </div>
                 <div>
                    <label for="barcode-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ширина полоски (px)</label>
                    <input type="number" id="barcode-width" value="2" min="1" max="5" class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>

            <!-- Дополнительные опции -->
            <div class="space-y-3">
                 <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Опции отображения</h3>
                 <div class="flex items-center">
                    <input type="checkbox" id="barcode-display-value" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <label for="barcode-display-value" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Показывать текст под кодом</label>
                </div>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label for="barcode-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Высота (px)</label>
                         <input type="number" id="barcode-height" value="100" min="10" max="300" class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label for="barcode-margin" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Отступы (px)</label>
                        <input type="number" id="barcode-margin" value="10" min="0" max="50" class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
            </div>

            <!-- Кнопка генерации -->
            <button id="generate-barcode-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out">Сгенерировать</button>

            <!-- Контейнер для результата -->
            <div id="barcode-result-container" class="hidden text-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                 <p id="barcode-error" class="text-red-500 mb-4 hidden"></p>
                 <div id="barcode-wrapper" class="flex justify-center items-center">
                    <svg id="barcode-svg"></svg>
                 </div>
                 <button id="download-barcode-btn" class="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out">Скачать PNG</button>
            </div>
        </div>
    `;
}

/**
 * Инициализирует логику приложения после загрузки HTML.
 */
function init() {
    const dataInput = document.getElementById('barcode-data');
    const formatSelect = document.getElementById('barcode-format');
    const widthInput = document.getElementById('barcode-width');
    const heightInput = document.getElementById('barcode-height');
    const marginInput = document.getElementById('barcode-margin');
    const displayValueCheckbox = document.getElementById('barcode-display-value');
    const generateBtn = document.getElementById('generate-barcode-btn');
    const resultContainer = document.getElementById('barcode-result-container');
    const errorContainer = document.getElementById('barcode-error');
    const barcodeSvg = document.getElementById('barcode-svg');
    const downloadBtn = document.getElementById('download-barcode-btn');
    const formatHint = document.getElementById('format-hint');
    
    const formatHints = {
        EAN13: 'EAN-13 требует 12 цифр (13-я - контрольная сумма).',
        UPC: 'UPC требует 11 цифр (12-я - контрольная сумма).',
        ITF: 'ITF требует четное количество цифр.',
        DEFAULT: ''
    };

    const updateHint = () => {
        formatHint.textContent = formatHints[formatSelect.value] || formatHints.DEFAULT;
    };

    const generateBarcode = () => {
        const data = dataInput.value;
        const format = formatSelect.value;
        
        resultContainer.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        barcodeSvg.style.display = 'block';

        if (!data) {
            errorContainer.textContent = 'Пожалуйста, введите данные для генерации штрих-кода.';
            errorContainer.classList.remove('hidden');
            barcodeSvg.style.display = 'none';
            return;
        }

        try {
            JsBarcode(barcodeSvg, data, {
                format: format,
                width: parseInt(widthInput.value, 10),
                height: parseInt(heightInput.value, 10),
                displayValue: displayValueCheckbox.checked,
                margin: parseInt(marginInput.value, 10),
                fontOptions: "bold",
            });
             // Проверяем, была ли ошибка, переданная через опции
             if (barcodeSvg.getAttribute('jsbarcode-valid') === 'false') {
                throw new Error(barcodeSvg.getAttribute('jsbarcode-error'));
            }
        } catch (e) {
            const errorMessage = e.message.includes('Invalid') ? `Данные не соответствуют формату ${format}. ${formatHint.textContent}` : 'Произошла ошибка при генерации кода.';
            errorContainer.textContent = errorMessage;
            errorContainer.classList.remove('hidden');
            barcodeSvg.style.display = 'none';
        }
    };

    const downloadBarcode = () => {
        const svgElement = document.getElementById('barcode-svg');
        if (!svgElement) return;

        // Сериализуем SVG в строку
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        
        // Создаем Blob из SVG
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            // Создаем canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Заливаем фон белым цветом (для прозрачности в PNG)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем изображение на canvas
            ctx.drawImage(img, 0, 0);
            
            // Создаем ссылку для скачивания
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `barcode-${dataInput.value || 'code'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            console.error("Не удалось загрузить SVG для конвертации в PNG.");
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };
    
    generateBtn.addEventListener('click', generateBarcode);
    downloadBtn.addEventListener('click', downloadBarcode);
    formatSelect.addEventListener('change', updateHint);

    // Показываем подсказку при инициализации
    updateHint();
}

export { getHtml, init };
