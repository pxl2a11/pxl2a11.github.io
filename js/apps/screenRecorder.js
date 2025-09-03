// js/apps/screenRecorder.js

let mediaRecorder;
let recordedChunks = [];
let stream;

// Функция для получения HTML-разметки приложения
export function getHtml() {
    return `
        <div class="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-4">Запись экрана</h3>
            <p id="recorder-status" class="mb-4 text-gray-600 dark:text-gray-300">
                Нажмите "Начать запись", чтобы выбрать окно или экран для захвата.
            </p>

            <!-- Область предпросмотра -->
            <div class="mb-4 bg-gray-900 rounded-lg overflow-hidden">
                <video id="video-preview" class="w-full" autoplay muted playsinline></video>
            </div>

            <!-- Кнопки управления -->
            <div class="flex justify-center gap-4">
                <button id="record-btn" class="w-48 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                    <span>Начать запись</span>
                </button>
            </div>
            <div id="recorder-error" class="text-red-500 mt-4 h-5"></div>

            <!-- Список записей -->
            <div id="recordings-list" class="mt-8 text-left w-full">
                 <h4 class="text-lg font-semibold mb-2 border-t pt-4 dark:border-gray-600">Готовые записи:</h4>
                 <div id="recordings-container" class="space-y-3">
                    <p class="text-gray-500 dark:text-gray-400">Здесь будут отображаться ваши видео.</p>
                 </div>
            </div>
        </div>
    `;
}

// Функция инициализации
export function init() {
    const recordBtn = document.getElementById('record-btn');
    const statusDiv = document.getElementById('recorder-status');
    const errorDiv = document.getElementById('recorder-error');
    const recordingsContainer = document.getElementById('recordings-container');
    const videoPreview = document.getElementById('video-preview');

    let hasRecordings = false;

    recordBtn.addEventListener('click', () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            startRecording();
        } else {
            stopRecording();
        }
    });

    async function startRecording() {
        errorDiv.textContent = '';
        try {
            // Запрашиваем доступ к экрану (и опционально к аудио)
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Показываем превью в элементе video
            videoPreview.srcObject = stream;

            // Отключаем кнопку, пока идет запись
            recordBtn.disabled = true;

            // Начинаем запись потока
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(videoBlob);
                addRecordingToList(videoUrl);
                recordedChunks = [];
            };

            mediaRecorder.start();
            statusDiv.textContent = 'Идёт запись...';
            recordBtn.querySelector('span').textContent = 'Остановить';
            recordBtn.classList.replace('bg-red-500', 'bg-gray-600');
            recordBtn.classList.replace('hover:bg-red-600', 'hover:bg-gray-500');
            recordBtn.disabled = false;

            // Слушатель на случай, если пользователь нажмет "Остановить доступ" в браузере
            stream.getVideoTracks()[0].onended = () => stopRecording();

        } catch (err) {
            console.error("Ошибка захвата экрана:", err);
            errorDiv.textContent = 'Не удалось начать запись. Убедитесь, что вы предоставили доступ.';
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop()); // Очень важно останавливать треки
        }
        statusDiv.textContent = 'Запись остановлена. Нажмите, чтобы начать новую.';
        recordBtn.querySelector('span').textContent = 'Начать запись';
        recordBtn.classList.replace('bg-gray-600', 'bg-red-500');
        recordBtn.classList.replace('hover:bg-gray-500', 'hover:bg-red-600');
        videoPreview.srcObject = null;
    }

    function addRecordingToList(videoUrl) {
        if (!hasRecordings) {
            recordingsContainer.innerHTML = '';
            hasRecordings = true;
        }

        const recordingDiv = document.createElement('div');
        recordingDiv.className = 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-center gap-4';

        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.controls = true;
        videoElement.className = 'w-full sm:w-48 rounded';

        const controlsDiv = document.createElement('div');
        const timestamp = new Date().toLocaleString('ru-RU');
        const downloadLink = document.createElement('a');
        downloadLink.href = videoUrl;
        downloadLink.download = `screen-record-${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.webm`;
        downloadLink.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center';
        downloadLink.textContent = 'Скачать';

        controlsDiv.innerHTML = `<p class="text-sm mb-2">Запись от ${timestamp}</p>`;
        controlsDiv.appendChild(downloadLink);

        recordingDiv.appendChild(videoElement);
        recordingDiv.appendChild(controlsDiv);
        
        recordingsContainer.prepend(recordingDiv);
    }
}

// Функция очистки при выходе из приложения
export function cleanup() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    stream = null;
    mediaRecorder = null;
    recordedChunks = [];
}
