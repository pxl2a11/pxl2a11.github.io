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

            <div>
                 <label for="json-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Результат:</label>
                 <pre id="json-output" class="w-full p-3 border rounded-lg dark:border-gray-600"></pre>
            </div>
        </div>
    `;
}
