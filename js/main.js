//54 js/main.js

import { renderChangelog } from './changelog.js';
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { fetchUserAccountData, clearUserData, getUserData, saveUserData, setOnDataLoaded } from './dataManager.js';

// --- Сопоставление имен приложений и метаданные ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest', 'Радио': 'radio', 'Заметки и задачи': 'notesAndTasks', 'Тест звука и микрофона': 'soundAndMicTest', 'Сжатие аудио': 'audioCompressor', 'Мой IP': 'myIp', 'Генератор паролей': 'passwordGenerator', 'Процентный калькулятор': 'percentageCalculator', 'Таймер': 'timer', 'Колесо фортуны': 'fortuneWheel', 'Шар предсказаний': 'magicBall', 'Крестики-нолики': 'ticTacToe', 'Сапер': 'minesweeper', 'Секундомер': 'stopwatch', 'Случайный цвет': 'randomColor', 'Генератор чисел': 'numberGenerator', 'Генератор QR-кодов': 'qrCodeGenerator', 'Эмодзи и символы': 'emojiAndSymbols', 'Конвертер величин': 'unitConverter', 'Калькулятор дат': 'dateCalculator', 'Калькулятор ИМТ': 'bmiCalculator', 'Счетчик слов и символов': 'wordCounter', 'Сканер QR-кодов': 'qrScanner', 'Пианино': 'piano', 'История изменений': 'changelogPage', 'Конвертер регистра': 'caseConverter', 'Конвертер форматов изображений': 'imageConverter', 'Конвертер цветов': 'colorConverter', 'Игра на память': 'memoryGame', 'Транслитерация текста': 'textTranslit', 'Изменение размера изображений': 'imageResizer', 'Калькулятор валют': 'currencyCalculator', 'Змейка': 'snakeGame', 'Конвертер часовых поясов': 'timezoneConverter', 'Текст в речь': 'textToSpeech', 'Камень, ножницы, бумага': 'rockPaperScissors', 'Судоку': 'sudoku', 'Архиватор файлов (ZIP)': 'zipArchiver', '2048': 'game2048', 'Генератор штрих-кодов': 'barcodeGenerator', 'Диктофон': 'voiceRecorder', 
    'Генератор каркаса сайта': 'siteSkeletonGenerator',
    'Тест мыши': 'mouseTester',
    'Тест клавиатуры': 'keyboardTester',
    'Графический редактор': 'drawingPad',
    'Сравнение текста': 'textDiffTool',
    'Генератор Favicon': 'faviconGenerator',
    'Калькулятор кредита': 'loanCalculator',
    'Тест скорости печати': 'typingTest',
    'Запись экрана': 'screenRecorder',
    'Flappy Bird': 'flappyBird',
};
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94, 'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78, 'bmiCalculator': 75, 'wordCounter': 82, 'timer': 70, 'stopwatch': 68, 'audioCompressor': 65, 'percentageCalculator': 66, 'dateCalculator': 64, 'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71, 'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55, 'numberGenerator': 54, 'changelogPage': 10, 'imageConverter': 91, 'colorConverter': 87, 'memoryGame': 83, 'caseConverter': 76, 'imageResizer': 90, 'currencyCalculator': 86, 'textTranslit': 72, 'snakeGame': 74, 'timezoneConverter': 84, 'textToSpeech': 73, 'rockPaperScissors': 67, 'sudoku': 80, 'zipArchiver': 88, 'game2048': 79, 'barcodeGenerator': 84, 'voiceRecorder': 82, 'siteSkeletonGenerator': 78,
    'mouseTester': 75,
    'keyboardTester': 76,
    'drawingPad': 80,
    'textDiffTool': 70,
    'faviconGenerator': 85,
    'loanCalculator': 80,
    'typingTest': 88,
    'Recorder': 90,
    'flappyBird': 78,
};
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] }, 'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] }, 'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] }, 'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] }, 'audioCompressor': { keywords: ['сжать', 'аудио', 'mp3', 'размер', 'уменьшить'], hashtags: ['#audio', '#tools'] }, 'myIp': { keywords: ['ip', 'адрес', 'айпи', 'сеть'], hashtags: ['#network', '#tools'] }, 'passwordGenerator': { keywords: ['пароль', 'безопасность', 'создать', 'надежный'], hashtags: ['#security', '#tools'] }, 'percentageCalculator': { keywords: ['проценты', 'вычислить', 'доля'], hashtags: ['#math', '#calculator'] }, 'timer': { keywords: ['countdown', 'отсчет', 'время'], hashtags: ['#time', '#tools'] }, 'fortuneWheel': { keywords: ['рулетка', 'случайный', 'выбор', 'жребий'], hashtags: ['#random', '#game'] }, 'magicBall': { keywords: ['предсказание', 'ответ', 'восьмерка', 'да нет'], hashtags: ['#fun', '#game'] }, 'ticTacToe': { keywords: ['игра', 'крестики', 'нолики', 'вдвоем'], hashtags: ['#game'] }, 'minesweeper': { keywords: ['игра', 'мины', 'головоломка', 'логика'], hashtags: ['#game', '#logic'] }, 'stopwatch': { keywords: ['время', 'хронометр', 'измерить'], hashtags: ['#time', '#tools'] }, 'randomColor': { keywords: ['цвет', 'случайный', 'палитра', 'дизайн', 'hex'], hashtags: ['#design', '#random', '#color'] }, 'numberGenerator': { keywords: ['случайное', 'число', 'рандом', 'выбор'], hashtags: ['#random', '#math'] }, 'qrCodeGenerator': { keywords: ['qr', 'код', 'куар', 'ссылка'], hashtags: ['#tools', '#generator'] }, 'emojiAndSymbols': { keywords: ['эмодзи', 'символы', 'скопировать', 'смайлик'], hashtags: ['#text', '#tools'] }, 'unitConverter': { keywords: ['конвертер', 'единицы', 'измерения', 'перевести'], hashtags: ['#converter', '#math'] }, 'dateCalculator': { keywords: ['дата', 'дни', 'календарь', 'разница'], hashtags: ['#time', '#calculator'] }, 'bmiCalculator': { keywords: ['имт', 'вес', 'рост', 'здоровье', 'индекс массы тела'], hashtags: ['#health', '#calculator'] }, 'wordCounter': { keywords: ['счетчик', 'слова', 'символы', 'текст', 'статистика', 'подсчет'], hashtags: ['#text', '#tools'] }, 'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] }, 'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] }, 'caseConverter': { keywords: ['конвертер', 'регистр', 'текст', 'верхний', 'нижний', 'заглавные', 'буквы', 'case'], hashtags: ['#text', '#tools'] }, 'imageConverter': { keywords: ['конвертер', 'изображения', 'картинки', 'png', 'jpg', 'webp', 'формат', 'преобразовать'], hashtags: ['#image', '#tools', '#converter'] }, 'colorConverter': { keywords: ['конвертер', 'цвет', 'hex', 'rgb', 'hsl', 'палитра', 'код цвета'], hashtags: ['#color', '#design', '#converter'] }, 'memoryGame': { keywords: ['игра', 'память', 'карточки', 'пары', 'тренировка', 'запомнить'], hashtags: ['#game', '#fun', '#logic'] }, 'textTranslit': { keywords: ['транслит', 'латиница', 'кириллица', 'текст', 'перевод', 'cyrillic', 'latin'], hashtags: ['#text', '#tools'] }, 'imageResizer': { keywords: ['изображение', 'картинка', 'размер', 'уменьшить', 'увеличить', 'ресайз', 'resize'], hashtags: ['#image', '#tools'] }, 'currencyCalculator': { keywords: ['валюта', 'курс', 'доллар', 'евро', 'рубль', 'конвертер', 'обмен'], hashtags: ['#finance', '#calculator', '#converter'] }, 'snakeGame': { keywords: ['игра', 'змейка', 'классика', 'аркада', 'snake'], hashtags: ['#game', '#fun'] },
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
    'loanCalculator': { keywords: ['кредит', 'ипотека', 'калькулятор', 'платеж', 'проценты', 'финансы'], hashtags: ['#finance', '#calculator'] },
    'typingTest': { keywords: ['печать', 'скорость', 'тест', 'клавиатура', 'wpm', 'набор', 'текста'], hashtags: ['#tools', '#fun'] },
    'Recorder': { keywords: ['запись', 'экрана', 'видео', 'демонстрация', 'cast', 'record'], hashtags: ['#tools', '#video'] },
    'flappyBird': { keywords: ['игра', 'птица', 'трубы', 'аркада', 'flappy', 'bird'], hashtags: ['#game', '#fun'] },
};
const moduleFileToAppName = Object.fromEntries(
  Object.entries(appNameToModuleFile).map(([name, file]) => [file, name])
);

const dynamicContentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
let activeAppModule = null; 
const appCardElements = new Map();
let allAppCards = [];

const homeScreenHtml = `<div id=\"apps-container\" class=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4\"></div>`;
const appScreenHtml = `
    <div id="app-screen" class="hidden w-full max-w-6xl mx-auto p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg transition-colors">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
                <a href="/" id="back-button" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><svg class="h-6 w-6 text-gray-900 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></a>
                <h2 id="app-title" class="text-2xl font-bold ml-4"></h2>
            </div>
            <button id="add-to-my-apps-app-view-btn" class="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                <img src="img/appplus.svg" class="plus-icon h-5 w-5" alt="Добавить">
                <img src="img/appminus.svg" class="cross-icon h-5 w-5 hidden" alt="Удалить">
                <span class="btn-text"></span>
            </button>
        </div>
        <div id="app-content-container" class="mt-4"></div>
        <div id="similar-apps-container" class="mt-12"></div>
        <div id="app-changelog-container" class="mt-8"></div>
    </div>`;

let sortableInstance = null;

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

function showAuthLoader() {
    document.getElementById('auth-loading-overlay')?.classList.remove('hidden');
}
function hideAuthLoader() {
    document.getElementById('auth-loading-overlay')?.classList.add('hidden');
}

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
        { type: "icon", shape: "circle", theme: "outline", size: "large" }
    );
    googleSignInContainer.classList.remove('hidden');
}

function updateAuthStateUI(user) {
    const myAppsButton = document.querySelector('[data-sort=\"my-apps\"]');
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
    const plusIcon = button.querySelector('.plus-icon');
    const crossIcon = button.querySelector('.cross-icon');
    plusIcon.classList.toggle('hidden', isAdded);
    crossIcon.classList.toggle('hidden', !isAdded);
    if (isAdded) {
        // ИЗМЕНЕНИЕ: Текст кнопки
        textSpan.textContent = 'Удалить';
        button.classList.add('remove-style');
        button.classList.remove('add-style');
    } else {
        // ИЗМЕНЕНИЕ: Текст кнопки
        textSpan.textContent = 'Добавить';
        button.classList.add('add-style');
        button.classList.remove('remove-style');
    }
    button.dataset.module = moduleName;
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
    const currentAppMeta = appSearchMetadata[currentModule];
    if (!currentAppMeta || !currentAppMeta.hashtags || !currentAppMeta.hashtags.length) { container.innerHTML = ''; container.classList.add('hidden'); return; }
    const currentHashtags = new Set(currentAppMeta.hashtags);
    let similarModules = [];
    for (const moduleName in appSearchMetadata) {
        if (moduleName === currentModule) continue;
        const meta = appSearchMetadata[moduleName];
        if (meta.hashtags && meta.hashtags.some(tag => currentHashtags.has(tag))) {
            similarModules.push(moduleName);
        }
    }
    similarModules.sort((a, b) => (appPopularity[b] || 0) - (appPopularity[a] || 0));
    const topSimilar = similarModules.slice(0, 4);
    if (topSimilar.length === 0) { container.innerHTML = ''; container.classList.add('hidden'); return; }
    container.innerHTML = `<h3 class=\"text-xl font-bold mb-4\">Похожие приложения</h3>`;
    const grid = document.createElement('div');
    grid.className = 'similar-apps-grid';
    topSimilar.forEach(module => {
        const card = appCardElements.get(module);
        if (card) {
            const cardClone = card.cloneNode(true);
            const addBtn = cardClone.querySelector('.add-to-my-apps-btn');
            if (addBtn) addBtn.remove();
            grid.appendChild(cardClone);
        }
    });
    container.appendChild(grid);
    container.classList.remove('hidden');
}

async function router() {
    if (activeAppModule && typeof activeAppModule.cleanup === 'function') {
        activeAppModule.cleanup();
    }
    activeAppModule = null;
    dynamicContentArea.innerHTML = '';
    const params = new URLSearchParams(window.location.search);
    const moduleName = params.get('app');
    const appName = moduleFileToAppName[moduleName];
    const filterContainer = document.getElementById('filter-container');
    
    if (appName) {
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
            if (typeof module.getHtml === 'function') appContentContainer.innerHTML = module.getHtml();
            // --- ИСПРАВЛЕНИЕ: Передаем контейнер в функцию init ---
            if (typeof module.init === 'function') await module.init(appContentContainer);
            await updateAppViewButton(moduleName);
            const appChangelogContainer = document.getElementById('app-changelog-container');
            const similarAppsContainer = document.getElementById('similar-apps-container');
            await renderSimilarApps(moduleName, similarAppsContainer);
            if (appName !== 'История изменений') renderChangelog(appName, null, appChangelogContainer);
        } catch (error) {
            console.error(`Ошибка загрузки модуля для \"${appName}\" (${moduleName}.js):`, error);
            document.getElementById('app-content-container').innerHTML = `<p class=\"text-center text-red-500\">Не удалось загрузить приложение.</p>`;
        }
    } else {
        dynamicContentArea.innerHTML = homeScreenHtml;
        filterContainer?.classList.remove('hidden');
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        setupFilters();
        renderChangelog(null, 3, changelogContainer);
        await applyAppListFilterAndRender();
    }
}

function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link || e.target.closest('.add-to-my-apps-btn')) return;
        if (link.id === 'back-button') { e.preventDefault(); history.back(); return; }
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
            const isAppNavigation = url.search.startsWith('?app=') || (url.pathname === '/' && !url.search);
            const isChangelogLink = link.classList.contains('changelog-link');
            if (isAppNavigation || isChangelogLink) {
                e.preventDefault();
                if (window.location.href === link.href && link.id !== 'home-link') return;
                const appNameToOpen = link.dataset.appName;
                if (isChangelogLink && appNameToOpen) {
                    const moduleFile = appNameToModuleFile[appNameToOpen];
                    if (moduleFile) history.pushState({}, '', `?app=${moduleFile}`);
                } else {
                    history.pushState({}, '', link.href);
                }
                router();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const suggestions = [];
        allAppCards.forEach(card => {
            const appName = card.dataset.name.toLowerCase();
            const moduleName = card.dataset.module;
            const metadata = appSearchMetadata[moduleName] || { keywords: [], hashtags: [] };
            const searchCorpus = [appName, ...metadata.keywords].join(' ');
            if (searchTerm.length > 0 && searchCorpus.includes(searchTerm)) {
                suggestions.push({
                    name: card.dataset.name,
                    module: moduleName,
                    hashtags: metadata.hashtags || []
                });
            }
        });
        suggestionsContainer.innerHTML = '';
        if (suggestions.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            suggestions.slice(0, 7).forEach(suggestion => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion-item flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg';
                suggestionEl.innerHTML = `<span class=\"suggestion-name\">${suggestion.name}</span><span class=\"suggestion-hashtags text-gray-500 dark:text-gray-400 text-sm ml-4\">${suggestion.hashtags.join(' ')}</span>`;
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
        const appsContainer = document.getElementById('apps-container');
        if (appsContainer) {
            const visibleAppCards = appsContainer.querySelectorAll('.app-item');
            visibleAppCards.forEach(app => {
                const appName = app.dataset.name.toLowerCase();
                const moduleName = app.dataset.module;
                const metadata = appSearchMetadata[moduleName] || { keywords: [], hashtags: [] };
                const searchCorpus = [appName, ...metadata.keywords].join(' ');
                const isVisible = searchCorpus.includes(searchTerm);
                app.style.display = isVisible ? 'flex' : 'none';
            });
        }
    });
}

async function applyAppListFilterAndRender() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer) return;

    destroyDragAndDrop();

    const filterContainer = document.getElementById('filter-container');
    const activeFilter = filterContainer.querySelector('.active')?.dataset.sort || 'default';
    const myApps = await getMyApps();

    const renderApps = (appElements) => {
        appsContainer.innerHTML = '';
        if (appElements.length === 0 && activeFilter === 'my-apps') {
            appsContainer.innerHTML = `<p class=\"col-span-full text-center text-gray-500 dark:text-gray-400\">У вас пока нет добавленных приложений. Нажмите \\\"+\\\" на карточке приложения, чтобы добавить его сюда.</p>`;
            return;
        }
        appElements.forEach(app => {
            const appClone = app.cloneNode(true);
            const button = appClone.querySelector('.add-to-my-apps-btn');
            if (button && myApps.includes(app.dataset.module)) {
                button.classList.add('is-added');
            }
            appsContainer.appendChild(appClone);
        });
    };

    let appsToRender = [];
    if (activeFilter === 'my-apps') {
        appsToRender = myApps.map(moduleName => appCardElements.get(moduleName)).filter(Boolean);
    } else {
        let sortedApps = [...allAppCards];
        if (activeFilter === 'popular') {
            sortedApps.sort((a, b) => (appPopularity[b.dataset.module] || 0) - (appPopularity[a.dataset.module] || 0));
        } else if (activeFilter === 'new') {
            sortedApps.sort((a, b) => allAppCards.indexOf(b) - allAppCards.indexOf(a));
        }
        appsToRender = sortedApps;
    }
    renderApps(appsToRender);
    
    if (activeFilter === 'my-apps') {
        initializeDragAndDrop();
    }
    
    if (searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function setupFilters() {
    const filterContainer = document.getElementById('filter-container');
    if (!filterContainer) return;
    filterContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button || button.classList.contains('active')) return;
        filterContainer.querySelector('.active')?.classList.remove('active');
        button.classList.add('active');
        applyAppListFilterAndRender();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    setupSearch(); 
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
    changelogContainer.addEventListener('click', (e) => {
        if (e.target.id === 'show-all-changelog-btn') {
            e.preventDefault();
            const moduleFile = appNameToModuleFile['История изменений'];
            history.pushState({}, '', `?app=${moduleFile}`);
            router();
            return;
        }
    });
    dynamicContentArea.addEventListener('click', async e => {
        const addBtn = e.target.closest('.add-to-my-apps-btn');
        if (addBtn) {
            e.preventDefault(); 
            e.stopPropagation();
            if (!auth.currentUser) {
                alert('Пожалуйста, войдите в аккаунт, чтобы добавлять приложения в \"Мои приложения\".');
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
                alert('Пожалуйста, войдите в аккаунт, чтобы добавлять приложения в \"Мои приложения\".');
                return;
            }
            const moduleName = addBtnAppView.dataset.module;
            await toggleMyAppStatus(moduleName);
            await updateAppViewButton(moduleName);
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
            const myAppsButton = document.querySelector('[data-sort=\"my-apps\"]');
            if (myAppsButton?.classList.contains('active')) {
                myAppsButton.classList.remove('active');
                document.querySelector('[data-sort=\"default\"]')?.classList.add('active');
            }
        }

        updateAuthStateUI(user);
        
        if (!isInitialAuthCheckDone) {
            isInitialAuthCheckDone = true;
            
            // ИЗМЕНЕНИЕ: Открывать "Мои приложения" по умолчанию для залогиненных
            const params = new URLSearchParams(window.location.search);
            const appModule = params.get('app');
            if (user && !appModule) { // Только на главной странице
                document.querySelector('[data-sort="default"]')?.classList.remove('active');
                document.querySelector('[data-sort="my-apps"]')?.classList.add('active');
            }
            
            await router(); 
            const loader = document.getElementById('initial-loading-overlay');
            if (loader) {
                loader.style.display = 'none';
            }
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
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.error('Ошибка регистрации Service Worker:', error);
                });
        });
    }
});
