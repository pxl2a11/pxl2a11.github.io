let timeoutId;
// ИЗМЕНЕНИЕ: Разные ключи для хранения недавних символов и эмодзи
const RECENT_SYMBOLS_KEY = 'recentSymbols';
const RECENT_EMOJI_KEY = 'recentEmojis';
const RECENT_LIMIT = 20;

function getRecent(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function addToRecent(key, symbol) {
    let recent = getRecent(key);
    recent = recent.filter(item => item.c !== symbol.c); // c = copy
    recent.unshift(symbol);
    if (recent.length > RECENT_LIMIT) {
        recent.pop();
    }
    localStorage.setItem(key, JSON.stringify(recent));
}

export function getHtml() {
    return `
        <!-- ИСПРАВЛЕНИЕ: Добавлены стили для активной вкладки -->
        <style>
            .tab-btn {
                color: #6B7280; /* gray-500 */
                border-color: transparent;
                transition: all 0.2s ease-in-out;
            }
            .dark .tab-btn {
                color: #9CA3AF; /* dark:gray-400 */
            }
            .tab-btn.active {
                color: white;
                background-color: #3B82F6; /* blue-500 */
                border-color: #3B82F6;
                border-radius: 0.5rem 0.5rem 0 0;
            }
            .dark .tab-btn.active {
                background-color: #60A5FA; /* dark:blue-400 */
                color: #1F2937; /* dark:gray-800 */
                border-color: #60A5FA;
            }
             .tab-btn:not(.active):hover {
                color: #1F2937; /* gray-800 */
                border-color: #D1D5DB; /* gray-300 */
             }
             .dark .tab-btn:not(.active):hover {
                color: #F9FAFB; /* gray-50 */
                border-color: #4B5563; /* gray-600 */
             }
        </style>
        <div class="p-4 space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50">Скопировано!</div>
            <div class="relative mb-4">
                <input type="search" id="symbol-search" placeholder="Поиск (например, сердце, стрелка, money...)" class="w-full p-3 pl-10 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div class="flex border-b border-gray-300 dark:border-gray-600">
                <button id="symbols-tab" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Символы</button>
                <button id="emoji-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Эмодзи</button>
            </div>
            <div id="symbols-content"></div>
            <div id="emoji-content" class="hidden"></div>
        </div>
    `;
}

export function init() {
    // Структура данных: s - symbol, k - keywords, d - display, c - copy, t - title
    const symbolsData = {
        'Популярные': [{s:'✓',k:'галочка'}, {s:'✗',k:'крестик'}, {s:'★',k:'звезда'}, {s:'☆',k:'звезда'}, {s:'♥',k:'сердце'}, {s:'₽',k:'рубль'}, {s:'€',k:'евро'}, {s:'$',k:'доллар'}, {s:'→',k:'стрелка вправо'}, {s:'←',k:'стрелка влево'}, {s:'©',k:'копирайт'}, {s:'™',k:'тм'}],
        'Валюты': [{s:'€',k:'евро'}, {s:'£',k:'фунт'}, {s:'¥',k:'йена'}, {s:'₽',k:'рубль'}, {s:'₴',k:'гривна'}, {s:'$',k:'доллар'}, {s:'¢',k:'цент'}, {s:'₩',k:'вон'}, {s:'₪',k:'шекель'}, {s:'₮',k:'тугрик'}, {s:'₹',k:'рупия'}, {s:'₿',k:'биткоин'}, {s:'₣',k:'франк'}, {s:'₤',k:'лира'}, {s:'₧',k:'песета'}],
        'Математические': [{s:'≈',k:'примерно'}, {s:'≠',k:'не равно'}, {s:'≤',k:'меньше или равно'}, {s:'≥',k:'больше или равно'}, {s:'÷',k:'деление'}, {s:'×',k:'умножение'}, {s:'−',k:'минус'}, {s:'+',k:'плюс'}, {s:'∞',k:'бесконечность'}, {s:'π',k:'пи'}, {s:'√',k:'корень'}, {s:'∫',k:'интеграл'}, {s:'∑',k:'сумма'}, {s:'∂',k:'дифференциал'}, {s:'∅',k:'пустое множество'}, {s:'±',k:'плюс-минус'}, {s:'°',k:'градус'}, {s:'¹',k:'1 степень'}, {s:'²',k:'2 степень'}, {s:'³',k:'3 степень'}, {s:'µ',k:'мю микро'}, {s:'∆',k:'дельта'}, {s:'¼',k:'одна четверть'}, {s:'½',k:'одна вторая'}, {s:'¾',k:'три четверти'}],
        'Стрелки': [{s:'←',k:'стрелка влево'}, {s:'↑',k:'стрелка вверх'}, {s:'→',k:'стрелка вправо'}, {s:'↓',k:'стрелка вниз'}, {s:'↔',k:'стрелка влево вправо'}, {s:'↕',k:'стрелка вверх вниз'}, {s:'↖',k:'стрелка вверх влево'}, {s:'↗',k:'стрелка вверх вправо'}, {s:'↘',k:'стрелка вниз вправо'}, {s:'↙',k:'стрелка вниз влево'}, {s:'⇦',k:'стрелка'}, {s:'⇧',k:'стрелка'}, {s:'⇨',k:'стрелка'}, {s:'⇩',k:'стрелка'}, {s:'➥',k:'стрелка'}, {s:'↶',k:'стрелка'}, {s:'↷',k:'стрелка'}],
        'Пунктуация и прочее': [{s:'©',k:'копирайт'}, {s:'®',k:'зарегистрировано'}, {s:'™',k:'тм'}, {s:'§',k:'параграф'}, {s:'•',k:'точка'}, {s:'…',k:'многоточие'}, {s:'–',k:'тире'}, {s:'—',k:'длинное тире'}, {s:'‘',k:'кавычка'}, {s:'’',k:'кавычка'}, {s:'“',k:'кавычка'}, {s:'”',k:'кавычка'}, {s:'„',k:'кавычка'}, {s:'«',k:'кавычка'}, {s:'»',k:'кавычка'}],
        'Фигуры и знаки': [{s:'★',k:'звезда'}, {s:'☆',k:'звезда'}, {s:'✓',k:'галочка'}, {s:'✗',k:'крестик'}, {s:'♥',k:'сердце'}, {s:'♦',k:'бубны'}, {s:'♣',k:'трефы'}, {s:'♠',k:'пики'}, {s:'♪',k:'нота'}, {s:'♫',k:'нота'}, {s:'●',k:'круг'}, {s:'○',k:'круг'}, {s:'■',k:'квадрат'}, {s:'□',k:'квадрат'}, {s:'▲',k:'треугольник'}, {s:'▼',k:'треугольник'}, {s:'◄',k:'треугольник'}, {s:'►',k:'треугольник'}, {s:'◉',k:'круг'}, {s:'◊',k:'ромб'}, {s:'◦',k:'круг'}],
        'Пробелы': [ {d: 'Пустой', c: '\u00A0', t: 'Неразрывный пробел', k: 'пустой неразрывный' }, {d: 'Узкий', c: '\u2009', t: 'Узкий неразрывный пробел', k: 'узкий тонкий' } ]
    };
    const emojiStrings = {
        'Смайлики и эмоции': '😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲☹️🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🥳🥴🥺🤡🤥🤫🤭🧐🤓',
        'Люди и тело': '👋🤚🖐️✋🖖👌🤌🤏✌️🤞🤟🤘🤙👈👉👆🖕👇☝️👍👎✊👊🤛🤜👏🙌👐🤲🤝🙏✍️💅🤳💪🦾🦵🦿🦶👂🦻👃🧠🫀🫁🦷🦴👀👁️👅👄👶🧒👦👧🧑👱👨🧔👩🧓👴👵',
        'Животные и природа': '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦋🐛🐺🐗🐴🦓🦒🐘🦏🐪🐫🐿️🦔🐾🌵🎄🌲🌳🌴🌱🌿☘️🍀🎍🎋🍃🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌎🌍🌏🌕🌖🌗🌘🌑🌒🌓🌔🌙🌚🌛🌜💫⭐🌟✨⚡🔥💥☄️☀️🌤️⛅🌥️🌦️🌈☁️🌧️⛈️🌩️🌨️🌬️💨🌪️🌫️🌊💧💦☔💧',
        'Еда и напитки': '🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶️🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥫🍝🍜🍲🍛🍣🍱🥟🍤🍙🍚🍘🍥🥠🥮🍢🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🧃🥤🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊🥄🍴🍽️'
    };
    const emojiData = {};
    for(const category in emojiStrings) { emojiData[category] = emojiStrings[category].split(/(?:)/u).map(emoji => ({ s: emoji })); }
    const addKeywords = (category, map) => { if(emojiData[category]) emojiData[category].forEach(item => { if(map[item.s]) item.k = map[item.s]; }) };
    addKeywords('Смайлики и эмоции', {'😂':'смех слезы', '❤️':'сердце любовь', '👍':'лайк палец вверх', '🤔':'мысли думаю', '🥳':'праздник вечеринка', '😭':'плач слезы', '🙏':'молитва спасибо'});
    
    const symbolsTab = document.getElementById('symbols-tab'), emojiTab = document.getElementById('emoji-tab'), symbolsContent = document.getElementById('symbols-content'), emojiContent = document.getElementById('emoji-content'), notification = document.getElementById('copy-notification'), searchInput = document.getElementById('symbol-search');

    const createGrid = (data, isEmoji) => {
        const fragment = document.createDocumentFragment();
        for (const category in data) {
            if (category === 'Недавно использованные' && data[category].length === 0) continue;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4 category-container';
            categoryDiv.dataset.category = category;
            categoryDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1 category-title">${category}</h3>`;
            
            const symbolsGrid = document.createElement('div');
            symbolsGrid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2';
            
            data[category].forEach(symbol => {
                const btn = document.createElement('button');
                const { d, s, c, t, k } = symbol;
                const display = d || s;
                const copy = c || s;
                btn.className = d ? 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-sm' : 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xl';
                btn.textContent = display;
                btn.dataset.keywords = `${display} ${k || ''}`.toLowerCase();
                if(t) btn.title = t;
                
                btn.addEventListener('click', () => { 
                    const dataToSave = { s: display, c: copy, k: k || '', t: t, d: d };
                    if (isEmoji) { addToRecent(RECENT_EMOJI_KEY, dataToSave); } 
                    else { addToRecent(RECENT_SYMBOLS_KEY, dataToSave); }
                    navigator.clipboard.writeText(copy); 
                    notification.classList.remove('opacity-0'); 
                    if (timeoutId) clearTimeout(timeoutId); 
                    timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000); 
                });
                symbolsGrid.appendChild(btn);
            });
            categoryDiv.appendChild(symbolsGrid);
            fragment.appendChild(categoryDiv);
        }
        return fragment;
    };
    
    symbolsContent.appendChild(createGrid(symbolsData, false));
    emojiContent.appendChild(createGrid(emojiData, true));
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('#symbols-content, #emoji-content').forEach(content => {
            content.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('hidden', !btn.dataset.keywords.includes(searchTerm));
            });
            content.querySelectorAll('.category-container').forEach(container => {
                const hasVisibleButtons = !!container.querySelector('button:not(.hidden)');
                container.classList.toggle('hidden', !hasVisibleButtons);
            });
        });
    });
    
    const updateRecentTab = (contentEl, key, isEmoji) => {
        const recentData = {'Недавно использованные': getRecent(key)};
        let container = contentEl.querySelector('[data-category="Недавно использованные"]');
        if (container) container.remove();
        if (getRecent(key).length > 0) {
            const newGrid = createGrid(recentData, isEmoji);
            contentEl.prepend(newGrid);
        }
    };

    const switchTab = (active) => { 
        symbolsTab.classList.toggle('active', active === 'symbols'); 
        emojiTab.classList.toggle('active', active === 'emoji'); 
        symbolsContent.classList.toggle('hidden', active !== 'symbols'); 
        emojiContent.classList.toggle('hidden', active !== 'emoji'); 

        updateRecentTab(symbolsContent, RECENT_SYMBOLS_KEY, false);
        updateRecentTab(emojiContent, RECENT_EMOJI_KEY, true);
        
        searchInput.dispatchEvent(new Event('input'));
    };

    symbolsTab.addEventListener('click', () => switchTab('symbols'));
    emojiTab.addEventListener('click', () => switchTab('emoji'));
    switchTab('symbols');
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
}
