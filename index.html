// --- Глобальные переменные для модуля, чтобы обеспечить их очистку ---
let generateBtn, qrTextInput;
const QRCODE_LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js';
let abortController;


/**
 * Динамически загружает внешний скрипт и возвращает Promise.
 * @param {string} src - URL скрипта для загрузки.
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Проверяем, не был ли скрипт уже загружен
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
        <div class="max-w-lg mx-auto space-y-5 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <!-- Поле для ввода данных -->
            <div>
                <label for="qr-text" class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1.5">
                    Текст, ссылка или данные для QR-кода:
                </label>
                <textarea id="qr-text" rows="4" class="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Например: https://www.google.com"></textarea>
            </div>

            <!-- Настройки кастомизации -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
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
                        Создать
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
    `;
}

/**
 * Основная функция для генерации QR-кода на основе данных из полей ввода.
 */
const handleGenerateQr = async () => {
    const text = document.getElementById('qr-text').value;
    const size = parseInt(document.getElementById('qr-size').value, 10) || 256;
    const colorDark = document.getElementById('qr-color-dark').value;
    const colorLight = document.getElementById('qr-color-light').value;
    const container = document.getElementById('qr-code-container');
    const downloadLink = document.getElementById('download-qr-btn');

    // Проверка наличия текста
    if (!text.trim()) {
        container.innerHTML = `<p class="text-red-500">Пожалуйста, введите текст или ссылку.</p>`;
        downloadLink.classList.add('hidden');
        return;
    }

    container.innerHTML = '<div class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-green-500"></div>'; // Индикатор загрузки
    
    // Создаем canvas для отрисовки
    const canvas = document.createElement('canvas');

    try {
        // Используем библиотеку для отрисовки QR-кода на canvas
        await QRCode.toCanvas(canvas, text, {
            width: size,
            margin: 2,
            color: {
                dark: colorDark,
                light: colorLight
            },
            errorCorrectionLevel: 'H' // Высокий уровень коррекции ошибок
        });
        
        container.innerHTML = ''; // Очищаем контейнер
        container.appendChild(canvas);

        // Обновляем ссылку для скачивания
        const dataUrl = canvas.toDataURL('image/png');
        downloadLink.href = dataUrl;
        downloadLink.classList.remove('hidden');

    } catch (err) {
        console.error('Ошибка генерации QR-кода:', err);
        container.innerHTML = `<p class="text-red-500 text-center">Не удалось сгенерировать QR-код. <br> Возможно, текст слишком длинный.</p>`;
        downloadLink.classList.add('hidden');
    }
};


/**
 * Инициализирует приложение: загружает скрипты и назначает обработчики событий.
 */
async function init() {
    abortController = new AbortController();
    const { signal } = abortController;

    // 1. Загружаем внешнюю библиотеку для генерации QR-кодов
    try {
        await loadScript(QRCODE_LIB_URL);
    } catch (error) {
        console.error(error);
        const container = document.getElementById('qr-code-container');
        if (container) {
            container.innerHTML = 
            `<p class="text-center text-red-500">Не удалось загрузить библиотеку для генерации QR-кодов. Проверьте подключение к интернету.</p>`;
        }
        return;
    }

    // 2. Находим ключевые элементы в DOM
    generateBtn = document.getElementById('generate-qr-btn');
    qrTextInput = document.getElementById('qr-text');

    if (!generateBtn || !qrTextInput) return;

    // 3. Назначаем обработчики событий
    generateBtn.addEventListener('click', handleGenerateQr, { signal });
    
    // 4. Генерируем QR-код с текстом по умолчанию для наглядности
    if (typeof QRCode !== 'undefined') {
        qrTextInput.value = 'Привет от Mini Apps!';
        handleGenerateQr();
    }
}

/**
 * Очищает ресурсы, удаляя обработчики событий.
 */
function cleanup() {
    if (abortController) {
        abortController.abort(); // Отменяем все назначенные обработчики
    }
    console.log("Генератор QR-кодов: очистка завершена.");
}

// --- Экспортируем публичные функции модуля ---
export { getHtml, init, cleanup };
