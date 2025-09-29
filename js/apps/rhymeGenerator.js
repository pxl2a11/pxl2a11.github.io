//24 js/apps/rhymeGenerator.js

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
    const word = rhymeInput.value.trim().toLowerCase();
    if (word.length < 2) {
        statusMessage.textContent = 'Пожалуйста, введите слово подлиннее.';
        resultsContainer.innerHTML = '';
        return;
    }

    statusMessage.textContent = 'Ищем рифмы...';
    resultsContainer.innerHTML = '';

    // Определяем окончание для поиска. Используем последние 3 символа, или 2, если слово короткое.
    const ending = word.length > 3 ? word.slice(-3) : word.slice(-2);

    try {
        // ИСПРАВЛЕНИЕ: Используем параметр `sp=` (spelled like) с маской `*` (любые символы) + окончание.
        // Добавляем lang=ru для поиска только на русском и max=100 для ограничения результатов.
        const response = await fetch(`https://api.datamuse.com/words?sp=*${encodeURIComponent(ending)}&lang=ru&max=100`);
        
        if (!response.ok) {
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }

        let rhymes = await response.json();
        
        // Фильтруем результаты, чтобы убрать исходное слово
        rhymes = rhymes.filter(rhymeObj => rhymeObj.word !== word);

        if (rhymes.length > 0) {
            statusMessage.textContent = `Найдено рифм: ${rhymes.length}. Нажмите на слово, чтобы скопировать.`;
            renderRhymes(rhymes);
        } else {
            statusMessage.textContent = `К сожалению, рифм для слова "${word}" не найдено.`;
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
    // Ограничим количество отображаемых рифм, чтобы не перегружать интерфейс
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
            e.preventDefault(); // Предотвращаем стандартное поведение (например, отправку формы)
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
