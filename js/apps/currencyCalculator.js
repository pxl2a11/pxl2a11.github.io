const commonCSS = `
    .currency-select, .currency-input {
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
        background-color: #fff;
        font-size: 1rem;
    }
    .dark .currency-select, .dark .currency-input {
        background-color: #374151;
        border-color: #4b5563;
        color: #f3f4f6;
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
        transition: transform 0.3s;
    }
     #swap-btn:hover {
        transform: rotate(180deg);
     }
`;

export function getHtml() {
    return `
        <style>${commonCSS}</style>
        <div class="currency-container">
            <div class="currency-row">
                <input type="number" id="amount1" class="currency-input" value="100">
                <select id="currency1" class="currency-select"></select>
            </div>

            <div class="flex justify-center items-center">
                <span id="swap-btn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">↔️</span>
            </div>

            <div class="currency-row">
                <input type="number" id="amount2" class="currency-input" readonly>
                <select id="currency2" class="currency-select"></select>
            </div>
            <div id="rate-info" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2"></div>
        </div>
    `;
}

export function init() {
    // ВАЖНО: В реальном приложении курсы нужно получать с сервера.
    // Это просто пример с фиксированными данными.
    // Вы можете использовать бесплатный API, например, от ExchangeRate-API.com
    const mockRates = {
        "USD": 1,
        "EUR": 0.92,
        "RUB": 91.5,
        "JPY": 157.2,
        "GBP": 0.79,
        "CNY": 7.24
    };

    const amount1 = document.getElementById('amount1');
    const currency1 = document.getElementById('currency1');
    const amount2 = document.getElementById('amount2');
    const currency2 = document.getElementById('currency2');
    const swapBtn = document.getElementById('swap-btn');
    const rateInfo = document.getElementById('rate-info');

    function populateCurrencies() {
        const currencies = Object.keys(mockRates);
        currencies.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            currency1.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            currency2.appendChild(option2);
        });
        currency1.value = 'USD';
        currency2.value = 'RUB';
    }

    function calculate() {
        const c1 = currency1.value;
        const c2 = currency2.value;
        const a1 = parseFloat(amount1.value);

        if (isNaN(a1)) {
            amount2.value = '';
            rateInfo.textContent = '';
            return;
        }

        const rate1 = mockRates[c1];
        const rate2 = mockRates[c2];

        const result = (a1 / rate1) * rate2;
        amount2.value = result.toFixed(2);

        const singleUnitRate = (1 / rate1) * rate2;
        rateInfo.textContent = `1 ${c1} = ${singleUnitRate.toFixed(4)} ${c2}`;
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
