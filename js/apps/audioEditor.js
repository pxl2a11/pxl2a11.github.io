// 57--- НАЧАЛО ФАЙЛА js/apps/audioEditor.js ---

let audioFile = null;
let detectedInputFormat = null;
let audioPlayer;
let processButton;
let statusMessage;
let originalSizeEl;
let compressedSizeEl;
let audioContext;
let eventListenersController;

let wavesurfer;
let activeRegion = null;
let originalAudioBuffer = null;
let isProcessing = false;

let normalizeToggle, normalizeOptions, lufsInput, compressToggle, compressToggleLabel;
let compressOptionsContainer, compressOptionsMp3, compressOptionsWav, bitrateSelector;
let wavSamplerateSelector, outputFormatMp3, outputFormatWav;

export function getHtml() {
    return `
        <div class="space-y-4 max-w-5xl mx-auto">
            <!-- Блок загрузки файла -->
            <div id="upload-container" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">1. Выберите аудиофайл</h2>
                <div class="flex items-center justify-center w-full">
                    <label for="audio-input" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-100 dark:bg-gray-700 hover:dark:bg-gray-600 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Нажмите для выбора</span> или перетащите</p>
                            <p id="file-name-display" class="text-xs text-gray-500 dark:text-gray-400">MP3 или WAV</p>
                        </div>
                        <input id="audio-input" type="file" class="hidden" accept=".mp3,.wav,audio/mpeg,audio/wav" />
                    </label>
                </div>
            </div>

            <!-- Контейнер для редактора (появится после загрузки файла) -->
            <div id="editor-container" class="hidden space-y-4">

                <!-- Блок визуализатора и обрезки -->
                <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">2. Обрезка и предпрослушивание</h2>
                    <div id="waveform" class="w-full h-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div id="waveform-loading" class="text-center py-10">Загрузка волны...</div>
                    <div class="flex items-center justify-between mt-4 space-x-4">
                         <div class="flex items-center space-x-2">
                            <button id="play-pause-btn" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 w-28">Воспр.</button>
                            <button id="play-selection-btn" disabled class="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">Выделение</button>
                         </div>
                         <div class="flex items-center text-sm font-mono text-gray-700 dark:text-gray-300 space-x-4">
                            <span>Начало: <span id="start-time">00:00.000</span></span>
                            <span>Конец: <span id="end-time">00:00.000</span></span>
                         </div>
                    </div>
                </div>

                <!-- Блок настроек обработки -->
                <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">3. Настройки обработки</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Левая колонка настроек -->
                        <div class="space-y-4">
                            <!-- Формат сохранения -->
                             <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-900 dark:text-white">Формат сохранения:</label>
                                <div class="flex items-center space-x-6">
                                    <div class="flex items-center">
                                        <input id="output-format-mp3" type="radio" value="mp3" name="output-format" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                                        <label for="output-format-mp3" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">MP3</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input id="output-format-wav" type="radio" value="wav" name="output-format" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                                        <label for="output-format-wav" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">WAV</label>
                                    </div>
                                </div>
                            </div>
                            <!-- Нормализация -->
                            <div class="pt-2 space-y-3">
                                <label class="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" id="normalize-toggle" class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <span class="text-md font-medium text-gray-900 dark:text-white">Нормализовать громкость</span>
                                </label>
                                <div id="normalize-options" class="hidden pl-8 space-y-2">
                                    <label for="lufs-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Целевая громкость (LUFS):</label>
                                    <input type="number" id="lufs-input" value="-16" step="0.5" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 dark:bg-gray-700">
                                </div>
                            </div>
                        </div>
                        <!-- Правая колонка настроек -->
                        <div class="space-y-4">
                            <!-- Сжатие -->
                             <div class="space-y-3">
                                 <label id="compress-toggle-label" class="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" id="compress-toggle" class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <span class="text-md font-medium text-gray-900 dark:text-white">Настроить сжатие</span>
                                 </label>
                                 <div id="compress-options-container" class="hidden pl-8 space-y-2">
                                    <!-- MP3 -->
                                    <div id="compress-options-mp3">
                                        <label for="bitrate-selector" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Битрейт MP3:</label>
                                        <select id="bitrate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700">
                                            <option value="192">192 kbps (Высокое качество)</option>
                                            <option value="128" selected>128 kbps (Стандартное)</option>
                                            <option value="96">96 kbps (Экономия места)</option>
                                        </select>
                                    </div>
                                     <!-- WAV -->
                                    <div id="compress-options-wav">
                                         <label for="wav-samplerate-selector" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Частота дискретизации WAV:</label>
                                         <select id="wav-samplerate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700">
                                            <option value="44100">44100 Гц (CD качество)</option>
                                            <option value="22050">22050 Гц (Радио)</option>
                                            <option value="16000">16000 Гц (Речь)</option>
                                        </select>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Кнопка обработки и статус -->
                <div class="space-y-2 pt-2">
                    <div id="status-message" class="text-center text-gray-700 dark:text-gray-300 h-5"></div>
                    <button id="process-button" disabled class="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Выберите файл
                    </button>
                </div>

                <!-- Контейнер результата -->
                 <div id="result-container" class="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hidden">
                     <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">4. Результат</h2>
                     <div class="grid grid-cols-2 gap-4 text-center pt-2">
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
                        <p class="text-sm font-medium mb-2 text-center">Прослушивание результата:</p>
                        <audio id="audio-player" controls class="w-full"></audio>
                    </div>
                    <a id="download-link" class="block w-full text-center px-4 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        Скачать файл
                    </a>
                </div>
            </div>
        </div>
    `;
}

function updateCompressOptionsUI() {
    const selectedFormat = document.querySelector('input[name="output-format"]:checked').value;
    const compressSpan = compressToggleLabel.querySelector('span');
    if (!compressSpan) return;

    if (selectedFormat === 'mp3') {
        compressToggle.checked = true;
        compressToggle.disabled = true;
        compressSpan.textContent = 'Настроить качество MP3';
        compressOptionsContainer.classList.remove('hidden');
        compressOptionsMp3.classList.remove('hidden');
        compressOptionsWav.classList.add('hidden');
    } else if (selectedFormat === 'wav') {
        compressToggle.disabled = false;
        compressSpan.textContent = 'Сжать аудиофайл (понизить sample rate)';
        compressOptionsContainer.classList.toggle('hidden', !compressToggle.checked);
        compressOptionsWav.classList.remove('hidden');
        compressOptionsMp3.classList.add('hidden');
    }
}

export function init() {
    eventListenersController = new AbortController();
    const { signal } = eventListenersController;

    const fileInput = document.getElementById('audio-input');
    const dropArea = document.querySelector('label[for="audio-input"]');
    const fileNameDisplay = document.getElementById('file-name-display');
    const editorContainer = document.getElementById('editor-container');

    processButton = document.getElementById('process-button');
    statusMessage = document.getElementById('status-message');
    audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');
    originalSizeEl = document.getElementById('original-size');
    compressedSizeEl = document.getElementById('compressed-size');
    const resultContainer = document.getElementById('result-container');

    normalizeToggle = document.getElementById('normalize-toggle');
    normalizeOptions = document.getElementById('normalize-options');
    lufsInput = document.getElementById('lufs-input');
    compressToggle = document.getElementById('compress-toggle');
    compressToggleLabel = document.getElementById('compress-toggle-label');
    compressOptionsContainer = document.getElementById('compress-options-container');
    compressOptionsMp3 = document.getElementById('compress-options-mp3');
    compressOptionsWav = document.getElementById('compress-options-wav');
    bitrateSelector = document.getElementById('bitrate-selector');
    wavSamplerateSelector = document.getElementById('wav-samplerate-selector');
    outputFormatMp3 = document.getElementById('output-format-mp3');
    outputFormatWav = document.getElementById('output-format-wav');

    const playPauseBtn = document.getElementById('play-pause-btn');
    const playSelectionBtn = document.getElementById('play-selection-btn');
    const startTimeEl = document.getElementById('start-time');
    const endTimeEl = document.getElementById('end-time');
    const waveformEl = document.getElementById('waveform');
    const waveformLoadingEl = document.getElementById('waveform-loading');

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, { signal });
        document.body.addEventListener(eventName, preventDefaults, { signal });
    });
    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    ['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.add('bg-gray-100', 'dark:bg-gray-600'), { signal }));
    ['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.remove('bg-gray-100', 'dark:bg-gray-600'), { signal }));
    dropArea.addEventListener('drop', e => {
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, { signal });

    normalizeToggle.addEventListener('change', () => normalizeOptions.classList.toggle('hidden', !normalizeToggle.checked), { signal });
    compressToggle.addEventListener('change', updateCompressOptionsUI, { signal });
    outputFormatMp3.addEventListener('change', updateCompressOptionsUI, { signal });
    outputFormatWav.addEventListener('change', updateCompressOptionsUI, { signal });

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        cleanup(true);

        if (!file) return;

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.mp3') && !fileName.endsWith('.wav')) {
            statusMessage.textContent = 'Ошибка: Поддерживаются только .mp3 и .wav';
            return;
        }

        audioFile = file;
        detectedInputFormat = fileName.endsWith('.mp3') ? 'mp3' : 'wav';
        fileNameDisplay.textContent = file.name;

        editorContainer.classList.remove('hidden');
        outputFormatMp3.checked = (detectedInputFormat === 'mp3');
        outputFormatWav.checked = (detectedInputFormat === 'wav');
        updateCompressOptionsUI();
        processButton.disabled = false;
        processButton.textContent = 'Обработать и скачать';

        try {
            waveformEl.classList.add('hidden');
            waveformLoadingEl.classList.remove('hidden');

            setupWaveSurfer();

            const arrayBuffer = await audioFile.arrayBuffer();
            originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

            wavesurfer.load(URL.createObjectURL(audioFile));

        } catch (error) {
            console.error('Ошибка при инициализации WaveSurfer или декодировании аудио:', error);
            handleProcessingError(error, statusMessage);
        }
    }, { signal });

    function setupWaveSurfer() {
        if (!window.WaveSurfer) {
            handleProcessingError(new Error("Библиотека WaveSurfer не загружена."), statusMessage);
            return;
        }

        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'rgb(200, 200, 200)',
            progressColor: 'rgb(100, 100, 100)',
            height: 112,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            responsive: true,
        });

        const wsRegions = wavesurfer.registerPlugin(WaveSurfer.Regions.create());

        wavesurfer.on('ready', () => {
            waveformLoadingEl.classList.add('hidden');
            waveformEl.classList.remove('hidden');
            playPauseBtn.disabled = false;
            const duration = wavesurfer.getDuration();
            endTimeEl.textContent = formatTime(duration);

            const region = wsRegions.addRegion({
                start: 0,
                end: duration,
                color: 'rgba(0, 100, 255, 0.1)',
                drag: true,
                resize: true,
            });
            activeRegion = region;
            startTimeEl.textContent = formatTime(activeRegion.start);
            endTimeEl.textContent = formatTime(activeRegion.end);
        });

        wsRegions.on('region-updated', (region) => {
            activeRegion = region;
            startTimeEl.textContent = formatTime(region.start);
            endTimeEl.textContent = formatTime(region.end);
            playSelectionBtn.disabled = false;
        });

        wavesurfer.on('play', () => { playPauseBtn.textContent = 'Пауза'; });
        wavesurfer.on('pause', () => { playPauseBtn.textContent = 'Воспр.'; });
        wavesurfer.on('finish', () => { playPauseBtn.textContent = 'Воспр.'; });
    }

    playPauseBtn.addEventListener('click', () => {
        if (wavesurfer && !isProcessing) wavesurfer.playPause();
    }, { signal });

    playSelectionBtn.addEventListener('click', () => {
        if (activeRegion && !isProcessing) {
            activeRegion.play();
        }
    }, { signal });


    processButton.addEventListener('click', async () => {
        if (!audioFile || !originalAudioBuffer || isProcessing) return;

        isProcessing = true;
        processButton.disabled = true;
        statusMessage.textContent = 'Начало обработки...';
        resultContainer.classList.add('hidden');
        let finalStatusMessage = 'Обработка завершена!';

        try {
            let audioBufferToProcess = originalAudioBuffer;

            if (activeRegion && (activeRegion.start > 0 || activeRegion.end < wavesurfer.getDuration())) {
                 statusMessage.textContent = 'Обрезка аудио...';
                 audioBufferToProcess = await trimAudioBuffer(originalAudioBuffer, activeRegion.start, activeRegion.end);
            }

            if (normalizeToggle.checked) {
                statusMessage.textContent = 'Измерение громкости (LUFS)...';
                const targetLufs = parseFloat(lufsInput.value);
                const measuredLufs = await measureIntegratedLoudness(audioBufferToProcess);

                if (measuredLufs === null) {
                    finalStatusMessage = 'Не удалось измерить громкость, нормализация пропущена.';
                } else if (measuredLufs > -Infinity) {
                    statusMessage.textContent = 'Нормализация громкости...';
                    const gainDb = targetLufs - measuredLufs;
                    const gainLinear = Math.pow(10, gainDb / 20);

                    const peak = findPeak(audioBufferToProcess);
                    if (peak * gainLinear > 1.0) {
                        const newGain = 1.0 / peak;
                        applyGain(audioBufferToProcess, newGain);
                        finalStatusMessage = 'Громкость увеличена до макс. безопасного уровня (цель вызвала бы искажения).';
                    } else {
                        applyGain(audioBufferToProcess, gainLinear);
                    }
                } else {
                    finalStatusMessage = 'Файл содержит тишину, нормализация громкости пропущена.';
                }
            }

            let outputBlob;
            let outputFileName;
            const originalFileName = audioFile.name.substring(0, audioFile.name.lastIndexOf('.'));
            const selectedOutputFormat = document.querySelector('input[name="output-format"]:checked').value;

            if (selectedOutputFormat === 'mp3') {
                statusMessage.textContent = 'Сжатие в MP3...';
                const bitrate = parseInt(bitrateSelector.value, 10);
                outputBlob = await compressToMp3(audioBufferToProcess, bitrate);
                outputFileName = `${originalFileName}(edited).mp3`;

            } else if (selectedOutputFormat === 'wav') {
                statusMessage.textContent = 'Обработка в WAV...';
                if (compressToggle.checked) {
                    const targetSampleRate = parseInt(wavSamplerateSelector.value, 10);
                    if (targetSampleRate < audioBufferToProcess.sampleRate) {
                        statusMessage.textContent = 'Изменение частоты дискретизации...';
                        audioBufferToProcess = await resampleAudioBuffer(audioBufferToProcess, targetSampleRate);
                    }
                }
                outputBlob = bufferToWav(audioBufferToProcess);
                outputFileName = `${originalFileName}(edited).wav`;
            }

            if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioPlayer.src);
            }

            const objectURL = URL.createObjectURL(outputBlob);
            audioPlayer.src = objectURL;
            downloadLink.href = objectURL;
            downloadLink.download = outputFileName;
            downloadLink.textContent = `Скачать ${outputFileName}`;

            originalSizeEl.textContent = formatBytes(audioFile.size);
            compressedSizeEl.textContent = formatBytes(outputBlob.size);

            statusMessage.textContent = finalStatusMessage;
            resultContainer.classList.remove('hidden');

        } catch (error) {
            console.error('Ошибка обработки аудио:', error);
            handleProcessingError(error, statusMessage);
        } finally {
            isProcessing = false;
            processButton.disabled = false;
        }
    }, { signal });
}

// ==================================================================
// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
// ==================================================================

// Вспомогательная функция для безопасной загрузки Wasm локально.
const toBlobURL = async (url, type) => {
    const data = await fetch(url).then((res) => res.blob());
    return URL.createObjectURL(data, { type });
};

// --- ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ ДЛЯ ИЗМЕРЕНИЯ ГРОМКОСТИ С FFMPEG.WASM ---
async function measureIntegratedLoudness(audioBuffer) {
    // Деструктурируем FFmpeg из глобального объекта window, куда его добавил скрипт.
    const { FFmpeg, fetchFile } = window.FFmpeg;
    const ffmpeg = new FFmpeg();

    try {
        statusMessage.textContent = 'Загрузка модуля обработки...';

        // --- ИЗМЕНЕНИЕ: Загружаем ядро и wasm-файл из GitHub Releases ---
        const coreJsUrl = 'https://github.com/pxl2a11/pxl2a11.github.io/releases/download/v1.0.0-assets/ffmpeg-core.js';
        const wasmUrl = 'https://github.com/pxl2a11/pxl2a11.github.io/releases/download/v1.0.0-assets/ffmpeg-core.wasm';

        await ffmpeg.load({
            coreURL: await toBlobURL(coreJsUrl, 'text/javascript'),
            wasmURL: await toBlobURL(wasmUrl, 'application/wasm')
        });
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        statusMessage.textContent = 'Подготовка файла для анализа...';
        const wavBlob = bufferToWav(audioBuffer);
        await ffmpeg.writeFile('input.wav', await fetchFile(wavBlob));

        statusMessage.textContent = 'Анализ громкости (может занять время)...';
        
        let output = '';
        ffmpeg.on('log', ({ message }) => {
             output += message + '\n';
        });

        // Запускаем команду анализа
        await ffmpeg.exec(['-i', 'input.wav', '-af', 'ebur128', '-f', 'null', '-']);

        // Завершаем сессию для освобождения памяти
        await ffmpeg.terminate(); 

        // Ищем результат в текстовом выводе
        const match = output.match(/I:\\s+(-?\\d+\\.\\d+)\\s+LUFS/);

        if (match && match[1]) {
            return parseFloat(match[1]);
        } else {
            console.warn('Не удалось найти результат EBU R128 в выводе FFmpeg.', output);
            return -Infinity; // Возвращаем -Infinity, если анализ не дал результата (например, тишина)
        }
    } catch (error) {
        console.error('Критическая ошибка при работе с ffmpeg.wasm:', error);
        // Попробуем завершить сессию, даже если была ошибка
        if (ffmpeg.loaded) {
            await ffmpeg.terminate();
        }
        return null; // Сигнализируем о сбое
    }
}

async function compressToMp3(audioBuffer, bitrate = 128) {
    // lamejs уже подключен в index.html, так что динамическая загрузка не нужна.
    // Проверяем на всякий случай.
    if (!window.lamejs) {
        throw new Error("Библиотека lame.min.js не загружена.");
    }

    try {
        const channels = audioBuffer.numberOfChannels;
        if (channels > 2) throw new Error('Поддерживаются только моно и стерео файлы.');
        const mp3encoder = new window.lamejs.Mp3Encoder(channels, audioBuffer.sampleRate, bitrate);
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
        return new Blob(mp3Data.map(buf => new Uint8Array(buf)), { type: 'audio/mpeg' });
    } catch(e) {
        throw new Error(`Сжатие в MP3 не удалось: ${e.message}`);
    }
}

async function trimAudioBuffer(originalBuffer, startTime, endTime) {
    const sampleRate = originalBuffer.sampleRate;
    const startOffset = Math.round(startTime * sampleRate);
    const endOffset = Math.round(endTime * sampleRate);
    const frameCount = endOffset - startOffset;

    if (frameCount <= 0) {
        throw new Error("Длительность обрезки должна быть положительной.");
    }

    const newBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        frameCount,
        sampleRate
    );

    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
        const channelData = originalBuffer.getChannelData(i);
        const newChannelData = newBuffer.getChannelData(i);
        newChannelData.set(channelData.subarray(startOffset, endOffset));
    }

    return newBuffer;
}

function handleProcessingError(error, statusElement) {
    let userMessage = 'Произошла непредвиденная ошибка.';
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('decodeaudiodata') || errorMessage.includes('unsupported format')) {
        userMessage = 'Не удалось прочитать файл. Возможно, он поврежден.';
    } else if (errorMessage.includes('измерить громкость')) {
        userMessage = 'Не удалось проанализировать громкость. Попробуйте без нормализации.';
    } else if (errorMessage.includes('сжатие в mp3')) {
        userMessage = 'Произошла ошибка при сжатии в MP3.';
    } else if (errorMessage.includes('обрезка')) {
         userMessage = 'Произошла ошибка при обрезке файла.';
    }
    statusElement.textContent = `Ошибка: ${userMessage}`;
}

function findPeak(audioBuffer) {
    let peak = 0;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            peak = Math.max(peak, Math.abs(channelData[j]));
        }
    }
    return peak;
}

function applyGain(audioBuffer, gain) {
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            channelData[j] *= gain;
        }
    }
}

function resampleAudioBuffer(audioBuffer, targetSampleRate) {
    return new Promise((resolve, reject) => {
        try {
            const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.duration * targetSampleRate, targetSampleRate);
            const bufferSource = offlineContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(offlineContext.destination);
            bufferSource.start(0);
            offlineContext.startRendering().then(resolve).catch(reject);
        } catch (e) { reject(e); }
    });
}

function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44, bufferArr = new ArrayBuffer(length), view = new DataView(bufferArr), channels = [], sampleRate = buffer.sampleRate;
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
            view.setInt16(pos, sample < 0 ? sample * 32768 : sample * 32767, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function cleanup(softCleanup = false) {
    if (!softCleanup && eventListenersController) {
        eventListenersController.abort();
    }
    if (wavesurfer) {
        wavesurfer.destroy();
        wavesurfer = null;
    }
    if (audioPlayer && audioPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioPlayer.src);
    }

    audioFile = null;
    detectedInputFormat = null;
    originalAudioBuffer = null;
    activeRegion = null;
    isProcessing = false;

    const audioInput = document.getElementById('audio-input');
    if (audioInput) {
        audioInput.value = '';
        document.getElementById('editor-container').classList.add('hidden');
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('status-message').textContent = '';
        document.getElementById('file-name-display').textContent = 'MP3 или WAV';

        if (normalizeToggle) { normalizeToggle.checked = false; }
        if (normalizeOptions) { normalizeOptions.classList.add('hidden'); }
        if (compressToggle) {
            compressToggle.checked = false;
            compressToggle.disabled = false;
        }
        if (compressOptionsContainer) { compressOptionsContainer.classList.add('hidden'); }
        if (lufsInput) { lufsInput.value = '-16'; }

        const pButton = document.getElementById('process-button');
        if (pButton) {
            pButton.disabled = true;
            pButton.textContent = 'Выберите файл';
        }

        if (audioPlayer) audioPlayer.src = '';
        if (originalSizeEl) originalSizeEl.textContent = '-';
        if (compressedSizeEl) compressedSizeEl.textContent = '-';

        const startTimeEl = document.getElementById('start-time');
        const endTimeEl = document.getElementById('end-time');
        if (startTimeEl) startTimeEl.textContent = '00:00.000';
        if (endTimeEl) endTimeEl.textContent = '00:00.000';
    }
}
