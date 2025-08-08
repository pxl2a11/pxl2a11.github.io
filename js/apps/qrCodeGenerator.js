// --- Глобальные переменные для модуля, чтобы обеспечить их очистку ---
const QRCODE_LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js';
let abortController;

/**
 * Динамически загружает внешний скрипт и возвращает Promise.
 * @param {string} src - URL скрипта для загрузки.
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Возвращает HTML-структуру для интерфейса генератора QR-кодов.
 * @returns {string} HTML-разметка.
 */
function getHtml() {
    return `
        <div class="max-w-2xl mx-auto space-y-5 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">

            <!-- Навигация по шаблонам -->
            <div id="template-tabs" class="flex items-center border-b border-gray-200 dark:border-gray-700">
                <button data-template="text" class="template-tab-btn active-tab">Текст</button>
                <button data-template="wifi" class="template-tab-btn">Wi-Fi</button>
                <button data-template="email" class="template-tab-btn">Email</button>
                <button data-template="sms" class="template-tab-btn">SMS</button>
            </div>
            
            <!-- Контейнер для полей ввода шаблонов -->
            <div id="templates-container" class="space-y-4">
            
                <!-- 1. Шаблон: Простой текст -->
                <div id="template-text" class="template-panel space-y-2">
                    <label for="qr-text" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Текст, ссылка или данные:</label>
                    <textarea id="qr-text" rows="4" class="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Например: https://www.google.com"></textarea>
                </div>

                <!-- 2. Шаблон: Wi-Fi -->
                <div id="template-wifi" class="template-panel space-y-4 hidden">
                    <div>
                        <label for="wifi-ssid" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Название сети (SSID)</label>
                        <input type="text" id="wifi-ssid" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="MyHomeWiFi">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="wifi-password" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Пароль</label>
                            <input type="password" id="wifi-password" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Не оставляйте пустым, если сеть защищена">
                        </div>
                        <div>
                             <label for="wifi-encryption" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Тип шифрования</label>
                             <select id="wifi-encryption" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 h-[46px]">
                                <option value="WPA" selected>WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">Открытая сеть</option>
                             </select>
                        </div>
                    </div>
                </div>

                <!-- 3. Шаблон: Email -->
                <div id="template-email" class="template-panel space-y-4 hidden">
                    <div>
                         <label for="email-to" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Получатель (To)</label>
                         <input type="email" id="email-to" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="example@email.com">
                    </div>
                     <div>
                         <label for="email-subject" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Тема</label>
                         <input type="text" id="email-subject" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Тема вашего письма">
                    </div>
                     <div>
                         <label for="email-body" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Сообщение</label>
                         <textarea id="email-body" rows="3" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Текст вашего сообщения..."></textarea>
                    </div>
                </div>

                <!-- 4. Шаблон: SMS -->
                <div id="template-sms" class="template-panel space-y-4 hidden">
                    <div>
                         <label for="sms-phone" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Номер телефона</label>
                         <input type="tel" id="sms-phone" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="+79001234567">
                    </div>
                     <div>
                         <label for="sms-message" class="block text-sm font-medium text-gray-800 dark:text-gray-300">Сообщение</label>
                         <textarea id="sms-message" rows="4" class="mt-1 w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Текст SMS..."></textarea>
                    </div>
                </div>
            </div>
            
            <!-- Настройки кастомизации -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                 <div>
                    <label for="qr-size" class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1.5">Размер</label>
                    <input type="number" id="qr-size" value="256" min="64" max="1024" step="16" class="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                 </div>
                 <div>
                    <label for="qr-color-dark" class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1.5">Цвет</label>
                    <input type="color" id="qr-color-dark" value="#000000" class="w-full h-11 p-1 border rounded-xl bg-gray-50 dark:bg-gray-700 cursor-pointer">
                 </div>
                 <div>
                    <label for="qr-color-light" class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1.5">Фон</label>
                    <input type="color" id="qr-color-light" value="#ffffff" class="w-full h-11 p-1 border rounded-xl bg-gray-50 dark:bg-gray-700 cursor-pointer">
                 </div>
                 <div class="col-span-2 sm:col-span-1">
                    <button id="generate-qr-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors h-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">
                        Создать QR
                    </button>
                 </div>
            </div>

            <!-- Контейнер для вывода QR-кода -->
            <div id="qr-code-container" class="mt-4 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl min-h-[256px] bg-gray-50 dark:bg-gray-900/50 transition">
                 <p class="text-gray-500 dark:text-gray-400 text-center">Здесь появится ваш QR-код</p>
            </div>

            <!-- Кнопка скачивания -->
            <a id="download-qr-btn" class="hidden w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors mt-2" download="qrcode.png">
                Скачать PNG
            </a>
        </div>

        <style>
            .template-tab-btn {
                padding: 8px 16px;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                margin-bottom: -2px; /* Компенсируем border */
                transition: all 0.2s ease-in-out;
            }
            .template-tab-btn.active-tab {
                --tw-text-opacity: 1;
                color: rgb(22 163 74 / var(--tw-text-opacity));
                border-color: rgb(22 163 74 / var(--tw-text-opacity));
                font-weight: 600;
            }
             .dark .template-tab-btn.active-tab {
                color: rgb(34 197 94 / var(--tw-text-opacity));
                border-color: rgb(34 197 94 / var(--tw-text-opacity));
            }
        </style>
    `;
}

/**
 * Основная функция для генерации QR-кода на основе данных из полей ввода.
 */
async function handleGenerateQr() {
    const container = document.getElementById('qr-code-container');
    const downloadLink = document.getElementById('download-qr-btn');
    let textToEncode = '';
    let errorMessage = '';

    // Определяем активный шаблон
    const activeTab = document.querySelector('.template-tab-btn.active-tab');
    const activeTemplate = activeTab ? activeTab.dataset.template : 'text';
    
    // Собираем данные в зависимости от шаблона
    switch (activeTemplate) {
        case 'text':
            textToEncode = document.getElementById('qr-text').value;
            if (!textToEncode.trim()) errorMessage = 'Пожалуйста, введите текст или ссылку.';
            break;
        
        case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value;
            const password = document.getElementById('wifi-password').value;
            const encryption = document.getElementById('wifi-encryption').value;
            if (!ssid.trim()) {
                 errorMessage = 'Название сети (SSID) не может быть пустым.';
            } else {
                 textToEncode = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
            }
            break;

        case 'email':
            const to = document.getElementById('email-to').value;
            const subject = document.getElementById('email-subject').value;
            const body = document.getElementById('email-body').value;
            if (!to.trim()) {
                errorMessage = 'Поле "Получатель (To)" обязательно для заполнения.';
            } else {
                 textToEncode = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
            break;
            
        case 'sms':
            const phone = document.getElementById('sms-phone').value;
            const message = document.getElementById('sms-message').value;
            if (!phone.trim()) {
                errorMessage = 'Пожалуйста, укажите номер телефона.';
            } else {
                textToEncode = `SMSTO:${phone}:${message}`;
            }
            break;
    }

    // Проверка на ошибки или пустые данные
    if (errorMessage) {
        container.innerHTML = `<p class="text-red-500">${errorMessage}</p>`;
        downloadLink.classList.add('hidden');
        return;
    }

    // Показываем индикатор загрузки
    container.innerHTML = '<div class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-green-500"></div>'; 

    const size = parseInt(document.getElementById('qr-size').value, 10) || 256;
    const colorDark = document.getElementById('qr-color-dark').value;
    const colorLight = document.getElementById('qr-color-light').value;
    const canvas = document.createElement('canvas');

    try {
        await QRCode.toCanvas(canvas, textToEncode, {
            width: size,
            margin: 2,
            color: { dark: colorDark, light: colorLight },
            errorCorrectionLevel: 'H'
        });
        
        container.innerHTML = '';
        container.appendChild(canvas);
        
        const dataUrl = canvas.toDataURL('image/png');
        downloadLink.href = dataUrl;
        downloadLink.classList.remove('hidden');

    } catch (err) {
        console.error('Ошибка генерации QR-кода:', err);
        container.innerHTML = `<p class="text-red-500 text-center">Не удалось сгенерировать QR-код. <br> Возможно, данные слишком длинные.</p>`;
        downloadLink.classList.add('hidden');
    }
};

/**
 * Инициализирует приложение: загружает скрипты и назначает обработчики событий.
 */
async function init() {
    abortController = new AbortController();
    const { signal } = abortController;

    try {
        await loadScript(QRCODE_LIB_URL);
    } catch (error) {
        console.error(error);
        const container = document.getElementById('qr-code-container');
        if (container) {
            container.innerHTML = `<p class="text-center text-red-500">Ошибка загрузки ресурсов. Проверьте интернет-соединение.</p>`;
        }
        return;
    }

    const generateBtn = document.getElementById('generate-qr-btn');
    const templateTabsContainer = document.getElementById('template-tabs');

    if (!generateBtn || !templateTabsContainer) return;

    // Обработчик для кнопки генерации
    generateBtn.addEventListener('click', handleGenerateQr, { signal });
    
    // Обработчик для переключения вкладок шаблонов
    templateTabsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.template-tab-btn');
        if (!target) return;

        // Обновляем активную вкладку
        templateTabsContainer.querySelector('.active-tab').classList.remove('active-tab');
        target.classList.add('active-tab');

        // Показываем нужную панель
        document.querySelectorAll('.template-panel').forEach(p => p.classList.add('hidden'));
        const panelId = `template-${target.dataset.template}`;
        document.getElementById(panelId).classList.remove('hidden');

    }, { signal });
    
    // Генерируем QR-код по умолчанию при загрузке
    if (typeof QRCode !== 'undefined') {
        handleGenerateQr();
    }
}

/**
 * Очищает ресурсы, удаляя обработчики событий.
 */
function cleanup() {
    if (abortController) {
        abortController.abort();
    }
    console.log("Генератор QR-кодов: очистка завершена.");
}

export { getHtml, init, cleanup };
