import { auth, db } from '/js/firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const getStorageManager = (dataKey, defaultValue = []) => {
    return {
        async getData() {
            const user = auth.currentUser;
            if (!user) {
                const localData = localStorage.getItem(`${dataKey}_guest`);
                return localData ? JSON.parse(localData) : defaultValue;
            }
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                return (docSnap.exists() && docSnap.data()[dataKey]) ? docSnap.data()[dataKey] : defaultValue;
            } catch (error) {
                console.error(`Error getting ${dataKey}:`, error);
                return defaultValue;
            }
        },
        async saveData(data) {
            const user = auth.currentUser;
            if (!user) {
                localStorage.setItem(`${dataKey}_guest`, JSON.stringify(data));
                return;
            }
            const userDocRef = doc(db, 'users', user.uid);
            try {
                await setDoc(userDocRef, { [dataKey]: data }, { merge: true });
            } catch (error) {
                console.error(`Error saving ${dataKey}:`, error);
            }
        }
    };
};


// --- State Management ---
let timeoutId;
let intersectionObserver;
const RECENT_SYMBOLS_KEY = 'recentSymbols';
const RECENT_EMOJI_KEY = 'recentEmojis';
const RECENT_LIMIT = 24;

// --- Helper Functions ---
const recentSymbolsManager = getStorageManager(RECENT_SYMBOLS_KEY);
const recentEmojisManager = getStorageManager(RECENT_EMOJI_KEY);

const getRecent = async (key) => {
    return key === RECENT_SYMBOLS_KEY ? await recentSymbolsManager.getData() : await recentEmojisManager.getData();
};

const addToRecent = async (key, symbol) => {
    let recent = await getRecent(key);
    recent = recent.filter(item => item.c !== symbol.c);
    recent.unshift(symbol);
    if (recent.length > RECENT_LIMIT) {
        recent.pop();
    }
    await (key === RECENT_SYMBOLS_KEY ? recentSymbolsManager.saveData(recent) : recentEmojisManager.saveData(recent));
};

// --- Data (без изменений) ---
// ... (все ваши объекты symbols, emojis, emojiKeywords)
const symbols = [ /* ... */ ];
const emojis = [ /* ... */ ];
const emojiKeywords = { /* ... */ };
emojis.forEach(category => category.items.forEach(item => { item.k = emojiKeywords[item.s] || ''; }));
const allSymbols = [].concat(...symbols.filter(c => c.name !== 'Недавно использованные').map(c => c.items));
const allEmojis = [].concat(...emojis.filter(c => c.name !== 'Недавно использованные').map(c => c.items));


export function getHtml() {
    return `
        <style>
            /* ... (стили без изменений) ... */
        </style>
        <div class="space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50">Скопировано!</div>
            <div class="relative">
                <input type="search" id="symbol-search" placeholder="Поиск..." class="w-full p-3 pl-10 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div class="flex border-b border-gray-300 dark:border-gray-600">
                <button data-tab="symbols" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Символы</button>
                <button data-tab="emojis" class="tab-btn py-2 px-4 font-semibold border-b-2">Эмодзи</button>
            </div>
            <div class="flex flex-col md:flex-row gap-8">
                <nav id="categories-nav" class="w-full md:w-48 flex-shrink-0"></nav>
                <main id="content-area" class="flex-grow min-w-0"></main>
                <div id="search-results" class="hidden flex-grow min-w-0"></div>
            </div>
        </div>
    `;
}

// ... (функции createItemButton, renderContent, renderNav без изменений)

export async function init() {
    const contentArea = document.getElementById('content-area');
    const navArea = document.getElementById('categories-nav');
    const searchResultsArea = document.getElementById('search-results');
    const searchInput = document.getElementById('symbol-search');
    const notification = document.getElementById('copy-notification');
    const tabs = document.querySelectorAll('.tab-btn');
    
    let activeTab = 'symbols';
    // Инициализируем данные для вкладок
    const dataMap = { 
        symbols: JSON.parse(JSON.stringify(symbols)), 
        emojis: JSON.parse(JSON.stringify(emojis))
    };

    const updateRecent = async (tab) => {
        const key = tab === 'symbols' ? RECENT_SYMBOLS_KEY : RECENT_EMOJI_KEY;
        dataMap[tab][0].items = await getRecent(key);
    };
    
    const render = async () => {
        await updateRecent(activeTab);
        const data = dataMap[activeTab];
        renderContent(contentArea, data, activeTab === 'emojis');
        renderNav(navArea, data);
        setupIntersectionObserver();
    };

    const handleSearch = () => {
        // ... (код функции без изменений)
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            render();
            handleSearch();
        });
    });

    searchInput.addEventListener('input', handleSearch);
    
    navArea.addEventListener('click', e => {
        // ... (код функции без изменений)
    });

    document.getElementById('app-content-container').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-copy]');
        if (button) {
            const copyText = button.dataset.copy;
            const keywords = button.dataset.keywords;
            const isEmoji = activeTab === 'emojis';
            
            const dataToSave = { s: button.textContent, c: copyText, k: keywords, d: button.textContent !== copyText ? button.textContent : undefined };
            addToRecent(isEmoji ? RECENT_EMOJI_KEY : RECENT_SYMBOLS_KEY, dataToSave);
            
            navigator.clipboard.writeText(copyText);
            notification.classList.remove('opacity-0');
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
        }
    });

    function setupIntersectionObserver() {
        // ... (код функции без изменений)
    }
    
    await render();
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
    if (intersectionObserver) intersectionObserver.disconnect();
}
