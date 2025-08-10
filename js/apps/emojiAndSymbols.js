let timeoutId;
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
        <style>
            .tab-btn { color: #6B7280; border-color: transparent; transition: all 0.2s ease-in-out; }
            .dark .tab-btn { color: #9CA3AF; }
            .tab-btn.active { color: white; background-color: #3B82F6; border-color: #3B82F6; border-radius: 0.5rem 0.5rem 0 0; }
            .dark .tab-btn.active { background-color: #60A5FA; color: #1F2937; border-color: #60A5FA; }
             .tab-btn:not(.active):hover { color: #1F2937; border-color: #D1D5DB; }
             .dark .tab-btn:not(.active):hover { color: #F9FAFB; border-color: #4B5563; }
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
    const symbolsData = {
        'Недавно использованные': getRecent(RECENT_SYMBOLS_KEY),
        'Популярные': [{s:'✓',k:'галочка check'}, {s:'✗',k:'крестик x'}, {s:'★',k:'звезда star'}, {s:'☆',k:'звезда star'}, {s:'♥',k:'сердце heart love'}, {s:'₽',k:'рубль'}, {s:'€',k:'евро'}, {s:'$',k:'доллар'}, {s:'→',k:'стрелка вправо right arrow'}, {s:'←',k:'стрелка влево left arrow'}, {s:'©',k:'копирайт copyright'}, {s:'™',k:'тм trademark'}],
        'Валюты': [{s:'€',k:'евро euro'}, {s:'£',k:'фунт pound'}, {s:'¥',k:'йена yen'}, {s:'₽',k:'рубль ruble'}, {s:'₴',k:'гривна'}, {s:'$',k:'доллар dollar'}, {s:'¢',k:'цент cent'}, {s:'₩',k:'вон won'}, {s:'₪',k:'шекель shekel'}, {s:'₮',k:'тугрик'}, {s:'₹',k:'рупия rupee'}, {s:'₿',k:'биткоин bitcoin'}, {s:'₣',k:'франк franc'}, {s:'₤',k:'лира lira'}, {s:'₧',k:'песета'}],
        'Математические': [{s:'≈',k:'примерно'}, {s:'≠',k:'не равно'}, {s:'≤',k:'меньше или равно'}, {s:'≥',k:'больше или равно'}, {s:'÷',k:'деление'}, {s:'×',k:'умножение'}, {s:'−',k:'минус'}, {s:'+',k:'плюс'}, {s:'∞',k:'бесконечность'}, {s:'π',k:'пи'}, {s:'√',k:'корень'}, {s:'∫',k:'интеграл'}, {s:'∑',k:'сумма'}, {s:'∂',k:'дифференциал'}, {s:'∅',k:'пустое множество'}, {s:'±',k:'плюс-минус'}, {s:'°',k:'градус'}, {s:'¹',k:'1 степень'}, {s:'²',k:'2 степень'}, {s:'³',k:'3 степень'}, {s:'µ',k:'мю микро'}, {s:'∆',k:'дельта'}, {s:'¼',k:'одна четверть'}, {s:'½',k:'одна вторая'}, {s:'¾',k:'три четверти'}],
        'Стрелки': [{s:'←',k:'стрелка влево'}, {s:'↑',k:'стрелка вверх'}, {s:'→',k:'стрелка вправо'}, {s:'↓',k:'стрелка вниз'}, {s:'↔',k:'стрелка влево вправо'}, {s:'↕',k:'стрелка вверх вниз'}, {s:'↖',k:'стрелка вверх влево'}, {s:'↗',k:'стрелка вверх вправо'}, {s:'↘',k:'стрелка вниз вправо'}, {s:'↙',k:'стрелка вниз влево'}, {s:'⇦',k:'стрелка'}, {s:'⇧',k:'стрелка'}, {s:'⇨',k:'стрелка'}, {s:'⇩',k:'стрелка'}, {s:'➥',k:'стрелка'}, {s:'↶',k:'стрелка'}, {s:'↷',k:'стрелка'}],
        'Пунктуация и прочее': [{s:'©',k:'копирайт copyright'}, {s:'®',k:'зарегистрировано registered'}, {s:'™',k:'тм trademark'}, {s:'§',k:'параграф'}, {s:'•',k:'точка'}, {s:'…',k:'многоточие'}, {s:'–',k:'тире'}, {s:'—',k:'длинное тире'}, {s:'‘',k:'кавычка'}, {s:'’',k:'кавычка'}, {s:'“',k:'кавычка'}, {s:'”',k:'кавычка'}, {s:'„',k:'кавычка'}, {s:'«',k:'кавычка'}, {s:'»',k:'кавычка'}],
        'Фигуры и знаки': [{s:'★',k:'звезда star'}, {s:'☆',k:'звезда star'}, {s:'✓',k:'галочка check'}, {s:'✗',k:'крестик x'}, {s:'♥',k:'сердце heart'}, {s:'♦',k:'бубны'}, {s:'♣',k:'трефы'}, {s:'♠',k:'пики'}, {s:'♪',k:'нота'}, {s:'♫',k:'нота'}, {s:'●',k:'круг'}, {s:'○',k:'круг'}, {s:'■',k:'квадрат'}, {s:'□',k:'квадрат'}, {s:'▲',k:'треугольник'}, {s:'▼',k:'треугольник'}, {s:'◄',k:'треугольник'}, {s:'►',k:'треугольник'}, {s:'◉',k:'круг'}, {s:'◊',k:'ромб'}, {s:'◦',k:'круг'}],
        'Пробелы': [ {d: 'Пустой', c: '\u00A0', t: 'Неразрывный пробел', k: 'пустой неразрывный' }, {d: 'Узкий', c: '\u2009', t: 'Узкий неразрывный пробел', k: 'узкий тонкий' } ]
    };
    
    // ИСПРАВЛЕНИЕ: ПОЛНАЯ БАЗА ДАННЫХ КЛЮЧЕВЫХ СЛОВ ДЛЯ ВСЕХ ЭМОДЗИ
    const emojiKeywords = {'😀':'лицо улыбка happy smile face','😁':'улыбка зубы grin','😂':'смех слезы радость joy','🤣':'катаюсь по полу от смеха rofl','😃':'большая улыбка smiley','😄':'счастливый смех глаза smile','😅':'улыбка пот sweat','😆':'щурясь laughing','😉':'подмигивание wink','😊':'улыбка румянец blush','😋':'вкусно язык yum','😎':'крутой очки cool sunglasses','😍':'влюблен сердце глаза heart eyes','😘':'поцелуй kiss','🥰':'любовь сердечки smiling face with hearts','😗':'целую kissing','😙':'целую улыбка','😚':'целую глаза закрыты','🙂':'легкая улыбка','🤗':'объятия hugs','🤩':'звезды в глазах восторг star struck','🤔':'думаю размышление thinking','🤨':'бровь raised eyebrow','😐':'нейтральный neutral face','😑':'без выражения expressionless','😶':'нет рта no mouth','🙄':'закатываю глаза roll eyes','😏':'ухмылка smirk','😣':'страдание persevere','😥':'грустный пот sad but relieved','😮':'удивление рот открыт face with open mouth','🤐':'рот на замке zipper mouth','😯':'тихо hushed','😪':'сонный sleepy','😫':'усталый tired','😴':'сплю sleeping','😌':'облегчение relieved','😛':'язык stuck out tongue','😜':'язык подмигиваю wink tongue','😝':'язык щурюсь squinting tongue','🤤':'слюни drooling','😒':'недовольный unamused','😓':'удрученный пот sweat','😔':'задумчивый pensive','😕':'смущенный confused','🙃':'вверх ногами upside down','🤑':'деньги язык money mouth','😲':'изумление astonished','☹️':'хмурый frowning','🙁':'слегка хмурый','😖':'смятение confounded','😞':'разочарование disappointed','😟':'беспокойство worried','😤':'пар из носа злость triumph victory','😢':'плач cry','😭':'рыдание sob','😦':'хмурый рот открыт','😧':'страдание anguished','😨':'страх fearful','😩':'утомленный weary','🤯':'взрыв мозг шок exploding head','😬':'гримаса grimacing','😰':'тревога пот anxious sweat','😱':'крик ужас scream','🥵':'жарко красный hot face','🥶':'холодно синий cold face','😳':'румянец flushed','🤪':'дурачусь zany face','😵':'головокружение dizzy','😡':'надутый красный злой pouting enraged','😠':'злость angry','🤬':'ругань символы cursing','😷':'маска medical mask','🤒':'термометр больной','🤕':'бинт травма','🤢':'тошнота nauseated','🤮':'рвота vomiting','🤧':'чихание sneezing','😇':'ангел нимб angel','🤠':'ковбой cowboy','🥳':'праздник вечеринка partying','🥴':'пьяный woozy face','🥺':'умоляю pleading begging','🤡':'клоун clown','🤥':'вру нос lying face','🤫':'тише shushing face','🤭':'рука у рта хихикаю hand over mouth','🧐':'монокль face with monocle','🤓':'ботаник очки nerd','👋':'привет машу рукой wave','🤚':'поднятая рука','🖐️':'раскрытая ладонь','✋':'поднятая ладонь','🖖':'вулканский салют spock','👌':'ок okay','🤏':'щепотка','✌️':'победа мир victory peace','🤞':'скрещенные пальцы удача','🤟':'люблю тебя I love you','🤘':'коза rock','🤙':'позвони мне call me','👈':'палец влево','👉':'палец вправо','👆':'палец вверх','🖕':'средний палец','👇':'палец вниз','☝️':'указательный палец вверх','👍':'лайк палец вверх thumbs up','👎':'дизлайк палец вниз thumbs down','✊':'кулак raised fist','👊':'удар oncoming fist','🤛':'кулак влево','🤜':'кулак вправо','👏':'аплодисменты clapping','🙌':'поднятые руки praise','👐':'открытые ладони','🤲':'ладони вместе','🤝':'рукопожатие','🙏':'молитва спасибо folded hands please thank you','✍️':'пишу','💅':'маникюр','🤳':'селфи','💪':'сила мышцы bicep strong','🦾':'механическая рука','🦵':'нога','🦿':'механическая нога','🦶':'ступня','👂':'ухо','🦻':'слуховой аппарат','👃':'нос','🧠':'мозг brain','🫀':'сердце орган','🫁':'легкие','🦷':'зуб','🦴':'кость','👀':'глаза eyes','👁️':'глаз eye','👅':'язык tongue','👄':'губы рот mouth','👶':'младенец baby','🧒':'ребенок','👦':'мальчик boy','👧':'девочка girl','🧑':'человек adult','👱':'блондин','👨':'мужчина man','🧔':'борода','👩':'женщина woman','🧓':'пожилой человек','👴':'дедушка old man','👵':'бабушка old woman','🐶':'собака dog','🐱':'кошка cat','🐭':'мышь','🐹':'хомяк','🐰':'кролик rabbit bunny','🦊':'лиса fox','🐻':'медведь bear','🐼':'панда','🐨':'коала','🐯':'тигр','🦁':'лев','🐮':'корова','🐷':'свинья pig','🐸':'лягушка','🐵':'обезьяна monkey','🐔':'курица','🐧':'пингвин','🐦':'птица bird','🐤':'цыпленок','🦋':'бабочка','🐛':'гусеница','🐺':'волк','🐗':'кабан','🐴':'лошадь','🦓':'зебра','🦒':'жираф','🐘':'слон','🦏':'носорог','🐪':'верблюд','🐫':'двугорбый верблюд','🐿️':'белка','🦔':'еж','🐾':'следы лап','🌵':'кактус','🎄':'елка christmas tree','🌲':'хвойное дерево','🌳':'лиственное дерево','🌴':'пальма','🌱':'росток','🌿':'трава','☘️':'трилистник','🍀':'четырехлистник удача','🎍':'бамбук','🎋':'бамбук','🍃':'листья на ветру','🍂':'опавшие листья','🍁':'кленовый лист','🍄':'гриб','🐚':'ракушка','🌾':'рис','💐':'букет','🌷':'тюльпан','🌹':'роза','🥀':'увядший цветок','🌺':'гибискус','🌸':'цветок вишни сакура','🌼':'ромашка','🌻':'подсолнух','🌞':'солнце лицо','🌎':'америка','🌍':'европа африка','🌏':'азия австралия','🌕':'полнолуние','🌖':'убывающая луна','🌗':'последняя четверть луны','🌘':'убывающий полумесяц','🌑':'новолуние','🌒':'растущий полумесяц','🌓':'первая четверть луны','🌔':'растущая луна','🌙':'полумесяц','🌚':'новолуние лицо','🌛':'первая четверть луны лицо','🌜':'последняя четверть луны лицо','💫':'головокружение звезды','⭐':'звезда star','🌟':'светящаяся звезда','✨':'блестки магия sparkles','⚡':'молния','🔥':'огонь пламя fire','💥':'взрыв collision','☄️':'комета','☀️':'солнце','🌤️':'солнце за облаком','⛅':'облачно','🌥️':'солнце за большим облаком','🌦️':'солнце и дождь','🌈':'радуга rainbow','☁️':'облако','🌧️':'дождь','⛈️':'гроза','🌩️':'молния и облако','🌨️':'снег','🌬️':'ветер','💨':'рывок','🌪️':'торнадо','🌫️':'туман','🌊':'волна','💧':'капля','💦':'капли пота','☔':'зонт дождь','🍏':'зеленое яблоко','🍎':'красное яблоко','🍐':'груша','🍊':'апельсин мандарин','🍋':'лимон','🍌':'банан','🍉':'арбуз','🍇':'виноград','🍓':'клубника','🍈':'дыня','🍒':'вишня','🍑':'персик','🍍':'ананас','🥥':'кокос','🥝':'киви','🍅':'помидор','🍆':'баклажан','🥑':'авокадо','🥦':'брокколи','🥬':'салат','🥒':'огурец','🌶️':'острый перец','🌽':'кукуруза','🥕':'морковь','🧄':'чеснок','🧅':'лук','🥔':'картофель','🍠':'батат','🥐':'круассан','🥯':'бейгл','🍞':'хлеб','🥖':'багет','🥨':'крендель','🧀':'сыр','🥚':'яйцо','🍳':'яичница','🧈':'масло','🥞':'блины','🧇':'вафли','🥓':'бекон','🥩':'мясо стейк','🍗':'куриная ножка','🍖':'мясо на кости','🦴':'кость','🌭':'хот-дог','🍔':'бургер','🍟':'картофель фри','🍕':'пицца pizza','🥪':'сэндвич','🥙':'пита','🧆':'фалафель','🌮':'тако','🌯':'буррито','🥗':'салат','🥫':'консервы','🍝':'спагетти','🍜':'лапша','🍲':'суп','🍛':'карри','🍣':'суши','🍱':'бенто','🥟':'пельмень','🍤':'креветка','🍙':'рисовый шарик','🍚':'рис','🍘':'крекер','🍥':'нарутомаки','🥠':'печенье с предсказанием','🥮':'лунный пряник','🍢':'одэн','🍧':'бритый лед','🍨':'мороженое','🍦':'мороженое рожок','🥧':'пирог','🧁':'капкейк','🍰':'кусок торта','🎂':'торт день рождения birthday','🍮':'пудинг','🍭':'леденец','🍬':'конфета','🍫':'шоколад','🍿':'попкорн','🍩':'пончик','🍪':'печенье','🌰':'каштан','🥜':'арахис','🍯':'мед','🥛':'молоко','🍼':'бутылочка','☕':'кофе чай hot beverage','🍵':'чай','🧃':'сок','🥤':'напиток','🍶':'саке','🍺':'пиво','🍻':'кружки пива','🥂':'шампанское тост','🍷':'вино','🥃':'виски','🍸':'коктейль','🍹':'тропический напиток','🧉':'мате','🍾':'шампанское бутылка','🧊':'лед','🥄':'ложка','🍴':'вилка и нож','🍽️':'тарелка'};
    
    const emojiData = { 'Недавно использованные': getRecent(RECENT_EMOJI_KEY) };
    for(const category in emojiStrings) {
        emojiData[category] = emojiStrings[category].split(/(?:)/u).map(s => {
            return { s: s, k: emojiKeywords[s] || '' };
        });
    }
    
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
                    const key = isEmoji ? RECENT_EMOJI_KEY : RECENT_SYMBOLS_KEY;
                    addToRecent(key, dataToSave);
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
