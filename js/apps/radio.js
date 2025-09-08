// js/apps/radio.js
import { radioStations } from '../radioStationsData.js'; 

let audioPlayer; 
let currentStation = null;

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
            audioPlayer.play();
            document.getElementById('play-icon').classList.add('hidden');
            document.getElementById('pause-icon').classList.remove('hidden');
            navigator.mediaSession.playbackState = 'playing';
        }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        if (audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
            document.getElementById('play-icon').classList.remove('hidden');
            document.getElementById('pause-icon').classList.add('hidden');
            navigator.mediaSession.playbackState = 'paused';
        }
    });
}

export function getHtml() {
    return `
        <!-- Этот контейнер будет прокручиваться -->
        <div id="radio-content-wrapper" class="p-4 overflow-y-auto" style="height: 100%;">
            <div class="mb-4">
                <input id="radio-search-input" type="text" placeholder="Поиск станций..." class="w-full p-3 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div id="radio-stations" class="grid grid-cols-2 sm:grid-cols-3 gap-6"></div>
        </div>
        
        <!-- Плеер находится СНАРУЖИ прокручиваемого контейнера -->
        <div id="fixed-player-container" class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-xl hidden">
            <div class="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto w-full">
                <div id="current-station-info" class="flex items-center mb-4 md:mb-0 min-h-[4rem] text-center md:text-left flex-grow">
                    <div id="station-logo-container" class="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-white/20 dark:border-gray-800/20 shadow-lg flex-shrink-0"></div>
                    <div class="flex flex-col items-start">
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400">Сейчас играет:</p>
                        <p id="station-name-display" class="text-xl font-bold mt-1 drop-shadow-md text-gray-900 dark:text-gray-100">Выберите станцию</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 w-full md:w-auto justify-center">
                    <button id="play-pause-btn" class="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg id="play-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="pause-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <div class="flex items-center space-x-2">
                        <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.003A.75.75 0 0110 3v14a.75.75 0 01-1.67-.504l-4.226-4.577H3a.75.75 0 01-.75-.75v-4.346a.75.75 0 01.75-.75h1.597L8.33 3.504A.75.75 0 019.383 3.003z" clip-rule="evenodd" /></svg>
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

export function init(appContentContainer) {
    const radioStationsContainer = appContentContainer.querySelector('#radio-stations');
    audioPlayer = appContentContainer.querySelector('#audio-player');
    const playPauseBtn = appContentContainer.querySelector('#play-pause-btn');
    const playIcon = appContentContainer.querySelector('#play-icon');
    const pauseIcon = appContentContainer.querySelector('#pause-icon');
    const stationNameDisplay = appContentContainer.querySelector('#station-name-display');
    const stationLogoContainer = appContentContainer.querySelector('#station-logo-container');
    const volumeSlider = appContentContainer.querySelector('#volume-slider');
    const fixedPlayerContainer = appContentContainer.querySelector('#fixed-player-container');
    const searchInput = appContentContainer.querySelector('#radio-search-input');
    const qualityBtns = appContentContainer.querySelectorAll('.quality-btn');
    const contentWrapper = appContentContainer.querySelector('#radio-content-wrapper');

    let currentQuality = 'med', playAttemptId = 0;
    const stationCards = [];
    const savedQuality = localStorage.getItem('radioQuality') || 'med';
    currentQuality = savedQuality;

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
        radioStations.forEach((station) => {
            const button = document.createElement('button');
            button.className = 'station-card flex flex-col items-center justify-between p-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 bg-white dark:bg-gray-800';
            button.dataset.name = station.name;
            const logoHtml = station.logoUrl 
                ? `<img src="${station.logoUrl}" alt="${station.name}" class="w-20 h-20 rounded-full object-cover mb-2" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="w-20 h-20 rounded-full hidden items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 mb-2">Нет лого</div>`
                : `<div class="w-20 h-20 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 mb-2">Нет лого</div>`;
            button.innerHTML = `${logoHtml}<span class="text-center h-12 flex items-center">${station.name}</span>`;
            button.addEventListener('click', () => selectStation(station, button));
            radioStationsContainer.appendChild(button);
            stationCards.push(button);
        });
    }

    function playCurrentStation() {
        if (!currentStation) return;
        const attemptId = ++playAttemptId;
        audioPlayer.src = currentStation.streams[currentQuality];
        playPauseBtn.disabled = true;

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (attemptId === playAttemptId) {
                    playPauseBtn.disabled = false;
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                    updateMediaSession();
                }
            }).catch(error => {
                if (attemptId === playAttemptId) console.error("Audio playback error:", error);
            });
        }
    }

    function selectStation(station, buttonElement) {
        document.querySelectorAll('.station-card').forEach(btn => btn.classList.remove('ring-2', 'ring-blue-500'));
        buttonElement.classList.add('ring-2', 'ring-blue-500');
        
        currentStation = station;
        stationNameDisplay.textContent = currentStation.name;
        stationLogoContainer.innerHTML = `<img src="${currentStation.logoUrl}" alt="${currentStation.name}" class="w-full h-full object-cover" onerror="this.style.display='none'">`;
        
        fixedPlayerContainer.classList.remove('hidden');
        
        // Устанавливаем padding-bottom для обертки контента, чтобы он не залезал под плеер
        if (contentWrapper) {
            contentWrapper.style.paddingBottom = `${fixedPlayerContainer.offsetHeight}px`;
        }
        
        playCurrentStation();
    }

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            audioPlayer.pause();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    });

    volumeSlider.addEventListener('input', (e) => audioPlayer.volume = e.target.value / 100);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        stationCards.forEach(card => {
            card.style.display = card.dataset.name.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
        });
    });

    qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentQuality = btn.dataset.quality;
            localStorage.setItem('radioQuality', currentQuality);
            updateQualityUI();
            if (currentStation && !audioPlayer.paused) {
                playCurrentStation();
            }
        });
    });

    createStationButtons();
    updateQualityUI();
    playPauseBtn.disabled = true;
}

export function cleanup() {
    // Сбрасываем padding-bottom у обертки при выходе
    const contentWrapper = document.getElementById('radio-content-wrapper');
    if (contentWrapper) {
        contentWrapper.style.paddingBottom = '0px';
    }

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
    }
}
