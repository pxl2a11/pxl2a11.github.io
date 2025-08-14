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

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-8">
            <div id="magic-ball" class="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300">
                <div class="w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center">
                    <p id="magic-ball-answer" class="text-white text-center font-bold text-lg p-2">Спроси меня</p>
                </div>
            </div>
            <button id="shake-ball-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Потрясти шар</button>
            <div class="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2 mt-4">
                 <h4 class="text-center font-semibold text-sm mb-2">Пользовательские ответы</h4>
                 <textarea id="custom-answers-textarea" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" rows="4" placeholder="Введите каждый ответ с новой строки... Если поле заполнено, будут использоваться только эти ответы."></textarea>
                 <button id="save-custom-answers-btn" class="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 text-sm transition-colors">Сохранить ответы</button>
            </div>
        </div>`;
}

export async function init() {
    const ball = document.getElementById('magic-ball');
    const answerEl = document.getElementById('magic-ball-answer');
    const shakeBtn = document.getElementById('shake-ball-btn');
    const customAnswersTextarea = document.getElementById('custom-answers-textarea');
    const saveAnswersBtn = document.getElementById('save-custom-answers-btn');
    
    const answersManager = getStorageManager('magicBallCustomAnswers');
    
    const defaultAnswers = [ "Бесспорно", "Предрешено", "Никаких сомнений", "Определённо да", "Можешь быть уверен в этом", "Мне кажется — «да»", "Вероятнее всего", "Хорошие перспективы", "Знаки говорят — «да»", "Да", "Пока не ясно, попробуй снова", "Спроси позже", "Лучше не рассказывать", "Сейчас нельзя предсказать", "Сконцентрируйся и спроси опять", "Даже не думай", "Мой ответ — «нет»", "По моим данным — «нет»", "Перспективы не очень хорошие", "Весьма сомнительно" ];

    async function loadCustomAnswers() {
        const answers = await answersManager.getData();
        if (answers && answers.length > 0) {
            customAnswersTextarea.value = answers.join('\n');
        }
    }

    async function saveCustomAnswers() {
        const answers = customAnswersTextarea.value.split('\n').map(a => a.trim()).filter(a => a.length > 0);
        await answersManager.saveData(answers);
        
        saveAnswersBtn.textContent = 'Сохранено!';
        saveAnswersBtn.classList.replace('bg-green-500', 'bg-blue-500');
        saveAnswersBtn.classList.replace('hover:bg-green-600', 'hover:bg-blue-600');
        setTimeout(() => {
            saveAnswersBtn.textContent = 'Сохранить ответы';
            saveAnswersBtn.classList.replace('bg-blue-500', 'bg-green-500');
            saveAnswersBtn.classList.replace('hover:bg-blue-600', 'hover:bg-green-600');
        }, 2000);
    }

    const getAnswer = async () => {
        const customAnswers = await answersManager.getData();
        const answersToUse = (customAnswers && customAnswers.length > 0) ? customAnswers : defaultAnswers;
        
        answerEl.textContent = '...';
        answerEl.style.fontSize = '1.125rem';
        ball.classList.add('shake-animation');
        
        setTimeout(() => {
            const randomAnswer = answersToUse[Math.floor(Math.random() * answersToUse.length)];
            answerEl.textContent = randomAnswer || 'Спроси позже';
            if(randomAnswer && randomAnswer.length > 20) {
                 answerEl.style.fontSize = '0.9rem';
            }
            ball.classList.remove('shake-animation');
        }, 800);
    };

    shakeBtn.addEventListener('click', getAnswer);
    ball.addEventListener('click', getAnswer);
    saveAnswersBtn.addEventListener('click', saveCustomAnswers);

    await loadCustomAnswers();
}

export function cleanup() {}
