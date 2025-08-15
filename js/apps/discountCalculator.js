// js/apps/discountCalculator.js

let priceInput, discountInput, finalPriceEl, savedAmountEl;

function getHtml() {
    return `
        <div class="discount-calculator-container">
            <div class="dc-input-group">
                <label for="dc-price" class="font-medium">Первоначальная цена:</label>
                <input type="number" id="dc-price" class="dc-input" placeholder="1000">
            </div>
            <div class="dc-input-group">
                <label for="dc-discount" class="font-medium">Скидка (%):</label>
                <input type="number" id="dc-discount" class="dc-input" placeholder="15">
            </div>
            <div id="dc-results">
                <p class="text-lg mb-2">Итоговая цена:</p>
                <p id="dc-final-price">0.00</p>
                <p id="dc-saved-amount" class="mt-1">Вы экономите: 0.00</p>
            </div>
        </div>
    `;
}

function init() {
    priceInput = document.getElementById('dc-price');
    discountInput = document.getElementById('dc-discount');
    finalPriceEl = document.getElementById('dc-final-price');
    savedAmountEl = document.getElementById('dc-saved-amount');

    priceInput.addEventListener('input', calculate);
    discountInput.addEventListener('input', calculate);

    calculate(); // Первоначальный расчет
}

function calculate() {
    const price = parseFloat(priceInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;

    if (price > 0 && discount > 0) {
        const savedAmount = price * (discount / 100);
        const finalPrice = price - savedAmount;

        finalPriceEl.textContent = finalPrice.toFixed(2);
        savedAmountEl.textContent = `Вы экономите: ${savedAmount.toFixed(2)}`;
    } else {
        finalPriceEl.textContent = price.toFixed(2);
        savedAmountEl.textContent = 'Вы экономите: 0.00';
    }
}

function cleanup() {}

export { getHtml, init, cleanup };
