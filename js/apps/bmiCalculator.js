// apps/bmiCalculator.js

function getHtml() {
    return `
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="height" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (см)</label>
                    <input type="number" id="height" value="170" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2" placeholder="170">
                </div>
                <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Вес (кг)</label>
                    <input type="number" id="weight" value="65" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2" placeholder="65">
                </div>
            </div>

            <div id="bmi-result-container" class="mt-6 text-center hidden">
                <p class="text-gray-600 dark:text-gray-400">Ваш индекс массы тела (ИМТ)</p>
                <p id="bmi-value" class="text-5xl font-bold"></p>
                <p id="bmi-category" class="text-xl font-semibold mt-2"></p>
            </div>

            <div class="mt-4">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div id="bmi-indicator-bar" class="h-2.5 rounded-full" style="width: 0;"></div>
                </div>
                <div class="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>16</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                </div>
            </div>

            <div id="bmi-info" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-300 hidden">
            </div>
        </div>
    `;
}

function init() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const resultContainer = document.getElementById('bmi-result-container');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiCategoryEl = document.getElementById('bmi-category');
    const bmiIndicatorBar = document.getElementById('bmi-indicator-bar');
    const bmiInfoEl = document.getElementById('bmi-info');

    function calculateBmi() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
            resultContainer.classList.add('hidden');
            bmiInfoEl.classList.add('hidden');
            bmiIndicatorBar.style.width = '0%';
            return;
        }

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const bmiFormatted = bmi.toFixed(1);

        resultContainer.classList.remove('hidden');
        bmiValueEl.textContent = bmiFormatted;

        let category = '';
        let colorClass = '';
        let infoText = '';

        if (bmi < 16) {
            category = 'Выраженный дефицит массы';
            colorClass = 'bg-red-600';
            infoText = 'Риск для здоровья очень высокий. Необходима консультация врача.';
        } else if (bmi >= 16 && bmi < 18.5) {
            category = 'Недостаточная масса тела';
            colorClass = 'bg-yellow-500';
            infoText = 'Риск для здоровья повышен. Рекомендуется набрать вес до нормы.';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Нормальный вес';
            colorClass = 'bg-green-500';
            infoText = 'Ваш вес в норме. Риск для здоровья минимальный. Так держать!';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Избыточная масса тела';
            colorClass = 'bg-yellow-500';
            infoText = 'Риск для здоровья повышен. Рекомендуется снизить вес до нормы.';
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Ожирение 1 степени';
            colorClass = 'bg-orange-500';
            infoText = 'Риск для здоровья высокий. Рекомендуется консультация специалиста.';
        } else if (bmi >= 35 && bmi < 40) {
            category = 'Ожирение 2 степени';
            colorClass = 'bg-red-600';
            infoText = 'Риск для здоровья очень высокий. Необходима консультация врача.';
        } else {
            category = 'Ожирение 3 степени';
            colorClass = 'bg-red-800';
            infoText = 'Риск для здоровья чрезвычайно высокий. Срочно обратитесь к врачу.';
        }

        bmiCategoryEl.textContent = category;
        bmiValueEl.className = `text-5xl font-bold ${colorClass.replace('bg-', 'text-')}`;
        
        // Обновляем шкалу
        const percentage = Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100));
        bmiIndicatorBar.style.width = `${percentage}%`;
        bmiIndicatorBar.className = `h-2.5 rounded-full transition-all duration-500 ${colorClass}`;
        
        // Показываем блок с информацией
        bmiInfoEl.textContent = infoText;
        bmiInfoEl.classList.remove('hidden');
    }

    heightInput.addEventListener('input', calculateBmi);
    weightInput.addEventListener('input', calculateBmi);

    // Первоначальный расчет при загрузке
    calculateBmi();
}

export { getHtml, init };
