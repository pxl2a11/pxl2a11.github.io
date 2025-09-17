// js/apps/markdownEditor.js

// Переменные для хранения ссылок на элементы и обработчики
let textarea, preview, toolbar;
let eventListeners = [];

/**
 * Добавляет обработчик событий и сохраняет его для последующей очистки.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    return `
        <style>
            #md-preview h1, #md-preview h2, #md-preview h3 { border-bottom: 1px solid #e5e7eb; padding-bottom: .3em; margin-top: 1.5em; margin-bottom: 1em; }
            .dark #md-preview h1, .dark #md-preview h2, .dark #md-preview h3 { border-color: #4b5563; }
            #md-preview p { margin-bottom: 1em; }
            #md-preview a { color: #3b82f6; text-decoration: underline; }
            #md-preview code { background-color: #f3f4f6; color: #be123c; padding: .2em .4em; margin: 0; font-size: 85%; border-radius: 6px; }
            .dark #md-preview code { background-color: #374151; color: #fda4af; }
            #md-preview pre { background-color: #f3f4f6; dark:bg-gray-700; padding: 1em; border-radius: 6px; overflow-x: auto; }
            #md-preview pre code { padding: 0; font-size: 100%; color: inherit; background-color: transparent; }
            #md-preview ul, #md-preview ol { padding-left: 2em; margin-bottom: 1em; }
            #md-preview blockquote { border-left: .25em solid #d1d5db; padding: 0 1em; color: #6b7280; }
            .dark #md-preview blockquote { border-color: #4b5563; color: #9ca3af; }
            .md-toolbar-btn { padding: 0.5rem 0.75rem; background-color: #e5e7eb; border-radius: 0.375rem; font-weight: bold; }
            .dark .md-toolbar-btn { background-color: #4b5563; }
        </style>
        <div class="space-y-4">
            <!-- Панель инструментов -->
            <div id="md-toolbar" class="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                <button data-md="bold" class="md-toolbar-btn">B</button>
                <button data-md="italic" class="md-toolbar-btn italic">I</button>
                <button data-md="link" class="md-toolbar-btn text-sm">Ссылка</button>
                <button data-md="quote" class="md-toolbar-btn text-gray-500">“ ”</button>
                <button data-md="code" class="md-toolbar-btn text-sm font-mono">&lt;/&gt;</button>
                <button data-md="ul" class="md-toolbar-btn">- Список</button>
            </div>
            <!-- Редактор и превью -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[50vh] min-h-[400px]">
                <textarea id="md-textarea" class="w-full h-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 resize-none" placeholder="Введите ваш Markdown здесь..."></textarea>
                <div id="md-preview" class="w-full h-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 overflow-y-auto"></div>
            </div>
        </div>
    `;
}

/**
 * Простой парсер Markdown в HTML.
 */
function parseMarkdown(text) {
    let html = text
        // Заголовки (###, ##, #)
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Жирный текст (**text** или __text__)
        .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>')
        // Курсив (*text* или _text_)
        .replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>')
        // Зачеркнутый (~~text~~)
        .replace(/~~(.*?)~~/gim, '<del>$1</del>')
        // Блок цитаты (> text)
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Списки (неупорядоченные)
        .replace(/^\s*[\-\*] (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul>/gim, '') // Объединяем соседние списки
        // Ссылки ([text](url))
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Блоки кода (```...```)
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        // Встроенный код (`code`)
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // Новые строки (заменяем на <p> только если это не внутри других тегов)
        .replace(/^(?!<[hbuolp]|<pre>|<code>|<strong|<em|<del|<blockquote|<a)(.*$)/gim, '<p>$1</p>')
        // Убираем пустые теги <p>
        .replace(/<p><\/p>/gim, '');

    return html.trim();
}

/**
 * Вставка тегов Markdown в textarea.
 */
function insertMarkdown(tag) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let newText;

    switch (tag) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `*${selectedText}*`;
            break;
        case 'link':
            newText = `[${selectedText}](https://)`;
            break;
        case 'quote':
            newText = `> ${selectedText}`;
            break;
        case 'code':
            newText = `\`${selectedText}\``;
            break;
        case 'ul':
            newText = `- ${selectedText}`;
            break;
        default:
            return;
    }
    textarea.setRangeText(newText, start, end, 'end');
    textarea.focus();
    // Обновляем превью после вставки
    preview.innerHTML = parseMarkdown(textarea.value);
}

/**
 * Инициализация приложения.
 */
export function init() {
    textarea = document.getElementById('md-textarea');
    preview = document.getElementById('md-preview');
    toolbar = document.getElementById('md-toolbar');

    addListener(textarea, 'input', () => {
        const parsedHtml = parseMarkdown(textarea.value);
        preview.innerHTML = parsedHtml;
    });
    
    addListener(toolbar, 'click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.md) {
            insertMarkdown(button.dataset.md);
        }
    });

    // Первоначальная отрисовка
    preview.innerHTML = parseMarkdown(textarea.value);
}

/**
 * Очистка ресурсов при закрытии приложения.
 */
export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
