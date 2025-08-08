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

// Функция для получения HTML-разметки приложения
export function getHtml() {
    return `
        <div class="space-y-4 max-w-lg mx-auto">
            <p class="text-sm text-gray-600 dark:text-gray-400">
                Выберите аудиофайл (например, WAV, FLAC), чтобы уменьшить его размер. Сжатие происходит путем понижения частоты дискретизации. 
                Результат будет доступен в формате WAV.
            </p>
            <div>
                <label for="audio-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Выберите аудиофайл:</label>
                <input type="file" id="audio-input" accept="audio/*" class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
            </div>
            
            <button id="compress-button" disabled class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Сжать аудио
            </button>

            <div id="status-message" class="text-center text-gray-700 dark:text-gray-300"></div>

            <div id="result-container" class="hidden space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Исходный размер</p>
                        <p id="original-size" class="text-lg font-semibold">-</p>
                    </div>
                     <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Размер после сжатия</p>
                        <p id="compressed-size" class="text-lg font-semibold">-</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium mb-2 text-center">Предпрослушивание:</p>
                    <audio id="audio-player" controls class="w-full"></audio>
                </div>
                <a id="download-link" class="block w-full text-center px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700" download="compressed_audio.wav">
                    Скачать сжатый файл
                </a>
            </div>
        </div>
    `;
}

// Функция инициализации (добавление обработчиков событий)
export function init() {
    // Получаем ссылки на DOM-элементы
    fileInput = document.getElementById('audio-input');
    compressButton = document.getElementById('compress-button');
    statusMessage = document.getElementById('status-message');
    audioPlayer = document.getElementById('audio-player');
    downloadLink = document.getElementById('download-link');
    originalSizeEl = document.getElementById('original-size');
    compressedSizeEl = document.getElementById('compressed-size');
    const resultContainer = document.getElementById('result-container');

    // Инициализация AudioContext при взаимодействии с пользователем
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

    // Обработчик нажатия на кнопку "Сжать"
    compressButton.addEventListener('click', async () => {
        if (!audioFile) return;

        compressButton.disabled = true;
        statusMessage.textContent = 'Идет обработка... Это может занять некоторое время.';
        resultContainer.classList.add('hidden');

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Здесь происходит "сжатие" путем понижения частоты дискретизации до 16кГц
            const targetSampleRate = 16000;
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                (audioBuffer.duration * targetSampleRate),
                targetSampleRate
            );

            const bufferSource = offlineContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(offlineContext.destination);
            bufferSource.start();

            const compressedBuffer = await offlineContext.startRendering();
            const wavBlob = bufferToWav(compressedBuffer);

            // Отображаем результаты
            const objectURL = URL.createObjectURL(wavBlob);
            audioPlayer.src = objectURL;
            downloadLink.href = objectURL;
            
            originalSizeEl.textContent = formatBytes(audioFile.size);
            compressedSizeEl.textContent = formatBytes(wavBlob.size);
            
            statusMessage.textContent = 'Сжатие завершено!';
            resultContainer.classList.remove('hidden');

        } catch (error) {
            console.error('Ошибка сжатия аудио:', error);
            statusMessage.textContent = `Ошибка: ${error.message}. Попробуйте другой файл.`;
        } finally {
            compressButton.disabled = false;
        }
    });
}

// Функция очистки (удаление ссылок и обработчиков)
export function cleanup() {
    if (audioPlayer && audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
    }
    audioFile = null;
    fileInput = null;
    compressButton = null;
    statusMessage = null;
    downloadLink = null;
    originalSizeEl = null;
    compressedSizeEl = null;
    // audioContext не очищается, т.к. может использоваться повторно
}


// --- Вспомогательные функции ---

// Форматирование байтов в читаемый вид
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Конвертация AudioBuffer в WAV Blob
function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i, sample, pos = 0;

    // Запись WAV-заголовка
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
