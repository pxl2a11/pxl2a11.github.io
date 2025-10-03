// 12js/apps/notesAndTasks.js
import { getUserData, saveUserData } from '/js/dataManager.js';

// ПРЕДПОЛОЖЕНИЕ: Библиотека SortableJS загружена и доступна глобально как 'Sortable'.

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
            /* Базовый стиль для редактируемых элементов */
            .editable-element {
                cursor: text;
                display: inline-block;
            }
            /* Задаем ширину по содержимому конкретно для заголовка */
            .list-header > .editable-element {
                width: auto;
                max-width: 100%; /* Чтобы очень длинные заголовки не ломали верстку */
            }
            /* Возвращаем полную ширину для контента заметки и текста задачи */
            .list-content .editable-element, .task-item-container .editable-element {
                width: 100%;
            }
            /* Стили для перетаскивания */
            .drag-handle {
                cursor: grab;
            }
            .drag-handle:active {
                cursor: grabbing;
            }
            /* Класс для "призрачного" элемента при перетаскивании */
            .sortable-ghost {
                opacity: 0.4;
                background-color: #a0aec0;
            }
            /* Стили для сворачивания */
            .list-content {
                transition: all 0.3s ease-in-out;
                overflow: hidden;
            }
            .list-content.collapsed {
                max-height: 0;
                padding-top: 0;
                padding-bottom: 0;
                opacity: 0;
                margin-top: 0;
            }
            .collapse-btn svg {
                transition: transform 0.2s ease-in-out;
            }
            .collapse-btn.collapsed svg {
                transform: rotate(-90deg);
            }
            /* Курсор для всей области заголовка, намекающий на кликабельность */
            .list-header {
                cursor: pointer;
            }
            /* Скрытие элемента для скринридеров */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
        </style>
        <div class="p-4">
            <!-- Верхняя панель управления -->
            <header class="flex justify-between items-center mb-4 relative">
                <!-- Кнопка Создать и выпадающее меню -->
                <div class="relative">
                    <button id="create-btn" aria-haspopup="true" aria-expanded="false" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>
                        Создать
                    </button>
                    <div id="create-choice-box" role="menu" class="hidden absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-20 w-48">
                        <button role="menuitem" data-type="task" class="create-type-btn w-full text-left p-2 rounded hover:bg-blue-500 hover:text-white">Список задач</button>
                        <button role="menuitem" data-type="note" class="create-type-btn w-full text-left p-2 rounded hover:bg-blue-500 hover:text-white">Заметку</button>
                    </div>
                </div>

                <!-- Фильтры -->
                <div id="filter-buttons" role="tablist" aria-label="Фильтр контента" class="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button role="tab" aria-selected="true" data-filter="all" class="filter-btn active px-3 py-1 text-sm font-semibold rounded-md">Все</button>
                    <button role="tab" aria-selected="false" data-filter="task" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Задачи</button>
                    <button role="tab" aria-selected="false" data-filter="note" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Заметки</button>
                </div>
            </header>

            <!-- Контейнер для списков -->
            <main id="lists-container" class="space-y-4"></main>
        </div>
    `;
}

export async function init() {
    // --- Получение элементов DOM ---
    const listsContainer = document.getElementById('lists-container');
    const createBtn = document.getElementById('create-btn');
    const createChoiceBox = document.getElementById('create-choice-box');
    const filterButtonsContainer = document.getElementById('filter-buttons');

    // --- Состояние приложения ---
    let lists = getUserData('lists', []);
    let currentFilter = 'all';

    const saveLists = () => saveUserData('lists', lists);
    
    const initSortable = () => {
        if (window.Sortable) {
            new Sortable(listsContainer, {
                animation: 150,
                handle: '.drag-handle',
                draggable: '.list-card',
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    const [movedItem] = lists.splice(evt.oldIndex, 1);
                    lists.splice(evt.newIndex, 0, movedItem);
                    saveLists();
                    renderLists();
                },
            });
        }
    };

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
            const listId = `list-${list.id}`;

            if (list.type === 'task') {
                const sortedItems = [...list.items].sort((a, b) => a.completed - b.completed);
                const tasksHtml = sortedItems.map((task) => {
                    const taskIndex = lists[originalIndex].items.indexOf(task);
                    return `
                    <li class="task-item-container flex items-center justify-between p-1 rounded-md" role="listitem">
                        <div class="flex items-center flex-grow mr-2">
                            <input type="checkbox" id="task-${list.id}-${taskIndex}" data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="task-checkbox h-5 w-5 rounded-full flex-shrink-0" ${task.completed ? 'checked' : ''}>
                            <label for="task-${list.id}-${taskIndex}" data-list-index="${originalIndex}" data-task-index="${taskIndex}" role="textbox" contenteditable="false" class="task-text editable-element ml-3 break-all focus:outline-none focus:bg-white dark:focus:bg-gray-600 p-1 rounded ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</label>
                        </div>
                        <button aria-label="Удалить задачу" data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="delete-task-btn p-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                            <svg class="w-5 h-5" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32-32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32-32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32-32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32-32z"/>
                            </svg>
                        </button>
                    </li>
                `}).join('');
                
                contentHtml = `<ul role="list" aria-labelledby="${listId}-title" class="space-y-1">${tasksHtml}</ul>
                    <div class="mt-2">
                        <div role="textbox" contenteditable="true" data-list-index="${originalIndex}" class="new-task-input p-1 focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded" data-placeholder="Новая задача..." aria-label="Поле для ввода новой задачи"></div>
                    </div>`;

            } else { // note
                contentHtml = `<div data-list-index="${originalIndex}" data-field="content" role="textbox" aria-multiline="true" contenteditable="false" class="editable-element whitespace-pre-wrap break-words p-1 focus:outline-none focus:bg-white dark:focus:bg-gray-600 rounded">${list.content}</div>`;
            }

            const isCollapsed = list.collapsed ?? false;

            return `
                <section class="list-card bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow" aria-labelledby="${listId}-title">
                    <header class="list-header flex justify-between items-start mb-2" data-list-index="${originalIndex}">
                        <h4 id="${listId}-title" data-list-index="${originalIndex}" data-field="title" role="textbox" contenteditable="false" class="editable-element font-bold text-lg break-all mr-4 focus:outline-none focus:bg-white dark:focus:bg-gray-600 p-1 rounded">${list.title}</h4>
                        
                        <div class="flex items-center flex-shrink-0">
                            <button aria-label="${isCollapsed ? 'Развернуть' : 'Свернуть'} список" class="collapse-btn p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${isCollapsed ? 'collapsed' : ''}" tabindex="-1" aria-expanded="${!isCollapsed}">
                               <svg class="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                            <div class="drag-handle text-gray-400 p-1 hover:text-gray-600 dark:hover:text-gray-200" role="button" aria-label="Перетащить список" aria-describedby="drag-instructions">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M22 6C22.5523 6 23 6.44772 23 7C23 7.55229 22.5523 8 22 8H2C1.44772 8 1 7.55228 1 7C1 6.44772 1.44772 6 2 6L22 6Z" fill="currentColor"/>
                                    <path d="M22 11C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H22Z" fill="currentColor"/>
                                    <path d="M23 17C23 16.4477 22.5523 16 22 16H2C1.44772 16 1 16.4477 1 17C1 17.5523 1.44772 18 2 18H22C22.5523 18 23 17.5523 23 17Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <button data-list-index="${originalIndex}" class="list-delete-btn p-1 text-red-500 hover:text-red-700 ml-1" aria-label="Удалить список">
                               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M697.4 759.2l61.8-61.8L573.8 512l185.4-185.4-61.8-61.8L512 450.2 326.6 264.8l-61.8 61.8L450.2 512 264.8 697.4l61.8 61.8L512 573.8z"></path>
                               </svg>
                            </button>
                        </div>
                    </header>
                    <div class="list-content space-y-1 ${isCollapsed ? 'collapsed' : ''}">${contentHtml}</div>
                </section>
                <p id="drag-instructions" class="sr-only">Для изменения порядка используйте перетаскивание мышью.</p>
            `;
        }).join('');
        
        initSortable();
    };

    // --- ЛОГИКА СОЗДАНИЯ ---
    const createNewList = (type) => {
        const newList = {
            id: Date.now(),
            type,
            collapsed: false
        };

        if (type === 'task') {
            newList.title = 'Название списка задач';
            newList.items = [{ text: 'Новая задача', completed: false }];
        } else { // 'note'
            newList.title = 'Название заметки';
            newList.content = 'Новая заметка';
        }

        lists.unshift(newList);
        saveLists();
        renderLists();
    };


    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = createBtn.getAttribute('aria-expanded') === 'true';
        createBtn.setAttribute('aria-expanded', !isExpanded);
        createChoiceBox.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        createBtn.setAttribute('aria-expanded', 'false');
        createChoiceBox.classList.add('hidden');
    });

    createChoiceBox.addEventListener('click', (e) => {
        const btn = e.target.closest('.create-type-btn');
        if (btn) {
            e.stopPropagation();
            createChoiceBox.classList.add('hidden');
            createBtn.setAttribute('aria-expanded', 'false');
            createNewList(btn.dataset.type);
        }
    });
    
    filterButtonsContainer.addEventListener('click', e => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            filterButtonsContainer.querySelector('[aria-selected="true"]').setAttribute('aria-selected', 'false');
            filterButtonsContainer.querySelector('.active').classList.remove('active');
            
            filterBtn.classList.add('active');
            filterBtn.setAttribute('aria-selected', 'true');
            currentFilter = filterBtn.dataset.filter;
            renderLists();
        }
    });

    // Полностью переработанный обработчик кликов для большей надежности
    listsContainer.addEventListener('click', e => {
        const target = e.target;
        
        // Приоритет 1: Активация редактирования текста
        const editableTarget = target.closest('.editable-element');
        if (editableTarget && editableTarget.getAttribute('contenteditable') !== 'true') {
            editableTarget.setAttribute('contenteditable', 'true');
            editableTarget.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editableTarget);
            range.collapse(false); // установить курсор в конец
            selection.removeAllRanges();
            selection.addRange(range);
            return; 
        }

        // Приоритет 2: Удаление всего списка
        const deleteListBtn = target.closest('.list-delete-btn');
        if (deleteListBtn) {
            const index = parseInt(deleteListBtn.dataset.listIndex, 10);
            if (confirm(`Вы уверены, что хотите удалить список "${lists[index].title}"?`)) {
                lists.splice(index, 1);
                saveLists();
                renderLists();
            }
            return;
        }
        
        // Приоритет 3: Удаление отдельной задачи
        const deleteTaskBtn = target.closest('.delete-task-btn');
        if (deleteTaskBtn) {
            const listIndex = parseInt(deleteTaskBtn.dataset.listIndex, 10);
            const taskIndex = parseInt(deleteTaskBtn.dataset.taskIndex, 10);
            lists[listIndex].items.splice(taskIndex, 1);
            saveLists();
            renderLists();
            return;
        }
        
        // Приоритет 4: Отметка чекбокса
        if (target.classList.contains('task-checkbox')) {
            const listIndex = parseInt(target.dataset.listIndex, 10);
            const taskIndex = parseInt(target.dataset.taskIndex, 10);
            if (taskIndex >= 0 && taskIndex < lists[listIndex].items.length) {
                 lists[listIndex].items[taskIndex].completed = target.checked;
                 saveLists();
                 renderLists();
            }
            return;
        }
        
        // Приоритет 5: Сворачивание/разворачивание списка
        const listHeader = target.closest('.list-header');
        if (listHeader) {
            // Игнорируем клик, если он был на элементе для перетаскивания или на редактируемом элементе
            if (target.closest('.drag-handle') || target.closest('.editable-element')) {
                return;
            }
            const index = parseInt(listHeader.dataset.listIndex, 10);
            if (index >= 0 && index < lists.length) {
                lists[index].collapsed = !(lists[index].collapsed ?? false);
                saveLists();
                renderLists();
            }
        }
    });


    // Сохранение при потере фокуса (blur)
    listsContainer.addEventListener('focusout', e => {
        const target = e.target;

        if (target.classList.contains('new-task-input')) {
            const text = target.innerText.trim();
            if (text) {
                const listIndex = parseInt(target.dataset.listIndex, 10);
                lists[listIndex].items.push({ text, completed: false });
                saveLists();
                renderLists();
            }
            return;
        }

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
                    target.innerText = ''; 
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
    
    // Обработка вставки для исключения стилей
    listsContainer.addEventListener('paste', e => {
        const target = e.target.closest('[contenteditable="true"]');
        if (target) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            selection.collapseToEnd();
        }
    });

    // --- ПЕРВАЯ ОТРИСОВКА ---
    renderLists();
}

export function cleanup() {}
