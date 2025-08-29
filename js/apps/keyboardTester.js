//51 js/apps/keyboardTester.js

export function getHtml() {
    // Вспомогательная функция для создания клавиш, чтобы HTML был чище
    const key = (name, code, classes = '') => `<div class="key ${classes}" data-code="${code}">${name}</div>`;

    return `
        <style>
            .keyboard-layout {
                padding: 0.5rem; /* Уменьшен внутренний отступ */
                background-color: #212529;
                border-radius: 0.5rem;
                box-shadow: 0 8px 16px rgba(0,0,0,0.3), inset 0 -4px 4px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                gap: 0.25rem; /* Уменьшен основной отступ */
                width: 100%;
                overflow-x: auto; /* Добавлена горизонтальная прокрутка на очень маленьких экранах */
            }
            .keyboard-inner-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                min-width: 900px; /* Минимальная ширина, чтобы клавиатура не "ломалась" */
            }
            .key-row {
                display: flex;
                gap: 0.25rem; /* Уменьшен отступ в ряду */
            }
            .key {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1 1 0px;
                min-width: 35px; /* Уменьшен размер клавиши */
                height: 35px; /* Уменьшен размер клавиши */
                padding: 4px;
                background: linear-gradient(to top, #495057, #6c757d);
                border: 1px solid #343a40;
                border-radius: 0.25rem; /* Уменьшен радиус */
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2); /* Уменьшена тень */
                color: #f8f9fa;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 11px; /* Уменьшен шрифт */
                font-weight: 600;
                text-align: center;
                transition: all 0.05s ease-out;
                user-select: none;
            }
            .dark .key { background-color: #4b5563; border-color: #374151; color: #f3f4f6; }
            .key.active { background: linear-gradient(to top, #007bff, #339aff); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.4); transform: translateY(1px); color: white; }
            .key-placeholder { flex: 1; visibility: hidden; }

            /* Пропорциональные размеры клавиш */
            .key--w-1-25 { flex-grow: 1.25; } .key--w-1-5 { flex-grow: 1.5; } .key--w-1-75 { flex-grow: 1.75; } .key--w-2 { flex-grow: 2; }
            .key--w-2-25 { flex-grow: 2.25; } .key--w-2-75 { flex-grow: 2.75; } .key--w-6-25 { flex-grow: 6.25; }

            /* Высота для вертикальных клавиш Numpad */
            .key--h-2 { height: 74px; } /* (35px * 2) + 4px gap */
            
            .keyboard-main, .keyboard-numpad, .keyboard-nav-arrows { display: flex; flex-direction: column; gap: 0.25rem; }
            .nav-arrows-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; }
            .fn-key { opacity: 0.5; cursor: not-allowed; }
            .fn-key.active { opacity: 1; }
        </style>
        <div class="flex flex-col gap-6 items-center">
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-xl font-bold h-7 truncate">-</div></div>
            </div>

            <div id="virtual-keyboard" class="keyboard-layout w-full max-w-7xl mx-auto">
                <div class="keyboard-inner-wrapper">
                    <div class="key-row">
                        ${key('Esc', 'Escape')} <div class="key-placeholder"></div>
                        ${key('F1', 'F1')} ${key('F2', 'F2')} ${key('F3', 'F3')} ${key('F4', 'F4')} <div class="key-placeholder" style="flex-grow:0.5;"></div>
                        ${key('F5', 'F5')} ${key('F6', 'F6')} ${key('F7', 'F7')} ${key('F8', 'F8')} <div class="key-placeholder" style="flex-grow:0.5;"></div>
                        ${key('F9', 'F9')} ${key('F10', 'F10')} ${key('F11', 'F11')} ${key('F12', 'F12')} <div class="key-placeholder"></div>
                        ${key('PrtSc', 'PrintScreen')} ${key('Scroll', 'ScrollLock')} ${key('Pause', 'Pause')}
                    </div>
                    <div class="key-row">
                        <div class="keyboard-main" style="flex-grow: 15;">
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
                        <div class="keyboard-nav-arrows" style="flex-grow: 3.5;">
                            <div class="key-row">${key('Ins', 'Insert')} ${key('Home', 'Home')} ${key('PgUp', 'PageUp')}</div>
                            <div class="key-row">${key('Del', 'Delete')} ${key('End', 'End')} ${key('PgDn', 'PageDown')}</div>
                            <div class="nav-arrows-grid">
                                <div></div> ${key('▲', 'ArrowUp')} <div></div>
                                ${key('◄', 'ArrowLeft')} ${key('▼', 'ArrowDown')} ${key('►', 'ArrowRight')}
                            </div>
                        </div>
                        <div class="keyboard-numpad" style="flex-grow: 4.5;">
                            <div class="key-row">${key('Num', 'NumLock')} ${key('/', 'NumpadDivide')} ${key('*', 'NumpadMultiply')} ${key('-', 'NumpadSubtract')}</div>
                            <div class="key-row" style="align-items: flex-start;">
                                <div class="flex flex-col gap-1" style="flex-grow: 3">
                                    <div class="key-row">${key('7', 'Numpad7')} ${key('8', 'Numpad8')} ${key('9', 'Numpad9')}</div>
                                    <div class="key-row">${key('4', 'Numpad4')} ${key('5', 'Numpad5')} ${key('6', 'Numpad6')}</div>
                                </div>
                                ${key('+', 'NumpadAdd', 'key--h-2')}
                            </div>
                            <div class="key-row" style="align-items: flex-start;">
                                <div class="flex flex-col gap-1" style="flex-grow: 3">
                                    <div class="key-row">${key('1', 'Numpad1')} ${key('2', 'Numpad2')} ${key('3', 'Numpad3')}</div>
                                    <div class="key-row">${key('0', 'Numpad0', 'key--w-2')} ${key('.', 'NumpadDecimal')}</div>
                                </div>
                                ${key('Enter', 'NumpadEnter', 'key--h-2')}
                            </div>
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
    
    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function handleKeyUp(e) {
    // Не убираем подсветку
}

function resetHighlight() {
    document.querySelectorAll('.key.active').forEach(key => {
        key.classList.remove('active');
    });
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
