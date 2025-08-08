export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-6">
            <p class="text-center text-gray-600 dark:text-gray-400">Введите текст или ссылку для создания QR-кода.</p>
            <div id="qrcode-display" class="w-56 h-56 bg-white p-2 rounded-lg shadow-inner flex items-center justify-center">
                <span class="text-gray-400">Здесь появится QR-код</span>
            </div>
            <textarea id="qr-input" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" rows="3" placeholder="https://example.com"></textarea>
            <div class="w-full flex flex-col sm:flex-row gap-2">
                <button id="generate-qr-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Сгенерировать</button>
                <a id="download-qr-btn" class="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 text-center hidden" download="qrcode.png">Скачать</a>
            </div>
        </div>`;
}

export function init() {
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-qr-btn');
    const display = document.getElementById('qrcode-display');
    const downloadBtn = document.getElementById('download-qr-btn');

    generateBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        if (text) {
            display.innerHTML = '';
            downloadBtn.classList.add('hidden');
            try {
                new QRCode(display, {
                    text: text,
                    width: 208,
                    height: 208,
                    colorDark: document.documentElement.classList.contains('dark') ? "#ffffff" : "#000000",
                    colorLight: document.documentElement.classList.contains('dark') ? "#111827" : "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                setTimeout(() => {
                    const img = display.querySelector('img');
                    if (img && img.src) {
                        downloadBtn.href = img.src;
                        downloadBtn.classList.remove('hidden');
                    }
                }, 100);
            } catch (e) {
                console.error(e);
                display.innerHTML = '<span class="text-red-500">Ошибка при создании QR-кода.</span>';
            }
        }
    });
}

export function cleanup() {}
