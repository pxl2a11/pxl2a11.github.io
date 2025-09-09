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
    // --- Логика миграции старых данных ---
    const migrateOldData = () => {
        const oldTasks = getUserData('tasks');
        const oldNotes = getUserData('notes');
        const oldItems = getUserData('items');
        
        let didMigrate = false;
        let migratedLists = [];

        // 1. Миграция из промежуточной версии ('items')
        if (oldItems && oldItems.length > 0) {
            const tasks = oldItems.filter(i => i.type === 'task').map(t => ({ text: t.text, completed: t.completed }));
            const notes = oldItems.filter(i => i.type === 'note').map(n => n.text);

            if (tasks.length > 0) {
                migratedLists.push({ id: Date.now(), title: 'Мои старые задачи', type: 'task', items: tasks });
            }
            if (notes.length > 0) {
                notes.forEach((noteText, index) => {
                     migratedLists.push({ id: Date.now() + index + 1, title: `Старая заметка #${index + 1}`, type: 'note', content: noteText });
                });
            }
            didMigrate = true;
            localStorage.removeItem('items');
        }
        // 2. Миграция из самой старой версии ('tasks' / 'notes')
        else if ((oldTasks && oldTasks.length > 0) || (oldNotes && oldNotes.length > 0)) {
            if (oldTasks && oldTasks.length > 0) {
                 migratedLists.push({ id: Date.now(), title: 'Мои старые задачи', type: 'task', items: oldTasks });
            }
            if (oldNotes && oldNotes.length > 0) {
                 migratedLists.push({ id: Date.now() + 1, title: 'Мои старые заметки', type: 'note', content: oldNotes.join('\n\n---\n\n') });
            }
            didMigrate = true;
            localStorage.removeItem('tasks');
            localStorage.removeItem('notes');
        }

        if (didMigrate) {
            const existingLists = getUserData('lists', []);
            const finalLists = [...migratedLists, ...existingLists];
            saveUserData('lists', finalLists);
            return finalLists;
        }
        
        return null; // Миграция не потребовалась
    };
    
    // Вызываем миграцию ПЕРЕД первой загрузкой данных
    const migratedData = migrateOldData();
    // --- Конец логики миграции ---

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
    let lists = migratedData || getUserData('lists', []);
    let currentFilter = 'all';

    const saveLists = () => saveUserData('lists', lists);

    // --- ЛОГИКА ОТРИСОВКИ ---
    const renderLists = () => {
        const filteredLists = lists.filter(list => currentFilter === 'all' || list.type === currentFilter);

        if (filteredLists.length === 0) {
            listsContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Ничего не найдено. Нажмите "Создать", чтобы добавить запись.</p>';
            return;
        }

        listsContainer.innerHTML = filteredLists.map((list, index) => {
            const originalIndex = lists.indexOf(list);
            let contentHtml = '';

            // Генерация кнопок перемещения
            let moveButtonsHtml = '<div class="flex gap-2">';
            if (index > 0) { // Если это не первый элемент в отфильтрованном списке
                moveButtonsHtml += `<button data-list-index="${originalIndex}" class="list-move-up-btn text-gray-400 hover:text-blue-500" title="Переместить вверх">↑</button>`;
            }
            if (index < filteredLists.length - 1) { // Если это не последний элемент
                moveButtonsHtml += `<button data-list-index="${originalIndex}" class="list-move-down-btn text-gray-400 hover:text-blue-500" title="Переместить вниз">↓</button>`;
            }
            moveButtonsHtml += '</div>';

            // Генерация контента карточки
            if (list.type === 'task') {
                contentHtml = list.items.length > 0 ? list.items.map((task, taskIndex) => `
                    <div class="flex items-center p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" data-list-index="${originalIndex}" data-task-index="${taskIndex}" class="task-checkbox h-5 w-5 rounded-full flex-shrink-0" ${task.completed ? 'checked' : ''}>
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
                        <div class="flex items-center gap-3 flex-shrink-0">
                            ${moveButtonsHtml}
                            <button data-list-index="${originalIndex}" class="list-delete-btn text-red-500 hover:text-red-700 font-bold">✖</button>
                        </div>
                    </div>
                    <div class="space-y-1">${contentHtml}</div>
                </div>
            `;
        }).join('');
    };

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
    const openModal = (type) => {
        modalInputTitle.value = '';
        modalTextareaContent.value = '';
        if (type === 'task') {
            modalTitle.textContent = 'Новый список задач';
            modalTextareaContent.placeholder = 'Введите задачи, каждая с новой строки...';
        } else {
            modalTitle.textContent = 'Новая заметка';
            modalTextareaContent.placeholder = 'Введите текст заметки...';
        }
        modalSaveBtn.onclick = () => saveNewList(type);
        editorModal.classList.remove('hidden');
        modalInputTitle.focus();
    };

    const closeModal = () => editorModal.classList.add('hidden');

    const saveNewList = (type) => {
        const title = modalInputTitle.value.trim();
        if (!title) {
            alert('Название не может быть пустым!');
            return;
        }

        const newList = { id: Date.now(), title, type };
        if (type === 'task') {
            newList.items = modalTextareaContent.value.split('\n')
                .map(text => text.trim())
                .filter(text => text)
                .map(text => ({ text, completed: false }));
        } else {
            newList.content = modalTextareaContent.value.trim();
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
        const index = parseInt(target.closest('[data-list-index]')?.dataset.listIndex, 10);

        if (isNaN(index)) return;

        // Перемещение вверх
        if (target.closest('.list-move-up-btn')) {
            if (index > 0) {
                [lists[index], lists[index - 1]] = [lists[index - 1], lists[index]];
                saveLists();
                renderLists();
            }
            return;
        }
        
        // Перемещение вниз
        if (target.closest('.list-move-down-btn')) {
            if (index < lists.length - 1) {
                [lists[index], lists[index + 1]] = [lists[index + 1], lists[index]];
                saveLists();
                renderLists();
            }
            return;
        }

        // Удаление списка
        if (target.closest('.list-delete-btn')) {
            if (confirm(`Вы уверены, что хотите удалить список "${lists[index].title}"?`)) {
                lists.splice(index, 1);
                saveLists();
                renderLists();
            }
            return;
        }
        
        // Отметка о выполнении задачи
        if (target.classList.contains('task-checkbox')) {
            const taskIndex = parseInt(target.dataset.taskIndex, 10);
            lists[index].items[taskIndex].completed = target.checked;
            saveLists();
            renderLists();
        }
    });

    // --- ПЕРВАЯ ОТРИСОВКА ---
    renderLists();
}

export function cleanup() {}
