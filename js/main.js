import { renderChangelog, getChangelogData } from './utils/changelog.js';

// 22ИЗМЕНЕНИЕ: Импортируем auth и db из нашего конфигурационного файла
import { auth, db } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- Сопоставление имен приложений с файлами модулей (без изменений) ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
    'Сжатие аудио': 'audioCompressor',
    'Мой IP': 'myIp',
    'Генератор паролей': 'passwordGenerator',
    'Калькулятор процентных соотношений': 'percentageCalculator',
    'Таймер': 'timer',
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
    'Счетчик слов и символов': 'wordCounter',
    'Сканер QR-кодов': 'qrScanner',
    'Пианино': 'piano',
    'История изменений': 'changelogPage',
    'Конвертер регистра': 'caseConverter',
    'Конвертер форматов изображений': 'imageConverter',
    'Конвертер цветов': 'colorConverter',
    'Игра на память': 'memoryGame',
    'Транслитерация текста': 'textTranslit',
    'Изменение размера изображений': 'imageResizer',
    'Калькулятор валют': 'currencyCalculator',
    'Змейка': 'snakeGame',
};
const appPopularity = {
    'speedTest': 95, 'radio': 88, 'notesAndTasks': 92, 'qrCodeGenerator': 94,
    'passwordGenerator': 85, 'unitConverter': 89, 'myIp': 80, 'soundAndMicTest': 78,
    'bmiCalculator': 75, 'wordCounter': 82, 'timer': 70, 'stopwatch': 68,
    'audioCompressor': 65, 'percentageCalculator': 66, 'dateCalculator': 64,
    'qrScanner': 86, 'piano': 77, 'minesweeper': 81, 'ticTacToe': 71,
    'emojiAndSymbols': 79, 'fortuneWheel': 62, 'magicBall': 60, 'randomColor': 55,
    'numberGenerator': 54, 'changelogPage': 10,
    'imageConverter': 91, 'colorConverter': 87, 'memoryGame': 83, 'caseConverter': 76,
    'imageResizer': 90, 'currencyCalculator': 86, 'textTranslit': 72, 'snakeGame': 74,
};
const appSearchMetadata = {
    'speedTest': { keywords: ['интернет', 'скорость', 'speed', 'test', 'пинг', 'ping'], hashtags: ['#internet', '#tools'] },
    'radio': { keywords: ['музыка', 'станции', 'слушать'], hashtags: ['#music', '#entertainment'] },
    'notesAndTasks': { keywords: ['задачи', 'список', 'дела', 'todo', 'записная книжка'], hashtags: ['#organizer', '#tools'] },
    'soundAndMicTest': { keywords: ['микрофон', 'звук', 'проверка', 'динамики', 'наушники'], hashtags: ['#audio', '#tools'] },
    'audioCompressor': { keywords: ['сжать', 'аудио', 'mp3', 'размер', 'уменьшить'], hashtags: ['#audio', '#tools'] },
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
    'wordCounter': { keywords: ['счетчик', 'слова', 'символы', 'текст', 'статистика', 'подсчет'], hashtags: ['#text', '#tools'] },
    'qrScanner': { keywords: ['qr', 'код', 'сканер', 'читать', 'камера', 'scan'], hashtags: ['#tools', '#camera'] },
    'piano': { keywords: ['пианино', 'синтезатор', 'музыка', 'играть', 'клавиши'], hashtags: ['#music', '#fun'] },
    'caseConverter': { keywords: ['конвертер', 'регистр', 'текст', 'верхний', 'нижний', 'заглавные', 'буквы', 'case'], hashtags: ['#text', '#tools'] },
    'imageConverter': { keywords: ['конвертер', 'изображения', 'картинки', 'png', 'jpg', 'webp', 'формат', 'преобразовать'], hashtags: ['#image', '#tools', '#converter'] },
    'colorConverter': { keywords: ['конвертер', 'цвет', 'hex', 'rgb', 'hsl', 'палитра', 'код цвета'], hashtags: ['#color', '#design', '#converter'] },
    'memoryGame': { keywords: ['игра', 'память', 'карточки', 'пары', 'тренировка', 'запомнить'], hashtags: ['#game', '#fun', '#logic'] },
    'textTranslit': { keywords: ['транслит', 'латиница', 'кириллица', 'текст', 'перевод', 'cyrillic', 'latin'], hashtags: ['#text', '#tools'] },
    'imageResizer': { keywords: ['изображение', 'картинка', 'размер', 'уменьшить', 'увеличить', 'ресайз', 'resize'], hashtags: ['#image', '#tools'] },
    'currencyCalculator': { keywords: ['валюта', 'курс', 'доллар', 'евро', 'рубль', 'конвертер', 'обмен'], hashtags: ['#finance', '#calculator', '#converter'] },
    'snakeGame': { keywords: ['игра', 'змейка', 'классика', 'аркада', 'snake'], hashtags: ['#game', '#fun'] },
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
 *  ЛОГИКА АВТОРИЗАЦИИ И РАБОТЫ С FIREBASE
 * =======================================================
 */

const userProfileElement = document.getElementById('user-profile');
const userAvatarElement = document.getElementById('user-avatar');
const userNameElement = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');
const googleSignInContainer = document.getElementById('google-signin-top-right-container');

function renderGoogleButton() {
    if (googleSignInContainer && !auth.currentUser) {
        googleSignInContainer.innerHTML = '';
        window.google.accounts.id.renderButton(
            googleSignInContainer,
            { type: "icon", shape: "circle", theme: "outline", size: "large" }
        );
        googleSignInContainer.classList.remove('hidden');
    }
}

function updateAuthStateUI(user) {
    if (user) {
        if(userNameElement) userNameElement.textContent = user.displayName;
        if(userAvatarElement) userAvatarElement.src = user.photoURL;
        if(userProfileElement) userProfileElement.classList.remove('hidden');
        if(googleSignInContainer) googleSignInContainer.classList.add('hidden');
    } else {
        if(userProfileElement) userProfileElement.classList.add('hidden');
        if(googleSignInContainer) googleSignInContainer.classList.remove('hidden');
    }
}

async function getPinnedApps() {
    const user = auth.currentUser;
    if (!user) {
        const guestPins = localStorage.getItem('pinnedApps_guest');
        return guestPins ? JSON.parse(guestPins) : [];
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data().pinnedApps || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error getting pinned apps:", error);
        return [];
    }
}

async function savePinnedApps(pinnedModules) {
    const user = auth.currentUser;
    if (!user) {
        localStorage.setItem('pinnedApps_guest', JSON.stringify(pinnedModules));
        return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, { pinnedApps: pinnedModules }, { merge: true });
    } catch (error) {
        console.error("Error saving pinned apps:", error);
    }
}

function handleCredentialResponse(response) {
    const googleCredential = GoogleAuthProvider.credential(response.credential);
    signInWithCredential(auth, googleCredential)
        .catch((error) => {
            console.error("Firebase sign-in error", error);
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
        renderGoogleButton();
    }
}
// --- КОНЕЦ ЛОГИКИ FIREBASE ---

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
    allAppCards = Array.from(appCardElements.values());
}

async function renderSimilarApps(currentModule, container) { /* ... (код функции без изменений) ... */ }
async function router() { /* ... (код функции без изменений) ... */ }
function setupNavigationEvents() { /* ... (код функции без изменений) ... */ }
function setupSearch() { /* ... (код функции без изменений) ... */ }

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
    applyAppListFilterAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    
    // ... (код для темы, поиска, кликов по карточкам и т.д. без изменений) ...
    // ... он будет вставлен сюда ...

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

    // --- Инициализация ---
    signOutBtn.addEventListener('click', handleSignOut);
    
    onAuthStateChanged(auth, user => {
        console.log("Auth state changed, user:", user ? user.displayName : 'none');
        updateAuthStateUI(user);
        applyAppListFilterAndRender();
        renderGoogleButton();
    });
    
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
        }
    }, 100);

    window.addEventListener('popstate', router);
    setupNavigationEvents();
    router();
});

// Мы оставляем эти функции здесь, чтобы не копировать их полный код снова
async function router() { /* ... (код функции без изменений) ... */ }
function setupNavigationEvents() { /* ... (код функции без изменений) ... */ }
function setupSearch() { /* ... (код функции без изменений) ... */ }
async function renderSimilarApps(currentModule, container) { /* ... (код функции без изменений) ... */ }
