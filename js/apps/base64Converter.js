// 22js/apps/base64Converter.js

let sourceText, resultText, encodeBtn, decodeBtn, copyBtn, clearBtn, errorDiv;
let imageDropZone, imageFileInput, imagePreview, resultContainer, imagePreviewContainer;
let sourceImageText, decodeImageBtn; // Элементы для декодирования на вкладке "Изображение"
let activeTab = 'text';
let eventListeners = [];

/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler, options = false) {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler, options });
}

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <style>
            .base64-tab-btn {
                padding: 8px 16px; cursor: pointer; border-bottom: 3px solid transparent;
                margin-bottom: -1px; transition: all 0.2s ease-in-out;
            }
            .base64-tab-btn.active-tab {
                color: #3b82f6; border-color: #3b82f6; font-weight: 600;
            }
            .dark .base64-tab-btn.active-tab { color: #60a5fa; border-color: #60a5fa; }
            .drop-zone {
                border: 2px dashed #cbd5e1; border-radius: 0.75rem; padding: 2rem;
                text-align: center; cursor: pointer; transition: all 0.2s;
            }
            .dark .drop-zone { border-color: #475569; }
            .drop-zone.dragover { background-color: #dbeafe; border-color: #3b82f6; }
            .dark .drop-zone.dragover { background-color: #1e3a8a; }
        </style>

        <div class="space-y-4 max-w-3xl mx-auto">
            <!-- Вкладки для выбора режима -->
            <div class="flex border-b border-gray-200 dark:border-gray-700">
                <button data-tab="text" class="base64-tab-btn active-tab">Текст ↔ Base64</button>
                <button data-tab="image" class="base64-tab-btn">Изображение ↔ Base64</button>
            </div>

            <!-- Панель для текста -->
            <div id="panel-text" class="space-y-4">
                <div>
                    <label for="base64-source" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Исходные данные (Текст или Base64):</label>
                    <textarea id="base64-source" class="w-full h-32 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div class="flex flex-wrap items-center justify-center gap-3">
                    <button id="base64-encode-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Кодировать</button>
                    <button id="base64-decode-btn" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Декодировать</button>
                </div>
            </div>

            <!-- Панель для изображения -->
            <div id="panel-image" class="hidden space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Кодировать: Из файла в Base64</label>
                    <div id="image-drop-zone" class="drop-zone">
                        <p>Перетащите изображение сюда или нажмите для выбора</p>
                        <input type="file" id="image-file-input" class="hidden" accept="image/*">
                    </div>
                </div>
                
                <div class="flex items-center text-center">
                    <hr class="flex-grow border-t dark:border-gray-600">
                    <span class="px-3 text-sm text-gray-500 dark:text-gray-400">ИЛИ</span>
                    <hr class="flex-grow border-t dark:border-gray-600">
                </div>
        
                <div>
                    <label for="base64-image-source" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Декодировать: Из Base64 (Data URL) в изображение</label>
                    <textarea id="base64-image-source" placeholder="Вставьте сюда строку вида data:image/..." class="w-full h-32 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    <button id="base64-decode-image-btn" class="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Показать изображение</button>
                </div>
            </div>
            
            <!-- Общая область предпросмотра изображения -->
            <div id="image-preview-container" class="hidden text-center">
                 <img id="image-preview" class="max-w-xs max-h-48 mx-auto rounded-lg border-2 p-2 bg-gray-100 dark:bg-gray-700">
            </div>

            <div id="base64-error" class="text-center text-red-500 min-h-[20px]"></div>

            <!-- Общая область для результата -->
            <div id="result-container" class="hidden space-y-2">
                <label for="base64-result" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Результат:</label>
                <textarea id="base64-result" readonly class="w-full h-32 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600"></textarea>
                <div class="flex gap-3">
                    <button id="base64-copy-btn" class="flex-grow bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Копировать</button>
                    <button id="base64-clear-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Очистить</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Инициализация приложения.
 */
export function init() {
    // Общие элементы
    resultContainer = document.getElementById('result-container');
    resultText = document.getElementById('base64-result');
    copyBtn = document.getElementById('base64-copy-btn');
    clearBtn = document.getElementById('base64-clear-btn');
    errorDiv = document.getElementById('base64-error');
    imagePreview = document.getElementById('image-preview');
    imagePreviewContainer = document.getElementById('image-preview-container');
    
    // Элементы для вкладок
    const tabs = document.querySelectorAll('.base64-tab-btn');
    const panelText = document.getElementById('panel-text');
    const panelImage = document.getElementById('panel-image');

    // Элементы для вкладки "Текст"
    sourceText = document.getElementById('base64-source');
    encodeBtn = document.getElementById('base64-encode-btn');
    decodeBtn = document.getElementById('base64-decode-btn');

    // Элементы для вкладки "Изображение"
    imageDropZone = document.getElementById('image-drop-zone');
    imageFileInput = document.getElementById('image-file-input');
    sourceImageText = document.getElementById('base64-image-source');
    decodeImageBtn = document.getElementById('base64-decode-image-btn');

    // --- Функции кодирования/декодирования ---
    const encodeText = () => {
        try {
            const utf8Bytes = new TextEncoder().encode(sourceText.value);
            const base64String = btoa(String.fromCharCode.apply(null, utf8Bytes));
            showResult(base64String);
        } catch (error) { showError('Произошла ошибка при кодировании текста.'); }
    };
    
    const decodeText = () => {
        try {
            const base64String = sourceText.value.trim();
            if (base64String.startsWith('data:image')) {
                 showError('Это Data URL. Используйте вкладку "Изображение ↔ Base64" для декодирования.');
                 return;
            }
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            const decodedText = new TextDecoder().decode(bytes);
            showResult(decodedText);
        } catch (error) { showError('Неверная Base64 строка. Проверьте данные.'); }
    };
    
    const decodeImage = () => {
        try {
            const dataUrl = sourceImageText.value.trim();
            if (!dataUrl.startsWith('data:image')) {
                showError('Входная строка не является Data URL (должна начинаться с "data:image/...").');
                return;
            }
            atob(dataUrl.split(',')[1]); 
            
            showImageResult(dataUrl);
        } catch (e) {
            showError('Неверная Base64 строка в Data URL.');
        }
    };

    const handleImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showError('Пожалуйста, выберите файл изображения.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            showResult(dataUrl); // Показываем текстовый результат
            imagePreview.src = dataUrl;
            imagePreviewContainer.classList.remove('hidden'); // И предпросмотр
        };
        reader.onerror = () => showError('Не удалось прочитать файл.');
        reader.readAsDataURL(file);
    };

    // --- Вспомогательные функции UI ---
    const showError = (message) => {
        errorDiv.textContent = message;
        resultContainer.classList.add('hidden');
        imagePreviewContainer.classList.add('hidden');
    };

    const showResult = (content) => {
        errorDiv.textContent = '';
        resultText.value = content;
        resultContainer.classList.remove('hidden');
        imagePreviewContainer.classList.add('hidden'); // Скрываем предпросмотр, если показываем текст
    };
    
    const showImageResult = (dataUrl) => {
        errorDiv.textContent = '';
        imagePreview.src = dataUrl;
        imagePreviewContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden'); // Скрываем текстовый результат
    };

    const clearAll = () => {
        sourceText.value = '';
        resultText.value = '';
        if (sourceImageText) sourceImageText.value = '';
        errorDiv.textContent = '';
        imageFileInput.value = '';
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
    };
    
    const copyResult = () => {
        if (!resultText.value) return;
        navigator.clipboard.writeText(resultText.value).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
    };

    // --- Назначение обработчиков ---
    addListener(encodeBtn, 'click', encodeText);
    addListener(decodeBtn, 'click', decodeText);
    addListener(copyBtn, 'click', copyResult);
    addListener(clearBtn, 'click', clearAll);

    // Обработчики для вкладки "Изображение"
    addListener(decodeImageBtn, 'click', decodeImage);
    addListener(imageDropZone, 'click', () => imageFileInput.click());
    addListener(imageFileInput, 'change', (e) => handleImageFile(e.target.files[0]));
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        addListener(imageDropZone, eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (eventName === 'dragover') imageDropZone.classList.add('dragover');
            else imageDropZone.classList.remove('dragover');
            
            if (eventName === 'drop') {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });
    });

    // Обработчик переключения вкладок
    tabs.forEach(tab => {
        addListener(tab, 'click', () => {
            activeTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');
            
            panelText.classList.toggle('hidden', activeTab !== 'text');
            panelImage.classList.toggle('hidden', activeTab !== 'image');
            clearAll(); // Очищаем всё при смене режима
        });
    });
}

/**
 * Очистка ресурсов при закрытии приложения.
 */
export function cleanup() {
    eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
    });
    eventListeners = [];
}
