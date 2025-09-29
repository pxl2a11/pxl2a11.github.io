// 20js/apps/rhymeGenerator.js

// --- Глобальные переменные модуля ---
let rhymeInput, findBtn, resultsContainer, statusMessage;
let eventListeners = [];

/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}


/**
 * Возвращает HTML-структуру для приложения "Генератор рифм".
 * @returns {string} HTML-разметка.
 */
export function getHtml() {
    return `
        <style>
            .rhyme-word {
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s;
            }
            .rhyme-word:hover {
                background-color: #3b82f6; /* blue-500 */
                color: white;
            }
            .dark .rhyme-word:hover {
                background-color: #60a5fa; /* blue-400 */
                color: #1f2937; /* gray-800 */
            }
        </style>
        <div class="max-w-xl mx-auto p-4 space-y-6">
            <h3 class="text-2xl font-bold text-center">Генератор рифм</h3>
            
            <!-- Поле ввода и кнопка -->
            <div class="flex flex-col sm:flex-row gap-3">
                <input type="text" id="rhyme-input" placeholder="Введите слово..." class="flex-grow w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <button id="find-rhymes-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Найти рифмы</button>
            </div>

            <!-- Контейнер для результатов -->
            <div>
                <p id="rhyme-status" class="text-center text-gray-600 dark:text-gray-400 min-h-[24px] mb-4">Введите слово и нажмите на кнопку</p>
                <div id="rhymes-results-container" class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner min-h-[100px] flex flex-wrap gap-3 justify-center">
                    <!-- Рифмы появятся здесь -->
                </div>
            </div>
        </div>
    `;
}

/**
 * Асинхронная функция для получения рифм с помощью Datamuse API.
 */
async function fetchRhymes() {
    const word = rhymeInput.value.trim();
    if (!word) {
        statusMessage.textContent = 'Пожалуйста, введите слово.';
        return;
    }

    statusMessage.textContent = 'Ищем рифмы...';
    resultsContainer.innerHTML = ''; // Очищаем предыдущие результаты

    try {
        // --- ИСПРАВЛЕНИЕ: Используем параметр `ml=` вместо `rel_rhy=` для поддержки русского языка ---
        const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }

        const rhymes = await response.json();

        if (rhymes.length > 0) {
            statusMessage.textContent = `Найдено созвучных слов: ${rhymes.length}. Нажмите на слово, чтобы скопировать.`;
            renderRhymes(rhymes);
        } else {
            statusMessage.textContent = `К сожалению, ничего не найдено для слова "${word}".`;
        }
    } catch (error) {
        console.error("Ошибка при получении рифм:", error);
        statusMessage.textContent = 'Произошла ошибка при загрузке. Попробуйте позже.';
    }
}

/**
 * Отображает найденные рифмы в контейнере.
 * @param {Array<Object>} rhymes - Массив объектов со словами.
 */
function renderRhymes(rhymes) {
    // Ограничим количество рифм для лучшего отображения
    rhymes.slice(0, 50).forEach(rhymeObj => {
        const rhymeSpan = document.createElement('span');
        rhymeSpan.className = 'rhyme-word p-2 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold';
        rhymeSpan.textContent = rhymeObj.word;
        rhymeSpan.title = 'Нажмите, чтобы скопировать';
        
        // Добавляем обработчик для копирования в буфер обмена
        rhymeSpan.addEventListener('click', () => {
            navigator.clipboard.writeText(rhymeObj.word).then(() => {
                const originalText = rhymeSpan.textContent;
                rhymeSpan.textContent = 'Скопировано!';
                setTimeout(() => {
                    rhymeSpan.textContent = originalText;
                }, 1500);
            });
        });

        resultsContainer.appendChild(rhymeSpan);
    });
}


/**
 * Инициализирует логику приложения.
 */
export function init() {
    // Получаем элементы DOM
    rhymeInput = document.getElementById('rhyme-input');
    findBtn = document.getElementById('find-rhymes-btn');
    resultsContainer = document.getElementById('rhymes-results-container');
    statusMessage = document.getElementById('rhyme-status');

    // Назначаем обработчики событий
    addListener(findBtn, 'click', fetchRhymes);
    
    // Позволяет нажимать Enter в поле ввода
    addListener(rhymeInput, 'keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем отправку формы, если она есть
            fetchRhymes();
        }
    });
}

/**
 * Очищает ресурсы при выходе из приложения.
 */
export function cleanup() {
    // Удаляем все слушатели событий
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
