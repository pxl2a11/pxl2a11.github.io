// 10 js/apps/imageEditor.js

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
            /* Стили для списка файлов */
            .file-list-item {
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 6px;
                transition: background-color 0.2s;
                border: 1px solid transparent;
                margin-bottom: 4px;
            }
            .file-list-item:hover {
                background-color: #e9e9e9;
            }
            .dark .file-list-item:hover {
                background-color: #3a3a3a;
            }
            .file-list-item.active {
                font-weight: bold;
                background-color: #dbeafe; /* Tailwind's blue-100 */
                border-color: #93c5fd; /* Tailwind's blue-300 */
            }
            .dark .file-list-item.active {
                background-color: #1e3a8a; /* Tailwind's blue-900 */
                border-color: #3b82f6; /* Tailwind's blue-500 */
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

            <!-- 2. Область предпросмотра и списка файлов -->
            <div id="image-preview-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="flex flex-col md:flex-row gap-4">
                    <!-- Список файлов -->
                    <div id="file-list-wrapper" class="w-full md:w-1/3">
                         <h4 class="font-semibold mb-2 text-md text-center">Загруженные файлы:</h4>
                         <div id="file-list" class="max-h-80 overflow-y-auto pr-2"></div>
                    </div>
                    <!-- Превью изображения -->
                    <div class="w-full md:w-2/3 flex justify-center items-center">
                        <img id="image-preview" class="max-w-full max-h-80 mx-auto rounded"/>
                    </div>
                </div>
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
                    Применить и скачать все
                </button>
                <div id="processing-status" class="text-center font-medium hidden"></div>
            </div>
        </div>
    `;
}

export function init() {
    const imageInput = document.getElementById('image-editor-input');
    const previewContainer = document.getElementById('image-preview-container');
    const fileListDisplay = document.getElementById('file-list');
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
    const processingStatus = document.getElementById('processing-status');

    let originalWidth, originalHeight;
    let lastQualityValue = 100;
    let filesData = []; // { file, name, dataUrl, width, height }
    let selectedIndex = -1;

    // --- Функция обновления списка файлов ---
    function updateFileList() {
        fileListDisplay.innerHTML = ''; // Очищаем список
        filesData.forEach((data, index) => {
            const item = document.createElement('div');
            item.textContent = data.name;
            item.classList.add('file-list-item');
            item.dataset.index = index;
            if (index === selectedIndex) {
                item.classList.add('active');
            }
            fileListDisplay.appendChild(item);
        });
    }

    // --- Функция выбора изображения для редактирования ---
    function selectImage(index) {
        if (index < 0 || index >= filesData.length) return;

        selectedIndex = index;
        const data = filesData[index];
        
        previewImage.src = data.dataUrl;
        originalWidth = data.width;
        originalHeight = data.height;
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        
        updateFileList(); // Перерисовываем список для подсветки активного элемента
    }
    
    // --- Обработчик клика по списку файлов ---
    fileListDisplay.addEventListener('click', (e) => {
        if (e.target && e.target.matches('.file-list-item')) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index)) {
                selectImage(index);
            }
        }
    });

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        filesData = []; // Сбрасываем предыдущий список
        let loadedCount = 0;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    filesData[index] = {
                        file: file,
                        name: file.name,
                        dataUrl: event.target.result,
                        width: img.width,
                        height: img.height,
                    };

                    loadedCount++;
                    if (loadedCount === files.length) {
                        // Показываем все, когда все файлы загружены и обработаны
                        previewContainer.classList.remove('hidden');
                        controlsContainer.classList.remove('hidden');
                        selectImage(0); // Выбираем первое изображение по умолчанию
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
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
        const newWidth = parseInt(widthInput.value, 10);
        const newHeight = parseInt(heightInput.value, 10);
        const format = formatSelect.value;
        const quality = parseInt(lastQualityValue, 10) / 100;

        if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
            alert('Пожалуйста, укажите корректные размеры.');
            return;
        }

        if (filesData.length === 0) {
            alert('Пожалуйста, выберите файлы для обработки.');
            return;
        }
        
        processingStatus.classList.remove('hidden');
        processBtn.disabled = true;
        processBtn.textContent = 'Обработка...';

        // Применяем текущие настройки ко всем загруженным изображениям
        for (let i = 0; i < filesData.length; i++) {
            const data = filesData[i];
            processingStatus.textContent = `Обработка ${i + 1} из ${filesData.length}: ${data.name}`;
            
            const image = new Image();
            const fileName = data.name.split('.').slice(0, -1).join('.');
            
            await new Promise(resolve => {
                image.src = data.dataUrl;
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    
                    // Для каждого изображения сохраняем его собственные пропорции
                    let processWidth = newWidth;
                    let processHeight = newHeight;
                    if (aspectRatioLock.checked) {
                        processWidth = Math.round((newHeight / image.height) * image.width);
                        // Если мы хотим, чтобы все изображения имели ОДИНАКОВУЮ ширину или высоту,
                        // этот блок нужно изменить. Текущая логика сохраняет пропорции каждого файла
                        // относительно новых размеров, введенных для активного изображения.
                        // Для более простого и предсказуемого поведения, применим размеры как есть
                        processWidth = newWidth;
                        processHeight = newHeight;
                    }
                    
                    canvas.width = processWidth;
                    canvas.height = processHeight;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.drawImage(image, 0, 0, processWidth, processHeight);

                    const mimeType = `image/${format}`;
                    const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality : undefined);

                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `edited-${fileName}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    resolve();
                };
            });
        }
        
        processingStatus.textContent = 'Обработка завершена!';
        setTimeout(() => {
             processingStatus.classList.add('hidden');
        }, 3000);
        processBtn.disabled = false;
        processBtn.textContent = 'Применить и скачать все';
    });
}

export function cleanup() {}
