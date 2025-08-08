// *** КОД С ДИАГОНАЛЬНЫМ РАЗДЕЛЕНИЕМ МАКЕТА И SVG-ИКОНКОЙ ***

export function getHtml() {
    return `
        <style>
            /* Стили для мобильных устройств (по умолчанию) */
            #info-panel {
                width: 100%;
                border-radius: 1rem; /* Скругляем на мобильных */
            }
            #map-panel {
                width: 100%;
                height: 18rem; /* 288px */
                margin-top: 1rem;
                border-radius: 1rem; /* Скругляем на мобильных */
            }
            #split-container {
                display: flex;
                flex-direction: column;
            }

            /* Стили для планшетов и десктопов (ширина от 768px) */
            @media (min-width: 768px) {
                #split-container {
                    display: grid;
                    height: 24rem; /* 384px, задаем фиксированную высоту для контейнера сетки */
                }
                #info-panel, #map-panel {
                    grid-area: 1 / 1; /* Обе панели в одной ячейке сетки */
                    margin-top: 0;
                    height: 100%;
                    border-radius: 1rem; /* Скругляем и на больших экранах */
                }
                
                /* Магия диагональной обрезки */
                #info-panel {
                    clip-path: polygon(0 0, 85% 0, 65% 100%, 0% 100%);
                }
                #map-panel {
                    clip-path: polygon(85% 0, 100% 0, 100% 100%, 65% 100%);
                }
            }
        </style>

        <div class="p-4 flex flex-col items-center font-sans w-full">
            <div id="split-container" class="w-full max-w-4xl">
                
                <!-- ПАНЕЛЬ С ИНФОРМАЦИЕЙ (ЛЕВАЯ ЧАСТЬ) -->
                <div id="info-panel" class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col justify-center shadow-lg transition-all">
                    <p class="text-md mb-2 text-gray-500 dark:text-gray-400">Ваш IP-адрес:</p>
                    <p id="ip-address" class="text-4xl font-bold mb-4 break-all text-gray-800 dark:text-gray-200">Загрузка...</p>
                    <div class="flex gap-4 mb-6">
                        <button id="copy-ip-btn" class="bg-blue-600 text-white text-sm py-2 px-5 rounded-full hover:bg-blue-700 transition-colors shadow-md">Копировать</button>
                        <button id="refresh-ip-btn" class="bg-gray-500 text-white text-sm py-2 px-5 rounded-full hover:bg-gray-600 transition-colors shadow-md">Обновить</button>
                    </div>
                    <div id="geo-info" class="text-left space-y-3 border-t border-gray-300 dark:border-gray-700 pt-5">
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 11l1.414-1.414a2 2 0 012.828 0l1.414 1.414M12 6v5m0 0l-1-1m1 1l1-1" /></svg><strong>Провайдер:</strong> <span id="ip-isp" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg><strong>Страна:</strong> <span id="ip-country" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><strong>Регион:</strong> <span id="ip-region" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" /></svg><strong>Город:</strong> <span id="ip-city" class="ml-2 truncate">Загрузка...</span></p>
                    </div>
                </div>

                <!-- ПАНЕЛЬ С КАРТОЙ (ПРАВАЯ ЧАСТЬ) -->
                <div id="map-panel" class="shadow-lg z-0 bg-gray-200 dark:bg-gray-700">
                    <div id="ip-map" class="w-full h-full"></div>
                </div>

            </div>
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

    let map = null;

    const locationIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-10 h-10 text-blue-600 drop-shadow-lg">
                   <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>`,
        className: '', 
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    const resetInfo = (message = 'Загрузка...') => {
        ipEl.textContent = message;
        countryEl.textContent = message;
        regionEl.textContent = message;
        cityEl.textContent = message;
        ispEl.textContent = message;
        
        const mapPanel = document.getElementById('map-panel');
        if (mapPanel) mapPanel.style.display = 'none';

        if(map) {
            map.remove();
            map = null;
        }
    };

    const fetchIpInfo = () => {
        resetInfo();
        
        fetch('https://ipinfo.io/json')
            .then(response => {
                if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                ipEl.textContent = data.ip || 'Не определен';
                countryEl.textContent = data.country || 'Не определена';
                regionEl.textContent = data.region || 'Не определен';
                cityEl.textContent = data.city || 'Не определен';
                ispEl.textContent = data.org || 'Не определен';

                if (data.loc) {
                    const [lat, lon] = data.loc.split(',');
                    const mapPanel = document.getElementById('map-panel');
                    if(mapPanel) mapPanel.style.display = 'block';

                    if (typeof L !== 'undefined') {
                        if (map) {
                            map.remove();
                            map = null;
                        }
                        
                        map = L.map('ip-map', { attributionControl: false, zoomControl: false }).setView([lat, lon], 10);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                        L.marker([lat, lon], { icon: locationIcon }).addTo(map)
                            .bindPopup(`Ваше примерное местоположение`)
                            .openPopup();
                    } else {
                        mapContainer.innerHTML = '<p class="text-center text-red-500 p-4">Библиотека карт (Leaflet) не загружена.</p>';
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

    fetchIpInfo();
}

export function cleanup() {
    // Эта функция может остаться пустой
}
