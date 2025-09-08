// 40js/apps/radio.js
import { radioStations } from '../radioStationsData.js';

// Переменные модуля, доступные во всех функциях
let audioPlayer;
let currentStation = null;
// === НОВОЕ: Переменная для хранения ссылки на контейнер плеера ===
let playerContainerElement = null;

/**
 * Updates the browser's media session to show info in OS-level UI.
 */
function updateMediaSession() {
    // ... (код этой функции остается без изменений)
    if (!('mediaSession' in navigator) || !currentStation) {
        return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: 'Интернет-радио',
        album: 'Mini Apps Radio',
        artwork: [
            { src: currentStation.logoUrl || '', type: 'image/jpeg' },
        ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
        if (audioPlayer && audioPlayer.paused) {
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            audioPlayer.play().then(() => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
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

// === ИЗМЕНЕНИЕ №1: HTML плеера вынесен в отдельную константу ===
// Он больше не является частью getHtml()
const playerHtml = `
    <div id="fixed-player-container" class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-xl hidden">
        <div class="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto w-full">
            <div id="current-station-info" class="flex items-center mb-4 md:mb-0 min-h-[4rem] text-center md:text-left flex-grow">
                <div id="station-logo-container" class="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-white/20 dark:border-gray-800/20 shadow-lg flex-shrink-0">
                    <div id="logo-placeholder" class="w-full h-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300">Нет лого</div>
                </div>
                <div class="flex flex-col items-start"><p class="text-sm font-light text-gray-500 dark:text-gray-400">Сейчас играет:</p><p id="station-name-display" class="text-xl font-bold mt-1 drop-shadow-md text-gray-900 dark:text-gray-100">Выберите станцию</p></div>
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


export function getHtml() {
    // === ИЗМЕНЕНИЕ №2: HTML-код теперь содержит только контент страницы радио ===
    // Плеер удален из этой разметки. Добавлен id для управления padding'ом.
    return `
        <div id="radio-app-container" class="radio-container p-4">
            <div class="mb-4">
                <input id="radio-search-input" type="text" placeholder="Поиск станций..." class="w-full p-3 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div id="radio-stations" class="grid grid-cols-2 sm:grid-cols-3 gap-6"></div>
        </div>
    `;
}

export function init() {
    // === ИЗМЕНЕНИЕ №3: Динамическое добавление плеера в DOM ===
    // Плеер добавляется в конец <body> при инициализации модуля.
    document.body.insertAdjacentHTML('beforeend', playerHtml);
    
    // Теперь, когда плеер в DOM, мы можем получить ссылки на все его элементы.
    playerContainerElement = document.getElementById('fixed-player-container');
    const radioStationsContainer = document.getElementById('radio-stations');
    audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const stationNameDisplay = document.getElementById('station-name-display');
    const stationLogoContainer = document.getElementById('station-logo-container');
    const volumeSlider = document.getElementById('volume-slider');
    const searchInput = document.getElementById('radio-search-input');
    const qualityBtns = document.querySelectorAll('.quality-btn');

    let currentQuality = 'med', playAttemptId = 0;
    const stationCards = [];
    const savedQuality = localStorage.getItem('radioQuality');
    if (savedQuality && ['low', 'med', 'hi'].includes(savedQuality)) { currentQuality = savedQuality; }
    
    function updateQualityUI() { /* ... без изменений ... */ }
    
    function createStationButtons() { /* ... без изменений ... */ }
    
    function playCurrentStation() { /* ... без изменений ... */ }

    function selectStation(station, buttonElement) {
        document.querySelectorAll('#radio-stations button').forEach(btn => btn.classList.remove('card-active'));
        if (buttonElement) buttonElement.classList.add('card-active');
        currentStation = station;
        stationNameDisplay.textContent = currentStation.name;
        stationLogoContainer.innerHTML = ''; 

        if (currentStation.logoUrl) {
            const img = document.createElement('img');
            img.src = currentStation.logoUrl;
            img.alt = `${currentStation.name} logo`;
            img.className = 'w-16 h-16 rounded-full object-cover';
            img.onerror = () => { /* ... */ };
            stationLogoContainer.appendChild(img);
        } else {
            const fallbackIcon = document.createElement('div');
            // ...
            stationLogoContainer.appendChild(fallbackIcon);
        }

        // === ИЗМЕНЕНИЕ №4: Показываем плеер и добавляем отступ для контента ===
        // Показываем плеер
        playerContainerElement.classList.remove('hidden');
        // Добавляем padding-bottom к основному контейнеру, чтобы его контент
        // не перекрывался плеером.
        const radioAppContainer = document.getElementById('radio-app-container');
        if (radioAppContainer) {
            radioAppContainer.style.paddingBottom = `${playerContainerElement.offsetHeight}px`;
        }

        playCurrentStation();
    }

    // Все обработчики событий (playPauseBtn, audioPlayer, volumeSlider и т.д.) остаются без изменений
    // ...

    createStationButtons();
    updateQualityUI();
    audioPlayer.volume = 1.0;
    playPauseBtn.disabled = true;
}

export function cleanup() {
    // === ИЗМЕНЕНИЕ №5: Полное удаление плеера и сброс отступов ===

    // Сбрасываем padding у контейнера радио
    const radioAppContainer = document.getElementById('radio-app-container');
    if (radioAppContainer) {
        radioAppContainer.style.paddingBottom = '0';
    }

    // Останавливаем воспроизведение и очищаем ресурсы плеера
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
        audioPlayer = null;
    }

    // Находим и полностью удаляем элемент плеера из DOM
    if (playerContainerElement) {
        playerContainerElement.remove();
        playerContainerElement = null;
    }
    
    // Очищаем медиа-сессию
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
    }
}
