// js//main.js

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
    
    // Проверяем, что запрашиваемое приложение существует в нашем списке
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

    // Особая обработка для "виртуальной" страницы истории изменений
    if (appName === 'changelogPage') {
        contentArea.innerHTML = '';
        renderChangelog(null, null, contentArea);
        return;
    }

    try {
        // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ ---
        // Этот путь означает: "из текущей папки (js) подняться на один уровень вверх (в корень проекта),
        // а затем зайти в папку apps". Это самый правильный и надежный относительный путь.
        const module = await import(`../apps/${appName}.js`);
        
        contentArea.innerHTML = module.getHtml();
        if (typeof module.init === 'function') module.init();
        currentAppCleanup = module.cleanup || (() => {});
        
        // Отображение истории для конкретного приложения
        const appData = getAppList().find(app => app.module === appName);
        if (appData) {
            const appHistoryEl = document.createElement('div');
            appHistoryEl.id = 'app-changelog-container';
            appHistoryEl.className = 'mt-8';
            contentArea.appendChild(appHistoryEl);
            renderChangelog(appData.name, null, appHistoryEl);
        }
    } catch (error) {
        console.error(`Ошибка загрузки модуля '${appName}'. Запрашиваемый путь: ../apps/${appName}.js`, error);
        contentArea.innerHTML = `<p class="text-center text-red-500 font-semibold">Не удалось загрузить приложение. Откройте консоль (F12) для подробностей.</p>`;
    }
}

// --- Обработчики событий ---

// Обработка кликов для SPA-навигации
document.body.addEventListener('click', (e) => {
    // Находим ближайший кликабельный элемент (кнопку или ссылку)
    const button = e.target.closest('button');
    const link = e.target.closest('a');

    // Клик по кнопке "Показать ещё"
    if (button && button.id === 'show-all-changelog-btn') {
        e.preventDefault();
        renderChangelog(null, null, changelogContainer);
        return;
    }
    
    if (!link) return; // Если клик был не по ссылке, ничего не делаем

    // Клик по ссылке на приложение
    const appName = link.dataset.appName;
    if (appName) {
        e.preventDefault();
        // Обновляем URL в адресной строке и внутреннее состояние
        history.pushState({ app: appName }, '', `?app=${appName}`);
        router(); // Вызываем роутер, который решит, что загружать
    } else if (link.id === 'home-link') {
        // Клик по главной ссылке
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
    
    // Запускаем роутер для отображения нужного контента при первой загрузке
    router();
    
    // Отображаем нижний блок истории изменений с лимитом
    renderChangelog(null, 10, changelogContainer);
}

// Запускаем приложение
init();
