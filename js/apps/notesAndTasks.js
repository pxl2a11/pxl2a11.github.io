import { getUserData, saveUserData } from '/js/dataManager.js';

export function getHtml() {
    return `
        <div class="p-4">
            <!-- Кнопка Создать -->
            <div class="text-center mb-4">
                <button id="show-create-modal-btn" class="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                    + Создать
                </button>
            </div>

            <!-- Фильтры -->
            <div id="filter-buttons" class="flex justify-center gap-2 p-1 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button data-filter="all" class="filter-btn active px-3 py-1 text-sm font-semibold rounded-md">Все</button>
                <button data-filter="tasks" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Задачи</button>
                <button data-filter="notes" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Заметки</button>
            </div>

            <!-- Контейнер для задач и заметок -->
            <div id="items-list" class="space-y-2"></div>

            <!-- Модальное окно для выбора -->
            <div id="create-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                    <button id="close-modal-btn" class="absolute top-2 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                    <h3 class="text-lg font-semibold text-center mb-4">Что вы хотите создать?</h3>
                    <div class="flex flex-col gap-3">
                        <button id="create-task-btn" class="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">Задачу</button>
                        <button id="create-note-btn" class="w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600">Заметку</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function init() {
    const itemsList = document.getElementById('items-list');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const showCreateModalBtn = document.getElementById('show-create-modal-btn');
    const createModal = document.getElementById('create-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const createTaskBtn = document.getElementById('create-task-btn');
    const createNoteBtn = document.getElementById('create-note-btn');


    let items = getUserData('items', []);
    let currentFilter = 'all';

    const saveItems = () => saveUserData('items', items);

    const renderItems = () => {
        const filteredItems = items.filter(item => {
            if (currentFilter === 'all') return true;
            return item.type === currentFilter.slice(0, -1);
        });

        if (filteredItems.length === 0) {
            itemsList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Список пуст. Нажмите "Создать", чтобы добавить запись.</p>';
            return;
        }

        itemsList.innerHTML = filteredItems.map(item => {
            const originalIndex = items.indexOf(item);
            if (item.type === 'task') {
                return `
                    <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center flex-grow min-w-0">
                            <input type="checkbox" data-index="${originalIndex}" class="item-checkbox h-5 w-5 rounded-full flex-shrink-0" ${item.completed ? 'checked' : ''}>
                            <span class="ml-3 break-all ${item.completed ? 'line-through text-gray-500' : ''}">${item.text}</span>
                        </div>
                        <button data-index="${originalIndex}" class="item-delete-btn text-red-500 hover:text-red-700 font-bold ml-2 flex-shrink-0">✖</button>
                    </div>`;
            } else {
                return `
                    <div class="flex items-start justify-between p-3 bg-yellow-100 dark:bg-gray-800 rounded-lg">
                        <span class="break-all mr-4">${item.text}</span>
                        <button data-index="${originalIndex}" class="item-delete-btn text-red-500 hover:text-red-700 font-bold ml-4 flex-shrink-0">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>`;
            }
        }).join('');
    };

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
    const openModal = () => createModal.classList.remove('hidden');
    const closeModal = () => createModal.classList.add('hidden');

    showCreateModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    createModal.addEventListener('click', (e) => {
        // Закрываем модальное окно при клике на фон (за его пределами)
        if (e.target === createModal) {
            closeModal();
        }
    });

    // --- ЛОГИКА СОЗДАНИЯ ЭЛЕМЕНТОВ ---
    const addItem = (type) => {
        const text = prompt(`Введите текст для новой ${type === 'task' ? 'задачи' : 'заметки'}:`);
        if (!text || !text.trim()) return;

        const newItem = type === 'task'
            ? { type: 'task', text: text.trim(), completed: false }
            : { type: 'note', text: text.trim() };
        
        items.unshift(newItem);
        saveItems();
        renderItems();
        closeModal();
    };

    createTaskBtn.addEventListener('click', () => addItem('task'));
    createNoteBtn.addEventListener('click', () => addItem('note'));

    // --- ЛОГИКА ФИЛЬТРОВ И ВЗАИМОДЕЙСТВИЯ ---
    filterButtonsContainer.addEventListener('click', e => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            filterButtonsContainer.querySelector('.active').classList.remove('active');
            filterBtn.classList.add('active');
            currentFilter = filterBtn.dataset.filter;
            renderItems();
        }
    });

    itemsList.addEventListener('click', e => {
        const target = e.target;
        const deleteBtn = target.closest('.item-delete-btn');
        if (deleteBtn) {
            items.splice(deleteBtn.dataset.index, 1);
            saveItems();
            renderItems();
            return;
        }
        if (target.classList.contains('item-checkbox')) {
            items[target.dataset.index].completed = target.checked;
            saveItems();
            renderItems();
        }
    });

    renderItems();
}

export function cleanup() {}
