import { renderChangelog, getChangelogData } from './utils/changelog.js';

// --- Сопоставление имен приложений с файлами модулей ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
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
    'Сжатие аудио': 'audioCompressor', // ДОБАВЛЕНО
    'История изменений': 'changelogPage',
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
let activeAppModule = null; // Хранит текущий активный модуль для очистки

// --- Шаблоны HTML ---
const homeScreenHtml = `
    <div id="home-screen">
        <div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="?app=speedTest" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Скорость интернета">
                <div class="w-12 h-12 bg-cyan-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 15.5A8.5 8.5 0 1 1 20.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 15.5L18 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.5" fill="currentColor"/></svg></div>
                <span class="text-sm font-medium ml-4">Скорость интернета</span>
            </a>
            <a href="?app=radio" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Радио">
                <div class="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke-width="2"/><circle cx="16" cy="12" r="2" stroke-width="2"/><line x1="7" y1="12" x2="11" y2="12" stroke-width="2"/><line x1="7" y1="15" x2="11" y2="15" stroke-width="2"/></svg></div>
                <span class="text-sm font-medium ml-4">Радио</span>
            </a>
            <a href="?app=notesAndTasks" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Заметки и задачи">
                <div class="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
                <span class="text-sm font-medium ml-4">Заметки и задачи</span>
            </a>
            <a href="?app=soundAndMicTest" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Тест звука и микрофона">
                <div class="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor">
                        <!-- Микрофон (заливка) -->
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="none"/>
                        <!-- Подставка и волны (контур) -->
                        <g fill="none" stroke-width="2" stroke-linecap="round">
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                            <path d="M21 12h-2"/>
                            <path d="M3 12h2"/>
                        </g>
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Тест звука и микрофона</span>
            </a>
            <a href="?app=myIp" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Мой IP">
                <div class="w-12 h-12 bg-gray-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" /></svg></div>
                <span class="text-sm font-medium ml-4">Мой IP</span>
            </a>
            <a href="?app=passwordGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор паролей">
                <div class="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <span class="text-sm font-medium ml-4">Генератор паролей</span>
            </a>
            <a href="?app=percentageCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор процентных соотношений">
                <div class="w-12 h-12 bg-fuchsia-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="6.5" cy="6.5" r="2.5" />
                        <circle cx="17.5" cy="17.5" r="2.5" />
                        <line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Калькулятор процентных соотношений</span>
            </a>
            <a href="?app=timer" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Таймер и обратный отсчет">
                <div class="w-12 h-12 bg-orange-400 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <!-- Корпус таймера -->
                        <circle cx="12" cy="12" r="9" />
                        <!-- Кнопка сверху -->
                        <line x1="12" y1="2" x2="12" y2="5" />
                        <!-- Стрелки -->
                        <line x1="12" y1="12" x2="12" y2="7" />
                        <line x1="12" y1="12" x2="15" y2="12" />
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Таймер и обратный отсчет</span>
            </a>
            <a href="?app=fortuneWheel" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Колесо фортуны">
                <div class="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 3 L12 21 M3 12 L21 12 M5.12 5.12 L18.88 18.88 M18.88 5.12 L5.12 18.88" stroke-width="2" stroke-linecap="round"/></svg></div>
                <span class="text-sm font-medium ml-4">Колесо фортуны</span>
            </a>
            <a href="?app=magicBall" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Шар предсказаний">
                <div class="w-12 h-12 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold">8</text></svg></div>
                <span class="text-sm font-medium ml-4">Шар предсказаний</span>
            </a>
            <a href="?app=ticTacToe" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Крестики-нолики">
                <div class="w-12 h-12 bg-teal-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v16M16 4v16M4 8h16M4 16h16"></path><circle cx="12" cy="12" r="2.5" stroke-width="2"></circle></svg></div>
                <span class="text-sm font-medium ml-4">Крестики-нолики</span>
            </a>
            <a href="?app=minesweeper" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сапер">
                <div class="w-12 h-12 bg-gray-600 text-white rounded-xl flex items-center justify-center p-1 flex-shrink-0"><svg class="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="14" fill="#212121"/><path d="M32 18L32 10M32 54L32 46M18 32L10 32M54 32L46 32M20 20L14 14M44 44L50 50M20 44L14 50M44 20L50 14" stroke="#BDBDBD" stroke-width="4" stroke-linecap="round"/></svg></div>
                <span class="text-sm font-medium ml-4">Сапер</span>
            </a>
            <a href="?app=stopwatch" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Секундомер">
                <div class="w-12 h-12 bg-lime-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span class="text-sm font-medium ml-4">Секундомер</span>
            </a>
            <a href="?app=randomColor" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Случайный цвет">
                <div class="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg></div>
                <span class="text-sm font-medium ml-4">Случайный цвет</span>
            </a>
            <a href="?app=numberGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор чисел">
                <div class="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feDropShadow dx="2" dy="4" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/></filter></defs><rect x="10" y="10" width="80" height="80" rx="15" fill="#FFFFFF" stroke="#000000" stroke-width="4" filter="url(#shadow)"/><circle cx="30" cy="30" r="8" fill="#000000"/><circle cx="70" cy="70" r="8" fill="#000000"/><circle cx="50" cy="50" r="8" fill="#000000"/></svg></div>
                <span class="text-sm font-medium ml-4">Генератор чисел</span>
            </a>
            <a href="?app=qrCodeGenerator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор QR-кодов">
                <div class="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zm2 2h2v2h-2zm-2 4h2v2h-2zm2 2h2v2h-2zm2-4h2v2h-2zm2-2h2v2h-2zm-4 0h2v2h-2zm2 4h2v2h-2z"></path></svg></div>
                <span class="text-sm font-medium ml-4">Генератор QR-кодов</span>
            </a>
            <a href="?app=emojiAndSymbols" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Эмодзи и символы">
                <div class="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg></div>
                <span class="text-sm font-medium ml-4">Эмодзи и символы</span>
            </a>
            <a href="?app=unitConverter" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Конвертер величин">
                <div class="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>
                <span class="text-sm font-medium ml-4">Конвертер величин</span>
            </a>
            <a href="?app=dateCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор дат">
                <div class="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <span class="text-sm font-medium ml-4">Калькулятор дат</span>
            </a>
            <a href="?app=bmiCalculator" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Калькулятор ИМТ">
                <div class="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="12" cy="12" r="4" /><line x1="12" y1="12" x2="15" y2="9" /></svg></div>
                <span class="text-sm font-medium ml-4">Калькулятор ИМТ</span>
            </a>
            <!-- НОВОЕ ПРИЛОЖЕНИЕ -->
            <a href="?app=audioCompressor" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сжатие аудио">
                <div class="w-12 h-12 bg-violet-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 19l-4-4H4a2 2 0 01-2-2V7a2 2 0 012-2h4l4-4v18z"/>
                        <path d="M15 8l6 6"/>
                        <path d="M21 8l-6 6"/>
                    </svg>
                </div>
                <span class="text-sm font-medium ml-4">Сжатие аудио</span>
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
    setupNavigationEvents();
}

// --- Обработка навигации ---
function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            const isAppNavigation = url.search.startsWith('?app=') || (url.pathname === '/' && !url.search);
            const isChangelogLink = link.classList.contains('changelog-link');

            if (isAppNavigation || isChangelogLink) {
                e.preventDefault();
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
        let suggestions = [];
        allApps.forEach(app => {
            const appName = app.dataset.name.toLowerCase();
            const isVisible = appName.includes(searchTerm);
            app.style.display = isVisible ? 'flex' : 'none';
            if (isVisible && searchTerm.length > 0) suggestions.push(app.dataset.name);
        });

        suggestionsContainer.innerHTML = '';
        if (searchTerm.length > 0 && suggestions.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            suggestions.forEach(suggestionText => {
                const suggestionEl = document.createElement('div');
                suggestionEl.textContent = suggestionText;
                suggestionEl.className = 'px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg';
                suggestionEl.addEventListener('click', () => {
                    const moduleFile = appNameToModuleFile[suggestionText];
                    if(moduleFile) {
                        history.pushState({}, '', `?app=${moduleFile}`);
                        router();
                        // дополнительно очищаем здесь для мгновенной реакции
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

    // Первоначальный запуск роутера
    router();
});
