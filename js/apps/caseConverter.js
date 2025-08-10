export function getHtml() {
    return `
        <div class="flex flex-col gap-4">
            <textarea id="case-converter-input" class="w-full h-40 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите текст сюда..."></textarea>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button id="btn-uppercase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">ВЕРХНИЙ РЕГИСТР</button>
                <button id="btn-lowercase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">нижний регистр</button>
                <button id="btn-sentencecase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Заглавные буквы</button>
                <button id="btn-capitalize" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Как в предложениях</button>
            </div>
            <div class="flex gap-2">
                <button id="btn-copy" class="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 flex-grow">Копировать</button>
                <button id="btn-clear" class="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Очистить</button>
            </div>
        </div>
    `;
}

export function init() {
    const textarea = document.getElementById('case-converter-input');
    
    document.getElementById('btn-uppercase').addEventListener('click', () => {
        textarea.value = textarea.value.toUpperCase();
    });

    document.getElementById('btn-lowercase').addEventListener('click', () => {
        textarea.value = textarea.value.toLowerCase();
    });
    
    document.getElementById('btn-sentencecase').addEventListener('click', () => {
        textarea.value = textarea.value.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
    });
    
    document.getElementById('btn-capitalize').addEventListener('click', () => {
        textarea.value = textarea.value.toLowerCase().replace(/(^\s*|[.?!]\s*)\w/g, (c) => c.toUpperCase());
    });

    document.getElementById('btn-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
            const btn = document.getElementById('btn-copy');
            const originalText = btn.textContent;
            btn.textContent = 'Скопировано!';
            setTimeout(() => (btn.textContent = originalText), 2000);
        });
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        textarea.value = '';
    });
}
