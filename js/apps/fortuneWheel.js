let spinTimeout;
let spinSound, winSound;

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center">
             <audio id="spin-sound" src="https://actions.google.com/sounds/v1/games/spin_wheel.ogg" preload="auto"></audio>
             <audio id="win-sound" src="https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg" preload="auto"></audio>

            <canvas id="wheel-canvas" width="350" height="350" class="mb-4"></canvas>
            
            <div class="flex items-center justify-center gap-4 w-full max-w-sm mb-4">
                <button id="spin-btn" class="flex-grow bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 disabled:opacity-50">Крутить</button>
                <label class="flex items-center cursor-pointer whitespace-nowrap">
                    <input type="checkbox" id="elimination-mode-checkbox" class="h-4 w-4 rounded">
                    <span class="ml-2 text-sm">На выбывание</span>
                </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
                    <h4 class="text-center font-semibold text-sm mb-1">Варианты</h4>
                    <div id="options-list" class="space-y-1.5 pr-1 max-h-40 overflow-y-auto"></div>
                    <div class="flex gap-2 pt-1">
                        <input id="option-input" type="text" placeholder="Добавить..." class="flex-grow p-1.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <button id="add-option-btn" class="bg-green-500 text-white px-3 rounded-lg hover:bg-green-600 text-lg font-bold">+</button>
                    </div>
                </div>
                <div class="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
                    <h4 class="text-center font-semibold text-sm mb-1">Настройки</h4>
                     <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="sound-effects-checkbox" class="h-4 w-4 rounded" checked>
                        <span class="ml-2 text-sm">Звуковые эффекты</span>
                    </label>
                    <select id="color-scheme-select" class="w-full py-1.5 px-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="default">Схема по умолчанию</option>
                        <option value="pastel">Пастельная</option>
                        <option value="neon">Неоновая</option>
                        <option value="ocean">Океан</option>
                    </select>
                    <h4 class="text-center font-semibold text-sm mb-1 pt-2">Сохраненные списки</h4>
                    <select id="saved-lists-select" class="w-full py-1.5 px-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="">-- Загрузить список --</option>
                    </select>
                    <div class="flex gap-2">
                        <input id="list-name-input" type="text" placeholder="Имя списка..." class="flex-grow p-1.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <button id="save-list-btn" class="bg-blue-500 text-white px-3 rounded-lg hover:bg-blue-600 text-sm">Сохр.</button>
                    </div>
                    <button id="delete-list-btn" class="w-full bg-red-500 text-white font-bold py-1.5 px-3 rounded-full hover:bg-red-600 text-sm">Удалить выбранный</button>
                </div>
            </div>
        </div>`;
}

export function init() {
    const canvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('spin-btn');
    const optionInput = document.getElementById('option-input');
    const addBtn = document.getElementById('add-option-btn');
    const optionsListDiv = document.getElementById('options-list');
    const ctx = canvas.getContext('2d');
    const saveListBtn = document.getElementById('save-list-btn');
    const listNameInput = document.getElementById('list-name-input');
    const savedListsSelect = document.getElementById('saved-lists-select');
    const deleteListBtn = document.getElementById('delete-list-btn');
    const eliminationCheckbox = document.getElementById('elimination-mode-checkbox');
    const colorSchemeSelect = document.getElementById('color-scheme-select');
    const soundCheckbox = document.getElementById('sound-effects-checkbox');
    spinSound = document.getElementById('spin-sound');
    winSound = document.getElementById('win-sound');

    let options = ['Приз 1', 'Сектор 2', 'Шанс', 'Попробуй еще'];
    const colorPalettes = {
        default: ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'],
        pastel: ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4', '#d8e2dc'],
        neon: ['#fe4450', '#ff8928', '#ffd300', '#2dfc2f', '#3296ff', '#8f20e8'],
        ocean: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a']
    };
    let colors = colorPalettes.default;
    let startAngle = 0, arc, spinAngleStart, spinTime = 0, spinTimeTotal = 0;

    const getContrastColor = (hex) => {
        if (hex.indexOf('#') === 0) hex = hex.slice(1);
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
    };

    const getSavedLists = () => JSON.parse(localStorage.getItem('fortuneWheelLists')) || {};
    const populateSavedLists = () => {
        const lists = getSavedLists();
        savedListsSelect.innerHTML = '<option value="">-- Загрузить список --</option>';
        for (const name in lists) {
            savedListsSelect.innerHTML += `<option value="${name}">${name}</option>`;
        }
    };
    const saveCurrentList = () => {
        const name = listNameInput.value.trim();
        if (!name || options.length === 0) return;
        const lists = getSavedLists();
        lists[name] = options;
        localStorage.setItem('fortuneWheelLists', JSON.stringify(lists));
        listNameInput.value = '';
        populateSavedLists();
    };
    const loadSelectedList = () => {
        const name = savedListsSelect.value;
        if (!name) return;
        const lists = getSavedLists();
        if (lists[name]) {
            options = [...lists[name]];
            updateOptionsUI();
        }
    };
    const deleteSelectedList = () => {
        const name = savedListsSelect.value;
        if (!name) return;
        const lists = getSavedLists();
        delete lists[name];
        localStorage.setItem('fortuneWheelLists', JSON.stringify(lists));
        populateSavedLists();
    };

    function drawWheel() {
        arc = options.length > 0 ? Math.PI / (options.length / 2) : 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#4A5568' : '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.font = 'bold 14px Arial';
        for (let i = 0; i < options.length; i++) {
            const angle = startAngle + i * arc;
            const segmentColor = colors[i % colors.length];
            ctx.fillStyle = segmentColor;
            ctx.beginPath();
            ctx.arc(175, 175, 170, angle, angle + arc, false);
            ctx.arc(175, 175, 0, angle + arc, angle, true);
            ctx.fill();
            ctx.save();
            ctx.fillStyle = getContrastColor(segmentColor);
            ctx.translate(175 + Math.cos(angle + arc / 2) * 110, 175 + Math.sin(angle + arc / 2) * 110);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            const text = options[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }
        ctx.fillStyle = '#4A5568';
        ctx.beginPath();
        ctx.moveTo(175 - 5, 5);
        ctx.lineTo(175 + 5, 5);
        ctx.lineTo(175, 25);
        ctx.closePath();
        ctx.fill();
    }

    function rotateWheel() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        drawWheel();
        spinTimeout = setTimeout(rotateWheel, 30);
    }

    function stopRotateWheel() {
        clearTimeout(spinTimeout);
        if (soundCheckbox.checked) {
            spinSound.pause();
            spinSound.currentTime = 0;
        }
        const degrees = startAngle * 180 / Math.PI + 90;
        const arcd = arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd);
        const winner = options[index];
        
        ctx.save();
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#FFF' : '#000';
        ctx.textAlign = 'center';
        ctx.fillText(winner, 175, 175 + 10);
        ctx.restore();

        if (winner && soundCheckbox.checked) {
            winSound.play();
        }
        
        if (eliminationCheckbox.checked && options.length > 1) {
            setTimeout(() => {
                options.splice(index, 1);
                updateOptionsUI();
            }, 2000);
        }
        spinBtn.disabled = (eliminationCheckbox.checked && options.length < 2) || options.length < 1;
    }

    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    function updateOptionsUI() {
        optionsListDiv.innerHTML = '';
        spinBtn.disabled = options.length < 1 || (eliminationCheckbox.checked && options.length < 2);
        options.forEach((opt, i) => {
            optionsListDiv.innerHTML += `<div class="flex items-center justify-between p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"><span>${opt}</span><button data-index="${i}" class="remove-option text-red-500 hover:text-red-700 font-bold">✖</button></div>`;
        });
        drawWheel();
    }

    addBtn.addEventListener('click', () => {
        if (optionInput.value.trim()) {
            options.push(optionInput.value.trim());
            updateOptionsUI();
            optionInput.value = '';
        }
    });

    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    optionsListDiv.addEventListener('click', e => {
        if (e.target.classList.contains('remove-option')) {
            options.splice(e.target.dataset.index, 1);
            updateOptionsUI();
        }
    });

    spinBtn.addEventListener("click", () => {
        spinBtn.disabled = true;
        if (soundCheckbox.checked) {
            spinSound.currentTime = 0;
            spinSound.play();
        }
        spinAngleStart = Math.random() * 10 + 10;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000;
        rotateWheel();
    });

    colorSchemeSelect.addEventListener('change', (e) => {
        colors = colorPalettes[e.target.value];
        drawWheel();
    });

    saveListBtn.addEventListener('click', saveCurrentList);
    savedListsSelect.addEventListener('change', loadSelectedList);
    deleteListBtn.addEventListener('click', deleteSelectedList);
    updateOptionsUI();
    populateSavedLists();
}

export function cleanup() {
    if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
    }
    if (spinSound) {
        spinSound.pause();
        spinSound.currentTime = 0;
    }
    if (winSound) {
        winSound.pause();
        winSound.currentTime = 0;
    }
}```
--- END OF FILE fortuneWheel.js ---

### 2. Тест звука и микрофона (`soundAndMicTest.js`)

**Проблема:**
*   Кнопки "Запись" и "Стоп" были раздельными, что не очень удобно.

**Решение:**
*   Я объединил их в одну кнопку-переключатель. Теперь она меняет свой вид и функциональность в зависимости от того, идет запись или нет. Это делает интерфейс более чистым и интуитивно понятным.

--- START OF FILE soundAndMicTest.js ---
```javascript
let audioCtx, micStream, animationFrameId, mediaRecorder, audioChunks, isRecording = false;

export function getHtml() {
    return `
        <div class="p-4 space-y-8">
            <!-- Тест звука -->
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест звука</h3>
                <p class="text-center mb-4">Нажмите для проверки левого и правого каналов.</p>
                <div class="flex justify-center gap-4">
                    <button id="left-channel-btn" class="bg-blue-500 text-white font-bold py-3 px-6 rounded-full">Левый</button>
                    <button id="right-channel-btn" class="bg-green-500 text-white font-bold py-3 px-6 rounded-full">Правый</button>
                </div>
            </div>

            <!-- Тест микрофона -->
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест микрофона</h3>
                <p id="mic-status" class="text-center mb-4">Нажмите "Начать" для проверки.</p>
                <div class="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                    <div id="mic-level" class="h-full bg-teal-500 transition-all duration-50" style="width: 0%;"></div>
                </div>
                <div id="mic-controls" class="text-center">
                    <button id="mic-start-btn" class="bg-teal-500 text-white font-bold py-3 px-6 rounded-full">Начать</button>
                </div>
            </div>

            <!-- Запись и воспроизведение -->
            <div id="record-section" class="hidden">
                <h3 class="text-xl font-bold mb-2 text-center">Запись и Воспроизведение</h3>
                 <div class="flex justify-center gap-4 mb-4">
                    <button id="record-toggle-btn" class="bg-red-500 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 w-32 justify-center transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                        <span>Запись</span>
                    </button>
                </div>
                <audio id="audio-playback" controls class="w-full hidden"></audio>
            </div>
        </div>`;
}

export function init() {
    // --- Тест звука ---
    const playTestTone = pan => {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const panner = audioCtx.createStereoPanner();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        panner.pan.setValueAtTime(pan, audioCtx.currentTime);
        osc.connect(panner).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    };

    document.getElementById('left-channel-btn').addEventListener('click', () => playTestTone(-1));
    document.getElementById('right-channel-btn').addEventListener('click', () => playTestTone(1));

    // --- Тест микрофона и запись ---
    const startBtn = document.getElementById('mic-start-btn');
    const micStatus = document.getElementById('mic-status');
    const micLevel = document.getElementById('mic-level');
    const recordSection = document.getElementById('record-section');
    const recordToggleBtn = document.getElementById('record-toggle-btn');
    const audioPlayback = document.getElementById('audio-playback');

    const startMic = async () => {
        if (micStream) return;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startBtn.style.display = 'none';
            micStatus.textContent = 'Говорите в микрофон...';
            recordSection.classList.remove('hidden');

            if (!audioCtx || audioCtx.state === 'closed') {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(micStream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const draw = () => {
                animationFrameId = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                micLevel.style.width = `${Math.min(average * 2, 100)}%`;
            };
            draw();
            setupRecording();
        } catch (err) {
            micStatus.textContent = 'Ошибка: Доступ к микрофону запрещен.';
            console.error(err);
        }
    };
    startBtn.addEventListener('click', startMic);

    // --- Логика записи ---
    function setupRecording() {
        mediaRecorder = new MediaRecorder(micStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('hidden');
            audioChunks = [];
        };

        recordToggleBtn.addEventListener('click', () => {
            if (!isRecording) {
                mediaRecorder.start();
                isRecording = true;
                // Update button to "Stop" state
                recordToggleBtn.classList.remove('bg-red-500');
                recordToggleBtn.classList.add('bg-gray-600');
                recordToggleBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1"/></svg>
                    <span>Стоп</span>`;
                audioPlayback.classList.add('hidden');
            } else {
                mediaRecorder.stop();
                isRecording = false;
                // Update button to "Record" state
                recordToggleBtn.classList.remove('bg-gray-600');
                recordToggleBtn.classList.add('bg-red-500');
                recordToggleBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                    <span>Запись</span>`;
            }
        });
    }
}

export function cleanup() {
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
    }
    micStream = null;
    animationFrameId = null;
    audioCtx = null;
    mediaRecorder = null;
    audioChunks = [];
    isRecording = false;
}
