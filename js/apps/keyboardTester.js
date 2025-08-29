// js/apps/keyboardTester.js

export function getHtml() {
    // Вспомогательная функция для создания клавиш, чтобы HTML был чище
    const key = (name, code, classes = '') => `<div class="key ${classes}" data-code="${code}">${name}</div>`;

    return `
        <style>
            .keyboard-layout {
                padding: 1rem;
                background-color: #212529; /* Очень темный фон, как на референсе */
                border-radius: 0.75rem;
                box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .key-row {
                display: flex;
                gap: 0.75rem;
            }
            .key {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1 1 0px; /* Базовый размер для всех клавиш */
                min-width: 40px;
                height: 40px;
                padding: 5px;
                background: linear-gradient(to top, #495057, #6c757d);
                border: 1px solid #343a40;
                border-radius: 0.375rem;
                box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2);
                color: #f8f9fa;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 0.8rem;
                font-weight: 600;
                text-align: center;
                transition: all 0.05s ease-out;
                user-select: none;
            }
            .key.active {
                background: linear-gradient(to top, #007bff, #339aff);
                box-shadow: inset 0 -1px 0 rgba(0,0,0,0.4);
                transform: translateY(2px);
                color: white;
            }
            .key-placeholder { flex: 1; }
            /* Размеры клавиш */
            .key--w-1-25 { flex-grow: 1.25; }
            .key--w-1-5 { flex-grow: 1.5; }
            .key--w-1-75 { flex-grow: 1.75; }
            .key--w-2 { flex-grow: 2; }
            .key--w-2-25 { flex-grow: 2.25; }
            .key--w-2-75 { flex-grow: 2.75; }
            .key--w-6-25 { flex-grow: 6.25; } /* Spacebar */
            .key--h-2 { height: 84px; } /* Numpad + и Enter */
            .key--stagger-s { margin-left: 20px; }
            .key--stagger-m { margin-left: 35px; }
            .key--stagger-l { margin-left: 50px; }
            
            .keyboard-main, .keyboard-numpad, .keyboard-nav-arrows { display: flex; flex-direction: column; gap: 0.75rem; }
            .nav-arrows-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
            .fn-key { opacity: 0.5; cursor: not-allowed; }
            .fn-key.active { opacity: 1; } /* Подсвечиваем, если браузер все же поймает событие */
        </style>
        <div class="flex flex-col gap-6 items-center">
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-2xl font-bold h-8 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-2xl font-bold h-8 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-2xl font-bold h-8 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-2xl font-bold h-8 truncate">-</div></div>
            </div>

            <div id="virtual-keyboard" class="keyboard-layout w-full max-w-7xl mx-auto">
                <div class="key-row">
                    ${key('Esc', 'Escape')}
                    <div class="key-placeholder"></div>
                    ${key('F1', 'F1')} ${key('F2', 'F2')} ${key('F3', 'F3')} ${key('F4', 'F4')}
                    <div class="key-placeholder" style="flex-grow:0.5;"></div>
                    ${key('F5', 'F5')} ${key('F6', 'F6')} ${key('F7', 'F7')} ${key('F8', 'F8')}
                    <div class="key-placeholder" style="flex-grow:0.5;"></div>
                    ${key('F9', 'F9')} ${key('F10', 'F10')} ${key('F11', 'F11')} ${key('F12', 'F12')}
                    <div class="key-placeholder"></div>
                    ${key('PrtSc', 'PrintScreen')} ${key('Scroll', 'ScrollLock')} ${key('Pause', 'Pause')}
                </div>
                <div class="key-row">
                    <div class="keyboard-main">
                         <div class="key-row">
                            ${key('` ~', 'Backquote')} ${key('1 !', 'Digit1')} ${key('2 @', 'Digit2')} ${key('3 #', 'Digit3')} ${key('4 $', 'Digit4')} ${key('5 %', 'Digit5')} ${key('6 ^', 'Digit6')} ${key('7 &', 'Digit7')} ${key('8 *', 'Digit8')} ${key('9 (', 'Digit9')} ${key('0 )', 'Digit0')} ${key('- _', 'Minus')} ${key('= +', 'Equal')} ${key('Backspace', 'Backspace', 'key--w-2')}
                        </div>
                        <div class="key-row">
                            ${key('Tab', 'Tab', 'key--w-1-5')} ${key('Q', 'KeyQ')} ${key('W', 'KeyW')} ${key('E', 'KeyE')} ${key('R', 'KeyR')} ${key('T', 'KeyT')} ${key('Y', 'KeyY')} ${key('U', 'KeyU')} ${key('I', 'KeyI')} ${key('O', 'KeyO')} ${key('P', 'KeyP')} ${key('[ {', 'BracketLeft')} ${key('] }', 'BracketRight')} ${key('\\ |', 'Backslash', 'key--w-1-5')}
                        </div>
                         <div class="key-row">
                            ${key('Caps Lock', 'CapsLock', 'key--w-1-75')} ${key('A', 'KeyA')} ${key('S', 'KeyS')} ${key('D', 'KeyD')} ${key('F', 'KeyF')} ${key('G', 'KeyG')} ${key('H', 'KeyH')} ${key('J', 'KeyJ')} ${key('K', 'KeyK')} ${key('L', 'KeyL')} ${key('; :', 'Semicolon')} ${key("' \"", 'Quote')} ${key('Enter', 'Enter', 'key--w-2-25')}
                        </div>
                        <div class="key-row">
                            ${key('Shift', 'ShiftLeft', 'key--w-2-25')} ${key('Z', 'KeyZ')} ${key('X', 'KeyX')} ${key('C', 'KeyC')} ${key('V', 'KeyV')} ${key('B', 'KeyB')} ${key('N', 'KeyN')} ${key('M', 'KeyM')} ${key(', <', 'Comma')} ${key('. >', 'Period')} ${key('/ ?', 'Slash')} ${key('Shift', 'ShiftRight', 'key--w-2-75')}
                        </div>
                        <div class="key-row">
                            ${key('Ctrl', 'ControlLeft', 'key--w-1-25')} ${key('Win', 'MetaLeft', 'key--w-1-25')} ${key('Alt', 'AltLeft', 'key--w-1-25')} ${key('Space', 'Space', 'key--w-6-25')} ${key('Alt', 'AltRight', 'key--w-1-25')} ${key('Fn', 'Fn', 'fn-key key--w-1-25')} ${key('Menu', 'ContextMenu', 'key--w-1-25')} ${key('Ctrl', 'ControlRight', 'key--w-1-25')}
                        </div>
                    </div>
                    <div class="keyboard-nav-arrows">
                         <div class="key-row">
                            ${key('Ins', 'Insert')} ${key('Home', 'Home')} ${key('PgUp', 'PageUp')}
                        </div>
                        <div class="key-row">
                            ${key('Del', 'Delete')} ${key('End', 'End')} ${key('PgDn', 'PageDown')}
                        </div>
                         <div class="nav-arrows-grid">
                            <div></div> ${key('▲', 'ArrowUp')} <div></div>
                            ${key('◄', 'ArrowLeft')} ${key('▼', 'ArrowDown')} ${key('►', 'ArrowRight')}
                        </div>
                    </div>
                    <div class="keyboard-numpad">
                        <div class="key-row">
                            ${key('Num', 'NumLock')} ${key('/', 'NumpadDivide')} ${key('*', 'NumpadMultiply')} ${key('-', 'NumpadSubtract')}
                        </div>
                        <div class="key-row" style="align-items: flex-start;">
                            <div class="flex flex-col gap-2" style="flex-grow: 3">
                                <div class="key-row">${key('7', 'Numpad7')} ${key('8', 'Numpad8')} ${key('9', 'Numpad9')}</div>
                                <div class="key-row">${key('4', 'Numpad4')} ${key('5', 'Numpad5')} ${key('6', 'Numpad6')}</div>
                            </div>
                             ${key('+', 'NumpadAdd', 'key--h-2')}
                        </div>
                        <div class="key-row" style="align-items: flex-start;">
                             <div class="flex flex-col gap-2" style="flex-grow: 3">
                                <div class="key-row">${key('1', 'Numpad1')} ${key('2', 'Numpad2')} ${key('3', 'Numpad3')}</div>
                                <div class="key-row">${key('0', 'Numpad0', 'key--w-2')} ${key('.', 'NumpadDecimal')}</div>
                            </div>
                            ${key('Enter', 'NumpadEnter', 'key--h-2')}
                        </div>
                    </div>
                </div>
            </div>
             <button id="reset-keyboard-btn" class="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Сбросить подсветку</button>
        </div>
    `;
}

function handleKeyDown(e) {
    e.preventDefault();
    document.getElementById('key-display').textContent = e.key;
    document.getElementById('code-display').textContent = e.code;
    document.getElementById('which-display').textContent = e.which;
    document.getElementById('keyCode-display').textContent = e.keyCode;
    
    // Находим клавишу. Обрабатываем отдельно левые/правые варианты, если e.code их различает
    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function handleKeyUp(e) {
    // В этой версии мы не убираем подсветку при отпускании,
    // поэтому эта функция может оставаться пустой или использоваться для другой логики.
}

function resetHighlight() {
    document.querySelectorAll('.key.active').forEach(key => {
        key.classList.remove('active');
    });
    // Сбрасываем дисплеи
    document.getElementById('key-display').textContent = '-';
    document.getElementById('code-display').textContent = '-';
    document.getElementById('which-display').textContent = '-';
    document.getElementById('keyCode-display').textContent = '-';
}

export function init() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.getElementById('reset-keyboard-btn').addEventListener('click', resetHighlight);
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    resetHighlight();
}
