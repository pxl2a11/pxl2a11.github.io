// 37js/apps/siteSkeletonGenerator.js

let zipInstance = null;
let fileTreeContainer, dropZone, fileInput, generateBtn, copyBtn, instructions, includeContentCheckbox;
let lastGeneratedJson = ''; // Переменная для хранения последнего сгенерированного JSON

// --- HTML-структура приложения ---
export function getHtml() {
    return `
        <style>
            .file-tree { list-style-type: none; padding-left: 20px; }
            .file-tree li { position: relative; }
            .file-tree .folder > .entry-label::before { 
                content: '📁'; 
                margin-right: 8px;
            }
            .file-tree .file > .entry-label::before { 
                content: '📄'; 
                margin-right: 8px;
            }
            .file-tree .entry-label { 
                cursor: pointer; 
                display: flex; 
                align-items: center;
                padding: 4px;
                border-radius: 4px;
            }
            .file-tree .entry-label:hover {
                background-color: rgba(0,0,0,0.05);
            }
            .dark .file-tree .entry-label:hover {
                background-color: rgba(255,255,255,0.05);
            }
            .file-tree .entry-label input {
                margin-right: 8px;
            }
            .file-tree ul { 
                display: block;
                padding-left: 25px;
            }
            .file-tree li.closed > ul { display: none; }
            .file-tree li.folder.closed > .entry-label::before { content: '📁'; } /* When closed */
            .file-tree li.folder:not(.closed) > .entry-label::before { content: '📂'; } /* When open */


            .drop-zone {
                border: 2px dashed #cbd5e1;
                border-radius: 0.75rem;
                padding: 2rem;
                text-align: center;
                cursor: pointer;
                transition: background-color 0.2s, border-color 0.2s;
            }
            .dark .drop-zone { border-color: #475569; }
            .drop-zone.dragover {
                background-color: #dbeafe;
                border-color: #3b82f6;
            }
            .dark .drop-zone.dragover { background-color: #1e3a8a; }
        </style>

        <div class="space-y-6">
            <div id="instructions">
                <h3 class="text-lg font-semibold mb-2">1. Загрузите архив</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Загрузите ZIP-архив вашего сайта. Приложение обработает его в браузере, файлы никуда не отправляются. 
                    (Обратите внимание: архивы .RAR не поддерживаются).
                </p>
                <div id="drop-zone" class="drop-zone">
                    <p>Перетащите ZIP-файл сюда или нажмите, чтобы выбрать</p>
                    <input type="file" id="zip-input" class="hidden" accept=".zip">
                </div>
            </div>

            <div id="file-tree-section" class="hidden">
                <h3 class="text-lg font-semibold mb-2">2. Выберите файлы и папки</h3>
                <div id="file-tree-container" class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 max-h-96 overflow-auto"></div>
            </div>
            
            <div id="generate-section" class="hidden">
                <h3 class="text-lg font-semibold mb-2">3. Сгенерируйте результат</h3>
                
                <div class="flex items-center mb-4">
                    <input id="include-content-checkbox" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600">
                    <label for="include-content-checkbox" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Включить содержимое файлов
                    </label>
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                    <button id="generate-btn" class="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Скачать JSON-каркас
                    </button>
                    <button id="copy-json-btn" class="flex-grow sm:flex-grow-0 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Копировать JSON
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Инициализация приложения и обработчики событий ---
export function init() {
    fileTreeContainer = document.getElementById('file-tree-container');
    dropZone = document.getElementById('drop-zone');
    fileInput = document.getElementById('zip-input');
    generateBtn = document.getElementById('generate-btn');
    copyBtn = document.getElementById('copy-json-btn');
    instructions = document.getElementById('instructions');
    includeContentCheckbox = document.getElementById('include-content-checkbox');
    
    // --- Обработчики для Drop Zone ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // --- Обработчики кнопок ---
    generateBtn.addEventListener('click', handleGenerateJson);
    copyBtn.addEventListener('click', handleCopy);

    // --- Делегирование событий для дерева файлов ---
    fileTreeContainer.addEventListener('click', handleTreeClick);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target.files.length) {
        processFile(e.target.files[0]);
    }
}

async function processFile(file) {
    if (!file || !file.type.includes('zip')) {
        alert('Пожалуйста, выберите ZIP-файл.');
        return;
    }
    
    dropZone.innerHTML = `<p>Загрузка и обработка архива...</p>`;
    try {
        zipInstance = await JSZip.loadAsync(file);
        const tree = buildTreeFromZip(zipInstance);
        renderFileTree(tree, fileTreeContainer);
        
        instructions.classList.add('hidden');
        document.getElementById('file-tree-section').classList.remove('hidden');
        document.getElementById('generate-section').classList.remove('hidden');
        copyBtn.disabled = true; // Сбрасываем кнопку "Копировать" при загрузке нового файла
        lastGeneratedJson = '';
    } catch (error) {
        console.error("Ошибка обработки ZIP-файла:", error);
        dropZone.innerHTML = `<p class="text-red-500">Не удалось прочитать архив. Попробуйте другой файл.</p>`;
    }
}

function buildTreeFromZip(zip) {
    const root = { files: [], dirs: {} };
    zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return; // Пропускаем папки, создаем их на лету
        const parts = relativePath.split('/').filter(p => p);
        let currentLevel = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) { // Это файл
                currentLevel.files.push({ name: part, path: relativePath });
            } else { // Это папка
                if (!currentLevel.dirs[part]) {
                    currentLevel.dirs[part] = { files: [], dirs: {} };
                }
                currentLevel = currentLevel.dirs[part];
            }
        }
    });
    return root;
}

function renderFileTree(tree, container) {
    container.innerHTML = ''; // Очищаем контейнер
    const rootUl = document.createElement('ul');
    rootUl.className = 'file-tree';

    const renderNode = (node, parentUl, parentPath = '') => {
        Object.keys(node.dirs).sort().forEach(dirName => {
            const li = document.createElement('li');
            li.className = 'folder closed'; 
            const currentPath = parentPath ? `${parentPath}/${dirName}` : dirName;
            li.innerHTML = `
                <div class="entry-label">
                    <input type="checkbox" data-path="${currentPath}/" checked>
                    <span>${dirName}</span>
                </div>
            `;
            const ul = document.createElement('ul');
            li.appendChild(ul);
            parentUl.appendChild(li);
            renderNode(node.dirs[dirName], ul, currentPath);
        });
        
        node.files.sort((a,b) => a.name.localeCompare(b.name)).forEach(file => {
            const li = document.createElement('li');
            li.className = 'file';
            li.innerHTML = `
                <div class="entry-label">
                    <input type="checkbox" data-path="${file.path}" checked>
                    <span>${file.name}</span>
                </div>
            `;
            parentUl.appendChild(li);
        });
    };

    renderNode(tree, rootUl);
    container.appendChild(rootUl);
}


// --- ИСПРАВЛЕНИЕ 2: Улучшенная логика обработки кликов по дереву ---
function handleTreeClick(e) {
    const label = e.target.closest('.entry-label');
    if (!label) return;

    const li = label.closest('li');
    if (!li) return;

    // Если клик был по чекбоксу
    if (e.target.type === 'checkbox') {
        const isChecked = e.target.checked;
        // Находим все дочерние чекбоксы и меняем их состояние
        const childCheckboxes = li.querySelectorAll('input[type="checkbox"]');
        childCheckboxes.forEach(cb => cb.checked = isChecked);
    } 
    // Если клик был НЕ по чекбоксу, И это папка
    else if (li.classList.contains('folder')) {
        // Переключаем класс 'closed', чтобы раскрыть/скрыть папку
        li.classList.toggle('closed');
    }
    // Если клик был по файлу (не по чекбоксу), ничего не делаем.
}

async function handleGenerateJson() {
    if (!zipInstance) return;
    generateBtn.textContent = 'Генерация...';
    generateBtn.disabled = true;
    copyBtn.disabled = true;

    const shouldIncludeContent = includeContentCheckbox.checked;
    const checkedPaths = Array.from(fileTreeContainer.querySelectorAll('input[type="checkbox"]:checked'))
                             .map(cb => cb.dataset.path);
    
    const structure = {};
    const filePromises = [];

    checkedPaths.forEach(path => {
        if (path.endsWith('/')) return; // Обрабатываем только файлы напрямую
        let currentLevel = structure;
        const parts = path.split('/');
        
        parts.forEach((part, index) => {
            if (index === parts.length - 1) { // Файл
                if (shouldIncludeContent) {
                    const promise = zipInstance.file(path).async('string').then(content => {
                        // --- ИСПРАВЛЕНИЕ 1: Сохраняем контент как есть ---
                        // JSON.stringify() позже сам правильно всё обработает
                        currentLevel[part] = {
                            type: 'file',
                            name: part,
                            content: content
                        };
                    });
                    filePromises.push(promise);
                } else {
                    // Если содержимое не нужно, создаем объект синхронно с пустым контентом
                    currentLevel[part] = {
                        type: 'file',
                        name: part,
                        content: ""
                    };
                }
            } else { // Папка
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            }
        });
    });

    await Promise.all(filePromises);

    function convertStructureToArray(node) {
        const result = [];
        for (const key in node) {
            const child = node[key];
            if (child.type === 'file') {
                result.push(child);
            } else {
                result.push({
                    type: 'folder',
                    name: key,
                    children: convertStructureToArray(child)
                });
            }
        }
        return result.sort((a,b) => (a.type > b.type) ? 1 : (a.name > b.name) ? 1 : -1);
    }
    
    const finalJson = convertStructureToArray(structure);
    // JSON.stringify корректно обработает все спецсимволы, включая переносы строк
    const jsonString = JSON.stringify(finalJson, null, 2);

    // Сохраняем результат в переменную для копирования
    lastGeneratedJson = jsonString;

    // Инициируем скачивание файла
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-skeleton.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Возвращаем кнопки в исходное состояние и активируем кнопку "Копировать"
    generateBtn.textContent = 'Скачать JSON-каркас';
    generateBtn.disabled = false;
    copyBtn.disabled = false;
}

function handleCopy() {
    if (lastGeneratedJson) {
        navigator.clipboard.writeText(lastGeneratedJson).then(() => {
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => { copyBtn.textContent = 'Копировать JSON'; }, 2000);
        }).catch(err => {
            console.error('Не удалось скопировать текст: ', err);
            alert('Не удалось скопировать текст.');
        });
    }
}

// --- Очистка при выходе из приложения ---
export function cleanup() {
    zipInstance = null;
    lastGeneratedJson = '';
    // Удаляем обработчики, чтобы избежать утечек памяти
    dropZone.removeEventListener('click', () => fileInput.click());
    dropZone.removeEventListener('dragover', handleDragOver);
    dropZone.removeEventListener('dragleave', handleDragLeave);
    dropZone.removeEventListener('drop', handleDrop);
    fileInput.removeEventListener('change', handleFileSelect);
    generateBtn.removeEventListener('click', handleGenerateJson);
    copyBtn.removeEventListener('click', handleCopy);
    fileTreeContainer.removeEventListener('click', handleTreeClick);
}
