// js/apps/zipArchiver.js

let filesToZip = [];
// Переменная для хранения экземпляра ZIP-файла после распаковки
let unpackedZipInstance = null;

export function getHtml() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Секция создания архива -->
            <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-600">Создать ZIP-архив</h3>
                <div class="mb-4">
                    <label for="zip-file-input" class="w-full inline-block text-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Выберите файлы для архивации
                    </label>
                    <input type="file" id="zip-file-input" multiple class="hidden">
                </div>
                <div id="zip-selected-files" class="mb-4 text-sm space-y-2 min-h-[60px]">
                    <p class="text-gray-500 dark:text-gray-400">Файлы не выбраны.</p>
                </div>
                <button id="create-zip-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled>Создать и скачать .zip</button>
            </div>

            <!-- Секция распаковки архива -->
            <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-600">Распаковать ZIP-архив</h3>
                <div class="mb-4">
                     <label for="unzip-file-input" class="w-full inline-block text-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Выберите .zip файл для распаковки
                    </label>
                    <input type="file" id="unzip-file-input" accept=".zip" class="hidden">
                </div>
                <!-- ИЗМЕНЕНИЕ: Добавлен контейнер для заголовка и кнопки "Скачать всё" -->
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-lg font-semibold">Содержимое архива:</h4>
                    <button id="download-all-btn" class="hidden bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg transition-colors">Скачать всё</button>
                </div>
                <div id="unzip-output" class="text-sm space-y-2 min-h-[60px]">
                    <p class="text-gray-500 dark:text-gray-400">Выберите архив для просмотра содержимого.</p>
                </div>
            </div>
        </div>
        <div id="zip-status" class="mt-4 text-center font-medium"></div>
    `;
}

export function init() {
    const zipFileInput = document.getElementById('zip-file-input');
    const selectedFilesContainer = document.getElementById('zip-selected-files');
    const createZipBtn = document.getElementById('create-zip-btn');
    const unzipFileInput = document.getElementById('unzip-file-input');
    const unzipOutput = document.getElementById('unzip-output');
    const statusDiv = document.getElementById('zip-status');
    // ИЗМЕНЕНИЕ: Получаем новую кнопку
    const downloadAllBtn = document.getElementById('download-all-btn');

    if (typeof JSZip === 'undefined') {
        statusDiv.innerHTML = `<p class="text-red-500">Ошибка: Библиотека JSZip не загружена.</p>`;
        return;
    }

    // --- Логика создания ZIP ---
    zipFileInput.addEventListener('change', (e) => {
        filesToZip = Array.from(e.target.files);
        selectedFilesContainer.innerHTML = '';
        if (filesToZip.length > 0) {
            const list = document.createElement('ul');
            list.className = 'list-disc list-inside';
            filesToZip.forEach(file => {
                const li = document.createElement('li');
                li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                list.appendChild(li);
            });
            selectedFilesContainer.appendChild(list);
            createZipBtn.disabled = false;
        } else {
            selectedFilesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Файлы не выбраны.</p>';
            createZipBtn.disabled = true;
        }
    });

    createZipBtn.addEventListener('click', async () => {
        if (filesToZip.length === 0) return;
        
        statusDiv.textContent = 'Архивация...';
        createZipBtn.disabled = true;

        const zip = new JSZip();
        filesToZip.forEach(file => {
            zip.file(file.name, file);
        });

        try {
            const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `archive_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            statusDiv.textContent = 'Архив успешно создан!';
        } catch (err) {
            console.error(err);
            statusDiv.innerHTML = `<p class="text-red-500">Ошибка при создании архива.</p>`;
        } finally {
            createZipBtn.disabled = false;
        }
    });

    // --- Логика распаковки ZIP ---
    unzipFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        statusDiv.textContent = 'Чтение архива...';
        unzipOutput.innerHTML = '';
        // ИЗМЕНЕНИЕ: Скрываем кнопку при выборе нового файла
        downloadAllBtn.classList.add('hidden');
        unpackedZipInstance = null;
        
        try {
            const data = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(data);
            // ИЗМЕНЕНИЕ: Сохраняем экземпляр zip для дальнейшего использования
            unpackedZipInstance = zip;
            const list = document.createElement('div');
            list.className = 'space-y-2';
            
            let fileCount = 0;
            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir) {
                    fileCount++;
                    const fileElement = document.createElement('div');
                    fileElement.className = 'flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded';
                    fileElement.innerHTML = `
                        <span class="truncate pr-2">${zipEntry.name}</span>
                        <button data-filename="${zipEntry.name}" class="download-file-btn text-blue-500 hover:underline text-sm flex-shrink-0">Скачать</button>
                    `;
                    list.appendChild(fileElement);
                }
            });

            if (fileCount > 0) {
                 unzipOutput.appendChild(list);
                 // ИЗМЕНЕНИЕ: Показываем кнопку "Скачать всё"
                 downloadAllBtn.classList.remove('hidden');
            } else {
                unzipOutput.innerHTML = '<p class="text-gray-500 dark:text-gray-400">В архиве нет файлов.</p>';
            }
            statusDiv.textContent = `Архив успешно прочитан. Найдено файлов: ${fileCount}`;

            // Добавляем обработчики на кнопки скачивания
            unzipOutput.querySelectorAll('.download-file-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const filename = event.target.dataset.filename;
                    const fileToDownload = zip.file(filename);
                    if (fileToDownload) {
                        const content = await fileToDownload.async('blob');
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href);
                    }
                });
            });

        } catch (err) {
            console.error(err);
            unpackedZipInstance = null;
            statusDiv.innerHTML = `<p class="text-red-500">Не удалось прочитать ZIP-файл. Возможно, он поврежден.</p>`;
        }
    });

    // ИЗМЕНЕНИЕ: Добавляем обработчик для кнопки "Скачать всё"
    downloadAllBtn.addEventListener('click', async () => {
        if (!unpackedZipInstance) return;

        statusDiv.textContent = 'Подготовка файлов к скачиванию...';
        // Небольшая функция-задержка, чтобы браузер не блокировал множественные скачивания
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (const filename in unpackedZipInstance.files) {
            const zipEntry = unpackedZipInstance.files[filename];
            if (!zipEntry.dir) {
                const content = await zipEntry.async('blob');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = zipEntry.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                await delay(200); // Ожидание 200мс между скачиваниями
            }
        }
        statusDiv.textContent = 'Все файлы отправлены на загрузку.';
    });
}
