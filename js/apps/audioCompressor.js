// --- 1START OF FILE apps/audioCompressor.js ---

// Переменные для хранения состояния и ссылок на элементы
let audioFile = null;
let detectedInputFormat = null; // 'mp3' или 'wav'
let audioPlayer;
let processButton;
let statusMessage;
let originalSizeEl;
let compressedSizeEl;
let audioContext;
let bitrateContainer;
let bitrateSelector;
let wavOptionsContainer;
let wavSamplerateSelector;

// Функция для получения HTML-разметки приложения
export function getHtml() {
    return `
        <div class="space-y-4 max-w-lg mx-auto">
            <p class="text-sm text-gray-600 dark:text-gray-400">
                Приложение автоматически определит тип вашего файла (MP3 или WAV) и предложит соответствующие настройки для сжатия.
            </p>
            <div>
                <label for="audio-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">1. Выберите аудиофайл (MP3 или WAV):</label>
                <input type="file" id="audio-input" accept=".mp3,.wav,audio/mpeg,audio/wav" class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
            </div>
            
            <!-- Контейнер для настроек MP3, изначально скрыт -->
            <div id="bitrate-container" class="hidden">
                <label for="bitrate-selector" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">2. Настройки сжатия MP3 (битрейт):</label>
                <select id="bitrate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="192">192 kbps (Отличное)</option>
                    <option value="128" selected>128 kbps (Очень хорошее)</option>
                    <option value="96">96 kbps (Хорошее)</option>
                    <option value="64">64 kbps (Среднее)</option>
                    <option value="32">32 kbps (Низкое)</option>
                </select>
            </div>
            
            <!-- Контейнер для настроек WAV, изначально скрыт -->
            <div id="wav-options-container" class="hidden">
                 <label for="wav-samplerate-selector" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">2. Настройки сжатия WAV (частота):</label>
                 <select id="wav-samplerate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="44100">44100 Гц (Качество CD)</option>
                    <option value="22050" selected>22050 Гц (Качество FM-радио)</option>
                    <option value="16000">16000 Гц (Качество речи)</option>
                    <option value="8000">8000 Гц (Телефонное качество)</option>
                </select>
            </div>

            <button id="process-button" disabled class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Выберите файл для начала
            </button>

            <div id="status-message" class="text-center text-gray-700 dark:text-gray-300"></div>

            <div id="result-container" class="hidden space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Исходный размер</p>
                        <p id="original-size" class="text-lg font-semibold">-</p>
                    </div>
                     <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Размер на выходе</p>
                        <p id="compressed-size" class="text-lg font-semibold">-</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium mb-2 text-center">Предпрослушивание:</p>
                    <audio id="audio-player" controls class="w-full"></audio>
                </div>
                <a id="download-link" class="block w-full text-center px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                    Скачать файл
                </a>
            </div>
        </div>
    `;
}

// Функция инициализации
export function init() {
    // Получаем все элементы
    const fileInput = document.getElementById('audio-input');
    processButton = document.getElementById('process-button');
    statusMessage = document.getElementById('status-message');
    audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');
    const originalSizeEl = document.getElementById('original-size');
    const compressedSizeEl = document.getElementById('compressed-size');
    bitrateSelector = document.getElementById('bitrate-selector');
    bitrateContainer = document.getElementById('bitrate-container');
    wavOptionsContainer = document.getElementById('wav-options-container');
    wavSamplerateSelector = document.getElementById('wav-samplerate-selector');
    const resultContainer = document.getElementById('result-container');

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Обработчик выбора файла, который теперь управляет всей логикой UI
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        // Сбрасываем UI при каждом новом выборе
        resultContainer.classList.add('hidden');
        bitrateContainer.classList.add('hidden');
        wavOptionsContainer.classList.add('hidden');
        processButton.disabled = true;
        
        if (!file) {
            audioFile = null;
            detectedInputFormat = null;
            statusMessage.textContent = '';
            processButton.textContent = 'Выберите файл для начала';
            return;
        }

        audioFile = file;
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.mp3')) {
            detectedInputFormat = 'mp3';
            statusMessage.textContent = `Выбран MP3 файл: ${file.name}`;
            bitrateContainer.classList.remove('hidden');
            processButton.textContent = 'Сжать в MP3';
            processButton.disabled = false;
        } else if (fileName.endsWith('.wav')) {
            detectedInputFormat = 'wav';
            statusMessage.textContent = `Выбран WAV файл: ${file.name}`;
            wavOptionsContainer.classList.remove('hidden');
            processButton.textContent = 'Сжать в WAV';
            processButton.disabled = false;
        } else {
            detectedInputFormat = null;
            statusMessage.textContent = 'Ошибка: Поддерживаются только файлы .mp3 и .wav';
            processButton.textContent = 'Неподдерживаемый формат';
        }
    });

    // Основной обработчик нажатия на кнопку
    processButton.addEventListener('click', async () => {
        if (!audioFile || !detectedInputFormat) return;

        processButton.disabled = true;
        statusMessage.textContent = 'Идет обработка... Это может занять много времени.';
        resultContainer.classList.add('hidden');

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            let outputBlob;
            let outputFileName;

            if (detectedInputFormat === 'mp3') {
                const selectedBitrate = parseInt(bitrateSelector.value, 10);
                outputBlob = await compressToMp3(audioBuffer, selectedBitrate);
                outputFileName = `compressed_${Date.now()}.mp3`;
            } else if (detectedInputFormat === 'wav') {
                const targetSampleRate = parseInt(wavSamplerateSelector.value, 10);
                if (targetSampleRate < audioBuffer.sampleRate) {
                    statusMessage.textContent = 'Понижаю частоту для сжатия WAV...';
                    audioBuffer = await resampleAudioBuffer(audioBuffer, targetSampleRate);
                }
                outputBlob = bufferToWav(audioBuffer);
                outputFileName = `compressed_${Date.now()}.wav`;
            }

            const objectURL = URL.createObjectURL(outputBlob);
            audioPlayer.src = objectURL;
            downloadLink.href = objectURL;
            downloadLink.download = outputFileName;
            downloadLink.textContent = `Скачать ${outputFileName}`;

            originalSizeEl.textContent = formatBytes(audioFile.size);
            compressedSizeEl.textContent = formatBytes(outputBlob.size);
            
            statusMessage.textContent = 'Обработка завершена!';
            resultContainer.classList.remove('hidden');

        } catch (error) {
            console.error('Ошибка обработки аудио:', error);
            statusMessage.textContent = `Ошибка: ${error.message}. Возможно, файл поврежден.`;
        } finally {
            processButton.disabled = false;
        }
    });
}

// Функция для понижения частоты (resampling)
function resampleAudioBuffer(audioBuffer, targetSampleRate) {
    return new Promise((resolve, reject) => {
        try {
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.duration * targetSampleRate,
                targetSampleRate
            );
            const bufferSource = offlineContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(offlineContext.destination);
            bufferSource.start(0);
            offlineContext.startRendering().then(resolve).catch(reject);
        } catch (e) { reject(e); }
    });
}

// Функция сжатия в MP3
function compressToMp3(audioBuffer, bitrate = 128) {
    return new Promise((resolve, reject) => {
        try {
            const channels = audioBuffer.numberOfChannels;
            if (channels > 2) return reject(new Error('Поддерживаются только моно и стерео файлы.'));
            
            const mp3encoder = new lamejs.Mp3Encoder(channels, audioBuffer.sampleRate, bitrate);
            const pcmInt16Channels = [];

            for (let i = 0; i < channels; i++) {
                const channelData = audioBuffer.getChannelData(i);
                const int16Data = new Int16Array(channelData.length);
                for (let j = 0; j < channelData.length; j++) {
                    int16Data[j] = Math.max(-1, Math.min(1, channelData[j])) * 32767;
                }
                pcmInt16Channels.push(int16Data);
            }
            
            const mp3Data = [], bufferSize = 1152;
            for (let i = 0; i < pcmInt16Channels[0].length; i += bufferSize) {
                const leftChunk = pcmInt16Channels[0].subarray(i, i + bufferSize);
                const rightChunk = channels > 1 ? pcmInt16Channels[1].subarray(i, i + bufferSize) : undefined;
                const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                if (mp3buf.length > 0) mp3Data.push(mp3buf);
            }
            
            const finalMp3buf = mp3encoder.flush();
            if (finalMp3buf.length > 0) mp3Data.push(finalMp3buf);

            resolve(new Blob(mp3Data.map(buf => new Uint8Array(buf)), { type: 'audio/mpeg' }));
        } catch (e) { reject(e); }
    });
}

// Функция конвертации в WAV
function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArr = new ArrayBuffer(length),
        view = new DataView(bufferArr),
        channels = [],
        sampleRate = buffer.sampleRate;
    
    let pos = 0;
    const setUint16 = data => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = data => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
            view.setInt16(pos, (sample < 0 ? sample * 32768 : sample * 32767), true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
}

// Функция очистки
export function cleanup() {
    if (audioPlayer && audioPlayer.src) URL.revokeObjectURL(audioPlayer.src);
    audioFile = null;
    detectedInputFormat = null;
}

// Вспомогательная функция форматирования байтов
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
