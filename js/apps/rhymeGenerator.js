// 50--- Глобальные переменные модуля ---
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
            
            <div class="flex flex-col sm:flex-row gap-3">
                <input type="text" id="rhyme-input" placeholder="Введите слово..." class="flex-grow w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <button id="find-rhymes-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Найти рифмы</button>
            </div>

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
 * Асинхронная функция для получения рифм через CORS-прокси с корректным заголовком.
 */
async function fetchRhymes() {
    const word = rhymeInput.value.trim().toLowerCase();
    if (word.length < 2) {
        statusMessage.textContent = 'Пожалуйста, введите слово.';
        resultsContainer.innerHTML = '';
        return;
    }

    statusMessage.textContent = 'Ищем рифмы...';
    resultsContainer.innerHTML = '';

    try {
        const targetUrl = `https://stihi.ru/assist/rifma_json.pl?word=${encodeURIComponent(word)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        // --- ИСПРАВЛЕНИЕ: Добавляем заголовок User-Agent для AllOrigins ---
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            // Проверяем, не вернул ли сам AllOrigins ошибку в формате JSON
            const errorData = await response.json();
            throw new Error(`Сетевая ошибка или ошибка прокси: ${errorData.contents || response.statusText}`);
        }

        const data = await response.json();

        // Проверяем, что поле contents не содержит сообщение об ошибке
        if (data.contents && data.contents.includes("CORS policy")) {
             throw new Error("Прокси-сервер не смог выполнить запрос из-за политики CORS.");
        }
        
        // AllOrigins возвращает данные в поле 'contents', нам нужно распарсить эту строку
        const rhymes = JSON.parse(data.contents);
        
        const validRhymes = rhymes.filter(r => r.val && r.val.trim() !== '');

        if (validRhymes.length > 0) {
            statusMessage.textContent = `Найдено рифм: ${validRhymes.length}. Нажмите на слово, чтобы скопировать.`;
            renderRhymes(validRhymes.map(r => ({ word: r.val })));
        } else {
            statusMessage.textContent = `К сожалению, рифм для слова "${word}" не найдено. Попробуйте другую форму слова.`;
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
