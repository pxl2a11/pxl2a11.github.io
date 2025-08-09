let textarea, wordCountEl, charCountEl, charNoSpacesEl, sentenceCountEl;

function updateCounts() {
    const text = textarea.value;
    const wordCount = text.match(/\b\S+\b/g)?.length || 0;
    const charCount = text.length;
    const charNoSpacesCount = text.replace(/\s/g, '').length;
    // Простое определение предложения, может быть неточным для сложных текстов
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;

    wordCountEl.textContent = wordCount;
    charCountEl.textContent = charCount;
    charNoSpacesEl.textContent = charNoSpacesCount;
    sentenceCountEl.textContent = sentenceCount;
}

export function getHtml() {
    return `
        <div class="space-y-4">
            <textarea id="word-counter-input" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Вставьте ваш текст сюда..."></textarea>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="word-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Слов</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="char-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Символов</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="char-no-spaces-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Символов (без пробелов)</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="sentence-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Предложений</div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    textarea = document.getElementById('word-counter-input');
    wordCountEl = document.getElementById('word-count');
    charCountEl = document.getElementById('char-count');
    charNoSpacesEl = document.getElementById('char-no-spaces-count');
    sentenceCountEl = document.getElementById('sentence-count');

    textarea.addEventListener('input', updateCounts);
    updateCounts(); // Инициализация
}

export function cleanup() {
    if (textarea) {
        textarea.removeEventListener('input', updateCounts);
    }
}
