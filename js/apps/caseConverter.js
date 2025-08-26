// js/apps/caseConverter.js

export function getHtml() {
    return `
        <div class="flex flex-col gap-4">
            <textarea id="case-converter-input" class="w-full h-40 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите текст сюда..."></textarea>
            <!-- ИЗМЕНЕНИЕ: ДОБАВЛЕНА 5-Я КНОПКА, СЕТКА ИЗМЕНЕНА -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <button id="btn-uppercase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">ВЕРХНИЙ</button>
                <button id="btn-lowercase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">нижний</button>
                <button id="btn-sentencecase" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Заглавные</button>
                <button id="btn-capitalize" class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Предложения</button>
                <button id="btn-alternating" class="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 col-span-2 sm:col-span-1 md:col-span-1">зАбОрЧиК</button>
            </div>
            <div class="flex gap-2">
                <button id="btn-copy" class="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 flex-grow">Копировать</button>
                <button id="btn-download" class="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex-grow">Скачать (.txt)</button>
                <button id="btn-clear" class="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Очистить</button>
            </div>
        </div>
    `;
}

export function init() {
    const textarea = document.getElementById('case-converter-input');
    
    document.getElementById('btn-uppercase').addEventListener('click', () => { textarea.value = textarea.value.toUpperCase(); });
    document.getElementById('btn-lowercase').addEventListener('click', () => { textarea.value = textarea.value.toLowerCase(); });
    document.getElementById('btn-sentencecase').addEventListener('click', () => { textarea.value = textarea.value.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase()); });
    document.getElementById('btn-capitalize').addEventListener('click', () => { textarea.value = textarea.value.toLowerCase().replace(/(^\s*|[.?!]\s*)\w/g, (c) => c.toUpperCase()); });
    // НОВАЯ ФУНКЦИЯ
    document.getElementById('btn-alternating').addEventListener('click', () => {
        textarea.value = textarea.value.split('').map((char, i) => i % 2 ? char.toLowerCase() : char.toUpperCase()).join('');
    });
    //... (остальные кнопки без изменений)
    document.getElementById('btn-copy').addEventListener('click', () => { /*...*/ });
    document.getElementById('btn-download').addEventListener('click', () => { /*...*/ });
    document.getElementById('btn-clear').addEventListener('click', () => { textarea.value = ''; });
}
