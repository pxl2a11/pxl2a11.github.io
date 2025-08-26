let timeoutId;
let activeSkinTonePopup = null;

export function getHtml() {
    return `
        <style>
            /* Added styles for better popup positioning and active tabs */
            .tab-btn {
                color: #6B7280; /* gray-500 */
                border-color: transparent;
                transition: all 0.2s ease-in-out;
            }
            .dark .tab-btn {
                color: #9CA3AF; /* dark:gray-400 */
            }
            .tab-btn.active {
                color: #3B82F6; /* blue-500 */
                border-color: #3B82F6; /* blue-500 */
            }
            .dark .tab-btn.active {
                color: #60A5FA; /* dark:blue-400 */
                border-color: #60A5FA; /* dark:blue-400 */
            }
            .tab-btn:not(.active):hover {
                color: #1F2937; /* gray-800 */
                border-color: #D1D5DB; /* gray-300 */
            }
            .dark .tab-btn:not(.active):hover {
                color: #F9FAFB; /* dark:gray-50 */
                border-color: #4B5563; /* dark:gray-600 */
            }
        </style>
        <div class="p-4 space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50">Скопировано!</div>
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

    // --- ADDED: Skin tone logic constants ---
    const skinToneModifiers = ['🏻', '🏼', '🏽', '🏾', '🏿'];
    const emojiWithSkinToneSupport = new Set(['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '🦻', '👃', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵']);

    const symbolsTab = document.getElementById('symbols-tab'),
        emojiTab = document.getElementById('emoji-tab'),
        symbolsContent = document.getElementById('symbols-content'),
        emojiContent = document.getElementById('emoji-content'),
        notification = document.getElementById('copy-notification');

    const createGrid = (data, isEmoji) => {
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
                
                btn.className = (typeof symbol === 'object') 
                    ? 'relative flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-sm' 
                    : 'relative flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xl';
                
                btn.textContent = display;
                if (title) btn.title = title;

                // --- MODIFIED: Event listener logic for skin tones ---
                if (isEmoji && emojiWithSkinToneSupport.has(copy)) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the global click listener from closing the popup immediately
                        
                        // Close any other open popup
                        if (activeSkinTonePopup) {
                            activeSkinTonePopup.remove();
                            activeSkinTonePopup = null;
                        }

                        // Create the popup
                        const skinTonePopup = document.createElement('div');
                        skinTonePopup.className = 'absolute z-10 bottom-full mb-2 w-auto flex justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-1';
                        
                        skinToneModifiers.forEach(modifier => {
                            const toneBtn = document.createElement('button');
                            toneBtn.className = 'p-2 text-2xl rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700';
                            toneBtn.textContent = display + modifier;
                            toneBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(display + modifier);
                                notification.classList.remove('opacity-0');
                                if (timeoutId) clearTimeout(timeoutId);
                                timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
                                if (activeSkinTonePopup) {
                                    activeSkinTonePopup.remove();
                                    activeSkinTonePopup = null;
                                }
                            });
                            skinTonePopup.appendChild(toneBtn);
                        });

                        activeSkinTonePopup = skinTonePopup;
                        btn.appendChild(skinTonePopup);
                    });
                } else {
                    // Original click listener for simple copy
                    btn.addEventListener('click', () => {
                        navigator.clipboard.writeText(copy);
                        notification.classList.remove('opacity-0');
                        if (timeoutId) clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
                    });
                }
                symbolsGrid.appendChild(btn);
            });
            categoryDiv.appendChild(symbolsGrid);
            fragment.appendChild(categoryDiv);
        }
        return fragment;
    };

    // --- ADDED: Global click listener to close the popup ---
    document.addEventListener('click', (e) => {
        // If a popup exists and the click was outside of it, remove it
        if (activeSkinTonePopup && !activeSkinTonePopup.contains(e.target)) {
            activeSkinTonePopup.remove();
            activeSkinTonePopup = null;
        }
    });

    symbolsContent.appendChild(createGrid(symbolsData, false));
    emojiContent.appendChild(createGrid(emojiData, true));

    const switchTab = (active) => {
        symbolsTab.classList.toggle('active', active === 'symbols');
        emojiTab.classList.toggle('active', active === 'emoji');
        symbolsContent.classList.toggle('hidden', active !== 'symbols');
        emojiContent.classList.toggle('hidden', active !== 'emoji');
    };

    symbolsTab.addEventListener('click', () => switchTab('symbols'));
    emojiTab.addEventListener('click', () => switchTab('emoji'));
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
    if (activeSkinTonePopup) {
        activeSkinTonePopup.remove();
        activeSkinTonePopup = null;
    }
    // Remove the global click listener to avoid memory leaks
    document.removeEventListener('click', () => {});
}
