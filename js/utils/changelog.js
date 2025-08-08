// js/utils/changelog.js

// --- Сопоставление имен приложений с файлами модулей (ОБНОВЛЕНО) ---
const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
    'Мой IP': 'myIp',
    'Генератор паролей': 'passwordGenerator',
    'Калькулятор процентных соотношений': 'percentageCalculator', // НОВОЕ
    'Таймер и обратный отсчет': 'timer', // НОВОЕ
    'Колесо фортуны': 'fortuneWheel',
    'Шар предсказаний': 'magicBall',
    'Крестики-нолики': 'ticTacToe',
    'Сапер': 'minesweeper',
    'Секундомер': 'stopwatch',
    'Случайный цвет': 'randomColor',
    'Генератор чисел': 'numberGenerator',
    'Генератор QR-кодов': 'qrCodeGenerator',
    'Эмодзи и символы': 'emojiAndSymbols',
    'Конвертер величин': 'unitConverter',
    'Калькулятор дат': 'dateCalculator',
    'Калькулятор ИМТ': 'bmiCalculator',
    'История изменений': 'changelogPage',
};

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

// --- Данные (ОБНОВЛЕНЫ) ---
const changelogData = [
    // Новые записи вверху
    { date: getRussianDate('2025-08-08T12:00:00Z'), appName: 'Таймер и обратный отсчет', description: 'добавлено новое приложение для установки таймера со звуковым оповещением.' },
    { date: getRussianDate('2025-08-08T12:00:00Z'), appName: 'Калькулятор процентных соотношений', description: 'добавлено новое приложение для быстрых расчетов с процентами.' },
    // Старые записи ниже
    { date: getRussianDate('2025-08-08T10:00:00Z'), appName: 'Конвертер величин', description: 'добавлены новые типы конвертации: площадь и скорость.' },
    { date: getRussianDate('2025-08-08T10:00:00Z'), appName: 'Шар предсказаний', description: 'добавлена возможность создавать и сохранять собственный список ответов.' },
    // ... и так далее все остальные ваши записи ...
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

// Функция renderChangelog остается без изменений
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
        const moduleFile = appNameToModuleFile[entry.appName];
        const appHref = moduleFile ? `?app=${moduleFile}` : '#';

        const appNameLink = `<a href="${appHref}" data-app-name="${entry.appName}" class="changelog-link font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">${entry.appName}.</a>`;
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
