const getRussianDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(date.getUTCHours() + 3); // Смещение на UTC+3 (Московское время)
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Используем UTC, т.к. сместили время
    }).replace(' г.', '');
};

const changelogData = [
    { date: getRussianDate('2025-08-08T00:00:00Z'), appName: 'Калькулятор ИМТ', description: 'добавлено новое приложение для расчета индекса массы тела.' },
    { date: getRussianDate('2025-08-08T00:00:00Z'), appName: 'Калькулятор дат', description: 'добавлено новое приложение для вычисления разницы между датами и прибавления/вычитания дней.' },
    { date: getRussianDate('2025-08-08T00:00:00Z'), appName: 'Эмодзи и символы', description: 'добавлено новое приложение для копирования эмодзи и специальных символов.' },
    { date: getRussianDate('2025-08-08T00:00:00Z'), appName: 'Конвертер величин', description: 'добавлено новое приложение-конвертер для различных единиц измерения.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Колесо фортуны', description: 'добавлен режим "на выбывание", в котором выпавший вариант удаляется из списка.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Радио', description: 'добавлена возможность выбора качества потока (Low, Medium, High).' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Радио', description: 'в список добавлены новые станции: Дорожное Радио, Relax FM и DFM.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Радио', description: 'добавлено поле для поиска и фильтрации станций по названию.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Колесо фортуны', description: 'реализована возможность сохранять, загружать и удалять списки вариантов.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Секундомер', description: 'добавлена функция "Круг" для фиксации промежуточных результатов.' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Крестики-нолики', description: 'добавлены уровни сложности для игры с компьютером: "Легкий" и "Сложный".' },
    { date: getRussianDate('2025-08-07T00:00:00Z'), appName: 'Мой IP', description: 'добавлено отображение интернет-провайдера (ISP).' },
    { date: getRussianDate('2025-08-06T00:00:00Z'), appName: 'Заметки и задачи', description: 'исправлена логика добавления и сохранения заметок, теперь они добавляются в список, а не заменяют друг друга.' },
    { date: getRussianDate('2025-08-06T00:00:00Z'), appName: 'Мой IP', description: 'добавлена кнопка "Обновить", позволяющая перезапросить IP-адрес и геолокационные данные без перезагрузки страницы.' },
    { date: getRussianDate('2025-08-06T00:00:00Z'), appName: 'Мой IP', description: 'теперь приложение будет определять и показывать страну, регион и город пользователя, используя данные геолокации.' },
    { date: getRussianDate('2025-08-06T00:00:00Z'), appName: 'Сапер', description: 'добавлены уровни сложности, таймер и кнопка для рестарта игры.' },
    { date: getRussianDate('2025-08-06T00:00:00Z'), appName: 'Крестики-нолики', description: 'добавлен режим игры с компьютером (простой AI) и возможность сменить режим или начать заново.' },
    { date: getRussianDate('2025-08-05T00:00:00Z'), appName: 'Общее', description: 'начальная версия проекта.' }
];

function groupChangelogData(data) {
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

export function getChangelogData() {
    return groupChangelogData(changelogData);
}

export function renderChangelog(appNameFilter = null, limit = null, targetEl) {
    if (!targetEl) return;

    const isMainChangelog = targetEl.id === 'changelog-container';
    const filteredData = appNameFilter ? changelogData.filter(entry => entry.appName === appNameFilter) : changelogData;

    let dataToRender = groupChangelogData(filteredData);
    
    if (limit && dataToRender.length > limit) {
        dataToRender = dataToRender.slice(0, limit);
    }

    if (!isMainChangelog && dataToRender.length === 0) {
        targetEl.innerHTML = '';
        return;
    }
    
    const entriesHtml = dataToRender.map(entry => {
        const appNameLink = `<a href="#" data-app-name="${entry.appName}" class="changelog-link font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">${entry.appName}.</a>`;
        const capitalizedDescs = entry.descriptions.map(desc => desc.charAt(0).toUpperCase() + desc.slice(1));
        const descriptionsHtml = capitalizedDescs.length > 1 
            ? `<ul class="list-disc list-inside mt-1">${capitalizedDescs.map(d => `<li class="ml-4">${d}</li>`).join('')}</ul>`
            : `<span class="ml-1">${capitalizedDescs[0]}</span>`;
        
        const contentHtml = isMainChangelog 
            ? (entry.appName === 'Общее' ? descriptionsHtml.replace('<span class="ml-1">', '<span>') : `${appNameLink} ${descriptionsHtml}`)
            : descriptionsHtml.replace('<span class="ml-1">', '<span>');

        return `
            <div class="border-t border-gray-300 dark:border-gray-700 pt-4 mt-4 first:mt-0 first:pt-0 first:border-0">
                <p class="font-semibold text-gray-500 dark:text-gray-400">${entry.date}</p>
                <div class="mt-2 text-gray-800 dark:text-gray-300">${contentHtml}</div>
            </div>
        `;
    }).join('');

    let finalHtml = '';
    if (isMainChangelog) {
        finalHtml = `<h2 class="text-2xl font-bold text-center mb-4">История изменений</h2>`;
        finalHtml += dataToRender.length === 0 ? '<p class="text-center text-gray-500 dark:text-gray-400">Нет записей.</p>' : entriesHtml;
        if (limit && groupChangelogData(changelogData).length > limit) {
            finalHtml += `<div class="text-center mt-6"><button id="show-all-changelog-btn" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors">Показать всё</button></div>`;
        }
    } else {
        finalHtml = `<div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-inner"><h3 class="text-xl font-bold text-center mb-4">История изменений</h3>${entriesHtml}</div>`;
    }
    
    targetEl.innerHTML = finalHtml;
}
