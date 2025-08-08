let audioCtx, micStream, animationFrameId, mediaRecorder, audioChunks;

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
                    <button id="record-btn" class="bg-red-500 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>Запись
                    </button>
                    <button id="stop-record-btn" class="bg-gray-500 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 disabled:opacity-50" disabled>
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="1"/></svg>Стоп
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
    const recordBtn = document.getElementById('record-btn');
    const stopRecordBtn = document.getElementById('stop-record-btn');
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

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('hidden');
            audioChunks = [];
        };

        recordBtn.addEventListener('click', () => {
            mediaRecorder.start();
            recordBtn.disabled = true;
            stopRecordBtn.disabled = false;
            audioPlayback.classList.add('hidden');
        });

        stopRecordBtn.addEventListener('click', () => {
            mediaRecorder.stop();
            recordBtn.disabled = false;
            stopRecordBtn.disabled = true;
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
}
