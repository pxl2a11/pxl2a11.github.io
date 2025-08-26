// js/apps/wordCounter.js

let textarea, wordCountEl, charCountEl, charNoSpacesEl, sentenceCountEl, readingTimeEl;

function updateCounts() {
    const text = textarea.value;

    // --- ИСПРАВЛЕНИЕ: БОЛЕЕ НАДЕЖНЫЙ ПОДСЧЕТ СЛОВ ---
    // Старый метод .match() был заменен на .trim().split()
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    const wordCount = words.length;
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    const charCount = text.length;
    const charNoSpacesCount = text.replace(/\s/g, '').length;
    const sentenceCount = text.match(/[.!?]+(\s|$)/g)?.length || 0;
    
    // Расчет времени чтения (средняя скорость 225 слов в минуту)
    const wordsPerMinute = 225;
    const minutes = wordCount / wordsPerMinute;
    const readTimeSeconds = Math.floor(minutes * 60);
    
    let readingTimeText;
    if (readTimeSeconds < 1) {
        readingTimeText = "0 сек";
    } else if (readTimeSeconds < 60) {
        readingTimeText = `~ ${readTimeSeconds} сек`;
    } else {
        const readTimeMinutes = Math.floor(readTimeSeconds / 60);
        const remainingSeconds = readTimeSeconds % 60;
        readingTimeText = `~ ${readTimeMinutes} мин ${remainingSeconds} сек`;
    }

    wordCountEl.textContent = wordCount;
    charCountEl.textContent = charCount;
    charNoSpacesEl.textContent = charNoSpacesCount;
    sentenceCountEl.textContent = sentenceCount;
    readingTimeEl.textContent = readingTimeText;
}

export function getHtml() {
    return `
        <div class="space-y-4">
            <textarea id="word-counter-input" class="w-full h-48 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Вставьте ваш текст сюда..."></textarea>
            <div class="flex flex-wrap gap-4 text-center">
                <div class="flex-grow p-4 bg-gray-100 dark:bg-gray-800 rounded-lg basis-1/3 sm:basis-1/5">
                    <div id="word-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Слов</div>
                </div>
                <div class="flex-grow p-4 bg-gray-100 dark:bg-gray-800 rounded-lg basis-1/3 sm:basis-1/5">
                    <div id="char-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Символов</div>
                </div>
                <div class="flex-grow p-4 bg-gray-100 dark:bg-gray-800 rounded-lg basis-1/3 sm:basis-1/5">
                    <div id="char-no-spaces-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Симв. (без пр.)</div>
                </div>
                <div class="flex-grow p-4 bg-gray-100 dark:bg-gray-800 rounded-lg basis-1/3 sm:basis-1/5">
                    <div id="sentence-count" class="text-2xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Предложений</div>
                </div>
                <div class="flex-grow p-4 bg-gray-100 dark:bg-gray-800 rounded-lg basis-1/3 sm:basis-1/5">
                    <div id="reading-time" class="text-2xl font-bold">0 сек</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Время чтения</div>
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
    readingTimeEl = document.getElementById('reading-time');

    textarea.addEventListener('input', updateCounts);
    updateCounts(); // Инициализация
}

export function cleanup() {
    if (textarea) {
        textarea.removeEventListener('input', updateCounts);
    }
}
