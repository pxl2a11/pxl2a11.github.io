// js/apps/barcodeGenerator.js

export function getHtml() {
    return `
        <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-4">Генератор штрих-кодов</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="barcode-data" class="block text-sm font-medium mb-1">Данные для кодирования:</label>
                    <input type="text" id="barcode-data" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="Введите текст или цифры">
                </div>
                <div>
                    <label for="barcode-format" class="block text-sm font-medium mb-1">Формат штрих-кода:</label>
                    <select id="barcode-format" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="CODE128" selected>CODE128</option>
                        <option value="CODE39">CODE39</option>
                        <option value="EAN13">EAN-13</option>
                        <option value="UPC">UPC-A</option>
                        <option value="ITF14">ITF-14</option>
                        <option value="MSI">MSI</option>
                    </select>
                </div>
            </div>

            <div id="barcode-container" class="p-4 bg-white rounded-md flex justify-center items-center min-h-[150px]">
                <svg id="barcode"></svg>
            </div>
            <div id="barcode-error" class="text-red-500 text-center mt-2"></div>
            
            <div class="mt-4 flex gap-4">
                 <button id="generate-barcode-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Сгенерировать</button>
                 <button id="download-barcode-btn" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled>Скачать SVG</button>
            </div>
        </div>
    `;
}

export function init() {
    const dataInput = document.getElementById('barcode-data');
    const formatSelect = document.getElementById('barcode-format');
    const generateBtn = document.getElementById('generate-barcode-btn');
    const downloadBtn = document.getElementById('download-barcode-btn');
    const errorDiv = document.getElementById('barcode-error');

    // ИЗМЕНЕНИЕ: Улучшенная проверка и вывод ошибки
    if (typeof JsBarcode === 'undefined') {
        const errorMsg = 'Ошибка: Библиотека JsBarcode не загружена.';
        errorDiv.textContent = errorMsg;
        console.error(errorMsg);
        console.log("ПОДСКАЗКА: 1. Убедитесь, что файл 'JsBarcode.all.min.js' находится в папке 'js'. 2. Проверьте, что в index.html есть строка: <script src='js/JsBarcode.all.min.js' defer></script> 3. Запускайте проект через локальный сервер (например, Live Server в VS Code).");
        generateBtn.disabled = true;
        return;
    }
    
    const generateBarcode = () => {
        const data = dataInput.value;
        const format = formatSelect.value;
        errorDiv.textContent = '';
        downloadBtn.disabled = true;

        if (!data) {
            errorDiv.textContent = 'Пожалуйста, введите данные для кодирования.';
            return;
        }

        try {
            JsBarcode("#barcode", data, {
                format: format,
                lineColor: document.documentElement.classList.contains('dark') ? "#FFFFFF" : "#000000",
                width: 2,
                height: 100,
                displayValue: true,
                fontOptions: "bold",
                font: "monospace",
                fontSize: 18,
                textColor: document.documentElement.classList.contains('dark') ? "#FFFFFF" : "#000000"
            });
            downloadBtn.disabled = false;
        } catch (e) {
            console.error(e);
            document.getElementById('barcode').innerHTML = ''; // Очищаем SVG
            errorDiv.textContent = `Ошибка: ${e.message.replace("Error: ", "")}. Проверьте данные для выбранного формата.`;
        }
    };
    
    const downloadBarcode = () => {
        const svg = document.getElementById('barcode');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);

        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `barcode-${dataInput.value}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    generateBtn.addEventListener('click', generateBarcode);
    downloadBtn.addEventListener('click', downloadBarcode);
    dataInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generateBarcode();
    });
}
