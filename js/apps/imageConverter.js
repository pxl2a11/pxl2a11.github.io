export function getHtml() {
    return `
        <div class="flex flex-col items-center gap-4">
            <input type="file" id="image-input" accept="image/*" class="w-full max-w-md p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <div id="image-preview-container" class="hidden w-full max-w-md p-4 border-dashed border-2 rounded-lg text-center">
                <img id="image-preview" class="max-w-full max-h-64 mx-auto"/>
            </div>
            <div id="controls-container" class="hidden flex flex-col sm:flex-row items-center gap-4">
                <select id="format-select" class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                </select>
                <div id="quality-control" class="flex items-center gap-2">
                    <label for="quality-slider">Качество:</label>
                    <input type="range" id="quality-slider" min="10" max="100" value="80" class="w-32">
                    <span id="quality-value">80%</span>
                </div>
                <button id="convert-btn" class="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600">Конвертировать и скачать</button>
            </div>
        </div>
    `;
}

export function init() {
    const imageInput = document.getElementById('image-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const controlsContainer = document.getElementById('controls-container');
    const formatSelect = document.getElementById('format-select');
    const qualityControl = document.getElementById('quality-control');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const convertBtn = document.getElementById('convert-btn');
    let originalImage = new Image();
    let originalFileName = '';

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        originalFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.src = event.target.result;
            previewImage.src = event.target.result;
            previewContainer.classList.remove('hidden');
            controlsContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    formatSelect.addEventListener('change', () => {
        qualityControl.style.display = formatSelect.value === 'png' ? 'none' : 'flex';
    });
    
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    convertBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);

        const format = formatSelect.value;
        const mimeType = `image/${format}`;
        const quality = parseInt(qualitySlider.value, 10) / 100;

        const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality : undefined);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${originalFileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
