import { getUserData, saveUserData } from 'jsdataManager.js';

 --- State Management ---
let timeoutId;
let intersectionObserver;
const RECENT_SYMBOLS_KEY = 'recentSymbols';
const RECENT_EMOJI_KEY = 'recentEmojis';
const RECENT_LIMIT = 24;

const getRecent = (key) => getUserData(key, []);
const addToRecent = async (key, symbol) => {
    let recent = await getRecent(key);
    recent = recent.filter(item => item.c !== symbol.c);
    recent.unshift(symbol);
    if (recent.length > RECENT_LIMIT) {
        recent.pop();
    }
    await saveUserData(key, recent);
};

 --- Data ---
const symbols = [
    { name: 'Недавно использованные', items: [] },
    { name: 'Популярные', items: [{s:'✓',k:'галочка check'}, {s:'✗',k:'крестик x'}, {s:'★',k:'звезда star'}, {s:'☆',k:'звезда star'}, {s:'♥',k:'сердце heart love'}, {s:'₽',k:'рубль'}, {s:'€',k:'евро'}, {s:'$',k:'доллар'}, {s:'→',k:'стрелка вправо right arrow'}, {s:'←',k:'стрелка влево left arrow'}, {s:'©',k:'копирайт copyright'}, {s:'™',k:'тм trademark'}] },
    { name: 'Стрелки', items: [{s:'←',k:'стрелка влево'}, {s:'↑',k:'стрелка вверх'}, {s:'→',k:'стрелка вправо'}, {s:'↓',k:'стрелка вниз'}, {s:'↔',k:'стрелка влево вправо'}, {s:'↕',k:'стрелка вверх вниз'}, {s:'⇦',k:'стрелка'}, {s:'⇧',k:'стрелка'}, {s:'⇨',k:'стрелка'}, {s:'⇩',k:'стрелка'}, {s:'➥',k:'стрелка'}, {s:'↶',k:'стрелка'}, {s:'↷',k:'стрелка'}] },
    { name: 'Математические', items: [{s:'≈',k:'примерно'}, {s:'≠',k:'не равно'}, {s:'≤',k:'меньше или равно'}, {s:'≥',k:'больше или равно'}, {s:'÷',k:'деление'}, {s:'×',k:'умножение'}, {s:'−',k:'минус'}, {s:'+',k:'плюс'}, {s:'∞',k:'бесконечность'}, {s:'π',k:'пи'}, {s:'√',k:'корень'}, {s:'∫',k:'интеграл'}, {s:'∑',k:'сумма'}, {s:'°',k:'градус'}, {s:'¹',k:'1 степень'}, {s:'²',k:'2 степень'}, {s:'³',k:'3 степень'}, {s:'µ',k:'мю микро'}, {s:'∆',k:'дельта'}, {s:'¼',k:'одна четверть'}, {s:'½',k:'одна вторая'}, {s:'¾',k:'три четверти'}] },
    { name: 'Фигуры и знаки', items: [{s:'★',k:'звезда star'}, {s:'☆',k:'звезда star'}, {s:'✓',k:'галочка check'}, {s:'✗',k:'крестик x'}, {s:'♥',k:'сердце heart'}, {s:'♦',k:'бубны'}, {s:'♣',k:'трефы'}, {s:'♠',k:'пики'}, {s:'♪',k:'нота'}, {s:'♫',k:'нота'}, {s:'●',k:'круг'}, {s:'○',k:'круг'}, {s:'■',k:'квадрат'}, {s:'□',k:'квадрат'}] },
    { name: 'Валюты', items: [{s:'€',k:'евро euro'}, {s:'£',k:'фунт pound'}, {s:'¥',k:'йена yen'}, {s:'₽',k:'рубль ruble'}, {s:'$',k:'доллар dollar'}, {s:'¢',k:'цент cent'}, {s:'₩',k:'вон won'}, {s:'₪',k:'шекель shekel'}, {s:'₹',k:'рупия rupee'}, {s:'₿',k:'биткоин bitcoin'}] },
    { name: 'Шахматы', items: [{s:'♔',k:'король'}, {s:'♕',k:'ферзь'}, {s:'♖',k:'ладья'}, {s:'♗',k:'слон'}, {s:'♘',k:'конь'}, {s:'♙',k:'пешка'}, {s:'♚',k:'король'}, {s:'♛',k:'ферзь'}, {s:'♜',k:'ладья'}, {s:'♝',k:'слон'}, {s:'♞',k:'конь'}] }
];
const emojis = [
    { name: 'Недавно использованные', items: [] },
    { name: 'Смайлики и эмоции', items: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🥳 🥴 🥺 🤡 🤥 🤫 🤭 🧐 🤓'.split(/\s+/).map(s => ({s})) },
    { name: 'Люди и тело', items: '👋 🤚 🖐 ✋ 🖖 👌 🤏 ✌ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍ 💅 🤳 💪 🦵 🦶 👂 👃 🧠 🦷 🦴 👀 👁 👅 👄 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵'.split(/\s+/).map(s => ({s, tones: true})) },
    { name: 'Животные и природа', items: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦋 🐛 🐺 🐗 🐴 🦓 🦒 🐘 🦏 🐪 🐫 🐿 🦔 🐾 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘ 🍀 🍁 🍄 🐚 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌎 🌍 🌏 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌚 🌛 🌜 💫 ⭐ 🌟 ✨ ⚡ 🔥 💥 ☄ ☀ 🌤 ⛅ 🌥 🌦 🌈 ☁ 🌧 ⛈ 🌩 🌨 🌬 💨 🌪 🌫 🌊 💧 💦 ☔'.split(/\s+/).map(s => ({s})) },
    { name: 'Еда и напитки', items: '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🥪 🥙 🧆 🌮 🌯 🥗 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🍵 🧃 🥤 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽'.split(/\s+/).map(s => ({s})) },
    { name: 'Активности', items: '⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🥅 ⛳ 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🏋 🤸 ⛹ 🤺 🤾 🏌 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖 🏵 🎗 🎫 🎟 🎪 🤹 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🪕 🎻 🎲 ♟ 🎯 🎳 🎮 🎰'.split(/\s+/).map(s => ({s})) },
    { name: 'Путешествия и места', items: '🚗 🚕 🚙 🚌 🚐 🚑 🚒 🚓 🚔 🚜 🏎 🏍 🛵 🛺 🚲 🛴 🛹 🚏 🛣 🛤 ⛽ 🚨 🚥 🚦 🛑 🚧 ⚓ ⛵ 🛶 🚤 🛳 ⛴ 🛥 🚢 ✈ 🛩 🛫 🛬 💺 🚁 🚟 🚠 🚡 🛰 🚀 🛸 🛎 🧳 ⌛ ⏳ ⌚ ⏰ ⏱ ⏲ 🕰 🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌙 🌚 🌛 🌜 🌡 ☀ 🌝 🌞 🪐 ⭐ 🌟 🌠 🌌 ☁ ⛅ ⛈ 🌤 🌥 🌦 🌧 🌨 🌩 🌪 🌫 🌬 🌀 🌈 🌂 ☂ ☔ ⛱ ⚡ ❄ ☃ ⛄ ☄ 🔥 💧 🌊 🎃 🎄 🎆 🎇 🧨 ✨ 🎈 🎉 🎊 🎋 🎍 🎎 🎏 🎐 🎑 🧧 🎀 🎁 🎗 🎟 🎫'.split(/\s+/).map(s => ({s})) },
    { name: 'Объекты', items: '⌚ 📱 📲 💻 ⌨ 🖥 🖨 🖱 🖲 🕹 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽 🎞 📞 ☎ 📟 📠 📺 📻 🎙 🎚 🎛 🧭 ⏱ ⏲ ⏰ 🕰 ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯 🧯 💸 💵 💴 💶 💷 💰 💳 💎 ⚖ 🛠 ⛏ 🔩 ⚙ 🧱 ⛓ 💉 🩸 🧬 🔬 🔭 🛰 🛎 🔑 🗝 🛋 🪑 🛌 🛏 🚪 🚽 🚿 🛁 🚬 ⚰ ⚱ 🏺 🗺 🗾 🏔 ⛰ 🌋 🗻 🏕 🏖 🏜 🏝 🏞 🏟 🏛 🏗 🏘 🏚 🏠 🏡 🏢 🏣 🏤 🏥 🏦 🏨 🏩 🏪 🏫 🏬 🏭 🏯 🏰 💒 🗼 🗽 ⛪ 🕌 🛕 🕍 ⛩ 🕋 ⛲ ⛺ 🌁 🌃 🏙 🌄 🌅 🌆 🌇 🌉 ♨ 🎠 🎡 🎢 💈 🎪 🚂 🚃 🚄 🚅 🚆 🚇 🚈 🚉 🚊 🚝 🚞 🚋 🚌 🚍 🚎 🚐 🚑 🚒 🚓 🚔 🚕 🚖 🚗 🚘 🚙 🚚 🚛 🚜'.split(/\s+/).map(s => ({s})) },
    { name: 'Символы и флаги', items: '❤ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣ 💕 💞 💓 💗 💖 💘 💝 💟 ☮ ✝ ☪ 🕉 ☸ ✡ 🔯 🕎 ☯ ☦ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛ 🉑 ☢ ☣ 📳 📴 🈶 🈚 🈸 🈺 🈷 ✴ 🆚 💮 🉐 ㊙ ㊗ 🈴 🈵 🈹 🈲 🅰 🅱 🆎 🆑 🅾 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼ ⁉ 🔅 🔆 〽 ⚠ 🚸 🔱 ⚜ 🔰 ♻ ✅ 🈯 💹 ❇ ✳ ❎ 🌐 💠 Ⓜ 🌀 💤 🏧 🚾 ♿ 🅿 🈂 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧ 🚻 🚮 🎦 📶 🈁 🔣 ℹ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆘 🆙 🆓 🔢 ⏏ ▶ ⏸ ⏯ ⏹ ⏺ ⏭ ⏮ ⏩ ⏪ ⏫ ⏬ ◀ 🔼 🔽 ➡ ⬅ ⬆ ⬇ ↘ ↖ ↪ ↩ ⤴ ⤵ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖ ♾ 💲 💱 🔚 🔙 🔛 🔝 🔜 〰 ➰ ➿ ✔ ☑ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🏁 🚩 🎌 🏴 🏳 🌈 ☠'.split(/\s+/).map(s => ({s})) }
];
const emojiKeywords = {
    '😀': 'лицо улыбка happy smile face', '😁': 'улыбка зубы grin', '😂': 'смех слезы радость joy', '🤣': 'катаюсь по полу от смеха rofl', '😃': 'большая улыбка smiley', '😄': 'счастливый смех глаза smile', '😅': 'улыбка пот sweat cold', '😆': 'щурясь laughing squinting', '😉': 'подмигивание wink', '😊': 'улыбка румянец blush', '😋': 'вкусно язык yum delicious', '😎': 'крутой очки cool sunglasses', '😍': 'влюблен сердце глаза heart eyes love', '😘': 'поцелуй kiss', '🥰': 'любовь сердечки smiling face with hearts', '😗': 'целую kissing', '😙': 'целую улыбка', '😚': 'целую глаза закрыты', '🙂': 'легкая улыбка', '🤗': 'объятия hugs', '🤩': 'звезды в глазах восторг star struck', '🤔': 'думаю размышление thinking', '🤨': 'бровь raised eyebrow', '😐': 'нейтральный neutral face', '😑': 'без выражения expressionless', '😶': 'нет рта no mouth', '🙄': 'закатываю глаза roll eyes', '😏': 'ухмылка smirk', '😣': 'страдание persevere', '😥': 'грустный пот sad but relieved', '😮': 'удивление рот открыт face with open mouth', '🤐': 'рот на замке zipper mouth', '😯': 'тихо hushed', '😪': 'сонный sleepy', '😫': 'усталый tired', '😴': 'сплю sleeping', '😌': 'облегчение relieved', '😛': 'язык stuck out tongue', '😜': 'язык подмигиваю wink tongue', '😝': 'язык щурюсь squinting tongue', '🤤': 'слюни drooling', '😒': 'недовольный unamused', '😓': 'удрученный пот sweat', '😔': 'задумчивый pensive', '😕': 'смущенный confused', '🙃': 'вверх ногами upside down', '🤑': 'деньги язык money mouth', '😲': 'изумление astonished', '☹': 'хмурый frowning', '🙁': 'слегка хмурый', '😖': 'смятение confounded', '😞': 'разочарование disappointed', '😟': 'беспокойство worried', '😤': 'пар из носа злость triumph victory', '😢': 'плач cry', '😭': 'рыдание sob', '😦': 'хмурый рот открыт', '😧': 'страдание anguished', '😨': 'страх fearful', '😩': 'утомленный weary', '🤯': 'взрыв мозг шок exploding head', '😬': 'гримаса grimacing', '😰': 'тревога пот anxious sweat', '😱': 'крик ужас scream', '🥵': 'жарко красный hot face', '🥶': 'холодно синий cold face', '😳': 'румянец flushed', '🤪': 'дурачусь zany face', '😵': 'головокружение dizzy', '😡': 'надутый красный злой pouting enraged', '😠': 'злость angry', '🤬': 'ругань символы cursing', '😷': 'маска medical mask', '🤒': 'термометр больной', '🤕': 'бинт травма', '🤢': 'тошнота nauseated', '🤮': 'рвота vomiting', '🤧': 'чихание sneezing', '😇': 'ангел нимб angel', '🤠': 'ковбой cowboy', '🥳': 'праздник вечеринка partying', '🥴': 'пьяный woozy face', '🥺': 'умоляю pleading begging', '🤡': 'клоун clown', '🤥': 'вру нос lying face', '🤫': 'тише shushing face', '🤭': 'рука у рта хихикаю hand over mouth', '🧐': 'монокль face with monocle', '🤓': 'ботаник очки nerd', '👋': 'привет машу рукой wave', '👍': 'лайк палец вверх thumbs up', '👎': 'дизлайк палец вниз thumbs down', '❤️': 'красное сердце любовь', '⭐': 'звезда star', '🔥': 'огонь пламя fire', '✨': 'блестки магия sparkles', '🎉': 'хлопушка праздник', '🚀': 'ракета старт', '🐶': 'собака dog', '🐱': 'кошка cat', '🌸': 'цветок вишни', '🍕': 'пицца pizza', '🍔': 'бургер', '☕': 'кофе чай', '🎂': 'торт день рождения birthday'
};

emojis.forEach(category => category.items.forEach(item => { item.k = emojiKeywords[item.s] || ''; }));
const allSymbols = [].concat(...symbols.map(c => c.items));
const allEmojis = [].concat(...emojis.map(c => c.items));

const skinTones = ['🏻', '🏼', '🏽', '🏾', '🏿'];

function closeAllPopups() {
    document.querySelectorAll('.skin-tone-popup').forEach(popup => popup.remove());
}

function showSkinTonePopup(button, baseEmoji) {
    closeAllPopups();
    const popup = document.createElement('div');
    popup.className = 'skin-tone-popup absolute z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 flex gap-1';
    
    skinTones.forEach(tone => {
        const toneBtn = document.createElement('button');
        const emojiWithTone = baseEmoji + tone;
        toneBtn.textContent = emojiWithTone;
        toneBtn.className = 'flex items-center justify-center h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-2xl';
        toneBtn.dataset.copy = emojiWithTone;
        
        toneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const copyText = e.currentTarget.dataset.copy;
            const dataToSave = { s: copyText, c: copyText, k: baseEmoji };
            addToRecent(RECENT_EMOJI_KEY, dataToSave);
            navigator.clipboard.writeText(copyText);
            
            const notification = document.getElementById('copy-notification');
            notification.classList.remove('opacity-0');
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
            
            closeAllPopups();
        });
        popup.appendChild(toneBtn);
    });

    document.getElementById('app-content-container').appendChild(popup);
    const btnRect = button.getBoundingClientRect();
    const containerRect = document.getElementById('app-content-container').getBoundingClientRect();
    
    popup.style.left = `${btnRect.left - containerRect.left}px`;
    popup.style.top = `${btnRect.top - containerRect.top - popup.offsetHeight - 5}px`;

    setTimeout(() => {
        document.addEventListener('click', closeAllPopups, { once: true });
    }, 0);
}


export function getHtml() {
    return `
        <style>
            .tab-btn { color: #6B7280; border-color: transparent; transition: all 0.2s ease-in-out; }
            .dark .tab-btn { color: #9CA3AF; }
            .tab-btn.active { color: white; background-color: #3B82F6; border-color: #3B82F6; border-radius: 0.5rem 0.5rem 0 0; }
            .dark .tab-btn.active { background-color: #60A5FA; color: #1F2937; border-color: #60A5FA; }
             .tab-btn:not(.active):hover { color: #1F2937; border-color: #D1D5DB; }
             .dark .tab-btn:not(.active):hover { color: #F9FAFB; border-color: #4B5563; }
        </style>
        <div class="space-y-4">
            <div id="copy-notification" class="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50">Скопировано!</div>
            <div class="relative">
                <input type="search" id="symbol-search" placeholder="Поиск..." class="w-full p-3 pl-10 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <div>
                <div class="flex border-b border-gray-300 dark:border-gray-600">
                    <button data-tab="symbols" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Символы</button>
                    <button data-tab="emojis" class="tab-btn py-2 px-4 font-semibold border-b-2">Эмодзи</button>
                </div>
            </div>
            <div class="flex flex-col md:flex-row gap-8">
                <nav id="categories-nav" class="w-full md:w-48 flex-shrink-0"></nav>
                <main id="content-area" class="flex-grow min-w-0"></main>
                <div id="search-results" class="hidden flex-grow min-w-0"></div>
            </div>
        </div>
    `;
}

function createItemButton(symbol, isEmoji) {
    const { d, s, c, t, k, tones } = symbol;
    const display = d || s;
    const copy = c || s;
    const btn = document.createElement('button');
    btn.className = d ? 'flex items-center justify-center h-12 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-sm' : 'flex items-center justify-center h-12 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-2xl';
    btn.textContent = display;
    btn.dataset.copy = copy;
    btn.dataset.keywords = `${display} ${k || ''}`.toLowerCase();
    if (t) btn.title = t;
    if (isEmoji && tones) {
        btn.dataset.tones = "true";
    }
    return btn;
}

function renderContent(container, data, isEmoji) {
    container.innerHTML = '';
    data.forEach(category => {
        if (category.name === 'Недавно использованные' && category.items.length === 0) return;
        const section = document.createElement('section');
        section.id = `category-${category.name.replace(/\s+/g, '-')}`;
        section.className = 'mb-6';
        section.innerHTML = `<h3 class="text-lg font-semibold mb-3 sticky top-0 bg-white dark:bg-gray-900 py-1">${category.name}</h3>`;
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 gap-2';
        category.items.forEach(item => {
            grid.appendChild(createItemButton(item, isEmoji));
        });
        section.appendChild(grid);
        container.appendChild(section);
    });
}

function renderNav(container, data) {
    container.innerHTML = `<ul class="space-y-2 sticky top-4"></ul>`;
    const ul = container.querySelector('ul');
    data.forEach(category => {
        if (category.name === 'Недавно использованные' && category.items.length === 0) return;
        const id = `category-${category.name.replace(/\s+/g, '-')}`;
        ul.innerHTML += `<li><a href="#${id}" class="block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">${category.name}</a></li>`;
    });
}

export async function init() {
    const contentArea = document.getElementById('content-area');
    const navArea = document.getElementById('categories-nav');
    const searchResultsArea = document.getElementById('search-results');
    const searchInput = document.getElementById('symbol-search');
    const notification = document.getElementById('copy-notification');
    const tabs = document.querySelectorAll('.tab-btn');
    
    let activeTab = 'symbols';
    const dataMap = { 
        symbols: JSON.parse(JSON.stringify(symbols)), 
        emojis: JSON.parse(JSON.stringify(emojis))
    };

    const updateRecentAndRender = async (tab) => {
        const key = tab === 'symbols' ? RECENT_SYMBOLS_KEY : RECENT_EMOJI_KEY;
        const recentItems = await getRecent(key);
        
        if (dataMap[tab] && dataMap[tab][0] && dataMap[tab][0].name === 'Недавно использованные') {
            dataMap[tab][0].items = recentItems;
        }
        
        const data = dataMap[tab];
        renderContent(contentArea, data, tab === 'emojis');
        renderNav(navArea, data);
        setupIntersectionObserver();
    };

    const handleSearch = () => {
        const term = searchInput.value.toLowerCase().trim();
        if (term) {
            navArea.classList.add('hidden');
            contentArea.classList.add('hidden');
            searchResultsArea.classList.remove('hidden');
            const source = activeTab === 'symbols' ? allSymbols : allEmojis;
            const results = source.filter(item => `${item.s} ${item.k || ''}`.toLowerCase().includes(term));
            searchResultsArea.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2';
            results.forEach(item => grid.appendChild(createItemButton(item, activeTab === 'emojis')));
            searchResultsArea.appendChild(grid);
        } else {
            navArea.classList.remove('hidden');
            contentArea.classList.remove('hidden');
            searchResultsArea.classList.add('hidden');
        }
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            updateRecentAndRender(activeTab);
            handleSearch();
        });
    });

    searchInput.addEventListener('input', handleSearch);
    
    navArea.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            const targetId = link.getAttribute('href');
            const targetSection = contentArea.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    document.getElementById('app-content-container').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-copy]');
        if (button) {
            if (button.dataset.tones) {
                showSkinTonePopup(button, button.dataset.copy);
                return;
            }

            const copyText = button.dataset.copy;
            const keywords = button.dataset.keywords;
            const isEmoji = activeTab === 'emojis';
            const dataToSave = { s: button.textContent, c: copyText, k: keywords, d: button.textContent !== copyText ? button.textContent : undefined };
            addToRecent(isEmoji ? RECENT_EMOJI_KEY : RECENT_SYMBOLS_KEY, dataToSave);
            navigator.clipboard.writeText(copyText);
            
            notification.classList.remove('opacity-0');
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => notification.classList.add('opacity-0'), 1000);
        }
    });

    function setupIntersectionObserver() {
        if (intersectionObserver) intersectionObserver.disconnect();
        const navLinks = navArea.querySelectorAll('a');
        const observerOptions = { rootMargin: '-50px 0px -50% 0px' };
        
        intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const navLink = navArea.querySelector(`a[href="#${id}"]`);
                if(navLink) {
                    if (entry.isIntersecting) {
                        navLinks.forEach(link => link.classList.remove('font-bold', 'bg-gray-200', 'dark:bg-gray-700'));
                        navLink.classList.add('font-bold', 'bg-gray-200', 'dark:bg-gray-700');
                    }
                }
            });
        }, observerOptions);

        contentArea.querySelectorAll('section').forEach(section => intersectionObserver.observe(section));
    }
    
    await updateRecentAndRender(activeTab);
}

export function cleanup() {
    if (timeoutId) clearTimeout(timeoutId);
    if (intersectionObserver) intersectionObserver.disconnect();
    document.removeEventListener('click', closeAllPopups);
}
