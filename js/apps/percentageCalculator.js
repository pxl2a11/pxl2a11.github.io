// js/apps/percentageCalculator.js

let eventListeners = [];

function getInputField(id) {
    return document.getElementById(id);
}

function getResultField(id) {
    return document.getElementById(id);
}

function calculate(calcFunction, resultField) {
    try {
        resultField.textContent = calcFunction();
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
            <!-- Калькулятор 1: Какой процент составляет X от Y -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Найти процент одного числа от другого</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span class="text-sm">Сколько % составляет</span>
                    <input type="number" id="pc_val1" placeholder="число X" class="input-field-style">
                    <span class="text-sm">от</span>
                    <input type="number" id="pc_val2" placeholder="числа Y" class="input-field-style">
                    <button id="pc_calc1_btn" class="btn-primary-style w-full sm:w-auto">?</button>
                </div>
                <p id="pc_res1" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>

            <!-- Калькулятор 2: Найти X% от числа Y -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Вычислить процент от числа</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="number" id="pc_val3" placeholder="процент X" class="input-field-style">
                    <span class="text-sm">% от</span>
                    <input type="number" id="pc_val4" placeholder="числа Y" class="input-field-style">
                    <button id="pc_calc2_btn" class="btn-primary-style w-full sm:w-auto">=</button>
                </div>
                <p id="pc_res2" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>

             <!-- Калькулятор 3: Прибавить/вычесть процент -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="font-bold mb-2">Прибавить или вычесть процент</h3>
                <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="number" id="pc_val5" placeholder="число" class="input-field-style">
                    <button id="pc_calc3_add_btn" class="btn-secondary-style text-xl font-bold w-1/2 sm:w-auto">+</button>
                    <button id="pc_calc3_sub_btn" class="btn-secondary-style text-xl font-bold w-1/2 sm:w-auto">-</button>
                    <input type="number" id="pc_val6" placeholder="процент" class="input-field-style">
                    <span class="text-sm">%</span>
                </div>
                <p id="pc_res3" class="mt-3 font-bold text-lg text-center h-8"></p>
            </div>
        </div>
        <style>
          .input-field-style { flex-grow: 1; width: 100%; text-align: center; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; }
          .dark .input-field-style { border-color: #4B5563; background-color: #374151; }
          .btn-primary-style { padding: 0.5rem 1rem; background-color: #3B82F6; color: white; border-radius: 0.5rem; transition: background-color 0.2s; }
          .btn-primary-style:hover { background-color: #2563EB; }
           .btn-secondary-style { padding: 0.5rem 1rem; background-color: #6B7280; color: white; border-radius: 0.5rem; transition: background-color 0.2s; }
          .btn-secondary-style:hover { background-color: #4B5563; }
        </style>
    `;
}

export function init() {
    const v1 = getInputField('pc_val1'), v2 = getInputField('pc_val2');
    const v3 = getInputField('pc_val3'), v4 = getInputField('pc_val4');
    const v5 = getInputField('pc_val5'), v6 = getInputField('pc_val6');

    const res1 = getResultField('pc_res1'), res2 = getResultField('pc_res2'), res3 = getResultField('pc_res3');
    
    const b1 = document.getElementById('pc_calc1_btn');
    const b2 = document.getElementById('pc_calc2_btn');
    const b3_add = document.getElementById('pc_calc3_add_btn');
    const b3_sub = document.getElementById('pc_calc3_sub_btn');

    addListener(b1, 'click', () => calculate(() => {
        const num1 = parseFloat(v1.value), num2 = parseFloat(v2.value);
        if (isNaN(num1) || isNaN(num2)) throw new Error("Введите оба числа");
        if (num2 === 0) throw new Error("Деление на ноль невозможно");
        return `${((num1 / num2) * 100).toFixed(2)} %`;
    }, res1));

    addListener(b2, 'click', () => calculate(() => {
        const num3 = parseFloat(v3.value), num4 = parseFloat(v4.value);
        if (isNaN(num3) || isNaN(num4)) throw new Error("Введите оба числа");
        return `${(num4 * (num3 / 100)).toFixed(2)}`;
    }, res2));

    addListener(b3_add, 'click', () => calculate(() => {
        const num5 = parseFloat(v5.value), num6 = parseFloat(v6.value);
        if (isNaN(num5) || isNaN(num6)) throw new Error("Введите оба числа");
        return `${(num5 * (1 + num6 / 100)).toFixed(2)}`;
    }, res3));

    addListener(b3_sub, 'click', () => calculate(() => {
        const num5 = parseFloat(v5.value), num6 = parseFloat(v6.value);
        if (isNaN(num5) || isNaN(num6)) throw new Error("Введите оба числа");
        return `${(num5 * (1 - num6 / 100)).toFixed(2)}`;
    }, res3));
}

export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
