// apps/dateCalculator.js

function getHtml() {
    const today = new Date().toISOString().split('T')[0]; // Получаем сегодняшнюю дату в формате YYYY-MM-DD

    return `
        <div class="space-y-8">
            <!-- Разница между датами -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Разница между датами</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Начальная дата</label>
                        <input type="date" id="startDate" value="${today}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                    <div>
                        <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Конечная дата</label>
                        <input type="date" id="endDate" value="${today}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                </div>
                <div id="date-diff-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[50px]"></div>
            </div>
            
            <!-- Расчет рабочих дней -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Расчет рабочих дней</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label for="workStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Начальная дата</label>
                        <input type="date" id="workStartDate" value="${today}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                    <div>
                        <label for="workEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Конечная дата</label>
                        <input type="date" id="workEndDate" value="${today}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                </div>
                <div id="work-days-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[50px]"></div>
            </div>

            <!-- Прибавить / вычесть дни -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Прибавить или вычесть дни</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label for="calcDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Исходная дата</label>
                        <input type="date" id="calcDate" value="${today}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                    <div>
                        <label for="days" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Дни (+/-)</label>
                        <input type="number" id="days" value="10" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-2">
                    </div>
                    <button id="calculate-days-btn" class="w-full md:w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors h-10">Рассчитать</button>
                </div>
                <div id="date-calc-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[50px]"></div>
            </div>
        </div>
    `;
}

function init() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateDiffResultEl = document.getElementById('date-diff-result');

    const workStartDateInput = document.getElementById('workStartDate');
    const workEndDateInput = document.getElementById('workEndDate');
    const workDaysResultEl = document.getElementById('work-days-result');

    const calcDateInput = document.getElementById('calcDate');
    const daysInput = document.getElementById('days');
    const calculateDaysBtn = document.getElementById('calculate-days-btn');
    const dateCalcResultEl = document.getElementById('date-calc-result');

    function calculateDateDifference() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (isNaN(startDate) || isNaN(endDate)) {
            dateDiffResultEl.textContent = 'Выберите корректные даты.';
            return;
        }

        if (endDate < startDate) {
            dateDiffResultEl.textContent = 'Конечная дата не может быть раньше начальной.';
            return;
        }

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();

        if (days < 0) {
            months--;
            const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
            days += prevMonthLastDay;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        let result = [];
        if(years > 0) result.push(`${years} г.`);
        if(months > 0) result.push(`${months} мес.`);
        if(days > 0) result.push(`${days} д.`);
        
        const totalResult = result.length > 0 ? result.join(' ') : 'Даты совпадают';

        dateDiffResultEl.innerHTML = `
            <div>${totalResult}</div>
            <div class="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">(Всего: ${diffDays} дней)</div>
        `;
    }

    function calculateWorkDays() {
        const startDate = new Date(workStartDateInput.value);
        const endDate = new Date(workEndDateInput.value);
        
        if (isNaN(startDate) || isNaN(endDate)) {
            workDaysResultEl.textContent = 'Выберите корректные даты.';
            return;
        }

        if (endDate < startDate) {
            workDaysResultEl.textContent = 'Конечная дата не может быть раньше начальной.';
            return;
        }
        
        let count = 0;
        const curDate = new Date(startDate.getTime());
        
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        workDaysResultEl.textContent = `${count} рабочих дней`;
    }

    function calculateNewDate() {
        const baseDate = new Date(calcDateInput.value);
        const days = parseInt(daysInput.value, 10);

        if (isNaN(baseDate) || isNaN(days)) {
            dateCalcResultEl.textContent = 'Выберите дату и введите количество дней.';
            return;
        }
        
        baseDate.setHours(12, 0, 0, 0);

        const newDate = new Date(baseDate);
        newDate.setDate(baseDate.getDate() + days);

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateCalcResultEl.textContent = `Новая дата: ${newDate.toLocaleDateString('ru-RU', options)}`;
    }

    startDateInput.addEventListener('change', calculateDateDifference);
    endDateInput.addEventListener('change', calculateDateDifference);

    workStartDateInput.addEventListener('change', calculateWorkDays);
    workEndDateInput.addEventListener('change', calculateWorkDays);
    
    calculateDaysBtn.addEventListener('click', calculateNewDate);
    
    // Первоначальный расчет
    calculateDateDifference();
    calculateWorkDays();
    calculateNewDate();
}

export { getHtml, init };
