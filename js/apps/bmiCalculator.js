// apps/bmiCalculator.js

function getHtml() {
    return `
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <!-- Переключатель систем -->
            <div class="flex justify-center items-center mb-6">
                <span id="metric-label" class="font-semibold text-blue-600 dark:text-blue-400">Метрическая (кг, см)</span>
                <label for="unit-toggle" class="relative inline-flex items-center cursor-pointer mx-4">
                    <input type="checkbox" value="" id="unit-toggle" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span id="imperial-label" class="font-semibold text-gray-400 dark:text-gray-500">Имперская (lbs, ft, in)</span>
            </div>
            
            <!-- Поля для возраста и пола -->
            <div class="grid grid-cols-2 gap-6 mb-6">
                 <div>
                    <label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Возраст</label>
                    <input type="number" id="age" value="30" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
                <div>
                    <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Пол</label>
                    <select id="gender" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>
            </div>
            
            <!-- Поля ввода -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Метрическая система -->
                <div id="metric-inputs">
                    <div>
                        <label for="height-cm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (см)</label>
                        <input type="number" id="height-cm" value="170" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                    </div>
                </div>
                <!-- Имперская система -->
                <div id="imperial-inputs" class="hidden col-span-2">
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="height-ft" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (футы)</label>
                            <input type="number" id="height-ft" value="5" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        </div>
                        <div>
                            <label for="height-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Рост (дюймы)</label>
                            <input type="number" id="height-in" value="7" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                        </div>
                    </div>
                </div>
                <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Вес (<span id="weight-unit">кг</span>)</label>
                    <input type="number" id="weight" value="65" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700">
                </div>
            </div>

            <!-- Результаты -->
            <div id="bmi-result-container" class="mt-6 text-center hidden">
                <p class="text-gray-600 dark:text-gray-400">Ваш индекс массы тела (ИМТ)</p>
                <p id="bmi-value" class="text-5xl font-bold"></p>
                <p id="bmi-category" class="text-xl font-semibold mt-2"></p>
                <p id="ideal-weight" class="text-sm mt-2 text-gray-500 dark:text-gray-400"></p>
            </div>
            <div class="mt-4">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div id="bmi-indicator-bar" class="h-2.5 rounded-full" style="width: 0;"></div>
                </div>
                <div class="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>16</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                </div>
            </div>
            <div id="bmi-info" class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-300 hidden"></div>
        </div>
    `;
}

function init() {
    const unitToggle = document.getElementById('unit-toggle');
    const metricLabel = document.getElementById('metric-label');
    const imperialLabel = document.getElementById('imperial-label');
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const weightUnitEl = document.getElementById('weight-unit');
    
    const heightCmInput = document.getElementById('height-cm');
    const heightFtInput = document.getElementById('height-ft');
    const heightInInput = document.getElementById('height-in');
    const weightInput = document.getElementById('weight');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    
    const resultContainer = document.getElementById('bmi-result-container');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiCategoryEl = document.getElementById('bmi-category');
    const bmiIndicatorBar = document.getElementById('bmi-indicator-bar');
    const bmiInfoEl = document.getElementById('bmi-info');
    const idealWeightEl = document.getElementById('ideal-weight');

    let isImperial = false;

    function toggleUnits() {
        isImperial = unitToggle.checked;
        metricInputs.classList.toggle('hidden', isImperial);
        imperialInputs.classList.toggle('hidden', !isImperial);
        metricLabel.classList.toggle('text-blue-600', !isImperial);
        metricLabel.classList.toggle('dark:text-blue-400', !isImperial);
        metricLabel.classList.toggle('text-gray-400', isImperial);
        metricLabel.classList.toggle('dark:text-gray-500', isImperial);
        imperialLabel.classList.toggle('text-blue-600', isImperial);
        imperialLabel.classList.toggle('dark:text-blue-400', isImperial);
        imperialLabel.classList.toggle('text-gray-400', !isImperial);
        imperialLabel.classList.toggle('dark:text-gray-500', !isImperial);
        weightUnitEl.textContent = isImperial ? 'фунты' : 'кг';
        // Конвертация значений при переключении
        if (isImperial) {
            const cm = parseFloat(heightCmInput.value) || 0;
            const kg = parseFloat(weightInput.value) || 0;
            const inches = cm * 0.393701;
            const feet = Math.floor(inches / 12);
            const remInches = (inches % 12).toFixed(1);
            heightFtInput.value = feet;
            heightInInput.value = remInches;
            weightInput.value = (kg * 2.20462).toFixed(1);
        } else {
            const feet = parseFloat(heightFtInput.value) || 0;
            const inches = parseFloat(heightInInput.value) || 0;
            const lbs = parseFloat(weightInput.value) || 0;
            const totalInches = (feet * 12) + inches;
            heightCmInput.value = (totalInches * 2.54).toFixed(0);
            weightInput.value = (lbs * 0.453592).toFixed(1);
        }
        calculateBmi();
    }

    function calculateBmi() {
        let height, weight, bmi;
        let heightInMeters;

        if (isImperial) {
            const feet = parseFloat(heightFtInput.value) || 0;
            const inches = parseFloat(heightInInput.value) || 0;
            weight = parseFloat(weightInput.value);
            height = (feet * 12) + inches; // Total height in inches
            if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                 clearResults(); return;
            }
            heightInMeters = height * 0.0254;
            bmi = (weight / (height * height)) * 703;
        } else {
            height = parseFloat(heightCmInput.value);
            weight = parseFloat(weightInput.value);
             if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                clearResults(); return;
            }
            heightInMeters = height / 100;
            bmi = weight / (heightInMeters * heightInMeters);
        }
        
        displayResults(bmi, heightInMeters);
    }
    
    function clearResults() {
        resultContainer.classList.add('hidden');
        bmiInfoEl.classList.add('hidden');
        bmiIndicatorBar.style.width = '0%';
        idealWeightEl.textContent = '';
    }

    function displayResults(bmi, heightInMeters) {
        const bmiFormatted = bmi.toFixed(1);

        resultContainer.classList.remove('hidden');
        bmiValueEl.textContent = bmiFormatted;

        // Расчет идеального веса (ИМТ от 18.5 до 25)
        const idealMin = 18.5 * (heightInMeters * heightInMeters);
        const idealMax = 25 * (heightInMeters * heightInMeters);
        if (isImperial) {
            idealWeightEl.textContent = `Идеальный вес: ${(idealMin * 2.20462).toFixed(1)} - ${(idealMax * 2.20462).toFixed(1)} фунтов`;
        } else {
            idealWeightEl.textContent = `Идеальный вес: ${idealMin.toFixed(1)} - ${idealMax.toFixed(1)} кг`;
        }
        
        let category = '', colorClass = '', infoText = '';

        // Категории ИМТ (остаются без изменений, так как они стандартны для взрослых)
        if (bmi < 16) {
            category = 'Выраженный дефицит массы'; colorClass = 'bg-red-600';
            infoText = 'Риск для здоровья очень высокий. Необходима консультация врача.';
        } else if (bmi >= 16 && bmi < 18.5) {
            category = 'Недостаточная масса тела'; colorClass = 'bg-yellow-500';
            infoText = 'Риск для здоровья повышен. Рекомендуется набрать вес до нормы.';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Нормальный вес'; colorClass = 'bg-green-500';
            infoText = 'Ваш вес в норме. Риск для здоровья минимальный. Так держать!';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Избыточная масса тела'; colorClass = 'bg-yellow-500';
            infoText = 'Риск для здоровья повышен. Рекомендуется снизить вес до нормы.';
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Ожирение 1 степени'; colorClass = 'bg-orange-500';
            infoText = 'Риск для здоровья высокий. Рекомендуется консультация специалиста.';
        } else if (bmi >= 35 && bmi < 40) {
            category = 'Ожирение 2 степени'; colorClass = 'bg-red-600';
            infoText = 'Риск для здоровья очень высокий. Необходима консультация врача.';
        } else {
            category = 'Ожирение 3 степени'; colorClass = 'bg-red-800';
            infoText = 'Риск для здоровья чрезвычайно высокий. Срочно обратитесь к врачу.';
        }

        bmiCategoryEl.textContent = category;
        bmiValueEl.className = `text-5xl font-bold ${colorClass.replace('bg-', 'text-')}`;
        
        const percentage = Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100));
        bmiIndicatorBar.style.width = `${percentage}%`;
        bmiIndicatorBar.className = `h-2.5 rounded-full transition-all duration-500 ${colorClass}`;
        
        bmiInfoEl.textContent = infoText;
        bmiInfoEl.classList.remove('hidden');
    }

    unitToggle.addEventListener('change', toggleUnits);
    [heightCmInput, heightFtInput, heightInInput, weightInput, ageInput, genderSelect].forEach(el => {
        el.addEventListener('input', calculateBmi);
    });

    calculateBmi();
}

export { getHtml, init };```

---
### **Тест звука и микрофона (soundAndMicTest.js)**
*   **Что нового:**
    *   Добавлены выпадающие списки для выбора активного микрофона и устройства вывода звука.
    *   Приложение теперь использует выбранные устройства для тестов.

```javascript
let audioCtx, micStream, animationFrameId, mediaRecorder, audioChunks, isRecording = false, audioTestEl;

export function getHtml() {
    return `
        <div class="p-4 space-y-8">
            <!-- Выбор устройств -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="mic-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Микрофон</label>
                    <select id="mic-select" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700"></select>
                </div>
                <div>
                    <label for="speaker-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Устройство вывода</label>
                    <select id="speaker-select" class="mt-1 block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700"></select>
                </div>
            </div>
            
            <!-- Тест звука -->
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест звука</h3>
                <p class="text-center mb-4">Нажмите для проверки левого и правого каналов.</p>
                <div class="flex justify-center gap-4">
                    <button id="left-channel-btn" class="bg-blue-500 text-white font-bold py-3 px-6 rounded-full">Левый</button>
                    <button id="right-channel-btn" class="bg-green-500 text-white font-bold py-3 px-6 rounded-full">Правый</button>
                </div>
                <audio id="audio-test-element" class="hidden"></audio>
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
    const micSelect = document.getElementById('mic-select');
    const speakerSelect = document.getElementById('speaker-select');
    audioTestEl = document.getElementById('audio-test-element');

    // --- Логика выбора устройств ---
    async function getDevices() {
        try {
            // Запрос разрешений
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            micSelect.innerHTML = '';
            speakerSelect.innerHTML = '';
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Устройство ${device.kind} ${micSelect.options.length + 1}`;
                if (device.kind === 'audioinput') {
                    micSelect.appendChild(option);
                } else if (device.kind === 'audiooutput') {
                    speakerSelect.appendChild(option);
                }
            });
        } catch (err) {
            console.error("Ошибка получения устройств:", err);
            micStatus.textContent = 'Ошибка: Доступ к устройствам запрещен.';
        }
    }
    getDevices();
    navigator.mediaDevices.ondevicechange = getDevices;

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

    speakerSelect.addEventListener('change', async () => {
        if (typeof audioTestEl.setSinkId !== 'undefined') {
            try {
                await audioTestEl.setSinkId(speakerSelect.value);
                console.log(`Устройство вывода изменено на: ${speakerSelect.value}`);
            } catch (err) {
                console.error("Ошибка смены устройства вывода:", err);
            }
        }
    });

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
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
        }
        try {
            const constraints = { audio: { deviceId: { exact: micSelect.value } } };
            micStream = await navigator.mediaDevices.getUserMedia(constraints);
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
    micSelect.addEventListener('change', () => {
        if(micStream) startMic(); // Перезапустить с новым микрофоном, если уже работает
    });

    // --- Логика записи ---
    function setupRecording() {
        if (!micStream) return;
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

        recordToggleBtn.onclick = () => { // Используем onclick для простоты переопределения
            if (!isRecording) {
                mediaRecorder.start();
                isRecording = true;
                recordToggleBtn.classList.replace('bg-red-500', 'bg-gray-600');
                recordToggleBtn.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1"/></svg><span>Стоп</span>`;
                audioPlayback.classList.add('hidden');
            } else {
                mediaRecorder.stop();
                isRecording = false;
                recordToggleBtn.classList.replace('bg-gray-600', 'bg-red-500');
                recordToggleBtn.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg><span>Запись</span>`;
            }
        };
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
        audioCtx.close().catch(e => console.error(e));
    }
    micStream = null;
    animationFrameId = null;
    audioCtx = null;
    mediaRecorder = null;
    audioChunks = [];
    isRecording = false;
}
