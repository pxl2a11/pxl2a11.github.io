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
    'Пианино': 'piano',
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
            <!-- СУЩЕСТВУЮЩИЕ КАРТОЧКИ -->
            <a href="?app=speedTest" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Скорость интернета" data-module="speedTest">
                <div class="w-12 h-12 bg-cyan-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🚀</span></div>
                <span class="text-sm font-medium ml-4">Скорость интернета</span>
            </a>
            <a href="?app=radio" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Радио" data-module="radio">
                <div class="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">📻</span></div>
                <span class="text-sm font-medium ml-4">Радио</span>
            </a>
            <a href="?app=notesAndTasks" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Заметки и задачи" data-module="notesAndTasks">
                <div class="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">📝</span></div>
                <span class="text-sm font-medium ml-4">Заметки и задачи</span>
            </a>
            <a href="?app=soundAndMicTest" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Тест звука и микрофона" data-module="soundAndMicTest">
                <div class="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🎤</span>
                </div>
                <span class="text-sm font-medium ml-4">Тест звука и микрофона</span>
            </a>
            <a href="?app=audioCompressor" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сжатие аудио" data-module="audioCompressor">
                <div class="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🗜️</span>
                </div>
                <span class="text-sm font-medium ml-4">Сжатие аудио</span>
            </a>
            <a href="?app=myIp" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Мой IP" data-module="myIp">
                <div class="w-12 h-12 bg-gray-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🌐</span></div>
                <span class="text-sm font-medium ml-4">Мой IP</span>
            </a>
            <a href="?app=passwordGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор паролей" data-module="passwordGenerator">
                <div class="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🔑</span></div>
                <span class="text-sm font-medium ml-4">Генератор паролей</span>
            </a>
            <a href="?app=percentageCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор процентных соотношений" data-module="percentageCalculator">
                <div class="w-12 h-12 bg-fuchsia-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">➗</span>
                </div>
                <span class="text-sm font-medium ml-4">Калькулятор процентных соотношений</span>
            </a>
            <a href="?app=timer" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Таймер и обратный отсчет" data-module="timer">
                <div class="w-12 h-12 bg-orange-400 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">⏱️</span>
                </div>
                <span class="text-sm font-medium ml-4">Таймер и обратный отсчет</span>
            </a>
            <a href="?app=fortuneWheel" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Колесо фортуны" data-module="fortuneWheel">
                <div class="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🎡</span></div>
                <span class="text-sm font-medium ml-4">Колесо фортуны</span>
            </a>
            <a href="?app=magicBall" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Шар предсказаний" data-module="magicBall">
                <div class="w-12 h-12 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🔮</span></div>
                <span class="text-sm font-medium ml-4">Шар предсказаний</span>
            </a>
            <a href="?app=ticTacToe" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Крестики-нолики" data-module="ticTacToe">
                <div class="w-12 h-12 bg-teal-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">❌⭕</span></div>
                <span class="text-sm font-medium ml-4">Крестики-нолики</span>
            </a>
            <a href="?app=minesweeper" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сапер" data-module="minesweeper">
                <div class="w-12 h-12 bg-gray-600 text-white rounded-xl flex items-center justify-center p-1 flex-shrink-0"><span class="text-3xl">💣</span></div>
                <span class="text-sm font-medium ml-4">Сапер</span>
            </a>
            <a href="?app=stopwatch" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Секундомер" data-module="stopwatch">
                <div class="w-12 h-12 bg-lime-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl"> stopwatch </span></div>
                <span class="text-sm font-medium ml-4">Секундомер</span>
            </a>
            <a href="?app=randomColor" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Случайный цвет" data-module="randomColor">
                <div class="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🌈</span></div>
                <span class="text-sm font-medium ml-4">Случайный цвет</span>
            </a>
            <a href="?app=numberGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор чисел" data-module="numberGenerator">
                <div class="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">🎰</span></div>
                <span class="text-sm font-medium ml-4">Генератор чисел</span>
            </a>
            <a href="?app=qrCodeGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор QR-кодов" data-module="qrCodeGenerator">
                <div class="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">📱</span></div>
                <span class="text-sm font-medium ml-4">Генератор QR-кодов</span>
            </a>
            <a href="?app=emojiAndSymbols" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Эмодзи и символы" data-module="emojiAndSymbols">
                <div class="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">😀</span></div>
                <span class="text-sm font-medium ml-4">Эмодзи и символы</span>
            </a>
            <a href="?app=unitConverter" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Конвертер величин" data-module="unitConverter">
                <div class="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">💱</span></div>
                <span class="text-sm font-medium ml-4">Конвертер величин</span>
            </a>
            <a href="?app=dateCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор дат" data-module="dateCalculator">
                <div class="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">📅</span></div>
                <span class="text-sm font-medium ml-4">Калькулятор дат</span>
            </a>
            <a href="?app=bmiCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор ИМТ" data-module="bmiCalculator">
                <div class="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-3xl">⚖️</span></div>
                <span class="text-sm font-medium ml-4">Калькулятор ИМТ</span>
            </a>

            <!-- НОВЫЕ КАРТОЧКИ ПРИЛОЖЕНИЙ -->
            <a href="?app=wordCounter" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Счетчик слов и символов" data-module="wordCounter">
                <div class="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🔠</span>
                </div>
                <span class="text-sm font-medium ml-4">Счетчик слов и символов</span>
            </a>
            <a href="?app=qrScanner" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сканер QR-кодов" data-module="qrScanner">
                <div class="w-12 h-12 bg-slate-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">📸</span>
                </div>
                <span class="text-sm font-medium ml-4">Сканер QR-кодов</span>
            </a>
            <a href="?app=piano" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Пианино" data-module="piano">
                <div class="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🎹</span>
                </div>
                <span class="text-sm font-medium ml-4">Пианино</span>
            </a>
        </div>
    </div>`;

const appScreenHtml = `
    <div id="app-screen" class="hidden">
        <div class="flex items-start mb-6">
            <a href="/" id="back-button" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><svg class="h-6 w-6 text-gray-900 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></a>
            <h2 id="app-title" class="text-2xl font-bold ml-4"></h2>
        </div>
        <div id="app-content-container" class="mt-4"></div>
        <div id="app-changelog-container" class="mt-8"></div>
    </div>`;

// --- Основная функция-роутер ---
async function router() {
    // 1. Очищаем предыдущее приложение
    if (activeAppModule && typeof activeAppModule.cleanup === 'function') {
        activeAppModule.cleanup();
        activeAppModule = null;
    }
    dynamicContentArea.innerHTML = ''; // Очищаем контент

    // 2. Определяем, какое приложение показать
    const params = new URLSearchParams(window.location.search);
    const moduleName = params.get('app');
    const appName = moduleFileToAppName[moduleName]; 

    if (appName) {
        // Очистка поиска при переходе в приложение
        if (searchInput) searchInput.value = '';
        if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
        
        // --- Загрузка страницы приложения ---
        dynamicContentArea.innerHTML = appScreenHtml;
        const appScreen = document.getElementById('app-screen');
        appScreen.classList.remove('hidden');
        document.getElementById('app-title').textContent = appName;
        changelogContainer.classList.add('hidden');
        document.title = `${appName} | Mini Apps`;

        try {
            const module = await import(`./apps/${moduleName}.js`);
            activeAppModule = module;

            const appContentContainer = document.getElementById('app-content-container');
            if (typeof module.getHtml === 'function') {
                appContentContainer.innerHTML = module.getHtml();
            }
            if (typeof module.init === 'function') {
                module.init();
            }

            const appChangelogContainer = document.getElementById('app-changelog-container');
            if (appName !== 'История изменений') {
                renderChangelog(appName, null, appChangelogContainer);
            }
        } catch (error) {
            console.error(`Ошибка загрузки модуля для "${appName}" (${moduleName}.js):`, error);
            document.getElementById('app-content-container').innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение.</p>`;
        }
    } else {
        // --- Загрузка домашней страницы ---
        dynamicContentArea.innerHTML = homeScreenHtml;
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        renderChangelog(null, 5, changelogContainer);
        setupSearch();
    }
}

// --- Обработка навигации ---
function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        if (link.id === 'back-button') {
            e.preventDefault();
            history.back();
            return;
        }

        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            const isAppNavigation = url.search.startsWith('?app=') || (url.pathname === '/' && !url.search);
            const isChangelogLink = link.classList.contains('changelog-link');

            if (isAppNavigation || isChangelogLink) {
                e.preventDefault();
                if (window.location.href === link.href) return;

                const appNameToOpen = link.dataset.appName;
                if (isChangelogLink && appNameToOpen) {
                    const moduleFile = appNameToModuleFile[appNameToOpen];
                    if (moduleFile) {
                        history.pushState({}, '', `?app=${moduleFile}`);
                    }
                } else {
                    history.pushState({}, '', link.href);
                }
                router();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

// --- Логика поиска ---
function setupSearch() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer) return;

    const allApps = Array.from(appsContainer.querySelectorAll('.app-item'));
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const suggestions = [];
        
        allApps.forEach(app => {
            const appName = app.dataset.name.toLowerCase();
            const moduleName = app.dataset.module;
            const metadata = appSearchMetadata[moduleName] || { keywords: [], hashtags: [] };
            
            const searchCorpus = [appName, ...metadata.keywords].join(' ');

            const isVisible = searchCorpus.includes(searchTerm);
            app.style.display = isVisible ? 'flex' : 'none';

            if (isVisible && searchTerm.length > 0) {
                suggestions.push({
                    name: app.dataset.name,
                    module: moduleName,
                    hashtags: metadata.hashtags || []
                });
            }
        });

        suggestionsContainer.innerHTML = '';
        if (searchTerm.length > 0 && suggestions.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            suggestions.forEach(suggestion => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion-item flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg';
                
                suggestionEl.innerHTML = `
                    <span class="suggestion-name">${suggestion.name}</span>
                    <span class="suggestion-hashtags text-gray-500 dark:text-gray-400 text-sm ml-4">${suggestion.hashtags.join(' ')}</span>
                `;
                
                suggestionEl.addEventListener('click', () => {
                    if(suggestion.module) {
                        history.pushState({}, '', `?app=${suggestion.module}`);
                        router();
                        searchInput.value = ''; 
                        suggestionsContainer.classList.add('hidden');
                    }
                });
                suggestionsContainer.appendChild(suggestionEl);
            });
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    });
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    // Код для переключения темы
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        sunIcon.classList.toggle('hidden', isDark);
        moonIcon.classList.toggle('hidden', !isDark);
    });
    
    // Скрывать подсказки при клике вне поля
    document.addEventListener('click', e => {
        if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
            suggestionsContainer.classList.add('hidden');
        }
    });
    
    changelogContainer.addEventListener('click', (e) => {
        if (e.target.id === 'show-all-changelog-btn') {
            e.preventDefault();
            const moduleFile = appNameToModuleFile['История изменений'];
            history.pushState({}, '', `?app=${moduleFile}`);
            router();
            return;
        }
    });

    // Слушаем событие `popstate` (нажатие кнопок "назад/вперед" в браузере)
    window.addEventListener('popstate', router);

    // Настройка навигации вызывается один раз здесь
    setupNavigationEvents();

    // Первоначальный запуск роутера
    router();
});
