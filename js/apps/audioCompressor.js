// --- START OF FILE apps/audioCompressor.js ---

// Переменные для хранения состояния и ссылок на элементы
let audioFile = null;
let audioPlayer;
let downloadLink;
let fileInput;
let compressButton;
let statusMessage;
let originalSizeEl;
let compressedSizeEl;
let audioContext;
let bitrateSelector;
let formatSelector;
let bitrateContainer;

// Функция для получения HTML-разметки приложения
export function getHtml() {
    return `
        <div class="space-y-4 max-w-lg mx-auto">
            <p class="text-sm text-gray-600 dark:text-gray-400">
                Выберите аудиофайл для конвертации. Вы можете сжать его в MP3 (уменьшив размер) или конвертировать в несжатый WAV (сохранив качество).
            </p>
            <div>
                <label for="audio-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">1. Выберите аудиофайл:</label>
                <input type="file" id="audio-input" accept="audio/*" class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
            </div>

            <div>
                <label for="format-selector" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">2. Выберите формат вывода:</label>
                <select id="format-selector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="mp3" selected>MP3 (сжатый)</option>
                    <option value="wav">WAV (несжатый, высокое качество)</option>
                </select>
            </div>
            
            <div id="bitrate-container">
                <label for="bitrate-selector" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">3. Выберите качество (для MP3):</label>
                <select id="bitrate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="32">32 kbps (Низкое)</option>
                    <option value="64">64 kbps (Среднее)</option>
                    <option value="96">96 kbps (Хорошее)</option>
                    <option value="128" selected>128 kbps (Очень хорошее)</option>
                    <option value="192">192 kbps (Отличное)</option>
                </select>
            </div>

            <button id="compress-button" disabled class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Сжать в MP3
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
    fileInput = document.getElementById('audio-input');
    compressButton = document.getElementById('compress-button');
    statusMessage = document.getElementById('status-message');
    audioPlayer = document.getElementById('audio-player');
    downloadLink = document.getElementById('download-link');
    originalSizeEl = document.getElementById('original-size');
    compressedSizeEl = document.getElementById('compressed-size');
    bitrateSelector = document.getElementById('bitrate-selector');
    formatSelector = document.getElementById('format-selector');
    bitrateContainer = document.getElementById('bitrate-container');
    const resultContainer = document.getElementById('result-container');

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Обработчик выбора файла
    fileInput.addEventListener('change', (event) => {
        audioFile = event.target.files[0];
        if (audioFile) {
            compressButton.disabled = false;
            statusMessage.textContent = `Выбран файл: ${audioFile.name}`;
            resultContainer.classList.add('hidden');
        } else {
            compressButton.disabled = true;
            statusMessage.textContent = '';
        }
    });

    // Обработчик смены формата
    formatSelector.addEventListener('change', (e) => {
        const selectedFormat = e.target.value;
        if (selectedFormat === 'mp3') {
            bitrateContainer.classList.remove('hidden');
            compressButton.textContent = 'Сжать в MP3';
        } else { // wav
            bitrateContainer.classList.add('hidden');
            compressButton.textContent = 'Конвертировать в WAV';
        }
    });
    // Вызываем событие сразу, чтобы установить правильное начальное состояние
    formatSelector.dispatchEvent(new Event('change'));

    // Основной обработчик нажатия на кнопку
    compressButton.addEventListener('click', async () => {
        if (!audioFile) return;

        compressButton.disabled = true;
        statusMessage.textContent = 'Идет обработка... Это может занять много времени.';
        resultContainer.classList.add('hidden');

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const selectedFormat = formatSelector.value;
            
            let outputBlob;
            let outputFileName;

            if (selectedFormat === 'mp3') {
                const selectedBitrate = parseInt(bitrateSelector.value, 10);
                outputBlob = await compressToMp3(audioBuffer, selectedBitrate);
                outputFileName = `compressed_${Date.now()}.mp3`;
            } else { // wav
                outputBlob = bufferToWav(audioBuffer);
                outputFileName = `converted_${Date.now()}.wav`;
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
            statusMessage.textContent = `Ошибка: ${error.message}. Возможно, файл поврежден или имеет неподдерживаемый формат.`;
        } finally {
            compressButton.disabled = false;
        }
    });
}

// Функция сжатия в MP3
function compressToMp3(audioBuffer, bitrate = 128) {
    return new Promise((resolve, reject) => {
        try {
            const channels = audioBuffer.numberOfChannels;
            const sampleRate = audioBuffer.sampleRate;

            if (channels > 2) {
                return reject(new Error('Поддерживаются только моно и стерео файлы.'));
            }
            
            const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
            const pcmInt16Channels = [];

            for (let i = 0; i < channels; i++) {
                const channelData = audioBuffer.getChannelData(i);
                const int16Data = new Int16Array(channelData.length);
                for (let j = 0; j < channelData.length; j++) {
                    int16Data[j] = Math.max(-1, Math.min(1, channelData[j])) * 32767;
                }
                pcmInt16Channels.push(int16Data);
            }
            
            const mp3Data = [];
            const bufferSize = 1152; 

            for (let i = 0; i < pcmInt16Channels[0].length; i += bufferSize) {
                const leftChunk = pcmInt16Channels[0].subarray(i, i + bufferSize);
                let mp3buf;

                if (channels === 1) {
                    mp3buf = mp3encoder.encodeBuffer(leftChunk);
                } else {
                    const rightChunk = pcmInt16Channels[1].subarray(i, i + bufferSize);
                    mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                }

                if (mp3buf.length > 0) mp3Data.push(mp3buf);
            }
            
            const finalMp3buf = mp3encoder.flush();
            if (finalMp3buf.length > 0) mp3Data.push(finalMp3buf);

            resolve(new Blob(mp3Data.map(buf => new Uint8Array(buf)), { type: 'audio/mpeg' }));
        } catch (e) {
            reject(e);
        }
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

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
}


// Функция очистки
export function cleanup() {
    if (audioPlayer && audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
    }
    audioFile = null;
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
