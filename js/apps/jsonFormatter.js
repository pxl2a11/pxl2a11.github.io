// js/apps/jsonFormatter.js

let inputArea, outputArea, formatBtn, minifyBtn, copyBtn, clearBtn, statusArea;
let eventListeners = [];

// Вспомогательная функция для отслеживания и удаления слушателей
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

export function getHtml() {
    return `
        <style>
            #json-output {
                white-space: pre;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                background-color: #f8fafc; /* gray-50 */
                min-height: 200px;
                overflow-x: auto;
            }
            .dark #json-output {
                background-color: #1e293b; /* slate-800 */
            }
            .json-valid {
                border-color: #22c55e; /* green-500 */
            }
            .json-invalid {
                border-color: #ef4444; /* red-500 */
            }
        </style>
        <div class="space-y-4">
            <div>
                <label for="json-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">JSON-ввод:</label>
                <textarea id="json-input" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Вставьте ваш JSON сюда..."></textarea>
                <p id="json-status" class="text-sm mt-1 h-5"></p>
            </div>
            
            <div class="flex flex-wrap items-center justify-center gap-3">
                <button id="format-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors\">Форматировать</button>
                <button id="minify-btn" class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors\">Минифицировать</button>
                <button id="copy-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50" disabled>Копировать</button>
                <button id="clear-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors\">Очистить</button>
            </div>

            <div>
                 <label for="json-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Результат:</label>
                 <pre id="json-output" class="w-full p-3 border rounded-lg dark:border-gray-600"></pre>
            </div>
        </div>
    `;
}

export function init() {
    inputArea = document.getElementById('json-input');
    outputArea = document.getElementById('json-output');
    formatBtn = document.getElementById('format-btn');
    minifyBtn = document.getElementById('minify-btn');
    copyBtn = document.getElementById('copy-btn');
    clearBtn = document.getElementById('clear-btn');
    statusArea = document.getElementById('json-status');

    // --- Функции-обработчики ---

    const validateJson = () => {
        const text = inputArea.value.trim();
        if (!text) {
            statusArea.textContent = '';
            inputArea.classList.remove('json-valid', 'json-invalid');
            return;
        }

        try {
            JSON.parse(text);
            statusArea.textContent = '✓ Валидный JSON';
            statusArea.className = 'text-sm mt-1 h-5 text-green-600 dark:text-green-400';
            inputArea.classList.add('json-valid');
            inputArea.classList.remove('json-invalid');
        } catch (e) {
            statusArea.textContent = `✗ Ошибка: ${e.message}`;
            statusArea.className = 'text-sm mt-1 h-5 text-red-600 dark:text-red-400';
            inputArea.classList.add('json-invalid');
            inputArea.classList.remove('json-valid');
        }
    };

    const processJson = (mode) => {
        const text = inputArea.value.trim();
        if (!text) {
            outputArea.textContent = '';
            copyBtn.disabled = true;
            return;
        }
        
        try {
            const jsonObj = JSON.parse(text);
            if (mode === 'format') {
                outputArea.textContent = JSON.stringify(jsonObj, null, 2);
            } else { // minify
                outputArea.textContent = JSON.stringify(jsonObj);
            }
            copyBtn.disabled = false;
        } catch (e) {
            outputArea.textContent = `Ошибка валидации JSON:\n${e.message}`;
            copyBtn.disabled = true;
        }
    };
    
    const copyOutput = () => {
        if (!outputArea.textContent || copyBtn.disabled) return;
        
        navigator.clipboard.writeText(outputArea.textContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Не удалось скопировать текст:', err);
        });
    };

    const clearAll = () => {
        inputArea.value = '';
        outputArea.textContent = '';
        statusArea.textContent = '';
        inputArea.classList.remove('json-valid', 'json-invalid');
        copyBtn.disabled = true;
    };

    // --- Назначение слушателей событий ---

    addListener(inputArea, 'input', validateJson);
    addListener(formatBtn, 'click', () => processJson('format'));
    addListener(minifyBtn, 'click', () => processJson('minify'));
    addListener(copyBtn, 'click', copyOutput);
    addListener(clearBtn, 'click', clearAll);
}

export function cleanup() {
    // Удаляем все слушатели, добавленные через addListener
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    // Очищаем массив слушателей
    eventListeners = [];
}
