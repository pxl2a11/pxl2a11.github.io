import { getUserData, saveUserData } from '/js/dataManager.js';

export function getHtml() {
    return `
        <div class="p-4">
            <!-- Верхняя панель управления -->
            <div class="flex justify-between items-center mb-4 relative">
                <!-- Кнопка Создать и выпадающее меню -->
                <div class="relative">
                    <button id="create-btn" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>
                        Создать
                    </button>
                    <!-- Выбор типа для создания -->
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

            <!-- Модальное окно для создания/редактирования -->
            <div id="editor-modal" class="hidden fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
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
    const editorModal = document.getElementById('editor-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalInputTitle = document.getElementById('modal-input-title');
    const modalTextareaContent = document.getElementById('modal-textarea-content');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    // --- Состояние приложения ---
    let lists = getUserData('lists', []);
    let currentFilter = 'all';
    let editingListIndex = null; // Индекс редактируемого списка

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
                contentHtml = sortedItems.length > 0 ? sortedItems.map((task) => `
                    <div class="flex items-center p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" data-list-index="${originalIndex}" data-task-index="${lists[originalIndex].items.indexOf(task)}" class="task-checkbox h-5 w-5 rounded-full flex-shrink-0" ${task.completed ? 'checked' : ''}>
                        <span class="ml-3 break-all ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</span>
                    </div>
                `).join('') : '<p class="text-sm text-gray-400 px-1">Задач нет</p>';
            } else { // note
                contentHtml = `<p class="whitespace-pre-wrap break-words p-1">${list.content}</p>`;
            }

            return `
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg break-all mr-4">${list.title}</h4>
                        <div class="flex items-center flex-shrink-0">
                             <button data-list-index="${originalIndex}" class="list-edit-btn p-1 text-gray-500 hover:text-blue-500">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="-4 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.438 22.469v-4.031l2.5-2.5v7.344c0 1.469-1.219 2.688-2.656 2.688h-14.625c-1.469 0-2.656-1.219-2.656-2.688v-14.594c0-1.469 1.188-2.688 2.656-2.688h14.844v0.031l-2.5 2.469h-11.5c-0.531 0-1 0.469-1 1.031v12.938c0 0.563 0.469 1 1 1h12.938c0.531 0 1-0.438 1-1zM19.813 7.219l2.656 2.656 1.219-1.219-2.656-2.656zM10.469 16.594l2.625 2.656 8.469-8.469-2.625-2.656zM8.594 21.094l3.625-0.969-2.656-2.656z"></path>
                                </svg>
                            </button>
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

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
    const openModal = (type, listIndex = null) => {
        editingListIndex = listIndex;

        if (editingListIndex !== null) {
            const list = lists[editingListIndex];
            modalTitle.textContent = `Редактировать ${list.type === 'task' ? 'список задач' : 'заметку'}`;
            modalInputTitle.value = list.title;
            if (list.type === 'task') {
                modalTextareaContent.value = list.items.map(item => item.text).join('\n');
                modalTextareaContent.placeholder = 'Введите задачи, каждая с новой строки...';
            } else {
                modalTextareaContent.value = list.content;
                modalTextareaContent.placeholder = 'Введите текст заметки...';
            }
        } else {
            modalInputTitle.value = '';
            modalTextareaContent.value = '';
            if (type === 'task') {
                modalTitle.textContent = 'Новый список задач';
                modalTextareaContent.placeholder = 'Введите задачи, каждая с новой строки...';
            } else {
                modalTitle.textContent = 'Новая заметка';
                modalTextareaContent.placeholder = 'Введите текст заметки...';
            }
        }
        modalSaveBtn.onclick = () => saveList(type);
        editorModal.classList.remove('hidden');
        modalInputTitle.focus();
    };

    const closeModal = () => {
        editingListIndex = null;
        editorModal.classList.add('hidden');
    };

    const saveList = (type) => {
        const title = modalInputTitle.value.trim();
        if (!title) {
            alert('Название не может быть пустым!');
            return;
        }

        const content = modalTextareaContent.value.trim();
        const items = content.split('\n').map(text => text.trim()).filter(text => text);

        if (editingListIndex !== null) {
            const list = lists[editingListIndex];
            list.title = title;
            if (list.type === 'task') {
                const oldItems = new Map(list.items.map(item => [item.text, item.completed]));
                list.items = items.map(text => ({ text, completed: oldItems.get(text) || false }));
            } else {
                list.content = content;
            }
        } else {
            const newList = { id: Date.now(), title, type };
            if (type === 'task') {
                newList.items = items.map(text => ({ text, completed: false }));
            } else {
                newList.content = content;
            }
            lists.unshift(newList);
        }

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
            openModal(btn.dataset.type);
        }
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    editorModal.addEventListener('click', e => { if (e.target === editorModal) closeModal(); });

    filterButtonsContainer.addEventListener('click', e => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            filterButtonsContainer.querySelector('.active').classList.remove('active');
            filterBtn.classList.add('active');
            currentFilter = filterBtn.dataset.filter;
            renderLists();
        }
    });

    listsContainer.addEventListener('click', e => {
        const target = e.target;
        
        const deleteBtn = target.closest('.list-delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const index = parseInt(deleteBtn.dataset.listIndex, 10);
            if (confirm(`Вы уверены, что хотите удалить список "${lists[index].title}"?`)) {
                lists.splice(index, 1);
                saveLists();
                renderLists();
            }
            return;
        }

        const editBtn = target.closest('.list-edit-btn');
        if (editBtn) {
            e.stopPropagation();
            const index = parseInt(editBtn.dataset.listIndex, 10);
            const list = lists[index];
            openModal(list.type, index);
            return;
        }
        
        if (target.classList.contains('task-checkbox')) {
            const listIndex = parseInt(target.dataset.listIndex, 10);
            const taskIndex = parseInt(target.dataset.taskIndex, 10);
            // Проверка на случай если taskIndex невалидный
            if (taskIndex >= 0 && taskIndex < lists[listIndex].items.length) {
                 lists[listIndex].items[taskIndex].completed = target.checked;
                 saveLists();
                 renderLists();
            }
        }
    });

    // --- ПЕРВАЯ ОТРИСОВКА ---
    renderLists();
}

export function cleanup() {}
