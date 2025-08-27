// js/apps/voiceRecorder.js

let mediaRecorder;
let audioChunks = [];
let timerInterval;
let seconds = 0;

// ИЗМЕНЕНИЕ: Сохраняем HTML иконки в переменную для удобного переиспользования
const recordIconHtml = `<img src="img/soundAndMicTest.svg" class="w-8 h-8 filter brightness-0 invert" alt="Record">`;
const stopIconHtml = `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h10v12H5V4z" /></svg>`;

export function getHtml() {
    return `
        <div class="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-4">Диктофон</h3>
            <div id="recorder-status" class="mb-4 text-gray-600 dark:text-gray-300">Нажмите кнопку, чтобы начать запись</div>
            
            <div id="timer" class="text-5xl font-mono mb-6">00:00</div>
            
            <button id="record-btn" class="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center mx-auto transition-all duration-300 focus:outline-none shadow-lg">
                 <!-- ИЗМЕНЕНИЕ: Используем иконку из файла -->
                 ${recordIconHtml}
            </button>
            <div id="recorder-error" class="text-red-500 mt-4"></div>

            <div id="recordings-list" class="mt-8 text-left">
                 <h4 class="text-lg font-semibold mb-2 border-t pt-4 dark:border-gray-600">Ваши записи:</h4>
                 <div id="recordings-container" class="space-y-3">
                    <p class="text-gray-500 dark:text-gray-400">Здесь будут отображаться ваши записи.</p>
                 </div>
            </div>
        </div>
    `;
}

export function init() {
    const recordBtn = document.getElementById('record-btn');
    const statusDiv = document.getElementById('recorder-status');
    const timerDiv = document.getElementById('timer');
    const errorDiv = document.getElementById('recorder-error');
    const recordingsContainer = document.getElementById('recordings-container');
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            // UI Changes
            recordBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.add('bg-gray-700', 'hover:bg-gray-600', 'animate-pulse');
            // ИЗМЕНЕНИЕ: Меняем иконку на "стоп"
            recordBtn.innerHTML = stopIconHtml;
            statusDiv.textContent = 'Идёт запись...';

            // Timer
            seconds = 0;
            timerInterval = setInterval(() => {
                seconds++;
                const min = Math.floor(seconds / 60).toString().padStart(2, '0');
                const sec = (seconds % 60).toString().padStart(2, '0');
                timerDiv.textContent = `${min}:${sec}`;
            }, 1000);

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                addRecordingToList(audioUrl);
                audioChunks = [];
                 // Stop all tracks on the stream to turn off the mic indicator
                stream.getTracks().forEach(track => track.stop());
            });

        } catch (err) {
            console.error("Error accessing microphone:", err);
            errorDiv.textContent = 'Ошибка: Не удалось получить доступ к микрофону. Пожалуйста, разрешите доступ в настройках браузера.';
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            clearInterval(timerInterval);
            
            // UI Changes
            recordBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600', 'animate-pulse');
            // ИЗМЕНЕНИЕ: Возвращаем иконку записи
            recordBtn.innerHTML = recordIconHtml;
            statusDiv.textContent = 'Нажмите, чтобы начать новую запись';
        }
    }
    
    function addRecordingToList(audioUrl) {
        if (!hasRecordings) {
            recordingsContainer.innerHTML = '';
            hasRecordings = true;
        }

        const recordingDiv = document.createElement('div');
        recordingDiv.className = 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-4';
        
        const audio = new Audio(audioUrl);
        audio.controls = true;
        audio.className = 'w-full';

        const downloadLink = document.createElement('a');
        downloadLink.href = audioUrl;
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        downloadLink.download = `record_${timestamp}.webm`;
        downloadLink.innerHTML = `<svg class="w-6 h-6 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>`;
        downloadLink.title = "Скачать запись";
        
        recordingDiv.appendChild(audio);
        recordingDiv.appendChild(downloadLink);
        
        recordingsContainer.prepend(recordingDiv);
    }
}

export function cleanup() {
    // Останавливаем запись, если она идет при выходе из приложения
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    clearInterval(timerInterval);
}
