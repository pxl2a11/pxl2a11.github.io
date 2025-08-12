const commonCSS = `
    .resizer-label {
        font-weight: 500;
    }
    .resizer-input {
        width: 100px;
        padding: 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid #d1d5db;
        background-color: #f9fafb;
    }
    /* Убираем стрелочки из input[type=number] */
    .resizer-input {
      -moz-appearance: textfield;
    }
    .resizer-input::-webkit-outer-spin-button,
    .resizer-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .dark .resizer-input {
        background-color: #374151;
        border-color: #4b5563;
    }
    .resizer-btn {
        padding: 0.6rem 1.2rem;
        border-radius: 0.5rem;
        background-color: #10b981;
        color: white;
        font-weight: 600;
        transition: background-color 0.2s;
        cursor: pointer;
        border: none;
    }
    .resizer-btn:hover {
        background-color: #059669;
    }
    #image-preview {
        max-width: 100%;
        max-height: 300px;
        margin-top: 1rem;
        border-radius: 0.5rem;
        border: 2px dashed #9ca3af;
        padding: 0.5rem;
    }
`;

export function getHtml() {
    return `
        <style>${commonCSS}</style>
        <div class="flex flex-col items-center gap-4">
            <input type="file" id="image-upload" accept="image/png, image/jpeg, image/webp" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
            
            <div id="controls-area" class="hidden flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                <div>
                    <label for="width-input" class="resizer-label">Ширина:</label>
                    <input type="number" id="width-input" class="resizer-input">
                </div>
                <div>
                    <label for="height-input" class="resizer-label">Высота:</label>
                    <input type="number" id="height-input" class="resizer-input">
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="aspect-ratio-lock" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked>
                    <label for="aspect-ratio-lock" class="ml-2 block text-sm">Сохранять пропорции</label>
                </div>
            </div>

            <button id="resize-btn" class="resizer-btn hidden">Изменить размер и скачать</button>
            
            <img id="image-preview" class="hidden" />
        </div>
    `;
}

export function init() {
    const imageUpload = document.getElementById('image-upload');
    const controlsArea = document.getElementById('controls-area');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectRatioLock = document.getElementById('aspect-ratio-lock');
    const resizeBtn = document.getElementById('resize-btn');
    const imagePreview = document.getElementById('image-preview');

    let originalWidth, originalHeight;
    let imageFile;

    imageUpload.addEventListener('change', (e) => {
        imageFile = e.target.files[0];
        if (!imageFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.classList.remove('hidden');
            const img = new Image();
            img.onload = () => {
                originalWidth = img.width;
                originalHeight = img.height;
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                controlsArea.classList.remove('hidden');
                resizeBtn.classList.remove('hidden');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageFile);
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

    resizeBtn.addEventListener('click', () => {
        const newWidth = parseInt(widthInput.value, 10);
        const newHeight = parseInt(heightInput.value, 10);

        if (!newWidth || !newHeight || !imageFile || newWidth <= 0 || newHeight <= 0) {
            alert('Пожалуйста, выберите файл и укажите корректные размеры.');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `resized-${imageFile.name}`;
                link.click();
                URL.revokeObjectURL(link.href);
            }, imageFile.type);
        };
        img.src = URL.createObjectURL(imageFile);
    });
}
