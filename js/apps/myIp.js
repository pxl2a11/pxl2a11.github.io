export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center">
            <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md text-center w-full max-w-md">
                <p class="text-lg mb-2 text-gray-600 dark:text-gray-400">Ваш IP-адрес:</p>
                <p id="ip-address" class="text-4xl font-bold mb-4 break-all">Загрузка...</p>
                <div class="flex justify-center gap-4 mb-6">
                    <button id="copy-ip-btn" class="bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600">Копировать</button>
                    <button id="refresh-ip-btn" class="bg-gray-500 text-white text-sm py-2 px-4 rounded-full hover:bg-gray-600">Обновить</button>
                </div>
                <div id="geo-info" class="text-left space-y-2 border-t border-gray-300 dark:border-gray-600 pt-4">
                    <p><strong>Провайдер:</strong> <span id="ip-isp">Загрузка...</span></p>
                    <p><strong>Страна:</strong> <span id="ip-country">Загрузка...</span></p>
                    <p><strong>Регион:</strong> <span id="ip-region">Загрузка...</span></p>
                    <p><strong>Город:</strong> <span id="ip-city">Загрузка...</span></p>
                </div>
            </div>
        </div>`;
}

export function init() {
    const ipEl = document.getElementById('ip-address');
    const copyBtn = document.getElementById('copy-ip-btn');
    const refreshBtn = document.getElementById('refresh-ip-btn');
    const countryEl = document.getElementById('ip-country');
    const regionEl = document.getElementById('ip-region');
    const cityEl = document.getElementById('ip-city');
    const ispEl = document.getElementById('ip-isp');

    const fetchIpInfo = () => {
        ipEl.textContent = 'Загрузка...';
        countryEl.textContent = 'Загрузка...';
        regionEl.textContent = 'Загрузка...';
        cityEl.textContent = 'Загрузка...';
        ispEl.textContent = 'Загрузка...';
        
        fetch('https://ipapi.co/json/')
            .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
            .then(data => {
                ipEl.textContent = data.ip || 'Не определен';
                countryEl.textContent = data.country_name || 'Не определена';
                regionEl.textContent = data.region || 'Не определен';
                cityEl.textContent = data.city || 'Не определен';
                ispEl.textContent = data.org || 'Не определен';
            })
            .catch(() => {
                ['ip-address', 'ip-country', 'ip-region', 'ip-city', 'ip-isp'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = 'Ошибка';
                });
            });
    };

    copyBtn.onclick = () => {
        const ipText = ipEl.textContent;
        if (ipText && !ipText.includes('...') && !ipText.includes('Ошибка')) {
            navigator.clipboard.writeText(ipText);
            copyBtn.textContent = 'Скопировано!';
            setTimeout(() => { copyBtn.textContent = 'Копировать'; }, 1500);
        }
    };

    refreshBtn.onclick = fetchIpInfo;
    fetchIpInfo();
}

export function cleanup() {}```

#### `js/apps/fortuneWheel.js`
```javascript
let spinTimeout;

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center">
            <canvas id="wheel-canvas" width="350" height="350" class="mb-4"></canvas>
            <div class="flex items-center justify-center gap-4 w-full max-w-sm mb-4">
                <button id="spin-btn" class="flex-grow bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 disabled:opacity-50">Крутить</button>
                <label class="flex items-center cursor-pointer whitespace-nowrap">
                    <input type="checkbox" id="elimination-mode-checkbox" class="h-4 w-4 rounded">
                    <span class="ml-2 text-sm">На выбывание</span>
                </label>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
                    <h4 class="text-center font-semibold text-sm mb-1">Варианты</h4>
                    <div id="options-list" class="space-y-1.5 pr-1"></div>
                    <div class="flex gap-2 pt-1">
                        <input id="option-input" type="text" placeholder="Добавить..." class="flex-grow p-1.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <button id="add-option-btn" class="bg-green-500 text-white px-3 rounded-lg hover:bg-green-600 text-lg font-bold">+</button>
                    </div>
                </div>
                <div class="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
                    <h4 class="text-center font-semibold text-sm mb-1">Сохраненные списки</h4>
                    <select id="saved-lists-select" class="w-full py-1.5 px-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="">-- Загрузить список --</option>
                    </select>
                    <div class="flex gap-2">
                        <input id="list-name-input" type="text" placeholder="Имя списка..." class="flex-grow p-1.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <button id="save-list-btn" class="bg-blue-500 text-white px-3 rounded-lg hover:bg-blue-600 text-sm">Сохр.</button>
                    </div>
                    <button id="delete-list-btn" class="w-full bg-red-500 text-white font-bold py-1.5 px-3 rounded-full hover:bg-red-600 text-sm">Удалить выбранный</button>
                </div>
            </div>
        </div>`;
}

export function init() {
    const canvas = document.getElementById('wheel-canvas'), spinBtn = document.getElementById('spin-btn'), optionInput = document.getElementById('option-input'), addBtn = document.getElementById('add-option-btn'), optionsListDiv = document.getElementById('options-list'), ctx = canvas.getContext('2d'), saveListBtn = document.getElementById('save-list-btn'), listNameInput = document.getElementById('list-name-input'), savedListsSelect = document.getElementById('saved-lists-select'), deleteListBtn = document.getElementById('delete-list-btn'), eliminationCheckbox = document.getElementById('elimination-mode-checkbox');
    let options = ['Приз 1', 'Сектор 2', 'Шанс', 'Попробуй еще'], colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'], startAngle = 0, arc, spinAngleStart, spinTime = 0, spinTimeTotal = 0;
    const getSavedLists = () => JSON.parse(localStorage.getItem('fortuneWheelLists')) || {};
    const populateSavedLists = () => { const lists = getSavedLists(); savedListsSelect.innerHTML = '<option value="">-- Загрузить список --</option>'; for (const name in lists) { savedListsSelect.innerHTML += `<option value="${name}">${name}</option>`; } };
    const saveCurrentList = () => { const name = listNameInput.value.trim(); if (!name || options.length === 0) return; const lists = getSavedLists(); lists[name] = options; localStorage.setItem('fortuneWheelLists', JSON.stringify(lists)); listNameInput.value = ''; populateSavedLists(); };
    const loadSelectedList = () => { const name = savedListsSelect.value; if (!name) return; const lists = getSavedLists(); if (lists[name]) { options = [...lists[name]]; updateOptionsUI(); } };
    const deleteSelectedList = () => { const name = savedListsSelect.value; if (!name) return; const lists = getSavedLists(); delete lists[name]; localStorage.setItem('fortuneWheelLists', JSON.stringify(lists)); populateSavedLists(); };
    function drawWheel() { arc = options.length > 0 ? Math.PI / (options.length / 2) : 0; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#4A5568' : '#E2E8F0'; ctx.lineWidth = 2; ctx.font = '14px Arial'; for (let i = 0; i < options.length; i++) { const angle = startAngle + i * arc; ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.arc(175, 175, 170, angle, angle + arc, false); ctx.arc(175, 175, 0, angle + arc, angle, true); ctx.fill(); ctx.save(); ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#FFF' : '#000'; ctx.translate(175 + Math.cos(angle + arc / 2) * 120, 175 + Math.sin(angle + arc / 2) * 120); ctx.rotate(angle + arc / 2 + Math.PI / 2); const text = options[i]; ctx.fillText(text, -ctx.measureText(text).width / 2, 0); ctx.restore(); } ctx.fillStyle = 'black'; ctx.beginPath(); ctx.moveTo(175 - 4, 175 - (170 + 15)); ctx.lineTo(175 + 4, 175 - (170 + 15)); ctx.lineTo(175 + 4, 175 - (170 - 5)); ctx.lineTo(175 - 4, 175 - (170 - 5)); ctx.fill(); }
    function rotateWheel() { spinTime += 30; if (spinTime >= spinTimeTotal) { stopRotateWheel(); return; } const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal); startAngle += (spinAngle * Math.PI / 180); drawWheel(); spinTimeout = setTimeout(rotateWheel, 30); }
    function stopRotateWheel() { clearTimeout(spinTimeout); const degrees = startAngle * 180 / Math.PI + 90; const arcd = arc * 180 / Math.PI; const index = Math.floor((360 - degrees % 360) / arcd); const winner = options[index]; ctx.save(); ctx.font = 'bold 30px Arial'; ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#FFF' : '#000'; ctx.fillText(winner, 175 - ctx.measureText(winner).width / 2, 175 + 10); ctx.restore(); if (eliminationCheckbox.checked && options.length > 1) { setTimeout(() => { options.splice(index, 1); updateOptionsUI(); }, 1500); } spinBtn.disabled = options.length < 2 && eliminationCheckbox.checked; }
    function easeOut(t, b, c, d) { const ts = (t /= d) * t; const tc = ts * t; return b + c * (tc + -3 * ts + 3 * t); }
    function updateOptionsUI() { optionsListDiv.innerHTML = ''; spinBtn.disabled = options.length < 2; options.forEach((opt, i) => { optionsListDiv.innerHTML += `<div class="flex items-center justify-between p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"><span>${opt}</span><button data-index="${i}" class="remove-option text-red-500 hover:text-red-700 font-bold">✖</button></div>`; }); drawWheel(); }
    addBtn.onclick = () => { if (optionInput.value.trim()) { options.push(optionInput.value.trim()); updateOptionsUI(); optionInput.value = ''; } };
    optionsListDiv.onclick = e => { if (e.target.classList.contains('remove-option')) { options.splice(e.target.dataset.index, 1); updateOptionsUI(); } };
    spinBtn.addEventListener("click", () => { spinBtn.disabled = true; spinAngleStart = Math.random() * 10 + 10; spinTime = 0; spinTimeTotal = Math.random() * 3 + 4 * 1000; rotateWheel(); });
    saveListBtn.addEventListener('click', saveCurrentList);
    savedListsSelect.addEventListener('change', loadSelectedList);
    deleteListBtn.addEventListener('click', deleteSelectedList);
    updateOptionsUI(); populateSavedLists();
}

export function cleanup() {
    if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
    }
}
