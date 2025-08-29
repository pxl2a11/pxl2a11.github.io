// js/apps/mouseTester.js

export function getHtml() {
    return `
        <style>
            #mouse-test-area {
                touch-action: none; /* Отключает сенсорные жесты, чтобы не мешать тесту */
                position: relative;
                overflow: hidden;
            }
            .click-indicator {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(59, 130, 246, 0.7);
                transform: translate(-50%, -50%) scale(0);
                animation: click-animation 0.5s ease-out;
                pointer-events: none; /* Чтобы индикатор не перехватывал события мыши */
            }
            @keyframes click-animation {
                from { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        </style>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Основная область для теста -->
            <div id="mouse-test-area" class="lg:col-span-2 w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner flex justify-center items-center">
                <p class="text-gray-500 dark:text-gray-400 select-none">Перемещайте мышь здесь</p>
            </div>

            <!-- Панель с информацией -->
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-center">Информация</h3>
                
                <!-- Координаты -->
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">X</div>
                        <div id="mouse-x" class="text-2xl font-bold">0</div>
                    </div>
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Y</div>
                        <div id="mouse-y" class="text-2xl font-bold">0</div>
                    </div>
                </div>

                <!-- Кнопки мыши -->
                <div class="flex justify-around items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="btn-left" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">ЛКМ</div>
                    <div id="btn-middle" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">СКМ</div>
                    <div id="btn-right" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">ПКМ</div>
                </div>

                <!-- Прокрутка -->
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                     <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Прокрутка</div>
                     <div id="scroll-direction" class="text-lg font-bold h-6">-</div>
                </div>

                 <button id="reset-mouse-test" class="w-full mt-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Сброс</button>
            </div>
        </div>
    `;
}

let testArea, xEl, yEl, leftBtn, middleBtn, rightBtn, scrollDirEl;
let scrollTimeout;

function updateCoordinates(e) {
    const rect = testArea.getBoundingClientRect();
    xEl.textContent = Math.floor(e.clientX - rect.left);
    yEl.textContent = Math.floor(e.clientY - rect.top);
}

function handleMouseDown(e) {
    e.preventDefault();
    const buttonMap = { 0: leftBtn, 1: middleBtn, 2: rightBtn };
    if (buttonMap[e.button]) {
        buttonMap[e.button].classList.add('bg-blue-500', 'text-white', 'border-blue-500');
        buttonMap[e.button].classList.remove('dark:border-gray-600');
    }
    // Анимация клика
    const indicator = document.createElement('div');
    indicator.className = 'click-indicator';
    const rect = testArea.getBoundingClientRect();
    indicator.style.left = `${e.clientX - rect.left}px`;
    indicator.style.top = `${e.clientY - rect.top}px`;
    testArea.appendChild(indicator);
    setTimeout(() => indicator.remove(), 500);
}

function handleMouseUp(e) {
    const buttonMap = { 0: leftBtn, 1: middleBtn, 2: rightBtn };
    if (buttonMap[e.button]) {
        buttonMap[e.button].classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
        buttonMap[e.button].classList.add('dark:border-gray-600');
    }
}

function handleWheel(e) {
    if (e.deltaY < 0) {
        scrollDirEl.textContent = 'Вверх ▲';
    } else {
        scrollDirEl.textContent = 'Вниз ▼';
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollDirEl.textContent = '-';
    }, 1000);
}

function resetTest() {
    xEl.textContent = '0';
    yEl.textContent = '0';
    scrollDirEl.textContent = '-';
    [leftBtn, middleBtn, rightBtn].forEach(btn => {
         btn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
         btn.classList.add('dark:border-gray-600');
    });
    // Удаляем все индикаторы кликов, если они остались
    testArea.querySelectorAll('.click-indicator').forEach(el => el.remove());
}

export function init() {
    testArea = document.getElementById('mouse-test-area');
    xEl = document.getElementById('mouse-x');
    yEl = document.getElementById('mouse-y');
    leftBtn = document.getElementById('btn-left');
    middleBtn = document.getElementById('btn-middle');
    rightBtn = document.getElementById('btn-right');
    scrollDirEl = document.getElementById('scroll-direction');
    const resetBtn = document.getElementById('reset-mouse-test');

    testArea.addEventListener('mousemove', updateCoordinates);
    testArea.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp); // Слушаем на window, чтобы поймать отпускание кнопки вне области
    testArea.addEventListener('wheel', handleWheel);
    testArea.addEventListener('contextmenu', e => e.preventDefault()); // Отключаем контекстное меню
    resetBtn.addEventListener('click', resetTest);
}

export function cleanup() {
    // Удаляем все слушатели событий
    testArea.removeEventListener('mousemove', updateCoordinates);
    testArea.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    testArea.removeEventListener('wheel', handleWheel);
    testArea.removeEventListener('contextmenu', e => e.preventDefault());
    clearTimeout(scrollTimeout);
}```

### 2. Тест клавиатуры (keyboardTester.js)

Этот модуль отображает виртуальную клавиатуру, которая подсвечивает клавиши при их нажатии на физической клавиатуре, а также выводит детальную информацию о событии.

```javascript
// js/apps/keyboardTester.js

export function getHtml() {
    // Вспомогательная функция для создания рядов клавиатуры
    const createKeyRow = (keys) => keys.map(key => 
        `<div class="key" data-code="${key.code}" style="flex-grow: ${key.grow || 1}">
            ${key.name.replace('<br>', '<br/>')}
         </div>`
    ).join('');

    return `
        <style>
            .keyboard {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 10px;
                background-color: #e5e7eb; /* gray-200 */
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .dark .keyboard { background-color: #374151; } /* gray-700 */
            .key-row { display: flex; gap: 8px; }
            .key {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 50px;
                padding: 5px;
                background-color: #ffffff;
                border: 1px solid #d1d5db; /* gray-300 */
                border-bottom-width: 3px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 14px;
                text-align: center;
                transition: all 0.1s ease;
                white-space: pre-line;
            }
            .dark .key {
                background-color: #4b5563; /* gray-600 */
                border-color: #374151; /* gray-700 */
                color: #f3f4f6; /* gray-200 */
            }
            .key.active {
                background-color: #3b82f6; /* blue-500 */
                color: white;
                border-color: #2563eb; /* blue-600 */
                transform: translateY(2px);
                box-shadow: none;
            }
        </style>
        <div class="flex flex-col gap-6 items-center">
            <!-- Дисплей информации о клавише -->
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-2xl font-bold h-8">-</div></div>
            </div>

            <!-- Виртуальная клавиатура -->
            <div id="virtual-keyboard" class="keyboard w-full max-w-4xl">
                <div class="key-row">
                    ${createKeyRow([
                        { name: '` ~', code: 'Backquote' }, { name: '1 !', code: 'Digit1' }, { name: '2 @', code: 'Digit2' },
                        { name: '3 #', code: 'Digit3' }, { name: '4 $', code: 'Digit4' }, { name: '5 %', code: 'Digit5' },
                        { name: '6 ^', code: 'Digit6' }, { name: '7 &', code: 'Digit7' }, { name: '8 *', code: 'Digit8' },
                        { name: '9 (', code: 'Digit9' }, { name: '0 )', code: 'Digit0' }, { name: '- _', code: 'Minus' },
                        { name: '= +', code: 'Equal' }, { name: 'Backspace', code: 'Backspace', grow: 2 }
                    ])}
                </div>
                <div class="key-row">
                     ${createKeyRow([
                        { name: 'Tab', code: 'Tab', grow: 1.5 }, { name: 'Q', code: 'KeyQ' }, { name: 'W', code: 'KeyW' },
                        { name: 'E', code: 'KeyE' }, { name: 'R', code: 'KeyR' }, { name: 'T', code: 'KeyT' },
                        { name: 'Y', code: 'KeyY' }, { name: 'U', code: 'KeyU' }, { name: 'I', code: 'KeyI' },
                        { name: 'O', code: 'KeyO' }, { name: 'P', code: 'KeyP' }, { name: '[ {', code: 'BracketLeft' },
                        { name: '] }', code: 'BracketRight' }, { name: '\\ |', code: 'Backslash', grow: 1.5 }
                    ])}
                </div>
                <div class="key-row">
                     ${createKeyRow([
                        { name: 'CapsLock', code: 'CapsLock', grow: 1.8 }, { name: 'A', code: 'KeyA' }, { name: 'S', code: 'KeyS' },
                        { name: 'D', code: 'KeyD' }, { name: 'F', code: 'KeyF' }, { name: 'G', code: 'KeyG' },
                        { name: 'H', code: 'KeyH' }, { name: 'J', code: 'KeyJ' }, { name: 'K', code: 'KeyK' },
                        { name: 'L', code: 'KeyL' }, { name: '; :', code: 'Semicolon' }, { name: "' \"", code: 'Quote' },
                        { name: 'Enter', code: 'Enter', grow: 2.2 }
                    ])}
                </div>
                <div class="key-row">
                     ${createKeyRow([
                        { name: 'Shift', code: 'ShiftLeft', grow: 2.5 }, { name: 'Z', code: 'KeyZ' }, { name: 'X', code: 'KeyX' },
                        { name: 'C', code: 'KeyC' }, { name: 'V', code: 'KeyV' }, { name: 'B', code: 'KeyB' },
                        { name: 'N', code: 'KeyN' }, { name: 'M', code: 'KeyM' }, { name: ', <', code: 'Comma' },
                        { name: '. >', code: 'Period' }, { name: '/ ?', code: 'Slash' }, { name: 'Shift', code: 'ShiftRight', grow: 2.5 }
                    ])}
                </div>
                <div class="key-row">
                     ${createKeyRow([
                        { name: 'Ctrl', code: 'ControlLeft', grow: 1.5 }, { name: 'Win', code: 'MetaLeft', grow: 1.2 },
                        { name: 'Alt', code: 'AltLeft', grow: 1.2 }, { name: 'Space', code: 'Space', grow: 8 },
                        { name: 'Alt', code: 'AltRight', grow: 1.2 }, { name: 'Win', code: 'MetaRight', grow: 1.2 },
                        { name: 'Menu', code: 'ContextMenu', grow: 1.2 }, { name: 'Ctrl', code: 'ControlRight', grow: 1.5 }
                    ])}
                </div>
            </div>
        </div>
    `;
}

function handleKeyDown(e) {
    e.preventDefault();
    document.getElementById('key-display').textContent = e.key;
    document.getElementById('code-display').textContent = e.code;
    document.getElementById('which-display').textContent = e.which;
    document.getElementById('keyCode-display').textContent = e.keyCode;
    
    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function handleKeyUp(e) {
    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.remove('active');
    }
}

export function init() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}
