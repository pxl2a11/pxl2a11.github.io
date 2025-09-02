// js/apps/textDiffTool.js

export function getHtml() {
    return `
        <style>
            .diff-output { white-space: pre-wrap; font-family: monospace; line-height: 1.6; }
            .diff-output ins { background-color: #d4edda; color: #155724; text-decoration: none; }
            .diff-output del { background-color: #f8d7da; color: #721c24; text-decoration: none; }
            .dark .diff-output ins { background-color: #1c3b23; color: #a3e9b2; }
            .dark .diff-output del { background-color: #442124; color: #f1b0b7; }
        </style>
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea id="text-input-a" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Исходный текст..."></textarea>
                <textarea id="text-input-b" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Измененный текст..."></textarea>
            </div>
            <button id="compare-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Сравнить</button>
            <div>
                <h3 class="text-lg font-semibold mb-2">Результат сравнения:</h3>
                <div id="diff-result" class="diff-output p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[100px]"></div>
            </div>
        </div>
    `;
}

export function init() {
    const inputA = document.getElementById('text-input-a');
    const inputB = document.getElementById('text-input-b');
    const compareBtn = document.getElementById('compare-btn');
    const resultDiv = document.getElementById('diff-result');

    // Простая функция для сравнения текста по словам
    function diffWords(oldStr, newStr) {
        const oldWords = oldStr.split(/\\s+/);
        const newWords = newStr.split(/\\s+/);
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
            const spaceA = i < oldWords.length ? oldStr.substring(oldStr.indexOf(oldWords[i]) + oldWords[i].length).match(/^\\s+/)?.[0] || ' ' : '';
            const spaceB = j < newWords.length ? newStr.substring(newStr.indexOf(newWords[j]) + newWords[j].length).match(/^\\s+/)?.[0] || ' ' : '';

            if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
                result += oldWords[i] + (spaceA || spaceB);
                i++; j++;
            } else if (j < newWords.length && (i === oldWords.length || (dp[i][j + 1] >= dp[i + 1][j]))) {
                result += `<ins>${newWords[j]}</ins>${spaceB}`;
                j++;
            } else if (i < oldWords.length) {
                result += `<del>${oldWords[i]}</del>${spaceA}`;
                i++;
            }
        }
        return result;
    }

    compareBtn.addEventListener('click', () => {
        const textA = inputA.value;
        const textB = inputB.value;
        resultDiv.innerHTML = diffWords(textA, textB);
    });
}
