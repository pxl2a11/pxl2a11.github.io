// js/utils/changelog.js

import { appNameToModuleFile } from './appList.js';

// Эта функция теперь используется только для форматирования даты перед выводом
const getRussianDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(date.getUTCHours() + 3);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }).replace(' г.', '');
};

// Исходные данные с надежными ISO-датами для сортировки
const changelogRawData = [
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Калькулятор ИМТ', description: 'добавлены поля для ввода возраста и пола для более точного контекста.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Калькулятор ИМТ', description: 'добавлен расчет и отображение диапазона идеального веса.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Тест звука и микрофона', description: 'реализована возможность выбора конкретного микрофона и устройства вывода звука.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Мой IP', description: 'добавлена интерактивная карта для визуального отображения геолокации IP-адреса.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Калькулятор дат', description: 'добавлена опция учета официальных праздничных дней РФ при расчете рабочих дней.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Сапер', description: 'добавлена функция "аккорд": клик по открытой ячейке с цифрой для быстрого открытия соседних ячеек.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Генератор паролей', description: 'добавлен индикатор надежности, оценивающий сгенерированный пароль.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Секундомер', description: 'реализована функция экспорта (копирования) списка кругов.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Случайный цвет', description: 'теперь отображаются значения цвета в форматах RGB и HSL.' },
    { isoDate: '2025-08-08T14:00:00Z', appName: 'Случайный цвет', description: 'добавлена генерация комплементарной и аналоговой цветовых палитр.' },
    { isoDate: '2025-08-08T12:00:00Z', appName: 'Таймер и обратный отсчет', description: 'добавлено новое приложение для установки таймера со звуковым оповещением.' },
    { isoDate: '2025-08-08T12:00:00Z', appName: 'Калькулятор процентных соотношений', description: 'добавлено новое приложение для быстрых расчетов с процентами.' },
    { isoDate: '2025-08-08T10:00:00Z', appName: 'Конвертер величин', description: 'добавлены новые типы конвертации: площадь и скорость.' },
    { isoDate: '2025-08-08T10:00:00Z', appName: 'Шар предсказаний', description: 'добавлена возможность создавать и сохранять собственный список ответов.' },
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Калькулятор ИМТ', description: 'добавлен переключатель между метрической и имперской системами измерения.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Тест звука и микрофона', description: 'реализована функция записи и воспроизведения звука с микрофона.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Генератор чисел', description: 'добавлена возможность генерации нескольких чисел одновременно.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Калькулятор дат', description: 'реализован расчет рабочих (будних) дней между датами.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Генератор QR-кодов', description: 'добавлены шаблоны для Wi-Fi, Email, SMS и возможность кастомизации цвета QR-кода.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Колесо фортуны', description: 'добавлены звуковые эффекты и возможность выбора цветовой схемы.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Калькулятор ИМТ', description: 'добавлено новое приложение для расчета индекса массы тела.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Калькулятор дат', description: 'добавлено новое приложение для расчета разницы между датами и прибавления дней.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Эмодзи и символы', description: 'добавлено новое приложение для копирования эмодзи и специальных символов.'},
    { isoDate: '2025-08-07T00:00:00Z', appName: 'Конвертер величин', description: 'добавлено новое приложение-конвертер для различных единиц измерения.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Колесо фортуны', description: 'добавлен режим "на выбывание", в котором выпавший вариант удаляется из списка.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Радио', description: 'добавлена возможность выбора качества потока (Low, Medium, High).'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Радио', description: 'в список добавлены новые станции: Дорожное Радио, Relax FM и DFM.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Радио', description: 'добавлено поле для поиска и фильтрации станций по названию.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Колесо фортуны', description: 'реализована возможность сохранять, загружать и удалять списки вариантов.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Секундомер', description: 'добавлена функция "Круг" для фиксации промежуточных результатов.'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Крестики-нолики', description: 'добавлены уровни сложности для игры с компьютером: "Легкий" и "Сложный".'},
    { isoDate: '2025-08-06T00:00:00Z', appName: 'Мой IP', description: 'добавлено отображение интернет-провайдера (ISP).'},
    { isoDate: '2025-08-05T00:00:00Z', appName: 'Заметки и задачи', description: 'исправлена логика добавления и сохранения заметок.'},
    { isoDate: '2025-08-05T00:00:00Z', appName: 'Мой IP', description: 'добавлена кнопка "Обновить".'},
    { isoDate: '2025-08-05T00:00:00Z', appName: 'Мой IP', description: 'добавлено определение геолокации.'},
    { isoDate: '2025-08-05T00:00:00Z', appName: 'Сапер', description: 'добавлены уровни сложности, таймер и рестарт.'},
    { isoDate: '2025-08-05T00:00:00Z', appName: 'Крестики-нолики', description: 'добавлен режим игры с компьютером.'},
    { isoDate: '2025-08-04T00:00:00Z', appName: 'Общее', description: 'начальная версия проекта.'}
];

// Преобразуем исходные данные, добавляя отформатированную дату
const changelogData = changelogRawData.map(item => ({
    ...item,
    date: getRussianDate(item.isoDate)
}));

/**
 * Группирует отсортированный список записей по дате и приложению.
 * @param {Array} data - Массив записей истории.
 * @returns {Array} - Массив сгруппированных записей.
 */
function groupSortedData(data) {
    const grouped = {};
    data.forEach(entry => {
        const key = `${entry.date}-${entry.appName}`;
        if (!grouped[key]) {
            grouped[key] = { date: entry.date, appName: entry.appName, descriptions: [] };
        }
        grouped[key].descriptions.push(entry.description);
    });
    return Object.values(grouped);
}

/**
 * Получает отсортированные и сгруппированные данные для рендеринга.
 * @returns {Array}
 */
export function getChangelogData() {
    const sortedData = [...changelogData].sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
    return groupSortedData(sortedData);
}

/**
 * Рендерит блок истории изменений.
 * @param {string|null} appNameFilter - Фильтр по имени приложения.
 * @param {number|null} limit - Ограничение на количество записей.
 * @param {HTMLElement} targetEl - Целевой элемент для рендеринга.
 */
export function renderChangelog(appNameFilter = null, limit = null, targetEl) {
    if (!targetEl) return;

    const isMainChangelogBlock = targetEl.id === 'changelog-container';
    
    let allData = getChangelogData();
    if (appNameFilter) {
        allData = allData.filter(group => group.appName === appNameFilter);
    }

    let dataToRender = allData;
    let showMoreButtonNeeded = false;
    
    if (limit && allData.length > limit) {
        dataToRender = allData.slice(0, limit);
        showMoreButtonNeeded = true;
    }

    if (!isMainChangelogBlock && dataToRender.length === 0) {
        targetEl.innerHTML = '';
        return;
    }
    
    const entriesHtml = dataToRender.map(entry => {
        const moduleFile = appNameToModuleFile[entry.appName];
        const appHref = moduleFile ? `?app=${moduleFile}` : '#';

        const appNameLink = `<a href="${appHref}" data-app-name="${moduleFile}" class="changelog-link font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">${entry.appName}.</a>`;
        
        const capitalizedDescs = entry.descriptions.map(desc => desc.charAt(0).toUpperCase() + desc.slice(1));
        const descriptionsHtml = capitalizedDescs.length > 1 
            ? `<ul class="list-disc list-inside mt-1"
