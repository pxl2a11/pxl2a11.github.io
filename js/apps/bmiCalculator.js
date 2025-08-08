// apps/bmiCalculator.js

export function getHtml() {
    return `
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <!-- Переключатель систем -->
            <div class="flex justify-center items-center mb-6">
                <span id="metric-label" class="font-semibold text-blue-600 dark:text-blue-400">Метрическая (кг, см)</span>
                <label for="unit-toggle" class="relative inline-flex items-center cursor-pointer mx-4">
                    <input type="checkbox" value="" id="unit-toggle" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span id="imperial-label" class="font-semibold text-gray-400 dark:text-gray-500">Имперская (lbs, ft, in)</span>
            </div>
            
            <!-- Поля для возраста и пола -->
            <div class="grid grid-cols-2 gap-6 mb-6">
                 <div>
                    <label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Возраст</label>
                    <input type="number" id="age" value="30" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Пол</label>
                    <select id="gender" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>
            </div>
            
            <!-- Поля ввода -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Метрическая система -->
                <div id="metric-inputs">
                    <div>
                        <label for="height-cm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (см)</label>
                        <input type="number" id="height-cm" value="170" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                    </div>
                </div>
                <!-- Имперская система -->
                <div id="imperial-inputs" class="hidden col-span-2">
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="height-ft" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (футы)</label>
                            <input type="number" id="height-ft" value="5" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        </div>
                        <div>
                            <label for="height-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (дюймы)</label>
                            <input type="number" id="height-in" value="7" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        </div>
                    </div>
                </div>
                <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Вес (<span id="weight-unit">кг</span>)</label>
                    <input type="number" id="weight" value="65" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
            </div>

            <!-- Результаты -->
            <div id="bmi-result-container" class="mt-6 text-center hidden">
                <p class="text-gray-600 dark:text-gray-400">Ваш индекс массы тела (ИМТ)</p>
                <p id="bmi-value" class="text-5xl font-bold"></p>
                <p id="bmi-category" class="text-xl font-semibold mt-2"></p>
                <p id="ideal-weight" class="text-sm mt-2 text-gray-500 dark:text-gray-400"></p>
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
            <div id="bmi-info" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-300 hidden"></div>
        </div>
    `;
}

export function init() {
    const unitToggle = document.getElementById('unit-toggle');
    const metricLabel = document.getElementById('metric-label');
    const imperialLabel = document.getElementById('imperial-label');
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const weightUnitEl = document.getElementById('weight-unit');
    
    const heightCmInput = document.getElementById('height-cm');
    const heightFtInput = document.getElementById('height-ft');
    const heightInInput = document.getElementById('height-in');
    const weightInput = document.getElementById('weight');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    
    const resultContainer = document.getElementById('bmi-result-container');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiCategoryEl = document.getElementById('bmi-category');
    const bmiIndicatorBar =
