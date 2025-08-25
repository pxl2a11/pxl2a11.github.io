export function getHtml() {
    return `
        <style>
            /* Мобильный макет (вертикально) */
            #info-panel {
                width: 100%;
                border-radius: 1.5rem;
            }
            #map-panel {
                width: 100%;
                height: 18rem; /* 288px */
                margin-top: 1rem;
                border-radius: 1.5rem;
            }
            #split-container {
                display: flex;
                flex-direction: column;
                width: 100%;
            }

            /* Десктопный макет (диагонально 50/50) */
            @media (min-width: 768px) {
                #split-container {
                    display: grid;
                    /* Адаптивная высота, равная половине ширины */
                    aspect-ratio: 2 / 1; 
                }
                #info-panel, #map-panel {
                    grid-area: 1 / 1; 
                    margin-top: 0;
                    height: 100%;
                    border-radius: 1.5rem;
                }
                
                /* Диагональная обрезка 50/50 */
                #info-panel {
                    clip-path: polygon(0 0, 55% 0, 45% 100%, 0% 100%);
                }
                #map-panel {
                    clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%);
                }
            }
        </style>

        <div class="p-4 flex flex-col items-center font-sans w-full">
            <div id="split-container">
                
                <!-- ПАНЕЛЬ С ИНФОРМАЦИЕЙ -->
                <div id="info-panel" class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 lg:p-8 flex flex-col justify-center shadow-lg transition-all">
                    <p class="text-md mb-2 text-gray-500 dark:text-gray-400">Ваш IP-адрес:</p>
                    <p id="ip-address" class="text-4xl lg:text-5xl font-bold mb-4 break-all text-gray-800 dark:text-gray-200">Загрузка...</p>
                    <div class="flex gap-4 mb-6">
                        <button id="copy-ip-btn" class="bg-blue-600 text-white text-sm py-2 px-5 rounded-full hover:bg-blue-700 transition-colors shadow-md">Копировать</button>
                        <button id="refresh-ip-btn" class="bg-gray-500 text-white text-sm py-2 px-5 rounded-full hover:bg-gray-600 transition-colors shadow-md">Обновить</button>
                    </div>
                    <div id="geo-info" class="text-left space-y-3 border-t border-gray-300 dark:border-gray-700 pt-5">
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.026.977-2.19.977-3.328a8.958 8.958 0 00-1.302-4.665A5.985 5.985 0 0016 11a4 4 0 00-4-4h-1.024A21.965 21.965 0 006 11a4 4 0 00-4 4c0 .861.223 1.679.623 2.378" /></svg><strong>Тип:</strong> <span id="ip-type" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 11l1.414-1.414a2 2 0 012.828 0l1.414 1.414M12 6v5m0 0l-1-1m1 1l1-1" /></svg><strong>Провайдер:</strong> <span id="ip-isp" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg><strong>ASN:</strong> <span id="ip-asn" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg><strong>Страна:</strong> <span id="ip-country" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><strong>Регион:</strong> <span id="ip-region" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" /></svg><strong>Город:</strong> <span id="ip-city" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><strong>Часовой пояс:</strong> <span id="ip-timezone" class="ml-2 truncate">Загрузка...</span></p>
                        <p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><strong>Почтовый индекс:</strong> <span id="ip-postal" class="ml-2 truncate">Загрузка...</span></p>
                    </div>
                </div>

                <!-- ПАНЕЛЬ С КАРТОЙ -->
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
    const typeEl = document.getElementById('ip-type');
    const ispEl = document.getElementById('ip-isp');
    const asnEl = document.getElementById('ip-asn');
    const countryEl = document.getElementById('ip-country');
    const regionEl = document.getElementById('ip-region');
    const cityEl = document.getElementById('ip-city');
    const timezoneEl = document.getElementById('ip-timezone');
    const postalEl = document.getElementById('ip-postal');
    const mapContainer = document.getElementById('ip-map');
    let map = null;
    let resizeTimeout;

    const locationIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-10 h-10 text-blue-600 drop-shadow-lg"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
    });

    const resetInfo = (message = 'Загрузка...') => {
        ipEl.textContent = message;
        typeEl.textContent = message;
        ispEl.textContent = message;
        asnEl.textContent = message;
        countryEl.textContent = message;
        regionEl.textContent = message;
        cityEl.textContent = message;
        timezoneEl.textContent = message;
        postalEl.textContent = message;
        const mapPanel = document.getElementById('map-panel');
        if (mapPanel) mapPanel.style.display = 'none';
        if(map) { map.remove(); map = null; }
    };

    const centerMap = () => {
        if (!map) return;
        if (window.innerWidth >= 768) {
            const mapWidth = map.getSize().x;
            const offsetX = mapWidth / 4; 
            map.panBy([-offsetX, 0], { animate: false });
        }
    };

    const fetchIpInfo = () => {
        resetInfo();
        // Используем специальный URL для получения ASN
        fetch('https://ipinfo.io/json?token=a05f142c922572') // Пример с токеном, чтобы получить ASN
            .then(response => { if (!response.ok) throw new Error(`Network error`); return response.json(); })
            .then(data => {
                ipEl.textContent = data.ip || 'Не определен';
                typeEl.textContent = data.ip && data.ip.includes(':') ? 'IPv6' : 'IPv4';
                ispEl.textContent = data.org || 'Нет данных';
                
                if (data.asn) {
                    asnEl.textContent = `${data.asn.asn} (${data.asn.name})`;
                } else {
                    asnEl.textContent = 'Нет данных';
                }

                countryEl.textContent = data.country || 'Нет данных';
                regionEl.textContent = data.region || 'Нет данных';
                cityEl.textContent = data.city || 'Нет данных';
                timezoneEl.textContent = data.timezone || 'Нет данных';
                postalEl.textContent = data.postal || 'Нет данных';

                if (data.loc) {
                    const [lat, lon] = data.loc.split(',');
                    document.getElementById('map-panel').style.display = 'block';

                    if (typeof L !== 'undefined') {
                        if (map) { map.remove(); map = null; }
                        
                        map = L.map('ip-map', { attributionControl: false }).setView([lat, lon], 10);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        
                        centerMap();
                        
                        L.marker([lat, lon], { icon: locationIcon }).addTo(map)
                            .bindPopup(`Ваше примерное местоположение`).openPopup();
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
    
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(centerMap, 100);
    };
    
    window.addEventListener('resize', handleResize);

    copyBtn.addEventListener('click', () => {
        const ipText = ipEl.textContent;
        if (ipText && !ipText.includes('...') && !ipText.includes('Ошибка')) {
            navigator.clipboard.writeText(ipText).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!'; copyBtn.disabled = true;
                setTimeout(() => { copyBtn.textContent = originalText; copyBtn.disabled = false; }, 1500);
            });
        }
    });

    refreshBtn.addEventListener('click', fetchIpInfo);
    fetchIpInfo();
}

export function cleanup() {
    window.removeEventListener('resize', this.handleResize);
}
