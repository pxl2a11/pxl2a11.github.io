const commonCSS = `
    .currency-select, .currency-input {
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
        background-color: #fff;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .dark .currency-select, .dark .currency-input {
        background-color: #374151;
        border-color: #4b5563;
        color: #f3f4f6;
    }
    .currency-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
    }
    .currency-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 450px;
        margin: auto;
    }
    .currency-row {
        display: flex;
        gap: 1rem;
    }
    .currency-row .currency-select {
        flex: 1;
    }
    .currency-row .currency-input {
        flex: 2;
    }
    #swap-btn {
        font-size: 1.5rem;
        cursor: pointer;
        transition: transform 0.3s, background-color 0.2s;
    }
     #swap-btn:hover {
        transform: rotate(180deg);
     }
    .error-message {
        color: #ef4444; /* red-500 */
        font-weight: 500;
    }
`;

export function getHtml() {
    return `
        <style>${commonCSS}</style>
        <div class="currency-container">
            <div class="currency-row">
                <input type="number" id="amount1" class="currency-input" value="100" disabled>
                <select id="currency1" class="currency-select" disabled></select>
            </div>

            <div class="flex justify-center items-center">
                <span id="swap-btn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">↔️</span>
            </div>

            <div class="currency-row">
                <input type="number" id="amount2" class="currency-input" readonly disabled>
                <select id="currency2" class="currency-select" disabled></select>
            </div>
            <div id="rate-info" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 h-5">
                Загрузка курсов...
            </div>
        </div>
    `;
}

// Переменная для хранения загруженных курсов
let rates = {};

// Функция для получения данных с нового, более полного API
async function fetchRates() {
    const rateInfo = document.getElementById('rate-info');
    // Используем API на базе CDN, которое включает RUB и не требует ключа
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }
        const data = await response.json();
        
        // API возвращает ключи в нижнем регистре. Приводим их к верхнему для единообразия.
        const uppercaseRates = {};
        for (const key in data.usd) {
            uppercaseRates[key.toUpperCase()] = data.usd[key];
        }

        // Добавляем базовую валюту (USD), т.к. она не включена в список
        uppercaseRates['USD'] = 1; 
        return uppercaseRates;

    } catch (error) {
        console.error("Не удалось загрузить курсы валют:", error);
        rateInfo.textContent = "Ошибка загрузки курсов.";
        rateInfo.classList.add('error-message');
        return null;
    }
}

export async function init() {
    const amount1 = document.getElementById('amount1');
    const currency1 = document.getElementById('currency1');
    const amount2 = document.getElementById('amount2');
    const currency2 = document.getElementById('currency2');
    const swapBtn = document.getElementById('swap-btn');
    const rateInfo = document.getElementById('rate-info');

    rates = await fetchRates();
    if (!rates) return;

    [amount1, currency1, amount2, currency2].forEach(el => el.disabled = false);

    function populateCurrencies() {
        currency1.innerHTML = '';
        currency2.innerHTML = '';
        
        const availableCurrencies = Object.keys(rates).sort();
        
        availableCurrencies.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            currency1.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            currency2.appendChild(option2);
        });
        
        if (availableCurrencies.includes('USD')) currency1.value = 'USD';
        // Теперь RUB гарантированно будет в списке
        if (availableCurrencies.includes('RUB')) currency2.value = 'RUB';
    }

    function calculate() {
        const c1 = currency1.value;
        const c2 = currency2.value;
        const a1 = parseFloat(amount1.value);

        if (isNaN(a1) || !rates[c1] || !rates[c2]) {
            amount2.value = '';
            rateInfo.textContent = '';
            return;
        }

        const rateFrom = rates[c1];
        const rateTo = rates[c2];

        const result = (a1 / rateFrom) * rateTo;
        amount2.value = result.toFixed(2);

        const singleUnitRate = (1 / rateFrom) * rateTo;
        rateInfo.textContent = `1 ${c1} = ${singleUnitRate.toFixed(4)} ${c2}`;
        rateInfo.classList.remove('error-message');
    }

    function swapCurrencies() {
        const temp = currency1.value;
        currency1.value = currency2.value;
        currency2.value = temp;
        calculate();
    }

    amount1.addEventListener('input', calculate);
    currency1.addEventListener('change', calculate);
    currency2.addEventListener('change', calculate);
    swapBtn.addEventListener('click', swapCurrencies);

    populateCurrencies();
    calculate();
}
