let timeoutId;
let activeSkinTonePopup = null;
const RECENTLY_USED_KEY = 'emoji-and-symbols-recents';
const MAX_RECENTS = 24;

// --- HTML-структура компонента ---
export function getHtml() {
    return `
        <div class="p-4 space-y-4 flex flex-col h-full">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-20">Скопировано!</div>
            
            <div class="relative">
                <input id="search-input" type="text" placeholder="Поиск символов и эмодзи..." class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                <button id="symbols-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Символы</button>
                <button id="emoji-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Эмодзи</button>
                <button id="recents-tab" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Недавние</button>
            </div>
            
            <div class="flex-grow overflow-y-auto">
                <div id="recents-content"></div>
                <div id="symbols-content" class="hidden"></div>
                <div id="emoji-content" class="hidden"></div>
                <div id="search-results" class="hidden"></div>
            </div>
        </div>
    `;
}

// --- Логика инициализации и работы компонента ---
export function init() {
    // --- ОБНОВЛЕННЫЕ ДАННЫЕ С КЛЮЧЕВЫМИ СЛОВАМИ ---
    const symbolsData = {
        'Популярные': [
            { char: '✓', keywords: ['галочка', 'check', 'yes', 'да', 'ok'] }, { char: '✗', keywords: ['крестик', 'x', 'no', 'нет', 'ошибка'] },
            { char: '★', keywords: ['звезда', 'star', 'избранное'] }, { char: '☆', keywords: ['звезда', 'star', 'контур'] },
            { char: '♥', keywords: ['сердце', 'heart', 'любовь', 'love'] }, { char: '₽', keywords: ['рубль', 'валюта', 'деньги'] },
            { char: '€', keywords: ['евро', 'euro', 'валюта'] }, { char: '$', keywords: ['доллар', 'dollar', 'валюта'] },
            { char: '→', keywords: ['стрелка', 'вправо', 'arrow', 'right'] }, { char: '←', keywords: ['стрелка', 'влево', 'arrow', 'left'] },
            { char: '©', keywords: ['копирайт', 'copyright'] }, { char: '™', keywords: ['торговая марка', 'tm', 'trademark'] }
        ],
        'Валюты': [
            { char: '€', keywords: ['евро', 'euro'] }, { char: '£', keywords: ['фунт', 'pound'] }, { char: '¥', keywords: ['иена', 'йена', 'yuan'] },
            { char: '₽', keywords: ['рубль', 'ruble'] }, { char: '₴', keywords: ['гривна', 'hryvnia'] }, { char: '$', keywords: ['доллар', 'dollar'] },
            { char: '¢', keywords: ['цент', 'cent'] }, { char: '₩', keywords: ['вона', 'won'] }, { char: '₪', keywords: ['шекель', 'shekel'] },
            { char: '₮', keywords: ['тугрик', 'tugrik'] }, { char: '₹', keywords: ['рупия', 'rupee'] }, { char: '₿', keywords: ['биткоин', 'bitcoin'] }
        ],
        'Математические': [
            { char: '≈', keywords: ['примерно', 'равно'] }, { char: '≠', keywords: ['не равно'] }, { char: '≤', keywords: ['меньше или равно'] },
            { char: '≥', keywords: ['больше или равно'] }, { char: '÷', keywords: ['деление'] }, { char: '×', keywords: ['умножение'] },
            { char: '−', keywords: ['минус', 'вычитание'] }, { char: '+', keywords: ['плюс', 'сложение'] }, { char: '∞', keywords: ['бесконечность'] },
            { char: 'π', keywords: ['пи', 'pi'] }, { char: '√', keywords: ['корень', 'квадратный'] }, { char: '∫', keywords: ['интеграл'] },
            { char: '∑', keywords: ['сумма'] }, { char: '±', keywords: ['плюс-минус'] }, { char: '°', keywords: ['градус'] }
        ],
        'Стрелки': [
            { char: '←', keywords: ['влево'] }, { char: '↑', keywords: ['вверх'] }, { char: '→', keywords: ['вправо'] },
            { char: '↓', keywords: ['вниз'] }, { char: '↔', keywords: ['влево-вправо'] }, { char: '↕', keywords: ['вверх-вниз'] },
            { char: '↖', keywords: ['северо-запад'] }, { char: '↗', keywords: ['северо-восток'] }, { char: '↘', keywords: ['юго-восток'] },
            { char: '↙', keywords: ['юго-запад'] }
        ],
    };

    const emojiData = {
        'Смайлики и люди': [
            { char: '😀', keywords: ['лицо', 'улыбка', 'счастье'] }, { char: '😂', keywords: ['лицо', 'смех', 'слезы', 'радость'] },
            { char: '😊', keywords: ['лицо', 'улыбка', 'счастье', 'румянец'] }, { char: '😍', keywords: ['лицо', 'любовь', 'сердце', 'глаза'] },
            { char: '🤔', keywords: ['лицо', 'мысли', 'думать'] }, { char: '😎', keywords: ['лицо', 'очки', 'крутой'] },
            { char: '👋', keywords: ['рука', 'привет', 'пока'] }, { char: '👍', keywords: ['рука', 'палец вверх', 'лайк', 'хорошо'] },
            { char: '🙏', keywords: ['руки', 'молитва', 'пожалуйста', 'спасибо'] }, { char: '🧠', keywords: ['мозг', 'ум', 'интеллект'] }
        ],
        'Животные и природа': [
            { char: '🐶', keywords: ['собака', 'пес', 'животное'] }, { char: '🐱', keywords: ['кошка', 'кот', 'животное'] },
            { char: '🦊', keywords: ['лиса', 'животное'] }, { char: '🌳', keywords: ['дерево', 'растение', 'природа'] },
            { char: '🌸', keywords: ['цветок', 'вишня', 'весна'] }, { char: '🌍', keywords: ['земля', 'планета', 'мир'] }
        ],
        'Еда и напитки': [
            { char: '🍎', keywords: ['яблоко', 'фрукт'] }, { char: '🍕', keywords: ['пицца', 'еда'] }, { char: '☕', keywords: ['кофе', 'напиток', 'чашка'] },
            { char: '🍔', keywords: ['бургер', 'гамбургер', 'еда'] }
        ],
        'Активности': [
            { char: '⚽', keywords: ['футбол', 'мяч', 'спорт'] }, { char: '🏀', keywords: ['баскетбол', 'мяч', 'спорт'] },
            { char: '🎨', keywords: ['искусство', 'палитра', 'рисование'] }, { char: '🎮', keywords: ['игра', 'контроллер', 'джойстик'] },
            { char: '🎵', keywords: ['музыка', 'нота'] }
        ],
        'Путешествия и места': [
            { char: '🚗', keywords: ['машина', 'автомобиль', 'транспорт'] }, { char: '✈️', keywords: ['самолет', 'полет', 'путешествие'] },
            { char: '🗺️', keywords: ['карта', 'мир', 'путешествие'] }, { char: '🏠', keywords: ['дом', 'здание'] },
            { char: '🗼', keywords: ['башня', 'эйфелева', 'париж'] }
        ],
        'Объекты': [
            { char: '💻', keywords: ['компьютер', 'ноутбук', 'техника'] }, { char: '📱', keywords: ['телефон', 'смартфон'] },
            { char: '💡', keywords: ['лампочка', 'идея', 'свет'] }, { char: '🔑', keywords: ['ключ', 'замок', 'пароль'] },
            { char: '📚', keywords: ['книги', 'учеба', 'библиотека'] }
        ],
        'Флаги': [
            { char: '🏳️‍🌈', keywords: ['радуга', 'прайд', 'лгбт'] }, { char: '🏁', keywords: ['финиш', 'гонка', 'клетчатый'] },
        ]
    };
    
    const skinToneModifiers = ['🏻', '🏼', '🏽', '🏾', '🏿'];
    const emojiWithSkinToneSupport = new Set(['👋', '👍', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '👃', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵']);

    const searchInput = document.getElementById('search-input');
    const notification = document.getElementById('copy-notification');
    const tabs = {
        symbols: document.getElementById('symbols-tab'),
        emoji: document.getElementById('emoji-tab'),
        recents: document.getElementById('recents-tab'),
    };
    const contents = {
        symbols: document.getElementById('symbols-content'),
        emoji: document.getElementById('emoji-content'),
        recents: document.getElementById('recents-content'),
    };

    // --- Управление "Недавно использованными" ---
    const getRecents = () => JSON.parse(localStorage.getItem(RECENTLY_USED_KEY)) || [];

    const addRecent = (item) => {
        let recents = getRecents();
        // Удаляем дубликаты
        recents = recents.filter(r => r.char !== item.char);
        // Добавляем в начало
        recents.unshift(item);
        // Ограничиваем размер
        if (recents.length > MAX_RECENTS) {
            recents = recents.slice(0, MAX_RECENTS);
        }
        localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recents));
    };

    const copyToClipboard = (text, item) => {
        navigator.clipboard.writeText(text);
        notification.classList.remove('opacity-0');
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
        if (item) {
            addRecent(item);
        }
    };
    
    // --- Создание сетки символов ---
    const createGrid = (data, isEmoji) => {
        const fragment = document.createDocumentFragment();
        for (const category in data) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-container mb-4';
            categoryDiv.innerHTML = `<h3 class="category-title text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1">${category}</h3>`;
            
            const symbolsGrid = document.createElement('div');
            symbolsGrid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2';
            
            data[category].forEach(item => {
                const btn = document.createElement('button');
                const { char, keywords, display, title } = item;
                const text = display || char;
                const copyText = char;

                btn.className = 'symbol-btn relative flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xl';
                btn.textContent = text;
                btn.dataset.keywords = [char, ...keywords].join(',');
                if (title) btn.title = title;

                if (isEmoji && emojiWithSkinToneSupport.has(copyText)) {
                     btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (activeSkinTonePopup) activeSkinTonePopup.remove();
                        const skinTonePopup = document.createElement('div');
                        skinTonePopup.className = 'absolute z-10 bottom-full mb-2 flex justify-center bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg p-1';
                        skinToneModifiers.forEach(modifier => {
                            const toneBtn = document.createElement('button');
                            toneBtn.className = 'p-2 text-2xl rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700';
                            toneBtn.textContent = copyText + modifier;
                            toneBtn.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                copyToClipboard(copyText + modifier, item);
                                if (activeSkinTonePopup) activeSkinTonePopup.remove();
                            });
                            skinTonePopup.appendChild(toneBtn);
                        });
                        activeSkinTonePopup = skinTonePopup;
                        btn.appendChild(skinTonePopup);
                    });
                } else {
                    btn.addEventListener('click', () => {
                        copyToClipboard(copyText, item);
                    });
                }
                symbolsGrid.appendChild(btn);
            });
            categoryDiv.appendChild(symbolsGrid);
            fragment.appendChild(categoryDiv);
        }
        return fragment;
    };
    
    const renderRecents = () => {
        contents.recents.innerHTML = '';
        const recents = getRecents();
        if (recents.length === 0) {
            contents.recents.innerHTML = `<p class="text-gray-500">Здесь будут недавно скопированные символы.</p>`;
            return;
        }
        const recentsGrid = createGrid({ 'Недавние': recents }, true); // isEmoji=true для поддержки тонов кожи
        contents.recents.appendChild(recentsGrid);
    };

    // --- Логика переключения вкладок ---
    const switchTab = (activeKey) => {
        if (activeSkinTonePopup) activeSkinTonePopup.remove();
        Object.keys(tabs).forEach(key => {
            const isActive = key === activeKey;
            tabs[key].classList.toggle('active', isActive);
            contents[key].classList.toggle('hidden', !isActive);
        });
        if (activeKey === 'recents') {
            renderRecents();
        }
    };
    
    // --- Логика поиска ---
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            // Если поиск пуст, возвращаем видимость всем элементам
            document.querySelectorAll('.category-container, .symbol-btn').forEach(el => el.classList.remove('hidden'));
            return;
        }

        document.querySelectorAll('.category-container').forEach(cat => {
            let hasVisibleSymbols = false;
            cat.querySelectorAll('.symbol-btn').forEach(btn => {
                const keywords = btn.dataset.keywords.toLowerCase();
                if (keywords.includes(query)) {
                    btn.classList.remove('hidden');
                    hasVisibleSymbols = true;
                } else {
                    btn.classList.add('hidden');
                }
            });
            // Скрываем категорию, если в ней нет найденных символов
            cat.classList.toggle('hidden', !hasVisibleSymbols);
        });
    };

    // --- Инициализация ---
    contents.symbols.appendChild(createGrid(symbolsData, false));
    contents.emoji.appendChild(createGrid(emojiData, true));
    
    Object.keys(tabs).forEach(key => {
        tabs[key].addEventListener('click', () => switchTab(key));
    });
    
    document.addEventListener('click', () => {
        if (activeSkinTonePopup) {
            activeSkinTonePopup.remove();
            activeSkinTonePopup = null;
        }
    });

    searchInput.addEventListener('input', handleSearch);
    
    // По умолчанию открываем "Недавние"
    switchTab('recents');
}

// --- Функция очистки ---
export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
    if (activeSkinTonePopup) activeSkinTonePopup.remove();
    // Удаляем обработчики, чтобы избежать утечек памяти
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.removeEventListener('input', handleSearch);
}
