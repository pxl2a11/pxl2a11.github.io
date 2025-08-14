import { auth, db } from '/js/firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Утилита для управления хранилищем
const getStorageManager = (dataKey) => {
    return {
        async getData() {
            const user = auth.currentUser;
            if (!user) {
                const localData = localStorage.getItem(`${dataKey}_guest`);
                return localData ? JSON.parse(localData) : [];
            }
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            return (docSnap.exists() && docSnap.data()[dataKey]) ? docSnap.data()[dataKey] : [];
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

export function getHtml() {
    // ... (HTML код без изменений)
}

export async function init() {
    // ... (получение всех элементов DOM без изменений)

    // ИЗМЕНЕНИЕ: Используем Storage Manager
    const tasksManager = getStorageManager('tasks');
    const notesManager = getStorageManager('notes');

    let tasks = await tasksManager.getData();
    let notes = await notesManager.getData();

    const saveTasks = () => tasksManager.saveData(tasks);
    const saveNotes = () => notesManager.saveData(notes);

    // ... (весь остальной код renderTasks, renderNotes и обработчики событий без изменений)

    // Initial Render
    renderTasks();
    renderNotes();
}
