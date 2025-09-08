// js/apps/calorieCalculator.js

export function getHtml() {
    return `
        <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
            <!-- Ввод данных -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Пол</label>
                    <select id="gender" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>
                <div>
                    <label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Возраст (лет)</label>
                    <input type="number" id="age" value="30" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Вес (кг)</label>
                    <input type="number" id="weight" value="70" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label for="height" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (см)</label>
                    <input type="number" id="height" value="175" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div class="md:col-span-2">
                    <label for="activity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Уровень активности</label>
                    <select id="activity" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        <option value="1.2">Сидячий образ жизни (мало или нет упражнений)</option>
                        <option value="1.375" selected>Легкая активность (легкие упражнения/спорт 1-3 дня/нед)</option>
                        <option value="1.55">Умеренная активность (умеренные упражнения/спорт 3-5 дней/нед)</option>
                        <option value="1.725">Высокая активность (тяжелые упражнения/спорт 6-7 дней/нед)</option>
                        <option value="1.9">Очень высокая активность (очень тяжелые упражнения и физ. работа)</option>
                    </select>
                </div>
            </div>

            <!-- Результаты -->
            <div id="results-container" class="pt-6 border-t dark:border-gray-600 space-y-4">
                 <div class="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p class="text-gray-600 dark:text-gray-400">Поддержание веса</p>
                    <p id="maintenance-calories" class="text-3xl font-bold text-blue-600 dark:text-blue-400">0 ккал/день</p>
                 </div>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div class="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                        <p class="text-yellow-800 dark:text-yellow-300 font-semibold">Похудение</p>
                        <p id="loss-calories" class="text-xl font-bold text-yellow-900 dark:text-yellow-200">0 ккал/день</p>
                    </div>
                     <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <p class="text-green-800 dark:text-green-300 font-semibold">Набор веса</p>
                        <p id="gain-calories" class="text-xl font-bold text-green-900 dark:text-green-200">0 ккал/день</p>
                    </div>
                 </div>
            </div>
        </div>
    `;
}

export function init() {
    const inputs = ['gender', 'age', 'weight', 'height', 'activity'].map(id => document.getElementById(id));
    
    const results = {
        maintenance: document.getElementById('maintenance-calories'),
        loss: document.getElementById('loss-calories'),
        gain: document.getElementById('gain-calories'),
    };

    function calculateCalories() {
        const gender = inputs[0].value;
        const age = parseFloat(inputs[1].value);
        const weight = parseFloat(inputs[2].value);
        const height = parseFloat(inputs[3].value);
        const activityMultiplier = parseFloat(inputs[4].value);
        
        if (isNaN(age) || isNaN(weight) || isNaN(height)) {
            return;
        }

        let bmr = 0;
        // Формула Миффлина-Сан Жеора
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else { // female
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        
        const tdee = bmr * activityMultiplier; // Total Daily Energy Expenditure

        results.maintenance.textContent = `${Math.round(tdee)} ккал/день`;
        results.loss.textContent = `${Math.round(tdee - 500)} ккал/день`;
        results.gain.textContent = `${Math.round(tdee + 500)} ккал/день`;
    }

    inputs.forEach(input => {
        input.addEventListener('input', calculateCalories);
        input.addEventListener('change', calculateCalories);
    });
    
    // Initial calculation
    calculateCalories();
}
