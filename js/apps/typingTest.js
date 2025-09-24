// 25js/apps/typingTest.js

let timerInterval;
let time = 0;
let isTestRunning = false;

// Переменные для графика и истории
let wpmChart;
let wpmHistoryData = [];

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
        <div class="max-w-4xl mx-auto space-y-6">
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
            
            <div class="text-center">
                <button id="reset-typing-test-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Начать заново</button>
            </div>

            <!-- Блок для графика -->
            <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                 <h3 class="text-lg font-bold text-center mb-2">Прогресс WPM (в реальном времени)</h3>
                 <canvas id="wpm-chart"></canvas>
            </div>

            <!-- Блок для истории результатов -->
            <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 class="text-lg font-bold text-center mb-2">История тестов</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-sm text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="p-2">WPM</th>
                                <th class="p-2">Точность</th>
                                <th class="p-2">Дата</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body">
                            <!-- Данные будут добавлены из JS -->
                        </tbody>
                    </table>
                </div>
            </div>
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

    // --- Функции для истории результатов ---
    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('typingTestHistory')) || [];
        const tableBody = document.getElementById('history-table-body');
        tableBody.innerHTML = ''; // Очищаем таблицу перед отрисовкой
        
        // Показываем последние 10 результатов
        history.slice(-10).reverse().forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-2 font-bold">${result.wpm}</td>
                <td class="p-2">${result.accuracy}%</td>
                <td class="p-2 text-sm">${new Date(result.date).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function saveResult(wpm, accuracy) {
        const history = JSON.parse(localStorage.getItem('typingTestHistory')) || [];
        const newResult = { wpm, accuracy, date: new Date().toISOString() };
        history.push(newResult);
        localStorage.setItem('typingTestHistory', JSON.stringify(history));
    }

    // --- Функции для графика ---
    function initChart() {
        const ctx = document.getElementById('wpm-chart').getContext('2d');
        wpmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Слов/мин',
                    data: [],
                    borderColor: '#3b82f6', // blue-500
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } },
                animation: { duration: 200 }
            }
        });
    }

    function updateChart() {
        const currentWPM = calculateWPM(true); // Получаем текущий WPM
        wpmHistoryData.push(currentWPM);
        
        wpmChart.data.labels = wpmHistoryData.map((_, i) => i + 1);
        wpmChart.data.datasets[0].data = wpmHistoryData;
        wpmChart.update();
    }
    
    // --- Основная логика теста ---
    function startTest() {
        if (isTestRunning) return;
        isTestRunning = true;
        time = 0;
        timerDisplay.textContent = time;
        timerInterval = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
            calculateWPM();
            updateChart(); // Обновляем график каждую секунду
        }, 1000);
    }

    function endTest() {
        clearInterval(timerInterval);
        isTestRunning = false;
        textInput.disabled = true;

        const finalWPM = calculateWPM();
        const finalAccuracy = calculateAccuracy();

        saveResult(finalWPM, finalAccuracy); // Сохраняем результат
        renderHistory(); // Перерисовываем историю
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

        // Сброс данных графика
        wpmHistoryData = [];
        if (wpmChart) {
            wpmChart.data.labels = [];
            wpmChart.data.datasets[0].data = [];
            wpmChart.update();
        }
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
        if (textDisplay.children.length > 0) {
           textDisplay.children[0].classList.add('current');
        }
    }

    function calculateWPM(isForChart = false) {
        // Стандартный подсчет WPM: (количество символов / 5) / минуты
        const typedChars = textInput.value.length;
        if (time > 0) {
            const wpm = Math.round((typedChars / 5) / (time / 60));
            if (!isForChart) { // Обновляем главный дисплей, только если это не промежуточный подсчет для графика
               wpmDisplay.textContent = wpm;
            }
            return wpm;
        }
        return 0;
    }

    function calculateAccuracy() {
        const originalText = Array.from(textDisplay.children).map(s => s.innerText).join('');
        const typedText = textInput.value;
        if (typedText.length === 0) return 100;

        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === originalText[i]) {
                correctChars++;
            }
        }
        const accuracy = (correctChars / typedText.length) * 100;
        const roundedAccuracy = Math.round(accuracy) || 100;
        accuracyDisplay.textContent = `${roundedAccuracy}%`;
        return roundedAccuracy;
    }

    textInput.addEventListener('input', () => {
        if (!isTestRunning) startTest();

        const textChars = textDisplay.querySelectorAll('span');
        const inputChars = textInput.value.split('');
        
        let correctSoFar = true;
        textChars.forEach((charSpan, index) => {
            const char = inputChars[index];

            // Сбрасываем классы для будущих символов
            charSpan.className = '';

            if (char == null) {
                // Это символ, который еще не набран
                if (index === inputChars.length) {
                    charSpan.classList.add('current'); // Следующий символ для набора
                }
                correctSoFar = false;
            } else if (char === charSpan.innerText) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
                correctSoFar = false;
            }
        });
        
        // Если весь текст набран правильно, заканчиваем тест
        if (inputChars.length === textChars.length && correctSoFar) {
            endTest();
        }
    });

    resetBtn.addEventListener('click', resetTest);
    
    // --- Первоначальная настройка ---
    resetTest();
    initChart();
    renderHistory();
}

export function cleanup() {
    clearInterval(timerInterval);
    if (wpmChart) {
        wpmChart.destroy();
    }
}
