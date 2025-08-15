// js/apps/photoEditor.js

let canvas, ctx, originalImage, currentImage;
let fileInput, downloadBtn, rotateLeftBtn, rotateRightBtn, flipHBtn, flipVBtn;
let filterButtons;

function getHtml() {
    return `
        <div class="photo-editor-container">
            <div class="text-center">
                <label for="photo-editor-file-input" class="photo-editor-btn cursor-pointer">
                    Загрузить изображение
                </label>
                <input type="file" id="photo-editor-file-input" class="hidden" accept="image/*">
            </div>
            
            <canvas id="photo-editor-canvas" class="mx-auto"></canvas>
            
            <div id="photo-editor-tools-wrapper" class="hidden">
                <div id="photo-editor-controls" class="mb-4">
                    <button id="photo-editor-rotate-left-btn" class="photo-editor-btn">⟲ Поворот Л</button>
                    <button id="photo-editor-rotate-right-btn" class="photo-editor-btn">Поворот П ⟳</button>
                    <button id="photo-editor-flip-h-btn" class="photo-editor-btn"> Flip H ↔</button>
                    <button id="photo-editor-flip-v-btn" class="photo-editor-btn"> Flip V ↕</button>
                </div>
                
                <div id="photo-editor-filters">
                    <button class="photo-editor-btn filter-btn" data-filter="original">Оригинал</button>
                    <button class="photo-editor-btn filter-btn" data-filter="grayscale">Оттенки серого</button>
                    <button class="photo-editor-btn filter-btn" data-filter="sepia">Сепия</button>
                    <button class="photo-editor-btn filter-btn" data-filter="invert">Инверсия</button>
                </div>

                <div class="text-center mt-6">
                    <a href="#" id="photo-editor-download-btn" class="photo-editor-btn" download="edited-image.png">Скачать</a>
                </div>
            </div>
        </div>
    `;
}

function init() {
    canvas = document.getElementById('photo-editor-canvas');
    ctx = canvas.getContext('2d');
    fileInput = document.getElementById('photo-editor-file-input');
    downloadBtn = document.getElementById('photo-editor-download-btn');
    rotateLeftBtn = document.getElementById('photo-editor-rotate-left-btn');
    rotateRightBtn = document.getElementById('photo-editor-rotate-right-btn');
    flipHBtn = document.getElementById('photo-editor-flip-h-btn');
    flipVBtn = document.getElementById('photo-editor-flip-v-btn');
    filterButtons = document.querySelectorAll('.filter-btn');

    fileInput.addEventListener('change', handleImageUpload);
    downloadBtn.addEventListener('click', downloadImage);

    rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    rotateRightBtn.addEventListener('click', () => rotateImage(90));
    
    let scaleH = 1, scaleV = 1;
    flipHBtn.addEventListener('click', () => { scaleH *= -1; applyTransform(scaleH, scaleV); });
    flipVBtn.addEventListener('click', () => { scaleV *= -1; applyTransform(scaleH, scaleV); });

    filterButtons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        originalImage = new Image();
        originalImage.onload = () => {
            currentImage = originalImage;
            drawImage(currentImage);
            document.getElementById('photo-editor-tools-wrapper').classList.remove('hidden');
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function drawImage(image) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
}

function rotateImage(degrees) {
    const rad = degrees * Math.PI / 180;
    const newWidth = Math.abs(canvas.width * Math.cos(rad)) + Math.abs(canvas.height * Math.sin(rad));
    const newHeight = Math.abs(canvas.height * Math.cos(rad)) + Math.abs(canvas.width * Math.sin(rad));
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    
    tempCtx.translate(newWidth / 2, newHeight / 2);
    tempCtx.rotate(rad);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    updateCurrentImage();
}

function applyTransform(scaleH, scaleV) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    tempCtx.translate(canvas.width / 2, canvas.height / 2);
    tempCtx.scale(scaleH, scaleV);
    tempCtx.drawImage(currentImage, -canvas.width / 2, -canvas.height / 2);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
}

function applyFilter(filter) {
    drawImage(originalImage); // Reset to original before applying filter
    if (filter === 'original') {
        updateCurrentImage();
        return;
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (filter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
        } else if (filter === 'sepia') {
            data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
            data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
            data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
        } else if (filter === 'invert') {
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    updateCurrentImage();
}

function updateCurrentImage() {
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => { currentImage = img; };
}

function downloadImage() {
    downloadBtn.href = canvas.toDataURL('image/png');
}

function cleanup() {
    // Сброс переменных и удаление слушателей при необходимости
    originalImage = null;
    currentImage = null;
}

export { getHtml, init, cleanup };
