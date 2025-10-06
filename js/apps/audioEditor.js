// ---51 START OF FILE apps/audioCompressor.js ---

// Переменные для хранения состояния и ссылок на элементы
let audioFile = null;
let detectedInputFormat = null; // 'mp3' или 'wav'
let audioPlayer;
let processButton;
let statusMessage;
let originalSizeEl;
let compressedSizeEl;
let audioContext;

// Элементы управления
let normalizeToggle;
let normalizeOptions;
let lufsInput;
let compressToggle;
let compressToggleLabel; // Добавлена ссылка на label
let compressOptionsContainer;
let compressOptionsMp3;
let compressOptionsWav;
let bitrateSelector;
let wavSamplerateSelector;
let outputFormatContainer;
let outputFormatMp3;
let outputFormatWav;

// Функция для получения HTML-разметки приложения
export function getHtml() {
    return `
        <div class="space-y-6 max-w-4xl mx-auto">
            
            <!-- Основной контейнер с сеткой для настроек и результата -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- Левая колонка: Настройки -->
                <div class="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">1. Настройки обработки</h2>

                    <!-- Блок загрузки файла -->
                    <div>
                        <label for="audio-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Выберите аудиофайл:</label>
                        <div class="flex items-center justify-center w-full">
                            <label for="audio-input" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-100 dark:bg-gray-700 hover:dark:bg-gray-600 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Нажмите для выбора</span> или перетащите</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">MP3 или WAV</p>
                                </div>
                                <input id="audio-input" type="file" class="hidden" accept=".mp3,.wav,audio/mpeg,audio/wav" />
                            </label>
                        </div> 
                    </div>

                     <!-- БЛОК: Выбор формата сохранения -->
                    <div id="output-format-container" class="hidden pt-4 space-y-2">
                        <label class="block text-sm font-medium text-gray-900 dark:text-white">Формат сохранения:</label>
                        <div class="flex items-center space-x-6">
                            <div class="flex items-center">
                                <input id="output-format-mp3" type="radio" value="mp3" name="output-format" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600">
                                <label for="output-format-mp3" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">MP3</label>
                            </div>
                            <div class="flex items-center">
                                <input id="output-format-wav" type="radio" value="wav" name="output-format" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600">
                                <label for="output-format-wav" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">WAV</label>
                            </div>
                        </div>
                    </div>


                    <!-- Опция Нормализации -->
                    <div class="pt-4 space-y-3">
                         <label class="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" id="normalize-toggle" class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600">
                            <span class="text-md font-medium text-gray-900 dark:text-white">Нормализовать громкость</span>
                         </label>
                         <div id="normalize-options" class="hidden pl-8 space-y-2">
                            <label for="lufs-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Целевая громкость (LUFS):</label>
                            <input type="number" id="lufs-input" value="-16" step="0.5" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="-16">
                            <p class="text-xs text-gray-500 dark:text-gray-400">-14 (музыка), -16 (стриминг), -23 (ТВ).</p>
                         </div>
                    </div>
                    
                    <!-- Опция Сжатия -->
                     <div class="pt-4 space-y-3">
                         <label id="compress-toggle-label" class="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" id="compress-toggle" class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600">
                            <span class="text-md font-medium text-gray-900 dark:text-white">Сжать аудиофайл</span>
                         </label>
                         <div id="compress-options-container" class="hidden pl-8 space-y-2">
                            <!-- Настройки для MP3 -->
                            <div id="compress-options-mp3">
                                <label for="bitrate-selector" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Битрейт MP3:</label>
                                <select id="bitrate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600">
                                    <option value="192">192 kbps (Высокое качество)</option>
                                    <option value="128" selected>128 kbps (Стандартное)</option>
                                    <option value="96">96 kbps (Экономия места)</option>
                                </select>
                            </div>
                             <!-- Настройки для WAV -->
                            <div id="compress-options-wav">
                                 <label for="wav-samplerate-selector" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Частота дискретизации WAV:</label>
                                 <select id="wav-samplerate-selector" class="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600">
                                    <option value="44100">44100 Гц (CD качество)</option>
                                    <option value="22050" selected>22050 Гц (Радио)</option>
                                    <option value="16000">16000 Гц (Речь)</option>
                                </select>
                            </div>
                         </div>
                    </div>
                </div>

                <!-- Правая колонка: Результат -->
                <div id="result-container" class="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hidden">
                     <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">2. Результат</h2>
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
                        <p class="text-sm font-medium mb-2 text-center">Предпрослушивание:</p>
                        <audio id="audio-player" controls class="w-full"></audio>
                    </div>
                    <a id="download-link" class="block w-full text-center px-4 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        Скачать файл
                    </a>
                </div>
            </div>

            <!-- Статус и кнопка обработки -->
            <div class="space-y-2">
                 <div id="status-message" class="text-center text-gray-700 dark:text-gray-300 h-5"></div>
                 <button id="process-button" disabled class="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Выберите файл
                </button>
            </div>
        </div>
    `;
}

// Функция для обновления UI настроек сжатия в зависимости от выбранного формата
function updateCompressOptionsUI(selectedFormat) {
    if (selectedFormat === 'mp3') {
        // Для MP3 сжатие (выбор битрейта) - это основная опция.
        compressToggleLabel.classList.add('hidden'); // Скрываем общий переключатель
        compressOptionsContainer.classList.remove('hidden'); // Всегда показываем контейнер
        compressOptionsMp3.classList.remove('hidden'); // Показываем опции MP3
        compressOptionsWav.classList.add('hidden'); // Скрываем опции WAV
    } else if (selectedFormat === 'wav') {
        // Для WAV сжатие (понижение частоты) - опционально.
        compressToggleLabel.classList.remove('hidden'); // Показываем общий переключатель
        compressOptionsContainer.classList.toggle('hidden', !compressToggle.checked); // Показываем/скрываем в зависимости от него
        compressOptionsWav.classList.remove('hidden'); // Показываем опции WAV
        compressOptionsMp3.classList.add('hidden'); // Скрываем опции MP3
    }
}


// Функция инициализации
export function init() {
    // Получаем все элементы
    const fileInput = document.getElementById('audio-input');
    processButton = document.getElementById('process-button');
    statusMessage = document.getElementById('status-message');
    audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');
    originalSizeEl = document.getElementById('original-size');
    compressedSizeEl = document.getElementById('compressed-size');
    const resultContainer = document.getElementById('result-container');
    
    // Новые элементы
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
    outputFormatContainer = document.getElementById('output-format-container');
    outputFormatMp3 = document.getElementById('output-format-mp3');
    outputFormatWav = document.getElementById('output-format-wav');

    const dropArea = document.querySelector('label[for="audio-input"]');

    // --- ИСПРАВЛЕНИЕ: Добавляем проверку на наличие ключевых элементов ---
    // Это предотвратит сбой, если init() вызывается до того, как HTML полностью отрисован.
    if (!dropArea) {
        console.error("Ошибка инициализации Редактора Аудио: не найден элемент 'label[for=\"audio-input\"]'.");
        return; // Прерываем выполнение, чтобы избежать дальнейших ошибок.
    }
    const fileLabel = dropArea.querySelector('.font-semibold');
    if (!fileLabel) {
        console.error("Ошибка инициализации Редактора Аудио: не найден элемент '.font-semibold' внутри области загрузки.");
        return; // Прерываем выполнение.
    }
    
    // Теперь эта строка безопасна, так как мы убедились, что fileLabel не null
    const originalFileLabelText = fileLabel.textContent;


    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // --- УЛУЧШЕНИЕ: Обработчики Drag and Drop ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('bg-gray-100', 'dark:bg-gray-600'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('bg-gray-100', 'dark:bg-gray-600'), false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files.length > 0) {
            fileInput.files = dt.files;
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }, false);


    // Обработчики для переключателей
    normalizeToggle.addEventListener('change', () => {
        normalizeOptions.classList.toggle('hidden', !normalizeToggle.checked);
    });

    compressToggle.addEventListener('change', () => {
        const selectedFormat = document.querySelector('input[name="output-format"]:checked').value;
        if (selectedFormat === 'wav') {
            compressOptionsContainer.classList.toggle('hidden', !compressToggle.checked);
        }
    });
    
    // Обработчики для выбора формата сохранения
    outputFormatMp3.addEventListener('change', () => updateCompressOptionsUI('mp3'));
    outputFormatWav.addEventListener('change', () => updateCompressOptionsUI('wav'));

    // Обновленный обработчик выбора файла
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        resultContainer.classList.add('hidden');
        outputFormatContainer.classList.add('hidden');
        processButton.disabled = true;
        statusMessage.textContent = '';
        fileLabel.textContent = originalFileLabelText;
        
        if (!file) {
            audioFile = null;
            detectedInputFormat = null;
            processButton.textContent = 'Выберите файл';
            return;
        }

        audioFile = file;
        const fileName = file.name.toLowerCase();
        fileLabel.textContent = file.name;

        if (fileName.endsWith('.mp3')) {
            detectedInputFormat = 'mp3';
        } else if (fileName.endsWith('.wav')) {
            detectedInputFormat = 'wav';
        } else {
            detectedInputFormat = null;
            statusMessage.textContent = 'Ошибка: Поддерживаются только .mp3 и .wav';
            processButton.textContent = 'Неверный формат';
            fileLabel.textContent = originalFileLabelText;
            return;
        }
        
        outputFormatContainer.classList.remove('hidden');
        outputFormatMp3.checked = (detectedInputFormat === 'mp3');
        outputFormatWav.checked = (detectedInputFormat === 'wav');
        updateCompressOptionsUI(detectedInputFormat);

        processButton.disabled = false;
        processButton.textContent = 'Обработать файл';
    });

    // Обновленный основной обработчик нажатия
    processButton.addEventListener('click', async () => {
        if (!audioFile) return;

        processButton.disabled = true;
        statusMessage.textContent = 'Чтение файла...';
        resultContainer.classList.add('hidden');
        let finalStatusMessage = 'Обработка завершена!';

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            if (normalizeToggle.checked) {
                statusMessage.textContent = 'Измерение громкости (LUFS)...';
                const targetLufs = parseFloat(lufsInput.value);
                const measuredLufs = await measureIntegratedLoudness(audioBuffer);
                
                if (measuredLufs === null || isNaN(measuredLufs)) {
                    throw new Error('Не удалось измерить громкость.');
                }
                
                statusMessage.textContent = 'Нормализация громкости...';
                const gainDb = targetLufs - measuredLufs;
                const gainLinear = Math.pow(10, gainDb / 20);

                const peak = findPeak(audioBuffer);
                if (peak * gainLinear > 1.0) {
                    const newGain = 1.0 / peak;
                    applyGain(audioBuffer, newGain);
                    finalStatusMessage = 'Громкость увеличена до макс. безопасного уровня (цель вызвала бы искажения).';
                } else {
                    applyGain(audioBuffer, gainLinear);
                }
            }

            let outputBlob;
            let outputFileName;
            const originalFileName = audioFile.name.substring(0, audioFile.name.lastIndexOf('.'));
            const selectedOutputFormat = document.querySelector('input[name="output-format"]:checked').value;
            
            if (selectedOutputFormat === 'mp3') {
                statusMessage.textContent = 'Сжатие в MP3...';
                const bitrate = parseInt(bitrateSelector.value, 10); 
                outputBlob = await compressToMp3(audioBuffer, bitrate);
                outputFileName = `${originalFileName}(miniapps).mp3`;

            } else if (selectedOutputFormat === 'wav') {
                statusMessage.textContent = 'Обработка в WAV...';
                if (compressToggle.checked) {
                    const targetSampleRate = parseInt(wavSamplerateSelector.value, 10);
                    if (targetSampleRate < audioBuffer.sampleRate) {
                        statusMessage.textContent = 'Изменение частоты дискретизации...';
                        audioBuffer = await resampleAudioBuffer(audioBuffer, targetSampleRate);
                    }
                }
                outputBlob = bufferToWav(audioBuffer);
                outputFileName = `${originalFileName}(miniapps).wav`;
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
            statusMessage.textContent = `Ошибка: ${error.message}.`;
        } finally {
            processButton.disabled = false;
        }
    });
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Динамически и безопасно загружает скрипт
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            // Если скрипт уже есть, но мог не успеть загрузиться, добавляем обработчики
            if (existingScript.dataset.loaded) {
                return resolve();
            }
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error(`Не удалось загрузить скрипт: ${src}`)));
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));
        document.head.appendChild(script);
    });
}

// Динамически загружает и использует библиотеку для измерения LUFS
function measureIntegratedLoudness(audioBuffer) {
    return new Promise((resolve, reject) => {
        const run = () => runMeasurement(audioBuffer).then(resolve).catch(reject);
        
        if (!window.EBU_R128) {
            loadScript('https://cdn.jsdelivr.net/npm/ebu-r128-webaudio@1.0.3/dist/ebu-r128.min.js')
                .then(run)
                .catch(reject);
        } else {
            run();
        }

        async function runMeasurement(buffer) {
            try {
                const meter = new EBU_R128(buffer.sampleRate);
                const offlineContext = new OfflineAudioContext(
                    buffer.numberOfChannels,
                    buffer.length,
                    buffer.sampleRate
                );
                const source = offlineContext.createBufferSource();
                source.buffer = buffer;

                const processor = offlineContext.createScriptProcessor(4096, buffer.numberOfChannels, buffer.numberOfChannels);
                processor.onaudioprocess = (e) => {
                    const inputBuffer = e.inputBuffer;
                    const leftChannel = inputBuffer.getChannelData(0);
                    const rightChannel = inputBuffer.numberOfChannels > 1 ? inputBuffer.getChannelData(1) : undefined;
                    meter.process(leftChannel, rightChannel);
                };

                source.connect(processor);
                processor.connect(offlineContext.destination);
                source.start(0);

                await offlineContext.startRendering();
                const lufs = meter.getIntegratedLoudness();
                resolve(lufs);

            } catch (e) {
                reject(e);
            }
        }
    });
}

function findPeak(audioBuffer) {
    let peak = 0;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            const absSample = Math.abs(channelData[j]);
            if (absSample > peak) peak = absSample;
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

function compressToMp3(audioBuffer, bitrate = 128) {
    return new Promise((resolve, reject) => {
        const doEncode = () => resolve(encode(audioBuffer, bitrate));

        if (!window.lamejs) {
            loadScript('https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js')
                .then(doEncode)
                .catch(reject);
        } else {
             doEncode();
        }

        function encode(audioBuffer, bitrate) {
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
            return new Blob(mp3Data.map(buf => new Uint8Array(buf)), { type: 'audio/mpeg' });
        }
    });
}

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

export function cleanup() {
    if (audioPlayer && audioPlayer.src) URL.revokeObjectURL(audioPlayer.src);
    audioFile = null;
    detectedInputFormat = null;
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
