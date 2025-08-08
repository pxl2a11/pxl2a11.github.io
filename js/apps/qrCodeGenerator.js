export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-4">
            <div id="qrcode-display" class="w-56 h-56 bg-white p-2 rounded-lg shadow-inner flex items-center justify-center">
                <span class="text-gray-400">Здесь появится QR-код</span>
            </div>

            <div class="w-full space-y-3">
                <div>
                    <label for="qr-template-select" class="text-sm font-medium">Шаблон данных</label>
                    <select id="qr-template-select" class="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                        <option value="text">Текст/Ссылка</option>
                        <option value="wifi">Wi-Fi</option>
                        <option value="vcard">vCard (Контакт)</option>
                    </select>
                </div>

                <div id="qr-input-container">
                    <!-- Поля будут добавляться динамически -->
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="qr-color-dark" class="text-sm font-medium">Цвет QR</label>
                        <input type="color" id="qr-color-dark" value="#000000" class="w-full h-10 mt-1 p-1 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <div>
                        <label for="qr-color-light" class="text-sm font-medium">Цвет фона</label>
                        <input type="color" id="qr-color-light" value="#ffffff" class="w-full h-10 mt-1 p-1 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    </div>
                </div>
            </div>

            <div class="w-full flex flex-col sm:flex-row gap-2">
                <button id="generate-qr-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Сгенерировать</button>
                <a id="download-qr-btn" class="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 text-center hidden" download="qrcode.png">Скачать</a>
            </div>
        </div>`;
}

export function init() {
    const generateBtn = document.getElementById('generate-qr-btn');
    const display = document.getElementById('qrcode-display');
    const downloadBtn = document.getElementById('download-qr-btn');
    const templateSelect = document.getElementById('qr-template-select');
    const inputContainer = document.getElementById('qr-input-container');

    const templates = {
        text: `<textarea id="qr-text" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" rows="3" placeholder="https://example.com"></textarea>`,
        wifi: `
            <input type="text" id="qr-wifi-ssid" placeholder="Название сети (SSID)" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-2">
            <input type="password" id="qr-wifi-pass" placeholder="Пароль" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-2">
            <select id="qr-wifi-enc" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Без пароля</option>
            </select>`,
        vcard: `
            <input type="text" id="qr-vcard-name" placeholder="Имя Фамилия" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-2">
            <input type="tel" id="qr-vcard-tel" placeholder="Телефон" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-2">
            <input type="email" id="qr-vcard-email" placeholder="Email" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">`
    };

    function updateInputs(template) {
        inputContainer.innerHTML = templates[template];
    }

    function generateQRCode() {
        let text = '';
        const selectedTemplate = templateSelect.value;
        const colorDark = document.getElementById('qr-color-dark').value;
        const colorLight = document.getElementById('qr-color-light').value;

        if (selectedTemplate === 'text') {
            text = document.getElementById('qr-text').value.trim();
        } else if (selectedTemplate === 'wifi') {
            const ssid = document.getElementById('qr-wifi-ssid').value.trim();
            const pass = document.getElementById('qr-wifi-pass').value;
            const enc = document.getElementById('qr-wifi-enc').value;
            if (ssid) text = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
        } else if (selectedTemplate === 'vcard') {
            const name = document.getElementById('qr-vcard-name').value.trim();
            const tel = document.getElementById('qr-vcard-tel').value.trim();
            const email = document.getElementById('qr-vcard-email').value.trim();
            if (name) {
                text = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\n`;
                if (tel) text += `TEL:${tel}\n`;
                if (email) text += `EMAIL:${email}\n`;
                text += `END:VCARD`;
            }
        }

        if (text) {
            display.innerHTML = '';
            downloadBtn.classList.add('hidden');
            try {
                new QRCode(display, {
                    text: text,
                    width: 208,
                    height: 208,
                    colorDark: colorDark,
                    colorLight: colorLight,
                    correctLevel: QRCode.CorrectLevel.H
                });
                setTimeout(() => {
                    const canvas = display.querySelector('canvas');
                    if (canvas) {
                        downloadBtn.href = canvas.toDataURL();
                        downloadBtn.classList.remove('hidden');
                    }
                }, 100);
            } catch (e) {
                console.error(e);
                display.innerHTML = '<span class="text-red-500">Ошибка при создании QR-кода.</span>';
            }
        }
    }

    templateSelect.addEventListener('change', (e) => updateInputs(e.target.value));
    generateBtn.addEventListener('click', generateQRCode);
    
    // Initial setup
    updateInputs('text');
}

export function cleanup() {}
