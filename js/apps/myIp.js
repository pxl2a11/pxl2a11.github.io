    const fetchIpInfo = () => {
        resetInfo();
        
        // *** ИЗМЕНЕНИЕ ЗДЕСЬ: Используем http вместо https для бесплатного API ***
        fetch('https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,isp,query')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status !== 'success') {
                    throw new Error(`API error: ${data.message || 'Unknown error'}`);
                }
                
                ipEl.textContent = data.query || 'Не определен';
                countryEl.textContent = data.country || 'Не определена';
                regionEl.textContent = data.regionName || 'Не определен';
                cityEl.textContent = data.city || 'Не определен';
                ispEl.textContent = data.isp || 'Не определен';

                if (data.lat && data.lon) {
                    mapContainer.style.display = 'block';
                    if (typeof L !== 'undefined') {
                        if(map) { // Удаляем предыдущую карту, если она есть
                            map.remove();
                        }
                        map = L.map('ip-map').setView([data.lat, data.lon], 10);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        L.marker([data.lat, data.lon]).addTo(map)
                            .bindPopup(`Приблизительное местоположение для ${data.query}`)
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
