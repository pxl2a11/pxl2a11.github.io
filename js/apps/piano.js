let audioContext;
const notes = {
    // Нижняя октава
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88,
    // Верхняя октава
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
    'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
    'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50
};

// Раскладка использует коды физических клавиш (e.code),
// что делает ее независимой от языка ввода.
const keyMap = {
    // Нижняя октава (ряд ASDF)
    'KeyA': 'C4', 'KeyW': 'C#4', 'KeyS': 'D4', 'KeyE': 'D#4', 'KeyD': 'E4',
    'KeyF': 'F4', 'KeyT': 'F#4', 'KeyG': 'G4', 'KeyY': 'G#4', 'KeyH': 'A4',
    'KeyU': 'A#4', 'KeyJ': 'B4',
    // Верхняя октава (ряд QWERTY)
    'KeyK': 'C5', 'KeyO': 'C#5', 'KeyL': 'D5', 'KeyP': 'D#5', 'Semicolon': 'E5',
    'Quote': 'F5',
    // Дополнительные клавиши для верхней октавы
    'KeyZ': 'F#5', 'KeyX': 'G5', 'KeyC': 'G#5', 'KeyV': 'A5', 'KeyB': 'A#5', 'KeyN': 'B5', 'KeyM': 'C6'
};
let pressedKeys = {};

function playNote(note) {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.error("AudioContext не поддерживается в этом браузере.", e);
            return;
        }
    }
    if (!notes[note] || pressedKeys[note]) return;

    pressedKeys[note] = true;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = notes[note];

    const now = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02); 

    oscillator.start(now);
    
    pressedKeys[note] = { oscillator, gainNode };
}

function stopNote(note) {
    if (pressedKeys[note]) {
        const { oscillator, gainNode } = pressedKeys[note];
        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        oscillator.stop(now + 0.15);
        delete pressedKeys[note];
    }
}

function handleKeyDown(e) {
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const code = e.code; 
    const note = keyMap[code];
    if (note) {
        playNote(note);
        document.querySelector(`.piano-key[data-note="${note}"]`)?.classList.add('active');
    }
}

function handleKeyUp(e) {
    const code = e.code;
    const note = keyMap[code];
    if (note) {
        stopNote(note);
        document.querySelector(`.piano-key[data-note="${note}"]`)?.classList.remove('active');
    }
}

export function getHtml() {
    return `
      <style>
        /* --- УЛУЧШЕННЫЕ СТИЛИ ДЛЯ ПИАНИНО --- */
        .piano-container {
            display: flex;
            justify-content: center;
            padding: 1rem;
            background: linear-gradient(to bottom, #4a5568, #2d3748); /* gray-600 to gray-800 */
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
            overflow-x: auto; /* Позволяет скроллить на маленьких экранах */
            -webkit-overflow-scrolling: touch; /* Плавный скролл на iOS */
        }

        .piano-key {
            position: relative;
            box-sizing: border-box;
            cursor: pointer;
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10+ */
            user-select: none; /* Standard */
            transition: all 0.07s ease;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 12px;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .piano-key.white {
            height: 240px;
            flex-grow: 1; /* Растягиваться */
            flex-shrink: 0;
            min-width: 50px;
            max-width: 70px; /* Ограничение максимальной ширины */
            background: linear-gradient(to bottom, #ffffff, #e8e8e8);
            color: #4a5568;
            border: 1px solid #b0b0b0;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 5px 2px -2px rgba(0,0,0,0.2);
            margin: 0 2px;
        }

        .piano-key.black {
            position: absolute;
            width: 30px;
            height: 140px;
            background: linear-gradient(to bottom, #374151, #1f2937); /* gray-700 to gray-800 */
            color: #d1d5db; /* gray-300 */
            left: -17px; /* (30/2) + 2px margin */
            top: -1px;
            z-index: 10;
            border-radius: 0 0 6px 6px;
            border: 2px solid #111827;
            box-shadow: 0 4px 1px -1px rgba(0,0,0,0.5);
            font-size: 0.8em;
        }

        .piano-key.white:active, .piano-key.white.active {
            background: linear-gradient(to bottom, #d1d5db, #e5e7eb); /* gray-300 to gray-200 */
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
            transform: scale(0.98, 0.99);
        }

        .piano-key.black:active, .piano-key.black.active {
            background: linear-gradient(to bottom, #4b5563, #374151); /* gray-600 to gray-700 */
            box-shadow: inset 0 3px 4px rgba(0,0,0,0.4);
            transform: translateY(2px);
        }

        .piano-key span {
            opacity: 0.7;
        }
      </style>
      <div class="flex flex-col items-center space-y-4">
        <p class="text-gray-600 dark:text-gray-400 text-center px-4">
            Играйте мышкой или используйте клавиатуру.
            <br>
            <span class="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">A, W, S, E, D...</span> для нижней октавы, <span class="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">K, O, L, P...</span> для верхней.
            <br>
            <span class="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">Z, X, C, V, B, N, M</span> для самых верхних нот.
        </p>
        <div class="piano-container w-full">
            <!-- Нижняя октава -->
            <div class="piano-key white" data-note="C4"><span>A</span><div class="piano-key black" data-note="C#4"><span>W</span></div></div>
            <div class="piano-key white" data-note="D4"><span>S</span><div class="piano-key black" data-note="D#4"><span>E</span></div></div>
            <div class="piano-key white" data-note="E4"><span>D</span></div>
            <div class="piano-key white" data-note="F4"><span>F</span><div class="piano-key black" data-note="F#4"><span>T</span></div></div>
            <div class="piano-key white" data-note="G4"><span>G</span><div class="piano-key black" data-note="G#4"><span>Y</span></div></div>
            <div class="piano-key white" data-note="A4"><span>H</span><div class="piano-key black" data-note="A#4"><span>U</span></div></div>
            <div class="piano-key white" data-note="B4"><span>J</span></div>
            <!-- Верхняя октава -->
            <div class="piano-key white" data-note="C5"><span>K</span><div class="piano-key black" data-note="C#5"><span>O</span></div></div>
            <div class="piano-key white" data-note="D5"><span>L</span><div class="piano-key black" data-note="D#5"><span>P</span></div></div>
            <div class="piano-key white" data-note="E5"><span>;</span></div>
            <div class="piano-key white" data-note="F5"><span>'</span><div class="piano-key black" data-note="F#5"><span>Z</span></div></div>
            <div class="piano-key white" data-note="G5"><span>X</span><div class="piano-key black" data-note="G#5"><span>C</span></div></div>
            <div class="piano-key white" data-note="A5"><span>V</span><div class="piano-key black" data-note="A#5"><span>B</span></div></div>
            <div class="piano-key white" data-note="B5"><span>N</span></div>
            <div class="piano-key white" data-note="C6"><span>M</span></div>
        </div>
      </div>
    `;
}

export function init() {
    document.querySelectorAll('.piano-key').forEach(key => {
        const note = key.dataset.note;
        
        key.addEventListener('mousedown', (e) => { e.preventDefault(); playNote(note); });
        key.addEventListener('mouseup', () => stopNote(note));
        key.addEventListener('mouseleave', () => stopNote(note));
        
        key.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(note); }, { passive: false });
        key.addEventListener('touchend', (e) => { e.preventDefault(); stopNote(note); });
    });
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    Object.keys(pressedKeys).forEach(note => stopNote(note));
    if (audioContext) {
        audioContext.close().then(() => {
            audioContext = null;
        });
    }
    pressedKeys = {};
}
