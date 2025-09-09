// js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

// --- Глобальные переменные модуля для управления состоянием и очистки ---
let audioCtx, analyser, sourceNode;
let visualizerAnimationId;
let stateUpdateListener;
let qualityChangeListeners = [];

// --- HTML-структура приложения ---
export function getHtml() {
    return `
        <style>
            /* --- Общие стили для плеера --- */
            .radio-player-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
                background: linear-gradient(145deg, #eef2f5, #ffffff);
                border-radius: 1.5rem;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                margin-bottom: 1.5rem;
            }
            .dark .radio-player-container {
                background: linear-gradient(145deg, #2c3e50, #1a222c);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
            }

            /* --- Стили для обложки и визуализатора --- */
            #player-artwork {
                width: 160px;
                height: 160px;
                border-radius: 50%;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                object-fit: cover;
                border: 4px solid white;
            }
            .dark #player-artwork {
                border-color: #374151; /* slate-700 */
            }
            #visualizer-canvas {
                width: 100%;
                height: 50px;
                margin-top: -10px;
            }

            /* --- Стили для элементов управления --- */
            #player-controls { display: flex; align-items: center; gap: 1rem; }
            #volume-slider { width: 100px; }
            
            /* --- Стили для карточек станций --- */
            .station-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                position: relative;
                overflow: hidden;
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
            
            /* --- Оверлей с кнопкой Play на карточке --- */
            .station-card .play-overlay {
                position: absolute;
                inset: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            .station-card:hover .play-overlay {
                opacity: 1;
            }
            .station-card.playing .play-overlay {
                opacity: 1; /* Показываем иконку паузы, если станция играет */
            }
        </style>

        <div class="radio-container p-2 md:p-4 space-y-4">
            <!-- Секция плеера -->
            <div id="radio-player-container" class="radio-player-container">
                <img id="player-artwork" src="img/radio.svg" alt="Обложка станции">
                <h3 id="player-station-name" class="text-xl font-bold mt-2">Выберите станцию</h3>
                <canvas id="visualizer-canvas"></canvas>
                <div id="player-controls" class="w-full max-w-sm">
                    <button id="play-pause-btn" class="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg">
                        <svg id="play-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 15.132A1.25 1.25 0 005.25 14.15V5.85a1.25 1.25 0 00-2.13-1.01l-.002.002L2.01 5.37a1.25 1.25 0 000 2.02l.002.002 1.108.623A1.25 1.25 0 004.018 9v6.132zM15.982 4.868a1.25 1.25 0 00-1.11-2.02l-1.108.622a1.25 1.25 0 00-.002 2.02l.002.002 1.108.623a1.25 1.25 0 001.11.125V4.868zM8.018 15.132A1.25 1.25 0 009.25 14.15V5.85a1.25 1.25 0 00-2.13-1.01l-.002.002-1.108.622a1.25 1.25 0 000 2.02l.002.002 1.108.623A1.25 1.25 0 008.018 9v6.132z"></path></svg>
                        <svg id="pause-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path></svg>
                    </button>
                    <input id="volume-slider" type="range" min="0" max="1" step="0.01" value="1" class="w-full">
                    <select id="quality-select" class="p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="hi">Высокое</option>
                        <option value="med">Среднее</option>
                        <option value="low">Низкое</option>
                    </select>
                </div>
            </div>

            <!-- Поиск и список станций -->
            <div class="relative">
                <input id="radio-search-input" type="text" placeholder="Поиск станций..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div id="radio-stations-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
    `;
}

// --- Функции инициализации и управления ---
export function init() {
    const stationsGrid = document.getElementById('radio-stations-grid');
    const searchInput = document.getElementById('radio-search-input');
    const stationCards = [];
    
    // Элементы плеера
    const playerContainer = document.getElementById('radio-player-container');
    const playerArtwork = document.getElementById('player-artwork');
    const playerStationName = document.getElementById('player-station-name');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const qualitySelect = document.getElementById('quality-select');
    const canvas = document.getElementById('visualizer-canvas');
    const canvasCtx = canvas.getContext('2d');

    let currentStation = null;
    let isPlaying = false;

    // --- Логика визуализатора ---
    function setupVisualizer(audioElement) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (sourceNode) sourceNode.disconnect();

        sourceNode = audioCtx.createMediaElementSource(audioElement);
        analyser = audioCtx.createAnalyser();
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!isPlaying) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            visualizerAnimationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2;
            let barHeight;
            let x = 0;
            const isDark = document.documentElement.classList.contains('dark');
            const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, isDark ? '#38bdf8' : '#3b82f6');
            gradient.addColorStop(1, isDark ? '#a78bfa' : '#8b5cf6');

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2.5;
                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        draw();
    }
    
    // --- Создание карточек ---
    function createStationCards() {
        stationsGrid.innerHTML = '';
        stationCards.length = 0;
        radioStations.forEach((station) => {
            const card = document.createElement('button');
            card.className = 'station-card group flex flex-col items-center p-3 rounded-xl focus:outline-none';
            card.dataset.name = station.name;

            card.innerHTML = `
                <img src="${station.logoUrl || 'img/radio.svg'}" alt="${station.name}" class="w-24 h-24 object-cover rounded-lg shadow-md mb-2" onerror="this.onerror=null;this.src='img/radio.svg';">
                <span class="text-center text-sm font-semibold h-10 flex items-center">${station.name}</span>
                <div class="play-overlay">
                    <svg class="play-icon w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                    <svg class="pause-icon hidden w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"></path></svg>
                </div>
            `;
            
            card.addEventListener('click', () => {
                const quality = qualitySelect.value;
                const stationWithQuality = { ...station, quality };
                document.dispatchEvent(new CustomEvent('playRadioStation', { detail: stationWithQuality }));
            });

            stationsGrid.appendChild(card);
            stationCards.push(card);
        });
    }

    // --- Управление UI ---
    function updateUI(state) {
        currentStation = state.station;
        isPlaying = state.isPlaying;

        // Обновляем главный плеер
        if (currentStation) {
            playerArtwork.src = currentStation.logoUrl || 'img/radio.svg';
            playerStationName.textContent = currentStation.name;
            qualitySelect.value = state.quality || 'hi';
        }
        playIcon.classList.toggle('hidden', isPlaying);
        pauseIcon.classList.toggle('hidden', !isPlaying);

        // Обновляем карточки
        stationCards.forEach(card => {
            const isCurrent = card.dataset.name === currentStation?.name;
            card.classList.toggle('playing', isCurrent && isPlaying);
            card.querySelector('.play-icon').classList.toggle('hidden', isCurrent && isPlaying);
            card.querySelector('.pause-icon').classList.toggle('hidden', !(isCurrent && isPlaying));
        });

        // Запускаем/останавливаем визуализатор
        if (isPlaying && state.audioElement) {
            setupVisualizer(state.audioElement);
        } else {
            cancelAnimationFrame(visualizerAnimationId);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // --- Слушатели событий ---
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        stationCards.forEach(card => {
            card.style.display = card.dataset.name.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
        });
    });

    playPauseBtn.addEventListener('click', () => {
        if (currentStation) {
            document.dispatchEvent(new CustomEvent('playRadioStation', { detail: { ...currentStation, quality: qualitySelect.value } }));
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        document.dispatchEvent(new CustomEvent('setRadioVolume', { detail: { volume: e.target.value } }));
    });
    
    // Удаляем старые слушатели, если они есть
    qualityChangeListeners.forEach(listener => qualitySelect.removeEventListener('change', listener));
    qualityChangeListeners = [];

    // Создаем новый слушатель и сохраняем его
    const newQualityListener = () => {
        if (currentStation && isPlaying) {
             document.dispatchEvent(new CustomEvent('playRadioStation', { detail: { ...currentStation, quality: qualitySelect.value } }));
        }
    };
    qualitySelect.addEventListener('change', newQualityListener);
    qualityChangeListeners.push(newQualityListener);

    stateUpdateListener = (e) => updateUI(e.detail);
    document.addEventListener('radioPlayerStateChanged', stateUpdateListener);
    
    // --- Инициализация ---
    createStationCards();
    document.dispatchEvent(new Event('requestRadioPlayerState'));
}

// --- Очистка ресурсов ---
export function cleanup() {
    if (stateUpdateListener) {
        document.removeEventListener('radioPlayerStateChanged', stateUpdateListener);
        stateUpdateListener = null;
    }
    if (visualizerAnimationId) {
        cancelAnimationFrame(visualizerAnimationId);
        visualizerAnimationId = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().then(() => {
            audioCtx = null;
            sourceNode = null;
            analyser = null;
        });
    }
}
