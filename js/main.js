// 38js/main.js

import { renderChangelog } from './changelog.js';
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { fetchUserAccountData, clearUserData, getUserData, saveUserData, setOnDataLoaded } from './dataManager.js';

// --- Сопоставление имен приложений и метаданные ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest', 'Радио': 'radio', 'Заметки и задачи': 'notesAndTasks', 'Тест звука и микрофона': 'soundAndMicTest', 'Сжатие аудио': 'audioCompressor', 'Мой IP': 'myIp', 'Генератор паролей': 'passwordGenerator', 'Процентный калькулятор': 'percentageCalculator', 'Таймер': 'timer', 'Колесо фортуны': 'fortuneWheel', 'Шар предсказаний': 'magicBall', 'Крестики-нолики': 'ticTacToe', 'Сапер': 'minesweeper', 'Секундомер': 'stopwatch', 'Случайный цвет': 'randomColor', 'Генератор чисел': 'numberGenerator', 'Генератор QR-кодов': 'qrCodeGenerator', 'Эмодзи и символы': 'emojiAndSymbols', 'Конвертер величин': 'unitConverter', 'Калькулятор дат': 'dateCalculator', 'Калькулятор ИМТ': 'bmiCalculator', 'Сканер QR-кодов': 'qrScanner', 'Пианино': 'piano', 'История изменений': 'changelogPage', 'Конвертер регистра': 'caseConverter', 'Конвертер цветов': 'colorConverter', 'Игра на память': 'memoryGame', 'Редактор изображений': 'imageEditor', 'Транслитерация текста': 'textTranslit', 'Калькулятор валют': 'currencyCalculator', 'Змейка': 'snakeGame', 'Конвертер часовых поясов': 'timezoneConverter', 'Текст в речь': 'textToSpeech', 'Камень, ножницы, бумага': 'rockPaperScissors', 'Судоку': 'sudoku', 'Архиватор файлов (ZIP)': 'zipArchiver', '2048': 'game2048', 'Генератор штрих-кодов': 'barcodeGenerator', 'Диктофон': 'voiceRecorder', 
    'Генератор каркаса сайта': 'siteSkeletonGenerator', 'Тест мыши': 'mouseTester', 'Тест клавиатуры': 'keyboardTester', 'Графический редактор': 'drawingPad', 'Сравнение текста': 'textDiffTool', 'Генератор favicon': 'faviconGenerator', 'Анализатор текста': 'textAnalyzer', 'Калькулятор кредита': 'loanCalculator', 'Тест скорости печати': 'typingTest', 'Запись экрана': 'screenRecorder', 'Flappy Bird': 'flappyBird', 'Виртуальный кубик': 'virtualDice', 'Калькулятор калорий': 'calorieCalculator', 'Калькулятор': 'calculator', 'ТВ онлайн': 'onlineTv', 'Markdown Редактор': 'markdownEditor', 'Тетрис': 'tetris',
};
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94, 'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78, 'bmiCalculator': 75, 'timer': 70, 'stopwatch': 68, 'audioCompressor': 65, 'percentageCalculator': 66, 'dateCalculator': 64, 'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71, 'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55, 'numberGenerator': 54, 'changelogPage': 10, 'imageEditor': 93, 'colorConverter': 87, 'memoryGame': 83, 'caseConverter': 76, 'currencyCalculator': 86, 'textTranslit': 72, 'snakeGame': 74, 'timezoneConverter': 84, 'textToSpeech': 73, 'rockPaperScissors': 67, 'sudoku': 80, 'zipArchiver': 88, 'game2048': 79, 'barcodeGenerator': 84, 'voiceRecorder': 82, 'siteSkeletonGenerator': 78, 'mouseTester': 75, 'keyboardTester': 76, 'drawingPad': 80, 'textDiffTool': 70, 'faviconGenerator': 85, 'textAnalyzer': 82, 'loanCalculator': 80, 'typingTest': 88, 'Recorder': 90, 'flappyBird': 78, 'virtualDice': 70, 'calorieCalculator': 80, 'calculator': 98, 'onlineTv': 90, 'markdownEditor': 85, 'tetris': 96,
};
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] }, 'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] }, 'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] }, 'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] }, 'audioCompressor': { keywords: ['сжать', 'аудио', 'mp3', 'размер', 'уменьшить'], hashtags: ['#audio', '#tools'] }, 'myIp': { keywords: ['ip', 'адрес', 'айпи', 'сеть'], hashtags: ['#network', '#tools'] }, 'passwordGenerator': { keywords: ['пароль', 'безопасность', 'создать', 'надежный'], hashtags: ['#security', '#tools'] }, 'percentageCalculator': { keywords: ['проценты', 'вычислить', 'доля'], hashtags: ['#math', '#calculator'] }, 'timer': { keywords: ['countdown', 'отсчет', 'время'], hashtags: ['#time', '#tools'] }, 'fortuneWheel': { keywords: ['рулетка', 'случайный', 'выбор', 'жребий'], hashtags: ['#random', '#game'] }, 'magicBall': { keywords: ['предсказание', 'ответ', 'восьмерка', 'да нет'], hashtags: ['#fun', '#game'] }, 'ticTacToe': { keywords: ['игра', 'крестики', 'нолики', 'вдвоем'], hashtags: ['#game'] }, 'minesweeper': { keywords: ['игра', 'мины', 'головоломка', 'логика'], hashtags: ['#game', '#logic'] }, 'stopwatch': { keywords: ['время', 'хронометр', 'измерить'], hashtags: ['#time', '#tools'] }, 'randomColor': { keywords: ['цвет', 'случайный', 'палитра', 'дизайн', 'hex'], hashtags: ['#design', '#random', '#color'] }, 'numberGenerator': { keywords: ['случайное', 'число', 'рандом', 'выбор'], hashtags: ['#random', '#math'] }, 'qrCodeGenerator': { keywords: ['qr', 'код', 'куар', 'ссылка'], hashtags: ['#tools', '#generator'] }, 'emojiAndSymbols': { keywords: ['эмодзи', 'символы', 'скопировать', 'смайлик'], hashtags: ['#text', '#tools'] }, 'unitConverter': { keywords: ['конвертер', 'единицы', 'измерения', 'перевести'], hashtags: ['#converter', '#math'] }, 'dateCalculator': { keywords: ['дата', 'дни', 'календарь', 'разница'], hashtags: ['#time', '#calculator'] }, 'bmiCalculator': { keywords: ['имт', 'вес', 'рост', 'здоровье', 'индекс массы тела'], hashtags: ['#health', '#calculator'] }, 'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] }, 'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] }, 'caseConverter': { keywords: ['конвертер', 'регистр', 'текст', 'верхний', 'нижний', 'заглавные', 'буквы', 'case'], hashtags: ['#text', '#tools'] }, 'colorConverter': { keywords: ['конвертер', 'цвет', 'hex', 'rgb', 'hsl', 'палитра', 'код цвета'], hashtags: ['#color', '#design', '#converter'] }, 'memoryGame': { keywords: ['игра', 'память', 'карточки', 'пары', 'тренировка', 'запомнить'], hashtags: ['#game', '#fun', '#logic'] }, 'textTranslit': { keywords: ['транслит', 'латиница', 'кириллица', 'текст', 'перевод', 'cyrillic', 'latin'], hashtags: ['#text', '#tools'] }, 'currencyCalculator': { keywords: ['валюта', 'курс', 'доллар', 'евро', 'рубль', 'конвертер', 'обмен'], hashtags: ['#finance', '#calculator', '#converter'] }, 'snakeGame': { keywords: ['игра', 'змейка', 'классика', 'аркада', 'snake'], hashtags: ['#game', '#fun'] },'timezoneConverter': { keywords: ['время', 'часовой пояс', 'конвертер', 'utc', 'gmt', 'разница во времени', 'timezone'], hashtags: ['#time', '#converter', '#tools'] },'textToSpeech': { keywords: ['голос', 'озвучка', 'читать', 'синтез', 'речи', 'tts'], hashtags: ['#audio', '#tools'] },'rockPaperScissors': { keywords: ['игра', 'камень', 'ножницы', 'бумага', 'цу-е-фа'], hashtags: ['#game', '#fun'] },'sudoku': { keywords: ['игра', 'головоломка', 'цифры', 'логика', 'судоку'], hashtags: ['#game', '#logic'] },'zipArchiver': { keywords: ['zip', 'архив', 'архиватор', 'сжать', 'распаковать', 'файлы', 'папка'], hashtags: ['#tools', '#files'] },'game2048': { keywords: ['игра', 'головоломка', 'цифры', '2048', 'логика'], hashtags: ['#game', '#logic'] },'barcodeGenerator': { keywords: ['штрих-код', 'ean', 'code128', 'создать', 'генератор', 'товар'], hashtags: ['#tools', '#generator'] },'voiceRecorder': { keywords: ['диктофон', 'запись', 'голос', 'аудио', 'микрофон', 'записать', 'record'], hashtags: ['#audio', '#tools'] },'siteSkeletonGenerator': { keywords: ['каркас', 'структура', 'сайт', 'json', 'генератор', 'zip', 'архив'], hashtags: ['#tools', '#generator', '#webdev'] },'mouseTester': { keywords: ['мышь', 'мышка', 'кнопки', 'колесико', 'проверка', 'клик', 'scroll', 'mouse', 'test'], hashtags: ['#tools', '#hardware'] },'keyboardTester': { keywords: ['клавиатура', 'клавиши', 'проверка', 'нажатие', 'печать', 'keyboard', 'test'], hashtags: ['#tools', '#hardware'] },'drawingPad': { keywords: ['рисование', 'редактор', 'холст', 'кисть', 'paint', 'draw', 'графика'], hashtags: ['#fun', '#design', '#tools'] },'textDiffTool': { keywords: ['сравнение', 'текст', 'различия', 'diff', 'код'], hashtags: ['#text', '#tools', '#webdev'] },'faviconGenerator': { keywords: ['favicon', 'иконка', 'сайт', 'генератор', 'png', 'ico'], hashtags: ['#image', '#tools', '#webdev'] },'textAnalyzer': { keywords: ['анализ', 'статистика', 'текст', 'слова', 'ключевые', 'частота', 'счетчик', 'символы', 'подсчет'], hashtags: ['#text', '#tools'] },'loanCalculator': { keywords: ['кредит', 'ипотека', 'калькулятор', 'платеж', 'проценты', 'финансы'], hashtags: ['#finance', '#calculator'] },'typingTest': { keywords: ['печать', 'скорость', 'тест', 'клавиатура', 'wpm', 'набор', 'текста'], hashtags: ['#tools', '#fun'] },'Recorder': { keywords: ['запись', 'экрана', 'видео', 'демонстрация', 'cast', 'record'], hashtags: ['#tools', '#video'] },'flappyBird': { keywords: ['игра', 'птица', 'трубы', 'аркада', 'flappy', 'bird'], hashtags: ['#game', '#fun'] },'virtualDice': { keywords: ['кубик', 'кости', 'dnd', 'dice', 'roll', 'жребий', 'случайность', 'd4', 'd6', 'd20'], hashtags: ['#game', '#fun', '#random'] },'calorieCalculator': { keywords: ['калории', 'бжу', 'диета', 'похудение', 'питание', 'норма', 'расчет'], hashtags: ['#health', '#calculator'] },'calculator': { keywords: ['калькулятор', 'вычисления', 'математика', 'сложение', 'умножение', 'calc'], hashtags: ['#math', '#tools', '#calculator'] },'imageEditor': { keywords: ['редактор', 'изображение', 'картинка', 'фото', 'изменить', 'размер', 'конвертер', 'формат', 'png', 'jpg', 'webp', 'ресайз', 'resize', 'обработка'], hashtags: ['#image', '#tools'] },'onlineTv': { keywords: ['тв', 'телевизор', 'каналы', 'смотреть', 'онлайн', 'трансляция', 'tv', 'online'], hashtags: ['#entertainment', '#video'] },'markdownEditor': { keywords: ['markdown', 'редактор', 'md', 'текст', 'разметка', 'html', 'форматирование'], hashtags: ['#text', '#tools', '#webdev'] },'tetris': { keywords: ['тетрис', 'игра', 'блоки', 'головоломка', 'классика', 'tetris'], hashtags: ['#game', '#fun', '#logic'] },
};
const moduleFileToAppName = Object.fromEntries(
  Object.entries(appNameToModuleFile).map(([name, file]) => [file, name])
);

// --- DOM элементы ---
const pageContainer = document.getElementById('page-container');
const dynamicContentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const filterContainer = document.getElementById('filter-container');
let activeAppModule = null; 
const appCardElements = new Map();
let allAppCards = [];

// --- HTML шаблоны ---
const homeScreenHtml = `
    <div class="relative h-full pt-16">
        <button id="sort-my-apps-btn" class="filter-btn hidden absolute top-0 right-0 z-10 w-auto">Переместить</button>
        <div id="apps-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"></div>
    </div>
`;
const appScreenHtml = `
    <div id="app-screen" class="hidden flex flex-col h-full">
        <div class="flex items-center justify-between mb-6 flex-shrink-0 px-1">
            <div class="flex items-center">
                <a href="/" id="back-button" class="p-2 rounded-full bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300 dark:hover:bg-gray-600"><svg class="h-6 w-6 text-gray-900 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></a>
                <h2 id="app-title" class="text-2xl font-bold ml-4"></h2>
            </div>
            <button id="add-to-my-apps-app-view-btn" class="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                <img src="img/plusapps.svg" class="plus-icon h-5 w-5" alt="Добавить">
                <img src="img/minusapps.svg" class="cross-icon h-5 w-5 hidden" alt="Удалить">
                <span class="btn-text"></span>
            </button>
        </div>
        <div id="app-content-container" class="flex-grow relative"></div>
    </div>`;

let sortableInstance = null;
let isSortingMode = false;

function initializeDragAndDrop() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer || sortableInstance) return;
    appsContainer.classList.add('sortable-active');
    sortableInstance = new Sortable(appsContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: async (evt) => {
            const newOrder = Array.from(evt.target.children).map(card => card.dataset.module);
            await saveMyApps(newOrder);
        },
    });
}

function destroyDragAndDrop() {
    const appsContainer = document.getElementById('apps-container');
    if (appsContainer) appsContainer.classList.remove('sortable-active');
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
}

function showAuthLoader() { document.getElementById('auth-loading-overlay')?.classList.remove('hidden'); }
function hideAuthLoader() { document.getElementById('auth-loading-overlay')?.classList.add('hidden'); }

// --- Логика Аутентификации и UI ---
const userProfileElement = document.getElementById('user-profile');
const userAvatarElement = document.getElementById('user-avatar');
const userNameElement = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');
const googleSignInContainer = document.getElementById('google-signin-top-right-container');
let isGsiInitialized = false;

function renderGoogleButton() {
    if (!isGsiInitialized || !googleSignInContainer || auth.currentUser) return;
    googleSignInContainer.innerHTML = '';
    window.google.accounts.id.renderButton(
        googleSignInContainer,
        { type: "standard", shape: "pill", theme: "outline", size: "large", text: "signin_with" }
    );
    googleSignInContainer.classList.remove('hidden');
}

function updateAuthStateUI(user) {
    const myAppsButton = document.querySelector('[data-sort="my-apps"]');
    if (user) {
        if (userNameElement) userNameElement.textContent = user.displayName;
        if (userAvatarElement) userAvatarElement.src = user.photoURL;
        userProfileElement?.classList.remove('hidden');
        googleSignInContainer?.classList.add('hidden');
        myAppsButton?.classList.remove('hidden');
    } else {
        userProfileElement?.classList.add('hidden');
        googleSignInContainer?.classList.remove('hidden');
        myAppsButton?.classList.add('hidden');
    }
}

async function getMyApps() { return getUserData('myApps', []); }
async function saveMyApps(myAppsModules) { await saveUserData('myApps', myAppsModules); }

function handleCredentialResponse(response) {
    showAuthLoader();
    const googleCredential = GoogleAuthProvider.credential(response.credential);
    signInWithCredential(auth, googleCredential)
        .catch((error) => {
            console.error("Firebase sign-in error", error);
            hideAuthLoader();
        });
}

function handleSignOut() {
    signOut(auth);
    if (window.google && window.google.accounts) {
        google.accounts.id.disableAutoSelect();
    }
}

function initializeGoogleSignIn() {
    if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
            client_id: '327345325953-bubmv3lac6ctv2tgddin8mshdbceve27.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        isGsiInitialized = true;
        renderGoogleButton();
    }
}

async function toggleMyAppStatus(moduleName) {
    if (!moduleName) return;
    let myApps = await getMyApps();
    if (myApps.includes(moduleName)) {
        myApps = myApps.filter(m => m !== moduleName);
    } else {
        myApps.push(moduleName);
    }
    await saveMyApps(myApps);
    const activeFilter = document.querySelector('#filter-container .active')?.dataset.sort;
    if (activeFilter === 'my-apps') {
        await applyAppListFilterAndRender();
    } else {
        await updateAllMyAppButtonsUI();
    }
}

async function updateAllMyAppButtonsUI() {
    const myApps = await getMyApps();
    document.querySelectorAll('.app-item').forEach(card => {
        const moduleName = card.dataset.module;
        const button = card.querySelector('.add-to-my-apps-btn');
        if (button) {
            button.classList.toggle('is-added', myApps.includes(moduleName));
        }
    });
    const currentAppModule = new URLSearchParams(window.location.search).get('app');
    if (currentAppModule) {
        await updateAppViewButton(currentAppModule, myApps);
    }
}

async function updateAppViewButton(moduleName, myAppsList) {
    const myApps = myAppsList || await getMyApps();
    const button = document.getElementById('add-to-my-apps-app-view-btn');
    if (!button) return;
    const isAdded = myApps.includes(moduleName);
    const textSpan = button.querySelector('.btn-text');
    button.classList.toggle('remove-style', isAdded);
    button.classList.toggle('add-style', !isAdded);
    textSpan.textContent = isAdded ? 'Удалить' : 'Добавить';
}


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

async function renderSimilarApps(currentModule, container) {
    // This function is now removed as per the new design of maximizing app space
    container.innerHTML = '';
    container.classList.add('hidden');
}

// --- РОУТИНГ ---
async function router() {
    if (activeAppModule && typeof activeAppModule.cleanup === 'function') {
        activeAppModule.cleanup();
    }
    activeAppModule = null;
    dynamicContentArea.innerHTML = '';
    const params = new URLSearchParams(window.location.search);
    const moduleName = params.get('app');
    const appName = moduleFileToAppName[moduleName];
    
    // Сначала управляем видимостью списка приложений в сайдбаре
    const appsContainerInSidebar = document.getElementById('apps-container');
    if (appsContainerInSidebar) {
        appsContainerInSidebar.style.display = 'block'; // Ensure it's always visible in sidebar
    }

    if (appName) {
        // --- РЕЖИМ ПРОСМОТРА ПРИЛОЖЕНИЯ ---
        pageContainer.classList.add('app-view-active');
        if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
        
        dynamicContentArea.innerHTML = appScreenHtml;
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('app-title').textContent = appName;
        document.title = `${appName} | Mini Apps`;

        try {
            const module = await import(`./apps/${moduleName}.js`);
            activeAppModule = module;
            const appContentContainer = document.getElementById('app-content-container');
            if (typeof module.getHtml === 'function') appContentContainer.innerHTML = module.getHtml();
            if (typeof module.init === 'function') await module.init(appContentContainer);
            await updateAppViewButton(moduleName);
        } catch (error) {
            console.error(`Ошибка загрузки модуля для "${appName}" (${moduleName}.js):`, error);
            document.getElementById('app-content-container').innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение.</p>`;
        }
    } else {
        // --- РЕЖИМ ГЛАВНОЙ СТРАНИЦЫ (СПИСОК ПРИЛОЖЕНИЙ) ---
        pageContainer.classList.remove('app-view-active');
        dynamicContentArea.innerHTML = homeScreenHtml;
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        renderChangelog(null, 3, changelogContainer);
        await applyAppListFilterAndRender();
    }
}


// --- НАСТРОЙКА СОБЫТИЙ ---
function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link || e.target.closest('.add-to-my-apps-btn')) return;
        if (link.id === 'back-button' || link.id === 'home-link') { 
            e.preventDefault(); 
            history.pushState({}, '', '/');
            router();
            return; 
        }
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            const isAppNavigation = url.search.startsWith('?app=');
            if (isAppNavigation) {
                e.preventDefault();
                if (window.location.href !== link.href) {
                    history.pushState({}, '', link.href);
                    router();
                }
            }
        }
    });
}

function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Если мы внутри приложения и начинаем поиск, переходим на главную
        const isAppView = !!(new URLSearchParams(window.location.search).get('app'));
        if (isAppView && searchTerm.length > 0) {
            history.pushState({}, '', '/');
            router().then(() => {
                // Убедимся, что apps-container на месте перед фильтрацией
                filterAppCards(searchTerm);
            });
            return;
        }

        filterAppCards(searchTerm);
    });
}

function filterAppCards(searchTerm) {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer) return;

    let hasVisibleApps = false;
    appsContainer.querySelectorAll('.app-item').forEach(app => {
        const appName = app.dataset.name.toLowerCase();
        const moduleName = app.dataset.module;
        const metadata = appSearchMetadata[moduleName] || { keywords: [], hashtags: [] };
        const searchCorpus = [appName, ...metadata.keywords].join(' ');
        const isVisible = searchCorpus.includes(searchTerm);
        app.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) hasVisibleApps = true;
    });

    // Показываем/скрываем сообщение "ничего не найдено"
    let noResultsEl = appsContainer.querySelector('.no-results');
    if (!hasVisibleApps && searchTerm) {
        if (!noResultsEl) {
            noResultsEl = document.createElement('p');
            noResultsEl.className = 'no-results col-span-full text-center text-gray-500 dark:text-gray-400';
            noResultsEl.textContent = 'Ничего не найдено.';
            appsContainer.appendChild(noResultsEl);
        }
    } else {
        noResultsEl?.remove();
    }
}


async function applyAppListFilterAndRender() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer) return;
    
    destroyDragAndDrop();
    isSortingMode = false;
    
    const sortBtn = document.getElementById('sort-my-apps-btn');
    const activeFilter = filterContainer.querySelector('.active')?.dataset.sort || 'default';
    const myApps = await getMyApps();

    const renderApps = (appElements) => {
        appsContainer.innerHTML = '';
        if (appElements.length === 0 && activeFilter === 'my-apps') {
            appsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">У вас пока нет добавленных приложений. Нажмите "+" на карточке приложения, чтобы добавить его сюда.</p>`;
            return;
        }
        appElements.forEach(app => {
            const appClone = app.cloneNode(true);
            const button = appClone.querySelector('.add-to-my-apps-btn');
            if (button) {
                button.classList.toggle('is-added', myApps.includes(app.dataset.module));
            }
            appsContainer.appendChild(appClone);
        });
    };

    let appsToRender = [];
    if (activeFilter === 'my-apps') {
        appsToRender = myApps.map(moduleName => appCardElements.get(moduleName)).filter(Boolean);
        sortBtn?.classList.remove('hidden');
        sortBtn?.classList.remove('active');
        if (sortBtn) sortBtn.textContent = 'Переместить';
    } else {
        sortBtn?.classList.add('hidden');
        let sortedApps = [...allAppCards];
        if (activeFilter === 'popular') {
            sortedApps.sort((a, b) => (appPopularity[b.dataset.module] || 0) - (appPopularity[a.dataset.module] || 0));
        } else if (activeFilter === 'new') {
            // "Новые" - это просто обратный порядок изначального списка
            sortedApps.reverse();
        }
        appsToRender = sortedApps;
    }
    renderApps(appsToRender);
    
    // Применяем текущий поисковый запрос, если он есть
    if (searchInput.value) {
        filterAppCards(searchInput.value.toLowerCase().trim());
    }
}

function setupFilters() {
    if (!filterContainer) return;
    filterContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button || button.classList.contains('active')) return;
        
        const isAppView = pageContainer.classList.contains('app-view-active');
        
        filterContainer.querySelector('.active')?.classList.remove('active');
        button.classList.add('active');

        if (isAppView) {
            history.pushState({}, '', '/');
            router();
        } else {
            applyAppListFilterAndRender();
        }
    });
}

// --- ГЛАВНЫЙ ПОТОК ВЫПОЛНЕНИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    setupSearch(); 
    setupFilters();
    signOutBtn.addEventListener('click', handleSignOut);
    setupNavigationEvents();
    window.addEventListener('popstate', router);

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
        if (suggestionsContainer && !suggestionsContainer.contains(e.target) && e.target !== searchInput) {
            suggestionsContainer.classList.add('hidden');
        }
    });
    
    dynamicContentArea.addEventListener('click', async e => {
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
            const moduleName = new URLSearchParams(window.location.search).get('app');
            await toggleMyAppStatus(moduleName);
            await updateAppViewButton(moduleName);
        }
        const sortBtn = e.target.closest('#sort-my-apps-btn');
        if (sortBtn) {
            isSortingMode = !isSortingMode;
            sortBtn.classList.toggle('active', isSortingMode);
            sortBtn.textContent = isSortingMode ? 'Готово' : 'Переместить';
            if (isSortingMode) {
                initializeDragAndDrop();
            } else {
                destroyDragAndDrop();
            }
        }
    });

    setOnDataLoaded(router);

    let isInitialAuthCheckDone = false;
    onAuthStateChanged(auth, async (user) => {
        const myAppsButton = document.querySelector('[data-sort="my-apps"]');
        const allAppsButton = document.querySelector('[data-sort="default"]');
        
        if (user) {
            await fetchUserAccountData(user.uid);
        } else {
            clearUserData();
            if (myAppsButton?.classList.contains('active')) {
                myAppsButton.classList.remove('active');
                allAppsButton?.classList.add('active');
            }
        }

        updateAuthStateUI(user);
        
        if (!isInitialAuthCheckDone) {
            isInitialAuthCheckDone = true;
            
            const params = new URLSearchParams(window.location.search);
            const appModule = params.get('app');
            if (!appModule) {
                filterContainer.querySelector('.active')?.classList.remove('active');
                if (user) {
                    myAppsButton?.classList.add('active');
                } else {
                    allAppsButton?.classList.add('active');
                }
            }
            
            await router(); 
            document.getElementById('initial-loading-overlay')?.style.display = 'none';

        } else {
            await router();
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
                .then(registration => console.log('Service Worker зарегистрирован:', registration.scope))
                .catch(error => console.error('Ошибка регистрации Service Worker:', error));
        });
    }
});
