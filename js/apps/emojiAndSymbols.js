import { auth, db } from '/js/firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Утилита для управления хранилищем
const getStorageManager = (dataKey) => {
    // ... (вставьте тот же код, что и в notesAndTasks.js)
};

// ... (весь код до init() без изменений)

export function init() {
    // ... (получение всех элементов DOM без изменений)

    // ИЗМЕНЕНИЕ: Используем Storage Manager
    const recentSymbolsManager = getStorageManager(RECENT_SYMBOLS_KEY);
    const recentEmojisManager = getStorageManager(RECENT_EMOJI_KEY);
    
    const getRecent = async (key) => {
        return key === RECENT_SYMBOLS_KEY ? await recentSymbolsManager.getData() : await recentEmojisManager.getData();
    };
    
    const addToRecent = async (key, symbol) => {
        let recent = await getRecent(key);
        // ... (остальная логика функции без изменений)
        key === RECENT_SYMBOLS_KEY ? await recentSymbolsManager.saveData(recent) : await recentEmojisManager.saveData(recent);
    };

    const updateRecent = async (tab) => {
        const key = tab === 'symbols' ? RECENT_SYMBOLS_KEY : RECENT_EMOJI_KEY;
        dataMap[tab][0].items = await getRecent(key);
    };
    
    const render = async () => {
        await updateRecent(activeTab);
        // ... (остальной код функции)
    };
    
    // ... (весь остальной код init(), но замените вызовы updateRecent и addToRecent на await)

    render(); // Первый рендер
}
