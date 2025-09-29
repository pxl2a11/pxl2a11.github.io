//24 js/apps/textDiffTool.js

export function getHtml() {
    return `
        <style>
            .diff-output { 
                white-space: pre-wrap; 
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; 
                line-height: 1.7; 
                tab-size: 4;
            }
            .diff-output ins, .diff-output del {
                padding: 2px 4px;
                border-radius: 4px;
                text-decoration: none;
            }
            /* Light Theme */
            .diff-output ins { background-color: rgba(46, 160, 67, 0.15); color: #1f7c32; }
            .diff-output del { background-color: rgba(248, 81, 73, 0.1); color: #c93c37; }
            
            /* Dark Theme */
            .dark .diff-output ins { background-color: rgba(45, 154, 67, 0.2); color: #57ab5a; }
            .dark .diff-output del { background-color: rgba(222, 75, 75, 0.2); color: #e57878; }
        </style>
        
        <div class="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
            <div class="max-w-7xl mx-auto">
                
                <header class="mb-6">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Инструмент сравнения текстов</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">Вставьте два текста ниже, чтобы увидеть различия между ними.</p>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="font-semibold text-gray-700 dark:text-gray-200">Оригинал</h2>
                        </div>
                        <textarea id="text-input-a" 
                            class="w-full h-64 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="Вставьте исходный текст здесь..."></textarea>
                    </div>
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="font-semibold text-gray-700 dark:text-gray-200">Изменения</h2>
                        </div>
                        <textarea id="text-input-b" 
                            class="w-full h-64 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="Вставьте измененный текст здесь..."></textarea>
                    </div>
                </div>

                <div class="flex justify-center my-6">
                    <button id="compare-btn" class="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L7.707 7.707A1 1 0 016.293 6.293l3-3A1 1 0 0110 3zM3 10a1 1 0 011-1h3a1 1 0 110 2H4a1 1 0 01-1-1zm13 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                        <span>Сравнить</span>
                    </button>
                </div>

                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Результат сравнения</h3>
                    </div>
                    <div id="diff-result" class="diff-output p-4 md:p-6 min-h-[150px]">
                        <span class="text-gray-400 dark:text-gray-500">Здесь будет отображен результат сравнения...</span>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    const inputA = document.getElementById('text-input-a');
    const inputB = document.getElementById('text-input-b');
    const compareBtn = document.getElementById('compare-btn');
    const resultDiv = document.getElementById('diff-result');
    const initialResultText = resultDiv.innerHTML;


    // Простая функция для сравнения текста по словам
    function diffWords(oldStr, newStr) {
        // Если оба поля пустые, возвращаем исходное сообщение
        if (!oldStr && !newStr) {
            return initialResultText;
        }

        const oldWords = oldStr.split(/(\\s+)/);
        const newWords = newStr.split(/(\\s+)/);
        const dp = Array(oldWords.length + 1).fill(null).map(() => Array(newWords.length + 1).fill(0));

        for (let i = oldWords.length; i >= 0; i--) {
            for (let j = newWords.length; j >= 0; j--) {
                if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
                    dp[i][j] = 1 + dp[i + 1][j + 1];
                } else {
                    dp[i][j] = Math.max(
                        i < oldWords.length ? dp[i + 1][j] : 0,
                        j < newWords.length ? dp[i][j + 1] : 0
                    );
                }
            }
        }

        let i = 0, j = 0;
        let result = '';
        while (i < oldWords.length || j < newWords.length) {
            if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
                result += oldWords[i];
                i++; j++;
            } else if (j < newWords.length && (i === oldWords.length || (dp[i][j + 1] >= dp[i + 1][j]))) {
                if (newWords[j].trim().length > 0) {
                   result += `<ins>${newWords[j]}</ins>`;
                } else {
                   result += newWords[j];
                }
                j++;
            } else if (i < oldWords.length) {
                 if (oldWords[i].trim().length > 0) {
                    result += `<del>${oldWords[i]}</del>`;
                } else {
                    result += oldWords[i];
                }
                i++;
            }
        }
        return result;
    }

    compareBtn.addEventListener('click', () => {
        const textA = inputA.value;
        const textB = inputB.value;
        const diffResult = diffWords(textA, textB);
        resultDiv.innerHTML = diffResult;
    });
}
