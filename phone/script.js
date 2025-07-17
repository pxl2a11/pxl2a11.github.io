// Данные контактов будут загружены из JSON-файлов
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

    // Функция для загрузки контактов из JSON-файлов
    async function loadContacts() {
        try {
            const mergedDepartmentsMap = new Map(); // Используем Map для объединения отделов

            // 1. Загрузка precontacts.json
            try {
                const precontactsResponse = await fetch('precontacts.json');
                if (precontactsResponse.ok) {
                    const precontactsData = await precontactsResponse.json();
                    if (Array.isArray(precontactsData) && precontactsData.length > 0) {
                        precontactsData.forEach(dept => {
                            // Добавляем отделы из precontacts.json в Map
                            // Клонируем контакты, чтобы избежать мутации оригинальных данных при сортировке
                            mergedDepartmentsMap.set(dept.department, [...dept.contacts]);
                        });
                        console.log('Контакты загружены из precontacts.json');
                    } else {
                        console.warn('precontacts.json пуст или не содержит данных.');
                    }
                } else {
                    console.warn(`Ошибка загрузки precontacts.json (статус: ${precontactsResponse.status}).`);
                }
            } catch (precontactsError) {
                console.error('Ошибка при загрузке precontacts.json:', precontactsError);
            }

            // 2. Загрузка contacts.json
            try {
                const contactsResponse = await fetch('contacts.json');
                if (!contactsResponse.ok) {
                    throw new Error(`HTTP error! status: ${contactsResponse.status} - ${contactsResponse.statusText || 'Неизвестный статус'}`);
                }
                const contactsJsonData = await contactsResponse.json();
                console.log('Контакты загружены из contacts.json');

                // Обрабатываем contacts.json (плоский массив)
                contactsJsonData.forEach(contact => {
                    const departmentName = contact.department || 'Без отдела';
                    if (!mergedDepartmentsMap.has(departmentName)) {
                        mergedDepartmentsMap.set(departmentName, []);
                    }
                    // Добавляем контакт в соответствующий отдел.
                    // Проверяем на дубликаты по 'id' (если есть) или 'fullName'
                    const existingContactsInDept = mergedDepartmentsMap.get(departmentName);
                    const isDuplicate = existingContactsInDept.some(existingContact =>
                        (existingContact.id && existingContact.id === contact.id) ||
                        (existingContact.fullName && existingContact.fullName === contact.fullName)
                    );

                    if (!isDuplicate) {
                        existingContactsInDept.push(contact);
                    }
                });

            } catch (contactsError) {
                console.error('Ошибка при загрузке contacts.json:', contactsError);
                // Если contacts.json также не загрузился и mergedDepartmentsMap пуст, показываем ошибку
                if (mergedDepartmentsMap.size === 0) {
                    departmentsContainer.innerHTML = '<p class="text-red-500">Не удалось загрузить данные контактов из обоих источников. Пожалуйста, попробуйте позже. Проверьте консоль разработчика для получения подробной информации.</p>';
                    return;
                }
            }

            // Преобразуем Map обратно в массив contactsData
            contactsData = Array.from(mergedDepartmentsMap.entries()).map(([departmentName, contacts]) => ({
                department: departmentName,
                // Сортируем контакты внутри каждого отдела по fullName или name
                contacts: contacts.sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
            }));

            // Сортируем отделы по алфавиту по умолчанию
            contactsData.sort((a, b) => a.department.localeCompare(b.department));

            originalContactsData = JSON.parse(JSON.stringify(contactsData)); // Глубокая копия для сохранения оригинального порядка
            renderContacts();
            applyFilters();

        } catch (error) {
            console.error('Общая ошибка загрузки контактов:', error);
            departmentsContainer.innerHTML = '<p class="text-red-500">Не удалось загрузить данные контактов. Пожалуйста, попробуйте позже. Проверьте консоль разработчика для получения подробной информации.</p>';
        }
    }

    // Функция для рендеринга контактов на основе contactsData
    function renderContacts() {
        departmentsContainer.innerHTML = ''; // Очистить существующие контакты

        let departmentsToRender = [...contactsData]; // Создаем копию для сортировки

        // Сортировка departmentsToRender в зависимости от текущего порядка сортировки
        if (isAlphabeticalSort) {
            departmentsToRender.sort((a, b) => a.department.localeCompare(b.department));
        } else {
            // Если не алфавитная, используем оригинальный порядок отделов
            // Создаем новый массив на основе originalContactsData, чтобы сохранить порядок отделов
            const originalOrderDeptNames = originalContactsData.map(d => d.department);
            departmentsToRender.sort((a, b) => {
                return originalOrderDeptNames.indexOf(a.department) - originalOrderDeptNames.indexOf(b.department);
            });
        }

        departmentsToRender.forEach(dept => {
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

                // Иконка "Person fill" из Bootstrap Icons в виде SVG
                const humanIconSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                    </svg>
                `;
                // Base64-кодированная SVG-иконка для использования в качестве заглушки
                const base64HumanIcon = `data:image/svg+xml;base64,${btoa(humanIconSvg)}`;

                // Генерация пути к изображению из имени (используем fullName для contacts.json и name для precontacts.json)
                const contactNameForImage = contact.fullName || contact.name;
                const imagePath = `img/${contactNameForImage}.jpg`;

                // Изменено: Пытаемся загрузить изображение, если оно есть, иначе используем заглушку
                // Добавлен onerror для обработки отсутствующих изображений
                const avatarHtml = `
                    <img src="${imagePath}"
                         alt="${contactNameForImage}"
                         class="contact-avatar"
                         onerror="this.onerror=null;this.src='${base64HumanIcon}';this.alt='Без фото';">
                `;

                // Используем fullName или name для отображения имени
                const displayName = contact.fullName || contact.name;
                // Используем position для отображения должности
                const displayPosition = contact.position;
                // Выделение добавочного номера (например, "доб. 8015")
                let phoneDisplay = contact.phone ? contact.phone.replace(/(доб\.\s*)(\d+)/g, '$1<strong>$2</strong>') : '';


                contactItem.innerHTML = `
                    ${avatarHtml}
                    <div class="contact-details">
                        <h3 class="text-xl">${displayName}</h3>
                        ${displayPosition ? `<p class="text-sm"><strong>Должность:</strong> ${displayPosition}</p>` : ''}
                        ${contact.mail ? `<p class="text-sm"><strong>Email:</strong> <a href="mailto:${contact.mail}" class="hover:underline">${contact.mail}</a></p>` : ''}
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

        // Использовать Set для обеспечения уникальности названий отделов
        let uniqueDepartments = new Set(contactsData.map(dept => dept.department));
        let departmentsArray = Array.from(uniqueDepartments);

        if (isAlphabeticalSort) {
            departmentsArray.sort((a, b) => a.localeCompare(b));
        } else {
            // Если не алфавитная, используем порядок из originalContactsData
            departmentsArray = originalContactsData.map(dept => dept.department);
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
