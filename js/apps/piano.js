let audioContext;
const notes = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};
const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4', 'k': 'C5'
};
let pressedKeys = {};

function playNote(note) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01); 

    oscillator.start(now);
    
    // Привязываем ноду к нажатой клавише, чтобы остановить ее позже
    pressedKeys[note] = { oscillator, gainNode };
}

function stopNote(note) {
    if (pressedKeys[note]) {
        const { oscillator, gainNode } = pressedKeys[note];
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        oscillator.stop(now + 0.1);
        delete pressedKeys[note];
    }
}

function handleKeyDown(e) {
    const note = keyMap[e.key.toLowerCase()];
    if (note && !pressedKeys[note]) {
        playNote(note);
        document.querySelector(`.piano-key[data-note="${note}"]`)?.classList.add('active');
    }
}

function handleKeyUp(e) {
    const note = keyMap[e.key.toLowerCase()];
    if (note) {
        stopNote(note);
        document.querySelector(`.piano-key[data-note="${note}"]`)?.classList.remove('active');
    }
}

export function getHtml() {
    return `
      <div class="flex flex-col items-center space-y-4">
        <p class="text-gray-600 dark:text-gray-400 text-center">Играйте мышкой или используйте клавиши на клавиатуре (A, W, S, E, D, F, T, G, Y, H, U, J, K).</p>
        <div class="piano-container overflow-x-auto">
            <div class="piano-key white" data-note="C4"><span>A</span><div class="piano-key black" data-note="C#4"><span>W</span></div></div>
            <div class="piano-key white" data-note="D4"><span>S</span><div class="piano-key black" data-note="D#4"><span>E</span></div></div>
            <div class="piano-key white" data-note="E4"><span>D</span></div>
            <div class="piano-key white" data-note="F4"><span>F</span><div class="piano-key black" data-note="F#4"><span>T</span></div></div>
            <div class="piano-key white" data-note="G4"><span>G</span><div class="piano-key black" data-note="G#4"><span>Y</span></div></div>
            <div class="piano-key white" data-note="A4"><span>H</span><div class="piano-key black" data-note="A#4"><span>U</span></div></div>
            <div class="piano-key white" data-note="B4"><span>J</span></div>
            <div class="piano-key white" data-note="C5"><span>K</span></div>
        </div>
      </div>
    `;
}

export function init() {
    document.querySelectorAll('.piano-key').forEach(key => {
        const note = key.dataset.note;
        key.addEventListener('mousedown', () => playNote(note));
        key.addEventListener('mouseup', () => stopNote(note));
        key.addEventListener('mouseleave', () => stopNote(note)); // Если убрали мышку с зажатой клавиши
        key.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(note); });
        key.addEventListener('touchend', (e) => { e.preventDefault(); stopNote(note); });
    });
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    pressedKeys = {};
}
