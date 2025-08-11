// 56js/utils/changelog.js

export const appNameToModuleFile = {
    'Скорость интернета': 'speedTest',
    'Радио': 'radio',
    'Заметки и задачи': 'notesAndTasks',
    'Тест звука и микрофона': 'soundAndMicTest',
    'Мой IP': 'myIp',
    'Генератор паролей': 'passwordGenerator',
    'Калькулятор процентных соотношений': 'percentageCalculator',
    'Таймер': 'timer',
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
    'Сжатие аудио': 'audioCompressor',
    'Счетчик слов и символов': 'wordCounter',
    'Сканер QR-кодов': 'qrScanner',
    'Пианино': 'piano',
    'История изменений': 'changelogPage',
    'Конвертер регистра': 'caseConverter',
    'Конвертер форматов изображений': 'imageConverter',
    'Конвертер цветов': 'colorConverter',
    'Игра на память': 'memoryGame',
    'Общее': null, 
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

const changelogData = [
    { date: getRussianDate('2025-08-14T11:00:00Z'), appName: 'Эмодзи и символы', description: 'обновлен и расширен набор эмодзи в стиле Google. Убраны символы, плохо отображающиеся на некоторых устройствах.' },
    { date: getRussianDate('2025-08-13T10:00:00Z'), appName: 'Эмодзи и символы', description: 'приложение полностью переписано с нуля с новым двухколоночным интерфейсом, плавной прокруткой и интеллектуальной навигацией по категориям.' },
    { date: getRussianDate('2025-08-13T10:00:00Z'), appName: 'Эмодзи и символы', description: 'реализован полноценный поиск по ключевым словам для каждого символа и эмодзи.' },
    { date: getRussianDate('2025-08-12T09:00:00Z'), appName: 'Общее', description: 'исправлена ошибка, из-за которой поиск по приложениям не работал после применения фильтров.' },
    { date: getRussianDate('2025-08-12T09:00:00Z'), appName: 'Калькулятор дат', description: 'исправлена ошибка отображения текста в полях ввода дат в тёмной теме.' },
    { date: getRussianDate('2025-08-12T09:00:00Z'), appName: 'Генератор чисел', description: 'убраны стандартные стрелки для полей ввода чисел для более чистого вида.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Эмодзи и символы', description: 'добавлена вкладка "Недавно использованные" для быстрого доступа к скопированным символам.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Калькулятор процентных соотношений', description: 'добавлен калькулятор для расчета процентного изменения между двумя числами.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Случайный цвет', description: 'добавлена история последних 5 сгенерированных цветов с возможностью вернуться к ним.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Таймер', description: 'приложение переименовано из "Таймер и обратный отсчет" в "Таймер".' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Таймер', description: 'добавлены кнопки быстрых пресетов для установки таймера на 1, 5, 10 и 15 минут.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Калькулятор дат', description: 'добавлен калькулятор для точного расчета возраста по дате рождения.' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Генератор паролей', description: 'добавлена опция для исключения похожих символов (I, l, 1, O, 0).' },
    { date: getRussianDate('2025-08-11T14:00:00Z'), appName: 'Генератор чисел', description: 'добавлена опция для генерации только уникальных чисел в заданном диапазоне.' },
    { date: getRussianDate('2025-08-10T12:00:00Z'), appName: 'Конвертер регистра', description: 'добавлено новое приложение для быстрого преобразования текста в разные регистры.' },
    { date: getRussianDate('2025-08-10T12:00:00Z'), appName: 'Конвертер форматов изображений', description: 'добавлено новое приложение для конвертации изображений между форматами PNG, JPG и WebP.' },
    { date: getRussianDate('2025-08-10T12:00:00Z'), appName: 'Конвертер цветов', description: 'добавлено новое приложение для преобразования цветов между HEX, RGB и HSL.' },
    { date: getRussianDate('2025-08-10T12:00:00Z'), appName: 'Игра на память', description: 'добавлена новая игра для тренировки памяти с поиском парных карточек.' },
    { date: getRussianDate('2025-08-09T10:00:00Z'), appName: 'Пианино', description: 'добавлено новое приложение-пианино для игры с помощью мыши и клавиатуры.' },
    { date: getRussianDate('2025-08-09T10:00:00Z'), appName: 'Сканер QR-кодов', description: 'добавлено новое приложение для сканирования QR-кодов с помощью камеры.' },
    { date: getRussianDate('2025-08-09T10:00:00Z'), appName: 'Счетчик слов и символов', description: 'добавлено новое приложение для подсчета статистики текста.' },
    { date: getRussianDate('2025-08-08T15:00:00Z'), appName: 'Сжатие аудио', description: 'добавлено новое приложение для сжатия аудио-файлов.' },
    { date: getRussianDate('2025-08-04T00:00:00Z'), appName: 'Общее', description: 'начальная версия проекта.' }
];

function groupChangelogData(data) {
    const grouped = {};
    data.forEach(entry => {
        if (!entry || !entry.date || !entry.appName) return;
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
        const moduleFile = appNameToModuleFile[entry.appName];
        const appHref = moduleFile ? `?app=${moduleFile}` : '#';

        const appNameLink = `<a href="${appHref}" data-app-name="${entry.appName}" class="changelog-link font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">${entry.appName}.</a>`;
        const capitalizedDescs = entry.descriptions.map(desc => desc.charAt(0).toUpperCase() + desc.slice(1));
        
        const descriptionsHtml = `<ul class="list-disc list-inside mt-1">${capitalizedDescs.map(d => `<li class="ml-4">${d}</li>`).join('')}</ul>`;
        
        const contentHtml = isMainChangelog 
            ? (entry.appName === 'Общее' ? descriptionsHtml : `${appNameLink} ${descriptionsHtml}`)
            : descriptionsHtml;

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
        if (limit && changelogData.length > limit) {
            finalHtml += `<div class="text-center mt-6"><button id="show-all-changelog-btn" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors">Показать всё</button></div>`;
        }
    } else {
        finalHtml = `<div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-inner"><h3 class="text-xl font-bold text-center mb-4">История изменений</h3>${entriesHtml}</div>`;
    }
    
    targetEl.innerHTML = finalHtml;
}
