//23 js/apps/imageEditor.js

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
                <input type="file" id="image-editor-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" multiple>
                <label for="image-editor-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображения
                </label>
            </div>

            <!-- 2. Область информации о файлах (изначально скрыта) -->
            <div id="file-info-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
                <span id="file-count"></span>
            </div>

            <!-- 3. Панель управления (изначально скрыта) -->
            <div id="controls-container" class="hidden w-full space-y-6">
                
                <!-- Настройки размера -->
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-semibold mb-3 text-lg">Изменить размер</h3>
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div>
                            <label for="width-input" class="font-medium">Ширина:</label>
                            <input type="number" id="width-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Авто">
                        </div>
                        <div>
                            <label for="height-input" class="font-medium">Высота:</label>
                            <input type="number" id="height-input" class="editor-input w-28 p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Авто">
                        </div>
                        <div class="flex items-center pt-5">
                            <input type="checkbox" id="aspect-ratio-lock" class="h-4 w-4 rounded" checked disabled>
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
                    Обработать и скачать ZIP
                </button>
            </div>
        </div>
    `;
}

export function init() {
    const imageInput = document.getElementById('image-editor-input');
    const fileInfoContainer = document.getElementById('file-info-container');
    const fileCount = document.getElementById('file-count');
    const controlsContainer = document.getElementById('controls-container');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const processBtn = document.getElementById('process-btn');

    let selectedFiles = [];
    let lastQualityValue = 100;

    imageInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) {
            fileInfoContainer.classList.add('hidden');
            controlsContainer.classList.add('hidden');
            return;
        }

        fileCount.textContent = `Выбрано файлов: ${selectedFiles.length}`;
        fileInfoContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        
        // В пакетном режиме мы не можем знать оригинальные размеры,
        // поэтому блокируем сохранение пропорций и ожидаем ввода пользователя.
        // Пользователь должен будет ввести хотя бы одно из полей: ширину или высоту.
        widthInput.value = '';
        heightInput.value = '';
        aspectRatioLock.checked = false; // Отключаем, т.к. нет эталонного изображения
    });

    // Убираем логику авто-изменения размеров, т.к. нет одного "оригинального" изображения
    widthInput.addEventListener('input', () => {
        if (!heightInput.value) aspectRatioLock.checked = false;
    });

    heightInput.addEventListener('input', () => {
         if (!widthInput.value) aspectRatioLock.checked = false;
    });

    formatSelect.addEventListener('change', () => {
        if (formatSelect.value === 'png') {
            qualityControl.style.visibility = 'hidden';
        } else {
            qualitySlider.value = lastQualityValue;
            qualityValue.textContent = `${lastQualityValue}%`;
            qualityControl.style.visibility = 'visible';
        }
    });
    
    qualitySlider.addEventListener('input', () => {
        lastQualityValue = qualitySlider.value;
        qualityValue.textContent = `${lastQualityValue}%`;
    });

    processBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            alert('Пожалуйста, выберите файлы для обработки.');
            return;
        }

        const newWidth = parseInt(widthInput.value, 10);
        const newHeight = parseInt(heightInput.value, 10);
        const format = formatSelect.value;
        const quality = parseInt(lastQualityValue, 10) / 100;

        if (!newWidth && !newHeight) {
            alert('Пожалуйста, укажите желаемую ширину или высоту.');
            return;
        }

        // --- НАЧАЛО БЛОКА ПАКЕТНОЙ ОБРАБОТКИ ---
        
        processBtn.disabled = true;
        processBtn.textContent = 'Обработка...';

        const zip = new JSZip();

        for (const file of selectedFiles) {
            try {
                const processedFile = await processImage(file, newWidth, newHeight, format, quality);
                const originalFileName = file.name.split('.').slice(0, -1).join('.');
                // Удаляем префикс dataURL, чтобы JSZip корректно работал с base64
                const base64Data = processedFile.split(',')[1];
                zip.file(`edited-${originalFileName}.${format}`, base64Data, { base64: true });
            } catch (error) {
                console.error(`Не удалось обработать файл ${file.name}:`, error);
            }
        }

        zip.generateAsync({ type: "blob" }).then((content) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `edited-images.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            processBtn.disabled = false;
            processBtn.textContent = 'Обработать и скачать ZIP';
        });

        // --- КОНЕЦ БЛОКА ПАКЕТНОЙ ОБРАБОТКИ ---
    });

    function processImage(file, newWidth, newHeight, format, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let finalWidth = newWidth;
                    let finalHeight = newHeight;

                    // Если одно из полей не заполнено, вычисляем его на основе пропорций
                    if (!finalWidth) {
                        finalWidth = Math.round((newHeight / img.height) * img.width);
                    } else if (!finalHeight) {
                        finalHeight = Math.round((newWidth / img.width) * img.height);
                    }
                    
                    if (finalWidth <= 0 || finalHeight <= 0) {
                        return reject(new Error('Некорректные размеры для обработки.'));
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = finalWidth;
                    canvas.height = finalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

                    const mimeType = `image/${format}`;
                    const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality : undefined);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

export function cleanup() {}
