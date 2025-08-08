let timeoutId;

export function getHtml() {
    return `
        <div class="p-4 space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300">Скопировано!</div>
            <div class="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                <button id="symbols-tab" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Символы</button>
                <button id="emoji-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Эмодзи</button>
            </div>
            <div id="symbols-content"></div>
            <div id="emoji-content" class="hidden"></div>
        </div>
    `;
}

export function init() {
    const symbolsData = {
        'Популярные': ['✓', '✗', '★', '☆', '♥', '₽', '€', '$', '→', '←', '©', '™'],
        'Валюты': ['€', '£', '¥', '₽', '₴', '$', '¢', '₩', '₪', '₮', '₹', '₿', '₣', '₤', '₧'],
        'Математические': ['≈', '≠', '≤', '≥', '÷', '×', '−', '+', '∞', 'π', '√', '∫', '∑', '∂', '∅', '±', '°', '¹', '²', '³', 'µ', '∆', '¼', '½', '¾'],
        'Стрелки': ['←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '⇦', '⇧', '⇨', '⇩', '➥', '↶', '↷'],
        'Пунктуация и прочее': ['©', '®', '™', '§', '•', '…', '–', '—', '‘', '’', '“', '”', '„', '«', '»'],
        'Фигуры и знаки': ['★', '☆', '✓', '✗', '♥', '♦', '♣', '♠', '♪', '♫', '●', '○', '■', '□', '▲', '▼', '◄', '►', '◉', '◊', '◦'],
        'Пробелы': [ { display: 'Пустой', copy: '\u00A0', title: 'Неразрывный пробел' }, { display: 'Узкий', copy: '\u2009', title: 'Узкий неразрывный пробел' } ]
    };
    const emojiData = {
        'Смайлики и эмоции': ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🥳', '🥴', '🥺', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓'],
        'Люди и тело': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵'],
        'Животные и природа': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦋', '🐛', '🐺', '🐗', '🐴', '🦓', '🦒', '🐘', '🦏', '🐪', '🐫', '🐿️', '🦔', '🐾', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌎', '🌍', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌚', '🌛', '🌜', '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '☀️', '🌤️', '⛅', '🌥️', '🌦️', '🌈', '☁️', '🌧️', '⛈️', '🌩️', '🌨️', '🌬️', '💨', '🌪️', '🌫️', '🌊', '💧', '💦', '☔', '💧'],
        'Еда и напитки': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️']
    };
    const symbolsTab = document.getElementById('symbols-tab'), emojiTab = document.getElementById('emoji-tab'), symbolsContent = document.getElementById('symbols-content'), emojiContent = document.getElementById('emoji-content'), notification = document.getElementById('copy-notification');
    const createGrid = (data) => {
        const fragment = document.createDocumentFragment();
        for (const category in data) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4';
            categoryDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1">${category}</h3>`;
            const symbolsGrid = document.createElement('div');
            symbolsGrid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2';
            data[category].forEach(symbol => {
                const btn = document.createElement('button');
                const { display, copy, title } = (typeof symbol === 'object') ? { display: symbol.display, copy: symbol.copy, title: symbol.title } : { display: symbol, copy: symbol, title: null };
                btn.className = (typeof symbol === 'object') ? 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-sm' : 'flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xl';
                btn.textContent = display;
                if(title) btn.title = title;
                btn.addEventListener('click', () => { navigator.clipboard.writeText(copy); notification.classList.remove('opacity-0'); if (timeoutId) clearTimeout(timeoutId); timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000); });
                symbolsGrid.appendChild(btn);
            });
            categoryDiv.appendChild(symbolsGrid);
            fragment.appendChild(categoryDiv);
        }
        return fragment;
    };
    symbolsContent.appendChild(createGrid(symbolsData));
    emojiContent.appendChild(createGrid(emojiData));
    const switchTab = (active) => { symbolsTab.classList.toggle('active', active === 'symbols'); emojiTab.classList.toggle('active', active === 'emoji'); symbolsContent.classList.toggle('hidden', active !== 'symbols'); emojiContent.classList.toggle('hidden', active !== 'emoji'); };
    symbolsTab.addEventListener('click', () => switchTab('symbols'));
    emojiTab.addEventListener('click', () => switchTab('emoji'));
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
}
