// js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

export function getHtml() {
    return `
        <style>
            /* Стили, специфичные для карточек станций */
            .station-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            }
            .dark .station-card {
                background: #1f2937;
                border-color: #374151;
            }
            .station-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            }
            .station-card.playing {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
            }
            .playing-indicator {
                display: none; width: 24px; height: 24px;
                align-items: center; justify-content: center;
            }
            .station-card.playing .playing-indicator { display: flex; }
            .playing-indicator span {
                width: 4px; height: 100%; background-color: #3b82f6;
                border-radius: 2px; margin: 0 1px;
                animation: sound-wave 1.2s infinite ease-in-out;
            }
            .playing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .playing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes sound-wave { 0%, 100% { transform: scaleY(0.2); } 50% { transform: scaleY(1); } }
        </style>
        <div class=\"radio-container p-2 md:p-4 space-y-4\">
            <div class=\"relative\">
                <input id=\"radio-search-input\" type=\"text\" placeholder=\"Поиск станций...\" class=\"w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500\"/>
                <svg class=\"absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\" /></svg>
            </div>
            <div id=\"radio-stations\" class=\"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4\"></div>
        </div>
    `;
}

export function init() {
    const radioStationsContainer = document.getElementById('radio-stations');
    const searchInput = document.getElementById('radio-search-input');
    const stationCards = [];
    let stateUpdateListener;

    // Функция для создания карточек станций
    function createStationButtons() {
        radioStationsContainer.innerHTML = '';
        stationCards.length = 0;
        radioStations.forEach((station) => {
            const card = document.createElement('button');
            card.className = 'station-card group flex flex-col items-center p-3 rounded-xl focus:outline-none';
            card.dataset.name = station.name;

            card.innerHTML = `
                <div class=\"relative w-24 h-24 mb-3\">
                    <img src=\"${station.logoUrl || 'img/radio.svg'}\" alt=\"${station.name}\" class=\"w-full h-full object-cover rounded-full shadow-md\" onerror=\"this.onerror=null;this.src='img/radio.svg';\">
                    <div class=\"playing-indicator absolute bottom-0 right-0 bg-white/70 dark:bg-gray-800/70 rounded-full p-1\">
                        <span></span><span></span><span></span>
                    </div>
                </div>
                <span class=\"text-center text-sm font-semibold h-10 flex items-center\">${station.name}</span>
            `;
            
            // При клике создаем и отправляем кастомное событие, которое слушает main.js
            card.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('playRadioStation', { detail: station }));
            });

            radioStationsContainer.appendChild(card);
            stationCards.push(card);
        });
    }

    // Слушатель для поиска
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        stationCards.forEach(card => {
            card.style.display = card.dataset.name.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Слушатель для обновления состояния карточек (какая сейчас играет)
    stateUpdateListener = (e) => {
        const { station, isPlaying } = e.detail;
        stationCards.forEach(card => {
            const isCurrent = card.dataset.name === station?.name;
            card.classList.toggle('playing', isCurrent && isPlaying);
        });
    };
    document.addEventListener('radioPlayerStateChanged', stateUpdateListener);

    createStationButtons();
    // Запрашиваем у плеера его текущее состояние, чтобы правильно отобразить индикатор
    document.dispatchEvent(new Event('requestRadioPlayerState'));
}

export function cleanup() {
    // При выходе из приложения удаляем слушатель, чтобы не нагружать систему
    document.removeEventListener('radioPlayerStateChanged', ()=>{});
}
