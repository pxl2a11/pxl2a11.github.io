//46 js/main.js

import { renderChangelog } from './changelog.js';
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { fetchUserAccountData, clearUserData, getUserData, saveUserData, setOnDataLoaded } from './dataManager.js';

// --- Сопоставление имен приложений и метаданные ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest', 'Радио': 'radio', 'Заметки и задачи': 'notesAndTasks', 'Тест звука и микрофона': 'soundAndMicTest', 
    'Редактор аудио': 'audioEditor',
    'Мой IP': 'myIp', 'Генератор паролей': 'passwordGenerator', 'Процентный калькулятор': 'percentageCalculator', 'Таймер': 'timer', 'Колесо фортуны': 'fortuneWheel', 'Шар предсказаний': 'magicBall', 'Крестики-нолики': 'ticTacToe', 'Сапер': 'minesweeper', 'Секундомер': 'stopwatch', 'Случайный цвет': 'randomColor', 'Генератор чисел': 'numberGenerator', 'Генератор QR-кодов': 'qrCodeGenerator', 'Эмодзи и символы': 'emojiAndSymbols', 'Конвертер величин': 'unitConverter', 'Калькулятор дат': 'dateCalculator', 'Калькулятор ИМТ': 'bmiCalculator', 'Сканер QR-кодов': 'qrScanner', 'Пианино': 'piano', 'История изменений': 'changelogPage', 'Конвертер регистра': 'caseConverter', 'Конвертер цветов': 'colorConverter', 'Игра на память': 'memoryGame', 'Редактор изображений': 'imageEditor', 'Транслитерация текста': 'textTranslit', 'Калькулятор валют': 'currencyCalculator', 'Змейка': 'snakeGame', 'Конвертер часовых поясов': 'timezoneConverter', 'Текст в речь': 'textToSpeech', 'Камень, ножницы, бумага': 'rockPaperScissors', 'Судоку': 'sudoku', 'Архиватор файлов (ZIP)': 'zipArchiver', '2048': 'game2048', 'Генератор штрих-кодов': 'barcodeGenerator', 'Диктофон': 'voiceRecorder', 
    'Генератор каркаса сайта': 'siteSkeletonGenerator',
    'Тест мыши': 'mouseTester',
    'Тест клавиатуры': 'keyboardTester',
    'Графический редактор': 'drawingPad',
    'Сравнение текста': 'textDiffTool',
    'Генератор favicon': 'faviconGenerator',
    'Анализатор текста': 'textAnalyzer',
    'Калькулятор кредита': 'loanCalculator',
    'Тест скорости печати': 'typingTest',
    'Запись экрана': 'screenRecorder',
    'Flappy Bird': 'flappyBird',
    'Виртуальный кубик': 'virtualDice',
    'Калькулятор калорий': 'calorieCalculator',
    'Калькулятор': 'calculator',
    'ТВ онлайн': 'onlineTv',
    'Markdown Редактор': 'markdownEditor',
    'Тетрис': 'tetris',
    'Проигрыватель аудиокниг': 'audiobookPlayer',
    "Pomodoro-таймер": "pomodoroTimer",
    "Кодировщик Base64": "base64Converter",
    "Таблица Менделеева": "periodicTable",
    'Морской бой': 'battleship',
    'Метроном': 'metronome'
};
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94, 'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78, 'bmiCalculator': 75, 'timer': 70, 'stopwatch': 68, 
    'audioEditor': 65, 
    'percentageCalculator': 66, 'dateCalculator': 64, 'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71, 'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55, 'numberGenerator': 54, 'changelogPage': 10, 'imageEditor': 93, 'colorConverter': 87, 'memoryGame': 83, 'caseConverter': 76, 'currencyCalculator': 86, 'textTranslit': 72, 'snakeGame': 74, 'timezoneConverter': 84, 'textToSpeech': 73, 'rockPaperScissors': 67, 'sudoku': 80, 'zipArchiver': 88, 'game2048': 79, 'barcodeGenerator': 84, 'voiceRecorder': 82, 'siteSkeletonGenerator': 78,
    'mouseTester': 75,
    'keyboardTester': 76,
    'drawingPad': 80,
    'textDiffTool': 70,
    'faviconGenerator': 85,
    'textAnalyzer': 82, // Популярность объединена
    'loanCalculator': 80,
    'typingTest': 88,
    'Recorder': 90,
    'flappyBird': 78,
    'virtualDice': 70,
    'calorieCalculator': 80,
    'calculator': 98,
    'onlineTv': 90,
    'markdownEditor': 85,
    'tetris': 96,
    'audiobookPlayer': 89,
    'pomodoroTimer': 85,
    'base64Converter': 78,
    'periodicTable': 88,
    'battleship': 92,
    'metronome': 75,
};
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] }, 
    'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] }, 
    'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] }, 
    'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] }, 
    'audioEditor': { keywords: ['редактор', 'аудио', 'mp3', 'нормализация', 'сжатие', 'громкость'], hashtags: ['#audio', '#tools'] }, 
    'myIp': { keywords: ['ip', 'адрес', 'айпи', 'сеть'], hashtags: ['#network', '#tools'] }, 
    'passwordGenerator': { keywords: ['пароль', 'безопасность', 'создать', 'надежный'], hashtags: ['#security', '#tools'] }, 
    'percentageCalculator': { keywords: ['проценты', 'вычислить', 'доля'], hashtags: ['#math', '#calculator'] }, 
    'timer': { keywords: ['countdown', 'отсчет', 'время'], hashtags: ['#time', '#tools'] }, 
    'fortuneWheel': { keywords: ['рулетка', 'случайный', 'выбор', 'жребий'], hashtags: ['#random', '#game'] }, 
    'magicBall': { keywords: ['предсказание', 'ответ', 'восьмерка', 'да нет'], hashtags: ['#fun', '#game'] }, 
    'ticTacToe': { keywords: ['игра', 'крестики', 'нолики', 'вдвоем'], hashtags: ['#game'] }, 
    'minesweeper': { keywords: ['игра', 'мины', 'головоломка', 'логика'], hashtags: ['#game', '#logic'] }, 
    'stopwatch': { keywords: ['время', 'хронометр', 'измерить'], hashtags: ['#time', '#tools'] }, 
    'randomColor': { keywords: ['цвет', 'случайный', 'палитра', 'дизайн', 'hex'], hashtags: ['#design', '#random', '#color'] }, 
    'numberGenerator': { keywords: ['случайное', 'число', 'рандом', 'выбор'], hashtags: ['#random', '#math'] }, 
    'qrCodeGenerator': { keywords: ['qr', 'код', 'куар', 'ссылка'], hashtags: ['#tools', '#generator'] }, 
    'emojiAndSymbols': { keywords: ['эмодзи', 'символы', 'скопировать', 'смайлик'], hashtags: ['#text', '#tools'] }, 
    'unitConverter': { keywords: ['конвертер', 'единицы', 'измерения', 'перевести'], hashtags: ['#converter', '#math'] }, 
    'dateCalculator': { keywords: ['дата', 'дни', 'календарь', 'разница'], hashtags: ['#time', '#calculator'] }, 
    'bmiCalculator': { keywords: ['имт', 'вес', 'рост', 'здоровье', 'индекс массы тела'], hashtags: ['#health', '#calculator'] }, 
    'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] }, 
    'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] }, 
    'caseConverter': { keywords: ['конвертер', 'регистр', 'текст', 'верхний', 'нижний', 'заглавные', 'буквы', 'case'], hashtags: ['#text', '#tools'] }, 
    'colorConverter': { keywords: ['конвертер', 'цвет', 'hex', 'rgb', 'hsl', 'палитра', 'код цвета'], hashtags: ['#color', '#design', '#converter'] }, 
    'memoryGame': { keywords: ['игра', 'память', 'карточки', 'пары', 'тренировка', 'запомнить'], hashtags: ['#game', '#fun', '#logic'] }, 
    'textTranslit': { keywords: ['транслит', 'латиница', 'кириллица', 'текст', 'перевод', 'cyrillic', 'latin'], hashtags: ['#text', '#tools'] }, 
    'currencyCalculator': { keywords: ['валюта', 'курс', 'доллар', 'евро', 'рубль', 'конвертер', 'обмен'], hashtags: ['#finance', '#calculator', '#converter'] }, 
    'snakeGame': { keywords: ['игра', 'змейка', 'классика', 'аркада', 'snake'], hashtags: ['#game', '#fun'] },
    'timezoneConverter': { keywords: ['время', 'часовой пояс', 'конвертер', 'utc', 'gmt', 'разница во времени', 'timezone'], hashtags: ['#time', '#converter', '#tools'] },
    'textToSpeech': { keywords: ['голос', 'озвучка', 'читать', 'синтез', 'речи', 'tts'], hashtags: ['#audio', '#tools'] },
    'rockPaperScissors': { keywords: ['игра', 'камень', 'ножницы', 'бумага', 'цу-е-фа'], hashtags: ['#game', '#fun'] },
    'sudoku': { keywords: ['игра', 'головоломка', 'цифры', 'логика', 'судоку'], hashtags: ['#game', '#logic'] },
    'zipArchiver': { keywords: ['zip', 'архив', 'архиватор', 'сжать', 'распаковать', 'файлы', 'папка'], hashtags: ['#tools', '#files'] },
    'game2048': { keywords: ['игра', 'головоломка', 'цифры', '2048', 'логика'], hashtags: ['#game', '#logic'] },
    'barcodeGenerator': { keywords: ['штрих-код', 'ean', 'code128', 'создать', 'генератор', 'товар'], hashtags: ['#tools', '#generator'] },
    'voiceRecorder': { keywords: ['диктофон', 'запись', 'голос', 'аудио', 'микрофон', 'записать', 'record'], hashtags: ['#audio', '#tools'] },
    'siteSkeletonGenerator': { keywords: ['каркас', 'структура', 'сайт', 'json', 'генератор', 'zip', 'архив'], hashtags: ['#tools', '#generator', '#webdev'] },
    'mouseTester': { keywords: ['мышь', 'мышка', 'кнопки', 'колесико', 'проверка', 'клик', 'scroll', 'mouse', 'test'], hashtags: ['#tools', '#hardware'] },
    'keyboardTester': { keywords: ['клавиатура', 'клавиши', 'проверка', 'нажатие', 'печать', 'keyboard', 'test'], hashtags: ['#tools', '#hardware'] },
    'drawingPad': { keywords: ['рисование', 'редактор', 'холст', 'кисть', 'paint', 'draw', 'графика'], hashtags: ['#fun', '#design', '#tools'] },
    'textDiffTool': { keywords: ['сравнение', 'текст', 'различия', 'diff', 'код'], hashtags: ['#text', '#tools', '#webdev'] },
    'faviconGenerator': { keywords: ['favicon', 'иконка', 'сайт', 'генератор', 'png', 'ico'], hashtags: ['#image', '#tools', '#webdev'] },
    'textAnalyzer': { keywords: ['анализ', 'статистика', 'текст', 'слова', 'ключевые', 'частота', 'счетчик', 'символы', 'подсчет'], hashtags: ['#text', '#tools'] },
    'loanCalculator': { keywords: ['кредит', 'ипотека', 'калькулятор', 'платеж', 'проценты', 'финансы'], hashtags: ['#finance', '#calculator'] },
    'typingTest': { keywords: ['печать', 'скорость', 'тест', 'клавиатура', 'wpm', 'набор', 'текста'], hashtags: ['#tools', '#fun'] },
    'Recorder': { keywords: ['запись', 'экрана', 'видео', 'демонстрация', 'cast', 'record'], hashtags: ['#tools', '#video'] },
    'flappyBird': { keywords: ['игра', 'птица', 'трубы', 'аркада', 'flappy', 'bird'], hashtags: ['#game', '#fun'] },
    'virtualDice': { keywords: ['кубик', 'кости', 'dnd', 'dice', 'roll', 'жребий', 'случайность', 'd4', 'd6', 'd20'], hashtags: ['#game', '#fun', '#random'] },
    'calorieCalculator': { keywords: ['калории', 'бжу', 'диета', 'похудение', 'питание', 'норма', 'расчет'], hashtags: ['#health', '#calculator'] },
    'calculator': { keywords: ['калькулятор', 'вычисления', 'математика', 'сложение', 'умножение', 'calc'], hashtags: ['#math', '#tools', '#calculator'] },
    'imageEditor': { keywords: ['редактор', 'изображение', 'картинка', 'фото', 'изменить', 'размер', 'конвертер', 'формат', 'png', 'jpg', 'webp', 'ресайз', 'resize', 'обработка'], hashtags: ['#image', '#tools'] },
    'onlineTv': { keywords: ['тв', 'телевизор', 'каналы', 'смотреть', 'онлайн', 'трансляция', 'tv', 'online'], hashtags: ['#entertainment', '#video'] },
    'markdownEditor': { keywords: ['markdown', 'редактор', 'md', 'текст', 'разметка', 'html', 'форматирование'], hashtags: ['#text', '#tools', '#webdev'] },
    'tetris': { keywords: ['тетрис', 'игра', 'блоки', 'головоломка', 'классика', 'tetris'], hashtags: ['#game', '#fun', '#logic'] },
    'audiobookPlayer': { keywords: ['аудиокнига', 'книга', 'слушать', 'плеер', 'проигрыватель', 'аудио', 'главы', 'закладки', 'audiobook'], hashtags: ['#audio', '#entertainment', '#tools'] },
    'pomodoroTimer': { keywords: ['помодоро', 'таймер', 'фокус', 'работа', 'учеба', 'pomodoro'], hashtags: ['#time', '#tools', '#productivity'] },
    'base64Converter': { keywords: ['base64', 'кодировщик', 'декодировщик', 'шифрование', 'btoa', 'atob', 'текст', 'данные', 'картинка', 'изображение', 'фото', 'data url'], hashtags: ['#tools', '#text', '#webdev', '#image'] },
    'periodicTable': { keywords: ['элементы', 'химия', 'атом', 'менделеев', 'таблица', 'вещества', 'наука'], hashtags: ['#science', '#tools', '#education'] },
    'battleship': { keywords: ['игра', 'корабли', 'флот', 'стрелять', 'бой', 'battleship', 'sea battle'], hashtags: ['#game', '#logic', '#fun'] },
    'metronome': { keywords: ['метроном', 'темп', 'ритм', 'музыка', 'bpm', 'уд/мин'], hashtags: ['#music', '#tools'] },
};
const moduleFileToAppName = Object.fromEntries(
  Object.entries(appNameToModuleFile).map(([name, file]) => [file, name])
);

const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
let activeAppModule = null; 
const appCardElements = new Map();
let allAppCards = [];
let lastActiveFilter = 'default';

const homeScreenHtml = `
    <div class="relative">
        <button id="sort-my-apps-btn" class="filter-btn hidden absolute -top-14 right-0 z-10">Переместить</button>
        <div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"></div>
    </div>
`;
const appScreenHtml = `
    <div id="app-screen" class="w-full h-full p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg transition-colors flex flex-col">
        <div class="flex items-center justify-between mb-6 flex-shrink-0">
            <div class="flex items-center">
                <h2 id="app-title" class="text-2xl font-bold"></h2>
            </div>
            <button id="add-to-my-apps-app-view-btn" class="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                <img src="img/plusapps.svg" class="plus-icon h-5 w-5" alt="Добавить">
                <img src="img/minusapps.svg" class="cross-icon h-5 w-5 hidden" alt="Удалить">
                <span class="btn-text"></span>
            </button>
        </div>
        <div id="app-content-container" class="mt-4 flex-grow"></div>
        <div id="similar-apps-container" class="mt-12 flex-shrink-0"></div>
        <div id="app-changelog-container" class="mt-8 flex-shrink-0"></div>
    </div>`;

let sortableInstance = null;
let isSortingMode = false;

// ... (все функции до populateAppCardMap без изменений)

function populateAppCardMap() {
    if (appCardElements.size > 0) return;
    const template = document.getElementById('all-apps-template');
    if (!template) { console.error('Template with app cards not found!'); return; }
    template.content.querySelectorAll('.app-item').forEach(card => {
        const moduleName = card.dataset.module;
        if (moduleName) appCardElements.set(moduleName, card);
    });
    allAppCards = Array.from(appCardElements.values());
}

// ... (все функции до renderSidebar без изменений)

/**
 * Рендерит плоский список отфильтрованных приложений в сайдбаре.
 * @param {string} searchTerm - Поисковый запрос.
 * @param {string|null} currentAppModule - Модуль текущего открытого приложения для подсветки.
 */
async function renderSidebarSearchResults(searchTerm, currentAppModule) {
    const sidebarList = document.getElementById('sidebar-app-list');
    if (!sidebarList) return;
    sidebarList.innerHTML = ''; // Очищаем контейнер для нового списка

    allAppCards.forEach(card => {
        const appName = card.dataset.name.toLowerCase();
        const moduleName = card.dataset.module;
        const metadata = appSearchMetadata[moduleName] || { keywords: [] };
        const searchCorpus = [appName, ...metadata.keywords].join(' ');

        if (searchCorpus.includes(searchTerm)) {
            const cardClone = card.cloneNode(true);
            cardClone.classList.toggle('active-app-in-sidebar', moduleName === currentAppModule);
            sidebarList.appendChild(cardClone);
        }
    });
}

/**
 * Рендерит категории-аккордеоны в сайдбаре.
 * @param {string|null} currentAppModule - Модуль текущего открытого приложения для подсветки.
 */
async function renderSidebar(currentAppModule) {
    const sidebarList = document.getElementById('sidebar-app-list');
    const searchInput = document.getElementById('sidebar-search-input');
    if (!sidebarList || !searchInput) return;

    // Сбрасываем поиск при перерендере категорий
    searchInput.value = '';

    const myApps = await getMyApps();
    const allAppsSorted = [...allAppCards].sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
    const popularAppsSorted = [...allAppCards].sort((a, b) => (appPopularity[b.dataset.module] || 0) - (appPopularity[a.dataset.module] || 0));
    const newAppsSorted = [...allAppCards].sort((a, b) => allAppCards.indexOf(b) - allAppCards.indexOf(a));

    const categories = [
        { id: 'my-apps', name: 'Мои приложения', apps: myApps.map(m => appCardElements.get(m)).filter(Boolean), requiresAuth: true },
        { id: 'all', name: 'Все', apps: allAppsSorted, requiresAuth: false },
        { id: 'popular', name: 'Популярные', apps: popularAppsSorted, requiresAuth: false },
        { id: 'new', name: 'Новые', apps: newAppsSorted, requiresAuth: false }
    ];

    sidebarList.innerHTML = '';

    categories.forEach(category => {
        if (category.requiresAuth && !auth.currentUser) return;

        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'sidebar-category';
        categoryContainer.id = `sidebar-category-${category.id}`;

        const header = document.createElement('div');
        header.className = 'sidebar-category-header';
        header.innerHTML = `
            <span class="sidebar-category-name">${category.name}</span>
            <span class="sidebar-category-count">${category.apps.length}</span>
            <svg class="sidebar-category-chevron h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        `;

        const appsContainer = document.createElement('div');
        appsContainer.className = 'sidebar-category-apps';

        category.apps.forEach(appCard => {
            const cardClone = appCard.cloneNode(true);
            cardClone.classList.toggle('active-app-in-sidebar', appCard.dataset.module === currentAppModule);
            appsContainer.appendChild(cardClone);
        });

        categoryContainer.appendChild(header);
        categoryContainer.appendChild(appsContainer);
        sidebarList.appendChild(categoryContainer);

        header.addEventListener('click', () => {
            const isExpanded = categoryContainer.classList.contains('expanded');
            sidebarList.querySelectorAll('.sidebar-category.expanded').forEach(el => {
                if (el !== categoryContainer) el.classList.remove('expanded');
            });
            categoryContainer.classList.toggle('expanded', !isExpanded);
        });
    });

    const defaultCategoryId = auth.currentUser ? 'my-apps' : 'all';
    const defaultCategory = document.getElementById(`sidebar-category-${defaultCategoryId}`);
    if (defaultCategory) {
        defaultCategory.classList.add('expanded');
    }
}

async function router() {
    if (activeAppModule && typeof activeAppModule.cleanup === 'function') {
        activeAppModule.cleanup();
    }
    activeAppModule = null;

    const homeHeaderContent = document.getElementById('home-header-content');
    const changelogContainer = document.getElementById('changelog-container');
    const dynamicContentArea = document.getElementById('dynamic-content-area');

    const params = new URLSearchParams(window.location.search);
    const moduleName = params.get('app');
    const appName = moduleFileToAppName[moduleName];
    
    if (appName) {
        document.body.classList.add('app-view-active');
        if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
        
        dynamicContentArea.classList.remove('max-w-6xl', 'mx-auto');
        dynamicContentArea.classList.add('flex-grow');
        
        dynamicContentArea.innerHTML = appScreenHtml;
        document.getElementById('app-title').textContent = appName;
        document.title = `${appName} | Mini Apps`;

        await renderSidebar(moduleName); // Рендерим аккордеон при заходе в приложение

        try {
            const module = await import(`./apps/${moduleName}.js`);
            activeAppModule = module;
            const appContentContainer = document.getElementById('app-content-container');
            if (typeof module.getHtml === 'function') appContentContainer.innerHTML = module.getHtml();
            if (typeof module.init === 'function') await module.init(appContentContainer);
            await updateAppViewButton(moduleName);
            const appChangelogContainer = document.getElementById('app-changelog-container');
            const similarAppsContainer = document.getElementById('similar-apps-container');
            await renderSimilarApps(moduleName, similarAppsContainer);
            if (appName !== 'История изменений') renderChangelog(appName, null, appChangelogContainer);
        } catch (error) {
            console.error(`Ошибка загрузки модуля для "${appName}" (${moduleName}.js):`, error);
            document.getElementById('app-content-container').innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение.</p>`;
        }
    } else {
        document.body.classList.remove('app-view-active');
        
        homeHeaderContent.classList.remove('hidden');
        changelogContainer.classList.remove('hidden');

        dynamicContentArea.classList.add('max-w-6xl', 'mx-auto');
        dynamicContentArea.classList.remove('flex-grow');

        dynamicContentArea.innerHTML = homeScreenHtml;
        document.title = 'Mini Apps';
        
        setupFilters();
        renderChangelog(null, 3, changelogContainer);
        await applyAppListFilterAndRender();
    }
}

// ... (функции setupNavigationEvents, setupSearch, applyAppListFilterAndRender, setupFilters без изменений)

/**
 * Устанавливает обработчик событий для поиска в сайдбаре.
 */
function setupSidebarSearch() {
    const searchInput = document.getElementById('sidebar-search-input');
    if (!searchInput) return;

    // Чтобы избежать дублирования, удаляем старый обработчик, если он есть
    if (window.sidebarSearchHandler) {
        searchInput.removeEventListener('input', window.sidebarSearchHandler);
    }
    
    // Создаем новый обработчик
    window.sidebarSearchHandler = async () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const params = new URLSearchParams(window.location.search);
        const currentAppModule = params.get('app');

        if (searchTerm.length > 0) {
            // Если есть текст в поиске, показываем плоский список результатов
            await renderSidebarSearchResults(searchTerm, currentAppModule);
        } else {
            // Если поиск пуст, возвращаем вид с категориями
            await renderSidebar(currentAppModule);
        }
    };

    searchInput.addEventListener('input', window.sidebarSearchHandler);
}

document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    setupSearch(); 
    setupSidebarSearch(); // Устанавливаем обработчик поиска в сайдбаре один раз

    document.body.addEventListener('click', e => {
        if (e.target.closest('.sign-out-btn') || e.target.closest('#sign-out-btn')) {
            handleSignOut();
        }
    });

    setupNavigationEvents();
    window.addEventListener('popstate', router);

    // ... (весь оставшийся код в DOMContentLoaded без изменений)

    // --- Управление темой ---
    const themeToggleBtns = [
        document.getElementById('theme-toggle'),
        document.getElementById('sidebar-theme-toggle')
    ];
    const updateThemeIcons = (isDark) => {
        document.querySelectorAll('.sun-icon').forEach(icon => icon.classList.toggle('hidden', isDark));
        document.querySelectorAll('.moon-icon').forEach(icon => icon.classList.toggle('hidden', !isDark));
    };
    const savedTheme = localStorage.getItem('theme');
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    }
    themeToggleBtns.forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons(isDark);
        });
    });

    // --- Управление боковым меню ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const positionBtn = document.getElementById('toggle-sidebar-position-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const settingsContainer = document.getElementById('settings-container');

    let isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    let sidebarPosition = localStorage.getItem('sidebarPosition') || 'left';
    
    const icon_chevron_left = `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>`;
    const icon_chevron_right = `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`;

    const applySidebarState = () => {
        document.body.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
        document.body.classList.toggle('sidebar-on-right', sidebarPosition === 'right');

        if (sidebarPosition === 'left') {
            sidebarToggleBtn.innerHTML = isSidebarCollapsed ? icon_chevron_right : icon_chevron_left;
        } else {
            sidebarToggleBtn.innerHTML = isSidebarCollapsed ? icon_chevron_left : icon_chevron_right;
        }
        sidebarToggleBtn.title = isSidebarCollapsed ? 'Показать меню' : 'Скрыть меню';
    };

    sidebarToggleBtn.addEventListener('click', () => {
        isSidebarCollapsed = !isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        applySidebarState();
    });

    positionBtn.addEventListener('click', () => {
        sidebarPosition = sidebarPosition === 'left' ? 'right' : 'left';
        localStorage.setItem('sidebarPosition', sidebarPosition);
        applySidebarState();
    });
    
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!settingsContainer.contains(e.target)) {
            settingsMenu.classList.add('hidden');
        }
    });

    applySidebarState();


    document.getElementById('changelog-container').addEventListener('click', (e) => {
        if (e.target.id === 'show-all-changelog-btn') {
            e.preventDefault();
            const moduleFile = appNameToModuleFile['История изменений'];
            history.pushState({}, '', `?app=${moduleFile}`);
            router();
            return;
        }
    });

    document.getElementById('dynamic-content-area').addEventListener('click', async e => {
        const addBtn = e.target.closest('.add-to-my-apps-btn');
        if (addBtn) {
            e.preventDefault(); 
            e.stopPropagation();
            if (!auth.currentUser) {
                alert('Пожалуйста, войдите в аккаунт, чтобы добавлять приложения в "Мои приложения".');
                return;
            }
            const appCard = addBtn.closest('.app-item');
            const moduleName = appCard?.dataset.module;
            await toggleMyAppStatus(moduleName);
            return;
        }
        const addBtnAppView = e.target.closest('#add-to-my-apps-app-view-btn');
        if (addBtnAppView) {
            if (!auth.currentUser) {
                alert('Пожалуйста, войдите в аккаунт, чтобы добавлять приложения в "Мои приложения".');
                return;
            }
            const moduleName = addBtnAppView.dataset.module;
            await toggleMyAppStatus(moduleName);
            await updateAppViewButton(moduleName);
        }
        const sortBtn = e.target.closest('#sort-my-apps-btn');
        if (sortBtn) {
            isSortingMode = !isSortingMode;
            sortBtn.classList.toggle('active', isSortingMode);
            if (isSortingMode) {
                sortBtn.textContent = 'Готово';
                initializeDragAndDrop();
            } else {
                sortBtn.textContent = 'Переместить';
                destroyDragAndDrop();
            }
        }
    });

    setOnDataLoaded(async () => {
        console.log("Получены свежие данные из Firebase, интерфейс будет обновлен.");
        await router(); 
    });

    let isInitialAuthCheckDone = false;
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await fetchUserAccountData(user.uid);
        } else {
            clearUserData();
            const myAppsButton = document.querySelector('#filter-container [data-sort="my-apps"]');
            if (myAppsButton?.classList.contains('active')) {
                myAppsButton.classList.remove('active');
                document.querySelector('#filter-container [data-sort="default"]')?.classList.add('active');
                lastActiveFilter = 'default';
            }
        }

        updateAuthStateUI(user);
        
        if (!isInitialAuthCheckDone) {
            isInitialAuthCheckDone = true;
            
            const params = new URLSearchParams(window.location.search);
            const isHomePage = !params.has('app');

            if (isHomePage) {
                const mainFilterDefault = document.querySelector('#filter-container [data-sort="default"]');
                const mainFilterMyApps = document.querySelector('#filter-container [data-sort="my-apps"]');

                if (user && mainFilterMyApps) {
                    mainFilterDefault?.classList.remove('active');
                    mainFilterMyApps.classList.add('active');
                    lastActiveFilter = 'my-apps';
                } else {
                    mainFilterMyApps?.classList.remove('active');
                    mainFilterDefault?.classList.add('active');
                    lastActiveFilter = 'default';
                }
            }
            
            await router(); 
            const loader = document.getElementById('initial-loading-overlay');
            if (loader) {
                loader.style.display = 'none';
            }
        } else {
            if (new URLSearchParams(window.location.search).has('app')) {
                 await router();
            } else {
                 await applyAppListFilterAndRender();
            }
        }

        if (isGsiInitialized) {
            renderGoogleButton();
        }
        
        hideAuthLoader();
    });
    
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
        }
    }, 100);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.error('Ошибка регистрации Service Worker:', error);
                });
        });
    }
});
