// 19 js/apps/imageEditor.js

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
                <!-- ДОБАВЛЕН АТРИБУТ 'multiple' ДЛЯ ВЫБОРА НЕСКОЛЬКИХ ФАЙЛОВ -->
                <input type="file" id="image-editor-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" multiple>
                <label for="image-editor-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение (можно несколько)
                </label>
            </div>

            <!-- 2. Область предпросмотра (изменена для отображения статуса) -->
            <div id="image-preview-container" class="hidden w-full p-4 border-dashed border-2 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
                <!-- Убрали тег <img>, будем вставлять текст о количестве файлов -->
                <span id="files-info"></span>
            </div>

            <!-- 3. Панель управления (изначально скрыта) -->
            <div id="controls-container" class="hidden w-full space-y-6">
                
                <!-- Настройки размера (теперь применяются ко всем файлам) -->
                <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h3 class="font-semibold mb-3 text-lg">Изменить размер (для всех)</h3>
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
                     <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Оставьте поля пустыми, чтобы сохранить исходный размер.</p>
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
                            <input type="range" id="quality-slider" min="10" max="100" value="90" class="w-32">
                            <span id="quality-value">90%</span>
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
    // Получаем все элементы DOM
    const imageInput = document.getElementById('image-editor-input');
    const previewContainer = document.getElementById('image-preview-container');
    const filesInfo = document.getElementById('files-info');
    const controlsContainer = document.getElementById('controls-container');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const processBtn = document.getElementById('process-btn');

    let selectedFiles = []; // Массив для хранения выбранных файлов
    let lastQualityValue = 90;

    // Обработчик выбора файлов
    imageInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files); // Сохраняем все файлы в массив
        if (selectedFiles.length === 0) {
            previewContainer.classList.add('hidden');
            controlsContainer.classList.add('hidden');
            return;
        }

        filesInfo.textContent = `Выбрано файлов: ${selectedFiles.length}`;
        previewContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        // Сбрасываем значения ширины и высоты при выборе новых файлов
        widthInput.value = '';
        heightInput.value = '';
    });
    
    // Обработчики для полей ввода размеров больше не нужны,
    // так как пропорции будут вычисляться для каждого файла индивидуально.

    // Управление видимостью слайдера качества
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

    // --- ОСНОВНАЯ ЛОГИКА ПАКЕТНОЙ ОБРАБОТКИ ---
    
    // Функция для обработки ОДНОГО файла. Возвращает Promise.
    function processFile(file, options) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let newWidth = options.width;
                    let newHeight = options.height;

                    // Логика сохранения пропорций
                    if (newWidth && !newHeight) {
                        newHeight = Math.round((newWidth / img.width) * img.height);
                    } else if (!newWidth && newHeight) {
                        newWidth = Math.round((newHeight / img.height) * img.width);
                    } else if (!newWidth && !newHeight) {
                        newWidth = img.width;
                        newHeight = img.height;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    const mimeType = `image/${options.format}`;
                    const dataUrl = canvas.toDataURL(mimeType, options.format !== 'png' ? options.quality : undefined);
                    const originalFileName = file.name.split('.').slice(0, -1).join('.');
                    
                    resolve({
                        dataUrl: dataUrl,
                        fileName: `edited-${originalFileName}.${options.format}`
                    });
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // Обработчик клика на главную кнопку
    processBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            alert('Пожалуйста, выберите файлы для обработки.');
            return;
        }

        // Собираем опции обработки из UI
        const options = {
            width: parseInt(widthInput.value, 10) || null,
            height: parseInt(heightInput.value, 10) || null,
            format: formatSelect.value,
            quality: parseInt(lastQualityValue, 10) / 100
        };

        // Блокируем кнопку на время обработки
        processBtn.disabled = true;
        processBtn.textContent = 'Обработка...';

        try {
            // Создаем массив промисов, по одному для каждого файла
            const processingPromises = selectedFiles.map(file => processFile(file, options));
            
            // Ждем завершения обработки ВСЕХ файлов
            const processedFiles = await Promise.all(processingPromises);

            // Запускаем скачивание файлов по очереди
            processedFiles.forEach((fileData, index) => {
                // Задержка между скачиваниями для стабильности
                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = fileData.dataUrl;
                    link.download = fileData.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, index * 200); // 200 мс задержки между файлами
            });

        } catch (error) {
            console.error("Ошибка при обработке файлов:", error);
            alert("Произошла ошибка при обработке одного из файлов. Проверьте консоль для деталей.");
        } finally {
            // Возвращаем кнопку в исходное состояние
            processBtn.disabled = false;
            processBtn.textContent = 'Применить и скачать';
        }
    });
}

export function cleanup() {}
