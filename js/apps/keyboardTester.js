// js/apps/keyboardTester.js

export function getHtml() {
    return `
        <style>
            /* --- ОСНОВНАЯ СТРУКТУРА НА GRID --- */
            .keyboard-layout {
                display: grid;
                /* Сетка подобрана для точного выравнивания */
                grid-template-columns: repeat(60, 1fr); 
                grid-auto-rows: 40px;
                gap: 4px;
                padding: 10px;
                background-color: #212529;
                border-radius: 8px;
                width: 100%;
                min-width: 1024px; /* Минимальная ширина для предотвращения "слома" макета */
                overflow-x: auto;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            /* --- СТИЛИ КЛАВИШ --- */
            .key {
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(to top, #495057, #6c757d);
                border: 1px solid #343a40;
                border-radius: 4px;
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2);
                color: #f8f9fa;
                font-size: 11px;
                font-weight: 600;
                text-align: center;
                transition: all 0.05s ease-out;
                user-select: none;
                grid-column: span 4; /* Базовая ширина клавиши = 4 колонки сетки */
            }
            .key.active { background: linear-gradient(to top, #007bff, #339aff); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.4); transform: translateY(1px); color: white; }
            .fn-key { opacity: 0.5; cursor: not-allowed; }

            /* --- ТОЧНОЕ ПОЗИЦИОНИРОВАНИЕ В СЕТКЕ --- */
            /* Ряд 0: F-клавиши и управление */
            [data-code="Escape"] { grid-column: 1 / 5; }
            [data-code="F1"] { grid-column: 7 / 11; } [data-code="F2"] { grid-column: 11 / 15; } [data-code="F3"] { grid-column: 15 / 19; } [data-code="F4"] { grid-column: 19 / 23; }
            [data-code="F5"] { grid-column: 24 / 28; } [data-code="F6"] { grid-column: 28 / 32; } [data-code="F7"] { grid-column: 32 / 36; } [data-code="F8"] { grid-column: 36 / 40; }
            [data-code="F9"] { grid-column: 41 / 45; } [data-code="F10"] { grid-column: 45 / 49; } [data-code="F11"] { grid-column: 49 / 53; } [data-code="F12"] { grid-column: 53 / 57; }
            [data-code="PrintScreen"] { grid-column: 59 / 63; } [data-code="ScrollLock"] { grid-column: 63 / 67; } [data-code="Pause"] { grid-column: 67 / 71; }

            /* Ряд 1: Цифры и навигация */
            [data-code="Backquote"] { grid-column: 1 / 5; } [data-code="Digit1"] { grid-column: 5 / 9; } [data-code="Digit2"] { grid-column: 9 / 13; } [data-code="Digit3"] { grid-column: 13 / 17; } [data-code="Digit4"] { grid-column: 17 / 21; } [data-code="Digit5"] { grid-column: 21 / 25; } [data-code="Digit6"] { grid-column: 25 / 29; } [data-code="Digit7"] { grid-column: 29 / 33; } [data-code="Digit8"] { grid-column: 33 / 37; } [data-code="Digit9"] { grid-column: 37 / 41; } [data-code="Digit0"] { grid-column: 41 / 45; } [data-code="Minus"] { grid-column: 45 / 49; } [data-code="Equal"] { grid-column: 49 / 53; } [data-code="Backspace"] { grid-column: 53 / 61; }
            [data-code="Insert"] { grid-column: 63 / 67; } [data-code="Home"] { grid-column: 67 / 71; } [data-code="PageUp"] { grid-column: 71 / 75; }
            [data-code="NumLock"] { grid-column: 77 / 81; } [data-code="NumpadDivide"] { grid-column: 81 / 85; } [data-code="NumpadMultiply"] { grid-column: 85 / 89; } [data-code="NumpadSubtract"] { grid-column: 89 / 93; }
            
            /* Ряд 2: QWERTY */
            [data-code="Tab"] { grid-column: 1 / 7; } [data-code="KeyQ"] { grid-column: 7 / 11; } [data-code="KeyW"] { grid-column: 11 / 15; } [data-code="KeyE"] { grid-column: 15 / 19; } [data-code="KeyR"] { grid-column: 19 / 23; } [data-code="KeyT"] { grid-column: 23 / 27; } [data-code="KeyY"] { grid-column: 27 / 31; } [data-code="KeyU"] { grid-column: 31 / 35; } [data-code="KeyI"] { grid-column: 35 / 39; } [data-code="KeyO"] { grid-column: 39 / 43; } [data-code="KeyP"] { grid-column: 43 / 47; } [data-code="BracketLeft"] { grid-column: 47 / 51; } [data-code="BracketRight"] { grid-column: 51 / 55; } [data-code="Backslash"] { grid-column: 55 / 61; }
            [data-code="Delete"] { grid-column: 63 / 67; } [data-code="End"] { grid-column: 67 / 71; } [data-code="PageDown"] { grid-column: 71 / 75; }
            [data-code="Numpad7"] { grid-column: 77 / 81; } [data-code="Numpad8"] { grid-column: 81 / 85; } [data-code="Numpad9"] { grid-column: 85 / 89; }
            [data-code="NumpadAdd"] { grid-column: 89 / 93; grid-row: span 2; }

            /* Ряд 3: ASDF */
            [data-code="CapsLock"] { grid-column: 1 / 8; } [data-code="KeyA"] { grid-column: 8 / 12; } [data-code="KeyS"] { grid-column: 12 / 16; } [data-code="KeyD"] { grid-column: 16 / 20; } [data-code="KeyF"] { grid-column: 20 / 24; } [data-code="KeyG"] { grid-column: 24 / 28; } [data-code="KeyH"] { grid-column: 28 / 32; } [data-code="KeyJ"] { grid-column: 32 / 36; } [data-code="KeyK"] { grid-column: 36 / 40; } [data-code="KeyL"] { grid-column: 40 / 44; } [data-code="Semicolon"] { grid-column: 44 / 48; } [data-code="Quote"] { grid-column: 48 / 52; } [data-code="Enter"] { grid-column: 52 / 61; }
            [data-code="Numpad4"] { grid-column: 77 / 81; } [data-code="Numpad5"] { grid-column: 81 / 85; } [data-code="Numpad6"] { grid-column: 85 / 89; }

            /* Ряд 4: ZXCV и стрелка вверх */
            [data-code="ShiftLeft"] { grid-column: 1 / 10; } [data-code="KeyZ"] { grid-column: 10 / 14; } [data-code="KeyX"] { grid-column: 14 / 18; } [data-code="KeyC"] { grid-column: 18 / 22; } [data-code="KeyV"] { grid-column: 22 / 26; } [data-code="KeyB"] { grid-column: 26 / 30; } [data-code="KeyN"] { grid-column: 30 / 34; } [data-code="KeyM"] { grid-column: 34 / 38; } [data-code="Comma"] { grid-column: 38 / 42; } [data-code="Period"] { grid-column: 42 / 46; } [data-code="Slash"] { grid-column: 46 / 50; } [data-code="ShiftRight"] { grid-column: 50 / 61; }
            [data-code="ArrowUp"] { grid-column: 67 / 71; }
            [data-code="Numpad1"] { grid-column: 77 / 81; } [data-code="Numpad2"] { grid-column: 81 / 85; } [data-code="Numpad3"] { grid-column: 85 / 89; }
            [data-code="NumpadEnter"] { grid-column: 89 / 93; grid-row: span 2; }
            
            /* Ряд 5: Нижний ряд и стрелки */
            [data-code="ControlLeft"] { grid-column: 1 / 6; } [data-code="MetaLeft"] { grid-column: 6 / 11; } [data-code="AltLeft"] { grid-column: 11 / 16; } [data-code="Space"] { grid-column: 16 / 46; } [data-code="AltRight"] { grid-column: 46 / 51; } [data-code="Fn"] { grid-column: 51 / 56; } /* Fn может не иметь code */ [data-code="ContextMenu"] { grid-column: 56 / 61; }
            [data-code="ArrowLeft"] { grid-column: 63 / 67; } [data-code="ArrowDown"] { grid-column: 67 / 71; } [data-code="ArrowRight"] { grid-column: 71 / 75; }
            [data-code="Numpad0"] { grid-column: 77 / 85; } [data-code="NumpadDecimal"] { grid-column: 85 / 89; }
        </style>
        <div class="flex flex-col gap-6 items-center">
            <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.key</div><div id="key-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.code</div><div id="code-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.which</div><div id="which-display" class="text-xl font-bold h-7 truncate">-</div></div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><div class="text-sm text-gray-500 dark:text-gray-400">event.keyCode</div><div id="keyCode-display" class="text-xl font-bold h-7 truncate">-</div></div>
            </div>

            <div id="virtual-keyboard" class="keyboard-layout">
                <!-- Javascript сгенерирует здесь все клавиши -->
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
    
    // `e.code` - самый надежный способ идентифицировать физическую клавишу
    const keyElement = document.querySelector(`.key[data-code="${e.code}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function handleKeyUp(e) {
    // Не убираем подсветку, как и договаривались
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
    const keyboardContainer = document.getElementById('virtual-keyboard');
    const keyCodes = [
        'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrintScreen', 'ScrollLock', 'Pause',
        'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace', 'Insert', 'Home', 'PageUp', 'NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract',
        'Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete', 'End', 'PageDown', 'Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd',
        'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter', 'Numpad4', 'Numpad5', 'Numpad6',
        'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight', 'ArrowUp', 'Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter',
        'ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'Fn', 'ContextMenu', 'ControlRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Numpad0', 'NumpadDecimal'
    ];
    
    const keyNames = {'Escape': 'Esc', 'PrintScreen':'PrtSc', 'ScrollLock': 'Scroll', 'Backquote': '`', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4', 'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9', 'Digit0': '0', 'Minus': '-', 'Equal': '=', 'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\', 'Semicolon': ';', 'Quote': "'", 'Comma': ',', 'Period': '.', 'Slash': '/', 'ArrowUp': '▲', 'ArrowLeft': '◄', 'ArrowDown': '▼', 'ArrowRight': '►', 'MetaLeft': 'Win', 'MetaRight': 'Win', 'ContextMenu':'Menu', 'ControlLeft': 'Ctrl', 'ControlRight': 'Ctrl', 'ShiftLeft': 'Shift', 'ShiftRight': 'Shift', 'AltLeft': 'Alt', 'AltRight': 'Alt'};

    keyboardContainer.innerHTML = keyCodes.map(code => {
        let name = keyNames[code] || code.replace('Key', '').replace('Numpad', '');
        if (['Add', 'Subtract', 'Multiply', 'Divide', 'Decimal', 'Enter'].includes(name)) {
            name = {'Add':'+', 'Subtract':'-', 'Multiply':'*', 'Divide':'/', 'Decimal':'.', 'Enter': 'Enter'}[name];
        }
        const classes = code === 'Fn' ? 'fn-key' : '';
        return `<div class="key ${classes}" data-code="${code}">${name}</div>`;
    }).join('');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.getElementById('reset-keyboard-btn').addEventListener('click', resetHighlight);
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    resetHighlight();
}
