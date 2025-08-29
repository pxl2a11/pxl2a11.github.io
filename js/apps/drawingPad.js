// js/apps/drawingPad.js

let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];

export function getHtml() {
    return `
        <div class="flex flex-col items-center gap-4">
            <!-- Панель инструментов -->
            <div class="w-full max-w-3xl p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-wrap items-center justify-center gap-4 shadow-md">
                <!-- Цвет -->
                <div class="flex items-center gap-2">
                    <label for="draw-color" class="text-sm font-medium">Цвет:</label>
                    <input type="color" id="draw-color" value="#000000" class="w-10 h-10 p-1 border rounded-md bg-white dark:bg-gray-700 cursor-pointer">
                </div>
                <!-- Толщина кисти -->
                <div class="flex items-center gap-2">
                    <label for="draw-width" class="text-sm font-medium">Толщина:</label>
                    <input type="range" id="draw-width" min="1" max="50" value="5" class="w-32 cursor-pointer">
                    <span id="draw-width-label" class="text-sm font-mono w-6 text-center">5</span>
                </div>
                <!-- Кнопки действий -->
                <div class="flex items-center gap-2">
                    <button id="draw-undo" class="draw-btn bg-yellow-500 hover:bg-yellow-600">Отменить</button>
                    <button id="draw-clear" class="draw-btn bg-red-500 hover:bg-red-600">Очистить</button>
                    <button id="draw-download" class="draw-btn bg-green-500 hover:bg-green-600">Скачать</button>
                </div>
            </div>

            <!-- Холст для рисования -->
            <canvas id="drawing-pad" class="bg-white rounded-lg shadow-lg cursor-crosshair border-2 border-gray-200 dark:border-gray-700"></canvas>
        </div>
        <style>
            .draw-btn { padding: 0.5rem 1rem; color: white; font-semibold; border-radius: 0.5rem; transition: background-color 0.2s; }
        </style>
    `;
}

// Сохранение состояния холста для функции "Отменить"
function saveHistory() {
    if (history.length > 20) { // Ограничиваем историю, чтобы не занимать много памяти
        history.shift();
    }
    history.push(canvas.toDataURL());
}

// Восстановление предыдущего состояния
function undoLast() {
    if (history.length > 1) {
        history.pop(); // Удаляем текущее состояние
        const lastStateUrl = history[history.length - 1]; // Берем предыдущее
        const img = new Image();
        img.src = lastStateUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    } else {
        // Если в истории только начальное состояние, просто очищаем
        clearCanvas();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // После очистки сохраняем пустое состояние как первое в истории
    history = [];
    saveHistory();
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    if (isDrawing) {
        saveHistory(); // Сохраняем состояние после завершения линии
    }
    isDrawing = false;
}


export function init() {
    canvas = document.getElementById('drawing-pad');
    ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('draw-color');
    const widthSlider = document.getElementById('draw-width');
    const widthLabel = document.getElementById('draw-width-label');
    const undoBtn = document.getElementById('draw-undo');
    const clearBtn = document.getElementById('draw-clear');
    const downloadBtn = document.getElementById('draw-download');

    // Установка размера холста
    const parent = canvas.parentElement;
    canvas.width = Math.min(parent.clientWidth, 800); // Ограничим ширину для производительности
    canvas.height = 500;

    // Настройки контекста рисования
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = widthSlider.value;
    
    // Сохраняем начальное (пустое) состояние
    history = [];
    saveHistory();

    // Слушатели событий
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    colorPicker.addEventListener('input', (e) => ctx.strokeStyle = e.target.value);
    widthSlider.addEventListener('input', (e) => {
        ctx.lineWidth = e.target.value;
        widthLabel.textContent = e.target.value;
    });

    clearBtn.addEventListener('click', clearCanvas);
    undoBtn.addEventListener('click', undoLast);

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

export function cleanup() {
    // В этом простом приложении специфическая очистка не требуется, 
    // так как все слушатели привязаны к элементам внутри getHtml
    // и будут удалены вместе с ними при переключении приложения.
    history = [];
}
