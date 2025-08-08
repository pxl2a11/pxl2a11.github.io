// js/main.js

import { renderChangelog } from './utils/changelog.js';
import { getAppList } from './utils/appList.js';

// --- Глобальные элементы ---
const contentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const homeLink = document.getElementById('home-link');

let currentAppCleanup = () => {};

// --- Роутинг и загрузка контента ---

/**
 * Определяет, какой контент загружать на основе URL.
 */
function router() {
    const params = new URLSearchParams(window.location.search);
    const appName = params.get('app');
    
    if (appName && getAppList().some(app => app.module === appName)) {
        loadApp(appName);
    } else {
        showAppList();
    }
}

/**
 * Отображает список всех приложений на главной странице.
 */
function showAppList() {
    if (typeof currentAppCleanup === 'function') currentAppCleanup();
    currentAppCleanup = () => {};

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

/**
 * Загружает и отображает конкретное приложение.
 * @param {string} appName Имя модуля приложения.
 */
async function loadApp(appName) {
    if (typeof currentAppCleanup === 'function') currentAppCleanup();
    currentAppCleanup = () => {};
    contentArea.innerHTML = `<p class="text-center text-xl animate-pulse">Загрузка...</p>`;
    window.scrollTo(0, 0);

    if (appName === 'changelogPage') {
        contentArea.innerHTML = '';
        renderChangelog(null, null, contentArea);
        return;
    }

    try {
        // ИСПРАВЛЕННЫЙ ПУТЬ: './../apps/' - самый надежный относительный путь
        // от js/main.js до папки apps, которая лежит в корне.
        const module = await import(`./../apps/${appName}.js`);
        
        contentArea.innerHTML = module.getHtml();
        if (typeof module.init === 'function') module.init();
        currentAppCleanup = module.cleanup || (() => {});
        
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
        contentArea.innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение. Откройте консоль (F12) для подробностей.</p>`;
    }
}

// --- Обработчики событий ---

// Обработка кликов для SPA-навигации
document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    if (e.target.closest('#show-all-changelog-btn')) {
        e.preventDefault();
        renderChangelog(null, null, changelogContainer);
        return;
    }
    
    const appName = link.dataset.appName;
    if (appName) {
        e.preventDefault();
        history.pushState({ app: appName }, '', `?app=${appName}`);
        router();
    } else if (link.id === 'home-link') {
        e.preventDefault();
        history.pushState({ page: 'home' }, '', window.location.pathname.split('?')[0]);
        router();
    }
});

// Обработка кнопок "вперед/назад" браузера
window.addEventListener('popstate', router);

// Переключатель темы
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    sunIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('hidden', !isDark);
});

// --- Инициализация ---
function init() {
    // Установка темы при загрузке
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
    
    // Запускаем роутер для отображения нужного контента
    router();
    
    // Отображаем нижний блок истории изменений с лимитом
    renderChangelog(null, 10, changelogContainer);
}

// Запускаем приложение
init();
