export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-8">
            <div id="magic-ball" class="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300">
                <div class="w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center">
                    <p id="magic-ball-answer" class="text-white text-center font-bold text-lg p-2">Спроси меня</p>
                </div>
            </div>
            <button id="shake-ball-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Потрясти шар</button>
        </div>`;
}

export function init() {
    const ball = document.getElementById('magic-ball');
    const answerEl = document.getElementById('magic-ball-answer');
    const shakeBtn = document.getElementById('shake-ball-btn');
    const answers = [ "Бесспорно", "Предрешено", "Никаких сомнений", "Определённо да", "Можешь быть уверен в этом", "Мне кажется — «да»", "Вероятнее всего", "Хорошие перспективы", "Знаки говорят — «да»", "Да", "Пока не ясно, попробуй снова", "Спроси позже", "Лучше не рассказывать", "Сейчас нельзя предсказать", "Сконцентрируйся и спроси опять", "Даже не думай", "Мой ответ — «нет»", "По моим данным — «нет»", "Перспективы не очень хорошие", "Весьма сомнительно" ];

    const getAnswer = () => {
        answerEl.textContent = '...';
        ball.classList.add('shake-animation');
        setTimeout(() => {
            const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
            answerEl.textContent = randomAnswer;
            ball.classList.remove('shake-animation');
        }, 800);
    };

    shakeBtn.addEventListener('click', getAnswer);
    ball.addEventListener('click', getAnswer);
}

export function cleanup() {}
