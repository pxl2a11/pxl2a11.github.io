// js/utils/appList.js

// Центральный список всех приложений, их иконок и описаний
const appList = [
    { name: 'Скорость интернета', module: 'speedTest', icon: '🚀', description: 'Проверьте скорость вашего интернет-соединения.' },
    { name: 'Радио', module: 'radio', icon: '📻', description: 'Слушайте популярные радиостанции онлайн.' },
    { name: 'Заметки и задачи', module: 'notesAndTasks', icon: '📝', description: 'Создавайте и управляйте своими заметками.' },
    { name: 'Тест звука и микрофона', module: 'soundAndMicTest', icon: '🎤', description: 'Проверьте работоспособность аудиоустройств.' },
    { name: 'Мой IP', module: 'myIp', icon: '🌐', description: 'Узнайте свой IP-адрес и геолокацию.' },
    { name: 'Генератор паролей', module: 'passwordGenerator', icon: '🔑', description: 'Создайте надежные и случайные пароли.' },
    { name: 'Калькулятор процентов', module: 'percentageCalculator', icon: '%', description: 'Быстрые и удобные расчеты с процентами.' },
    { name: 'Таймер', module: 'timer', icon: '⏲️', description: 'Установите таймер с обратным отсчетом.' },
    { name: 'Колесо фортуны', module: 'fortuneWheel', icon: '🎡', description: 'Принимайте решения случайным образом.' },
    { name: 'Шар предсказаний', module: 'magicBall', icon: '🎱', description: 'Получите ответ на волнующий вас вопрос.' },
    { name: 'Крестики-нолики', module: 'ticTacToe', icon: '👾', description: 'Классическая игра против друга или компьютера.' },
    { name: 'Сапер', module: 'minesweeper', icon: '💣', description: 'Найдите все мины на игровом поле.' },
    { name: 'Секундомер', module: 'stopwatch', icon: '⏱️', description: 'Измеряйте время с точностью до миллисекунд.' },
    { name: 'Случайный цвет', module: 'randomColor', icon: '🎨', description: 'Сгенерируйте случайный цвет и его палитры.' },
    { name: 'Генератор чисел', module: 'numberGenerator', icon: '🎲', description: 'Получите случайные числа в заданном диапазоне.' },
    { name: 'Генератор QR-кодов', module: 'qrCodeGenerator', icon: '📱', description: 'Создайте QR-код для текста, ссылок и другого.' },
    { name: 'Эмодзи и символы', module: 'emojiAndSymbols', icon: '😊', description: 'Копируйте эмодзи и специальные символы.' },
    { name: 'Конвертер величин', module: 'unitConverter', icon: '📏', description: 'Конвертируйте различные единицы измерения.' },
    { name: 'Калькулятор дат', module: 'dateCalculator', icon: '📅', description: 'Рассчитывайте разницу между датами.' },
    { name: 'Калькулятор ИМТ', module: 'bmiCalculator', icon: '🏃', description: 'Рассчитайте свой индекс массы тела.' },
    { name: 'История изменений', module: 'changelogPage', icon: '📜', description: 'Посмотрите последние обновления проекта.' },
];

/**
 * Генерирует объект сопоставления { 'Русское имя': 'moduleName' }
 */
export const appNameToModuleFile = appList.reduce((acc, app) => {
    acc[app.name] = app.module;
    return acc;
}, { 'Общее': null });

/**
 * Возвращает отсортированный список приложений.
 */
export function getAppList() {
    return [...appList].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}
