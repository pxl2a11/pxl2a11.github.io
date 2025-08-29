// js/apps/keyboardTester.js

export function getHtml() {
    const createKey = (name, code, grow = 1, classes = '') => 
        `<div class="key ${classes}" data-code="${code}" style="flex-grow: ${grow}">
            ${name.replace('<br>', '<br/>')}
         </div>`;

    return `
        <style>
            .keyboard-container { display: flex; flex-direction: column; gap: 4px; padding: 10px; background-color: #9ca3af; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.2), inset 0 -4px 4px rgba(0,0,0,0.2); }
            .dark .keyboard-container { background-color: #1f2937; }
            .key-row { display: flex; gap: 4px; }
            .key { display: flex; align-items: center; justify-content: center; height: 45px; padding: 4px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-bottom-width: 3px; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; text-align: center; transition: all 0.05s ease; white-space: pre-line; box-shadow: 0 2px 2px rgba(0,0,0,0.1); }
            .dark .key { background-color: #4b5563; border-color: #374151; color: #f3f4f6; }
            .key.active { background-color: #3b82f6; color: white; border-color: #2563eb; transform: translateY(2px); box-shadow: none; }
            .key.fn-key { opacity: 0.6; cursor: not-allowed; }
            .key-placeholder { flex-grow: 1; visibility: hidden; }
        </style>
        <div class="flex flex-col gap-6 items-center">
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-2xl font-bold h-8">-</div></div>
            </div>

            <div id="virtual-keyboard" class="keyboard-container w-full max-w-6xl mx-auto">
                <div class="key-row">
                    ${createKey('Esc', 'Escape')}
                    <div class="key-placeholder" style="flex-grow: 1.5"></div>
                    ${createKey('F1', 'F1')} ${createKey('F2', 'F2')} ${createKey('F3', 'F3')} ${createKey('F4', 'F4')}
                    <div class="key-placeholder" style="flex-grow: 0.5"></div>
                    ${createKey('F5', 'F5')} ${createKey('F6', 'F6')} ${createKey('F7', 'F7')} ${createKey('F8', 'F8')}
                    <div class="key-placeholder" style="flex-grow: 0.5"></div>
                    ${createKey('F9', 'F9')} ${createKey('F10', 'F10')} ${createKey('F11', 'F11')} ${createKey('F12', 'F12')}
                    <div class="key-placeholder" style="flex-grow: 0.5"></div>
                    ${createKey('PrtSc', 'PrintScreen')} ${createKey('Scroll<br>Lock', 'ScrollLock')} ${createKey('Pause', 'Pause')}
                </div>
                <div class="key-row">
                    ${createKey('` ~', 'Backquote')} ${createKey('1 !', 'Digit1')} ${createKey('2 @', 'Digit2')} ${createKey('3 #', 'Digit3')}
                    ${createKey('4 $', 'Digit4')} ${createKey('5 %', 'Digit5')} ${createKey('6 ^', 'Digit6')} ${createKey('7 &', 'Digit7')}
                    ${createKey('8 *', 'Digit8')} ${createKey('9 (', 'Digit9')} ${createKey('0 )', 'Digit0')} ${createKey('- _', 'Minus')}
                    ${createKey('= +', 'Equal')} ${createKey('Backspace', 'Backspace', 2.1)}
                    <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    ${createKey('Ins', 'Insert')} ${createKey('Home', 'Home')} ${createKey('PgUp', 'PageUp')}
                     <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    ${createKey('Num<br>Lock', 'NumLock')} ${createKey('/', 'NumpadDivide')} ${createKey('*', 'NumpadMultiply')} ${createKey('-', 'NumpadSubtract')}
                </div>
                <div class="key-row">
                    ${createKey('Tab', 'Tab', 1.5)} ${createKey('Q', 'KeyQ')} ${createKey('W', 'KeyW')} ${createKey('E', 'KeyE')}
                    ${createKey('R', 'KeyR')} ${createKey('T', 'KeyT')} ${createKey('Y', 'KeyY')} ${createKey('U', 'KeyU')}
                    ${createKey('I', 'KeyI')} ${createKey('O', 'KeyO')} ${createKey('P', 'KeyP')} ${createKey('[ {', 'BracketLeft')}
                    ${createKey('] }', 'BracketRight')} ${createKey('\\ |', 'Backslash', 1.6)}
                    <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    ${createKey('Del', 'Delete')} ${createKey('End', 'End')} ${createKey('PgDn', 'PageDown')}
                    <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    ${createKey('7', 'Numpad7')} ${createKey('8', 'Numpad8')} ${createKey('9', 'Numpad9')} ${createKey('+', 'NumpadAdd', 1, 'h-24')}
                </div>
                <div class="key-row" style="align-items: flex-start;">
                    <div style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
                        <div class="key-row">
                            ${createKey('Caps Lock', 'CapsLock', 1.8)} ${createKey('A', 'KeyA')} ${createKey('S', 'KeyS')} ${createKey('D', 'KeyD')}
                            ${createKey('F', 'KeyF')} ${createKey('G', 'KeyG')} ${createKey('H', 'KeyH')} ${createKey('J', 'KeyJ')}
                            ${createKey('K', 'KeyK')} ${createKey('L', 'KeyL')} ${createKey('; :', 'Semicolon')} ${createKey("' \"", 'Quote')}
                            ${createKey('Enter', 'Enter', 2.45)}
                        </div>
                        <div class="key-row">
                            ${createKey('Shift', 'ShiftLeft', 2.4)} ${createKey('Z', 'KeyZ')} ${createKey('X', 'KeyX')} ${createKey('C', 'KeyC')}
                            ${createKey('V', 'KeyV')} ${createKey('B', 'KeyB')} ${createKey('N', 'KeyN')} ${createKey('M', 'KeyM')}
                            ${createKey(', <', 'Comma')} ${createKey('. >', 'Period')} ${createKey('/ ?', 'Slash')}
                            ${createKey('Shift', 'ShiftRight', 3.05)}
                        </div>
                    </div>
                    <div class="key-placeholder" style="flex-grow: 0.82"></div>
                    <div class="key" data-code="ArrowUp">▲</div>
                    <div class="key-placeholder" style="flex-grow: 1.5"></div>
                    <div style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
                       <div class="key-row">
                           ${createKey('4', 'Numpad4')} ${createKey('5', 'Numpad5')} ${createKey('6', 'Numpad6')}
                       </div>
                        <div class="key-row">
                           ${createKey('1', 'Numpad1')} ${createKey('2', 'Numpad2')} ${createKey('3', 'Numpad3')} ${createKey('Enter', 'NumpadEnter', 1, 'h-24')}
                       </div>
                    </div>
                </div>
                <div class="key-row" style="align-items: flex-start;">
                    ${createKey('Ctrl', 'ControlLeft', 1.6)} ${createKey('Fn', 'Fn', 1.2, 'fn-key')} ${createKey('Win', 'MetaLeft', 1.3)}
                    ${createKey('Alt', 'AltLeft', 1.4)} ${createKey('Space', 'Space', 8.5)}
                    ${createKey('Alt', 'AltRight', 1.4)} ${createKey('Win', 'MetaRight', 1.3)} ${createKey('Menu', 'ContextMenu', 1.3)}
                    ${createKey('Ctrl', 'ControlRight', 1.8)}
                    <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    <div class="key" data-code="ArrowLeft">◄</div>
                    <div class="key" data-code="ArrowDown">▼</div>
                    <div class="key" data-code="ArrowRight">►</div>
                     <div class="key-placeholder" style="flex-grow: 0.2"></div>
                    <div class="key" data-code="Numpad0" style="flex-grow: 2.05">0</div>
                    <div class="key" data-code="NumpadDecimal">.</div>
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
    // Теперь эта функция ничего не делает, подсветка остается.
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
    // Сбрасываем подсветку при уходе из приложения
    resetHighlight();
}
