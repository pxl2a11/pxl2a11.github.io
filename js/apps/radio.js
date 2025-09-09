//15 js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

// --- Глобальные переменные модуля для управления состоянием и очистки ---
let audioElement;
let currentStation = null;
let stationCards = [];
let eventListeners = [];

/**
 * Вспомогательная функция для безопасного добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

// --- HTML-структура приложения ---
export function getHtml() {
    return `
        <style>
            /* --- Стили для карточек станций --- */
            .station-card {
                display: flex;
                align-items: center;
                gap: 0.75rem; /* 12px */
                padding: 0.5rem; /* 8px */
                border-radius: 0.75rem; /* 12px */
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                border: 2px solid transparent;
                width: 100%;
                text-align: left;
            }
            .station-card:hover {
                background-color: #f3f4f6; /* gray-100 */
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .dark .station-card:hover {
                background-color: #374151; /* gray-700 */
            }
            .station-card.playing {
                background-color: #dbeafe; /* blue-100 */
                border-color: #3b82f6; /* blue-500 */
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .dark .station-card.playing {
                background-color: #1e3a8a;
                border-color: #60a5fa; /* blue-400 */
                box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
            }
            .station-card img {
                width: 50px;
                height: 50px;
                border-radius: 0.5rem; /* 8px */
                object-fit: cover;
                flex-shrink: 0;
            }
            .station-card span {
                flex-grow: 1;
            }

            /* --- СТИЛИ ДЛЯ ПОЛОСЫ ПРОКРУТКИ --- */
            #radio-stations-grid::-webkit-scrollbar {
                width: 8px;
            }
            #radio-stations-grid::-webkit-scrollbar-track {
                background: transparent; /* Фон трека */
            }
            #radio-stations-grid::-webkit-scrollbar-thumb {
                background-color: #d1d5db; /* gray-300 */
                border-radius: 4px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            #radio-stations-grid::-webkit-scrollbar-thumb:hover {
                background-color: #9ca3af; /* gray-400 */
            }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb {
                background-color: #4b5563; /* gray-600 */
            }
            .dark #radio-stations-grid::-webkit-scrollbar-thumb:hover {
                background-color: #6b7280; /* gray-500 */
            }
        </style>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 md:p-4">
            
            <!-- Левая колонка: Плеер -->
            <div class="md:col-span-1 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                
                <div id="player-artwork-container" class="w-40 h-40 rounded-full shadow-xl border-4 border-white dark:border-gray-700 mb-4 flex justify-center items-center text-center bg-gray-200 dark:bg-gray-700">
                    <img id="player-artwork" src="" alt="Обложка станции" class="w-full h-full rounded-full object-cover hidden">
                    <span id="player-placeholder" class="font-semibold text-gray-500 dark:text-gray-400 p-4">Выберите станцию</span>
                </div>
                
                <h3 id="player-station-name" class="text-xl font-bold text-center h-14"></h3>
                
                <audio id="radio-audio-element" class="hidden"></audio>

                <div id="player-controls" class="flex items-center gap-2 mt-4">
                    <button id="prev-station-btn" title="Предыдущая станция" class="p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M15.707 4.293a1 1 0 00-1.414 0L8 10.586 2.707 5.293a1 1 0 00-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" transform="rotate(-90 10 10) translate(0 4)"></path></svg>
                    </button>
                    <button id="play-pause-btn" class="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg id="play-icon" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.118V15.882A1.5 1.5 0 006.3 17.16l8.72-5.882a1.5 1.5 0 000-2.558L6.3 2.841z"></path></svg>
                        <svg id="pause-icon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path></svg>
                    </button>
                    <button id="next-station-btn" title="Следующая станция" class="p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                         <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M15.707 4.293a1 1 0 00-1.414 0L8 10.586 2.707 5.293a1 1 0 00-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" transform="rotate(90 10 10) translate(0 -4)"></path></svg>
                    </button>
                </div>
                 <div class="flex items-center gap-2 mt-4 w-full max-w-xs">
                    <button id="mute-btn" title="Выключить звук" class="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                        <svg id="unmuted-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0V2.5zM3.5 6a.75.75 0 00-1.5 0v8a.75.75 0 001.5 0V6zM16.5 6a.75.75 0 00-1.5 0v8a.75.75 0 001.5 0V6z"></path></svg>
                        <svg id="muted-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0V2.5zm-3.25.75a.75.75 0 00-1.5 0v13.5a.75.75 0 001.5 0V3.25zm6.5 0a.75.75 0 00-1.5 0v13.5a.75.75 0 001.5 0V3.25zm-9 3a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0V6.25zm11.5 0a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0V6.25z" clip-rule="evenodd"></path></svg>
                    </button>
                    <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" title="Громкость" class="w-full">
                </div>
            </div>

            <!-- Правая колонка: Список станций -->
            <div class="md:col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Поиск станций</h3>
                <div class="relative mb-4">
                    <input id="radio-search-input" type="search" placeholder="Введите название..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div id="radio-stations-grid" class="mt-2 space-y-2 max-h-[400px] overflow-y-auto pr-2 pt-2">
                    <!-- Карточки станций будут сгенерированы здесь -->
                </div>
            </div>
        </div>
    `;
}

// --- Функции инициализации и управления ---
export function init() {
    const stationsGrid = document.getElementById('radio-stations-grid');
    const searchInput = document.getElementById('radio-search-input');
    
    // Элементы плеера
    const playerArtwork = document.getElementById('player-artwork');
    const playerPlaceholder = document.getElementById('player-placeholder');
    const playerStationName = document.getElementById('player-station-name');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const prevStationBtn = document.getElementById('prev-station-btn');
    const nextStationBtn = document.getElementById('next-station-btn');
    const muteBtn = document.getElementById('mute-btn');
    const unmutedIcon = document.getElementById('unmuted-icon');
    const mutedIcon = document.getElementById('muted-icon');
    audioElement = document.getElementById('radio-audio-element');

    /**
     * Воспроизводит выбранную радиостанцию.
     * @param {object} station - Объект станции для воспроизведения.
     */
    function playStation(station) {
        if (!station) return;
        currentStation = station;
        playerStationName.textContent = 'Загрузка...';
        audioElement.src = station.streams.hi; // По умолчанию высокое качество
        
        audioElement.play().then(() => {
            updatePlayerUI();
            updateMediaSessionMetadata();
        }).catch(error => {
            console.error("Ошибка воспроизведения:", error);
            playerStationName.textContent = "Ошибка потока";
            currentStation = null;
            updatePlayerUI();
            updateMediaSessionMetadata();
        });
    }

    /**
     * Переключает на следующую станцию в списке.
     */
    function playNextStation() {
        if (!currentStation) return;
        const currentIndex = radioStations.findIndex(s => s.name === currentStation.name);
        const nextIndex = (currentIndex + 1) % radioStations.length;
        playStation(radioStations[nextIndex]);
    }

    /**
     * Переключает на предыдущую станцию в списке.
     */
    function playPreviousStation() {
        if (!currentStation) return;
        const currentIndex = radioStations.findIndex(s => s.name === currentStation.name);
        const prevIndex = (currentIndex - 1 + radioStations.length) % radioStations.length;
        playStation(radioStations[prevIndex]);
    }

    /**
     * Включает или выключает звук.
     */
    function toggleMute() {
        audioElement.muted = !audioElement.muted;
        updatePlayerUI();
    }
    
    /**
     * Обновляет интерфейс плеера и список станций в соответствии с текущим состоянием.
     */
    function updatePlayerUI() {
        const isPlaying = !audioElement.paused && currentStation !== null;

        playIcon.classList.toggle('hidden', isPlaying);
        pauseIcon.classList.toggle('hidden', !isPlaying);
        playPauseBtn.disabled = !currentStation;
        nextStationBtn.disabled = !currentStation;
        prevStationBtn.disabled = !currentStation;
        
        mutedIcon.classList.toggle('hidden', !audioElement.muted);
        unmutedIcon.classList.toggle('hidden', audioElement.muted);

        if (currentStation) {
            playerArtwork.src = currentStation.logoUrl || 'img/radio.svg';
            playerArtwork.classList.remove('hidden');
            playerPlaceholder.classList.add('hidden');
            playerStationName.textContent = currentStation.name;
        } else {
            playerArtwork.classList.add('hidden');
            playerPlaceholder.classList.remove('hidden');
            playerStationName.textContent = '';
        }

        stationCards.forEach(card => {
            const isCurrent = card.dataset.name === currentStation?.name;
            card.classList.toggle('playing', isCurrent);
        });
    }

    /**
     * Обновляет метаданные для Media Session API.
     */
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
                artwork: [
                    { src: currentStation.logoUrl || 'img/radio.svg', sizes: '512x512', type: 'image/png' },
                ]
            });
            navigator.mediaSession.playbackState = audioElement.paused ? "paused" : "playing";
        }
    }

    /**
     * Устанавливает обработчики действий для Media Session API.
     */
    function setupMediaSessionHandlers() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => audioElement.play());
            navigator.mediaSession.setActionHandler('pause', () => audioElement.pause());
            navigator.mediaSession.setActionHandler('previoustrack', playPreviousStation);
            navigator.mediaSession.setActionHandler('nexttrack', playNextStation);
        }
    }

    /**
     * Создает и отображает карточки всех радиостанций.
     */
    function createStationCards() {
        stationsGrid.innerHTML = '';
        stationCards.length = 0;
        
        radioStations.forEach((station) => {
            const card = document.createElement('button');
            card.className = 'station-card';
            card.dataset.name = station.name;

            card.innerHTML = `
                <img src="${station.logoUrl || 'img/radio.svg'}" alt="${station.name}" onerror="this.onerror=null;this.src='img/radio.svg';">
                <span class="font-semibold truncate flex-grow">${station.name}</span>
            `;
            
            addListener(card, 'click', () => playStation(station));

            stationsGrid.appendChild(card);
            stationCards.push(card);
        });
    }

    // --- Назначение обработчиков событий ---
    
    addListener(playPauseBtn, 'click', () => {
        if (audioElement.paused) {
            audioElement.play().catch(e => console.error("Ошибка при возобновлении:", e));
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

    addListener(searchInput, 'input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        stationCards.forEach(card => {
            const isVisible = card.dataset.name.toLowerCase().includes(searchTerm);
            card.style.display = isVisible ? 'flex' : 'none';
        });
    });

    // Слушатели на самом аудио-элементе для синхронизации UI
    addListener(audioElement, 'play', updatePlayerUI);
    addListener(audioElement, 'pause', updatePlayerUI);
    addListener(audioElement, 'ended', updatePlayerUI);
    addListener(audioElement, 'volumechange', updatePlayerUI); // Для синхронизации иконки звука
    addListener(audioElement, 'error', () => {
        playerStationName.textContent = "Ошибка потока";
        currentStation = null;
        updatePlayerUI();
        updateMediaSessionMetadata();
    });

    // --- Первоначальный запуск ---
    createStationCards();
    setupMediaSessionHandlers();
    updatePlayerUI();
}

// --- Очистка ресурсов при выходе из приложения ---
export function cleanup() {
    if (audioElement) {
        audioElement.pause();
        audioElement.src = ''; // Прерываем загрузку
    }

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
    }
    
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = []; // Очищаем массив
    currentStation = null;
}
