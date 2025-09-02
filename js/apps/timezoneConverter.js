//41 js/apps/timezoneConverter.js

let dateInput, timeInput, addTimezoneSelect, addTimezoneBtn, outputContainer, setCurrentTimeBtn, localTimezoneDisplay, searchInput;
let targetTimezones = new Set();

// Расширенный словарь для корректной транслитерации и замены названий городов
const timezoneNameMap = {
    // Европа
    'Andorra': 'Андорра', 'Athens': 'Афины', 'Belgrade': 'Белград', 'Berlin': 'Берлин',
    'Bratislava': 'Братислава', 'Brussels': 'Брюссель', 'Bucharest': 'Бухарест', 'Budapest': 'Будапешт',
    'Busingen': 'Бюзинген', 'Chisinau': 'Кишинев', 'Copenhagen': 'Копенгаген', 'Dublin': 'Дублин',
    'Gibraltar': 'Гибралтар', 'Guernsey': 'Гернси', 'Helsinki': 'Хельсинки', 'Isle_of_Man': 'Остров Мэн',
    'Istanbul': 'Стамбул', 'Jersey': 'Джерси', 'Kaliningrad': 'Калининград', 'Kiev': 'Киев',
    'Kirov': 'Киров', 'Lisbon': 'Лиссабон', 'Ljubljana': 'Любляна', 'London': 'Лондон',
    'Luxembourg': 'Люксембург', 'Madrid': 'Мадрид', 'Malta': 'Мальта', 'Mariehamn': 'Мариехамн',
    'Minsk': 'Минск', 'Monaco': 'Монако', 'Moscow': 'Москва', 'Oslo': 'Осло',
    'Paris': 'Париж', 'Podgorica': 'Подгорица', 'Prague': 'Прага', 'Riga': 'Рига',
    'Rome': 'Рим', 'Samara': 'Самара', 'San_Marino': 'Сан-Марино', 'Sarajevo': 'Сараево',
    'Saratov': 'Саратов', 'Simferopol': 'Симферополь', 'Skopje': 'Скопье', 'Sofia': 'София',
    'Stockholm': 'Стокгольм', 'Tallinn': 'Таллин', 'Tirane': 'Тирана', 'Ulyanovsk': 'Ульяновск',
    'Uzhgorod': 'Ужгород', 'Vaduz': 'Вадуц', 'Vatican': 'Ватикан', 'Vienna': 'Вена',
    'Vilnius': 'Вильнюс', 'Volgograd': 'Волгоград', 'Warsaw': 'Варшава', 'Zagreb': 'Загреб',
    'Zaporozhye': 'Запорожье', 'Zurich': 'Цюрих',

    // Азия
    'Almaty': 'Алматы', 'Amman': 'Амман', 'Anadyr': 'Анадырь', 'Aqtau': 'Актау',
    'Aqtobe': 'Актобе', 'Ashgabat': 'Ашхабад', 'Atyrau': 'Атырау', 'Baghdad': 'Багдад',
    'Bahrain': 'Бахрейн', 'Baku': 'Баку', 'Bangkok': 'Бангкок', 'Barnaul': 'Барнаул',
    'Beirut': 'Бейрут', 'Bishkek': 'Бишкек', 'Brunei': 'Бруней', 'Chita': 'Чита',
    'Choibalsan': 'Чойбалсан', 'Colombo': 'Коломбо', 'Damascus': 'Дамаск', 'Dhaka': 'Дакка',
    'Dili': 'Дили', 'Dubai': 'Дубай', 'Dushanbe': 'Душанбе', 'Famagusta': 'Фамагуста',
    'Gaza': 'Газа', 'Hebron': 'Хеврон', 'Ho_Chi_Minh': 'Хошимин', 'Hong_Kong': 'Гонконг',
    'Hovd': 'Ховд', 'Irkutsk': 'Иркутск', 'Jakarta': 'Джакарта', 'Jayapura': 'Джаяпура',
    'Jerusalem': 'Иерусалим', 'Kabul': 'Кабул', 'Kamchatka': 'Камчатка', 'Karachi': 'Карачи',
    'Kathmandu': 'Катманду', 'Khandyga': 'Хандыга', 'Kolkata': 'Калькутта', 'Krasnoyarsk': 'Красноярск',
    'Kuala_Lumpur': 'Куала-Лумпур', 'Kuching': 'Кучинг', 'Kuwait': 'Кувейт', 'Macau': 'Макао',
    'Magadan': 'Магадан', 'Makassar': 'Макассар', 'Manila': 'Манила', 'Muscat': 'Маскат',
    'Nicosia': 'Никосия', 'Novokuznetsk': 'Новокузнецк', 'Novosibirsk': 'Новосибирск', 'Omsk': 'Омск',
    'Oral': 'Уральск', 'Phnom_Penh': 'Пномпень', 'Pontianak': 'Понтианак', 'Pyongyang': 'Пхеньян',
    'Qatar': 'Катар', 'Qostanay': 'Костанай', 'Qyzylorda': 'Кызылорда', 'Riyadh': 'Эр-Рияд',
    'Sakhalin': 'Сахалин', 'Samarkand': 'Самарканд', 'Seoul': 'Сеул', 'Shanghai': 'Шанхай',
    'Singapore': 'Сингапур', 'Srednekolymsk': 'Среднеколымск', 'Taipei': 'Тайбэй', 'Tashkent': 'Ташкент',
    'Tbilisi': 'Тбилиси', 'Tehran': 'Тегеран', 'Thimphu': 'Тхимпху', 'Tokyo': 'Токио',
    'Tomsk': 'Томск', 'Ulaanbaatar': 'Улан-Батор', 'Urumqi': 'Урумчи', 'Ust-Nera': 'Усть-Нера',
    'Vientiane': 'Вьентьян', 'Vladivostok': 'Владивосток', 'Yakutsk': 'Якутск', 'Yangon': 'Янгон',
    'Yekaterinburg': 'Екатеринбург', 'Yerevan': 'Ереван',

    // Америка
    'Adak': 'Адак', 'Anchorage': 'Анкоридж', 'Anguilla': 'Ангилья', 'Antigua': 'Антигуа',
    'Araguaina': 'Арагуаина', 'Argentina/Buenos_Aires': 'Буэнос-Айрес', 'Argentina/Catamarca': 'Катамарка',
    'Argentina/Cordoba': 'Кордова', 'Argentina/Jujuy': 'Жужуй', 'Argentina/La_Rioja': 'Ла-Риоха',
    'Argentina/Mendoza': 'Мендоса', 'Argentina/Rio_Gallegos': 'Рио-Гальегос', 'Argentina/Salta': 'Сальта',
    'Argentina/San_Juan': 'Сан-Хуан', 'Argentina/San_Luis': 'Сан-Луис', 'Argentina/Tucuman': 'Тукуман',
    'Argentina/Ushuaia': 'Ушуайя', 'Aruba': 'Аруба', 'Asuncion': 'Асунсьон', 'Atikokan': 'Атикокан',
    'Bahia': 'Баия', 'Bahia_Banderas': 'Баия-де-Бандерас', 'Barbados': 'Барбадос', 'Belem': 'Белен',
    'Belize': 'Белиз', 'Blanc-Sablon': 'Блан-Саблон', 'Boa_Vista': 'Боа-Виста', 'Bogota': 'Богота',
    'Boise': 'Бойсе', 'Buenos_Aires': 'Буэнос-Айрес', 'Cambridge_Bay': 'Кеймбридж-Бей',
    'Campo_Grande': 'Кампу-Гранди', 'Cancun': 'Канкун', 'Caracas': 'Каракас', 'Cayenne': 'Кайенна',
    'Cayman': 'Кайман', 'Chicago': 'Чикаго', 'Chihuahua': 'Чиуауа', 'Costa_Rica': 'Коста-Рика',
    'Creston': 'Крестон', 'Cuiaba': 'Куяба', 'Curacao': 'Кюрасао', 'Danmarkshavn': 'Данмарксхавн',
    'Dawson': 'Доусон', 'Dawson_Creek': 'Доусон-Крик', 'Denver': 'Денвер', 'Detroit': 'Детройт',
    'Dominica': 'Доминика', 'Edmonton': 'Эдмонтон', 'Eirunepe': 'Эйрунепе', 'El_Salvador': 'Сальвадор',
    'Fort_Nelson': 'Форт-Нельсон', 'Fortaleza': 'Форталеза', 'Glace_Bay': 'Глейс-Бей', 'Godthab': 'Нуук',
    'Goose_Bay': 'Гус-Бей', 'Grand_Turk': 'Гранд-Терк', 'Grenada': 'Гренада', 'Guadeloupe': 'Гваделупа',
    'Guatemala': 'Гватемала', 'Guayaquil': 'Гуаякиль', 'Guyana': 'Гайана', 'Halifax': 'Галифакс',
    'Havana': 'Гавана', 'Hermosillo': 'Эрмосильо', 'Indiana/Indianapolis': 'Индианаполис',
    'Indiana/Knox': 'Нокс (Индиана)', 'Indiana/Marengo': 'Маренго (Индиана)', 'Indiana/Petersburg': 'Питерсберг (Индиана)',
    'Indiana/Tell_City': 'Телл-Сити (Индиана)', 'Indiana/Vevay': 'Вивей (Индиана)', 'Indiana/Vincennes': 'Венсен (Индиана)',
    'Indiana/Winamac': 'Уинамак (Индиана)', 'Indianapolis': 'Индианаполис', 'Inuvik': 'Инувик',
    'Iqaluit': 'Икалуит', 'Jamaica': 'Ямайка', 'Juneau': 'Джуно', 'Kentucky/Louisville': 'Луисвилл (Кентукки)',
    'Kentucky/Monticello': 'Монтиселло (Кентукки)', 'Knox_IN': 'Нокс (Индиана)', 'Kralendijk': 'Кралендейк',
    'La_Paz': 'Ла-Пас', 'Lima': 'Лима', 'Los_Angeles': 'Лос-Анджелес', 'Louisville': 'Луисвилл',
    'Lower_Princes': 'Лоуэр-Принсес', 'Maceio': 'Масейо', 'Managua': 'Манагуа', 'Manaus': 'Манаус',
    'Marigot': 'Мариго', 'Martinique': 'Мартиника', 'Matamoros': 'Матаморос', 'Mazatlan': 'Масатлан',
    'Menominee': 'Меномини', 'Merida': 'Мерида', 'Metlakatla': 'Метлакатла', 'Mexico_City': 'Мехико',
    'Miquelon': 'Микелон', 'Moncton': 'Монктон', 'Monterrey': 'Монтеррей', 'Montevideo': 'Монтевидео',
    'Montserrat': 'Монтсеррат', 'Nassau': 'Нассау', 'New_York': 'Нью-Йорк', 'Nipigon': 'Нипигон',
    'Nome': 'Ном', 'Noronha': 'Норонья', 'North_Dakota/Beulah': 'Бьюла (Сев. Дакота)',
    'North_Dakota/Center': 'Сентер (Сев. Дакота)', 'North_Dakota/New_Salem': 'Нью-Сейлем (Сев. Дакота)',
    'Ojinaga': 'Охинага', 'Panama': 'Панама', 'Pangnirtung': 'Пангниртунг', 'Paramaribo': 'Парамарибо',
    'Phoenix': 'Финикс', 'Port-au-Prince': 'Порт-о-Пренс', 'Port_of_Spain': 'Порт-оф-Спейн',
    'Porto_Velho': 'Порту-Велью', 'Puerto_Rico': 'Пуэрто-Рико', 'Punta_Arenas': 'Пунта-Аренас',
    'Rainy_River': 'Рейни-Ривер', 'Rankin_Inlet': 'Ранкин-Инлет', 'Recife': 'Ресифи', 'Regina': 'Реджайна',
    'Resolute': 'Резольют', 'Rio_Branco': 'Риу-Бранку', 'Santarem': 'Сантарен', 'Santiago': 'Сантьяго',
    'Santo_Domingo': 'Санто-Доминго', 'Sao_Paulo': 'Сан-Паулу', 'Scoresbysund': 'Иттоккортоормиут',
    'Sitka': 'Ситка', 'St_Barthelemy': 'Сен-Бартелеми', 'St_Johns': 'Сент-Джонс', 'St_Kitts': 'Сент-Китс',
    'St_Lucia': 'Сент-Люсия', 'St_Thomas': 'Сент-Томас', 'St_Vincent': 'Сент-Винсент', 'Swift_Current': 'Свифт-Каррент',
    'Tegucigalpa': 'Тегусигальпа', 'Thule': 'Туле', 'Thunder_Bay': 'Тандер-Бей', 'Tijuana': 'Тихуана',
    'Toronto': 'Торонто', 'Tortola': 'Тортола', 'Vancouver': 'Ванкувер', 'Whitehorse': 'Уайтхорс',
    'Winnipeg': 'Виннипег', 'Yakutat': 'Якутат', 'Yellowknife': 'Йеллоунайф',

    // Африка
    'Abidjan': 'Абиджан', 'Accra': 'Аккра', 'Addis_Ababa': 'Аддис-Абеба', 'Algiers': 'Алжир',
    'Asmara': 'Асмэра', 'Bamako': 'Бамако', 'Bangui': 'Банги', 'Banjul': 'Банжул',
    'Bissau': 'Бисау', 'Blantyre': 'Блантайр', 'Brazzaville': 'Браззавиль', 'Bujumbura': 'Бужумбура',
    'Cairo': 'Каир', 'Casablanca': 'Касабланка', 'Ceuta': 'Сеута', 'Conakry': 'Конакри',
    'Dakar': 'Дакар', 'Dar_es_Salaam': 'Дар-эс-Салам', 'Djibouti': 'Джибути', 'Douala': 'Дуала',
    'El_Aaiun': 'Эль-Аюн', 'Freetown': 'Фритаун', 'Gaborone': 'Габороне', 'Harare': 'Хараре',
    'Johannesburg': 'Йоханнесбург', 'Juba': 'Джуба', 'Kampala': 'Кампала', 'Khartoum': 'Хартум',
    'Kigali': 'Кигали', 'Kinshasa': 'Киншаса', 'Lagos': 'Лагос', 'Libreville': 'Либревиль',
    'Lome': 'Ломе', 'Luanda': 'Луанда', 'Lubumbashi': 'Лубумбаши', 'Lusaka': 'Лусака',
    'Malabo': 'Малабо', 'Maputo': 'Мапуту', 'Maseru': 'Масеру', 'Mbabane': 'Мбабане',
    'Mogadishu': 'Могадишо', 'Monrovia': 'Монровия', 'Nairobi': 'Найроби', 'Ndjamena': 'Нджамена',
    'Niamey': 'Ниамей', 'Nouakchott': 'Нуакшот', 'Ouagadougou': 'Уагадугу', 'Porto-Novo': 'Порто-Ново',
    'Sao_Tome': 'Сан-Томе', 'Tripoli': 'Триполи', 'Tunis': 'Тунис', 'Windhoek': 'Виндхук',

    // Австралия и Океания
    'Adelaide': 'Аделаида', 'Brisbane': 'Брисбен', 'Broken_Hill': 'Брокен-Хилл', 'Currie': 'Карри',
    'Darwin': 'Дарвин', 'Eucla': 'Юкла', 'Hobart': 'Хобарт', 'Lindeman': 'Линдеман',
    'Lord_Howe': 'Лорд-Хау', 'Melbourne': 'Мельбурн', 'Perth': 'Перт', 'Sydney': 'Сидней',
    'Apia': 'Апиа', 'Auckland': 'Окленд', 'Bougainville': 'Бугенвиль', 'Chatham': 'Чатем',
    'Chuuk': 'Трук', 'Easter': 'Остров Пасхи', 'Efate': 'Эфате', 'Enderbury': 'Эндербери',
    'Fakaofo': 'Факаофо', 'Fiji': 'Фиджи', 'Funafuti': 'Фунафути', 'Galapagos': 'Галапагос',
    'Gambier': 'Гамбье', 'Guadalcanal': 'Гвадалканал', 'Guam': 'Гуам', 'Honolulu': 'Гонолулу',
    'Kiritimati': 'Киритимати', 'Kosrae': 'Кусаие', 'Kwajalein': 'Кваджалейн', 'Majuro': 'Маджуро',
    'Marquesas': 'Маркизские острова', 'Midway': 'Мидуэй', 'Nauru': 'Науру', 'Niue': 'Ниуэ',
    'Norfolk': 'Норфолк', 'Noumea': 'Нумеа', 'Pago_Pago': 'Паго-Паго', 'Palau': 'Палау',
    'Pitcairn': 'Питкэрн', 'Pohnpei': 'Понпеи', 'Port_Moresby': 'Порт-Морсби', 'Rarotonga': 'Раротонга',
    'Saipan': 'Сайпан', 'Tahiti': 'Таити', 'Tarawa': 'Тарава', 'Tongatapu': 'Тонгатапу',
    'Wake': 'Уэйк', 'Wallis': 'Уоллис',

    // Другое
    'UTC': 'UTC'
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
    
    // Попробуем найти перевод для составных имен, например 'Argentina/Buenos_Aires'
    const fullRuName = timezoneNameMap[iana];

    return {
        name: fullRuName || ruName || city.replace(/_/g, ' '),
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
    const match = dateString.match(/GMT([+-]\d{1,2}(:\d{2})?)/);
    if (match) return `UTC${match[1]}`;
    return 'UTC';
}
