// js/apps/virtualDice.js

export function getHtml() {
    return `
        <style>
            .dice-container {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                justify-content: center;
                min-height: 120px;
            }
            .dice {
                width: 70px;
                height: 70px;
                background-color: #f1f5f9; /* slate-100 */
                border: 2px solid #94a3b8; /* slate-400 */
                border-radius: 0.75rem;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 2rem;
                font-weight: bold;
                color: #1e293b; /* slate-800 */
                animation: roll-animation 0.5s ease-out;
            }
            .dark .dice {
                background-color: #334155; /* slate-700 */
                border-color: #64748b; /* slate-500 */
                color: #f1f5f9; /* slate-100 */
            }
            @keyframes roll-animation {
                0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
                50% { transform: scale(1.1) rotate(180deg); }
                100% { transform: scale(1) rotate(360deg); opacity: 1; }
            }
        </style>
        <div class="max-w-xl mx-auto p-4 space-y-6">
            <div id="dice-results-container" class="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner">
                <div id="dice-container" class="dice-container">
                    <p class="text-gray-500 dark:text-gray-400 self-center">Нажмите "Бросить", чтобы начать</p>
                </div>
            </div>
            
            <div class="text-center">
                <h3 class="text-3xl font-bold">Общая сумма: <span id="dice-total">0</span></h3>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                <div>
                    <label for="dice-count" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Количество</label>
                    <input type="number" id="dice-count" value="1" min="1" max="10" class="mt-1 w-full p-2 text-center rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
                </div>
                 <div>
                    <label for="dice-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Тип кубика</label>
                    <select id="dice-type" class="mt-1 w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
                        <option value="4">d4</option>
                        <option value="6" selected>d6</option>
                        <option value="8">d8</option>
                        <option value="10">d10</option>
                        <option value="12">d12</option>
                        <option value="20">d20</option>
                    </select>
                </div>
                 <div class="col-span-2 sm:col-span-1">
                    <button id="roll-dice-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105">Бросить</button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const rollBtn = document.getElementById('roll-dice-btn');
    const diceContainer = document.getElementById('dice-container');
    const diceCountInput = document.getElementById('dice-count');
    const diceTypeInput = document.getElementById('dice-type');
    const totalDisplay = document.getElementById('dice-total');

    rollBtn.addEventListener('click', () => {
        const count = parseInt(diceCountInput.value, 10);
        const sides = parseInt(diceTypeInput.value, 10);
        let total = 0;

        if (isNaN(count) || count < 1 || count > 10) {
            alert("Пожалуйста, введите количество кубиков от 1 до 10.");
            return;
        }

        diceContainer.innerHTML = ''; // Очищаем контейнер

        for (let i = 0; i < count; i++) {
            const result = Math.floor(Math.random() * sides) + 1;
            total += result;

            const diceEl = document.createElement('div');
            diceEl.className = 'dice';
            diceEl.textContent = result;
            diceContainer.appendChild(diceEl);
        }

        totalDisplay.textContent = total;
    });
}
