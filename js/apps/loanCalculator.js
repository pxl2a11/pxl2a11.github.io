// 18js/apps/loanCalculator.js

export function getHtml() {
    return `
        <style>
            .loan-input { -moz-appearance: textfield; }
            .loan-input::-webkit-outer-spin-button, .loan-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        </style>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Calculator 1 -->
            <div class="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6 w-full">
                <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Кредит 1</h2>
                <div>
                    <label for="loan-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Сумма кредита (₽)</label>
                    <input type="number" id="loan-amount" value="1000000" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label for="interest-rate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Процентная ставка (%)</label>
                        <input type="number" id="interest-rate" value="10" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    </div>
                     <div>
                        <label for="loan-term" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Срок (лет)</label>
                        <input type="number" id="loan-term" value="5" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    </div>
                </div>

                <div class="pt-6 border-t dark:border-gray-600 text-center space-y-4">
                    <div>
                        <p class="text-gray-500 dark:text-gray-400">Ежемесячный платеж</p>
                        <p id="monthly-payment" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0 ₽</p>
                    </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Общая сумма выплат</p>
                            <p id="total-payment" class="text-2xl font-semibold">0 ₽</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Переплата</p>
                            <p id="total-interest" class="text-2xl font-semibold text-red-500">0 ₽</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calculator 2 -->
            <div class="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6 w-full">
                <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Кредит 2</h2>
                <div>
                    <label for="loan-amount-2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Сумма кредита (₽)</label>
                    <input type="number" id="loan-amount-2" value="1000000" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label for="interest-rate-2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Процентная ставка (%)</label>
                        <input type="number" id="interest-rate-2" value="12" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    </div>
                     <div>
                        <label for="loan-term-2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Срок (лет)</label>
                        <input type="number" id="loan-term-2" value="7" class="loan-input mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    </div>
                </div>

                <div class="pt-6 border-t dark:border-gray-600 text-center space-y-4">
                    <div>
                        <p class="text-gray-500 dark:text-gray-400">Ежемесячный платеж</p>
                        <p id="monthly-payment-2" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0 ₽</p>
                    </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Общая сумма выплат</p>
                            <p id="total-payment-2" class="text-2xl font-semibold">0 ₽</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Переплата</p>
                            <p id="total-interest-2" class="text-2xl font-semibold text-red-500">0 ₽</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const formatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });

    /**
     * Sets up and manages a single loan calculator instance.
     * @param {string} idSuffix - The suffix for the element IDs (e.g., '' or '-2').
     */
    function setupCalculator(idSuffix = '') {
        const amountInput = document.getElementById(`loan-amount${idSuffix}`);
        const rateInput = document.getElementById(`interest-rate${idSuffix}`);
        const termInput = document.getElementById(`loan-term${idSuffix}`);
        const monthlyPaymentEl = document.getElementById(`monthly-payment${idSuffix}`);
        const totalPaymentEl = document.getElementById(`total-payment${idSuffix}`);
        const totalInterestEl = document.getElementById(`total-interest${idSuffix}`);

        function calculateLoan() {
            const principal = parseFloat(amountInput.value);
            const annualRate = parseFloat(rateInput.value);
            const years = parseFloat(termInput.value);

            if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate <= 0 || years <= 0) {
                monthlyPaymentEl.textContent = '0 ₽';
                totalPaymentEl.textContent = '0 ₽';
                totalInterestEl.textContent = '0 ₽';
                return;
            }

            const monthlyRate = annualRate / 100 / 12;
            const numberOfPayments = years * 12;

            const x = Math.pow(1 + monthlyRate, numberOfPayments);
            const monthlyPayment = (principal * x * monthlyRate) / (x - 1);
            const totalPayment = monthlyPayment * numberOfPayments;
            const totalInterest = totalPayment - principal;

            monthlyPaymentEl.textContent = formatter.format(monthlyPayment);
            totalPaymentEl.textContent = formatter.format(totalPayment);
            totalInterestEl.textContent = formatter.format(totalInterest);
        }

        [amountInput, rateInput, termInput].forEach(input => {
            input.addEventListener('input', calculateLoan);
        });

        calculateLoan(); // Initial calculation
    }

    // Initialize both calculators
    setupCalculator('');      // For the first calculator
    setupCalculator('-2');    // For the second calculator
}
