// 11js/apps/audioCompressor.js

// Для работы приложения используется CDN FFmpeg.wasm
const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg;
let objectUrl = null; // Хранит URL созданного файла для последующей очистки

/**
 * Возвращает HTML-структуру для приложения сжатия аудио.
 */
export function getHtml() {
    return `
        <div class="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-inner">
            <h3 class="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">Сжатие аудиофайлов</h3>

            <p class="text-center text-gray-600 dark:text-gray-400">
                Выберите аудиофайл, установите желаемый битрейт и нажмите "Сжать".
                Обработка происходит локально в вашем браузере и может занять некоторое время.
            </p>

            <div class="flex flex-col items-center justify-center w-full">
                <label for="audio-file-input" class="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-4-4V6a2 2 0 012-2h10a2 2 0 012 2v6a4 4 0 01-4 4H7z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11v3m0 0l-2-2m2 2l2-2"></path></svg>
                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Нажмите для загрузки</span> или перетащите файл</p>
                        <p id="file-name" class="mt-2 text-sm text-center text-gray-600 dark:text-gray-400"></p>
                    </div>
                    <input id="audio-file-input" type="file" class="hidden" accept="audio/*" />
                </label>
            </div>

            <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                <label for="bitrate-select" class="text-gray-700 dark:text-gray-300 font-medium">Битрейт:</label>
                <select id="bitrate-select" class="w-full md:w-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                    <option value="64">64 kbps (низкое качество)</option>
                    <option value="96">96 kbps (речь)</option>
                    <option value="128" selected>128 kbps (стандарт)</option>
                    <option value="192">192 kbps (хорошее качество)</option>
                    <option value="256">256 kbps (высокое качество)</option>
                    <option value="320">320 kbps (отличное качество)</option>
                </select>
            </div>

            <div class="text-center">
                <button id="compress-button" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md">
                    Сжать файл
                </button>
            </div>

            <div id="status-container" class="text-center text-gray-600 dark:text-gray-400 space-y-2"></div>
            <div id="result-container" class="hidden mt-6 p-4 bg-green-50 dark:bg-gray-700 rounded-lg space-y-3"></div>
        </div>
    `;
}

/**
 * Инициализирует функциональность приложения.
 */
export async function init() {
    const fileInput = document.getElementById('audio-file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const bitrateSelect = document.getElementById('bitrate-select');
    const compressButton = document.getElementById('compress-button');
    const statusContainer = document.getElementById('status-container');
    const resultContainer = document.getElementById('result-container');
    let selectedFile = null;

    const setupFfmpeg = async () => {
        if (!ffmpeg || !ffmpeg.isLoaded()) {
            statusContainer.innerHTML = 'Загрузка библиотеки для обработки (может занять время)...';
            // ИСПОЛЬЗУЕМ ОДНОПОТОЧНУЮ ВЕРСИЮ ЯДРА (CORE-ST)
            ffmpeg = createFFmpeg({
                log: true,
                corePath: 'https://unpkg.com/@ffmpeg/core-st@0.10.0/dist/ffmpeg-core.js',
            });
            await ffmpeg.load();
            statusContainer.innerHTML = 'Библиотека загружена. Готово к работе.';
        }
    };

    fileInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Выбран файл: ${selectedFile.name}`;
            compressButton.disabled = false;
        } else {
            fileNameDisplay.textContent = '';
            compressButton.disabled = true;
        }
    });

    compressButton.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Пожалуйста, выберите файл.');
            return;
        }
        cleanup(); // Очистка предыдущего результата
        resultContainer.classList.add('hidden');
        resultContainer.innerHTML = '';
        compressButton.disabled = true;

        try {
            await setupFfmpeg();
            const inputFileName = 'input.' + selectedFile.name.split('.').pop();
            const outputFileName = 'output.mp3';
            const bitrate = bitrateSelect.value + 'k';

            statusContainer.innerHTML = 'Загрузка файла в виртуальную систему...';
            ffmpeg.FS('writeFile', inputFileName, await fetchFile(selectedFile));

            statusContainer.innerHTML = 'Начинаю сжатие... (этот процесс может занять несколько минут)';
            await ffmpeg.run('-i', inputFileName, '-b:a', bitrate, outputFileName);
            
            statusContainer.innerHTML = 'Сжатие завершено. Подготовка результата...';
            const data = ffmpeg.FS('readFile', outputFileName);
            const compressedBlob = new Blob([data.buffer], { type: 'audio/mpeg' });
            
            ffmpeg.FS('unlink', inputFileName);
            ffmpeg.FS('unlink', outputFileName);

            const originalSize = (selectedFile.size / 1024 / 1024).toFixed(2);
            const compressedSize = (compressedBlob.size / 1024 / 1024).toFixed(2);
            const ratio = ((1 - compressedBlob.size / selectedFile.size) * 100).toFixed(1);

            objectUrl = URL.createObjectURL(compressedBlob);
            
            resultContainer.innerHTML = `
                <h4 class="font-bold text-lg text-green-800 dark:text-green-300">Готово!</h4>
                <p><strong>Исходный размер:</strong> ${originalSize} МБ</p>
                <p><strong>Размер после сжатия:</strong> ${compressedSize} МБ</p>
                <p><strong>Степень сжатия:</strong> ~${ratio}%</p>
                <a href="${objectUrl}" download="${selectedFile.name.replace(/\.[^/.]+$/, "")}_${bitrate}.mp3" class="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Скачать сжатый файл
                </a>
            `;
            resultContainer.classList.remove('hidden');
            statusContainer.innerHTML = 'Готово к сжатию следующего файла.';
        } catch (error) {
            console.error(error);
            statusContainer.innerHTML = `<p class="text-red-500">Произошла ошибка. Попробуйте другой файл или обновите страницу.</p>`;
        } finally {
            compressButton.disabled = false;
        }
    });

    compressButton.disabled = true;
}

/**
 * Освобождает ресурсы, когда пользователь уходит со страницы приложения.
 */
export function cleanup() {
    if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
    }
}
