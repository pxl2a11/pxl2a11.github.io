//25 js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

let audioPlayer;
let currentStation = null;
let playAttemptId = 0; // Для предотвращения состояния гонки при быстрой смене станций

/**
 * Обновляет медиа-сессию браузера для отображения информации в системном интерфейсе.
 */
function updateMediaSession() {
    if (!('mediaSession' in navigator) || !currentStation) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: 'Интернет-радио',
        album: 'Mini Apps Radio',
        artwork: [{ src: currentStation.logoUrl || '', type: 'image/jpeg' }]
    });

    navigator.mediaSession.setActionHandler('play', () => audioPlayer?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioPlayer?.pause());
}

export function getHtml() {
    return `
        <style>
            .station-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            }
            .dark .station-card {
                background: #1f2937; /* slate-800 */
                border-color: #374151; /* slate-700 */
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
                display: none;
                width: 24px;
                height: 24px;
                align-items: center;
                justify-content: center;
            }
            .station-card.playing .playing-indicator {
                display: flex;
            }
            .playing-indicator span {
                width: 4px;
                height: 100%;
                background-color: #3b82f6;
                border-radius: 2px;
                margin: 0 1px;
                animation-duration: 1.2s;
                animation-iteration-count: infinite;
                animation-timing-function: ease-in-out;
            }
            .playing-indicator span:nth-child(1) { animation-name: sound-wave1; }
            .playing-indicator span:nth-child(2) { animation-name: sound-wave2; animation-delay: 0.2s; }
            .playing-indicator span:nth-child(3) { animation-name: sound-wave3; animation-delay: 0.4s; }
            @keyframes sound-wave1 { 0%, 100% { transform: scaleY(0.2); } 50% { transform: scaleY(1); } }
            @keyframes sound-wave2 { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(0.8); } }
            @keyframes sound-wave3 { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(0.9); } }
            
            #volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #3b82f6; cursor: pointer; border-radius: 50%; }
            #volume-slider::-moz-range-thumb { width: 16px; height: 16px; background: #3b82f6; cursor: pointer; border-radius: 50%; }
        </style>
        <div class=\"radio-container p-2 md:p-4 space-y-4\">
            <div class=\"relative\">
                <input id=\"radio-search-input\" type=\"text\" placeholder=\"Поиск станций...\" class=\"w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500\"/>
                <svg class=\"absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\" /></svg>
            </div>
            <div id=\"radio-stations\" class=\"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4\"></div>
        </div>

        <div id=\"fixed-player-container\" class=\"fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-xl hidden transform translate-y-full transition-transform duration-300\">
            <div class=\"flex items-center justify-between max-w-6xl mx-auto w-full gap-4\">
                <div class=\"flex items-center gap-4 flex-1 min-w-0\">
                    <img id=\"station-logo-display\" class=\"w-16 h-16 rounded-lg shadow-md\" src=\"img/radio.svg\" alt=\"Station Logo\">
                    <div class=\"flex flex-col min-w-0\">
                        <p id=\"station-name-display\" class=\"text-lg font-bold truncate text-gray-900 dark:text-gray-100\">Выберите станцию</p>
                        <div id=\"quality-selector\" class=\"flex items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1 mt-1\">
                            <button data-quality=\"low\" class=\"quality-btn text-xs font-bold py-1 px-3 rounded-full transition-colors\">Low</button>
                            <button data-quality=\"med\" class=\"quality-btn text-xs font-bold py-1 px-3 rounded-full transition-colors\">Med</button>
                            <button data-quality=\"hi\" class=\"quality-btn text-xs font-bold py-1 px-3 rounded-full transition-colors\">High</button>
                        </div>
                    </div>
                </div>

                <div class=\"flex items-center justify-center\">
                    <button id=\"play-pause-btn\" class=\"bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed\">
                        <svg id=\"play-icon\" class=\"w-6 h-6\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg>
                        <svg id=\"pause-icon\" class=\"w-6 h-6 hidden\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M6 19h4V5H6v14zm8-14v14h4V5h-4z\"/></svg>
                    </button>
                </div>
                
                <div class=\"hidden md:flex items-center space-x-3 flex-1 justify-end\">
                    <svg class=\"w-6 h-6 text-gray-500 dark:text-gray-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M9.383 3.003A.75.75 0 0110 3v14a.75.75 0 01-1.67-.504l-4.226-4.577H3a.75.75 0 01-.75-.75v-4.346a.75.75 0 01.75-.75h1.597L8.33 3.504A.75.75 0 019.383 3.003z\" clip-rule=\"evenodd\" /></svg>
                    <input type=\"range\" id=\"volume-slider\" min=\"0\" max=\"100\" value=\"100\" class=\"w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer\">
                </div>
                <audio id=\"audio-player\" class=\"hidden\"></audio>
            </div>
        </div>
    `;
}

export function init() {
    document.body.classList.add('radio-app-active');

    const radioStationsContainer = document.getElementById('radio-stations');
    audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const stationNameDisplay = document.getElementById('station-name-display');
    const stationLogoDisplay = document.getElementById('station-logo-display');
    const volumeSlider = document.getElementById('volume-slider');
    const fixedPlayerContainer = document.getElementById('fixed-player-container');
    const searchInput = document.getElementById('radio-search-input');
    const qualityBtns = document.querySelectorAll('.quality-btn');
    
    let currentQuality = localStorage.getItem('radioQuality') || 'med';
    const stationCards = [];

    function updateQualityUI() {
        qualityBtns.forEach(btn => {
            const isActive = btn.dataset.quality === currentQuality;
            btn.classList.toggle('bg-blue-500', isActive);
            btn.classList.toggle('text-white', isActive);
        });
    }

    function createStationButtons() {
        radioStationsContainer.innerHTML = '';
        stationCards.length = 0;
        radioStations.forEach((station, index) => {
            const card = document.createElement('button');
            card.className = 'station-card group flex flex-col items-center p-3 rounded-xl focus:outline-none';
            card.dataset.index = index;
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
            
            card.addEventListener('click', () => selectStation(station, card));
            radioStationsContainer.appendChild(card);
            stationCards.push(card);
        });
    }
    
    function playCurrentStation() {
        if (!currentStation) return;
        playAttemptId++;
        const currentAttempt = playAttemptId;
        audioPlayer.src = currentStation.streams[currentQuality];
        
        stationNameDisplay.textContent = 'Загрузка...';
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        
        audioPlayer.play().then(() => {
            if (currentAttempt === playAttemptId) {
                stationNameDisplay.textContent = currentStation.name;
            }
        }).catch(e => {
            if (currentAttempt === playAttemptId) {
                console.error("Audio playback error:", e);
                stationNameDisplay.textContent = 'Ошибка потока';
            }
        });
    }

    function selectStation(station, cardElement) {
        stationCards.forEach(card => card.classList.remove('playing'));
        if (cardElement) cardElement.classList.add('playing');
        
        currentStation = station;
        stationLogoDisplay.src = station.logoUrl || 'img/radio.svg';
        
        fixedPlayerContainer.classList.remove('hidden');
        setTimeout(() => fixedPlayerContainer.classList.remove('translate-y-full'), 10);
        document.body.style.paddingBottom = `${fixedPlayerContainer.offsetHeight}px`;

        playCurrentStation();
    }

    playPauseBtn.addEventListener('click', () => {
        if (!currentStation) return;
        if (audioPlayer.paused) {
            playCurrentStation();
        } else {
            audioPlayer.pause();
        }
    });

    audioPlayer.addEventListener('play', () => {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        navigator.mediaSession.playbackState = 'playing';
        updateMediaSession();
    });

    audioPlayer.addEventListener('pause', () => {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        navigator.mediaSession.playbackState = 'paused';
    });

    audioPlayer.addEventListener('error', (e) => {
        console.error('Ошибка загрузки или воспроизведения аудио-потока:', e);
        stationNameDisplay.textContent = 'Ошибка';
        stationNameDisplay.classList.add('text-red-500');
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        stationCards.forEach(card => {
            const stationName = card.dataset.name.toLowerCase();
            card.style.display = stationName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newQuality = btn.dataset.quality;
            if (newQuality === currentQuality) return;
            currentQuality = newQuality;
            localStorage.setItem('radioQuality', currentQuality);
            updateQualityUI();
            if (currentStation && !audioPlayer.paused) {
                playCurrentStation();
            }
        });
    });

    createStationButtons();
    updateQualityUI();
    audioPlayer.volume = 1.0;
    playPauseBtn.disabled = true;
}

export function cleanup() {
    document.body.classList.remove('radio-app-active');
    document.body.style.paddingBottom = '0';
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
    }
    const fixedPlayerContainer = document.getElementById('fixed-player-container');
    if (fixedPlayerContainer) {
        fixedPlayerContainer.classList.add('hidden', 'translate-y-full');
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
    }
}
