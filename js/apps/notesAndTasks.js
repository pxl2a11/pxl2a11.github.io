import { getUserData, saveUserData } from '/js/dataManager.js';

export function getHtml() {
    return `
        <div class="p-4">
            <!-- Заголовок и фильтры -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div id="filter-buttons" class="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg order-2 sm:order-1">
                    <button data-filter="all" class="filter-btn active px-3 py-1 text-sm font-semibold rounded-md">Все</button>
                    <button data-filter="tasks" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Задачи</button>
                    <button data-filter="notes" class="filter-btn px-3 py-1 text-sm font-semibold rounded-md">Заметки</button>
                </div>
            </div>

            <!-- Контейнер для задач и заметок -->
            <div id="items-list" class="space-y-2 mb-20"></div>

            <!-- Плавающая кнопка "Создать" -->
            <div class="fixed bottom-6 right-6">
                <button id="create-btn" class="bg-blue-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    +
                </button>
            </div>
        </div>
    `;
}

export async function init() {
    const itemsList = document.getElementById('items-list');
    const createBtn = document.getElementById('create-btn');
    const filterButtonsContainer = document.getElementById('filter-buttons');

    // Единый массив для задач и заметок
    let items = getUserData('items', []);
    let currentFilter = 'all'; // 'all', 'tasks', или 'notes'

    const saveItems = () => saveUserData('items', items);

    // --- ЛОГИКА ОТОБРАЖЕНИЯ ---
    const renderItems = () => {
        const filteredItems = items.filter(item => {
            if (currentFilter === 'all') return true;
            return item.type === currentFilter.slice(0, -1); // 'tasks' -> 'task', 'notes' -> 'note'
        });

        if (filteredItems.length === 0) {
            itemsList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Список пуст. Нажмите "+", чтобы добавить запись.</p>';
            return;
        }

        itemsList.innerHTML = filteredItems.map(item => {
            // Находим оригинальный индекс элемента для корректного удаления/изменения
            const originalIndex = items.indexOf(item);
            if (item.type === 'task') {
                return `
                    <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center flex-grow min-w-0">
                            <input type="checkbox" data-index="${originalIndex}" class="item-checkbox h-5 w-5 rounded-full flex-shrink-0" ${item.completed ? 'checked' : ''}>
                            <span class="ml-3 break-all ${item.completed ? 'line-through text-gray-500' : ''}">${item.text}</span>
                        </div>
                        <button data-index="${originalIndex}" class="item-delete-btn text-red-500 hover:text-red-700 font-bold ml-2 flex-shrink-0">✖</button>
                    </div>
                `;
            } else { // note
                return `
                    <div class="flex items-start justify-between p-3 bg-yellow-100 dark:bg-gray-800 rounded-lg">
                        <span class="break-all mr-4">${item.text}</span>
                        <button data-index="${originalIndex}" class="item-delete-btn text-red-500 hover:text-red-700 font-bold ml-4 flex-shrink-0">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                `;
            }
        }).join('');
    };

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

    // Логика кнопки "Создать"
    createBtn.addEventListener('click', () => {
        const choice = prompt("Что вы хотите создать? Введите 'задача' или 'заметка'");
        if (!choice) return;

        const text = prompt("Введите текст:");
        if (!text || !text.trim()) return;

        if (choice.toLowerCase().trim().startsWith('задач')) {
            items.unshift({ type: 'task', text: text.trim(), completed: false });
        } else if (choice.toLowerCase().trim().startsWith('замет')) {
            items.unshift({ type: 'note', text: text.trim() });
        } else {
            alert("Неверный выбор. Пожалуйста, введите 'задача' или 'заметка'.");
            return;
        }

        saveItems();
        renderItems();
    });

    // Логика кнопок фильтрации
    filterButtonsContainer.addEventListener('click', e => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            filterButtonsContainer.querySelector('.active').classList.remove('active');
            filterBtn.classList.add('active');
            currentFilter = filterBtn.dataset.filter;
            renderItems();
        }
    });

    // Логика взаимодействия с элементами (удаление, выполнение)
    itemsList.addEventListener('click', e => {
        const target = e.target;
        // Удаление
        const deleteBtn = target.closest('.item-delete-btn');
        if (deleteBtn) {
            items.splice(deleteBtn.dataset.index, 1);
            saveItems();
            renderItems();
            return;
        }
        // Отметка о выполнении
        if (target.classList.contains('item-checkbox')) {
            items[target.dataset.index].completed = target.checked;
            saveItems();
            renderItems();
        }
    });

    // Первая отрисовка при загрузке
    renderItems();
}

export function cleanup() {
    // В данном случае очистка не требуется, так как все обработчики
    // привязаны к элементам внутри компонента.
}
