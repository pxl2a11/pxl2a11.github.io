let video, canvasElement, canvas, resultContainer, statusMessage;
let stream;
let animationFrameId;
let qrWorker; // Переменная для нашего воркера

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

// Эта функция будет обрабатывать результат, полученный от воркера
function handleQrCode(code) {
    if (code) {
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
        
        resultContainer.classList.remove('hidden');
        statusMessage.textContent = "✅ Код найден!";
        
        if (code.data.startsWith('http://') || code.data.startsWith('https://')) {
            resultContainer.innerHTML = `Результат: <a href="${code.data}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${code.data}</a>`;
        } else {
             resultContainer.textContent = `Результат: ${code.data}`;
        }

        cleanup(); // Останавливаем сканирование после нахождения кода
    }
}

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        statusMessage.textContent = "🔍 Сканирование...";
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        
        // --- ИЗМЕНЕНИЕ ---
        // Вместо вызова jsQR() напрямую, отправляем данные в воркер.
        // Передаем объект imageData. Воркер не может получить доступ к canvas напрямую.
        qrWorker.postMessage(imageData);
    }
    // Продолжаем запрашивать кадры, пока не остановим сканирование
    animationFrameId = requestAnimationFrame(tick);
}

function startScan() {
    if (stream) {
        cleanup();
        return;
    }
    
    resultContainer.classList.add('hidden');
    statusMessage.textContent = "⌛ Запрос доступа к камере...";
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(s) {
            stream = s;
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            animationFrameId = requestAnimationFrame(tick);
        })
        .catch(function(err) {
            console.error(err);
            statusMessage.textContent = "⛔️ Ошибка: Камера не доступна или доступ запрещен.";
        });
}

export function getHtml() {
    return `
        <div class="flex flex-col items-center space-y-4">
            <p id="qr-status-message" class="text-gray-600 dark:text-gray-400">Нажмите кнопку, чтобы начать сканирование.</p>
            <div class="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden relative">
                <video id="qr-video" class="w-full h-auto" playsinline></video>
                <canvas id="qr-canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
            </div>
            <button id="start-scan-btn" class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">Начать сканирование</button>
            <div id="qr-result-container" class="hidden mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg w-full max-w-md text-center break-all"></div>
        </div>
    `;
}

export function init() {
    video = document.getElementById("qr-video");
    canvasElement = document.getElementById("qr-canvas");
    canvas = canvasElement.getContext("2d");
    resultContainer = document.getElementById("qr-result-container");
    statusMessage = document.getElementById("qr-status-message");

    // --- НОВЫЙ КОД ---
    // Инициализируем воркер
    qrWorker = new Worker('qr-worker.js');

    // Устанавливаем обработчик сообщений от воркера
    qrWorker.onmessage = function(event) {
        const code = event.data;
        handleQrCode(code); // Вызываем нашу функцию для обработки результата
    };

    document.getElementById("start-scan-btn").addEventListener('click', startScan);
}

export function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
    // --- ИЗМЕНЕНИЕ ---
    // Добавлена очистка холста, чтобы рамка не оставалась висеть
    if (canvas) {
        canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
    const startBtn = document.getElementById("start-scan-btn");
    if(startBtn) startBtn.textContent = "Начать сканирование";
}
