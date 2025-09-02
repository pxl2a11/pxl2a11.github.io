// js/apps/timezoneConverter.js

let dateInput, timeInput, addTimezoneSelect, addTimezoneBtn, outputContainer, setCurrentTimeBtn, localTimezoneDisplay, searchInput;
let targetTimezones = new Set(); 

export function getHtml() {
    return `
        <div class="flex flex-col gap-6 p-2 md:p-4">
            
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-inner">
                <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Исходное время</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Время ниже считается локальным для вашего часового пояса: <strong id="local-timezone-display" class="text-blue-600 dark:text-blue-400"></strong>
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div class="sm:col-span-1">
                        <label for="date-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Дата</label>
                        <input type="date" id="date-input" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800">
                    </div>
                    <div class="sm:col-span-1">
                        <label for="time-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Время</label>
                        <input type="time" id="time-input" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800">
                    </div>
                    <div class="sm:col-span-1 pt-5">
                        <button id="set-current-time-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Текущее время</button>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-inner">
                 <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Добавить часовой пояс</h3>
                <div class="flex items-end gap-4">
                    <div class="flex-grow space-y-2">
                        <label for="timezone-search-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Поиск</label>
                        <input type="text" id="timezone-search-input" placeholder="Начните вводить город или регион..." class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800">
                        <select id="add-timezone-select" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800" size="5"></select>
                    </div>
                    <button id="add-timezone-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex-shrink-0">Добавить</button>
                </div>
            </div>

            <div id="output-timezones" class="mt-4 space-y-4"></div>
        </div>
    `;
}

export function init() {
    dateInput = document.getElementById('date-input');
    timeInput = document.getElementById('time-input');
    addTimezoneSelect = document.getElementById('add-timezone-select');
    addTimezoneBtn = document.getElementById('add-timezone-btn');
    outputContainer = document.getElementById('output-timezones');
    setCurrentTimeBtn = document.getElementById('set-current-time-btn');
    localTimezoneDisplay = document.getElementById('local-timezone-display');
    searchInput = document.getElementById('timezone-search-input');

    populateTimezoneSelect();
    
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    localTimezoneDisplay.textContent = localTz;
    
    targetTimezones.add(localTz);
    targetTimezones.add('UTC');
    targetTimezones.add('America/New_York');
    targetTimezones.add('Europe/London');

    setCurrentTime();
    addEventListeners();
    renderAllTimezones();
}

export function cleanup() {
    targetTimezones.clear();
    outputContainer.innerHTML = '';
}

function populateTimezoneSelect() {
    const timezones = Intl.supportedValuesOf('timeZone');
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz.replace(/_/g, ' ');
        addTimezoneSelect.appendChild(option);
    });
}

function filterTimezoneList() {
    const filter = searchInput.value.toLowerCase();
    const options = addTimezoneSelect.options;
    for (let i = 0; i < options.length; i++) {
        const txtValue = options[i].textContent || options[i].innerText;
        options[i].style.display = txtValue.toLowerCase().includes(filter) ? "" : "none";
    }
}

function setCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeInput.value = `${hours}:${minutes}`;
}

function addEventListeners() {
    dateInput.addEventListener('change', renderAllTimezones);
    timeInput.addEventListener('change', renderAllTimezones);
    setCurrentTimeBtn.addEventListener('click', () => {
        setCurrentTime();
        renderAllTimezones();
    });
    addTimezoneBtn.addEventListener('click', () => {
        const selectedTz = addTimezoneSelect.value;
        if (selectedTz && !targetTimezones.has(selectedTz)) {
            targetTimezones.add(selectedTz);
            renderAllTimezones();
        }
    });
    
    searchInput.addEventListener('keyup', filterTimezoneList);

    outputContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-tz-btn')) {
            const tzToRemove = e.target.dataset.tz;
            if (tzToRemove) {
                targetTimezones.delete(tzToRemove);
                renderAllTimezones();
            }
        }
    });
}

function renderAllTimezones() {
    outputContainer.innerHTML = '';
    if (!dateInput.value || !timeInput.value) return;
    const sourceDate = new Date(`${dateInput.value}T${timeInput.value}`);
    const sortedTimezones = Array.from(targetTimezones).sort();
    sortedTimezones.forEach(tz => {
        const card = createTimezoneCard(tz, sourceDate);
        outputContainer.appendChild(card);
    });
}

function createTimezoneCard(timezone, date) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between';
    
    const timeString = date.toLocaleTimeString('ru-RU', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
    const dateString = date.toLocaleDateString('ru-RU', { timeZone: timezone, weekday: 'short', day: 'numeric', month: 'short' });
    const offset = getOffsetString(date, timezone);
    
    card.innerHTML = `
        <div>
            <div class="flex items-center gap-3">
                <h4 class="text-xl font-bold text-gray-900 dark:text-gray-100">${timeString}</h4>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">${timezone.replace(/_/g, ' ')}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mt-1">${dateString} (${offset})</p>
        </div>
        <button data-tz="${timezone}" class="remove-tz-btn text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full" title="Удалить">
            <svg class="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
    `;
    return card;
}

function getOffsetString(date, timeZone) {
    const options = { timeZone, timeZoneName: 'longOffset' };
    const dateString = date.toLocaleString('en-US', options);
    const match = dateString.match(/GMT([+-]\\d{1,2}(:\\d{2})?)/);
    if (match) return `UTC${match[1]}`;
    return 'UTC';
}
