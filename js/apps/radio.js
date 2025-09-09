// js/apps/radio.js
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
        </style>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 md:p-4">
            <div class="md:col-span-1 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <div id="player-artwork-container" class="w-40 h-40 rounded-full shadow-xl border-4 border-white dark:border-gray-700 mb-4 flex justify-center items-center text-center bg-gray-200 dark:bg-gray-700">
                    <img id="player-artwork" src="" alt="Обложка станции" class="w-full h-full rounded-full object-cover hidden">
                    <span id="player-placeholder" class="font-semibold text-gray-500 dark:text-gray-400 p-4">Выберите станцию</span>
                </div>
                <h3 id="player-station-name" class="text-xl font-bold text-center h-14"></h3>
                <audio id="radio-audio-element" class="hidden"></audio>
                <div class="flex items-center gap-4 mt-4">
                    <button id="prev-station-btn" title="Предыдущая" class="p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md">
                        <svg fill="#000000" width="800px" height="800px" viewBox="0 0 512 512" id="Layer_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M297.2,478l20.7-21.6L108.7,256L317.9,55.6L297.2,34L65.5,256L297.2,478z M194.1,256L425.8,34l20.7,21.6L237.3,256  l209.2,200.4L425.8,478L194.1,256z"/></svg>
                    </button>
                    <button id="play-pause-btn" class="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg id="play-icon" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.118V15.882A1.5 1.5 0 006.3 17.16l8.72-5.882a1.5 1.5 0 000-2.558L6.3 2.841z"></path></svg>
                        <svg id="pause-icon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path></svg>
                    </button>
                    <button id="next-station-btn" title="Следующая" class="p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md">
                        <svg fill="#000000" width="800px" height="800px" viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><path d="M214.78,478l-20.67-21.57L403.27,256,194.11,55.57,214.78,34,446.46,256ZM317.89,256,86.22,34,65.54,55.57,274.7,256,65.54,456.43,86.22,478Z"/></svg>
                    </button>
                </div>
                <div class="flex items-center gap-2 mt-6 w-full max-w-xs">
                    <button id="mute-btn" title="Выключить звук" class="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <svg id="volume-on-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M18.97 3.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06L20.44 7l-1.47-1.47a.75.75 0 0 1 0-1.06Zm-15 0a.75.75 0 0 1 0 1.06L5.56 6.5 3.97 7.97a.75.75 0 0 1-1.06-1.06L5.16 4.66a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06L6.22 10.22a.75.75 0 0 1-1.06-1.06L6.69 7.5 3.97 4.66a.75.75 0 0 1 0-1.06ZM12 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z" clip-rule="evenodd"/></svg>
                        <svg id="volume-off-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 3a1 1 0 0 1 .894.553l8 16A1 1 0 0 1 20 21H4a1 1 0 0 1-.894-1.447l8-16A1 1 0 0 1 12 3Zm0 5.263L7.155 18h9.69L12 8.263Z" clip-rule="evenodd"/></svg>
                    </button>
                    <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" title="Громкость" class="w-full">
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
            playerStationName.textContent = '';
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
