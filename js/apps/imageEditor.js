--- START OF FILE imageEditor.js ---

//9 js/apps/imageEditor.js

export function getHtml() {
    return `
        <style>
            /* Убираем стрелочки из input[type=number] */
            .editor-input { -moz-appearance: textfield; }
            .editor-input::-webkit-outer-spin-button,
            .editor-input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
        </style>
        <div class="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            
            <!-- 1. Область загрузки файла -->
            <div class="w-full text-center">
                <input type="file" id="image-editor-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml">
                <label for="image-editor-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение
                </label>
            </div>

            <!-- 2. Область предпросмотра (изначально скрыта) -->
            <div id="image-preview-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
                <img id="image-preview" class="max-w-full max-h-80 mx-auto rounded"/>
            </div>

            <!-- 3. Панель управления (изначально скрыта) -->
            <div id="controls-container" class="hidden w-full space-y-6">
                
                <!-- Настройки размера -->
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-semibold mb-3 text-lg">Изменить размер</h3>
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div>
                            <label for="width-input" class="font-medium">Ширина:</label>
                            <input type="number" id="width-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="height-input" class="font-medium">Высота:</label>
                            <input type="number" id="height-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div class="flex items-center pt-5">
                            <input type="checkbox" id="aspect-ratio-lock" class="h-4 w-4 rounded" checked>
                            <label for="aspect-ratio-lock" class="ml-2 text-sm">Сохранять пропорции</label>
                        </div>
                    </div>
                </div>

                <!-- Настройки формата -->
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-semibold mb-3 text-lg">Сохранить как...</h3>
                     <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <select id="format-select" class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                        </select>
                        <div id="quality-control" class="flex items-center gap-2">
                            <label for="quality-slider">Качество:</label>
                            <input type="range" id="quality-slider" min="10" max="100" value="100" class="w-32">
                            <span id="quality-value">100%</span>
                        </div>
                    </div>
                </div>

                <!-- Кнопка действия -->
                <button id="process-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Применить и скачать
                </button>
            </div>
        </div>
    `;
}

export function init() {
    const imageInput = document.getElementById('image-editor-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const controlsContainer = document.getElementById('controls-container');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const processBtn = document.getElementById('process-btn');

    let originalImage = null;
    let originalFileName = '';
    let originalWidth, originalHeight;

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        originalImage = new Image();
        originalFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();

        reader.onload = (event) => {
            originalImage.src = event.target.result;
            originalImage.onload = () => {
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                previewImage.src = event.target.result;
                previewContainer.classList.remove('hidden');
                controlsContainer.classList.remove('hidden');
            };
        };
        reader.readAsDataURL(file);
    });

    widthInput.addEventListener('input', () => {
        if (aspectRatioLock.checked && originalWidth > 0) {
            heightInput.value = Math.round((widthInput.value / originalWidth) * originalHeight);
        }
    });

    heightInput.addEventListener('input', () => {
        if (aspectRatioLock.checked && originalHeight > 0) {
            widthInput.value = Math.round((heightInput.value / originalHeight) * originalWidth);
        }
    });

    formatSelect.addEventListener('change', () => {
        qualityControl.style.display = formatSelect.value === 'png' ? 'none' : 'flex';
    });
    
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    processBtn.addEventListener('click', () => {
        const newWidth = parseInt(widthInput.value, 10);
        const newHeight = parseInt(heightInput.value, 10);
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value, 10) / 100;

        if (!newWidth || !newHeight || !originalImage.src || newWidth <= 0 || newHeight <= 0) {
            alert('Пожалуйста, выберите файл и укажите корректные размеры.');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        // Рисуем изображение с новыми размерами (изменение размера)
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

        // Конвертируем в нужный формат и качество
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality : undefined);

        // Создаем ссылку и инициируем скачивание
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `edited-${originalFileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

export function cleanup() {}
