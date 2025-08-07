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
let activeAppModule = null; // Хранит текущий активный модуль для очистки

// --- Шаблоны HTML ---
const homeScreenHtml = `
    <div id="home-screen">
        <div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Ссылки на приложения теперь содержат URL-параметры -->
            <a href="?app=Скорость%20интернета" class="app-item" data-name="Скорость интернета">...</a>
            <a href="?app=Радио" class="app-item" data-name="Радио">...</a>
            <!-- И так далее для всех приложений. Скопируйте содержимое #apps-container из вашего HTML -->
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
        dynamicContentArea.innerHTML = appScreenHtml; // Вставляем скелет страницы приложения
        document.getElementById('app-screen').classList.remove('hidden');
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
        } catch (error) {
            console.error(`Ошибка загрузки модуля для "${appName}":`, error);
            document.getElementById('app-content-container').innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение.</p>`;
        }
    } else {
        // --- Загрузка домашней страницы ---
        dynamicContentArea.innerHTML = homeScreenHtml; // Загружаем контент домашнего экрана
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        // Здесь вы можете вставить код для отрисовки changelog на главной странице
    }
     // Восстанавливаем обработчики событий для ссылок после перерисовки
    setupNavigationEvents();
}

// --- Обработка навигации ---
function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        // Находим ближайшую ссылку-родителя, чтобы клики по иконкам тоже работали
        const link = e.target.closest('a');
        if (!link) return;

        const url = new URL(link.href);
        // Если это внутренняя ссылка (начинается с ? или это ссылка на главную)
        if (url.origin === window.location.origin && (url.search.startsWith('?app=') || url.pathname === '/')) {
            e.preventDefault(); // Предотвращаем полную перезагрузку страницы
            history.pushState({}, '', link.href); // Меняем URL в строке браузера
            router(); // Вызываем наш роутер для смены контента
        }
    });
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    // Код для переключения темы (остается здесь)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden'); moonIcon.classList.remove('hidden');
    }
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        sunIcon.classList.toggle('hidden', isDark);
        moonIcon.classList.toggle('hidden', !isDark);
    });

    // Код для поиска (остается здесь, но навигация изменена)
    const searchInput = document.getElementById('search-input');
    // ... ваш код поиска, но `onclick` должен вызывать `history.pushState` и `router()`
    
    // Слушаем событие `popstate` (нажатие кнопок "назад/вперед" в браузере)
    window.addEventListener('popstate', router);

    // Первоначальный запуск роутера
    router();
});
