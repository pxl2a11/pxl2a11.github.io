//9 js/apps/imageEditor.js

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
            
            <div class="w-full text-center">
                <input type="file" id="image-editor-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" multiple>
                <label for="image-editor-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение(я)
                </label>
            </div>

            <div id="image-preview-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
                <img id="image-preview" class="max-w-full max-h-80 mx-auto rounded"/>
            </div>
            
            <div id="batch-list-container" class="hidden w-full space-y-4"></div>

            <div id="controls-container" class="hidden w-full space-y-6">
                
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

                <!-- НОВЫЙ БЛОК: Пакетное изменение размера -->
                <div id="batch-resize-controls" class="hidden p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-semibold mb-3 text-lg">Изменить размер для всех</h3>
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div>
                            <label for="batch-width-input" class="font-medium">Ширина:</label>
                            <input type="number" id="batch-width-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Авто">
                        </div>
                        <div>
                            <label for="batch-height-input" class="font-medium">Высота:</label>
                            <input type="number" id="batch-height-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Авто">
                        </div>
                        <button id="apply-to-all-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-5 sm:mt-0">
                            Применить
                        </button>
                    </div>
                </div>

                <div id="shared-format-controls" class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
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

                <button id="process-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Применить и скачать
                </button>
            </div>
        </div>
    `;
}

export function init() {
    // Получение всех элементов, включая новые для пакетного ресайза
    const imageInput = document.getElementById('image-editor-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const batchListContainer = document.getElementById('batch-list-container');
    const controlsContainer = document.getElementById('controls-container');
    const singleModeResizeControls = document.getElementById('single-mode-resize-controls');
    const sharedFormatControls = document.getElementById('shared-format-controls');
    const singleWidthInput = document.getElementById('width-input');
    const singleHeightInput = document.getElementById('height-input');
    const singleAspectRatioLock = document.getElementById('aspect-ratio-lock');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const processBtn = document.getElementById('process-btn');
    
    // Новые элементы
    const batchResizeControls = document.getElementById('batch-resize-controls');
    const batchWidthInput = document.getElementById('batch-width-input');
    const batchHeightInput = document.getElementById('batch-height-input');
    const applyToAllBtn = document.getElementById('apply-to-all-btn');

    let selectedFiles = [];
    let originalImage = null;
    let originalWidth, originalHeight;

    imageInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        resetUI();
        if (selectedFiles.length === 0) return;
        controlsContainer.classList.remove('hidden');
        sharedFormatControls.classList.remove('hidden');
        if (selectedFiles.length === 1) {
            setupSingleFileMode(selectedFiles[0]);
        } else {
            setupBatchMode(selectedFiles);
        }
    });

    function resetUI() {
        previewContainer.classList.add('hidden');
        batchListContainer.classList.add('hidden');
        controlsContainer.classList.add('hidden');
        singleModeResizeControls.classList.add('hidden');
        sharedFormatControls.classList.add('hidden');
        batchResizeControls.classList.add('hidden'); // Скрываем новый блок
        batchListContainer.innerHTML = '';
        originalImage = null;
    }

    function setupSingleFileMode(file) {
        singleModeResizeControls.classList.remove('hidden');
        processBtn.textContent = 'Применить и скачать';
        // ... остальная логика без изменений
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
        batchResizeControls.classList.remove('hidden'); // Показываем новый блок
        processBtn.textContent = `Обработать ${files.length} файла и скачать ZIP`;
        files.forEach((file, index) => {
            const listItem = createBatchListItem(file, index);
            batchListContainer.appendChild(listItem);
        });
    }

    function createBatchListItem(file, index) {
        // ... шаблон без изменений
        const fileId = `file-${index}`;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col sm:flex-row items-center gap-4 fade-in';
        itemDiv.id = fileId;
        const displayName = truncateFilename(file.name, 35);
        itemDiv.innerHTML = `
            <img id="img-${fileId}" class="w-20 h-20 object-cover rounded-md bg-gray-200 dark:bg-gray-600"/>
            <div class="flex-grow text-center sm:text-left min-w-0">
                <p class="font-semibold truncate" title="${file.name}">${displayName}</p>
                <p id="dims-${fileId}" class="text-sm text-gray-500 dark:text-gray-400">... x ...</p>
            </div>
            <div class="flex items-center justify-center gap-2">
                <input type="number" data-type="width" class="editor-input w-24 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Ширина">
                <span>x</span>
                <input type="number" data-type="height" class="editor-input w-24 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Высота">
                <input type="checkbox" id="lock-${fileId}" class="h-4 w-4 rounded ml-2" checked>
            </div>
        `;
        
        const imgElement = itemDiv.querySelector(`#img-${fileId}`);
        const dimsElement = itemDiv.querySelector(`#dims-${fileId}`);
        const widthInput = itemDiv.querySelector('input[data-type="width"]');
        const heightInput = itemDiv.querySelector('input[data-type="height"]');
        const aspectRatioLock = itemDiv.querySelector(`#lock-${fileId}`);

        const reader = new FileReader();
        reader.onload = (e) => {
            const tempImg = new Image();
            tempImg.src = e.target.result;
            tempImg.onload = () => {
                imgElement.src = e.target.result;
                const itemOriginalWidth = tempImg.width;
                const itemOriginalHeight = tempImg.height;

                // Сохраняем оригинальные размеры в data-атрибуты для будущего использования
                itemDiv.dataset.originalWidth = itemOriginalWidth;
                itemDiv.dataset.originalHeight = itemOriginalHeight;

                dimsElement.textContent = `${itemOriginalWidth} x ${itemOriginalHeight}`;
                widthInput.value = itemOriginalWidth;
                heightInput.value = itemOriginalHeight;
            };
        };
        reader.readAsDataURL(file);

        // Индивидуальные обработчики для полей ввода
        widthInput.addEventListener('input', () => {
            const originalW = parseInt(itemDiv.dataset.originalWidth, 10);
            if (aspectRatioLock.checked && originalW > 0) {
                const originalH = parseInt(itemDiv.dataset.originalHeight, 10);
                heightInput.value = Math.round((widthInput.value / originalW) * originalH);
            }
        });
        heightInput.addEventListener('input', () => {
            const originalH = parseInt(itemDiv.dataset.originalHeight, 10);
            if (aspectRatioLock.checked && originalH > 0) {
                const originalW = parseInt(itemDiv.dataset.originalWidth, 10);
                widthInput.value = Math.round((heightInput.value / originalH) * originalW);
            }
        });

        return itemDiv;
    }

    // НОВЫЙ ОБРАБОТЧИК для кнопки "Применить ко всем"
    applyToAllBtn.addEventListener('click', () => {
        const newWidth = parseInt(batchWidthInput.value, 10);
        const newHeight = parseInt(batchHeightInput.value, 10);

        if (!newWidth && !newHeight) {
            alert('Пожалуйста, введите ширину или высоту, чтобы применить ко всем файлам.');
            return;
        }

        const listItems = batchListContainer.children;
        for (const item of listItems) {
            const widthInput = item.querySelector('input[data-type="width"]');
            const heightInput = item.querySelector('input[data-type="height"]');
            const originalW = parseInt(item.dataset.originalWidth, 10);
            const originalH = parseInt(item.dataset.originalHeight, 10);

            if (!originalW || !originalH) continue; // Пропускаем, если размеры еще не загрузились

            // Логика расчета с сохранением пропорций
            if (newWidth && !newHeight) {
                widthInput.value = newWidth;
                heightInput.value = Math.round((newWidth / originalW) * originalH);
            } else if (!newWidth && newHeight) {
                heightInput.value = newHeight;
                widthInput.value = Math.round((newHeight / originalH) * originalW);
            } else {
                widthInput.value = newWidth;
                heightInput.value = newHeight;
            }
        }
    });
    
    // Остальные обработчики и функции без изменений
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
    formatSelect.addEventListener('change', () => {
        qualityControl.style.visibility = (formatSelect.value === 'png') ? 'hidden' : 'visible';
    });
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });
    processBtn.addEventListener('click', () => {
        if (selectedFiles.length === 1) {
            processSingleImage();
        } else if (selectedFiles.length > 1) {
            processBatchImages();
        } else {
            alert('Пожалуйста, выберите файлы.');
        }
    });

    function processSingleImage() {
        //... без изменений
        const newWidth = parseInt(singleWidthInput.value, 10);
        const newHeight = parseInt(singleHeightInput.value, 10);
        if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
            alert('Укажите корректные размеры.'); return;
        }
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value, 10) / 100;
        const fileName = selectedFiles[0].name.split('.').slice(0, -1).join('.');
        const dataUrl = resizeImageOnCanvas(originalImage, newWidth, newHeight, format, quality);
        downloadDataUrl(dataUrl, `edited-${fileName}.${format}`);
    }

    async function processBatchImages() {
        //... без изменений
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value, 10) / 100;
        const zip = new JSZip();
        processBtn.disabled = true;
        processBtn.textContent = 'Обработка...';
        const listItems = batchListContainer.children;
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const item = listItems[i];
            const widthInput = item.querySelector('input[data-type="width"]');
            const heightInput = item.querySelector('input[data-type="height"]');
            const newWidth = parseInt(widthInput.value, 10);
            const newHeight = parseInt(heightInput.value, 10);
            if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
                console.warn(`Пропущен файл ${file.name} из-за некорректных размеров.`);
                continue;
            }
            try {
                const dataUrl = await fileToDataUrl(file).then(createImage)
                    .then(img => resizeImageOnCanvas(img, newWidth, newHeight, format, quality));
                const fileName = file.name.split('.').slice(0, -1).join('.');
                const base64Data = dataUrl.split(',')[1];
                zip.file(`${fileName}.${format}`, base64Data, { base64: true });
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

    // Вспомогательные функции без изменений
    function truncateFilename(filename, maxLength) { /*...*/ if (filename.length <= maxLength) return filename; const dotIndex = filename.lastIndexOf('.'); if (dotIndex === -1) return filename.substring(0, maxLength - 3) + '...'; const name = filename.substring(0, dotIndex); const extension = filename.substring(dotIndex); const availableLength = maxLength - extension.length - 3; if (availableLength <= 1) return filename.substring(0, maxLength - extension.length - 3) + '...' + extension; const frontChars = Math.ceil(availableLength / 2); const backChars = Math.floor(availableLength / 2); const truncatedName = name.substring(0, frontChars) + '...' + name.substring(name.length - backChars); return truncatedName + extension; }
    function resizeImageOnCanvas(image, width, height, format, quality) { /*...*/ const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, width, height); return canvas.toDataURL(`image/${format}`, format !== 'png' ? quality : undefined); }
    function downloadDataUrl(dataUrl, filename) { /*...*/ const link = document.createElement('a'); link.href = dataUrl; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
    function fileToDataUrl(file) { /*...*/ return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = e => resolve(e.target.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
    function createImage(src) { /*...*/ return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
}

export function cleanup() {}
