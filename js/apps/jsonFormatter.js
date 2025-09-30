<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Форматтер (Исправлено)</title>
    <!-- Подключение Tailwind CSS через CDN для простоты демонстрации -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        // Конфигурация для темной темы Tailwind CSS (можно переключать в консоли браузера)
        // Пример: document.documentElement.classList.add('dark');
        tailwind.config = {
            darkMode: 'class',
        }
    </script>
    <style>
        /* Дополнительные стили для плавных переходов и красивого скроллбара */
        body {
            transition: background-color 0.3s, color 0.3s;
        }
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .dark ::-webkit-scrollbar-track {
            background: #2d3748;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">

    <div class="max-w-4xl mx-auto">
        <header class="text-center mb-6">
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">JSON Форматтер и Валидатор</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Вставьте ваш JSON, чтобы отформатировать, минимизировать и проверить его.</p>
        </header>

        <main id="app-container" class="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg">
            <!-- Сюда JavaScript вставит HTML-код приложения -->
        </main>
        
        <footer class="text-center mt-6 text-sm text-gray-500">
            <p>Прокрутка блока "Результат" теперь работает корректно.</p>
        </footer>
    </div>

    <!-- 
      Используем <script type="module">, так как ваш оригинальный код использовал 'export'.
      Весь JavaScript помещен сюда для удобства.
    -->
    <script type="module">
        // --- Начало вашего файла jsonFormatter.js (с исправлением) ---

        let inputArea, outputArea, formatBtn, minifyBtn, copyBtn, clearBtn, statusArea;
        let eventListeners = [];

        // Вспомогательная функция для отслеживания и удаления слушателей
        function addListener(element, event, handler) {
            element.addEventListener(event, handler);
            eventListeners.push({ element, event, handler });
        }

        function getHtml() {
            // HTML-структура вашего приложения
            return `
                <style>
                    /* Горизонтальная прокрутка для поля ввода и вывода */
                    #json-input, #json-output {
                        white-space: pre;
                        overflow-x: auto;
                    }

                    #json-output {
                        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                        background-color: #f8fafc; /* gray-50 */
                        min-height: 200px;
                    }
                    .dark #json-output {
                        background-color: #1e293b; /* slate-800 */
                    }
                    .json-valid {
                        border-color: #22c55e !important; /* green-500 */
                    }
                    .json-invalid {
                        border-color: #ef4444 !important; /* red-500 */
                    }
                </style>
                <div class="space-y-4">
                    <div>
                        <label for="json-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">JSON-ввод:</label>
                        <textarea id="json-input" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Вставьте ваш JSON сюда..."></textarea>
                        <p id="json-status" class="text-sm mt-1 h-5"></p>
                    </div>
                    
                    <div class="flex flex-wrap items-center justify-center gap-3">
                        <button id="format-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Форматировать</button>
                        <button id="minify-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Минифицировать</button>
                        <button id="copy-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50" disabled>Копировать</button>
                        <button id="clear-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Очистить</button>
                    </div>

                    
                    <div class="min-w-0"> 
                         <label for="json-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Результат:</label>
                         <pre id="json-output" class="w-full overflow-x-auto p-3 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-slate-800"></pre>
                    </div>
                </div>
            `;
        }

        function init() {
            // Поиск элементов после их добавления в DOM
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

        function cleanup() {
            // Удаляем все слушатели, добавленные через addListener
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            // Очищаем массив слушателей
            eventListeners = [];
        }

        // --- Код для запуска приложения ---
        // 1. Находим контейнер
        const appContainer = document.getElementById('app-container');
        
        // 2. Вставляем HTML-код приложения в контейнер
        if(appContainer) {
            appContainer.innerHTML = getHtml();
            // 3. Инициализируем приложение (назначаем обработчики событий)
            init();
        } else {
            console.error('Контейнер приложения #app-container не найден!');
        }

    </script>

</body>
</html>
