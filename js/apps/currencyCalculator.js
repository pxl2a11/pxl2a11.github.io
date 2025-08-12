const commonCSS = `
    .currency-select, .currency-input {
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
        background-color: #fff;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    /* --- НОВЫЕ СТИЛИ: Убираем стрелочки из input[type=number] --- */
    .currency-input {
      -moz-appearance: textfield;
    }
    .currency-input::-webkit-outer-spin-button,
    .currency-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
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
                <span id="swap-btn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <!-- ИЗМЕНЕНО: Эмодзи заменен на SVG -->
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.9814 6.19L7.27141 2.48C7.20141 2.41 7.11141 2.35 7.01141 2.31C7.00141 2.31 6.99141 2.31 6.98141 2.3C6.90141 2.27 6.82141 2.25 6.73141 2.25C6.53141 2.25 6.34141 2.33 6.20141 2.47L2.47141 6.19C2.18141 6.48 2.18141 6.96 2.47141 7.25C2.76141 7.54 3.24141 7.54 3.53141 7.25L5.98141 4.8V21C5.98141 21.41 6.32141 21.75 6.73141 21.75C7.14141 21.75 7.48141 21.41 7.48141 21V4.81L9.92141 7.25C10.0714 7.4 10.2614 7.47 10.4514 7.47C10.6414 7.47 10.8314 7.4 10.9814 7.25C11.2714 6.96 11.2714 6.49 10.9814 6.19Z" fill="currentColor"/>
                        <path d="M21.5283 16.75C21.2383 16.46 20.7583 16.46 20.4683 16.75L18.0183 19.2V3C18.0183 2.59 17.6783 2.25 17.2683 2.25C16.8583 2.25 16.5183 2.59 16.5183 3V19.19L14.0783 16.75C13.7883 16.46 13.3083 16.46 13.0183 16.75C12.7283 17.04 12.7283 17.52 13.0183 17.81L16.7283 21.52C16.7983 21.59 16.8883 21.65 16.9883 21.69C16.9983 21.69 17.0083 21.69 17.0183 21.7C17.0983 21.73 17.1883 21.75 17.2783 21.75C17.4783 21.75 17.6683 21.67 17.8083 21.53L21.5283 17.81C21.8183 17.51 21.8183 17.04 21.5283 16.75Z" fill="currentColor"/>
                    </svg>
                </span>
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

let rates = {};

async function fetchRates() {
    const rateInfo = document.getElementById('rate-info');
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }
        const data = await response.json();
        
        const uppercaseRates = {};
        for (const key in data.usd) {
            uppercaseRates[key.toUpperCase()] = data.usd[key];
        }

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
