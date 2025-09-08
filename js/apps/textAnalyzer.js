// js/apps/textAnalyzer.js

let textarea, statsElements, keywordList;
let eventListeners = [];

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

export function getHtml() {
    return `
        <div class="space-y-6">
            <div>
                <textarea id="text-analyzer-input" class="w-full h-48 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Введите или вставьте ваш текст сюда..."></textarea>
            </div>
            
            <!-- Блок со статистикой -->
            <div id="text-stats" class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div id="stat-words" class="text-3xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Слов</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div id="stat-chars" class="text-3xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Символов</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div id="stat-sentences" class="text-3xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Предложений</div>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div id="stat-paragraphs" class="text-3xl font-bold">0</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Абзацев</div>
                </div>
                <div class="col-span-2 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div id="stat-reading-time" class="text-3xl font-bold">0 сек</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Время чтения</div>
                </div>
                <!-- Блок для ключевых слов -->
                <div class="col-span-2 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h4 class="text-lg font-semibold mb-2">Ключевые слова</h4>
                    <div id="keyword-list" class="space-y-1 text-left">
                        <p class="text-gray-500 dark:text-gray-400">Нет данных для анализа.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function analyzeText() {
    const text = textarea.value;

    // --- Базовая статистика ---
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = text.length;
    // Более точный подсчет предложений
    const sentenceCount = text.match(/[.!?…]+(\s|$)/g)?.length || (text.trim().length > 0 ? 1 : 0);
    const paragraphCount = text.split(/\n\s*\n/).filter(Boolean).length;

    // --- Время чтения ---
    const wpm = 225;
    const readingTimeSeconds = Math.floor((wordCount / wpm) * 60);
    let readingTimeText = '0 сек';
    if (readingTimeSeconds > 0) {
        const minutes = Math.floor(readingTimeSeconds / 60);
        const seconds = readingTimeSeconds % 60;
        readingTimeText = (minutes > 0 ? `${minutes} мин ` : '') + `${seconds} сек`;
    }

    // --- Обновление UI статистики ---
    statsElements.words.textContent = wordCount;
    statsElements.chars.textContent = charCount;
    statsElements.sentences.textContent = sentenceCount;
    statsElements.paragraphs.textContent = paragraphCount;
    statsElements.readingTime.textContent = readingTimeText;

    // --- Анализ ключевых слов ---
    const stopWords = new Set(['и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж', 'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей', 'может', 'они', 'тут', 'где', 'есть', 'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем', 'была', 'сам', 'чтоб', 'без', 'будто', 'чего', 'раз', 'тоже', 'себе', 'под', 'будет', 'ж', 'тогда', 'кто', 'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'ним', 'здесь', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас', 'были', 'куда', 'зачем', 'всех', 'никогда', 'можно', 'при', 'наконец', 'два', 'об', 'другой', 'хоть', 'после', 'над', 'больше', 'тот', 'через', 'эти', 'нас', 'про', 'всего', 'них', 'какая', 'много', 'разве', 'три', 'эту', 'моя', 'впрочем', 'хорошо', 'свою', 'этой', 'перед', 'иногда', 'лучше', 'чуть', 'том', 'нельзя', 'такой', 'им', 'более', 'всегда', 'конечно', 'всю', 'между', 'a', 'an', 'the', 'and', 'is', 'in', 'it', 'of', 'for', 'on', 'with', 'as', 'i', 'to', 'was', 'he', 'that', 'she', 'his', 'her', 'you', 'at', 'by']);
    const wordFrequencies = {};
    const cleanedWords = text.toLowerCase().match(/[a-zа-яё-]{3,}/g) || [];

    cleanedWords.forEach(word => {
        if (!stopWords.has(word)) {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        }
    });

    const sortedKeywords = Object.entries(wordFrequencies)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7);

    // --- Обновление UI ключевых слов ---
    keywordList.innerHTML = '';
    if (sortedKeywords.length > 0) {
        const list = document.createElement('ul');
        list.className = 'list-disc list-inside';
        sortedKeywords.forEach(([word, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `${word} <span class="text-sm text-gray-500 dark:text-gray-400">(${count})</span>`;
            list.appendChild(li);
        });
        keywordList.appendChild(list);
    } else {
        keywordList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Недостаточно данных для анализа.</p>';
    }
}

export function init() {
    textarea = document.getElementById('text-analyzer-input');
    statsElements = {
        words: document.getElementById('stat-words'),
        chars: document.getElementById('stat-chars'),
        sentences: document.getElementById('stat-sentences'),
        paragraphs: document.getElementById('stat-paragraphs'),
        readingTime: document.getElementById('stat-reading-time'),
    };
    keywordList = document.getElementById('keyword-list');

    addListener(textarea, 'input', analyzeText);
    
    // Инициализация при загрузке, если в поле уже есть текст
    analyzeText();
}

export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
