import { renderChangelog, getChangelogData } from './utils/changelog.js';

// --- 1Сопоставление имен приложений с файлами модулей ---
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

// --- Категории для приложений (используются для поиска похожих) ---
const appCategories = {
    'speedTest': 'Инструменты', 'radio': 'Мультимедиа', 'notesAndTasks': 'Органайзер',
    'soundAndMicTest': 'Инструменты', 'audioCompressor': 'Мультимедиа', 'myIp': 'Инструменты',
    'passwordGenerator': 'Безопасность', 'percentageCalculator': 'Калькуляторы', 'timer': 'Инструменты',
    'fortuneWheel': 'Развлечения', 'magicBall': 'Развлечения', 'ticTacToe': 'Игры',
    'minesweeper': 'Игры', 'stopwatch': 'Инструменты', 'randomColor': 'Дизайн',
    'numberGenerator': 'Инструменты', 'qrCodeGenerator': 'Инструменты', 'emojiAndSymbols': 'Текст',
    'unitConverter': 'Калькуляторы', 'dateCalculator': 'Калькуляторы', 'bmiCalculator': 'Здоровье',
    'wordCounter': 'Текст', 'qrScanner': 'Инструменты', 'piano': 'Мультимедиа', 'changelogPage': 'Системное'
};

// --- Рейтинг популярности (условный) ---
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94,
    'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78,
    'bmiCalculator': 75, 'wordCounter': 82, 'timer': 70, 'stopwatch': 68,
    'audioCompressor': 65, 'percentageCalculator': 66, 'dateCalculator': 64,
    'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71,
    'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55,
    'numberGenerator': 54, 'changelogPage': 10
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
const appCardElements = new Map();

// --- Шаблоны HTML ---
const homeScreenHtml = `<div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"></div>`;
const appScreenHtml = `
    <div id="app-screen" class="hidden">
        <div class="flex items-start mb-6">
            <a href="/" id="back-button" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><svg class="h-6 w-6 text-gray-900 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></a>
            <h2 id="app-title" class="text-2xl font-bold ml-4"></h2>
        </div>
        <div id="app-content-container" class="mt-4"></div>
        <div id="similar-apps-container" class="mt-12"></div>
        <div id="app-changelog-container" class="mt-8"></div>
    </div>`;

// --- Функции рендеринга ---

function populateAppCardMap() {
    if (appCardElements.size > 0) return;
    const template = document.getElementById('all-apps-template');
    if (!template) return;
    template.content.querySelectorAll('.app-item').forEach(card => {
        const moduleName = card.dataset.module;
        if (moduleName) {
            appCardElements.set(moduleName, card);
        }
    });
}

function renderSimilarApps(currentModule, container) {
    const currentCategory = appCategories[currentModule];
    if (!currentCategory || currentCategory === 'Системное') {
        container.classList.add('hidden');
        return;
    }

    // Находим все модули в той же категории, исключая текущий
    let similarModules = Object.keys(appCategories).filter(
        module => appCategories[module] === currentCategory && module !== currentModule
    );

    // Сортируем их по популярности (от большего к меньшему)
    similarModules.sort((a, b) => (appPopularity[b] || 0) - (appPopularity[a] || 0));

    // Ограничиваем до 3-х самых популярных
    const topSimilar = similarModules.slice(0, 3);

    if (topSimilar.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.innerHTML = `<h3 class="text-xl font-bold mb-4">Похожие приложения</h3>`;
    const grid = document.createElement('div');
    grid.className = 'similar-apps-grid';

    topSimilar.forEach(module => {
        const card = appCardElements.get(module);
        if (card) {
            grid.appendChild(card.cloneNode(true));
        }
    });

    container.appendChild(grid);
    container.classList.remove('hidden');
}

// --- Основная функция-роутер ---
async function router() {
    // 1. Очищаем предыдущее приложение
    if (activeAppModule && typeof activeAppModule.cleanup === 'function') {
        activeAppModule.cleanup();
        activeAppModule = null;
    }
    dynamicContentArea.innerHTML = '';

    // 2. Определяем, какое приложение показать
    const params = new URLSearchParams(window.location.search);
    const moduleName = params.get('app');
    const appName = moduleFileToAppName[moduleName]; 
    const filterContainer = document.getElementById('filter-container');

    if (appName) {
        // --- Загрузка страницы приложения ---
        if (searchInput) searchInput.value = '';
        if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
        filterContainer?.classList.add('hidden');
        
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
            if (typeof module.getHtml === 'function') { appContentContainer.innerHTML = module.getHtml(); }
            if (typeof module.init === 'function') { module.init(); }

            const appChangelogContainer = document.getElementById('app-changelog-container');
            const similarAppsContainer = document.getElementById('similar-apps-container');
            
            renderSimilarApps(moduleName, similarAppsContainer);
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
        filterContainer?.classList.remove('hidden');
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        
        setupFilters(); // Устанавливаем фильтры (которые сами отрисуют контент по умолчанию)
        setupSearch();
        renderChangelog(null, 5, changelogContainer);
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
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const appsContainer = document.getElementById('apps-container');
        if (!appsContainer) return;

        const suggestions = [];
        const allApps = appsContainer.querySelectorAll('.app-item');
        
        allApps.forEach(app => {
            const appName = app.dataset.name.toLowerCase();
            const moduleName = app.dataset.module;
            const metadata = appSearchMetadata[moduleName] || { keywords: [], hashtags: [] };
            const searchCorpus = [appName, ...metadata.keywords].join(' ');
            const isVisible = searchCorpus.includes(searchTerm);
            
            app.style.display = isVisible ? 'flex' : 'none';

            if (isVisible && searchTerm.length > 0) {
                suggestions.push({
                    name: app.dataset.name, module: moduleName,
                    hashtags: metadata.hashtags || []
                });
            }
        });

        suggestionsContainer.innerHTML = '';
        if (searchTerm.length > 0 && suggestions.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            suggestions.slice(0, 7).forEach(suggestion => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion-item flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg';
                suggestionEl.innerHTML = `<span class="suggestion-name">${suggestion.name}</span><span class="suggestion-hashtags text-gray-500 dark:text-gray-400 text-sm ml-4">${suggestion.hashtags.join(' ')}</span>`;
                suggestionEl.addEventListener('click', () => {
                    if (suggestion.module) {
                        history.pushState({}, '', `?app=${suggestion.module}`);
                        router();
                    }
                });
                suggestionsContainer.appendChild(suggestionEl);
            });
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    });
}

// --- Логика фильтров ---
function setupFilters() {
    const filterContainer = document.getElementById('filter-container');
    const appsContainer = document.getElementById('apps-container');
    if (!filterContainer || !appsContainer) return;

    let originalOrder = Array.from(appCardElements.values());

    const renderApps = (appElements) => {
        appsContainer.innerHTML = '';
        appElements.forEach(app => {
            appsContainer.appendChild(app.cloneNode(true));
        });
    };

    const applyFilter = () => {
        const activeFilter = filterContainer.querySelector('.active')?.dataset.sort || 'default';
        let sortedApps;

        if (activeFilter === 'popular') {
            sortedApps = [...originalOrder].sort((a, b) => {
                const popA = appPopularity[a.dataset.module] || 0;
                const popB = appPopularity[b.dataset.module] || 0;
                return popB - popA;
            });
        } else if (activeFilter === 'new') {
            sortedApps = [...originalOrder].reverse();
        } else { // default
            sortedApps = originalOrder;
        }
        renderApps(sortedApps);
        // После отрисовки нужно сбросить поиск, если он был
        if (searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    
    filterContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button || button.classList.contains('active')) return;

        filterContainer.querySelector('.active')?.classList.remove('active');
        button.classList.add('active');
        applyFilter();
    });

    // Первоначальная отрисовка
    applyFilter();
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    
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

    window.addEventListener('popstate', router);
    setupNavigationEvents();
    router();
});
