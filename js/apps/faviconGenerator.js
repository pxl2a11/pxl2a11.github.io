// js/apps/faviconGenerator.js

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
                <h3 class="font-semibold mb-2">Предпросмотр:</h3>
                <img id="favicon-preview" class="max-w-xs max-h-48 mx-auto rounded-lg border-2 p-2 bg-gray-100 dark:bg-gray-700">
            </div>

            <div id="favicon-result-container" class="hidden space-y-4">
                 <button id="favicon-download-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Скачать все иконки (.zip)
                </button>
                 <div id="favicon-grid" class="grid grid-cols-3 sm:grid-cols-5 gap-4"></div>
            </div>
             <div id="favicon-status" class="text-center font-medium"></div>
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
                generateIcons();
            };
            sourceImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const SIZES = [16, 32, 48, 180, 192, 512]; // Common favicon sizes

    async function generateIcons() {
        if (!sourceImage) return;
        grid.innerHTML = '';
        statusDiv.textContent = 'Генерация иконок...';

        for (const size of SIZES) {
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
        statusDiv.textContent = '';
    }

    downloadBtn.addEventListener('click', async () => {
        if (!sourceImage || typeof JSZip === 'undefined') {
            statusDiv.textContent = 'Ошибка: библиотека JSZip не загружена.';
            return;
        }
        
        statusDiv.textContent = 'Создание архива...';
        const zip = new JSZip();
        
        for (const size of SIZES) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImage, 0, 0, size, size);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
            zip.file(filename, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'favicons.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        statusDiv.textContent = 'Архив успешно создан!';
    });
}
