// js/apps/percentageCalculator.js

let eventListeners = [];

function getInputField(id) { return document.getElementById(id); }
function getResultField(id) { return document.getElementById(id); }

function calculate(calcFunction, resultField) {
    try {
        const result = calcFunction();
        resultField.textContent = result;
        resultField.classList.remove('text-red-500');
    } catch (e) {
        resultField.textContent = e.message;
        resultField.classList.add('text-red-500');
    }
}

function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

export function getHtml() {
    return `
        <div class="space-y-6">
            <!-- Калькулятор 1 -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Найти процент одного числа от другого</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span class="text-sm">Сколько % составляет</span>
                    <input type="number" id="pc_val1" placeholder="число X" class="input-field-style">
                    <span class="text-sm">от</span>
                    <input type="number" id="pc_val2" placeholder="числа Y" class="input-field-style">
                </div>
                <p id="pc_res1" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>

            <!-- Калькулятор 2 -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Вычислить процент от числа</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="number" id="pc_val3" placeholder="процент X" class="input-field-style">
                    <span class="text-sm">% от</span>
                    <input type="number" id="pc_val4" placeholder="числа Y" class="input-field-style">
                </div>
                <p id="pc_res2" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>

             <!-- Калькулятор 3 -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Прибавить или вычесть процент</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="number" id="pc_val5" placeholder="число" class="input-field-style">
                    <select id="pc_op3" class="btn-secondary-style text-lg font-bold"><option value="add">+</option><option value="sub">-</option></select>
                    <input type="number" id="pc_val6" placeholder="процент" class="input-field-style">
                    <span class="text-sm">%</span>
                </div>
                <p id="pc_res3" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>
            
            <!-- НОВЫЙ Калькулятор 4: Изменение в процентах -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Изменение в процентах</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span class="text-sm">От</span>
                    <input type="number" id="pc_val7" placeholder="старое значение" class="input-field-style">
                    <span class="text-sm">до</span>
                    <input type="number" id="pc_val8" placeholder="новое значение" class="input-field-style">
                </div>
                <p id="pc_res4" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>
        </div>
        <style>
          .input-field-style { flex-grow: 1; width: 100%; text-align: center; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; }
          .dark .input-field-style { border-color: #4B5563; background-color: #374151; }
          .btn-secondary-style { padding: 0.5rem 1rem; background-color: #6B7280; color: white; border-radius: 0.5rem; transition: background-color 0.2s; border: none; }
          .btn-secondary-style:hover { background-color: #4B5563; }
        </style>
    `;
}

export function init() {
    // --- Получаем все элементы ---
    const v1 = getInputField('pc_val1'), v2 = getInputField('pc_val2'), res1 = getResultField('pc_res1');
    const v3 = getInputField('pc_val3'), v4 = getInputField('pc_val4'), res2 = getResultField('pc_res2');
    const v5 = getInputField('pc_val5'), v6 = getInputField('pc_val6'), op3 = getInputField('pc_op3'), res3 = getResultField('pc_res3');
    const v7 = getInputField('pc_val7'), v8 = getInputField('pc_val8'), res4 = getResultField('pc_res4');

    // --- Функции для вычислений ---
    const calc1 = () => {
        const num1 = parseFloat(v1.value), num2 = parseFloat(v2.value);
        if (isNaN(num1) || isNaN(num2)) return '';
        if (num2 === 0) throw new Error("Деление на ноль невозможно");
        return `${((num1 / num2) * 100).toFixed(2)} %`;
    };
    
    const calc2 = () => {
        const num3 = parseFloat(v3.value), num4 = parseFloat(v4.value);
        if (isNaN(num3) || isNaN(num4)) return '';
        return `${(num4 * (num3 / 100)).toFixed(2)}`;
    };

    const calc3 = () => {
        const num5 = parseFloat(v5.value), num6 = parseFloat(v6.value);
        if (isNaN(num5) || isNaN(num6)) return '';
        const operation = op3.value === 'add' ? (1 + num6 / 100) : (1 - num6 / 100);
        return `${(num5 * operation).toFixed(2)}`;
    };

    const calc4 = () => {
        const num7 = parseFloat(v7.value), num8 = parseFloat(v8.value);
        if (isNaN(num7) || isNaN(num8)) return '';
        if (num7 === 0) throw new Error("Старое значение не может быть 0");
        const change = ((num8 - num7) / num7) * 100;
        const prefix = change >= 0 ? '+' : '';
        return `${prefix}${change.toFixed(2)} %`;
    };

    // --- Назначаем слушатели ---
    [v1, v2].forEach(el => addListener(el, 'input', () => calculate(calc1, res1)));
    [v3, v4].forEach(el => addListener(el, 'input', () => calculate(calc2, res2)));
    [v5, v6, op3].forEach(el => addListener(el, 'input', () => calculate(calc3, res3)));
    [v7, v8].forEach(el => addListener(el, 'input', () => calculate(calc4, res4)));
}

export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
