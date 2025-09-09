// js/apps/radio.js
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
                width: 100%; /* Убедимся, что кнопка занимает всю ширину */
                text-align: left; /* Выравнивание текста по левому краю */
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
            /* Заставляем текст занимать всё оставшееся место */
            .station-card span {
                flex-grow: 1;
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

                <div id="player-controls" class="flex items-center gap-4 mt-4">
                    <button id="play-pause-btn" class="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <svg id="play-icon" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.118V15.882A1.5 1.5 0 006.3 17.16l8.72-5.882a1.5 1.5 0 000-2.558L6.3 2.841z"></path></svg>
                        <svg id="pause-icon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path></svg>
                    </button>
                    <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" title="Громкость" class="w-32">
                </div>
            </div>

            <!-- Правая колонка: Список станций -->
            <div class="md:col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
                <h3 class="text-xl font-bold mb-4">Поиск станций</h3>
                <div class="relative mb-4">
                    <input id="radio-search-input" type="search" placeholder="Введите название..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <!-- ИСПРАВЛЕНИЕ: Добавлен класс mt-2 для верхнего отступа -->
                <div id="radio-stations-grid" class="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
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
    audioElement = document.getElementById('radio-audio-element');

    /**
     * Воспроизводит выбранную радиостанцию.
     * @param {object} station - Объект станции для воспроизведения.
     */
    function playStation(station) {
        currentStation = station;
        playerStationName.textContent = 'Загрузка...';
        audioElement.src = station.streams.hi; // По умолчанию высокое качество
        
        audioElement.play().then(() => {
            updatePlayerUI();
        }).catch(error => {
            console.error("Ошибка воспроизведения:", error);
            playerStationName.textContent = "Ошибка потока";
            currentStation = null;
            updatePlayerUI();
        });
    }
    
    /**
     * Обновляет интерфейс плеера и список станций в соответствии с текущим состоянием.
     */
    function updatePlayerUI() {
        const isPlaying = !audioElement.paused && currentStation !== null;

        // Обновление иконок Play/Pause
        playIcon.classList.toggle('hidden', isPlaying);
        pauseIcon.classList.toggle('hidden', !isPlaying);
        playPauseBtn.disabled = !currentStation;

        // Управление видимостью обложки и текста-заглушки
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

        // Обновление подсветки в списке станций
        stationCards.forEach(card => {
            const isCurrent = card.dataset.name === currentStation?.name;
            card.classList.toggle('playing', isCurrent);
        });
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

    addListener(volumeSlider, 'input', () => {
        audioElement.volume = volumeSlider.value;
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
    addListener(audioElement, 'error', () => {
        playerStationName.textContent = "Ошибка потока";
        currentStation = null;
        updatePlayerUI();
    });

    // --- Первоначальный запуск ---
    createStationCards();
    updatePlayerUI(); // Вызываем для установки начального состояния плеера
}

// --- Очистка ресурсов при выходе из приложения ---
export function cleanup() {
    if (audioElement) {
        audioElement.pause();
        audioElement.src = ''; // Прерываем загрузку
    }
    // Удаляем все добавленные обработчики
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = []; // Очищаем массив
    currentStation = null;
}
