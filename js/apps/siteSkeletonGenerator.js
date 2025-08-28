// js/apps/siteSkeletonGenerator.js

let zipInstance = null;
let fileTreeContainer, dropZone, fileInput, generateBtn, outputCode, copyBtn, instructions, resultsContainer;

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
            .file-tree li.closed > .entry-label::before { content: '📂'; } /* Could be changed to closed folder icon */

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
            #output-code {
                max-height: 400px;
                overflow-y: auto;
                background-color: #f3f4f6;
                border: 1px solid #e5e7eb;
                padding: 1rem;
                border-radius: 0.5rem;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .dark #output-code {
                background-color: #1f2937;
                border-color: #374151;
            }
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
                <h3 class="text-lg font-semibold mb-2">3. Сгенерируйте JSON</h3>
                <button id="generate-btn" class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Создать JSON-каркас
                </button>
            </div>

            <div id="results-container" class="hidden">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold">4. Результат</h3>
                    <button id="copy-json-btn" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm font-semibold py-1 px-3 rounded-md transition-colors">Копировать</button>
                </div>
                <pre><code id="output-code"></code></pre>
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
    outputCode = document.getElementById('output-code');
    copyBtn = document.getElementById('copy-json-btn');
    instructions = document.getElementById('instructions');
    resultsContainer = document.getElementById('results-container');
    
    // --- Обработчики для Drop Zone ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // --- Обработчик генерации JSON ---
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
            li.className = 'folder';
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


function handleTreeClick(e) {
    const label = e.target.closest('.entry-label');
    if (!label) return;

    if (e.target.type === 'checkbox') {
        // Логика для чекбоксов
        const isChecked = e.target.checked;
        const li = label.closest('li');
        const childCheckboxes = li.querySelectorAll('input[type="checkbox"]');
        childCheckboxes.forEach(cb => cb.checked = isChecked);
    } else {
        // Логика для сворачивания/разворачивания папок
        const li = e.target.closest('li.folder');
        if (li) {
            li.classList.toggle('closed');
        }
    }
}

async function handleGenerateJson() {
    if (!zipInstance) return;
    generateBtn.textContent = 'Генерация...';
    generateBtn.disabled = true;

    const checkedPaths = Array.from(fileTreeContainer.querySelectorAll('input[type="checkbox"]:checked'))
                             .map(cb => cb.dataset.path);
    
    const root = { type: 'root', children: [] };
    
    async function buildJsonNode(path) {
        const zipEntry = zipInstance.file(path);
        if (!zipEntry) return null;
        
        if (zipEntry.dir) {
            return { type: 'folder', name: zipEntry.name.split('/').slice(-2, -1)[0], children: [] };
        } else {
            const content = await zipEntry.async('string');
            return { type: 'file', name: zipEntry.name.split('/').pop(), content: content };
        }
    }

    const structure = {};
    const filePromises = [];
    const fileNodes = [];

    checkedPaths.forEach(path => {
        if (path.endsWith('/')) return; // Обрабатываем только файлы напрямую
        let currentLevel = structure;
        const parts = path.split('/');
        
        parts.forEach((part, index) => {
            if (index === parts.length - 1) { // Файл
                const promise = zipInstance.file(path).async('string').then(content => {
                    currentLevel[part] = {
                        type: 'file',
                        name: part,
                        content: content
                    };
                });
                filePromises.push(promise);
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

    outputCode.textContent = JSON.stringify(finalJson, null, 2);
    resultsContainer.classList.remove('hidden');
    generateBtn.textContent = 'Создать JSON-каркас';
    generateBtn.disabled = false;
}

function handleCopy() {
    if (outputCode.textContent) {
        navigator.clipboard.writeText(outputCode.textContent).then(() => {
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => { copyBtn.textContent = 'Копировать'; }, 2000);
        }).catch(err => {
            console.error('Не удалось скопировать текст: ', err);
            alert('Не удалось скопировать текст.');
        });
    }
}

// --- Очистка при выходе из приложения ---
export function cleanup() {
    zipInstance = null;
    dropZone.removeEventListener('click', () => fileInput.click());
    dropZone.removeEventListener('dragover', handleDragOver);
    dropZone.removeEventListener('dragleave', handleDragLeave);
    dropZone.removeEventListener('drop', handleDrop);
    fileInput.removeEventListener('change', handleFileSelect);
    generateBtn.removeEventListener('click', handleGenerateJson);
    copyBtn.removeEventListener('click', handleCopy);
    fileTreeContainer.removeEventListener('click', handleTreeClick);
}
