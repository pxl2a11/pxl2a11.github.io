// js/main.js

import { renderChangelog, getChangelogData } from './utils/changelog.js';
import { appNameToModuleFile, getAppList } from './utils/appList.js';

// --- ГЛАВНЫЙ КОНТЕЙНЕР И ЭЛЕМЕНТЫ UI ---
const contentArea = document.getElementById('dynamic-content-area');
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const homeLink = document.getElementById('home-link');
const changelogContainer = document.getElementById('changelog-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

let currentAppCleanup = () => {};

// --- РОУТИНГ И ЗАГРУЗКА ПРИЛОЖЕНИЙ ---

async function loadApp(appName) {
    if (currentAppCleanup) {
        currentAppCleanup();
        currentAppCleanup = () => {};
    }

    contentArea.innerHTML = '<p class="text-center text-xl">Загрузка...</p>';
    
    try {
        const module = await import(`../apps/${appName}.js`);
        contentArea.innerHTML = module.getHtml();
        if (module.init) {
            module.init();
        }
        currentAppCleanup = module.cleanup || (() => {});
        // Добавляем блок с историей изменений для конкретного приложения
        const appHistoryEl = document.createElement('div');
        appHistoryEl.id = 'app-changelog-container';
        appHistoryEl.className = 'mt-8';
        contentArea.appendChild(appHistoryEl);
        renderChangelog(Object.keys(appNameToModuleFile).find(key => appNameToModuleFile[key] === appName), null, appHistoryEl);

    } catch (error) {
        console.error(`Ошибка загрузки модуля ${appName}:`, error);
        contentArea.innerHTML = '<p class="text-center text-red-500">Не удалось загрузить приложение.</p>';
        showAppList();
    }
}

// --- СПИСОК ПРИЛОЖЕНИЙ (ГЛАВНАЯ СТРАНИЦА) ---

function showAppList() {
    if (currentAppCleanup) {
        currentAppCleanup();
        currentAppCleanup = () => {};
    }
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

// **ИСПРАВЛЕННЫЙ ОБРАБОТЧИК КЛИКОВ ДЛЯ ВСЕЙ СТРАНИЦЫ**
document.body.addEventListener('click', (e) => {
    // Находим ближайшую ссылку, по которой кликнули
    const link = e.target.closest('a');
    if (!link) return; // Если клик был не по ссылке, выходим

    const appName = link.dataset.appName;

    // Проверяем, является ли ссылка на приложение и не открывается ли она в новой вкладке
    if (appName && link.target !== '_blank') {
        e.preventDefault(); // Предотвращаем стандартный переход
        history.pushState({ app: appName }, `App - ${appName}`, `?app=${appName}`);
        loadApp(appName);
    }

    // **НОВЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ "ПОКАЗАТЬ ЕЩЁ"**
    if (e.target.id === 'show-all-changelog-btn') {
        e.preventDefault();
        // Перерисовываем историю, но без лимита (limit = null)
        renderChangelog(null, null, changelogContainer);
    }
});

// Навигация по истории браузера
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.app) {
        loadApp(e.state.app);
    } else {
        showAppList();
    }
});

// --- ПОИСК ---
// (Логика поиска остается без изменений, если она у вас есть)


// --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
} else {
    document.documentElement.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    sunIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('hidden', !isDark);
});

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const app = urlParams.get('app');

    if (app && appNameToModuleFile[Object.keys(appNameToModuleFile).find(key => appNameToModuleFile[key] === app)]) {
        loadApp(app);
    } else {
        showAppList();
    }

    // Рендерим историю изменений с лимитом по умолчанию
    renderChangelog(null, 10, changelogContainer);
}

init();
