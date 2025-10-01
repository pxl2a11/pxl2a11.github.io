//59 js/apps/radio.js
import { radioStations } from '../radioStationsData.js';
import { getUserData, saveUserData } from '../dataManager.js';

// --- Глобальные переменные модуля ---
let audioElement;
let hls = null; // Для поддержки HLS (.m3u8)
let currentStation = null;
let stationCards = [];
let eventListeners = [];
let favorites = [];
let isFavoritesFilterActive = false;
const FAVORITES_KEY = 'favoriteRadioStations';

// --- Переменные для элементов DOM ---
let stationsGrid, searchInput, playerArtwork, playerPlaceholder, playerStationName;
let playPauseBtn, playIcon, pauseIcon, volumeSlider, prevStationBtn, nextStationBtn;
let muteBtn, unmutedIcon, mutedIcon, streamQualityControls, favoritesFilterBtn;

/**
 * Вспомогательная функция для безопасного добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * ***НОВАЯ ФУНКЦИЯ***
 * Извлекает имя логотипа из URL для использования в хеше.
 * @param {object} station - Объект радиостанции.
 * @returns {string|null} - Имя логотипа (например, "russkoe_radio") или null.
 */
function getLogoName(station) {
    if (!station || !station.logoUrl) return null;
    // Извлекаем имя файла: "img/radio/russkoe_radio.png" -> "russkoe_radio.png"
    const filename = station.logoUrl.split('/').pop();
    // Убираем расширение: "russkoe_radio.png" -> "russkoe_radio"
    const logoName = filename.substring(0, filename.lastIndexOf('.'));
    return logoName;
}


// --- HTML-структура приложения ---
export function getHtml() {
    return `
        <style>
            /* --- Стили для карточек станций --- */
            .station-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.75rem; transition: all 0.2s ease-in-out; border: 2px solid transparent; width: 100%; text-align: left; }
            .station-card:hover { background-color: #f3f4f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .dark .station-card:hover { background-color: #374151; }
            .station-card.playing { background-color: #dbeafe; border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
            .dark .station-card.playing { background-color: #1e3a8a; border-color: #60a5fa; box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3); }
            .station-card img { width: 50px; height: 50px; border-radius: 0.5rem; object-fit: cover; flex-shrink: 0; }
            .station-card .play-area { cursor: pointer; flex-grow: 1; display: flex; align-items: center; gap: 0.75rem; }
            #radio-stations-grid::-webkit-scrollbar { width: 8px; }
            #radio-stations-grid::-webkit-scrollbar-track { background: transparent; }
            #radio-stations-grid::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
            #radio-stations-grid::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb { background-color: #4b5563; }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
            #volume-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; outline: none; transition: all 0.2s; }
            #volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #3b82f6; cursor: pointer; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.2); }
            .dark #volume-slider { background: #4b5563; }
            .dark #volume-slider::-webkit-slider-thumb { background: #60a5fa; border-color: #374151; }
            .stream-quality-btn { padding: 0.5rem 0.75rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.5rem; background-color: #e5e7eb; color: #4b5563; transition: all 0.2s; border: none; cursor: pointer; width: 100%; text-align: center; }
            .dark .stream-quality-btn { background-color: #4b5563; color: #d1d5db; }
            .stream-quality-btn.active { background-color: #3b82f6; color: white; font-weight: bold; }
            .dark .stream-quality-btn.active { background-color: #60a5fa; color: #1f2937; }
            .favorite-btn { padding: 0.25rem; border-radius: 9999px; margin-left: auto; flex-shrink: 0; background: none; border: none; cursor: pointer; }
            .favorite-btn:hover { background-color: rgba(0,0,0,0.1); }
            .dark .favorite-btn:hover { background-color: rgba(255,255,255,0.1); }
            .favorite-btn .star-icon { width: 24px; height: 24px; color: #9ca3af; transition: all 0.2s; }
            .favorite-btn.is-favorite .star-icon { color: #f59e0b; fill: currentColor; }
            #favorites-filter-btn.active { background-color: #f59e0b; }
            #favorites-filter-btn.active svg { color: white; fill: white; }
        </style>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 md:p-4">
            <div class="md:col-span-1 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <div id="player-artwork-container" class="w-40 h-40 rounded-full shadow-xl border-4 border-white dark:border-gray-700 mb-4 flex justify-center items-center text-center bg-gray-200 dark:bg-gray-700">
                    <img id="player-artwork" src="" alt="Обложка станции" class="w-full h-full rounded-full object-cover hidden">
                    <span id="player-placeholder" class="font-semibold text-gray-500 dark:text-gray-400 p-4">Выберите станцию</span>
                </div>
                <h3 id="player-station-name" class="text-xl font-bold text-center h-7 mb-2"></h3>
                <audio id="radio-audio-element" class="hidden"></audio>
                <div id="player-controls" class="flex items-center gap-2">
                    <button id="prev-station-btn" title="Предыдущая станция" class="p-3 flex justify-center items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z"/></svg>
                    </button>
                    <button id="play-pause-btn" class="p-4 flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg id="play-icon" class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.46484 3.92349C4.79896 3.5739 4 4.05683 4 4.80888V19.1911C4 19.9432 4.79896 20.4261 5.46483 20.0765L19.1622 12.8854C19.8758 12.5108 19.8758 11.4892 19.1622 11.1146L5.46484 3.92349ZM2 4.80888C2 2.55271 4.3969 1.10395 6.39451 2.15269L20.0919 9.34382C22.2326 10.4677 22.2325 13.5324 20.0919 14.6562L6.3945 21.8473C4.39689 22.8961 2 21.4473 2 19.1911V4.80888Z"></svg>
                        <svg id="pause-icon" class="w-8 h-8 hidden" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5C10 3.34315 8.65686 2 7 2H5C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H7C8.65686 22 10 20.6569 10 19V5ZM8 5C8 4.44772 7.55229 4 7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H7C7.55229 20 8 19.5523 8 19V5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22 5C22 3.34315 20.6569 2 19 2H17C15.3431 2 14 3.34315 14 5V19C14 20.6569 15.3431 22 17 22H19C20.6569 22 22 20.6569 22 19V5ZM20 5C20 4.44772 19.5523 4 19 4H17C16.4477 4 16 4.44772 16 5V19C16 19.5523 16.4477 20 17 20H19C19.5523 20 20 19.5523 20 19V5Z"/></svg>
                    </button>
                    <button id="next-station-btn" title="Следующая станция" class="p-3 flex justify-center items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z"/></svg>
                    </button>
                </div>
                <div class="w-full max-w-xs space-y-3 mt-4">
                    <div class="flex items-center gap-2">
                        <button id="mute-btn" title="Выключить звук" class="p-2 flex justify-center items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                            <svg id="unmuted-icon" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 1.8C11.5532 0.262376 14 1.07799 14 3.00001V21.1214C14 23.0539 11.5313 23.8627 10.3878 22.3049L6.49356 17H4C2.34315 17 1 15.6569 1 14V10C1 8.34315 2.34315 7 4 7H6.5L10.4 1.8ZM12 3L8.1 8.2C7.72229 8.70361 7.12951 9 6.5 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H6.49356C7.13031 15 7.72901 15.3032 8.10581 15.8165L12 21.1214V3Z"/><path d="M16.2137 4.17445C16.1094 3.56451 16.5773 3 17.1961 3C17.6635 3 18.0648 3.328 18.1464 3.78824C18.4242 5.35347 19 8.96465 19 12C19 15.0353 18.4242 18.6465 18.1464 20.2118C18.0648 20.672 17.6635 21 17.1961 21C16.5773 21 16.1094 20.4355 16.2137 19.8256C16.5074 18.1073 17 14.8074 17 12C17 9.19264 16.5074 5.8927 16.2137 4.17445Z"/><path d="M21.41 5C20.7346 5 20.2402 5.69397 20.3966 6.35098C20.6758 7.52413 21 9.4379 21 12C21 14.5621 20.6758 16.4759 20.3966 17.649C20.2402 18.306 20.7346 19 21.41 19C21.7716 19 22.0974 18.7944 22.2101 18.4509C22.5034 17.5569 23 15.5233 23 12C23 8.47672 22.5034 6.44306 22.2101 5.54913C22.0974 5.20556 21.7716 5 21.41 5Z"/></svg>
                            <svg id="muted-icon" class="w-5 h-5 hidden" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 3.00001C14 1.07799 11.5532 0.262376 10.4 1.8L6.5 7H4C2.34315 7 1 8.34315 1 10V14C1 15.6569 2.34315 17 4 17H6.49356L10.3878 22.3049C11.5313 23.8627 14 23.0539 14 21.1214V3.00001ZM8.1 8.2L12 3V21.1214L8.10581 15.8165C7.72901 15.3032 7.13031 15 6.49356 15H4C3.44772 15 3 14.5523 3 14V10C3 9.44772 3.44772 9 4 9H6.5C7.12951 9 7.72229 8.70361 8.1 8.2Z"/><path d="M21.2929 8.57094C21.6834 8.18041 22.3166 8.18042 22.7071 8.57094C23.0976 8.96146 23.0976 9.59463 22.7071 9.98515L20.7603 11.9319L22.7071 13.8787C23.0976 14.2692 23.0976 14.9024 22.7071 15.2929C22.3166 15.6834 21.6834 15.6834 21.2929 15.2929L19.3461 13.3461L17.3994 15.2929C17.0088 15.6834 16.3757 15.6834 15.9852 15.2929C15.5946 14.9023 15.5946 14.2692 15.9852 13.8787L17.9319 11.9319L15.9852 9.98517C15.5946 9.59464 15.5946 8.96148 15.9852 8.57096C16.3757 8.18043 17.0088 8.18043 17.3994 8.57096L19.3461 10.5177L21.2929 8.57094Z"/></svg>
                        </button>
                        <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" title="Громкость" class="w-full">
                    </div>
                    <div id="stream-quality-controls" class="space-y-2 hidden w-full"></div>
                </div>
            </div>
            <div class="md:col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <div class="flex items-center gap-3 mb-4">
                    <div class="relative flex-grow">
                        <input id="radio-search-input" type="search" placeholder="Введите название..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button id="favorites-filter-btn" title="Показать избранное" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0">
                        <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </button>
                </div>
                <div id="radio-stations-grid" class="mt-2 space-y-2 max-h-[400px] overflow-y-auto pr-2 pt-2"></div>
            </div>
        </div>
    `;
}

// --- Основные функции ---
function playStation(station) {
    if (!station) return;
    currentStation = station;

    // ***ИЗМЕНЕНИЕ***: Обновляем хеш в URL, используя имя логотипа
    const logoName = getLogoName(station);
    if (logoName) {
        window.location.hash = logoName;
    }

    // Сразу обновляем UI, чтобы пользователь видел выбранную станцию
    updatePlayerUI();
    playerStationName.textContent = 'Загрузка...';
    renderStreamQualityButtons(station);
    
    const defaultStreamUrl = station.streams[0]?.url;
    if (defaultStreamUrl) {
        changeStream(defaultStreamUrl);
    } else {
        console.error("У станции нет доступных потоков:", station.name);
        playerStationName.textContent = "Нет потоков";
    }
}

function changeStream(url) {
    if (!url) return;

    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (url.includes('.m3u8')) {
        if (Hls.isSupported()) {
            console.log("Воспроизведение HLS через hls.js");
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(audioElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                audioElement.play().catch(error => {
                    console.error("Ошибка воспроизведения HLS:", error);
                    playerStationName.textContent = "Ошибка HLS";
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                     console.error('Критическая ошибка HLS:', data);
                     playerStationName.textContent = "Ошибка HLS";
                }
            });
        } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
            console.log("Воспроизведение HLS нативно (Safari)");
            audioElement.src = url;
            audioElement.play().catch(error => {
                console.error("Ошибка нативного воспроизведения HLS:", error);
                playerStationName.textContent = "Ошибка HLS";
            });
        } else {
            console.error("HLS не поддерживается в этом браузере");
            playerStationName.textContent = "Формат не поддерживается";
            return;
        }
    } else {
        console.log("Воспроизведение стандартного потока");
        audioElement.src = url;
        audioElement.play().catch(error => {
            if (error.name === 'AbortError') {
                console.log('Воспроизведение прервано новым запросом. Это нормально.');
                return;
            }
            console.error("Ошибка воспроизведения:", error);
            playerStationName.textContent = "Ошибка потока";
        });
    }

    streamQualityControls.querySelectorAll('.stream-quality-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.url === url);
    });
}

function playNextStation() {
    const currentIndex = currentStation ? radioStations.findIndex(s => s.name === currentStation.name) : -1;
    const nextIndex = (currentIndex + 1) % radioStations.length;
    playStation(radioStations[nextIndex]);
}

function playPreviousStation() {
    const currentIndex = currentStation ? radioStations.findIndex(s => s.name === currentStation.name) : -1;
    const prevIndex = (currentIndex - 1 + radioStations.length) % radioStations.length;
    playStation(radioStations[prevIndex]);
}

function toggleMute() {
    audioElement.muted = !audioElement.muted;
    updatePlayerUI();
}

// --- Функции обновления UI ---
function renderStreamQualityButtons(station) {
    streamQualityControls.innerHTML = '';
    if (station && station.streams && station.streams.length > 1) {
        station.streams.forEach(stream => {
            const button = document.createElement('button');
            button.className = 'stream-quality-btn';
            button.dataset.url = stream.url;
            button.textContent = stream.name;
            addListener(button, 'click', () => changeStream(stream.url));
            streamQualityControls.appendChild(button);
        });
        streamQualityControls.classList.remove('hidden');
    } else {
        streamQualityControls.classList.add('hidden');
    }
}

function updatePlayerUI() {
    const isPlaying = !audioElement.paused && !audioElement.error && currentStation !== null;
    playIcon.classList.toggle('hidden', isPlaying);
    pauseIcon.classList.toggle('hidden', !isPlaying);
    playPauseBtn.disabled = !currentStation;
    nextStationBtn.disabled = false;
    prevStationBtn.disabled = false;
    mutedIcon.classList.toggle('hidden', !audioElement.muted);
    unmutedIcon.classList.toggle('hidden', audioElement.muted);

    if (currentStation) {
        playerArtwork.src = currentStation.logoUrl || 'img/radio.svg';
        playerArtwork.classList.remove('hidden');
        playerPlaceholder.classList.add('hidden');
        if (playerStationName.textContent === 'Загрузка...' || playerStationName.textContent === '') {
            playerStationName.textContent = currentStation.name;
        }
    } else {
        playerArtwork.classList.add('hidden');
        playerPlaceholder.classList.remove('hidden');
        playerStationName.textContent = '';
        streamQualityControls.innerHTML = '';
        streamQualityControls.classList.add('hidden');
    }

    stationCards.forEach(card => {
        const isCurrent = card.dataset.name === currentStation?.name;
        card.classList.toggle('playing', isCurrent);
    });
}

function updateMediaSessionMetadata() {
    if ('mediaSession' in navigator) {
        if (!currentStation) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = "none";
            return;
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation.name,
            artist: 'Интернет-радио',
            artwork: [{ src: currentStation.logoUrl || 'img/radio.svg', sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.playbackState = audioElement.paused ? "paused" : "playing";
    }
}

function createStationCards() {
    stationsGrid.innerHTML = '';
    stationCards.length = 0;
    
    radioStations.forEach((station) => {
        const card = document.createElement('div');
        card.className = 'station-card';
        card.dataset.name = station.name;
        const isFavorite = favorites.includes(station.name);
        
        card.innerHTML = `
            <div class="play-area">
                <img src="${station.logoUrl || 'img/radio.svg'}" alt="${station.name}" onerror="this.onerror=null;this.src='img/radio.svg';">
                <span class="font-semibold truncate">${station.name}</span>
            </div>
            <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" title="Добавить в избранное">
                <svg class="star-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </button>
        `;
        
        addListener(card.querySelector('.play-area'), 'click', () => playStation(station));
        addListener(card.querySelector('.favorite-btn'), 'click', () => toggleFavorite(station.name));

        stationsGrid.appendChild(card);
        stationCards.push(card);
    });
}

function filterStations() {
    const searchTerm = searchInput.value.toLowerCase();
    stationCards.forEach(card => {
        const stationName = card.dataset.name;
        const isFavorite = favorites.includes(stationName);
        
        const matchesSearch = stationName.toLowerCase().includes(searchTerm);
        const matchesFilter = !isFavoritesFilterActive || isFavorite;
        
        card.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
}

// --- Функции для данных и событий ---
async function loadFavorites() {
    favorites = await getUserData(FAVORITES_KEY, []);
}

async function saveFavorites() {
    await saveUserData(FAVORITES_KEY, favorites);
}

async function toggleFavorite(stationName) {
    const index = favorites.indexOf(stationName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(stationName);
    }
    await saveFavorites();
    const cardToUpdate = stationCards.find(card => card.dataset.name === stationName);
    if (cardToUpdate) {
        cardToUpdate.querySelector('.favorite-btn').classList.toggle('is-favorite', index === -1);
    }
    if (isFavoritesFilterActive && index > -1) {
        filterStations();
    }
}

function setupMediaSessionHandlers() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audioElement.play());
        navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
        navigator.mediaSession.setActionHandler('previoustrack', playPreviousStation);
        navigator.mediaSession.setActionHandler('nexttrack', playNextStation);
    }
}

// --- Основная инициализация и очистка ---
export async function init() {
    // Присвоение элементов DOM
    stationsGrid = document.getElementById('radio-stations-grid');
    searchInput = document.getElementById('radio-search-input');
    playerArtwork = document.getElementById('player-artwork');
    playerPlaceholder = document.getElementById('player-placeholder');
    playerStationName = document.getElementById('player-station-name');
    playPauseBtn = document.getElementById('play-pause-btn');
    playIcon = document.getElementById('play-icon');
    pauseIcon = document.getElementById('pause-icon');
    volumeSlider = document.getElementById('volume-slider');
    prevStationBtn = document.getElementById('prev-station-btn');
    nextStationBtn = document.getElementById('next-station-btn');
    muteBtn = document.getElementById('mute-btn');
    unmutedIcon = document.getElementById('unmuted-icon');
    mutedIcon = document.getElementById('muted-icon');
    audioElement = document.getElementById('radio-audio-element');
    streamQualityControls = document.getElementById('stream-quality-controls');
    favoritesFilterBtn = document.getElementById('favorites-filter-btn');

    await loadFavorites();

    // Настройка обработчиков событий
    addListener(playPauseBtn, 'click', () => {
        if (!currentStation) return;
        if (audioElement.paused) {
            if (playerStationName.textContent.includes('Ошибка')) {
                playStation(currentStation);
            } else {
                 audioElement.play().catch(e => console.error("Ошибка при возобновлении:", e));
            }
        } else {
            audioElement.pause();
        }
    });
    addListener(nextStationBtn, 'click', playNextStation);
    addListener(prevStationBtn, 'click', playPreviousStation);
    addListener(muteBtn, 'click', toggleMute);
    addListener(volumeSlider, 'input', () => {
        audioElement.volume = volumeSlider.value;
        if (audioElement.muted && volumeSlider.value > 0) {
            audioElement.muted = false;
        }
        updatePlayerUI();
    });
    addListener(searchInput, 'input', filterStations);
    
    addListener(favoritesFilterBtn, 'click', () => {
        isFavoritesFilterActive = !isFavoritesFilterActive;
        favoritesFilterBtn.classList.toggle('active', isFavoritesFilterActive);
        filterStations();
    });
    addListener(audioElement, 'play', () => {
        if(currentStation) playerStationName.textContent = currentStation.name;
        updatePlayerUI();
        updateMediaSessionMetadata();
    });
    addListener(audioElement, 'pause', () => {
        updatePlayerUI();
        updateMediaSessionMetadata();
    });
    addListener(audioElement, 'ended', updatePlayerUI);
    addListener(audioElement, 'volumechange', updatePlayerUI);

    // Первоначальная отрисовка
    createStationCards();
    setupMediaSessionHandlers();
    
    // ***ИЗМЕНЕНИЕ***: Проверяем URL на наличие хеша при загрузке
    const stationLogoFromUrl = window.location.hash.substring(1);
    if (stationLogoFromUrl) {
        const stationToPlay = radioStations.find(s => getLogoName(s) === stationLogoFromUrl);
        if (stationToPlay) {
            playStation(stationToPlay);
        }
    }
    
    nextStationBtn.disabled = false;
    prevStationBtn.disabled = false;
    updatePlayerUI();
}

export function cleanup() {
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }
    if (hls) {
        hls.destroy();
        hls = null;
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
        ['play', 'pause', 'previoustrack', 'nexttrack'].forEach(handler => navigator.mediaSession.setActionHandler(handler, null));
    }
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    
    // ***ИЗМЕНЕНИЕ***: Очищаем хеш в URL при выходе из приложения
    // Это предотвращает автоматический запуск при следующем входе на страницу
    history.pushState("", document.title, window.location.pathname + window.location.search);

    eventListeners = [];
    currentStation = null;
    isFavoritesFilterActive = false;
}
