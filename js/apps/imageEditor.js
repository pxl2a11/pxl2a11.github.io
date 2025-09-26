//35 js/apps/imageEditor.js

export function getHtml() {
    return `
        <style>
            .editor-input { -moz-appearance: textfield; }
            .editor-input::-webkit-outer-spin-button,
            .editor-input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            .fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        <div class="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            
            <!-- 1. Область загрузки файла -->
            <div class="w-full text-center">
                <input type="file" id="image-editor-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" multiple>
                <label for="image-editor-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение(я)
                </label>
            </div>

            <!-- 2. Контейнер для предпросмотра (одиночный режим) -->
            <div id="image-preview-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
                <img id="image-preview" class="max-w-full max-h-80 mx-auto rounded"/>
            </div>
            
            <!-- 3. Контейнер для списка файлов (пакетный режим) -->
            <div id="batch-list-container" class="hidden w-full space-y-4">
                <!-- Сюда будут динамически добавляться файлы -->
            </div>

            <!-- 4. Панель управления -->
            <div id="controls-container" class="hidden w-full space-y-6">
                
                <!-- Настройки размера (только для одиночного режима) -->
                <div id="single-mode-resize-controls" class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
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

                <!-- Общие настройки формата (только для одиночного режима) -->
                <div id="global-format-controls" class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
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
    // Получение всех элементов DOM
    const imageInput = document.getElementById('image-editor-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const batchListContainer = document.getElementById('batch-list-container');
    const controlsContainer = document.getElementById('controls-container');
    const singleModeResizeControls = document.getElementById('single-mode-resize-controls');
    const globalFormatControls = document.getElementById('global-format-controls');
    
    const singleWidthInput = document.getElementById('width-input');
    const singleHeightInput = document.getElementById('height-input');
    const singleAspectRatioLock = document.getElementById('aspect-ratio-lock');
    
    const globalFormatSelect = document.getElementById('format-select');
    const globalQualityControl = document.getElementById('quality-control');
    const globalQualitySlider = document.getElementById('quality-slider');
    const globalQualityValue = document.getElementById('quality-value');
    
    const processBtn = document.getElementById('process-btn');

    let selectedFiles = [];
    let originalImage = null;
    let originalWidth, originalHeight;

    // --- ОСНОВНОЙ ОБРАБОТЧИК ЗАГРУЗКИ ФАЙЛОВ ---
    imageInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        resetUI();

        if (selectedFiles.length === 0) return;

        controlsContainer.classList.remove('hidden');

        if (selectedFiles.length === 1) {
            setupSingleFileMode(selectedFiles[0]);
        } else {
            setupBatchMode(selectedFiles);
        }
    });

    // --- ФУНКЦИИ НАСТРОЙКИ ИНТЕРФЕЙСА ---

    function resetUI() {
        previewContainer.classList.add('hidden');
        batchListContainer.classList.add('hidden');
        controlsContainer.classList.add('hidden');
        singleModeResizeControls.classList.add('hidden');
        globalFormatControls.classList.add('hidden');
        batchListContainer.innerHTML = '';
        originalImage = null;
    }

    function setupSingleFileMode(file) {
        singleModeResizeControls.classList.remove('hidden');
        globalFormatControls.classList.remove('hidden');
        processBtn.textContent = 'Применить и скачать';

        originalImage = new Image();
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.src = event.target.result;
            originalImage.onload = () => {
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                singleWidthInput.value = originalWidth;
                singleHeightInput.value = originalHeight;
                previewImage.src = event.target.result;
                previewContainer.classList.remove('hidden');
            };
        };
        reader.readAsDataURL(file);
    }

    function setupBatchMode(files) {
        batchListContainer.classList.remove('hidden');
        processBtn.textContent = `Обработать ${files.length} файла и скачать ZIP`;
        
        files.forEach((file, index) => {
            const listItem = createBatchListItem(file, index);
            batchListContainer.appendChild(listItem);
        });
    }

    // --- СОЗДАНИЕ ЭЛЕМЕНТА СПИСКА ДЛЯ ПАКЕТНОЙ ОБРАБОТКИ ---

    function createBatchListItem(file, index) {
        const fileId = `file-${index}`;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col gap-4 fade-in';
        itemDiv.id = fileId;

        let itemOriginalWidth, itemOriginalHeight;

        itemDiv.innerHTML = `
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full">
                <img id="img-${fileId}" class="w-20 h-20 object-cover rounded-md bg-gray-200 dark:bg-gray-600"/>
                <div class="flex-grow text-center sm:text-left">
                    <p class="font-semibold truncate" title="${file.name}">${file.name}</p>
                    <p id="dims-${fileId}" class="text-sm text-gray-500 dark:text-gray-400">... x ...</p>
                </div>
                <div class="flex items-center justify-center gap-2">
                    <input type="number" data-type="width" class="editor-input w-24 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Ширина">
                    <span>x</span>
                    <input type="number" data-type="height" class="editor-input w-24 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Высота">
                    <input type="checkbox" id="lock-${fileId}" class="h-4 w-4 rounded ml-2" checked>
                </div>
            </div>
            <hr class="w-full border-gray-200 dark:border-gray-600">
            <div class="flex flex-wrap items-center justify-center gap-4 w-full">
                <select data-type="format" class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                </select>
                <div data-type="quality-control" class="flex items-center gap-2">
                    <label>Качество:</label>
                    <input type="range" min="10" max="100" value="100" class="w-32">
                    <span class="font-mono text-sm w-10">100%</span>
                </div>
            </div>
        `;
        
        // --- Получение элементов и добавление логики для этого конкретного элемента ---
        const imgElement = itemDiv.querySelector(`#img-${fileId}`);
        const dimsElement = itemDiv.querySelector(`#dims-${fileId}`);
        const widthInput = itemDiv.querySelector('input[data-type="width"]');
        const heightInput = itemDiv.querySelector('input[data-type="height"]');
        const aspectRatioLock = itemDiv.querySelector(`#lock-${fileId}`);
        const formatSelect = itemDiv.querySelector('select[data-type="format"]');
        const qualityControl = itemDiv.querySelector('div[data-type="quality-control"]');
        const qualitySlider = qualityControl.querySelector('input[type="range"]');
        const qualityValue = qualityControl.querySelector('span');

        const reader = new FileReader();
        reader.onload = (e) => {
            const tempImg = new Image();
            tempImg.src = e.target.result;
            tempImg.onload = () => {
                imgElement.src = e.target.result; // Показываем превью только после загрузки
                itemOriginalWidth = tempImg.width;
                itemOriginalHeight = tempImg.height;
                dimsElement.textContent = `${itemOriginalWidth} x ${itemOriginalHeight}`;
                widthInput.value = itemOriginalWidth;
                heightInput.value = itemOriginalHeight;
            };
        };
        reader.readAsDataURL(file);

        // Индивидуальные обработчики
        widthInput.addEventListener('input', () => {
            if (aspectRatioLock.checked && itemOriginalWidth > 0) {
                heightInput.value = Math.round((widthInput.value / itemOriginalWidth) * itemOriginalHeight);
            }
        });
        heightInput.addEventListener('input', () => {
            if (aspectRatioLock.checked && itemOriginalHeight > 0) {
                widthInput.value = Math.round((heightInput.value / itemOriginalHeight) * itemOriginalWidth);
            }
        });
        formatSelect.addEventListener('change', () => {
            qualityControl.style.visibility = (formatSelect.value === 'png') ? 'hidden' : 'visible';
        });
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${qualitySlider.value}%`;
        });

        return itemDiv;
    }

    // --- ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (в основном для одиночного режима) ---

    singleWidthInput.addEventListener('input', () => {
        if (singleAspectRatioLock.checked && originalImage && originalWidth > 0) {
            singleHeightInput.value = Math.round((singleWidthInput.value / originalWidth) * originalHeight);
        }
    });
    singleHeightInput.addEventListener('input', () => {
        if (singleAspectRatioLock.checked && originalImage && originalHeight > 0) {
            singleWidthInput.value = Math.round((singleHeightInput.value / originalHeight) * originalWidth);
        }
    });
    globalFormatSelect.addEventListener('change', () => {
        globalQualityControl.style.visibility = (globalFormatSelect.value === 'png') ? 'hidden' : 'visible';
    });
    globalQualitySlider.addEventListener('input', () => {
        globalQualityValue.textContent = `${globalQualitySlider.value}%`;
    });

    // --- ЛОГИКА НАЖАТИЯ НА ГЛАВНУЮ КНОПКУ ---

    processBtn.addEventListener('click', () => {
        if (selectedFiles.length === 1) {
            processSingleImage();
        } else if (selectedFiles.length > 1) {
            processBatchImages();
        } else {
            alert('Пожалуйста, выберите файлы.');
        }
    });

    // --- ФУНКЦИИ ОБРАБОТКИ ИЗОБРАЖЕНИЙ ---

    function processSingleImage() {
        const newWidth = parseInt(singleWidthInput.value, 10);
        const newHeight = parseInt(singleHeightInput.value, 10);
        if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
            alert('Укажите корректные размеры.'); return;
        }
        const format = globalFormatSelect.value;
        const quality = parseInt(globalQualitySlider.value, 10) / 100;
        const fileName = selectedFiles[0].name.split('.').slice(0, -1).join('.');
        const dataUrl = resizeImageOnCanvas(originalImage, newWidth, newHeight, format, quality);
        downloadDataUrl(dataUrl, `edited-${fileName}.${format}`);
    }

    async function processBatchImages() {
        const zip = new JSZip();
        processBtn.disabled = true;
        processBtn.textContent = 'Обработка...';

        const listItems = batchListContainer.children;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const item = listItems[i];
            
            // Получаем значения из индивидуальных контролов
            const widthInput = item.querySelector('input[data-type="width"]');
            const heightInput = item.querySelector('input[data-type="height"]');
            const formatSelect = item.querySelector('select[data-type="format"]');
            const qualitySlider = item.querySelector('div[data-type="quality-control"] input[type="range"]');
            
            const newWidth = parseInt(widthInput.value, 10);
            const newHeight = parseInt(heightInput.value, 10);
            const format = formatSelect.value;
            const quality = parseInt(qualitySlider.value, 10) / 100;

            if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
                console.warn(`Пропущен файл ${file.name} из-за некорректных размеров.`); continue;
            }

            try {
                const dataUrl = await fileToDataUrl(file).then(createImage)
                    .then(img => resizeImageOnCanvas(img, newWidth, newHeight, format, quality));
                
                const fileName = file.name.split('.').slice(0, -1).join('.');
                const base64Data = dataUrl.split(',')[1];
                zip.file(`edited-${fileName}.${format}`, base64Data, { base64: true });
            } catch (error) {
                console.error(`Ошибка обработки файла ${file.name}:`, error);
            }
        }
        
        const zipContent = await zip.generateAsync({ type: "blob" });
        downloadDataUrl(URL.createObjectURL(zipContent), "edited-images.zip");
        URL.revokeObjectURL(zipContent);
        
        processBtn.disabled = false;
        processBtn.textContent = `Обработать ${selectedFiles.length} файла и скачать ZIP`;
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    function resizeImageOnCanvas(image, width, height, format, quality) {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        return canvas.toDataURL(`image/${format}`, format !== 'png' ? quality : undefined);
    }
    
    function downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl; link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function createImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
}

export function cleanup() {}
