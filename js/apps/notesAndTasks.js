import { getUserData, saveUserData } from '/js/dataManager.js';

export function getHtml() {
    return `
        <div class="p-4">
            <div class="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                <button id="tasks-tab" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Задачи</button>
                <button id="notes-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Заметки</button>
            </div>
            <div id="tasks-content">
                <div class="flex gap-2 mb-4">
                    <input id="task-input" type="text" placeholder="Новая задача..." class="flex-grow p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <button id="add-task-btn" class="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">Добавить</button>
                </div>
                <div id="tasks-list" class="space-y-2"></div>
            </div>
            <div id="notes-content" class="hidden">
                 <div class="flex gap-2 mb-4">
                    <input id="note-input" type="text" placeholder="Новая заметка..." class="flex-grow p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <button id="add-note-btn" class="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">Добавить</button>
                </div>
                <div id="notes-list" class="space-y-2"></div>
            </div>
        </div>
    `;
}

export async function init() {
    const tasksTab = document.getElementById('tasks-tab');
    const notesTab = document.getElementById('notes-tab');
    const tasksContent = document.getElementById('tasks-content');
    const notesContent = document.getElementById('notes-content');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksList = document.getElementById('tasks-list');
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesList = document.getElementById('notes-list');

    // Получаем данные через dataManager
    let tasks = getUserData('tasks', []);
    let notes = getUserData('notes', []);

    const saveTasks = () => saveUserData('tasks', tasks);
    const saveNotes = () => saveUserData('notes', notes);

    const switchTab = (activeTab) => {
        tasksTab.classList.toggle('active', activeTab === 'tasks');
        notesTab.classList.toggle('active', activeTab === 'notes');
        tasksContent.classList.toggle('hidden', activeTab !== 'tasks');
        notesContent.classList.toggle('hidden', activeTab !== 'notes');
    };

    tasksTab.addEventListener('click', () => switchTab('tasks'));
    notesTab.addEventListener('click', () => switchTab('notes'));

    // --- ЛОГИКА ЗАДАЧ ---
    const renderTasks = () => {
        tasksList.innerHTML = tasks.length === 0 ? '<p class="text-center text-gray-500 dark:text-gray-400">Список задач пуст.</p>' :
            tasks.map((task, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center flex-grow min-w-0">
                        <input type="checkbox" data-index="${index}" class="task-checkbox h-5 w-5 rounded-full flex-shrink-0" ${task.completed ? 'checked' : ''}>
                        <span class="ml-3 break-all ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</span>
                    </div>
                    <button data-index="${index}" class="task-delete-btn text-red-500 hover:text-red-700 font-bold ml-2 flex-shrink-0">✖</button>
                </div>
            `).join('');
    };
    addTaskBtn.addEventListener('click', () => {
        if (taskInput.value.trim()) {
            tasks.unshift({ text: taskInput.value.trim(), completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    });
    taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTaskBtn.click(); });
    tasksList.addEventListener('click', e => {
        if (e.target.classList.contains('task-delete-btn')) {
            tasks.splice(e.target.dataset.index, 1);
            saveTasks();
            renderTasks();
        }
    });
    tasksList.addEventListener('change', e => {
        if (e.target.classList.contains('task-checkbox')) {
            tasks[e.target.dataset.index].completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
    });

    // --- ЛОГИКА ЗАМЕТОК ---
    const renderNotes = () => {
        notesList.innerHTML = notes.length === 0 ? '<p class="text-center text-gray-500 dark:text-gray-400">Список заметок пуст.</p>' :
            notes.map((noteText, index) => `
                <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span class="break-all">${noteText}</span>
                    <button data-index="${index}" class="note-delete-btn text-red-500 hover:text-red-700 font-bold ml-4 flex-shrink-0">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            `).join('');
    };
    addNoteBtn.addEventListener('click', () => {
        if (noteInput.value.trim()) {
            notes.unshift(noteInput.value.trim());
            noteInput.value = '';
            saveNotes();
            renderNotes();
        }
    });
    noteInput.addEventListener('keypress', e => { if (e.key === 'Enter') addNoteBtn.click(); });
    notesList.addEventListener('click', e => {
        const btn = e.target.closest('.note-delete-btn');
        if (btn) {
            notes.splice(btn.dataset.index, 1);
            saveNotes();
            renderNotes();
        }
    });

    // Первая отрисовка
    renderTasks();
    renderNotes();
}

export function cleanup() {}
