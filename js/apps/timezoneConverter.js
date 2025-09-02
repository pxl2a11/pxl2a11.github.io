//41 js/apps/timezoneConverter.js

let dateInput, timeInput, addTimezoneSelect, addTimezoneBtn, outputContainer, setCurrentTimeBtn, localTimezoneDisplay, searchInput;
let targetTimezones = new Set(); 

// Словарь для корректной транслитерации и замены названий городов
const timezoneNameMap = {
    'Moscow': 'Москва', 'London': 'Лондон', 'New_York': 'Нью-Йорк', 'Los_Angeles': 'Лос-Анджелес',
    'Paris': 'Париж', 'Berlin': 'Берлин', 'Tokyo': 'Токио', 'Dubai': 'Дубай', 'Shanghai': 'Шанхай',
    'Sydney': 'Сидней', 'Kaliningrad': 'Калининград', 'Samara': 'Самара', 'Yekaterinburg': 'Екатеринбург',
    'Omsk': 'Омск', 'Krasnoyarsk': 'Красноярск', 'Irkutsk': 'Иркутск', 'Yakutsk': 'Якутск',
    'Vladivostok': 'Владивосток', 'Magadan': 'Магадан', 'Kamchatka': 'Камчатка', 'UTC': 'UTC',
    'Kiev': 'Киев', 'Minsk': 'Минск', 'Vilnius': 'Вильнюс', 'Riga': 'Рига', 'Tallinn': 'Таллин',
    'Warsaw': 'Варшава', 'Prague': 'Прага', 'Vienna': 'Вена', 'Rome': 'Рим', 'Madrid': 'Мадрид',
    'Lisbon': 'Лиссабон', 'Athens': 'Афины', 'Istanbul': 'Стамбул', 'Helsinki': 'Хельсинки',
    'Stockholm': 'Стокгольм', 'Oslo': 'Осло', 'Copenhagen': 'Копенгаген', 'Amsterdam': 'Амстердам',
    'Brussels': 'Брюссель', 'Zurich': 'Цюрих', 'Cairo': 'Каир', 'Jerusalem': 'Иерусалим',
    'Singapore': 'Сингапур', 'Hong_Kong': 'Гонконг', 'Seoul': 'Сеул', 'Bangkok': 'Бангкок',
    'Jakarta': 'Джакарта', 'Manila': 'Манила', 'Ho_Chi_Minh': 'Хошимин', 'Tashkent': 'Ташкент',
    'Almaty': 'Алматы', 'Bishkek': 'Бишкек', 'Tbilisi': 'Тбилиси', 'Yerevan': 'Ереван',
    'Baku': 'Баку', 'Chicago': 'Чикаго', 'Denver': 'Денвер', 'Phoenix': 'Финикс',
    'Anchorage': 'Анкоридж', 'Honolulu': 'Гонолулу', 'Toronto': 'Торонто', 'Vancouver': 'Ванкувер',
    'Mexico_City': 'Мехико', 'Sao_Paulo': 'Сан-Паулу', 'Buenos_Aires': 'Буэнос-Айрес'
};

export function getHtml() {
    return `
        <style>
            .tz-card {
                background: linear-gradient(135deg, white, #f9fafb);
                transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            .dark .tz-card {
                background: linear-gradient(135deg, #1f2937, #11182a);
            }
            .tz-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            }
        </style>
        <div class="flex flex-col gap-6 p-1 md:p-2">
            
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl shadow-inner space-y-4">
                <p class="text-sm text-center text-gray-600 dark:text-gray-400">
                    Ваш часовой пояс: <strong id="local-timezone-display" class="text-blue-600 dark:text-blue-400"></strong>
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <input type="date" id="date-input" class="w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
                    <input type="time" id="time-input" class="w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
                </div>
                 <button id="set-current-time-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Использовать текущее время</button>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl shadow-inner">
                <div class="flex items-end gap-4">
                    <div class="flex-grow space-y-1">
                        <label for="timezone-search-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Добавить часовой пояс</label>
                        <input type="text" id="timezone-search-input" placeholder="Поиск (напр. Москва или New York)" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
                        <select id="add-timezone-select" class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800" size="6"></select>
                    </div>
                    <button id="add-timezone-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex-shrink-0">Добавить</button>
                </div>
            </div>

            <div id="output-timezones" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"></div>
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
    localTimezoneDisplay.textContent = getFriendlyTimezoneName(localTz).name;
    
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

function getFriendlyTimezoneName(iana) {
    const city = iana.split('/').pop();
    const ruName = timezoneNameMap[city];
    return {
        name: ruName || city.replace(/_/g, ' '),
        full: iana.replace(/_/g, ' ')
    };
}

function populateTimezoneSelect() {
    const timezones = Intl.supportedValuesOf('timeZone');
    const allTzFormatted = timezones.map(tz => {
        const friendly = getFriendlyTimezoneName(tz);
        return {
            value: tz,
            text: `${friendly.name} (${friendly.full})`
        };
    });

    allTzFormatted.sort((a, b) => a.text.localeCompare(b.text, 'ru'));

    allTzFormatted.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.text;
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
    dateInput.value = now.toISOString().slice(0, 10);
    timeInput.value = now.toTimeString().slice(0, 5);
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
        const button = e.target.closest('.remove-tz-btn');
        if (button) {
            const tzToRemove = button.dataset.tz;
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
    card.className = 'tz-card p-4 rounded-lg shadow-md flex items-start justify-between';
    
    const timeString = date.toLocaleTimeString('ru-RU', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
    const dateString = date.toLocaleDateString('ru-RU', { timeZone: timezone, weekday: 'long', day: 'numeric', month: 'long' });
    const offset = getOffsetString(date, timezone);
    const friendlyName = getFriendlyTimezoneName(timezone).name;
    
    card.innerHTML = `
        <div class="flex-grow">
            <h4 class="text-2xl font-bold text-gray-900 dark:text-gray-100">${timeString}</h4>
            <p class="text-md font-semibold text-blue-700 dark:text-blue-400 mt-1">${friendlyName}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">${dateString}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${offset}</p>
        </div>
        <button data-tz="${timezone}" class="remove-tz-btn text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full flex-shrink-0" title="Удалить">
            <svg class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
