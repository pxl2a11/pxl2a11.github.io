// 15--- Глобальные переменные модуля ---
let rhymeInput, findBtn, resultsContainer, statusMessage;
let eventListeners = [];

// --- ВАШ URL, ПОЛУЧЕННЫЙ НА ШАГЕ 4 ---
// Я уже вставил ваш URL сюда.
const AI_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwN97z3sQUEQQRTPbp7IDCIcDKNwdAanUXSoMG-xwW8FVoTGaFsLoj8wM2mUiLznkxo/exec';


/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Возвращает HTML-структуру для приложения "Генератор рифм".
 */
export function getHtml() {
    return `
        <style>
            .rhyme-word { cursor: pointer; transition: background-color 0.2s, color 0.2s; }
            .rhyme-word:hover { background-color: #3b82f6; color: white; }
            .dark .rhyme-word:hover { background-color: #60a5fa; color: #1f2937; }
        </style>
        <div class="max-w-xl mx-auto p-4 space-y-6">
            <h3 class="text-2xl font-bold text-center">Генератор рифм на AI</h3>
            <div class="flex flex-col sm:flex-row gap-3">
                <input type="text" id="rhyme-input" placeholder="Введите слово..." class="flex-grow w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <button id="find-rhymes-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Найти рифмы</button>
            </div>
            <div>
                <p id="rhyme-status" class="text-center text-gray-600 dark:text-gray-400 min-h-[24px] mb-4">Введите слово и нажмите на кнопку</p>
                <div id="rhymes-results-container" class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner min-h-[100px] flex flex-wrap gap-3 justify-center"></div>
            </div>
        </div>
    `;
}

/**
 * Асинхронная функция для получения рифм от вашего AI-сервера.
 */
async function fetchRhymes() {
    const word = rhymeInput.value.trim();
    if (AI_WEB_APP_URL.includes('СЮДА_ВСТАВЬТЕ_ВАШ_URL')) {
        statusMessage.textContent = 'Ошибка: Укажите URL вашего веб-приложения в коде.';
        return;
    }
    if (word.length < 2) {
        statusMessage.textContent = 'Пожалуйста, введите слово.';
        resultsContainer.innerHTML = '';
        return;
    }

    statusMessage.textContent = 'AI подбирает рифмы...';
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch(`${AI_WEB_APP_URL}?word=${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }

        const rhymesArray = await response.json();

        if (rhymesArray.error) {
            throw new Error(rhymesArray.error);
        }
        
        // Преобразуем массив строк, полученный от AI, в массив объектов
        const validRhymes = rhymesArray.map(r => ({ word: r }));

        if (validRhymes.length > 0) {
            statusMessage.textContent = `AI подобрал рифм: ${validRhymes.length}. Нажмите на слово, чтобы скопировать.`;
            renderRhymes(validRhymes);
        } else {
            statusMessage.textContent = `К сожалению, AI не смог подобрать рифму для "${word}".`;
        }
    } catch (error) {
        console.error("Ошибка при получении рифм:", error);
        statusMessage.textContent = 'Произошла ошибка при загрузке. Попробуйте позже.';
    }
}

/**
 * Отображает найденные рифмы в контейнере.
 */
function renderRhymes(rhymes) {
    resultsContainer.innerHTML = '';
    rhymes.forEach(rhymeObj => {
        const rhymeSpan = document.createElement('span');
        rhymeSpan.className = 'rhyme-word p-2 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold';
        rhymeSpan.textContent = rhymeObj.word;
        rhymeSpan.title = 'Нажмите, чтобы скопировать';
        
        rhymeSpan.addEventListener('click', () => {
            navigator.clipboard.writeText(rhymeObj.word).then(() => {
                const originalText = rhymeSpan.textContent;
                rhymeSpan.textContent = 'Скопировано!';
                setTimeout(() => { rhymeSpan.textContent = originalText; }, 1500);
            });
        });
        resultsContainer.appendChild(rhymeSpan);
    });
}

/**
 * Инициализирует логику приложения.
 */
export function init() {
    rhymeInput = document.getElementById('rhyme-input');
    findBtn = document.getElementById('find-rhymes-btn');
    resultsContainer = document.getElementById('rhymes-results-container');
    statusMessage = document.getElementById('rhyme-status');
    addListener(findBtn, 'click', fetchRhymes);
    addListener(rhymeInput, 'keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchRhymes();
        }
    });
}

/**
 * Очищает ресурсы при выходе из приложения.
 */
export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
