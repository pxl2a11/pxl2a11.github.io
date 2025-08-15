// js/apps/jsonFormatter.js

let inputArea, outputArea, formatJsonBtn, formatXmlBtn, minifyBtn, clearBtn, statusEl;

function getHtml() {
    return `
        <div class="formatter-container">
            <div class="flex flex-wrap justify-center gap-4">
                <button id="format-json-btn" class="filter-btn">Форматировать JSON</button>
                <button id="format-xml-btn" class="filter-btn">Форматировать XML</button>
                <button id="minify-btn" class="filter-btn">Минифицировать</button>
                <button id="clear-btn" class="filter-btn">Очистить</button>
            </div>
            <div id="formatter-status" class="text-center h-5 text-red-500 font-medium"></div>
            <div class="formatter-io">
                <textarea id="formatter-input" class="formatter-textarea" placeholder="Вставьте ваш JSON или XML сюда..."></textarea>
                <textarea id="formatter-output" class="formatter-textarea" readonly placeholder="Результат..."></textarea>
            </div>
        </div>
    `;
}

function init() {
    inputArea = document.getElementById('formatter-input');
    outputArea = document.getElementById('formatter-output');
    statusEl = document.getElementById('formatter-status');
    formatJsonBtn = document.getElementById('format-json-btn');
    formatXmlBtn = document.getElementById('format-xml-btn');
    minifyBtn = document.getElementById('minify-btn');
    clearBtn = document.getElementById('clear-btn');

    formatJsonBtn.addEventListener('click', formatJson);
    formatXmlBtn.addEventListener('click', formatXml);
    minifyBtn.addEventListener('click', minify);
    clearBtn.addEventListener('click', clear);
    inputArea.addEventListener('input', () => {
        statusEl.textContent = '';
        inputArea.classList.remove('error');
    });
}

function formatJson() {
    clearStatus();
    try {
        const jsonObj = JSON.parse(inputArea.value);
        outputArea.value = JSON.stringify(jsonObj, null, 4);
    } catch (e) {
        showError('Неверный JSON: ' + e.message);
    }
}

function formatXml() {
    clearStatus();
    try {
        let xml = inputArea.value.replace(/>\s*</g, '><').trim();
        let formatted = '', indent = '';
        const tab = '    ';
        xml.split(/>\s*</).forEach(node => {
            if (node.match( /^\/\w/ )) indent = indent.substring(tab.length);
            formatted += indent + '<' + node + '>\r\n';
            if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;
        });
        outputArea.value = formatted.substring(1, formatted.length - 3);
    } catch (e) {
        showError('Ошибка форматирования XML.');
    }
}

function minify() {
    clearStatus();
    try {
        // Попытка минифицировать как JSON
        const jsonObj = JSON.parse(inputArea.value);
        outputArea.value = JSON.stringify(jsonObj);
    } catch (e) {
        // Если не JSON, пробуем как XML
        outputArea.value = inputArea.value.replace(/>\s*</g, '><').replace(/\s{2,}/g, ' ').trim();
    }
}

function clear() {
    clearStatus();
    inputArea.value = '';
    outputArea.value = '';
}

function showError(message) {
    statusEl.textContent = message;
    inputArea.classList.add('error');
    outputArea.value = '';
}

function clearStatus() {
    statusEl.textContent = '';
    inputArea.classList.remove('error');
}

function cleanup() {}

export { getHtml, init, cleanup };
