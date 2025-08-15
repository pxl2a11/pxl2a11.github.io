import { renderChangelog, getChangelogData } from './utils/changelog.js';
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { fetchUserAccountData, clearUserData, getUserData, saveUserData } from './dataManager.js';

// --- 26Сопоставление имен приложений и другие метаданные (без изменений) ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest', 'Радио': 'radio', 'Заметки и задачи': 'notesAndTasks', 'Тест звука и микрофона': 'soundAndMicTest', 'Сжатие аудио': 'audioCompressor', 'Мой IP': 'myIp', 'Генератор паролей': 'passwordGenerator', 'Калькулятор процентных соотношений': 'percentageCalculator', 'Таймер': 'timer', 'Колесо фортуны': 'fortuneWheel', 'Шар предсказаний': 'magicBall', 'Крестики-нолики': 'ticTacToe', 'Сапер': 'minesweeper', 'Секундомер': 'stopwatch', 'Случайный цвет': 'randomColor', 'Генератор чисел': 'numberGenerator', 'Генератор QR-кодов': 'qrCodeGenerator', 'Эмодзи и символы': 'emojiAndSymbols', 'Конвертер величин': 'unitConverter', 'Калькулятор дат': 'dateCalculator', 'Калькулятор ИМТ': 'bmiCalculator', 'Счетчик слов и символов': 'wordCounter', 'Сканер QR-кодов': 'qrScanner', 'Пианино': 'piano', 'История изменений': 'changelogPage', 'Конвертер регистра': 'caseConverter', 'Конвертер форматов изображений': 'imageConverter', 'Конвертер цветов': 'colorConverter', 'Игра на память': 'memoryGame', 'Транслитерация текста': 'textTranslit', 'Изменение размера изображений': 'imageResizer', 'Калькулятор валют': 'currencyCalculator', 'Змейка': 'snakeGame', '2048': 'game2048', // ДОБАВЛЕНО: Игра 2048
};
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94, 'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78, 'bmiCalculator': 75, 'wordCounter': 82, 'timer': 70, 'stopwatch': 68, 'audioCompressor': 65, 'percentageCalculator': 66, 'dateCalculator': 64, 'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71, 'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55, 'numberGenerator': 54, 'changelogPage': 10, 'imageConverter': 91, 'colorConverter': 87, 'memoryGame': 83, 'caseConverter': 76, 'imageResizer': 90, 'currencyCalculator': 86, 'snakeGame': 74, 'game2048': 84, // ДОБАВЛЕНО: Игра 2048
};
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] }, 'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] }, 'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] }, 'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] }, 'audioCompressor': { keywords: ['сжать', 'аудио', 'mp3', 'размер', 'уменьшить'], hashtags: ['#audio', '#tools'] }, 'myIp': { keywords: ['ip', 'адрес', 'айпи', 'сеть'], hashtags: ['#network', '#tools'] }, 'passwordGenerator': { keywords: ['пароль', 'безопасность', 'создать', 'надежный'], hashtags: ['#security', '#tools'] }, 'percentageCalculator': { keywords: ['проценты', 'вычислить', 'доля'], hashtags: ['#math', '#calculator'] }, 'timer': { keywords: ['countdown', 'отсчет', 'время'], hashtags: ['#time', '#tools'] }, 'fortuneWheel': { keywords: ['рулетка', 'случайный', 'выбор', 'жребий'], hashtags: ['#random', '#game'] }, 'magicBall': { keywords: ['предсказание', 'ответ', 'восьмерка', 'да нет'], hashtags: ['#fun', '#game'] }, 'ticTacToe': { keywords: ['игра', 'крестики', 'нолики', 'вдвоем'], hashtags: ['#game'] }, 'minesweeper': { keywords: ['игра', 'мины', 'головоломка', 'логика'], hashtags: ['#game', '#logic'] }, 'stopwatch': { keywords: ['время', 'хронометр', 'измерить'], hashtags: ['#time', '#tools'] }, 'randomColor': { keywords: ['цвет', 'случайный', 'палитра', 'дизайн', 'hex'], hashtags: ['#design', '#random', '#color'] }, 'numberGenerator': { keywords: ['случайное', 'число', 'рандом', 'выбор'], hashtags: ['#random', '#math'] }, 'qrCodeGenerator': { keywords: ['qr', 'код', 'куар', 'ссылка'], hashtags: ['#tools', '#generator'] }, 'emojiAndSymbols': { keywords: ['эмодзи', 'символы', 'скопировать', 'смайлик'], hashtags: ['#text', '#tools'] }, 'unitConverter': { keywords: ['конвертер', 'единицы', 'измерения', 'перевести'], hashtags: ['#converter', '#math'] }, 'dateCalculator': { keywords: ['дата', 'дни', 'календарь', 'разница'], hashtags: ['#time', '#calculator'] }, 'bmiCalculator': { keywords: ['имт', 'вес', 'рост', 'здоровье', 'индекс массы тела'], hashtags: ['#health', '#calculator'] }, 'wordCounter': { keywords: ['счетчик', 'слова', 'символы', 'текст', 'статистика', 'подсчет'], hashtags: ['#text', '#tools'] }, 'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] }, 'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] }, 'caseConverter': { keywords: ['конвертер', 'регистр', 'текст', 'верхний', 'нижний', 'заглавные', 'буквы', 'case'], hashtags: ['#text', '#tools'] }, 'imageConverter': { keywords: ['конвертер', 'изображения', 'картинки', 'png', 'jpg', 'webp', 'формат', 'преобразовать'], hashtags: ['#image', '#tools', '#converter'] }, 'colorConverter': { keywords: ['конвертер', 'цвет', 'hex', 'rgb', 'hsl', 'палитра', 'код цвета'], hashtags: ['#color', '#design', '#converter'] }, 'memoryGame': { keywords: ['игра', 'память', 'карточки', 'пары', 'тренировка', 'запомнить'], hashtags: ['#game', '#fun', '#logic'] }, 'textTranslit': { keywords: ['транслит', 'латиница', 'кириллица', 'текст', 'перевод', 'cyrillic', 'latin'], hashtags: ['#text', '#tools'] }, 'imageResizer': { keywords: ['изображение', 'картинка', 'размер', 'уменьшить', 'увеличить', 'ресайз', 'resize'], hashtags: ['#image', '#tools'] }, 'currencyCalculator': { keywords: ['валюта', 'курс', 'доллар', 'евро', 'рубль', 'конвертер', 'обмен'], hashtags: ['#finance', '#calculator', '#converter'] }, 'snakeGame': { keywords: ['игра', 'змейка', 'классика', 'аркада', 'snake'], hashtags: ['#game', '#fun'] },
    'game2048': { keywords: ['2048', 'игра', 'головоломка', 'числа', 'логика'], hashtags: ['#game', '#puzzle'] }, // ДОБАВЛЕНО: Игра 2048
};
const moduleFileToAppName = Object.fromEntries(
  Object.entries(appNameToModuleFile).map(([name, file]) => [file, name])
);

// --- Глобальные переменные DOM ---
const dynamicContentArea = document.getElementById('dynamic-content-area');
const changelogContainer = document.getElementById('changelog-container');
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
let activeAppModule = null; 
const appCardElements = new Map();
let allAppCards = [];
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

/**
 * =======================================================
 * ЛОГИКА АВТОРИЗАЦИИ
 * =======================================================
 */
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
    if (user) {
        if (userNameElement) userNameElement.textContent = user.displayName;
        if (userAvatarElement) userAvatarElement.src = user.photoURL;
        if (userProfileElement) userProfileElement.classList.remove('hidden');
        if (googleSignInContainer) googleSignInContainer.classList.add('hidden');
    } else {
        if (userProfileElement) userProfileElement.classList.add('hidden');
        if (googleSignInContainer) googleSignInContainer.classList.remove('hidden');
    }
}

async function getPinnedApps() { return getUserData('pinnedApps', []); }
async function savePinnedApps(pinnedModules) { await saveUserData('pinnedApps', pinnedModules); }

function handleCredentialResponse(response) {
    const googleCredential = GoogleAuthProvider.credential(response.credential);
    signInWithCredential(auth, googleCredential)
        .catch((error) => console.error("Firebase sign-in error", error));
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
// --- КОНЕЦ ЛОГИКИ АВТОРИЗАЦИИ ---

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
    const topSimilar = similarModules.slice(0, 3);
    if (topSimilar.length === 0) { container.innerHTML = ''; container.classList.add('hidden'); return; }
    container.innerHTML = `<h3 class="text-xl font-bold mb-4">Похожие приложения</h3>`;
    const grid = document.createElement('div');
    grid.className = 'similar-apps-grid';
    topSimilar.forEach(module => {
        const card = appCardElements.get(module);
        if (card) grid.appendChild(card.cloneNode(true));
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
        if (searchInput) searchInput.value = '';
        if (suggestionsContainer) suggestionsContainer.classList.add('hidden');
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
            if (typeof module.init === 'function') await module.init();
            const appChangelogContainer = document.getElementById('app-changelog-container');
            const similarAppsContainer = document.getElementById('similar-apps-container');
            await renderSimilarApps(moduleName, similarAppsContainer);
            if (appName !== 'История изменений') renderChangelog(appName, null, appChangelogContainer);
        } catch (error) {
            console.error(`Ошибка загрузки модуля для "${appName}" (${moduleName}.js):`, error);
            document.getElementById('app-content-container').innerHTML = `<p class="text-center text-red-500">Не удалось загрузить приложение.</p>`;
        }
    } else {
        dynamicContentArea.innerHTML = homeScreenHtml;
        filterContainer?.classList.remove('hidden');
        changelogContainer.classList.remove('hidden');
        document.title = 'Mini Apps';
        setupFilters();
        setupSearch();
        renderChangelog(null, 3, changelogContainer);
        await applyAppListFilterAndRender();
    }
}

function setupNavigationEvents() {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link || e.target.closest('.pin-btn')) return;
        if (link.id === 'back-button') { e.preventDefault(); history.back(); return; }
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
        const appsContainer = document.getElementById('apps-container');
        if (!appsContainer) return;
        const allApps = appsContainer.querySelectorAll('.app-item');
        const searchTerm = searchInput.value.toLowerCase().trim();
        const suggestions = [];
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

async function applyAppListFilterAndRender() {
    const appsContainer = document.getElementById('apps-container');
    if (!appsContainer) return;

    const filterContainer = document.getElementById('filter-container');
    const activeFilter = filterContainer.querySelector('.active')?.dataset.sort || 'default';
    const pinnedModules = await getPinnedApps();

    const renderApps = (appElements) => {
        appsContainer.innerHTML = '';
        appElements.forEach(app => {
            const appClone = app.cloneNode(true);
            const pinBtn = appClone.querySelector('.pin-btn');
            if (pinBtn) {
                pinBtn.classList.remove('pinned');
                if (pinnedModules.includes(app.dataset.module)) {
                    pinBtn.classList.add('pinned');
                }
            }
            appsContainer.appendChild(appClone);
        });
    };

    let unpinnedAppCards = [];
    const pinnedAppCardsMap = new Map();
    pinnedModules.forEach(module => pinnedAppCardsMap.set(module, null));
    allAppCards.forEach(card => {
        const module = card.dataset.module;
        if (pinnedModules.includes(module)) {
            pinnedAppCardsMap.set(module, card);
        } else {
            unpinnedAppCards.push(card);
        }
    });
    const pinnedAppCards = Array.from(pinnedAppCardsMap.values()).filter(Boolean);
    let sortedUnpinned;
    if (activeFilter === 'popular') {
        sortedUnpinned = [...unpinnedAppCards].sort((a, b) => (appPopularity[b.dataset.module] || 0) - (appPopularity[a.dataset.module] || 0));
    } else if (activeFilter === 'new') {
        sortedUnpinned = [...unpinnedAppCards].sort((a, b) => allAppCards.indexOf(b) - allAppCards.indexOf(a));
    } else {
        sortedUnpinned = unpinnedAppCards;
    }
    const finalAppList = [...pinnedAppCards, ...sortedUnpinned];
    renderApps(finalAppList);
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
        const pinBtn = e.target.closest('.pin-btn');
        if (pinBtn) {
            e.preventDefault(); 
            e.stopPropagation();
            const appCard = pinBtn.closest('.app-item');
            const moduleName = appCard?.dataset.module;
            if (!moduleName) return;
            let pinnedApps = await getPinnedApps();
            if (pinnedApps.includes(moduleName)) {
                pinnedApps = pinnedApps.filter(m => m !== moduleName);
            } else {
                pinnedApps.push(moduleName);
            }
            await savePinnedApps(pinnedApps);
            await applyAppListFilterAndRender();
        }
    });

    // --- ГЛАВНЫЙ ИСПРАВЛЕННЫЙ ПОТОК ЗАГРУЗКИ ---
    let isInitialAuthCheckDone = false;
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await fetchUserAccountData(user.uid);
        } else {
            clearUserData();
        }

        updateAuthStateUI(user);
        
        if (!isInitialAuthCheckDone) {
            isInitialAuthCheckDone = true;
            await router(); 
        } else {
            await router();
        }

        if (isGsiInitialized) {
            renderGoogleButton();
        }
    });
    
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
        }
    }, 100);
});
