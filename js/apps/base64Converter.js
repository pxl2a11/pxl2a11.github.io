// js/apps/base64Converter.js

// Переменные для хранения ссылок на DOM-элементы и обработчики
let sourceText, resultText, encodeBtn, decodeBtn, copyBtn, clearBtn, errorDiv;
let eventListeners = [];

/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <div class="space-y-4 max-w-2xl mx-auto">
            <!-- Поле для исходного текста -->
            <div>
                <label for="base64-source" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Исходные данные:</label>
                <textarea id="base64-source" class="w-full h-36 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите текст или Base64 строку..."></textarea>
            </div>

            <!-- Панель с кнопками управления -->
            <div class="flex flex-wrap items-center justify-center gap-3">
                <button id="base64-encode-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Кодировать в Base64</button>
                <button id="base64-decode-btn" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Декодировать из Base64</button>
            </div>
            
            <!-- Сообщение об ошибке -->
            <div id="base64-error" class="text-center text-red-500 min-h-[20px]"></div>

            <!-- Поле для результата -->
            <div>
                <label for="base64-result" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Результат:</label>
                <textarea id="base64-result" readonly class="w-full h-36 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600"></textarea>
            </div>

            <!-- Кнопки для работы с результатом -->
            <div class="flex gap-3">
                 <button id="base64-copy-btn" class="flex-grow bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Копировать</button>
                 <button id="base64-clear-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Очистить всё</button>
            </div>
        </div>
    `;
}

/**
 * Инициализация приложения: получение элементов и назначение обработчиков.
 */
export function init() {
    sourceText = document.getElementById('base64-source');
    resultText = document.getElementById('base64-result');
    encodeBtn = document.getElementById('base64-encode-btn');
    decodeBtn = document.getElementById('base64-decode-btn');
    copyBtn = document.getElementById('base64-copy-btn');
    clearBtn = document.getElementById('base64-clear-btn');
    errorDiv = document.getElementById('base64-error');

    // --- Функции кодирования/декодирования ---

    // Кодирование в Base64 с поддержкой UTF-8 (включая кириллицу)
    const encode = () => {
        errorDiv.textContent = '';
        try {
            const text = sourceText.value;
            // Преобразуем строку UTF-16 в UTF-8, а затем в Base64
            const utf8Bytes = new TextEncoder().encode(text);
            const base64String = btoa(String.fromCharCode.apply(null, utf8Bytes));
            resultText.value = base64String;
        } catch (error) {
            console.error("Ошибка кодирования:", error);
            errorDiv.textContent = 'Произошла ошибка при кодировании.';
        }
    };
    
    // Декодирование из Base64 с поддержкой UTF-8
    const decode = () => {
        errorDiv.textContent = '';
        try {
            const base64String = sourceText.value.trim();
            // Преобразуем Base64 в байты, а затем декодируем как UTF-8
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decodedText = new TextDecoder().decode(bytes);
            resultText.value = decodedText;
        } catch (error) {
            console.error("Ошибка декодирования:", error);
            errorDiv.textContent = 'Неверная Base64 строка. Проверьте входные данные.';
        }
    };
    
    // --- Вспомогательные функции ---

    const copyResult = () => {
        if (!resultText.value) return;
        navigator.clipboard.writeText(resultText.value).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
    };

    const clearAll = () => {
        sourceText.value = '';
        resultText.value = '';
        errorDiv.textContent = '';
    };

    // --- Назначение обработчиков ---
    addListener(encodeBtn, 'click', encode);
    addListener(decodeBtn, 'click', decode);
    addListener(copyBtn, 'click', copyResult);
    addListener(clearBtn, 'click', clearAll);
}

/**
 * Очистка ресурсов при закрытии приложения.
 */
export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
