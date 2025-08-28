// js/apps/keyboardTester.js

let keydownHandler, keyupHandler;

export function getHtml() {
    return `
        <style>
            .keyboard { display: flex; flex-direction: column; gap: 8px; padding: 12px; background-color: #374151; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
            .dark .keyboard { background-color: #1f2937; }
            .key-row { display: flex; justify-content: center; gap: 8px; }
            .key {
                display: flex; align-items: center; justify-content: center;
                height: 50px; min-width: 50px; padding: 0 5px;
                background-color: #f3f4f6; color: #1f2937;
                border: 1px solid #9ca3af; border-bottom: 3px solid #9ca3af;
                border-radius: 6px; font-weight: 600; font-size: 14px;
                transition: all 0.1s ease;
            }
            .dark .key { background-color: #4b5563; color: #e5e7eb; border-color: #374151; border-bottom-color: #1f2937; }
            .key.pressed {
                transform: translateY(2px);
                background-color: #60a5fa; border-bottom-width: 1px;
                box-shadow: 0 0 10px #60a5fa; color: white;
            }
            .dark .key.pressed { background-color: #3b82f6; border-color: #2563eb; }
            /* Special key sizes */
            .key[data-code="Backspace"], .key[data-code="Enter"] { flex-grow: 2.5; }
            .key[data-code="Tab"], .key[data-code="CapsLock"] { flex-grow: 1.5; }
            .key[data-code="ShiftLeft"] { flex-grow: 2.5; }
            .key[data-code="ShiftRight"] { flex-grow: 2.8; }
            .key[data-code="Space"] { flex-grow: 8; }
            .key[data-code="ControlLeft"], .key[data-code="MetaLeft"], .key[data-code="AltLeft"] { flex-grow: 1.5; }
            .key[data-code="ControlRight"], .key[data-code="AltRight"] { flex-grow: 1.5; }
        </style>
        <div class="flex flex-col items-center gap-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                <div class="text-center"><p class="font-bold text-3xl" id="key-display">...</p><p class="text-sm text-gray-500 dark:text-gray-400">Key</p></div>
                <div class="text-center"><p class="font-bold text-xl font-mono" id="code-display">...</p><p class="text-sm text-gray-500 dark:text-gray-400">Code</p></div>
                <div class="text-center"><p class="font-bold text-3xl" id="keycode-display">...</p><p class="text-sm text-gray-500 dark:text-gray-400">KeyCode</p></div>
            </div>
            <p class="text-gray-600 dark:text-gray-400">Нажмите любую клавишу</p>
            <div class="keyboard w-full max-w-4xl mx-auto">
                <div class="key-row">
                    ${['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'].map(k => `<div class="key" data-code="${k}">${k.replace('Digit', '')[0]}</div>`).join('').replace('`','~').replace('1','!').replace('2','@').replace('3','#').replace('4','$').replace('5','%').replace('6','^').replace('7','&').replace('8','*').replace('9','(').replace('0',')').replace('M','-').replace('E','=').replace('B','←')}
                </div>
                <div class="key-row">
                    ${['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'].map(k => `<div class="key" data-code="${k}">${k.replace('Key', '')[0]}</div>`).join('').replace('T','Tab').replace('B','\\').replace('[','{').replace(']','}')}
                </div>
                <div class="key-row">
                     ${['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'].map(k => `<div class="key" data-code="${k}">${k.replace('Key', '')[0]}</div>`).join('').replace('C','Caps').replace('S',';').replace('Q',"'").replace('E','Enter')}
                </div>
                <div class="key-row">
                     ${['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'].map(k => `<div class="key" data-code="${k}">${k.replace('Key', '')[0]}</div>`).join('').replace('S','Shift').replace(',','<').replace('.','>').replace('/','?')}
                </div>
                <div class="key-row">
                    ${['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'ControlRight'].map(k => `<div class="key" data-code="${k}">${k}</div>`).join('').replace('ControlLeft','Ctrl').replace('MetaLeft','Win').replace('AltLeft','Alt').replace('Space',' ').replace('AltRight','Alt').replace('ControlRight','Ctrl')}
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const keyDisplay = document.getElementById('key-display');
    const codeDisplay = document.getElementById('code-display');
    const keycodeDisplay = document.getElementById('keycode-display');

    keydownHandler = (e) => {
        e.preventDefault();
        const keyEl = document.querySelector(`.key[data-code="${e.code}"]`);
        if (keyEl) {
            keyEl.classList.add('pressed');
        }
        keyDisplay.textContent = e.key;
        codeDisplay.textContent = e.code;
        keycodeDisplay.textContent = e.keyCode;
    };

    keyupHandler = (e) => {
        const keyEl = document.querySelector(`.key[data-code="${e.code}"]`);
        if (keyEl) {
            keyEl.classList.remove('pressed');
        }
    };

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);
}

export function cleanup() {
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('keyup', keyupHandler);
}
