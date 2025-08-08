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
                 <textarea id="custom-answers-textarea" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" rows="4" placeholder="Введите каждый ответ с новой строки..."></textarea>
                 <button id="save-custom-answers-btn" class="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 text-sm">Сохранить ответы</button>
            </div>
        </div>`;
}

export function init() {
    const ball = document.getElementById('magic-ball');
    const answerEl = document.getElementById('magic-ball-answer');
    const shakeBtn = document.getElementById('shake-ball-btn');
    const customAnswersTextarea = document.getElementById('custom-answers-textarea');
    const saveAnswersBtn = document.getElementById('save-custom-answers-btn');
    
    const defaultAnswers = [ "Бесспорно", "Предрешено", "Никаких сомнений", "Определённо да", "Можешь быть уверен в этом", "Мне кажется — «да»", "Вероятнее всего", "Хорошие перспективы", "Знаки говорят — «да»", "Да", "Пока не ясно, попробуй снова", "Спроси позже", "Лучше не рассказывать", "Сейчас нельзя предсказать", "Сконцентрируйся и спроси опять", "Даже не думай", "Мой ответ — «нет»", "По моим данным — «нет»", "Перспективы не очень хорошие", "Весьма сомнительно" ];

    function loadCustomAnswers() {
        const saved = localStorage.getItem('magicBallCustomAnswers');
        if (saved) {
            customAnswersTextarea.value = JSON.parse(saved).join('\n');
        }
    }

    function saveCustomAnswers() {
        const answers = customAnswersTextarea.value.split('\n').map(a => a.trim()).filter(a => a.length > 0);
        localStorage.setItem('magicBallCustomAnswers', JSON.stringify(answers));
        alert('Ответы сохранены!');
    }

    const getAnswer = () => {
        const customAnswersRaw = localStorage.getItem('magicBallCustomAnswers');
        const customAnswers = customAnswersRaw ? JSON.parse(customAnswersRaw) : [];
        const allAnswers = [...defaultAnswers, ...customAnswers];
        
        answerEl.textContent = '...';
        ball.classList.add('shake-animation');
        setTimeout(() => {
            const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
            answerEl.textContent = randomAnswer || 'Спроси позже';
            ball.classList.remove('shake-animation');
        }, 800);
    };

    shakeBtn.addEventListener('click', getAnswer);
    ball.addEventListener('click', getAnswer);
    saveAnswersBtn.addEventListener('click', saveCustomAnswers);

    loadCustomAnswers();
}

export function cleanup() {}
