// js/apps/habitTracker.js
import { getUserData, saveUserData } from '../dataManager.js';

// --- Глобальные переменные модуля ---
const STORAGE_KEY = 'habitTrackerData';
let habits = [];
let eventListeners = [];

/**
 * Вспомогательная функция для добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Возвращает HTML-структуру для приложения "Трекер привычек".
 */
export function getHtml() {
    return `
        <style>
            .habit-card {
                transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            .habit-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            }
            .progress-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #e5e7eb; /* gray-200 */
                border: 2px solid #d1d5db; /* gray-300 */
            }
            .dark .progress-dot {
                background-color: #4b5563; /* gray-600 */
                border-color: #6b7280; /* gray-500 */
            }
            .progress-dot.completed {
                background-color: #22c55e; /* green-500 */
                border-color: #16a34a; /* green-600 */
            }
            .progress-dot.today {
                outline: 2px solid #3b82f6; /* blue-500 */
                outline-offset: 2px;
            }
            .complete-btn.completed {
                background-color: #10b981; /* green-500 */
                color: white;
            }
        </style>
        <div class="max-w-2xl mx-auto p-4 space-y-6">
            <h3 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">Трекер привычек</h3>
            
            <!-- Форма добавления новой привычки -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="text" id="new-habit-input" placeholder="Например: Читать 15 минут" class="flex-grow w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <button id="add-habit-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Добавить привычку</button>
                </div>
            </div>

            <!-- Контейнер для списка привычек -->
            <div id="habits-list" class="space-y-4">
                <!-- Карточки привычек будут рендериться здесь -->
            </div>
        </div>
    `;
}

// --- Функции для работы с данными ---

function loadHabits() {
    habits = getUserData(STORAGE_KEY, []);
}

function saveHabits() {
    saveUserData(STORAGE_KEY, habits);
}

// --- Вспомогательные функции ---

/**
 * Возвращает дату в формате YYYY-MM-DD без учета временной зоны.
 * @param {Date} date - Объект даты.
 * @returns {string} - Строка с датой.
 */
function getISODateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Рассчитывает текущую серию (стрик) для привычки.
 * @param {object} habit - Объект привычки.
 * @returns {number} - Длина серии в днях.
 */
function calculateStreak(habit) {
    const completedDates = new Set(habit.completedDates);
    if (completedDates.size === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    // Проверяем, была ли привычка выполнена сегодня
    const todayStr = getISODateString(today);
    const isCompletedToday = completedDates.has(todayStr);

    // Начинаем отсчет с сегодняшнего или вчерашнего дня
    let currentDate = isCompletedToday ? today : new Date(today.setDate(today.getDate() - 1));

    while (completedDates.has(getISODateString(currentDate))) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}


// --- Функции рендеринга и UI ---

function renderHabits() {
    const habitsListContainer = document.getElementById('habits-list');
    habitsListContainer.innerHTML = '';

    if (habits.length === 0) {
        habitsListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">У вас пока нет привычек. Добавьте первую!</p>';
        return;
    }

    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-4';
        
        const todayStr = getISODateString(new Date());
        const isCompletedToday = habit.completedDates.includes(todayStr);
        const streak = calculateStreak(habit);

        // Генерация точек прогресса за последнюю неделю
        let progressDotsHtml = '';
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = getISODateString(date);
            const isCompleted = habit.completedDates.includes(dateStr);
            const isToday = i === 0;
            progressDotsHtml += `<div class="progress-dot ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" title="${date.toLocaleDateString('ru-RU')}"></div>`;
        }

        habitCard.innerHTML = `
            <div class="flex-grow text-center sm:text-left">
                <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">${habit.name}</p>
                <div class="flex justify-center sm:justify-start gap-2 mt-2" title="Прогресс за последнюю неделю">
                    ${progressDotsHtml}
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-center">
                    <p class="text-2xl font-bold">${streak} 🔥</p>
                    <p class="text-xs text-gray-500">дней подряд</p>
                </div>
                <button data-id="${habit.id}" class="complete-btn w-32 py-2 px-4 rounded-lg font-semibold transition-colors ${isCompletedToday ? 'completed' : 'bg-gray-200 dark:bg-gray-600'}">
                    ${isCompletedToday ? 'Выполнено!' : 'Сделано сегодня'}
                </button>
                <button data-id="${habit.id}" class="delete-btn p-2 text-gray-400 hover:text-red-500 transition-colors" title="Удалить привычку">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        `;
        habitsListContainer.appendChild(habitCard);
    });
}

// --- Основная инициализация и обработчики ---
export function init() {
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitsListContainer = document.getElementById('habits-list');

    function addNewHabit() {
        const name = newHabitInput.value.trim();
        if (name) {
            habits.push({
                id: Date.now(),
                name: name,
                completedDates: [],
            });
            newHabitInput.value = '';
            saveHabits();
            renderHabits();
        }
    }

    addListener(addHabitBtn, 'click', addNewHabit);
    addListener(newHabitInput, 'keypress', (e) => {
        if (e.key === 'Enter') {
            addNewHabit();
        }
    });

    // Делегирование событий для кнопок в списке
    addListener(habitsListContainer, 'click', (e) => {
        const completeBtn = e.target.closest('.complete-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (completeBtn) {
            const habitId = Number(completeBtn.dataset.id);
            const habit = habits.find(h => h.id === habitId);
            const todayStr = getISODateString(new Date());

            const dateIndex = habit.completedDates.indexOf(todayStr);
            if (dateIndex > -1) {
                // Если уже выполнено - отменяем
                habit.completedDates.splice(dateIndex, 1);
            } else {
                // Если не выполнено - добавляем
                habit.completedDates.push(todayStr);
            }
            saveHabits();
            renderHabits();
        }

        if (deleteBtn) {
            const habitId = Number(deleteBtn.dataset.id);
            if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
                habits = habits.filter(h => h.id !== habitId);
                saveHabits();
                renderHabits();
            }
        }
    });

    // Загрузка и первая отрисовка
    loadHabits();
    renderHabits();
}

export function cleanup() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}
