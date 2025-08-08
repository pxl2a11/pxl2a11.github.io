// *** КОД ПОЛНОСТЬЮ ПЕРЕПИСАН ДЛЯ РАБОТЫ С API, ПОДДЕРЖИВАЮЩИМ HTTPS ***

export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center">
            <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md text-center w-full max-w-md">
                <p class="text-lg mb-2 text-gray-600 dark:text-gray-400">Ваш IP-адрес:</p>
                <p id="ip-address" class="text-4xl font-bold mb-4 break-all">Загрузка...</p>
                <div class="flex justify-center gap-4 mb-6">
                    <button id="copy-ip-btn" class="bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600">Копировать</button>
                    <button id="refresh-ip-btn" class="bg-gray-500 text-white text-sm py-2 px-4 rounded-full hover:bg-gray-600">Обновить</button>
                </div>
                <div id="geo-info" class="text-left space-y-2 border-t border-gray-300 dark:border-gray-600 pt-4">
                    <p><strong>Провайдер:</strong> <span id="ip-isp">Загрузка...</span></p>
                    <p><strong>Страна:</strong> <span id="ip-country">Загрузка...</span></p>
                    <p><strong>Регион:</strong> <span id="ip-region">Загрузка...</span></p>
                    <p><strong>Город:</strong> <span id="ip-city">Загрузка...</span></p>
                </div>
            </div>
            <!-- Контейнер для карты -->
            <div id="ip-map" class="w-full max-w-md h-64 mt-4 rounded-xl shadow-md z-0"></div>
        </div>`;
}

export function init() {
    const ipEl = document.getElementById('ip-address');
    const copyBtn = document.getElementById('copy-ip-btn');
    const refreshBtn = document.getElementById('refresh-ip-btn');
    const countryEl = document.getElementById('ip-country');
    const regionEl = document.getElementById('ip-region');
    const cityEl = document.getElementById('ip-city');
    const ispEl = document.getElementById('ip-isp');
    const mapContainer = document.getElementById('ip-map');

    let map = null; // Переменная для хранения экземпляра карты

    const resetInfo = (message = 'Загрузка...') => {
        ipEl.textContent = message;
        countryEl.textContent = message;
        regionEl.textContent = message;
        cityEl.textContent = message;
        ispEl.textContent = message;
        mapContainer.style.display = 'none';
        if(map) {
            map.remove();
            map = null;
        }
    };

    const fetchIpInfo = () => {
        resetInfo();
        
        // ИСПОЛЬЗУЕМ НОВЫЙ БЕСПЛАТНЫЙ API С ПОДДЕРЖКОЙ HTTPS: ipinfo.io
        fetch('https://ipinfo.io/json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Адаптируем код под структуру ответа от ipinfo.io
                ipEl.textContent = data.ip || 'Не определен';
                countryEl.textContent = data.country || 'Не определена';
                regionEl.textContent = data.region || 'Не определен'; // У ipinfo поле называется 'region'
                cityEl.textContent = data.city || 'Не определен';
                ispEl.textContent = data.org || 'Не определен'; // Провайдер в поле 'org'

                // Координаты приходят в одной строке 'loc' ("lat,lon")
                if (data.loc) {
                    const [lat, lon] = data.loc.split(','); // Разделяем строку на широту и долготу

                    mapContainer.style.display = 'block';
                    if (typeof L !== 'undefined') {
                        if (map) { // Удаляем старую карту перед созданием новой
                            map.remove();
                            map = null;
                        }
                        map = L.map('ip-map').setView([lat, lon], 10);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        L.marker([lat, lon]).addTo(map)
                            .bindPopup(`Приблизительное местоположение для ${data.ip}`)
                            .openPopup();
                    } else {
                        mapContainer.innerHTML = '<p class="text-center text-red-500">Библиотека карт (Leaflet) не загружена.</p>';
                    }
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                resetInfo('Ошибка');
                ipEl.textContent = 'Не удалось получить данные';
            });
    };

    copyBtn.addEventListener('click', () => {
        const ipText = ipEl.textContent;
        if (ipText && !ipText.includes('...') && !ipText.includes('Ошибка')) {
            navigator.clipboard.writeText(ipText).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!';
                copyBtn.disabled = true;
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.disabled = false;
                }, 1500);
            });
        }
    });

    refreshBtn.addEventListener('click', fetchIpInfo);

    // Первоначальная загрузка данных при инициализации
    fetchIpInfo();
}

export function cleanup() {
    // При переходе с этой страницы карта будет корректно удалена функцией resetInfo,
    // которая вызывается при следующем заходе на страницу.
    // Оставляем пустым для простоты.
}
