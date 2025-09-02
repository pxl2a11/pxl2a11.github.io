// js/apps/typingTest.js

let timerInterval;
let time = 0;
let isTestRunning = false;

const TEXTS = [
    "Скорость печати важна для эффективной работы за компьютером, она позволяет экономить время.",
    "Быстрый набор текста помогает быстрее формулировать мысли и записывать идеи без задержек.",
    "Регулярные тренировки значительно улучшают мышечную память пальцев и координацию движений.",
    "Программисту, писателю или журналисту умение быстро печатать особенно необходимо в работе.",
    "Современные клавиатуры созданы для максимального удобства и скорости набора текста."
];

export function getHtml() {
    return `
        <style>
            #typing-text-display span.correct { color: #10b981; } /* green-500 */
            #typing-text-display span.incorrect { color: #ef4444; background-color: #fee2e2; } /* red-500, red-100 */
            .dark #typing-text-display span.incorrect { background-color: #450a0a; } /* dark:bg-red-900/50 */
            #typing-text-display span.current { text-decoration: underline; }
        </style>
        <div class="max-w-3xl mx-auto space-y-6 text-center">
            <div id="typing-results" class="grid grid-cols-3 gap-4 text-center">
                 <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Время</div>
                    <div id="timer-display" class="text-2xl font-bold">0</div>
                </div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Слов/мин</div>
                    <div id="wpm-display" class="text-2xl font-bold">0</div>
                </div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Точность</div>
                    <div id="accuracy-display" class="text-2xl font-bold">100%</div>
                </div>
            </div>

            <div id="typing-text-display" class="text-2xl p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono leading-relaxed select-none"></div>
            
            <textarea id="typing-input" rows="3" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" placeholder="Начните печатать здесь, чтобы запустить тест..."></textarea>
            
            <button id="reset-typing-test-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Начать заново</button>
        </div>
    `;
}

export function init() {
    const textDisplay = document.getElementById('typing-text-display');
    const textInput = document.getElementById('typing-input');
    const timerDisplay = document.getElementById('timer-display');
    const wpmDisplay = document.getElementById('wpm-display');
    const accuracyDisplay = document.getElementById('accuracy-display');
    const resetBtn = document.getElementById('reset-typing-test-btn');

    function startTest() {
        if (isTestRunning) return;
        isTestRunning = true;
        time = 0;
        timerDisplay.textContent = time;
        timerInterval = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
            calculateWPM();
        }, 1000);
    }

    function endTest() {
        clearInterval(timerInterval);
        isTestRunning = false;
        textInput.disabled = true;
        calculateWPM();
        calculateAccuracy();
    }

    function resetTest() {
        clearInterval(timerInterval);
        isTestRunning = false;
        time = 0;
        textInput.disabled = false;
        textInput.value = '';
        timerDisplay.textContent = '0';
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100%';
        loadNewText();
    }

    function loadNewText() {
        const randomIndex = Math.floor(Math.random() * TEXTS.length);
        const text = TEXTS[randomIndex];
        textDisplay.innerHTML = '';
        text.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            textDisplay.appendChild(charSpan);
        });
        textDisplay.children[0].classList.add('current');
    }

    function calculateWPM() {
        const wordsTyped = textInput.value.trim().split(/\s+/).filter(Boolean).length;
        if (time > 0) {
            const wpm = Math.round((wordsTyped / time) * 60);
            wpmDisplay.textContent = wpm;
        }
    }

    function calculateAccuracy() {
        const originalText = Array.from(textDisplay.children).map(s => s.innerText).join('');
        const typedText = textInput.value;
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === originalText[i]) {
                correctChars++;
            }
        }
        const accuracy = (correctChars / typedText.length) * 100;
        accuracyDisplay.textContent = `${Math.round(accuracy) || 100}%`;
    }

    textInput.addEventListener('input', () => {
        if (!isTestRunning) startTest();

        const textChars = textDisplay.querySelectorAll('span');
        const inputChars = textInput.value.split('');
        
        let allCorrect = true;
        textChars.forEach((charSpan, index) => {
            const char = inputChars[index];
            if (char == null) {
                charSpan.className = '';
                if (index === inputChars.length) {
                    charSpan.classList.add('current');
                }
                allCorrect = false;
            } else if (char === charSpan.innerText) {
                charSpan.className = 'correct';
            } else {
                charSpan.className = 'incorrect';
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            endTest();
        }
    });

    resetBtn.addEventListener('click', resetTest);
    resetTest(); // Initial setup
}

export function cleanup() {
    clearInterval(timerInterval);
}
