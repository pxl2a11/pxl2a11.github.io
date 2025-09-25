let audioCtx, micStream, animationFrameId, mediaRecorder, audioChunks, isRecording = false;

// --- ДОБАЛЕНО: Переменные для определения проблем с аудио ---
let silenceTimeout, clippingTimeout;
let lastStatusMessage = '';

export function getHtml() {
    return `
        <div class="p-4 space-y-6">
            <!-- Секция выбора устройств -->
            <div id="device-selectors" class="hidden space-y-4 max-w-lg mx-auto">
                <div>
                    <label for="output-select" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Устройство вывода (Динамики):</label>
                    <select id="output-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></select>
                </div>
                 <div>
                    <label for="mic-select" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Устройство ввода (Микрофон):</label>
                    <select id="mic-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></select>
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
            </div>

            <!-- Тест микрофона -->
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест микрофона</h3>
                {/* --- ИЗМЕНЕНО: Добавлены классы для transition и min-height --- */}
                <p id="mic-status" class="text-center mb-4 min-h-[20px] transition-colors duration-300">Нажмите "Начать" для проверки.</p>
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
    const deviceSelectors = document.getElementById('device-selectors');
    const micSelect = document.getElementById('mic-select');
    const outputSelect = document.getElementById('output-select');
    
    // --- Тест звука ---
    const playTestTone = async (pan) => {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        
        const sinkId = outputSelect.value;
        if (sinkId && typeof audioCtx.setSinkId === 'function') {
            try {
                await audioCtx.setSinkId(sinkId);
            } catch (err) {
                console.error('Не удалось установить устройство вывода:', err);
            }
        }
        
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

    // --- ДОБАВЛЕНО: Константы и функция для обновления статуса ---
    const SILENCE_THRESHOLD = 5;    // Порог громкости для определения тишины (0-255)
    const CLIPPING_THRESHOLD = 250; // Порог для определения клиппинга (макс. 255)
    const WARNING_DELAY = 2000;     // Задержка в мс перед показом предупреждения

    const updateMicStatus = (message, isWarning = false) => {
        if (message !== lastStatusMessage) {
            micStatus.textContent = message;
            // Динамически добавляем/убираем классы для цвета ошибки
            micStatus.classList.toggle('text-red-500', isWarning);
            micStatus.classList.toggle('dark:text-red-400', isWarning);
            lastStatusMessage = message;
        }
    };

    const stopMic = () => {
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        // --- ДОБАВЛЕНО: Сброс таймеров при остановке ---
        clearTimeout(silenceTimeout);
        clearTimeout(clippingTimeout);
        silenceTimeout = null;
        clippingTimeout = null;
    };

    const startMic = async () => {
        stopMic(); 
        const deviceId = micSelect.value;
        if (!deviceId) return;
        
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
            
            updateMicStatus('Говорите в микрофон...');
            if (!audioCtx || audioCtx.state === 'closed') audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(micStream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const draw = () => {
                animationFrameId = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                micLevel.style.width = `${Math.min(average * 2, 100)}%`;

                // --- ДОБАВЛЕНО: Логика определения проблем ---
                const isSilent = average < SILENCE_THRESHOLD;
                const isClipping = dataArray.some(value => value >= CLIPPING_THRESHOLD);

                // Если сигнал нормализовался, сбрасываем таймеры
                if (!isSilent && silenceTimeout) {
                    clearTimeout(silenceTimeout);
                    silenceTimeout = null;
                }
                if (!isClipping && clippingTimeout) {
                    clearTimeout(clippingTimeout);
                    clippingTimeout = null;
                }
                
                // Если проблема обнаружена, запускаем таймер на показ предупреждения
                if (isSilent && !silenceTimeout) {
                    silenceTimeout = setTimeout(() => {
                        updateMicStatus('Мы вас не слышим. Убедитесь, что микрофон не выключен.', true);
                    }, WARNING_DELAY);
                } else if (isClipping && !clippingTimeout) {
                    clippingTimeout = setTimeout(() => {
                        updateMicStatus('Сигнал слишком громкий (клиппинг). Уменьшите усиление микрофона.', true);
                    }, WARNING_DELAY);
                }

                // Если нет активных проблем, возвращаем стандартное сообщение
                if (!isSilent && !isClipping && micStatus.classList.contains('text-red-500')) {
                   updateMicStatus('Говорите в микрофон...');
                }
            };
            draw();
            setupRecording();
        } catch (err) {
            // --- ИЗМЕНЕНО: Используем новую функцию для статуса ---
            updateMicStatus(`Ошибка доступа к микрофону: ${err.message}`, true);
            console.error(err);
        }
    };

    const populateDeviceLists = async () => {
        try {
            // Перед перечислением нужно запросить доступ, иначе метки будут пустыми
            await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const devices = await navigator.mediaDevices.enumerateDevices();
            micSelect.innerHTML = '';
            outputSelect.innerHTML = '';

            devices.forEach(device => {
                if (device.kind === 'audioinput') {
                    const option = new Option(device.label || `Микрофон ${micSelect.length + 1}`, device.deviceId);
                    micSelect.add(option);
                } else if (device.kind === 'audiooutput') {
                    const option = new Option(device.label || `Динамики ${outputSelect.length + 1}`, device.deviceId);
                    outputSelect.add(option);
                }
            });
            deviceSelectors.classList.remove('hidden');
        } catch (err) {
             console.error('Не удалось получить список устройств:', err);
             // --- ИЗМЕНЕНО: Используем новую функцию для статуса ---
             if(err.name === 'NotAllowedError') {
                updateMicStatus('Ошибка: Доступ к микрофону запрещен.', true);
             }
        }
    };
    
    const initialStart = async () => {
         try {
            await populateDeviceLists();
            
            if (micSelect.options.length === 0) {
                updateMicStatus('Микрофоны не найдены.', true);
                return;
            }

            startBtn.style.display = 'none';
            recordSection.classList.remove('hidden');
            micSelect.addEventListener('change', startMic);
            
            await startMic();
         } catch (err) {
            // Ошибки доступа уже обрабатываются в populateDeviceLists
            console.error(err);
         }
    };
    startBtn.addEventListener('click', initialStart);

    // --- Логика записи ---
    function setupRecording() {
        if (!micStream) return;
        mediaRecorder = new MediaRecorder(micStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('hidden');
            audioChunks = [];
        };

        isRecording = false;
        recordToggleBtn.classList.remove('bg-gray-600');
        recordToggleBtn.classList.add('bg-red-500');
        recordToggleBtn.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
            <span>Запись</span>`;
    }
    
    recordToggleBtn.addEventListener('click', () => {
        if (!mediaRecorder) return;
        
        if (!isRecording) {
            mediaRecorder.start();
            isRecording = true;
            recordToggleBtn.classList.replace('bg-red-500', 'bg-gray-600');
            recordToggleBtn.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1"/></svg><span>Стоп</span>`;
            audioPlayback.classList.add('hidden');
        } else {
            mediaRecorder.stop();
            isRecording = false;
        }
    });
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
    // --- ДОБАВЛЕНО: Сброс таймеров при очистке ---
    clearTimeout(silenceTimeout);
    clearTimeout(clippingTimeout);

    micStream = null;
    animationFrameId = null;
    audioCtx = null;
    mediaRecorder = null;
    audioChunks = [];
    isRecording = false;
    lastStatusMessage = '';
}
