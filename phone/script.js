// Данные контактов будут загружены из contacts.json
let contactsData = [];
let originalContactsData = []; // Для сохранения оригинального порядка

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const clearDepartmentFilterBtn = document.getElementById('clearDepartmentFilter');
    const themeToggleBtn = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const departmentsContainer = document.getElementById('departmentsContainer');
    const sortDepartmentsIcon = document.getElementById('sortDepartmentsIcon');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Флаг для отслеживания порядка сортировки
    let isAlphabeticalSort = false;

    // Функция для загрузки контактов из JSON-файла
    async function loadContacts() {
        try {
            const response = await fetch('contacts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            contactsData = data;
            originalContactsData = JSON.parse(JSON.stringify(data)); // Глубокая копия
            renderContacts();
            applyFilters();
        } catch (error) {
            console.error('Ошибка загрузки контактов:', error);
            // Можно отобразить сообщение об ошибке пользователю
            departmentsContainer.innerHTML = '<p class="text-red-500">Не удалось загрузить данные контактов. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Функция для рендеринга контактов на основе contactsData
    function renderContacts() {
        departmentsContainer.innerHTML = ''; // Очистить существующие контакты

        // Сортировка contactsData в зависимости от текущего порядка сортировки
        if (isAlphabeticalSort) {
            contactsData.sort((a, b) => a.department.localeCompare(b.department));
        } else {
            // Сброс к оригинальному порядку путем повторного присвоения глубокой копии
            contactsData = JSON.parse(JSON.stringify(originalContactsData));
        }

        contactsData.forEach(dept => {
            const departmentSection = document.createElement('div');
            departmentSection.className = `department-section mb-8 p-4 rounded-xl shadow-md`;
            departmentSection.setAttribute('data-department-name', dept.department);

            const departmentTitleDiv = document.createElement('div');
            departmentTitleDiv.className = `department-title-div rounded-lg mb-4 flex justify-between items-center`;
            departmentTitleDiv.innerHTML = `
                <h2 class="text-2xl">${dept.department}</h2>
            `;
            departmentSection.appendChild(departmentTitleDiv);

            const departmentContent = document.createElement('div');
            departmentContent.className = 'department-content hidden'; // Изначально скрыто

            dept.contacts.forEach(contact => {
                const contactItem = document.createElement('div');
                contactItem.className = `contact-item`;

                // Генерация пути к изображению из имени
                const imagePath = `img/${contact.name}.jpg`;

                // Логика для того, чтобы название отдела в должности было кликабельным
                const positionParts = contact.position.split(' | ');
                let displayPositionHtml = contact.position;
                if (positionParts.length > 1) {
                    const departmentInPosition = positionParts[0];
                    const restOfPosition = positionParts.slice(1).join(' | ');
                    displayPositionHtml = `<span class="clickable-department" data-department="${departmentInPosition}">${departmentInPosition}</span> | ${restOfPosition}`;
                } else {
                    // Если нет разделителя " | ", вся должность является отделом
                    displayPositionHtml = `<span class="clickable-department" data-department="${contact.position}">${contact.position}</span>`;
                }

                // Иконка "Person fill" из Bootstrap Icons в виде SVG
                // Используем btoa() для кодирования SVG в Base64, чтобы его можно было вставить в src data URL
                const humanIconSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                    </svg>
                `;

                const avatarHtml = contact.avatar ?
                    `<img src="${imagePath}" alt="Фото ${contact.name}" class="contact-avatar" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,${btoa(humanIconSvg)}';">` :
                    `<img src="data:image/svg+xml;base64,${btoa(humanIconSvg)}" alt="Без фото" class="contact-avatar">`;

                // Выделение добавочного номера (например, "доб. 8015")
                let phoneDisplay = contact.phone ? contact.phone.replace(/(доб\.\s*)(\d+)/g, '$1<strong>$2</strong>') : '';

                contactItem.innerHTML = `
                    ${avatarHtml}
                    <div class="contact-details">
                        <h3 class="text-xl">${contact.name}</h3>
                        <p class="text-sm"><strong>Должность:</strong> ${displayPositionHtml}</p>
                        ${contact.email ? `<p class="text-sm"><strong>Email:</strong> <a href="mailto:${contact.email}" class="hover:underline">${contact.email}</a></p>` : ''}
                        ${contact.phone ? `<p class="text-sm"><strong>Телефон:</strong> ${phoneDisplay}</p>` : ''}
                        ${contact.mobile ? `<p class="text-sm"><strong>Мобильный:</strong> ${contact.mobile}</p>` : ''}
                    </div>
                `;
                departmentContent.appendChild(contactItem);
            });
            departmentSection.appendChild(departmentContent);
            departmentsContainer.appendChild(departmentSection);
        });

        // Повторное заполнение опций фильтра отделов после рендеринга
        populateDepartmentFilter();
    }

    // Функция для заполнения опций фильтра отделов
    function populateDepartmentFilter() {
        const currentSelectedDepartment = departmentFilter.value; // Сохранить текущий выбор
        departmentFilter.innerHTML = '<option value="all">Все отделы</option>'; // Очистить и добавить по умолчанию

        // Использовать Set для обеспечения уникальности названий отделов, затем отсортировать их, если активна алфавитная сортировка
        let uniqueDepartments = new Set(contactsData.map(dept => dept.department));
        let departmentsArray = Array.from(uniqueDepartments);

        if (isAlphabeticalSort) {
            departmentsArray.sort((a, b) => a.localeCompare(b));
        } else {
            // Если не алфавитная, использовать порядок из текущих `contactsData`
            departmentsArray = originalContactsData.map(dept => dept.department); // Используем originalContactsData для сохранения исходного порядка
        }

        departmentsArray.forEach(deptName => {
            const option = document.createElement('option');
            option.value = deptName;
            option.textContent = deptName;
            departmentFilter.appendChild(option);
        });

        // Восстановить предыдущий выбор, если он все еще существует, иначе по умолчанию установить 'all'
        if (Array.from(departmentFilter.options).some(option => option.value === currentSelectedDepartment)) {
            departmentFilter.value = currentSelectedDepartment;
        } else {
            departmentFilter.value = 'all';
        }
    }

    // Функция для применения фильтров (поиск и отдел)
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDepartment = departmentFilter.value.toLowerCase();

        const departmentSections = document.querySelectorAll('.department-section');

        // Показать/скрыть кнопку очистки
        if (selectedDepartment === 'all') {
            clearDepartmentFilterBtn.classList.add('hidden');
        } else {
            clearDepartmentFilterBtn.classList.remove('hidden');
        }

        departmentSections.forEach(section => {
            const departmentName = section.dataset.departmentName.toLowerCase();
            const departmentContent = section.querySelector('.department-content');
            let departmentHasVisibleContacts = false;

            const isDepartmentVisibleByFilter = (selectedDepartment === 'all' || departmentName === selectedDepartment);

            if (isDepartmentVisibleByFilter) {
                section.style.display = 'block'; // Убедиться, что раздел отдела виден
                if (departmentContent) {
                    departmentContent.classList.remove('hidden'); // Всегда разворачивать содержимое, если отдел виден по фильтру
                }

                const contactItems = section.querySelectorAll('.contact-item'); // Перемещено внутрь, чтобы всегда было свежим
                contactItems.forEach(item => {
                    const textContent = item.textContent.toLowerCase();
                    if (textContent.includes(searchTerm)) {
                        item.style.display = 'flex';
                        departmentHasVisibleContacts = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Если после поиска в развернутом разделе нет видимых контактов, скрыть раздел.
                if (!departmentHasVisibleContacts) {
                    section.style.display = 'none';
                }

            } else {
                section.style.display = 'none'; // Скрыть отдел, если он не выбран фильтром
            }
        });
    }

    // Логика переключения темы
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            localStorage.setItem('theme', 'light');
        }
    }

    // Инициализация темы на основе localStorage или по умолчанию светлая
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Обработчики событий
    searchInput.addEventListener('keyup', applyFilters);
    departmentFilter.addEventListener('change', function() {
        searchInput.value = ''; // Очистить поиск при изменении фильтра отдела
        applyFilters();
    });

    // Обработчик события для кнопки очистки фильтра отдела
    clearDepartmentFilterBtn.addEventListener('click', function() {
        departmentFilter.value = 'all';
        searchInput.value = ''; // Очистить поиск при очистке фильтра
        applyFilters();
    });

    // Обработчик события для заголовков отделов (поведение аккордеона)
    departmentsContainer.addEventListener('click', function(event) {
        const header = event.target.closest('.department-title-div');
        if (header) {
            const parentSection = header.closest('.department-section');
            const departmentName = parentSection.dataset.departmentName;

            // Если выбранный отдел уже выбран в фильтре,
            // повторное нажатие на его заголовок должно сбросить на 'all'.
            // В противном случае выбрать этот отдел.
            if (departmentFilter.value === departmentName) {
                departmentFilter.value = 'all';
            } else {
                departmentFilter.value = departmentName;
            }
            searchInput.value = ''; // Очистить поиск при нажатии на отдел
            applyFilters(); // Повторно применить фильтр после изменения аккордеона
        }
    });

    // Обработчик события для кликабельных названий отделов в контактных данных
    departmentsContainer.addEventListener('click', function(event) {
        const clickableDeptSpan = event.target.closest('.clickable-department');
        if (clickableDeptSpan) {
            const deptName = clickableDeptSpan.dataset.department;
            departmentFilter.value = deptName;
            searchInput.value = ''; // Очистить поиск при нажатии на ссылку отдела

            applyFilters(); // Повторно применить фильтры на основе нового значения выпадающего списка
        }
    });

    // Обработчик события для иконки сортировки
    sortDepartmentsIcon.addEventListener('click', function() {
        isAlphabeticalSort = !isAlphabeticalSort; // Переключить порядок сортировки
        sortDepartmentsIcon.dataset.sortOrder = isAlphabeticalSort ? 'alphabetical' : 'default';
        renderContacts(); // Перерисовать с новым порядком сортировки
        applyFilters(); // Повторно применить фильтры для обеспечения правильной видимости
    });

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Логика кнопки "Наверх"
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавная прокрутка
        });
    });

    // Загрузка контактов при инициализации
    loadContacts();

    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.error('Ошибка регистрации Service Worker:', error);
                });
        });
    }
});
