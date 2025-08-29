// js/apps/mouseTester.js

export function getHtml() {
    return `
        <style>
            #mouse-test-area {
                touch-action: none; /* Отключает сенсорные жесты, чтобы не мешать тесту */
                position: relative;
                overflow: hidden;
            }
            .click-indicator {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(59, 130, 246, 0.7);
                transform: translate(-50%, -50%) scale(0);
                animation: click-animation 0.5s ease-out;
                pointer-events: none; /* Чтобы индикатор не перехватывал события мыши */
            }
            @keyframes click-animation {
                from { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        </style>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Основная область для теста -->
            <div id="mouse-test-area" class="lg:col-span-2 w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner flex justify-center items-center">
                <p class="text-gray-500 dark:text-gray-400 select-none">Перемещайте мышь здесь</p>
            </div>

            <!-- Панель с информацией -->
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-center">Информация</h3>
                
                <!-- Координаты -->
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">X</div>
                        <div id="mouse-x" class="text-2xl font-bold">0</div>
                    </div>
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Y</div>
                        <div id="mouse-y" class="text-2xl font-bold">0</div>
                    </div>
                </div>

                <!-- Кнопки мыши -->
                <div class="flex justify-around items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div id="btn-left" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">ЛКМ</div>
                    <div id="btn-middle" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">СКМ</div>
                    <div id="btn-right" class="mouse-button border-2 border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition-colors">ПКМ</div>
                </div>

                <!-- Прокрутка -->
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                     <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Прокрутка</div>
                     <div id="scroll-direction" class="text-lg font-bold h-6">-</div>
                </div>

                 <button id="reset-mouse-test" class="w-full mt-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Сброс</button>
            </div>
        </div>
    `;
}

let testArea, xEl, yEl, leftBtn, middleBtn, rightBtn, scrollDirEl;
let scrollTimeout;

function updateCoordinates(e) {
    const rect = testArea.getBoundingClientRect();
    xEl.textContent = Math.floor(e.clientX - rect.left);
    yEl.textContent = Math.floor(e.clientY - rect.top);
}

function handleMouseDown(e) {
    e.preventDefault();
    const buttonMap = { 0: leftBtn, 1: middleBtn, 2: rightBtn };
    if (buttonMap[e.button]) {
        buttonMap[e.button].classList.add('bg-blue-500', 'text-white', 'border-blue-500');
        buttonMap[e.button].classList.remove('dark:border-gray-600');
    }
    // Анимация клика
    const indicator = document.createElement('div');
    indicator.className = 'click-indicator';
    const rect = testArea.getBoundingClientRect();
    indicator.style.left = `${e.clientX - rect.left}px`;
    indicator.style.top = `${e.clientY - rect.top}px`;
    testArea.appendChild(indicator);
    setTimeout(() => indicator.remove(), 500);
}

function handleMouseUp(e) {
    const buttonMap = { 0: leftBtn, 1: middleBtn, 2: rightBtn };
    if (buttonMap[e.button]) {
        buttonMap[e.button].classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
        buttonMap[e.button].classList.add('dark:border-gray-600');
    }
}

function handleWheel(e) {
    if (e.deltaY < 0) {
        scrollDirEl.textContent = 'Вверх ▲';
    } else {
        scrollDirEl.textContent = 'Вниз ▼';
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollDirEl.textContent = '-';
    }, 1000);
}

function resetTest() {
    xEl.textContent = '0';
    yEl.textContent = '0';
    scrollDirEl.textContent = '-';
    [leftBtn, middleBtn, rightBtn].forEach(btn => {
         btn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
         btn.classList.add('dark:border-gray-600');
    });
    // Удаляем все индикаторы кликов, если они остались
    testArea.querySelectorAll('.click-indicator').forEach(el => el.remove());
}

export function init() {
    testArea = document.getElementById('mouse-test-area');
    xEl = document.getElementById('mouse-x');
    yEl = document.getElementById('mouse-y');
    leftBtn = document.getElementById('btn-left');
    middleBtn = document.getElementById('btn-middle');
    rightBtn = document.getElementById('btn-right');
    scrollDirEl = document.getElementById('scroll-direction');
    const resetBtn = document.getElementById('reset-mouse-test');

    testArea.addEventListener('mousemove', updateCoordinates);
    testArea.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp); // Слушаем на window, чтобы поймать отпускание кнопки вне области
    testArea.addEventListener('wheel', handleWheel);
    testArea.addEventListener('contextmenu', e => e.preventDefault()); // Отключаем контекстное меню
    resetBtn.addEventListener('click', resetTest);
}

export function cleanup() {
    // Удаляем все слушатели событий
    testArea.removeEventListener('mousemove', updateCoordinates);
    testArea.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    testArea.removeEventListener('wheel', handleWheel);
    testArea.removeEventListener('contextmenu', e => e.preventDefault());
    clearTimeout(scrollTimeout);
}
