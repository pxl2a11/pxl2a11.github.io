//39 js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

// --- Глобальные переменные модуля для управления состоянием и очистки ---
let audioElement, currentStation = null, stationCards = [], eventListeners = [];
// --- Переменные для элементов UI ---
let playerStationName, playerArtwork, playerPlaceholder, playPauseBtn, playIcon, pauseIcon, volumeOnIcon, volumeOffIcon, muteBtn;


/**
 * Вспомогательная функция для безопасного добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

// --- Функции для управления плеером ---
function playStation(station) {
    if (!station) return;
    currentStation = station;
    playerStationName.textContent = 'Загрузка...';
    audioElement.src = station.streams.hi;
    audioElement.play().then(() => {
        updatePlayerUI();
        setupMediaSession(station);
    }).catch(error => {
        console.error("Ошибка воспроизведения:", error);
        playerStationName.textContent = "Ошибка потока";
        currentStation = null;
        updatePlayerUI();
    });
}

function playNextStation() {
    if (!currentStation) {
        playStation(radioStations[0]);
        return;
    }
    const currentIndex = radioStations.findIndex(s => s.name === currentStation.name);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    playStation(radioStations[nextIndex]);
}

function playPreviousStation() {
    if (!currentStation) {
        playStation(radioStations[0]);
        return;
    }
    const currentIndex = radioStations.findIndex(s => s.name === currentStation.name);
    const prevIndex = (currentIndex - 1 + radioStations.length) % radioStations.length;
    playStation(radioStations[prevIndex]);
}


// --- Функции для управления Media Session API ---
function clearMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.playbackState = "none";
    }
}

function setupMediaSession(station) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: 'Mini Apps Radio',
            album: 'Прямой эфир',
            artwork: [
                { src: station.logoUrl || 'img/radio.svg', sizes: '192x192', type: 'image/png' },
                { src: station.logoUrl || 'img/radio.svg', sizes: '512x512', type: 'image/png' },
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => audioElement?.play());
        navigator.mediaSession.setActionHandler('pause', () => audioElement?.pause());
        navigator.mediaSession.setActionHandler('nexttrack', playNextStation);
        navigator.mediaSession.setActionHandler('previoustrack', playPreviousStation);
    }
}


// --- HTML-структура приложения ---
export function getHtml() {
    return `
        <style>
            .station-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s ease-in-out; border: 2px solid transparent; width: 100%; text-align: left; }
            .station-card:hover { background-color: #f3f4f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .dark .station-card:hover { background-color: #374151; }
            .station-card.playing { background-color: #dbeafe; border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
            .dark .station-card.playing { background-color: #1e3a8a; border-color: #60a5fa; box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3); }
            .station-card img { width: 50px; height: 50px; border-radius: 0.5rem; object-fit: cover; flex-shrink: 0; }
            .station-card span { flex-grow: 1; }
            #radio-stations-grid::-webkit-scrollbar { width: 8px; }
            #radio-stations-grid::-webkit-scrollbar-track { background: transparent; }
            #radio-stations-grid::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
            #radio-stations-grid::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb { background-color: #4b5563; }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
            
            /* --- НОВЫЕ СТИЛИ ДЛЯ ПЛЕЕРА --- */
            .player-control-btn {
                background-color: transparent;
                color: #4b5563; /* gray-600 */
                border-radius: 9999px;
                transition: background-color 0.2s, color 0.2s;
            }
            .dark .player-control-btn { color: #d1d5db; /* gray-300 */ }
            .player-control-btn:hover { background-color: #e5e7eb; /* gray-200 */ }
            .dark .player-control-btn:hover { background-color: #4b5563; /* gray-600 */ }
            
            #volume-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; background: #e5e7eb; border-radius: 5px; outline: none; transition: opacity .2s; }
            .dark #volume-slider { background: #4b5563; }
            #volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; cursor: pointer; }
            .dark #volume-slider::-webkit-slider-thumb { background: #60a5fa; }
        </style>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 md:p-4">
            
            <div class="md:col-span-1 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <div id="player-artwork-container" class="w-full aspect-square rounded-2xl shadow-lg mb-6 flex justify-center items-center bg-gray-200 dark:bg-gray-900/50 overflow-hidden">
                    <img id="player-artwork" src="" alt="Обложка станции" class="w-full h-full object-cover hidden transition-opacity duration-300">
                    <svg id="player-placeholder" class="w-24 h-24 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                </div>
                
                <div class="text-center mb-6">
                    <h3 id="player-station-name" class="text-xl font-bold text-gray-800 dark:text-gray-200">Выберите станцию</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Прямой эфир</p>
                </div>

                <audio id="radio-audio-element" class="hidden"></audio>

                <div class="w-full max-w-xs space-y-4">
                    <div class="flex items-center justify-center gap-4">
                        <button id="prev-station-btn" title="Предыдущая" class="player-control-btn p-3">
                             <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM13.7071 8.29289C14.0976 8.68342 14.0976 9.31658 13.7071 9.70711L11.4142 12L13.7071 14.2929C14.0976 14.6834 14.0976 15.3166 13.7071 15.7071C13.3166 16.0976 12.6834 16.0976 12.2929 15.7071L9.5554 12.9696C9.0199 12.4341 9.0199 11.5659 9.55541 11.0304L12.2929 8.29289C12.6834 7.90237 13.3166 7.90237 13.7071 8.29289Z"/></svg>
                        </button>
                        <button id="play-pause-btn" class="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg id="play-icon" class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.5963 10.3318C16.8872 11.0694 16.8872 12.9307 15.5963 13.6683L11.154 16.2068C9.9715 16.8825 8.5002 16.0287 8.5002 14.6667L8.5002 9.33339C8.5002 7.97146 9.9715 7.11762 11.154 7.79333L15.5963 10.3318Z"/></svg>
                            <svg id="pause-icon" class="w-8 h-8 hidden" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM14 8C14.5523 8 15 8.44772 15 9L15 15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15L13 9C13 8.44772 13.4477 8 14 8ZM10 8C10.5523 8 11 8.44772 11 9L11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15L9 9C9 8.44772 9.44772 8 10 8Z"/></svg>
                        </button>
                        <button id="next-station-btn" title="Следующая" class="player-control-btn p-3">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM10.2929 15.7071C9.90237 15.3166 9.90237 14.6834 10.2929 14.2929L12.5858 12L10.2929 9.70711C9.90237 9.31658 9.90237 8.68342 10.2929 8.29289C10.6834 7.90237 11.3166 7.90237 11.7071 8.29289L14.4229 11.0087C14.9704 11.5562 14.9704 12.4438 14.4229 12.9913L11.7071 15.7071C11.3166 16.0976 10.6834 16.0976 10.2929 15.7071Z"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="mute-btn" title="Выключить звук" class="player-control-btn p-2">
                            <svg id="volume-on-icon" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 16V8H6L11 4V20L6 16H3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 9C13 9 15 9.5 15 12C15 14.5 13 15 13 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7C15 7 18 7.83333 18 12C18 16.1667 15 17 15 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <svg id="volume-off-icon" class="w-5 h-5 hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 16V8H6L11 4V20L6 16H3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 15L20.5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 9L20.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" title="Громкость" class="w-full">
                    </div>
                </div>
            </div>
            <div class="md:col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Поиск станций</h3>
                <div class="relative mb-4">
                    <input id="radio-search-input" type="search" placeholder="Введите название..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div id="radio-stations-grid" class="mt-2 space-y-2 max-h-[400px] overflow-y-auto pr-2 pt-2"></div>
            </div>
        </div>
    `;
}

// --- Функции инициализации и управления ---
export function init() {
    // Присваиваем элементы глобальным переменным модуля
    const stationsGrid = document.getElementById('radio-stations-grid');
    const searchInput = document.getElementById('radio-search-input');
    playerArtwork = document.getElementById('player-artwork');
    playerPlaceholder = document.getElementById('player-placeholder');
    playerStationName = document.getElementById('player-station-name');
    playPauseBtn = document.getElementById('play-pause-btn');
    playIcon = document.getElementById('play-icon');
    pauseIcon = document.getElementById('pause-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const prevBtn = document.getElementById('prev-station-btn');
    const nextBtn = document.getElementById('next-station-btn');
    muteBtn = document.getElementById('mute-btn');
    volumeOnIcon = document.getElementById('volume-on-icon');
    volumeOffIcon = document.getElementById('volume-off-icon');
    audioElement = document.getElementById('radio-audio-element');

    function updatePlayerUI() {
        const isPlaying = !audioElement.paused && currentStation !== null;
        playIcon.classList.toggle('hidden', isPlaying);
        pauseIcon.classList.toggle('hidden', !isPlaying);
        playPauseBtn.disabled = !currentStation;
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        }
        if (currentStation) {
            playerArtwork.src = currentStation.logoUrl || 'img/radio.svg';
            playerArtwork.classList.remove('hidden');
            playerPlaceholder.classList.add('hidden');
            playerStationName.textContent = currentStation.name;
        } else {
            playerArtwork.classList.add('hidden');
            playerPlaceholder.classList.remove('hidden');
            playerStationName.textContent = 'Выберите станцию';
            clearMediaSession();
        }
        stationCards.forEach(card => {
            const isCurrent = card.dataset.name === currentStation?.name;
            card.classList.toggle('playing', isCurrent);
        });
    }

    function createStationCards() {
        stationsGrid.innerHTML = '';
        stationCards.length = 0;
        radioStations.forEach((station) => {
            const card = document.createElement('button');
            card.className = 'station-card';
            card.dataset.name = station.name;
            card.innerHTML = `<img src="${station.logoUrl || 'img/radio.svg'}" alt="${station.name}" onerror="this.onerror=null;this.src='img/radio.svg';"><span class="font-semibold truncate flex-grow">${station.name}</span>`;
            addListener(card, 'click', () => playStation(station));
            stationsGrid.appendChild(card);
            stationCards.push(card);
        });
    }

    function toggleMute() {
        audioElement.muted = !audioElement.muted;
        volumeOnIcon.classList.toggle('hidden', audioElement.muted);
        volumeOffIcon.classList.toggle('hidden', !audioElement.muted);
        muteBtn.title = audioElement.muted ? "Включить звук" : "Выключить звук";
    }

    // --- Назначение обработчиков событий ---
    addListener(playPauseBtn, 'click', () => {
        if (audioElement.paused) audioElement.play().catch(e => console.error("Ошибка при возобновлении:", e));
        else audioElement.pause();
    });
    addListener(prevBtn, 'click', playPreviousStation);
    addListener(nextBtn, 'click', playNextStation);
    addListener(muteBtn, 'click', toggleMute);
    addListener(volumeSlider, 'input', () => { audioElement.volume = volumeSlider.value; });
    addListener(searchInput, 'input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        stationCards.forEach(card => card.style.display = card.dataset.name.toLowerCase().includes(searchTerm) ? 'flex' : 'none');
    });
    addListener(audioElement, 'play', updatePlayerUI);
    addListener(audioElement, 'pause', updatePlayerUI);
    addListener(audioElement, 'ended', updatePlayerUI);
    addListener(audioElement, 'error', () => {
        playerStationName.textContent = "Ошибка потока";
        currentStation = null;
        updatePlayerUI();
    });

    // --- Первоначальный запуск ---
    createStationCards();
    updatePlayerUI();
}

// --- Очистка ресурсов при выходе из приложения ---
export function cleanup() {
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }
    eventListeners.forEach(({ element, event, handler }) => element.removeEventListener(event, handler));
    eventListeners = [];
    currentStation = null;
    clearMediaSession();
}
