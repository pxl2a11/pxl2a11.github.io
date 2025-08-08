let audioCtx, micStream, animationFrameId;

export function getHtml() {
    return `
        <div class="p-4 space-y-8">
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест звука</h3>
                <p class="text-center mb-4">Нажмите для проверки левого и правого каналов.</p>
                <div class="flex justify-center gap-4">
                    <button id="left-channel-btn" class="bg-blue-500 text-white font-bold py-3 px-6 rounded-full">Левый</button>
                    <button id="right-channel-btn" class="bg-green-500 text-white font-bold py-3 px-6 rounded-full">Правый</button>
                </div>
            </div>
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест микрофона</h3>
                <p id="mic-status" class="text-center mb-4">Нажмите "Начать" для проверки.</p>
                <div class="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4"><div id="mic-level" class="h-full bg-teal-500 transition-all duration-50" style="width: 0%;"></div></div>
                <div class="text-center"><button id="mic-start-btn" class="bg-teal-500 text-white font-bold py-3 px-6 rounded-full">Начать</button></div>
            </div>
        </div>`;
}

export function init() {
    const playTestTone = pan => {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

    const startBtn = document.getElementById('mic-start-btn');
    const micStatus = document.getElementById('mic-status');
    const micLevel = document.getElementById('mic-level');

    startBtn.addEventListener('click', async () => {
        if (micStream) return;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startBtn.style.display = 'none';
            micStatus.textContent = 'Говорите в микрофон...';
            if (!audioCtx || audioCtx.state === 'closed') {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
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
        } catch (err) {
            micStatus.textContent = 'Ошибка: Доступ к микрофону запрещен.';
            console.error(err);
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
    micStream = null;
    animationFrameId = null;
    audioCtx = null;
}
