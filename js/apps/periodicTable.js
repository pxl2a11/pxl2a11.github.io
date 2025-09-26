// js/apps/periodicTable.js

// Источник данных: https://github.com/Bowserinator/Periodic-Table-JSON
import { elements } from './periodicTableData.js';

let tableContainer, detailsContainer;

// Функция для сопоставления категорий с цветами Tailwind CSS
const categoryColors = {
    'diatomic nonmetal': 'bg-green-400 dark:bg-green-700',
    'noble gas': 'bg-purple-400 dark:bg-purple-800',
    'alkali metal': 'bg-red-400 dark:bg-red-800',
    'alkaline earth metal': 'bg-orange-400 dark:bg-orange-800',
    'metalloid': 'bg-yellow-400 dark:bg-yellow-700',
    'polyatomic nonmetal': 'bg-green-500 dark:bg-green-800',
    'post-transition metal': 'bg-blue-400 dark:bg-blue-800',
    'transition metal': 'bg-pink-400 dark:bg-pink-800',
    'lanthanide': 'bg-indigo-300 dark:bg-indigo-700',
    'actinide': 'bg-rose-300 dark:bg-rose-700',
    'unknown, probably transition metal': 'bg-gray-400 dark:bg-gray-600',
    'unknown, probably post-transition metal': 'bg-gray-400 dark:bg-gray-600',
    'unknown, probably metalloid': 'bg-gray-400 dark:bg-gray-600',
    'unknown, but predicted to be an alkali metal': 'bg-gray-400 dark:bg-gray-600',
    'unknown, predicted to be noble gas': 'bg-gray-400 dark:bg-gray-600'
};

function formatValue(value, unit = '') {
    if (value == null || value === 'N/A') {
        return '<span class="text-gray-500">N/A</span>';
    }
    return `${value}${unit}`;
}


function updateDetails(element) {
    if (!element) {
        detailsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <p class="text-xl font-semibold">Выберите элемент</p>
                <p>Нажмите на любой элемент в таблице, чтобы увидеть подробную информацию о нём.</p>
            </div>`;
        return;
    }

    const colorClass = categoryColors[element.category] || 'bg-gray-400 dark:bg-gray-600';

    detailsContainer.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 p-4">
            <div class="flex-shrink-0 w-full md:w-32 h-32 ${colorClass} rounded-lg flex flex-col justify-center items-center text-white p-2 shadow-lg">
                <div class="text-2xl font-bold">${element.number}</div>
                <div class="text-5xl font-extrabold">${element.symbol}</div>
            </div>
            <div class="flex-grow">
                <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-100">${element.name}</h3>
                <p class="capitalize text-gray-600 dark:text-gray-400">${element.category}</p>
                <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">${element.summary}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <div><strong>Атомная масса:</strong><br>${formatValue(element.atomic_mass, ' u')}</div>
            <div><strong>Плотность:</strong><br>${formatValue(element.density, ' г/см³')}</div>
            <div><strong>Темп. плавления:</strong><br>${formatValue(element.melt, ' K')}</div>
            <div><strong>Темп. кипения:</strong><br>${formatValue(element.boil, ' K')}</div>
            <div><strong>Электроны:</strong><br>${element.electron_configuration_semantic || 'N/A'}</div>
            <div><strong>Открыт:</strong><br>${element.discovered_by || 'N/A'} (${element.named_by || 'N/A'})</div>
        </div>
    `;
}

function handleTableClick(e) {
    const elementCell = e.target.closest('.element-cell');
    if (!elementCell) return;

    // Снимаем выделение со старого элемента
    const currentActive = tableContainer.querySelector('.active-element');
    if (currentActive) {
        currentActive.classList.remove('active-element', 'ring-2', 'ring-blue-500', 'dark:ring-blue-400', 'scale-110');
    }

    // Выделяем новый
    elementCell.classList.add('active-element', 'ring-2', 'ring-blue-500', 'dark:ring-blue-400', 'scale-110');
    
    const atomicNumber = parseInt(elementCell.dataset.number, 10);
    const element = elements.find(el => el.number === atomicNumber);
    updateDetails(element);
}

export function getHtml() {
    return `
        <style>
            #periodic-table-grid {
                display: grid;
                grid-template-columns: repeat(18, minmax(0, 1fr));
                gap: 4px;
                max-width: 1400px;
                margin: auto;
            }
            .element-cell {
                grid-column-start: var(--xpos);
                grid-row-start: var(--ypos);
                aspect-ratio: 1 / 1;
                transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            .element-cell:hover {
                transform: scale(1.1);
                z-index: 10;
            }
        </style>
        <div class="w-full flex flex-col gap-4">
             <div id="details-panel" class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner min-h-[200px]">
                <!-- Информация об элементе появится здесь -->
            </div>
            <div class="overflow-x-auto">
                <div id="periodic-table-grid">
                    <!-- Элементы будут сгенерированы здесь -->
                </div>
            </div>
            <div id="legend-panel" class="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
                <!-- Легенда будет сгенерирована здесь -->
            </div>
        </div>
    `;
}

export function init() {
    tableContainer = document.getElementById('periodic-table-grid');
    detailsContainer = document.getElementById('details-panel');
    const legendPanel = document.getElementById('legend-panel');

    elements.forEach(element => {
        const cell = document.createElement('div');
        const colorClass = categoryColors[element.category] || 'bg-gray-400 dark:bg-gray-600';
        cell.className = `element-cell ${colorClass} rounded-md p-1 flex flex-col justify-center items-center cursor-pointer text-white text-center shadow-md`;
        cell.style.setProperty('--xpos', element.xpos);
        cell.style.setProperty('--ypos', element.ypos);
        cell.dataset.number = element.number;

        cell.innerHTML = `
            <div class="text-xs font-medium self-start">${element.number}</div>
            <div class="text-lg sm:text-xl font-bold leading-none">${element.symbol}</div>
            <div class="text-[8px] sm:text-[10px] truncate w-full leading-tight">${element.name}</div>
        `;

        tableContainer.appendChild(cell);
    });
    
    // Генерируем легенду
    const legendItems = Object.entries(categoryColors)
     .filter(([category, _]) => !category.startsWith('unknown')) // Исключаем "неизвестные" типы
     .reduce((acc, [category, colorClass]) => { // Убираем дубликаты цветов
         if (!Object.values(acc).includes(colorClass)) {
             acc[category] = colorClass;
         }
         return acc;
     }, {});

    for (const [category, colorClass] of Object.entries(legendItems)) {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        legendItem.innerHTML = `
            <div class="w-3 h-3 rounded-sm ${colorClass}"></div>
            <span class="capitalize text-gray-700 dark:text-gray-300">${category.replace(/-/g, ' ')}</span>
        `;
        legendPanel.appendChild(legendItem);
    }
    
    tableContainer.addEventListener('click', handleTableClick);
    updateDetails(null); // Показать начальное сообщение
}

export function cleanup() {
    if (tableContainer) {
        tableContainer.removeEventListener('click', handleTableClick);
    }
    tableContainer = null;
    detailsContainer = null;
}
