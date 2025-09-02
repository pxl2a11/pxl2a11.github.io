// js/apps/voiceRecorder.js

let mediaRecorder;
let audioChunks = [];
let timerInterval;
let seconds = 0;

const recordIconHtml = `<img src="img/soundAndMicTest.svg" class="w-8 h-8 filter brightness-0 invert" alt="Record">`;
const stopIconHtml = `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h10v12H5V4z" /></svg>`;

export function getHtml() {
    return `
        <div class="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-4">Диктофон</h3>
            <div id="recorder-status" class="mb-4 text-gray-600 dark:text-gray-300">Нажмите кнопку, чтобы начать запись</div>
            
            <div id="timer" class="text-5xl font-mono mb-6">00:00</div>
            
            <button id="record-btn" class="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center mx-auto transition-all duration-300 focus:outline-none shadow-lg">
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

            recordBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.add('bg-gray-700', 'hover:bg-gray-600', 'animate-pulse');
            recordBtn.innerHTML = stopIconHtml;
            statusDiv.textContent = 'Идёт запись...';

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
            
            recordBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            recordBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600', 'animate-pulse');
            recordBtn.innerHTML = recordIconHtml;
            statusDiv.textContent = 'Нажмите, чтобы начать новую запись';
        }
    }
    
    function addRecordingToList(audioUrl) {
        if (!hasRecordings) {
            recordingsContainer.innerHTML = '';
            hasRecordings = true;
        }

        const recordingId = `rec_${Date.now()}`;
        const recordingDiv = document.createElement('div');
        recordingDiv.className = 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-3';
        
        const audio = new Audio(audioUrl);
        audio.controls = true;
        audio.className = 'w-full';

        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        const defaultFilename = `record_${timestamp}`;

        const namingDiv = document.createElement('div');
        namingDiv.className = 'flex items-center gap-2';
        namingDiv.innerHTML = `
            <input type="text" id="name-input-${recordingId}" value="${defaultFilename}" class="flex-grow p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" placeholder="Название записи...">
            <a id="download-link-${recordingId}" href="${audioUrl}" download="${defaultFilename}.webm" class="flex-shrink-0 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="Скачать">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
        `;
        
        recordingDiv.appendChild(audio);
        recordingDiv.appendChild(namingDiv);
        
        recordingsContainer.prepend(recordingDiv);

        const nameInput = document.getElementById(`name-input-${recordingId}`);
        const downloadLink = document.getElementById(`download-link-${recordingId}`);
        nameInput.addEventListener('input', () => {
            const newName = nameInput.value.trim() || defaultFilename;
            downloadLink.download = `${newName}.webm`;
        });
    }
}

export function cleanup() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    clearInterval(timerInterval);
}
