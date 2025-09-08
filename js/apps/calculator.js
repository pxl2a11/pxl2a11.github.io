// js/apps/calculator.js

export function getHtml() {
    return `
        <style>
            .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
            .calc-btn { 
                height: 60px; font-size: 1.5rem; font-weight: 500; border-radius: 0.75rem;
                background-color: #f3f4f6; color: #1f2937;
                transition: background-color 0.2s, transform 0.1s;
                border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .dark .calc-btn { background-color: #374151; color: #f9fafb; border-color: #4b5563; }
            .calc-btn:hover { background-color: #e5e7eb; }
            .dark .calc-btn:hover { background-color: #4b5563; }
            .calc-btn:active { transform: scale(0.95); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
            
            .calc-btn-operator { background-color: #fb923c; color: white; } /* orange-400 */
            .dark .calc-btn-operator { background-color: #f97316; } /* orange-500 */
            .calc-btn-action { background-color: #6b7280; color: white; } /* gray-500 */
            .dark .calc-btn-action { background-color: #4b5563; } /* gray-600 */
            .calc-btn-equals { grid-column: span 2 / span 2; background-color: #3b82f6; color: white; } /* blue-500 */
            .dark .calc-btn-equals { background-color: #2563eb; } /* blue-600 */
        </style>
        <div class="max-w-xs mx-auto p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-4">
            <!-- Дисплей -->
            <div id="calc-display" class="w-full h-20 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-right font-mono text-4xl text-gray-800 dark:text-gray-200 overflow-hidden flex flex-col justify-end">
                <div id="calc-history" class="text-sm text-gray-400 h-6"></div>
                <div id="calc-current" class="truncate">0</div>
            </div>

            <!-- Кнопки -->
            <div id="calc-buttons" class="calc-grid">
                <button class="calc-btn calc-btn-action" data-action="clear">C</button>
                <button class="calc-btn calc-btn-action" data-action="toggle-sign">+/-</button>
                <button class="calc-btn calc-btn-action" data-action="percentage">%</button>
                <button class="calc-btn calc-btn-operator" data-operator="divide">÷</button>
                
                <button class="calc-btn" data-key="7">7</button>
                <button class="calc-btn" data-key="8">8</button>
                <button class="calc-btn" data-key="9">9</button>
                <button class="calc-btn calc-btn-operator" data-operator="multiply">×</button>

                <button class="calc-btn" data-key="4">4</button>
                <button class="calc-btn" data-key="5">5</button>
                <button class="calc-btn" data-key="6">6</button>
                <button class="calc-btn calc-btn-operator" data-operator="subtract">−</button>

                <button class="calc-btn" data-key="1">1</button>
                <button class="calc-btn" data-key="2">2</button>
                <button class="calc-btn" data-key="3">3</button>
                <button class="calc-btn calc-btn-operator" data-operator="add">+</button>

                <button class="calc-btn" data-key="0">0</button>
                <button class="calc-btn" data-action="decimal">.</button>
                <button class="calc-btn calc-btn-equals" data-action="equals">=</button>
            </div>
        </div>
    `;
}

export function init() {
    const displayCurrent = document.getElementById('calc-current');
    const displayHistory = document.getElementById('calc-history');
    const buttonsContainer = document.getElementById('calc-buttons');
    
    let currentValue = '0';
    let previousValue = '';
    let operator = null;
    let shouldResetDisplay = false;

    function updateDisplay() {
        displayCurrent.textContent = currentValue.toLocaleString('ru-RU');
        displayHistory.textContent = operator ? `${previousValue} ${getOperatorSymbol()}` : '';
    }

    function getOperatorSymbol() {
        switch (operator) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    function handleNumber(number) {
        if (currentValue === '0' || shouldResetDisplay) {
            currentValue = number;
            shouldResetDisplay = false;
        } else {
            currentValue += number;
        }
    }
    
    function handleOperator(nextOperator) {
        if (operator && !shouldResetDisplay) {
            calculate();
        }
        previousValue = currentValue;
        operator = nextOperator;
        shouldResetDisplay = true;
    }

    function calculate() {
        if (!operator || shouldResetDisplay) return;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        if (isNaN(prev) || isNaN(current)) return;

        let result;
        switch (operator) {
            case 'add': result = prev + current; break;
            case 'subtract': result = prev - current; break;
            case 'multiply': result = prev * current; break;
            case 'divide':
                if (current === 0) {
                    currentValue = 'Ошибка';
                    operator = null;
                    previousValue = '';
                    return;
                }
                result = prev / current;
                break;
            default: return;
        }
        currentValue = String(result);
        operator = null;
        previousValue = '';
        shouldResetDisplay = true;
    }

    function clear() {
        currentValue = '0';
        previousValue = '';
        operator = null;
    }

    function handleAction(action) {
        switch (action) {
            case 'clear': clear(); break;
            case 'equals': calculate(); break;
            case 'decimal':
                if (shouldResetDisplay) {
                    currentValue = '0';
                    shouldResetDisplay = false;
                }
                if (!currentValue.includes('.')) currentValue += '.';
                break;
            case 'toggle-sign': currentValue = String(parseFloat(currentValue) * -1); break;
            case 'percentage': currentValue = String(parseFloat(currentValue) / 100); break;
        }
    }
    
    buttonsContainer.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        const op = e.target.dataset.operator;
        const action = e.target.dataset.action;
        
        if (key) handleNumber(key);
        if (op) handleOperator(op);
        if (action) handleAction(action);
        
        updateDisplay();
    });

    updateDisplay();
}
