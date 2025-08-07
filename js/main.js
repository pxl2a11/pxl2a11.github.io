import { renderChangelog, getChangelogData } from './utils/changelog.js';

// --- Сопоставление имен приложений с файлами модулей ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
    'Мой IP': 'myIp',
    'Генератор паролей': 'passwordGenerator',
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
    'История изменений': 'changelogPage', // Специальная страница
};

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
            <a href="?app=Скорость%20интернета" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Скорость интернета">
                <div class="w-12 h-12 bg-cyan-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 15.5A8.5 8.5 0 1 1 20.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 15.5L18 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.5" fill="currentColor"/></svg></div>
                <span class="text-sm font-medium ml-4">Скорость интернета</span>
            </a>
            <a href="?app=Радио" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Радио">
                <div class="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" stroke-width="2"/><circle cx="16" cy="12" r="2" stroke-width="2"/><line x1="7" y1="12" x2="11" y2="12" stroke-width="2"/><line x1="7" y1="15" x2="11" y2="15" stroke-width="2"/></svg></div>
                <span class="text-sm font-medium ml-4">Радио</span>
            </a>
            <a href="?app=Заметки%20и%20задачи" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Заметки и задачи">
                <div class="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
                <span class="text-sm font-medium ml-4">Заметки и задачи</span>
            </a>
            <a href="?app=Тест%20звука%20и%20микрофона" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Тест звука и микрофона">
                <div class="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><g><rect x="22" y="28" width="16" height="30" rx="8"/><line x1="30" y1="58" x2="30" y2="72" fill="none"/><line x1="22" y1="72" x2="38" y2="72" fill="none"/></g><g><path d="M56 42 L62 42 L70 34 L70 66 L62 58 L56 58 Z"/><path d="M75 38 a10 10 0 0 1 0 24" fill="none"/><path d="M80 32 a16 16 0 0 1 0 36" fill="none"/></g></g></svg></div>
                <span class="text-sm font-medium ml-4">Тест звука и микрофона</span>
            </a>
            <a href="?app=Мой%20IP" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Мой IP">
                <div class="w-12 h-12 bg-gray-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" /></svg></div>
                <span class="text-sm font-medium ml-4">Мой IP</span>
            </a>
            <a href="?app=Генератор%20паролей" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор паролей">
                <div class="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <span class="text-sm font-medium ml-4">Генератор паролей</span>
            </a>
            <a href="?app=Колесо%20фортуны" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Колесо фортуны">
                <div class="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 3 L12 21 M3 12 L21 12 M5.12 5.12 L18.88 18.88 M18.88 5.12 L5.12 18.88" stroke-width="2" stroke-linecap="round"/></svg></div>
                <span class="text-sm font-medium ml-4">Колесо фортуны</span>
            </a>
            <a href="?app=Шар%20предсказаний" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Шар предсказаний">
                <div class="w-12 h-12 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold">8</text></svg></div>
                <span class="text-sm font-medium ml-4">Шар предсказаний</span>
            </a>
            <a href="?app=Крестики-нолики" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Крестики-нолики">
                <div class="w-12 h-12 bg-teal-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v16M16 4v16M4 8h16M4 16h16"></path><circle cx="12" cy="12" r="2.5" stroke-width="2"></circle></svg></div>
                <span class="text-sm font-medium ml-4">Крестики-нолики</span>
            </a>
            <a href="?app=Сапер" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Сапер">
                <div class="w-12 h-12 bg-gray-600 text-white rounded-xl flex items-center justify-center p-1 flex-shrink-0"><svg class="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="14" fill="#212121"/><path d="M32 18L32 10M32 54L32 46M18 32L10 32M54 32L46 32M20 20L14 14M44 44L50 50M20 44L14 50M44 20L50 14" stroke="#BDBDBD" stroke-width="4" stroke-linecap="round"/></svg></div>
                <span class="text-sm font-medium ml-4">Сапер</span>
            </a>
            <a href="?app=Секундомер" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Секундомер">
                <div class="w-12 h-12 bg-lime-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span class="text-sm font-medium ml-4">Секундомер</span>
            </a>
            <a href="?app=Случайный%20цвет" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Случайный цвет">
                <div class="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg></div>
                <span class="text-sm font-medium ml-4">Случайный цвет</span>
            </a>
            <a href="?app=Генератор%20чисел" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор чисел">
                <div class="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feDropShadow dx="2" dy="4" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/></filter></defs><rect x="10" y="10" width="80" height="80" rx="15" fill="#FFFFFF" stroke="#000000" stroke-width="4" filter="url(#shadow)"/><circle cx="30" cy="30" r="8" fill="#000000"/><circle cx="70" cy="70" r="8" fill="#000000"/><circle cx="50" cy="50" r="8" fill="#000000"/></svg></div>
                <span class="text-sm font-medium ml-4">Генератор чисел</span>
            </a>
            <a href="?app=Генератор%20QR-кодов" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Генератор QR-кодов">
                <div class="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zm2 2h2v2h-2zm-2 4h2v2h-2zm2 2h2v2h-2zm2-4h2v2h-2zm2-2h2v2h-2zm-4 0h2v2h-2zm2 4h2v2h-2z"></path></svg></div>
                <span class="text-sm font-medium ml-4">Генератор QR-кодов</span>
            </a>
            <a href="?app=Эмодзи%20и%20символы" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Эмодзи и символы">
                <div class="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg></div>
                <span class="text-sm font-medium ml-4">Эмодзи и символы</span>
            </a>
            <a href="?app=Конвертер%20величин" class="app-item flex flex-row items-center text-left p-3 rounded-xl transition-all group shadow-lg hover:shadow-xl hover:scale-105 bg-white dark:bg-gray-800 w-full" data-name="Конвертер величин">
                <div class="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>
                <span class="text-sm font-medium ml-4">Конвертер величин</span>
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
    const appName = params.get('app');

    if (appName && appNameToModuleFile[appName]) {
        // --- Загрузка страницы приложения ---
        dynamicContentArea.innerHTML = appScreenHtml;
        const appScreen = document.getElementById('app-screen');
        appScreen.classList.remove('hidden');
        document.getElementById('app-title').textContent = appName;
        changelogContainer.classList.add('hidden');
        document.title = `${appName} | Mini Apps`;

        try {
            const moduleName = appNameToModuleFile[appName];
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
            console.error(`Ошибка загрузки модуля для "${appName}":`, error);
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
        // Если это внутренняя ссылка
        if (url.origin === window.location.origin) {
            // И она либо ведет на главную, либо содержит параметр `app`
            const isAppNavigation = url.search.startsWith('?app=') || (url.pathname === '/' && !url.search);
            const isChangelogLink = link.classList.contains('changelog-link');

            if (isAppNavigation || isChangelogLink) {
                e.preventDefault();
                const appNameToOpen = link.dataset.appName;
                if (isChangelogLink && appNameToOpen) {
                    history.pushState({}, '', `?app=${encodeURIComponent(appNameToOpen)}`);
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
                    history.pushState({}, '', `?app=${encodeURIComponent(suggestionText)}`);
                    router();
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
            history.pushState({}, '', '?app=История%20изменений');
            router();
            return;
        }
    });

    // Слушаем событие `popstate` (нажатие кнопок "назад/вперед" в браузере)
    window.addEventListener('popstate', router);

    // Первоначальный запуск роутера
    router();
});
