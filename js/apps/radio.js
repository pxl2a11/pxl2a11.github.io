let audioPlayer; //07 Module-level variable
let currentStation = null; // Module-level variable for the current station
let metadataInterval = null; // Interval for fetching track metadata

// URL для API. Можно легко изменить страну (RU, US, GB) или убрать фильтр
const RADIO_API_URL = 'https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/RU?limit=100&order=clickcount&reverse=true';

// База данных API для получения метаданных трека
// Ключ - точное название станции
const stationMetadataAPIs = {
    'Новое Радио': 'https://newradio.ru/api/v2/tracks/current'
};

/**
 * Fetches radio stations from the Radio Browser API.
 * @returns {Promise<Array>} A promise that resolves to an array of station objects.
 */
async function fetchStations() {
    const radioStationsContainer = document.getElementById('radio-stations');
    try {
        radioStationsContainer.innerHTML = `<p class="text-center col-span-full text-gray-500 dark:text-gray-400">Загрузка станций...</p>`;
        const response = await fetch(RADIO_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.map(station => ({
            name: station.name.trim(),
            logoUrl: station.favicon || null,
            streams: {
                hi: station.url_resolved, med: station.url_resolved, low: station.url_resolved
            }
        }));
    } catch (error) {
        console.error("Failed to fetch radio stations:", error);
        radioStationsContainer.innerHTML = `<p class="text-center col-span-full text-red-500">Не удалось загрузить список станций. Попробуйте позже.</p>`;
        return [];
    }
}

/**
 * Fetches and displays the current track for a station, using a CORS proxy.
 * @param {string} stationName The name of the station.
 */
async function fetchMetadata(stationName) {
    const trackInfoDisplay = document.getElementById('track-info-display');
    const apiUrl = stationMetadataAPIs[stationName];
    if (!apiUrl || !trackInfoDisplay) return;

    // *** ИСПРАВЛЕНИЕ CORS: Используем прокси-сервер allorigins.win ***
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) return;
        const data = await response.json();
        const metadata = JSON.parse(data.contents); // Получаем оригинальный ответ от API радио

        if (metadata && metadata.artist && metadata.song) {
            trackInfoDisplay.textContent = `${metadata.artist} - ${metadata.song}`;
            trackInfoDisplay.classList.remove('hidden');
        } else {
            trackInfoDisplay.classList.add('hidden');
        }
    } catch (error) {
        console.error(`Error fetching metadata for ${stationName}:`, error);
        trackInfoDisplay.classList.add('hidden');
    }
}

/** Stops fetching metadata */
function stopMetadataFetching() {
    if (metadataInterval) {
        clearInterval(metadataInterval);
        metadataInterval = null;
    }
    const trackInfoDisplay = document.getElementById('track-info-display');
    if (trackInfoDisplay) {
        trackInfoDisplay.classList.add('hidden');
        trackInfoDisplay.textContent = '';
    }
}

/** Starts fetching metadata for the current station */
function startMetadataFetching() {
    stopMetadataFetching(); // Stop any previous fetching
    if (currentStation && stationMetadataAPIs[currentStation.name]) {
        fetchMetadata(currentStation.name); // Fetch immediately
        metadataInterval = setInterval(() => fetchMetadata(currentStation.name), 15000); // And then every 15 seconds
    }
}


/**
 * Updates the browser's media session to show info in OS-level UI.
 */
function updateMediaSession() {
    if (!('mediaSession' in navigator) || !currentStation) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: 'Интернет-радио',
        album: 'Mini Apps Radio',
        artwork: [{ src: currentStation.logoUrl || '', type: 'image/jpeg' }]
    });
    navigator.mediaSession.setActionHandler('play', () => {
        if (audioPlayer && audioPlayer.paused) {
            audioPlayer.play().then(() => {
                document.getElementById('play-icon').classList.add('hidden');
                document.getElementById('pause-icon').classList.remove('hidden');
                navigator.mediaSession.playbackState = 'playing';
            }).catch(e => console.error("Media Session resume failed", e));
        }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if (audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            if (playIcon && pauseIcon) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                navigator.mediaSession.playbackState = 'paused';
            }
        }
    });
}


export function getHtml() {
    return `
        <div class="radio-container p-4">
            <div class="mb-4">
                <input id="radio-search-input" type="text" placeholder="Поиск станций..." class="w-full p-3 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div id="radio-stations" class="grid grid-cols-2 sm:grid-cols-3 gap-6"></div>
        </div>
        <div id="fixed-player-container" class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-xl hidden">
            <div class="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto w-full">
                <div id="current-station-info" class="flex items-center mb-4 md:mb-0 min-h-[4rem] text-center md:text-left flex-grow min-w-0">
                    <div id="station-logo-container" class="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-white/20 dark:border-gray-800/20 shadow-lg flex-shrink-0">
                        <div id="logo-placeholder" class="w-full h-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300">Нет лого</div>
                    </div>
                    <div class="flex flex-col items-start min-w-0">
                        <p id="station-name-display" class="text-xl font-bold drop-shadow-md text-gray-900 dark:text-gray-100 truncate">Выберите станцию</p>
                        <p id="track-info-display" class="text-sm font-light text-gray-500 dark:text-gray-400 mt-1 hidden truncate"></p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 w-full md:w-auto justify-center">
                    <button id="play-pause-btn" class="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 ease-in-out disabled:opacity-30 disabled:cursor-not-allowed"><svg id="play-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg id="pause-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                    <div class="flex items-center space-x-2">
                        <svg id="volume-icon" class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.003A.75.75 0 0110 3v14a.75.75 0 01-1.67-.504l-4.226-4.577H3a.75.75 0 01-.75-.75v-4.346a.75.75 0 01.75-.75h1.597L8.33 3.504A.75.75 0 019.383 3.003z" clip-rule="evenodd" /></svg>
                        <input type="range" id="volume-slider" min="0" max="100" value="100" class="w-24 sm:w-32 h-1 rounded-full appearance-none cursor-pointer">
                    </div>
                    <div class="flex items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1">
                        <button data-quality="low" class="quality-btn text-xs font-bold py-1 px-2 rounded-full transition-colors">Low</button>
                        <button data-quality="med" class="quality-btn text-xs font-bold py-1 px-2 rounded-full transition-colors">Med</button>
                        <button data-quality="hi" class="quality-btn text-xs font-bold py-1 px-2 rounded-full transition-colors">High</button>
                    </div>
                </div>
                <audio id="audio-player"></audio>
            </div>
        </div>
    `;
}

export async function init() {
    const radioStationsContainer = document.getElementById('radio-stations');
    audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn'), playIcon = document.getElementById('play-icon'), pauseIcon = document.getElementById('pause-icon'), stationNameDisplay = document.getElementById('station-name-display'), stationLogoContainer = document.getElementById('station-logo-container'), volumeSlider = document.getElementById('volume-slider'), fixedPlayerContainer = document.getElementById('fixed-player-container'), searchInput = document.getElementById('radio-s
