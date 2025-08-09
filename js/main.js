import { renderChangelog, getChangelogData } from './utils/changelog.js';

// --- Сопоставление имен приложений с файлами модулей ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
    'Сжатие аудио': 'audioCompressor',
    'Мой IP': 'myIp',
    'Генератор паролей': 'passwordGenerator',
    'Калькулятор процентных соотношений': 'percentageCalculator',
    'Таймер и обратный отсчет': 'timer',
    'Колесо фортуны': 'fortuneWheel',
    'Шар предсказаний': 'magicBall',
    'Крестики-нолики': 'ticTacToe',
    'Сапер': 'minesweeper',
    'Секундомер': 'stopwatch',
    'Случайный цвет': 'randomColor',
    'Генератор чисел': 'numberGenerator',
    'Генератор QR-кодов': 'qrCodeGenerator',
    'Эмодзи и символы': 'emojiAndSymbols',
    'Конвертер величин': 'unitConverter',
    'Калькулятор дат': 'dateCalculator',
    'Калькулятор ИМТ': 'bmiCalculator',
    // --- НОВЫЕ ПРИЛОЖЕНИЯ ---
    'Счетчик слов и символов': 'wordCounter',
    'Сканер QR-кодов': 'qrScanner',
    'Простой синтезатор (Пианино)': 'piano',
    'История изменений': 'changelogPage',
};

// --- Ключевые слова и хэштеги для поиска ---
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] },
    'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] },
    'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] },
    'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] },
    'audioCompressor': { keywords: ['сжать', 'аудио', 'mp3', 'размер', 'уменьшить'], hashtags: ['#audio', '#tools'] },
    'myIp': { keywords: ['ip', 'адрес', 'айпи', 'сеть'], hashtags: ['#network', '#tools'] },
    'passwordGenerator': { keywords: ['пароль', 'безопасность', 'создать', 'надежный'], hashtags: ['#security', '#tools'] },
    'percentageCalculator': { keywords: ['проценты', 'вычислить', 'доля'], hashtags: ['#math', '#calculator'] },
    'timer': { keywords: ['countdown', 'отсчет', 'время'], hashtags: ['#time', ' #tools'] },
    'fortuneWheel': { keywords: ['рулетка', 'случайный', 'выбор', 'жребий'], hashtags: ['#random', '#game'] },
    'magicBall': { keywords: ['предсказание', 'ответ', 'восьмерка', 'да нет'], hashtags: ['#fun', '#game'] },
    'ticTacToe': { keywords: ['игра', 'крестики', 'нолики', 'вдвоем'], hashtags: ['#game'] },
    'minesweeper': { keywords: ['игра', 'мины', 'головоломка', 'логика'], hashtags: ['#game', '#logic'] },
    'stopwatch': { keywords: ['время', 'хронометр', 'измерить'], hashtags: ['#time', '#tools'] },
    'randomColor': { keywords: ['цвет', 'случайный', 'палитра', 'дизайн', 'hex'], hashtags: ['#design', '#random'] },
    'numberGenerator': { keywords: ['случайное', 'число', 'рандом', 'выбор'], hashtags: ['#random', '#math'] },
    'qrCodeGenerator': { keywords: ['qr', 'код', 'куар', 'ссылка'], hashtags: ['#tools', '#generator'] },
    'emojiAndSymbols': { keywords: ['эмодзи', 'символы', 'скопировать', 'смайлик'], hashtags: ['#text', '#tools'] },
    'unitConverter': { keywords: ['конвертер', 'единицы', 'измерения', 'перевести'], hashtags: ['#converter', '#math'] },
    'dateCalculator': { keywords: ['дата', 'дни', 'календарь', 'разница'], hashtags: ['#time', '#calculator'] },
    'bmiCalculator': { keywords: ['имт', 'вес', 'рост', 'здоровье', 'индекс массы тела'], hashtags: ['#health', '#calculator'] },
    // --- МЕТАДАННЫЕ ДЛЯ НОВЫХ ПРИЛОЖЕНИЙ ---
    'wordCounter': { keywords: ['счетчик', 'слова', 'символы', 'текст', 'статистика', 'подсчет'], hashtags: ['#text', '#tools'] },
    'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] },
    'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] },
};


// --- Обратное сопоставление для поиска полного имени по файлу модуля ---
const moduleFileToAppName = Object.fromEntries(
  Object.entries(appNameToModuleFile).map(([name, file]) => [file, name])
);

// --- Глобальные переменные и константы ---
const dynamicContentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
let activeAppModule = null; 

// --- Шаблоны HTML ---
const homeScreenHtml = `
    <div id="home-screen">
        <div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {...} // Весь ваш предыдущий список карточек без изменений
            
            {/* --- НОВЫЕ КАРТОЧКИ ПРИЛОЖЕНИЙ --- */}
            <a href="?app=wordCounter" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Счетчик слов и символов" data-module="wordCounter">
                <div class="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 6h16M4 12h16M4 18h7"></path>
                        <path d="M18 15l3 3-3 3"></path>
                        <path d="M21 12v6"></path>
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Счетчик слов и символов</span>
            </a>
            <a href="?app=qrScanner" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сканер QR-кодов" data-module="qrScanner">
                <div class="w-12 h-12 bg-slate-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 7V5a2 2 0 012-2h2"></path>
                        <path d="M17 3h2a2 2 0 012 2v2"></path>
                        <path d="M21 17v2a2 2 0 01-2 2h-2"></path>
                        <path d="M7 21H5a2 2 0 01-2-2v-2"></path>
                        <rect x="7" y="7" width="10" height="10" rx="1"></rect>
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Сканер QR-кодов</span>
            </a>
            <a href="?app=piano" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Простой синтезатор (Пианино)" data-module="piano">
                <div class="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5a1 1 0 011-1h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm1 0v8h2V5H3zm4 0v8h2V5H7zm4 0v8h2V5h-2zm4 0v8h2V5h-2z"></path>
                        <path d="M4 5.5h.5v4H4v-4zm4 0h.5v4H8v-4zm4 0h.5v4h-2v-1H12v-3z"></path>
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Простой синтезатор (Пианино)</span>
            </a>
        </div>
    </div>`;

// ... остальная часть файла main.js остается без изменений
// (appScreenHtml, router, setupNavigationEvents, setupSearch, и т.д.)
