// js/main.js

import { renderChangelog } from './utils/changelog.js';
import { getAppList } from './utils/appList.js';

// --- Глобальные переменные и элементы UI ---
const contentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

let currentAppCleanup = () => {};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

/**
 * Очищает предыдущее приложение и загружает новое.
 * @param {string} appName - Имя модуля приложения (например, 'stopwatch').
 */
async function loadApp(appName) {
    // 1. Выполняем функцию очистки от предыдущего приложения, если она есть
    if (typeof currentAppCleanup === 'function') {
        currentAppCleanup();
    }
    currentAppCleanup = () => {};
    contentArea.innerHTML = '<p class="text-center text-xl animate-pulse">Загрузка...</p>';
    window.scrollTo(0, 0);

    // 2. ***ВАЖНО: Особая обработка для страницы "История изменений"***
    if (appName === 'changelogPage') {
        // Это не обычное приложение, просто рендерим весь список изменений
        contentArea.innerHTML = ''; // Очищаем "Загрузка..."
        renderChangelog(null, null, contentArea); // Рендерим все без лимита
        return; // Завершаем выполнение функции
    }

    // 3. Загружаем стандартное приложение
    try {
        const module = await import(`../apps/${appName}.js`);
        contentArea.innerHTML = module.getHtml();
        if (typeof module.init === 'function') {
            module.init();
        }
        // Сохраняем новую функцию очистки
        currentAppCleanup = module.cleanup || (() => {});
        
        // Рендерим историю изменений для конкретного приложения
        const appData = getAppList().find(app => app.module === appName);
        if (appData) {
            const appHistoryEl = document.createElement('div');
            appHistoryEl.id = 'app-changelog-container';
            appHistoryEl.className = 'mt-8';
            contentArea.appendChild(appHistoryEl);
            renderChangelog(appData.name, null, appHistoryEl);
        }

    } catch (error) {
        console.error(`Ошибка загрузки модуля ${appName}:`, error);
        contentArea.innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение '${appName}'.</p>`;
    }
}

/**
 * Отображает главный экран со списком всех приложений.
 */
function showAppList() {
    if (typeof currentAppCleanup === 'function') {
        currentAppCleanup();
    }
    currentAppCleanup = () => {};
    history.pushState({ page: 'home' }, 'Mini Apps', window.location.pathname);
    
    const apps = getAppList();
    const appLinksHtml = apps.map(app => `
        <a href="?app=${app.module}" data-app-name="${app.module}" class="app-link-card bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
            <span class="text-4xl">${app.icon}</span>
            <div>
                <h3 class="text-xl font-bold">${app.name}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm">${app.description}</p>
            </div>
        </a>
    `).join('');
    
    contentArea.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${appLinksHtml}</div>`;
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---

/**
 * Единый обработчик кликов для навигации по сайту.
 */
document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    // Клик по кнопке "Показать ещё" в истории изменений
    if (e.target.id === 'show-all-changelog-btn') {
        e.preventDefault();
        renderChangelog(null, null, changelogContainer); // Рендер без лимита
        return;
    }

    if (!link) return; // Если клик был не по ссылке, выходим

    // Клик по ссылке с data-app-name (карточка приложения или ссылка в истории)
    const appName = link.dataset.appName;
    if (appName) {
        e.preventDefault(); // Отменяем стандартный переход по ссылке
        // Обновляем историю браузера для SPA
        history.pushState({ app: appName }, `App - ${appName}`, `?app=${appName}`);
        loadApp(appName);
    } else if (link.id === 'home-link') {
        // Клик по главной ссылке "Mini Apps"
        e.preventDefault();
        showAppList();
    }
});

/**
 * Обработка кнопок "вперед/назад" в браузере.
 */
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.app) {
        loadApp(e.state.app);
    } else {
        showAppList();
    }
});

/**
 * Переключатель темы.
 */
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    sunIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('hidden', !isDark);
});

// --- ИНИЦИАЛИЗАЦИЯ ---

/**
 * Первоначальная настройка при загрузке страницы.
 */
function init() {
    // Установка темы
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    // Определяем, что загружать: главную страницу или конкретное приложение
    const urlParams = new URLSearchParams(window.location.search);
    const appParam = urlParams.get('app');
    const appExists = getAppList().some(app => app.module === appParam);

    if (appParam && appExists) {
        loadApp(appParam);
    } else {
        showAppList();
    }

    // Рендерим нижний блок истории изменений с лимитом
    renderChangelog(null, 10, changelogContainer);
}

// Запускаем всё!
init();```

После замены этого файла всё должно заработать как положено. Приложения будут открываться, а навигация — работать корректно. Ещё раз приношу извинения за допущенную ошибку.
