// js/apps/periodicTable.js

// js/apps/periodicTable.js

// --- Данные элементов таблицы Менделеева ---
const elements = [
    { "name": "Водород", "symbol": "H", "number": 1, "atomic_mass": 1.008, "category": "diatomic-nonmetal", "xpos": 1, "ypos": 1, "electron_configuration": "1s¹", "summary": "Самый лёгкий и распространённый элемент во Вселенной. Играет ключевую роль в звёздах и воде." },
    { "name": "Гелий", "symbol": "He", "number": 2, "atomic_mass": 4.002602, "category": "noble-gas", "xpos": 18, "ypos": 1, "electron_configuration": "1s²", "summary": "Инертный газ, второй по распространённости во Вселенной. Используется в воздушных шарах и криогенике." },
    { "name": "Литий", "symbol": "Li", "number": 3, "atomic_mass": 6.94, "category": "alkali-metal", "xpos": 1, "ypos": 2, "electron_configuration": "[He] 2s¹", "summary": "Лёгкий, мягкий, серебристо-белый щелочной металл. Широко используется в аккумуляторах." },
    { "name": "Бериллий", "symbol": "Be", "number": 4, "atomic_mass": 9.0121831, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 2, "electron_configuration": "[He] 2s²", "summary": "Лёгкий, но прочный щелочноземельный металл. Применяется в аэрокосмической промышленности и рентгеновской технике." },
    { "name": "Бор", "symbol": "B", "number": 5, "atomic_mass": 10.81, "category": "metalloid", "xpos": 13, "ypos": 2, "electron_configuration": "[He] 2s² 2p¹", "summary": "Полуметалл, существующий во множестве аллотропных модификаций. Используется в полупроводниках и как компонент боросиликатного стекла." },
    { "name": "Углерод", "symbol": "C", "number": 6, "atomic_mass": 12.011, "category": "polyatomic-nonmetal", "xpos": 14, "ypos": 2, "electron_configuration": "[He] 2s² 2p²", "summary": "Основа всей органической жизни на Земле. Существует в формах алмаза, графита и графена." },
    { "name": "Азот", "symbol": "N", "number": 7, "atomic_mass": 14.007, "category": "diatomic-nonmetal", "xpos": 15, "ypos": 2, "electron_configuration": "[He] 2s² 2p³", "summary": "Основной компонент земной атмосферы (около 78%). Важен для всех живых организмов." },
    { "name": "Кислород", "symbol": "O", "number": 8, "atomic_mass": 15.999, "category": "diatomic-nonmetal", "xpos": 16, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁴", "summary": "Высокореактивный неметалл, необходимый для дыхания большинства живых организмов." },
    { "name": "Фтор", "symbol": "F", "number": 9, "atomic_mass": 18.998403163, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁵", "summary": "Самый электроотрицательный и химически активный элемент. Галоген, используется в производстве тефлона." },
    { "name": "Неон", "symbol": "Ne", "number": 10, "atomic_mass": 20.1797, "category": "noble-gas", "xpos": 18, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁶", "summary": "Инертный газ, известный своим ярким красно-оранжевым свечением в газоразрядных лампах." },
    { "name": "Натрий", "symbol": "Na", "number": 11, "atomic_mass": 22.98976928, "category": "alkali-metal", "xpos": 1, "ypos": 3, "electron_configuration": "[Ne] 3s¹", "summary": "Мягкий, серебристо-белый щелочной металл. Важен для функционирования нервной системы." },
    { "name": "Магний", "symbol": "Mg", "number": 12, "atomic_mass": 24.305, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 3, "electron_configuration": "[Ne] 3s²", "summary": "Лёгкий и прочный щелочноземельный металл. Используется в сплавах и важен для фотосинтеза (входит в состав хлорофилла)." },
    { "name": "Алюминий", "symbol": "Al", "number": 13, "atomic_mass": 26.9815385, "category": "post-transition-metal", "xpos": 13, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p¹", "summary": "Лёгкий, устойчивый к коррозии металл. Широко используется в авиации, строительстве и производстве упаковки." },
    { "name": "Кремний", "symbol": "Si", "number": 14, "atomic_mass": 28.085, "category": "metalloid", "xpos": 14, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p²", "summary": "Полуметалл, основа современной электроники и полупроводниковой промышленности." },
    { "name": "Фосфор", "symbol": "P", "number": 15, "atomic_mass": 30.973762, "category": "polyatomic-nonmetal", "xpos": 15, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p³", "summary": "Высокореактивный неметалл, ключевой элемент в ДНК, РНК и АТФ. Используется в удобрениях и спичках." },
    { "name": "Сера", "symbol": "S", "number": 16, "atomic_mass": 32.06, "category": "polyatomic-nonmetal", "xpos": 16, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁴", "summary": "Неметалл, известный своим характерным запахом в соединениях. Используется в производстве серной кислоты и вулканизации резины." },
    { "name": "Хлор", "symbol": "Cl", "number": 17, "atomic_mass": 35.45, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁵", "summary": "Реактивный галоген. Применяется для дезинфекции воды и как отбеливатель." },
    { "name": "Аргон", "symbol": "Ar", "number": 18, "atomic_mass": 39.948, "category": "noble-gas", "xpos": 18, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁶", "summary": "Инертный газ, третий по содержанию в атмосфере Земли. Используется в сварке и лампах накаливания." },
    // И так далее для всех 118 элементов... Для краткости, здесь будут только первые 18.
    // В реальном приложении здесь будет полный список.
];

// --- Карта категорий для стилизации и названий ---
const categoryMap = {
    'diatomic-nonmetal': { name: 'Неметалл', class: 'bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200' },
    'noble-gas': { name: 'Инертный газ', class: 'bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200' },
    'alkali-metal': { name: 'Щелочной металл', class: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200' },
    'alkaline-earth-metal': { name: 'Щелочноземельный металл', class: 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200' },
    'metalloid': { name: 'Полуметалл', class: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200' },
    'polyatomic-nonmetal': { name: 'Неметалл', class: 'bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200' },
    'post-transition-metal': { name: 'Постпереходный металл', class: 'bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200' },
    'transition-metal': { name: 'Переходный металл', class: 'bg-sky-200 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200' },
    'lanthanide': { name: 'Лантаноид', class: 'bg-teal-200 text-teal-900 dark:bg-teal-900/50 dark:text-teal-200' },
    'actinide': { name: 'Актиноид', class: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200' },
    'unknown': { name: 'Неизвестно', class: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100' }
};

// --- Основные функции модуля ---

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    const elementCells = elements.map(el => `
        <div class="pt-element-cell flex flex-col justify-center items-center p-1 rounded cursor-pointer transition-transform hover:scale-110 hover:z-10 ${categoryMap[el.category]?.class || categoryMap.unknown.class}" 
             style="grid-column: ${el.xpos}; grid-row: ${el.ypos};" 
             data-number="${el.number}">
            <div class="text-xs">${el.number}</div>
            <div class="text-lg font-bold">${el.symbol}</div>
            <div class="text-xs truncate">${el.name}</div>
        </div>
    `).join('');

    return `
        <style>
            #pt-table { grid-template-rows: repeat(7, minmax(0, 1fr)); }
            .pt-element-cell { aspect-ratio: 1/1; }
        </style>
        <div class="flex flex-col xl:flex-row gap-4">
            <!-- Таблица -->
            <div id="pt-table" class="grid grid-cols-18 gap-1 w-full flex-grow">
                ${elementCells}
            </div>
            
            <!-- Панель информации -->
            <div id="pt-detail-panel" class="w-full xl:w-80 flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                <div id="pt-detail-content" class="text-center space-y-3 sticky top-4">
                    <!-- Содержимое будет вставлено JavaScript -->
                    <p class="text-gray-500 dark:text-gray-400 pt-16">Выберите элемент, чтобы увидеть информацию о нём.</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Инициализирует логику приложения.
 */
export function init() {
    const table = document.getElementById('pt-table');
    const detailContent = document.getElementById('pt-detail-content');
    let activeCell = null;

    function updateDetailView(element) {
        const categoryInfo = categoryMap[element.category] || categoryMap.unknown;
        detailContent.innerHTML = `
            <div class="pt-element-cell-large text-5xl font-bold w-32 h-32 mx-auto flex flex-col justify-center items-center rounded-lg ${categoryInfo.class}">
                <span>${element.symbol}</span>
                <span class="text-sm font-normal">${element.number}</span>
            </div>
            <h2 class="text-2xl font-bold">${element.name}</h2>
            <div class="text-left space-y-2 text-sm pt-2">
                <p><strong>Категория:</strong> ${categoryInfo.name}</p>
                <p><strong>Атомная масса:</strong> ${element.atomic_mass} u</p>
                <p><strong>Электронная конфигурация:</strong> ${element.electron_configuration}</p>
                <p class="pt-2">${element.summary}</p>
            </div>
        `;
    }

    table.addEventListener('click', (e) => {
        const cell = e.target.closest('.pt-element-cell');
        if (!cell) return;

        if (activeCell) {
            activeCell.classList.remove('ring-2', 'ring-blue-500', 'z-20', 'scale-110');
        }
        activeCell = cell;
        activeCell.classList.add('ring-2', 'ring-blue-500', 'z-20', 'scale-110');

        const elementNumber = parseInt(cell.dataset.number, 10);
        const elementData = elements.find(el => el.number === elementNumber);

        if (elementData) {
            updateDetailView(elementData);
        }
    });
}

/**
 * Очищает ресурсы при выходе из приложения.
 */
export function cleanup() {
    // В данном приложении нет таймеров или глобальных слушателей,
    // поэтому специальная очистка не требуется.
}
