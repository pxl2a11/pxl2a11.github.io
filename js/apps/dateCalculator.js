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
                        <input type="date" id="startDate" value="${today}" class="mt-1 block w-full input-style">
                    </div>
                    <div>
                        <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Конечная дата</label>
                        <input type="date" id="endDate" value="${today}" class="mt-1 block w-full input-style">
                    </div>
                </div>
                <div id="date-diff-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[70px]"></div>
            </div>
            
            <!-- Калькулятор возраста -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Калькулятор возраста</h3>
                <div>
                    <label for="birthDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ваша дата рождения</label>
                    <input type="date" id="birthDate" value="2000-01-01" class="mt-1 block w-full input-style">
                </div>
                <div id="age-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[50px]"></div>
            </div>

            <!-- Расчет рабочих дней -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Расчет рабочих дней</h3>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="include-holidays" class="h-4 w-4 rounded">
                        <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Учитывать праздники РФ</span>
                    </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label for="workStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Начальная дата</label>
                        <input type="date" id="workStartDate" value="${today}" class="mt-1 block w-full input-style">
                    </div>
                    <div>
                        <label for="workEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Конечная дата</label>
                        <input type="date" id="workEndDate" value="${today}" class="mt-1 block w-full input-style">
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
                        <input type="date" id="calcDate" value="${today}" class="mt-1 block w-full input-style">
                    </div>
                    <div>
                        <label for="days" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Дни (+/-)</label>
                        <input type="number" id="days" value="10" class="mt-1 block w-full input-style">
                    </div>
                    <button id="calculate-days-btn" class="w-full md:w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors h-10">Рассчитать</button>
                </div>
                <div id="date-calc-result" class="mt-4 text-center font-semibold text-lg text-gray-900 dark:text-gray-200 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[50px]"></div>
            </div>
        </div>
        <style>
            .input-style { border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); background-color: white; color: #111827; padding: 0.5rem; }
            .dark .input-style {
                border-color: #4B5563;
                background-color: #374151;
                color: #F3F4F6;
                color-scheme: dark; /* ИСПРАВЛЕНИЕ: Это заставляет браузер использовать темную тему для календаря */
            }
        </style>
    `;
}

function init() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateDiffResultEl = document.getElementById('date-diff-result');
    const birthDateInput = document.getElementById('birthDate');
    const ageResultEl = document.getElementById('age-result');
    const workStartDateInput = document.getElementById('workStartDate');
    const workEndDateInput = document.getElementById('workEndDate');
    const workDaysResultEl = document.getElementById('work-days-result');
    const includeHolidaysCheck = document.getElementById('include-holidays');
    const calcDateInput = document.getElementById('calcDate');
    const daysInput = document.getElementById('days');
    const calculateDaysBtn = document.getElementById('calculate-days-btn');
    const dateCalcResultEl = document.getElementById('date-calc-result');

    const russianHolidays = ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08', '02-23', '03-08', '05-01', '05-09', '06-12', '11-04'];

    function calculateDateDifference() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
            dateDiffResultEl.innerHTML = 'Выберите корректный диапазон дат.';
            return;
        }

        const diffTime = Math.abs(endDate - startDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;

        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();
        if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        
        let result = [];
        if(years > 0) result.push(`${years} г.`);
        if(months > 0) result.push(`${months} мес.`);
        if(days > 0) result.push(`${days} д.`);
        
        const totalResult = result.length > 0 ? result.join(' ') : 'Даты совпадают';
        const weeksResult = totalWeeks > 0 ? `или ${totalWeeks} нед. и ${remainingDays} д.` : '';
        
        dateDiffResultEl.innerHTML = `
            <div>${totalResult} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">${weeksResult}</span></div>
            <div class="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">(Всего: ${totalDays} дней)</div>
        `;
    }
    
    function calculateAge() {
        const birthDate = new Date(birthDateInput.value);
        const today = new Date();
        if (isNaN(birthDate) || birthDate > today) {
            ageResultEl.textContent = 'Выберите корректную дату рождения.';
            return;
        }

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        
        ageResultEl.textContent = `Ваш возраст: ${years} г. ${months} мес. ${days} д.`;
    }

    function calculateWorkDays() {
        const startDate = new Date(workStartDateInput.value);
        const endDate = new Date(workEndDateInput.value);
        if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
            workDaysResultEl.textContent = 'Выберите корректный диапазон.';
            return;
        }
        
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            const mmdd = `${(curDate.getMonth() + 1).toString().padStart(2, '0')}-${curDate.getDate().toString().padStart(2, '0')}`;
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !(includeHolidaysCheck.checked && russianHolidays.includes(mmdd))) {
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
            dateCalcResultEl.textContent = 'Заполните все поля.';
            return;
        }
        
        baseDate.setHours(12, 0, 0, 0);
        const newDate = new Date(baseDate);
        newDate.setDate(baseDate.getDate() + days);
        dateCalcResultEl.textContent = `Новая дата: ${newDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}`;
    }

    startDateInput.addEventListener('change', calculateDateDifference);
    endDateInput.addEventListener('change', calculateDateDifference);
    birthDateInput.addEventListener('change', calculateAge);
    workStartDateInput.addEventListener('change', calculateWorkDays);
    workEndDateInput.addEventListener('change', calculateWorkDays);
    includeHolidaysCheck.addEventListener('change', calculateWorkDays);
    calculateDaysBtn.addEventListener('click', calculateNewDate);
    
    calculateDateDifference();
    calculateWorkDays();
    calculateNewDate();
    calculateAge();
}

export { getHtml, init };
