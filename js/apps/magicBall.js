import { auth, db } from '/js/firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Утилита для управления хранилищем
const getStorageManager = (dataKey) => {
    // ... (вставьте тот же код, что и в notesAndTasks.js)
};

export function getHtml() {
    // ... (HTML код без изменений)
}

export async function init() {
    // ... (получение всех элементов DOM без изменений)

    // ИЗМЕНЕНИЕ: Используем Storage Manager
    const answersManager = getStorageManager('magicBallCustomAnswers');

    async function loadCustomAnswers() {
        const answers = await answersManager.getData();
        if (answers && answers.length > 0) {
            customAnswersTextarea.value = answers.join('\n');
        }
    }

    async function saveCustomAnswers() {
        const answers = customAnswersTextarea.value.split('\n').map(a => a.trim()).filter(a => a.length > 0);
        await answersManager.saveData(answers);
        // ... (остальной код для анимации кнопки)
    }

    const getAnswer = async () => {
        const customAnswers = await answersManager.getData();
        const answersToUse = (customAnswers && customAnswers.length > 0) ? customAnswers : defaultAnswers;
        // ... (остальной код функции без изменений)
    };

    // ... (обработчики событий)

    await loadCustomAnswers();
}
