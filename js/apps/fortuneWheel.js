import { auth, db } from '/js/firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Утилита для управления хранилищем
const getStorageManager = (dataKey) => {
    return {
        async getData() {
            const user = auth.currentUser;
            if (!user) {
                const localData = localStorage.getItem(`${dataKey}_guest`);
                return localData ? JSON.parse(localData) : {};
            }
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            return (docSnap.exists() && docSnap.data()[dataKey]) ? docSnap.data()[dataKey] : {};
        },
        async saveData(data) {
            const user = auth.currentUser;
            if (!user) {
                localStorage.setItem(`${dataKey}_guest`, JSON.stringify(data));
                return;
            }
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { [dataKey]: data }, { merge: true });
        }
    };
};

// ... (остальной код: getHtml, переменные, colorPalettes)

export async function init() {
    // ... (получение всех элементов DOM без изменений)

    // ИЗМЕНЕНИЕ: Используем Storage Manager
    const listsManager = getStorageManager('fortuneWheelLists');
    
    const getSavedLists = async () => await listsManager.getData();
    const populateSavedLists = async () => {
        const lists = await getSavedLists();
        // ... (остальной код функции без изменений)
    };
    const saveCurrentList = async () => {
        const name = listNameInput.value.trim();
        if (!name || options.length === 0) return;
        const lists = await getSavedLists();
        lists[name] = options;
        await listsManager.saveData(lists);
        // ... (остальной код функции без изменений)
    };
    const loadSelectedList = async () => {
        const name = savedListsSelect.value;
        if (!name) return;
        const lists = await getSavedLists();
        // ... (остальной код функции без изменений)
    };
    const deleteSelectedList = async () => {
        const name = savedListsSelect.value;
        if (!name) return;
        const lists = await getSavedLists();
        delete lists[name];
        await listsManager.saveData(lists);
        await populateSavedLists();
    };

    // ... (весь остальной код: drawWheel, rotateWheel, event listeners)

    updateOptionsUI();
    await populateSavedLists();
}
