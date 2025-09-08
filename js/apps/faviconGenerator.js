//44 js/apps/faviconGenerator.js

let sourceImage = null;

export function getHtml() {
    return `
        <div class="space-y-6 max-w-xl mx-auto">
            <div class="text-center">
                <input type="file" id="favicon-input" class="hidden" accept="image/png, image/jpeg, image/svg+xml">
                <label for="favicon-input" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    Выберите изображение (PNG, JPG, SVG)
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Рекомендуется квадратное изображение не менее 512x512px.</p>
            </div>

            <div id="favicon-preview-container" class="hidden text-center">
                <h3 class="font-semibold mb-2\">Предпросмотр:</h3>
                <img id="favicon-preview" class="max-w-xs max-h-48 mx-auto rounded-lg border-2 p-2 bg-gray-100 dark:bg-gray-700">
            </div>

            <div id="favicon-result-container" class="hidden space-y-4">
                 <!-- Блок выбора формата -->
                 <div class="pt-4 border-t dark:border-gray-600">
                    <h3 class="font-semibold mb-3 text-center">Выберите формат для скачивания:</h3>
                    <div class="flex justify-center flex-wrap gap-x-6 gap-y-2">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="favicon-format" value="all" class="h-4 w-4" checked>
                            <span>PNG + ICO (.zip)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="favicon-format" value="png" class="h-4 w-4">
                            <span>Только PNG (.zip)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="favicon-format" value="ico" class="h-4 w-4">
                            <span>Только ICO</span>
                        </label>
                    </div>
                 </div>

                 <button id="favicon-download-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Скачать Favicon
                </button>
                 <div id="favicon-grid" class="grid grid-cols-3 sm:grid-cols-5 gap-4"></div>
            </div>
             <div id="favicon-status" class="text-center font-medium h-5"></div>
        </div>
    `;
}

export function init() {
    const input = document.getElementById('favicon-input');
    const previewContainer = document.getElementById('favicon-preview-container');
    const previewImg = document.getElementById('favicon-preview');
    const resultContainer = document.getElementById('favicon-result-container');
    const grid = document.getElementById('favicon-grid');
    const downloadBtn = document.getElementById('favicon-download-btn');
    const statusDiv = document.getElementById('favicon-status');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            sourceImage = new Image();
            sourceImage.onload = () => {
                previewImg.src = event.target.result;
                previewContainer.classList.remove('hidden');
                resultContainer.classList.remove('hidden');
                generateIconPreviews();
            };
            sourceImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const PREVIEW_SIZES = [16, 32, 48, 180, 192, 512];

    async function generateIconPreviews() {
        if (!sourceImage) return;
        grid.innerHTML = '';
        statusDiv.textContent = '';

        for (const size of PREVIEW_SIZES) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImage, 0, 0, size, size);

            const container = document.createElement('div');
            container.className = 'text-center';
            container.innerHTML = `<img src="${canvas.toDataURL('image/png')}" class="w-full h-auto border rounded-md"><p class="text-xs mt-1">${size}x${size}</p>`;
            grid.appendChild(container);
        }
    }

    // Вспомогательная функция для скачивания Blob
    function downloadBlob(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
    
    // Новая функция для создания .ico файла
    async function createIcoBlob() {
        const ICO_SIZES = [16, 32, 48];
        const images = [];

        for (const size of ICO_SIZES) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImage, 0, 0, size, size);
            const dataUrl = canvas.toDataURL('image/png');
            const response = await fetch(dataUrl);
            const buffer = await response.arrayBuffer();
            images.push({ width: size, height: size, buffer });
        }

        const headerSize = 6;
        const dirEntrySize = 16;
        const totalDirSize = dirEntrySize * images.length;
        let totalFileSize = headerSize + totalDirSize;
        images.forEach(img => totalFileSize += img.buffer.byteLength);

        const finalBuffer = new ArrayBuffer(totalFileSize);
        const view = new DataView(finalBuffer);
        
        // ICO Header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Type 1 for ICO
        view.setUint16(4, images.length, true); // Number of images

        let offset = headerSize + totalDirSize;

        // Image Directory Entries
        images.forEach((img, i) => {
            const entryOffset = headerSize + i * dirEntrySize;
            view.setUint8(entryOffset, img.width === 256 ? 0 : img.width);
            view.setUint8(entryOffset + 1, img.height === 256 ? 0 : img.height);
            view.setUint8(entryOffset + 2, 0); // Color Palette
            view.setUint8(entryOffset + 3, 0); // Reserved
            view.setUint16(entryOffset + 4, 1, true); // Color Planes
            view.setUint16(entryOffset + 6, 32, true); // Bits per Pixel
            view.setUint32(entryOffset + 8, img.buffer.byteLength, true);
            view.setUint32(entryOffset + 12, offset, true);
            offset += img.buffer.byteLength;
        });
        
        // Image Data
        let currentOffset = headerSize + totalDirSize;
        const finalArray = new Uint8Array(finalBuffer);
        images.forEach(img => {
            finalArray.set(new Uint8Array(img.buffer), currentOffset);
            currentOffset += img.buffer.byteLength;
        });

        return new Blob([finalBuffer], { type: 'image/x-icon' });
    }


    downloadBtn.addEventListener('click', async () => {
        if (!sourceImage) return;
        
        const selectedFormat = document.querySelector('input[name="favicon-format"]:checked').value;
        statusDiv.textContent = 'Подготовка файлов...';

        if (typeof JSZip === 'undefined' && (selectedFormat === 'all' || selectedFormat === 'png')) {
            statusDiv.textContent = 'Ошибка: библиотека JSZip не загружена.';
            return;
        }

        try {
            switch (selectedFormat) {
                case 'ico': {
                    const icoBlob = await createIcoBlob();
                    downloadBlob(icoBlob, 'favicon.ico');
                    break;
                }
                case 'png': {
                    const zip = new JSZip();
                    for (const size of PREVIEW_SIZES) {
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        ctx.drawImage(sourceImage, 0, 0, size, size);
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        zip.file(`favicon-${size}x${size}.png`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    downloadBlob(zipBlob, 'favicons_png.zip');
                    break;
                }
                case 'all': {
                    const zip = new JSZip();
                    // Добавляем PNG файлы
                    for (const size of PREVIEW_SIZES) {
                         const canvas = document.createElement('canvas');
                         canvas.width = size; canvas.height = size;
                         const ctx = canvas.getContext('2d');
                         ctx.drawImage(sourceImage, 0, 0, size, size);
                         const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                         const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
                         zip.file(filename, blob);
                    }
                    // Добавляем ICO файл
                    const icoBlob = await createIcoBlob();
                    zip.file('favicon.ico', icoBlob);
                    
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    downloadBlob(zipBlob, 'favicons.zip');
                    break;
                }
            }
            statusDiv.textContent = 'Готово!';
        } catch (error) {
            console.error("Ошибка при создании файла:", error);
            statusDiv.textContent = 'Произошла ошибка.';
        }
    });
}
