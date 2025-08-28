// js/apps/drawingPad.js

let canvas, ctx, isDrawing, brushWidth, brushColor, currentMode;

export function getHtml() {
    return `
        <div class="flex flex-col items-center gap-4">
            <!-- Toolbar -->
            <div class="w-full max-w-3xl p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-wrap items-center justify-center gap-4 shadow-md">
                <!-- Color Picker -->
                <div class="flex items-center gap-2">
                    <label for="brush-color" class="text-sm font-medium">Цвет:</label>
                    <input type="color" id="brush-color" value="#000000" class="w-10 h-10 p-1 border-0 rounded-md cursor-pointer bg-white dark:bg-gray-700">
                </div>
                <!-- Brush Size -->
                <div class="flex items-center gap-2">
                    <label for="brush-width" class="text-sm font-medium">Размер:</label>
                    <input type="range" id="brush-width" min="1" max="50" value="5" class="w-24 sm:w-32 cursor-pointer">
                    <span id="brush-width-label" class="text-sm font-mono w-6 text-center">5</span>
                </div>
                <!-- Tools -->
                <div class="flex items-center gap-2">
                     <button id="pen-tool" class="tool-btn p-2 rounded-md bg-blue-200 dark:bg-blue-700" title="Кисть">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.196 5.232z"></path></svg>
                    </button>
                     <button id="eraser-tool" class="tool-btn p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="Ластик">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <!-- Actions -->
                <div class="flex items-center gap-2">
                    <button id="clear-canvas-btn" class="action-btn px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">Очистить</button>
                    <a id="save-canvas-btn" class="action-btn px-4 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors" download="drawing.png">Сохранить</a>
                </div>
            </div>
            <!-- Canvas -->
            <canvas id="drawing-canvas" class="bg-white dark:bg-gray-900 rounded-lg shadow-lg cursor-crosshair"></canvas>
        </div>
    `;
}

export function init() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');
    isDrawing = false;
    brushWidth = 5;
    brushColor = '#000000';
    currentMode = 'pen'; // 'pen' or 'eraser'

    // Set initial canvas size
    const container = canvas.parentElement;
    canvas.width = Math.min(container.clientWidth - 10, 800);
    canvas.height = Math.min(window.innerHeight * 0.6, 600);
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111827' : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    const colorPicker = document.getElementById('brush-color');
    const widthSlider = document.getElementById('brush-width');
    const widthLabel = document.getElementById('brush-width-label');
    const penTool = document.getElementById('pen-tool');
    const eraserTool = document.getElementById('eraser-tool');
    const clearBtn = document.getElementById('clear-canvas-btn');
    const saveBtn = document.getElementById('save-canvas-btn');

    function getPosition(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        if (event.touches) {
            return {
                x: (event.touches[0].clientX - rect.left) * scaleX,
                y: (event.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        ctx.lineWidth = brushWidth;
        ctx.lineCap = 'round';

        if (currentMode === 'pen') {
            ctx.strokeStyle = brushColor;
            ctx.globalCompositeOperation = 'source-over';
        } else if (currentMode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        }

        const { x, y } = getPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw, { passive: false });

    colorPicker.addEventListener('input', (e) => brushColor = e.target.value);
    widthSlider.addEventListener('input', (e) => {
        brushWidth = e.target.value;
        widthLabel.textContent = brushWidth;
    });

    penTool.addEventListener('click', () => {
        currentMode = 'pen';
        penTool.classList.add('bg-blue-200', 'dark:bg-blue-700');
        eraserTool.classList.remove('bg-blue-200', 'dark:bg-blue-700');
    });

    eraserTool.addEventListener('click', () => {
        currentMode = 'eraser';
        eraserTool.classList.add('bg-blue-200', 'dark:bg-blue-700');
        penTool.classList.remove('bg-blue-200', 'dark:bg-blue-700');
    });

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111827' : '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    saveBtn.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        saveBtn.href = dataUrl;
    });
}

export function cleanup() {
    // Canvas and its context are garbage collected automatically.
    // Event listeners are removed when the app content is cleared by the router.
}
