let timeoutId;
const RECENT_KEY = 'recentEmojiAndSymbols';
const RECENT_LIMIT = 18;

function getRecent() {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
}

function addToRecent(symbol) {
    let recent = getRecent();
    // Удаляем, если уже есть, чтобы переместить в начало
    recent = recent.filter(item => item.copy !== symbol.copy);
    recent.unshift(symbol);
    if (recent.length > RECENT_LIMIT) {
        recent.pop();
    }
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

export function getHtml() {
    return `
        <div class="p-4 space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50">Скопировано!</div>
            
            <div class="relative mb-4">
                <input type="search" id="symbol-search" placeholder="Поиск по названию (например, сердце, стрелка, money...)" class="w-full p-3 pl-10 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
    // Данные с ключевыми словами для поиска
    const symbolsData = {
        'Недавно использованные': getRecent(),
        'Популярные': ['✓', '✗', '★', '☆', '♥', '₽', '€', '$', '→', '←', '©', '™'],
        'Валюты': ['€', '£', '¥', '₽', '₴', '$', '¢', '₩', '₪', '₮', '₹', '₿', '₣', '₤', '₧'],
        'Математические': ['≈', '≠', '≤', '≥', '÷', '×', '−', '+', '∞', 'π', '√', '∫', '∑', '∂', '∅', '±', '°', '¹', '²', '³', 'µ', '∆', '¼', '½', '¾'],
        'Стрелки': ['←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '⇦', '⇧', '⇨', '⇩', '➥', '↶', '↷'],
        'Пунктуация и прочее': ['©', '®', '™', '§', '•', '…', '–', '—', '‘', '’', '“', '”', '„', '«', '»'],
        'Фигуры и знаки': ['★', '☆', '✓', '✗', '♥', '♦', '♣', '♠', '♪', '♫', '●', '○', '■', '□', '▲', '▼', '◄', '►', '◉', '◊', '◦'],
        'Пробелы': [ { display: 'Пустой', copy: '\u00A0', title: 'Неразрывный пробел', keywords: 'пустой неразрывный' }, { display: 'Узкий', copy: '\u2009', title: 'Узкий неразрывный пробел', keywords: 'узкий тонкий' } ]
    };
    const emojiData = {
        'Смайлики и эмоции': [ {e: '😀', k: 'улыбка'}, {e: '😂', k: 'смех слезы'}, {e: '❤️', k: 'сердце любовь'}, {e: '👍', k: 'лайк палец вверх'}, {e: '🤔', k: 'мысли думаю'}, {e: '😎', k: 'крутой очки'}, {e: '🥳', k: 'праздник вечеринка'}, {e: '😭', k: 'плач слезы'}, {e: '🙏', k: 'молитва спасибо'}, {e: '🤯', k: 'взрыв мозг шок'} /*... и так далее */ ],
        'Люди и тело': [ {e: '👋', k: 'привет машет'}, {e: '💪', k: 'сила мышцы'}, {e: '👀', k: 'глаза смотрю'}, {e: '🧠', k: 'мозг ум'} ],
        'Животные и природа': [ {e: '🐶', k: 'собака'}, {e: '🐱', k: 'кошка'}, {e: '🌸', k: 'цветок весна'}, {e: '🔥', k: 'огонь пламя'}, {e: '🌍', k: 'земля планета'} ],
        'Еда и напитки': [ {e: '🍕', k: 'пицца'}, {e: '🍔', k: 'бургер'}, {e: '☕', k: 'кофе чай'}, {e: '🎂', k: 'торт день рождения'} ]
    };
     // Упрощенный список для примера, в реальности он был бы гораздо больше
    const fullEmojiList = [].concat(...Object.values(emojiData).map(arr => arr.map(item => item.e))).join('');
    emojiData['Все эмодзи'] = fullEmojiList.split(/(?:)/u); // Разделение строки на эмодзи

    const symbolsTab = document.getElementById('symbols-tab'), emojiTab = document.getElementById('emoji-tab'), symbolsContent = document.getElementById('symbols-content'), emojiContent = document.getElementById('emoji-content'), notification = document.getElementById('copy-notification'), searchInput = document.getElementById('symbol-search');

    const createGrid = (data, isEmoji = false) => {
        const fragment = document.createDocumentFragment();
        for (const category in data) {
            if (category === 'Недавно использованные' && data[category].length === 0) continue;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4 category-container';
            categoryDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1 category-title">${category}</h3>`;
            
            const symbolsGrid = document.createElement('div');
            symbolsGrid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2';
            
            data[category].forEach(symbol => {
                const btn = document.createElement('button');
                const isObj = typeof symbol === 'object' && symbol !== null;
                const { display, copy, title, keywords } = isObj 
                    ? { display: symbol.display || symbol.e, copy: symbol.copy || symbol.e, title: symbol.title, keywords: symbol.keywords || symbol.k } 
                    : { display: symbol, copy: symbol, title: null, keywords: isEmoji ? findEmojiKeywords(symbol) : '' };

                btn.className = isObj && symbol.display ? 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-sm' : 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xl';
                btn.textContent = display;
                btn.dataset.keywords = `${display} ${keywords || ''}`.toLowerCase();
                if(title) btn.title = title;
                
                btn.addEventListener('click', () => { 
                    const dataToSave = isObj ? symbol : {e: copy, k: keywords};
                    addToRecent(dataToSave);
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
    
    // Функция-заглушка для поиска ключевых слов для всех эмодзи
    function findEmojiKeywords(emoji) {
        for (const category of Object.values(emojiData)) {
            const found = category.find(item => typeof item === 'object' && item.e === emoji);
            if (found) return found.k;
        }
        return '';
    }

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

    const switchTab = (active) => { 
        symbolsTab.classList.toggle('active', active === 'symbols'); 
        emojiTab.classList.toggle('active', active === 'emoji'); 
        symbolsContent.classList.toggle('hidden', active !== 'symbols'); 
        emojiContent.classList.toggle('hidden', active !== 'emoji'); 
        // Обновляем "Недавно использованные" при переключении, если нужно
        const recentContainer = symbolsContent.querySelector('.category-container');
        if(recentContainer && recentContainer.querySelector('.category-title').textContent === 'Недавно использованные') {
             recentContainer.remove();
             const updatedRecentData = {'Недавно использованные': getRecent()};
             if (getRecent().length > 0) {
                 symbolsContent.prepend(createGrid(updatedRecentData, false));
             }
        }
    };
    symbolsTab.addEventListener('click', () => switchTab('symbols'));
    emojiTab.addEventListener('click', () => switchTab('emoji'));
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
}
