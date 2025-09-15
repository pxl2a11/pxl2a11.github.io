// 15js/apps/notesAndTasks.js
import { getUserData, saveUserData } from '/js/dataManager.js';

export function getHtml() {
    return `
        <style>
            /* CSS для отображения плейсхолдера в contenteditable элементах */
            [contenteditable][data-placeholder]:empty::before {
                content: attr(data-placeholder);
                color: #9ca3af; /* gray-400 */
                pointer-events: none;
                display: block;
            }
            /* Делаем редактируемые элементы строчно-блочными, чтобы они не занимали всю ширину,
               и добавляем курсор для визуальной подсказки. */
            .editable-element {
                cursor: pointer;
                display: inline-block; /* Это ключевое изменение */
                /* Для заголовка и заметки нужна вся ширина, но кликабельная область будет только у текста */
                width: 100%; 
            }
        </style>
        <div class="p-4">
            <!-- Верхняя панель управления -->
            <div class="flex justify-between items-center mb-4 relative">
                <!-- Кнопка Создать и выпадающее меню -->
                <div class="relative">
                    <button id="create-btn" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>
                        Создать
                    </button>
                    <div id="create-choice-box" class="hidden absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-20 w-48">
                        <button data-type="task" class="create-type-btn w-full text-left p-2 rounded hover:bg-blue-500 hover:text-white">Список задач</button>
                        <button data-type="note" class="create-type-btn w-full text-left p-2 rounded hover:bg-blue-500 hover:text-white">Заметку</button>
                    </div>
                </div>

                <!-- Фильтры -->
                <div id="filter-buttons" class="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button data-filter="all" class="filter-btn active px-3 py-1 text-sm font-semibold rounded-md">Все</button>
                    <button data-filter="task" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Задачи</button>
                    <button data-filter="note" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Заметки</button>
                </div>
            </div>

            <!-- Контейнер для списков -->
            <div id="lists-container" class="space-y-4"></div>

            <!-- Модальное окно для СОЗДАНИЯ -->
            <div id="creator-modal" class="hidden fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 w-full max-w-lg relative">
                    <button id="close-modal-btn" class="absolute top-3 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                    <h3 id="modal-title" class="text-xl font-semibold mb-4">Новый список</h3>
                    <div class="space-y-4">
                        <input id="modal-input-title" type="text" placeholder="Название..." class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600">
                        <textarea id="modal-textarea-content" rows="6" class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"></textarea>
                        <button id="modal-save-btn" class="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function init() {
    // --- Получение элементов DOM ---
    const listsContainer = document.getElementById('lists-container');
    const createBtn = document.getElementById('create-btn');
    const createChoiceBox = document.getElementById('create-choice-box');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const creatorModal = document.getElementById('creator-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalInputTitle = document.getElementById('modal-input-title');
    const modalTextareaContent = document.getElementById('modal-textarea-content');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    // --- Состояние приложения ---
    let lists = getUserData('lists', []);
    let currentFilter = 'all';

    const saveLists = () => saveUserData('lists', lists);

    // --- ЛОГИКА ОТРИСОВКИ ---
    const renderLists = () => {
        const filteredLists = lists.filter(list => currentFilter === 'all' || list.type === currentFilter);

        if (filteredLists.length === 0) {
            listsContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Ничего не найдено. Нажмите "Создать", чтобы добавить запись.</p>';
            return;
        }

        listsContainer.innerHTML = filteredLists.map((list) => {
            const originalIndex = lists.indexOf(list);
            let contentHtml = '';

            if (list.type === 'task') {
                const sortedItems = [...list.items].sort((a, b) => a.completed - b.completed);
                const tasksHtml = sortedItems.map((task) => {
                    const taskIndex = lists[originalIndex].items.indexOf(task);
                    return `
                    <div class="task-item-container flex items-center justify-between p-1 rounded-md">
                        <div class="flex items-center flex-grow mr-2">
                            <input type="checkbox" data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="task-checkbox h-5 w-5 rounded-full flex-shrink-0" ${task.completed ? 'checked' : ''}>
                            <span data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="task-text editable-element ml-3 break-all focus:outline-none focus:bg-white dark:focus:bg-gray-600 p-1 rounded ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</span>
                        </div>
                        <button data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="delete-task-btn p-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                            <svg class="w-5 h-5" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32-32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32-32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32-32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32-32z"/>
                            </svg>
                        </button>
                    </div>
                `}).join('');
                
                contentHtml = `${tasksHtml}
                    <div class="mt-2">
                        <div contenteditable="true" data-list-index="${originalIndex}" class="new-task-input p-1 focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded" data-placeholder="Новая задача..."></div>
                    </div>`;

            } else { // note
                contentHtml = `<div data-list-index="${originalIndex}" data-field="content" class="editable-element whitespace-pre-wrap break-words p-1 focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded">${list.content}</div>`;
            }

            return `
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow">
                    <div class="flex justify-between items-start mb-2">
                        <h4 data-list-index="${originalIndex}" data-field="title" class="editable-element font-bold text-lg break-all mr-4 focus:outline-none focus:bg-white dark:focus:bg-gray-600 p-1 rounded">${list.title}</h4>
                        <div class="flex items-center flex-shrink-0">
                            <button data-list-index="${originalIndex}" class="list-delete-btn p-1 text-red-500 hover:text-red-700 ml-1">
                               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M697.4 759.2l61.8-61.8L573.8 512l185.4-185.4-61.8-61.8L512 450.2 326.6 264.8l-61.8 61.8L450.2 512 264.8 697.4l61.8 61.8L512 573.8z"></path>
                               </svg>
                            </button>
                        </div>
                    </div>
                    <div class="space-y-1">${contentHtml}</div>
                </div>
            `;
        }).join('');
    };

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА (ТОЛЬКО ДЛЯ СОЗДАНИЯ) ---
    const openCreatorModal = (type) => {
        modalInputTitle.value = '';
        modalTextareaContent.value = '';
        if (type === 'task') {
            modalTitle.textContent = 'Новый список задач';
            modalTextareaContent.placeholder = 'Введите задачи, каждая с новой строки...';
        } else {
            modalTitle.textContent = 'Новая заметка';
            modalTextareaContent.placeholder = 'Введите текст заметки...';
        }
        modalSaveBtn.onclick = () => createNewList(type);
        creatorModal.classList.remove('hidden');
        modalInputTitle.focus();
    };

    const closeModal = () => {
        creatorModal.classList.add('hidden');
    };

    const createNewList = (type) => {
        const title = modalInputTitle.value.trim();
        if (!title) {
            alert('Название не может быть пустым!');
            return;
        }
        const content = modalTextareaContent.value.trim();
        const items = content.split('\n').map(text => text.trim()).filter(text => text);
        const newList = { id: Date.now(), title, type };
        if (type === 'task') {
            newList.items = items.map(text => ({ text, completed: false }));
        } else {
            newList.content = content;
        }
        lists.unshift(newList);
        saveLists();
        renderLists();
        closeModal();
    };

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createChoiceBox.classList.toggle('hidden');
    });

    document.addEventListener('click', () => createChoiceBox.classList.add('hidden'));

    createChoiceBox.addEventListener('click', (e) => {
        const btn = e.target.closest('.create-type-btn');
        if (btn) {
            e.stopPropagation();
            createChoiceBox.classList.add('hidden');
            openCreatorModal(btn.dataset.type);
        }
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    creatorModal.addEventListener('click', e => { if (e.target === creatorModal) closeModal(); });

    filterButtonsContainer.addEventListener('click', e => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            filterButtonsContainer.querySelector('.active').classList.remove('active');
            filterBtn.classList.add('active');
            currentFilter = filterBtn.dataset.filter;
            renderLists();
        }
    });

    // --- ОБРАБОТЧИКИ ДЛЯ СПИСКОВ ---
    listsContainer.addEventListener('click', e => {
        const target = e.target;
        
        // Активация редактирования по клику
        const editableTarget = target.closest('.editable-element');
        if (editableTarget && editableTarget.getAttribute('contenteditable') !== 'true') {
            editableTarget.setAttribute('contenteditable', 'true');
            editableTarget.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editableTarget);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return; // Прекращаем выполнение, чтобы не сработали другие клики
        }

        // Удаление всего списка
        const deleteListBtn = target.closest('.list-delete-btn');
        if (deleteListBtn) {
            e.stopPropagation();
            const index = parseInt(deleteListBtn.dataset.listIndex, 10);
            if (confirm(`Вы уверены, что хотите удалить список "${lists[index].title}"?`)) {
                lists.splice(index, 1);
                saveLists();
                renderLists();
            }
            return;
        }

        // Удаление отдельной задачи
        const deleteTaskBtn = target.closest('.delete-task-btn');
        if (deleteTaskBtn) {
            e.stopPropagation();
            const listIndex = parseInt(deleteTaskBtn.dataset.listIndex, 10);
            const taskIndex = parseInt(deleteTaskBtn.dataset.taskIndex, 10);
            lists[listIndex].items.splice(taskIndex, 1);
            saveLists();
            renderLists();
            return;
        }
        
        // Управление чекбоксами
        if (target.classList.contains('task-checkbox')) {
            const listIndex = parseInt(target.dataset.listIndex, 10);
            const taskIndex = parseInt(target.dataset.taskIndex, 10);
            if (taskIndex >= 0 && taskIndex < lists[listIndex].items.length) {
                 lists[listIndex].items[taskIndex].completed = target.checked;
                 saveLists();
                 renderLists();
            }
        }
    });

    // Сохранение при потере фокуса (blur)
    listsContainer.addEventListener('focusout', e => {
        const target = e.target;

        // --- НОВОЕ: Создание задачи при потере фокуса с поля "Новая задача" ---
        if (target.classList.contains('new-task-input')) {
            const text = target.innerText.trim();
            if (text) {
                const listIndex = parseInt(target.dataset.listIndex, 10);
                lists[listIndex].items.push({ text, completed: false });
                saveLists();
                renderLists(); // Перерисовываем, чтобы задача появилась, а поле ввода очистилось
            }
            return; // Завершаем, чтобы не сработал код ниже
        }

        // --- Старая логика для редактирования существующих элементов ---
        if (target.getAttribute('contenteditable') === 'true') {
            target.setAttribute('contenteditable', 'false');

            const listIndex = parseInt(target.dataset.listIndex, 10);
            if (isNaN(listIndex) || listIndex >= lists.length) return;

            const list = lists[listIndex];
            const newText = target.innerText;
            let shouldReRender = false;
            
            const field = target.dataset.field;
            if (field === 'title') {
                list.title = newText.trim() || "Без названия";
            } else if (field === 'content') {
                list.content = newText;
            }

            const taskIndexStr = target.dataset.taskIndex;
            if (taskIndexStr !== undefined) {
                const taskIndex = parseInt(taskIndexStr, 10);
                if (list.items && list.items[taskIndex]) {
                    if (newText.trim()) {
                        list.items[taskIndex].text = newText.trim();
                    } else {
                        list.items.splice(taskIndex, 1);
                        shouldReRender = true;
                    }
                }
            }
            saveLists();
            if (shouldReRender) {
                renderLists();
            }
        }
    });
    
    // Обработка нажатия Enter
    listsContainer.addEventListener('keydown', e => {
        const target = e.target;
        if (e.key === 'Enter' && target.getAttribute('contenteditable') === 'true') {
            e.preventDefault(); 

            if (target.classList.contains('new-task-input')) {
                const text = target.innerText.trim();
                if (text) {
                    const listIndex = parseInt(target.dataset.listIndex, 10);
                    lists[listIndex].items.push({ text, completed: false });
                    saveLists();
                    renderLists();
                    
                    setTimeout(() => {
                        const newInput = document.querySelector(`[data-list-index="${listIndex}"].new-task-input`);
                        if (newInput) newInput.focus();
                    }, 0);
                }
            } else {
                 target.blur();
            }
        }
    });

    // --- ИСПРАВЛЕНИЕ: Обработка вставки текста без стилей ---
    listsContainer.addEventListener('paste', e => {
        const target = e.target.closest('[contenteditable="true"]');
        if (target) {
            // Отменяем стандартное событие вставки
            e.preventDefault();
            // Получаем текст из буфера обмена
            const text = e.clipboardData.getData('text/plain');
            // Вставляем чистый текст
            document.execCommand('insertText', false, text);
        }
    });


    // --- ПЕРВАЯ ОТРИСОВКА ---
    renderLists();
}

export function cleanup() {}
