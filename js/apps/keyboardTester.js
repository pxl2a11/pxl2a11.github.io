// js/apps/keyboardTester.js

let lastActiveKeyElement = null;

export function getHtml() {
    const createKeyRow = (keys) => keys.map(key => 
        `<div class="key ${key.class || ''}" data-code="${key.code}" style="flex-grow: ${key.grow || 1}">
            ${key.name.replace('<br>', '<br/>')}
         </div>`
    ).join('');

    return `
        <style>
            .keyboard { display: flex; flex-direction: column; gap: 8px; padding: 10px; background-color: #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .dark .keyboard { background-color: #374151; }
            .key-row { display: flex; gap: 8px; justify-content: center; }
            .key { display: flex; align-items: center; justify-content: center; height: 50px; padding: 5px; background-color: #ffffff; border: 1px solid #d1d5db; border-bottom-width: 3px; border-radius: 6px; font-family: monospace; font-size: 14px; text-align: center; transition: all 0.1s ease; white-space: pre-line; }
            .dark .key { background-color: #4b5563; border-color: #374151; color: #f3f4f6; }
            .key.active { background-color: #3b82f6; color: white; border-color: #2563eb; transform: translateY(2px); box-shadow: none; }
            .key.fn-key { opacity: 0.6; cursor: not-allowed; } /* Стиль для неактивной Fn */
        </style>
        <div class="flex flex-col gap-6 items-center">
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-2xl font-bold h-8">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-2xl font-bold h-8">-</div></div>
            </div>

            <div id="virtual-keyboard" class="keyboard w-full max-w-5xl">
                <!-- Верхний ряд с мультимедиа -->
                <div class="key-row">
                    ${createKeyRow([
                        { name: 'Vol-', code: 'AudioVolumeDown' }, { name: 'Vol+', code: 'AudioVolumeUp' }, { name: 'Mute', code: 'AudioVolumeMute' },
                        { name: '⏴', code: 'MediaTrackPrevious' }, { name: '⏯', code: 'MediaPlayPause' }, { name: '⏵', code: 'MediaTrackNext' },
                        { name: 'PrtSc', code: 'PrintScreen', grow: 1.5 }, { name: 'Scroll<br>Lock', code: 'ScrollLock', grow: 1.5 }, { name: 'Pause', code: 'Pause', grow: 1.5 }
                    ])}
                </div>
                 <!-- Основная клавиатура -->
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
                 <!-- Нижний ряд со стрелками -->
                <div class="key-row">
                     ${createKeyRow([
                        { name: 'Ctrl', code: 'ControlLeft', grow: 1.5 }, { name: 'Fn', code: 'Fn', class: 'fn-key', grow: 1.2 }, { name: 'Win', code: 'MetaLeft', grow: 1.2 },
                        { name: 'Alt', code: 'AltLeft', grow: 1.2 }, { name: 'Space', code: 'Space', grow: 8 },
                        { name: 'Alt', code: 'AltRight', grow: 1.2 }, { name: 'Win', code: 'MetaRight', grow: 1.2 },
                        { name: 'Menu', code: 'ContextMenu', grow: 1.2 }, { name: 'Ctrl', code: 'ControlRight', grow: 1.5 }
                    ])}
                </div>
                 <div class="key-row">
                     ${createKeyRow([
                        { name: '', code: 'placeholder1', grow: 12, class: 'invisible' }, // Пустое место для выравнивания
                        { name: '▲', code: 'ArrowUp' },
                        { name: '', code: 'placeholder2', grow: 1, class: 'invisible' },
                     ])}
                </div>
                 <div class="key-row">
                     ${createKeyRow([
                        { name: '', code: 'placeholder3', grow: 11, class: 'invisible' },
                        { name: '◄', code: 'ArrowLeft' },
                        { name: '▼', code: 'ArrowDown' },
                        { name: '►', code: 'ArrowRight' },
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
    
    // Снимаем подсветку с предыдущей клавиши
    if (lastActiveKeyElement) {
        lastActiveKeyElement.classList.remove('active');
    }

    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        lastActiveKeyElement = keyElement; // Запоминаем текущую клавишу
    }
}

function handleKeyUp(e) {
    // Теперь эта функция ничего не делает, подсветка остается до следующего нажатия
}

export function init() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Сбрасываем подсветку при уходе со страницы
    lastActiveKeyElement = null; 
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (lastActiveKeyElement) {
        lastActiveKeyElement.classList.remove('active');
        lastActiveKeyElement = null;
    }
}
