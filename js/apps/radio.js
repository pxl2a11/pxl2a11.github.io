let audioPlayer; // Module-level variable
let currentStation = null; // Module-level variable for the current station
let trackInfoInterval = null; // Variable for the track info update interval

/**
 * Fetches and updates the currently playing track information.
 */
async function updateTrackInfo() {
    if (!currentStation || !audioPlayer || audioPlayer.paused) {
        return;
    }

    try {
        const response = await fetch('https://list.volna.top/radio.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const currentStreamUrl = audioPlayer.src;
        const stationData = data.find(station => station.link === currentStreamUrl);

        const trackInfoDisplay = document.getElementById('track-info-display');
        let track = { artist: 'Интернет-радио', title: currentStation.name };

        if (stationData && stationData.title && stationData.title !== ' - ') {
            if (trackInfoDisplay) trackInfoDisplay.textContent = stationData.title;
            const parts = stationData.title.split(' - ');
            track.artist = parts[0].trim();
            track.title = parts.slice(1).join(' - ').trim();
        } else {
            if (trackInfoDisplay) trackInfoDisplay.textContent = 'Название трека не доступно';
        }
        updateMediaSession(track);

    } catch (error) {
        console.error("Не удалось получить информацию о треке:", error);
        const trackInfoDisplay = document.getElementById('track-info-display');
        if(trackInfoDisplay) trackInfoDisplay.textContent = '';
        updateMediaSession(); // Revert to default
    }
}


/**
 * Updates the browser's media session to show info in OS-level UI.
 * @param {object} track - Object containing track details.
 * @param {string} track.title - The title of the song.
 * @param {string} track.artist - The artist of the song.
 */
function updateMediaSession(track = {}) {
    if (!('mediaSession' in navigator) || !currentStation) {
        return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || currentStation.name,
        artist: track.artist || 'Интернет-радио',
        album: 'Mini Apps Radio',
        artwork: [
            { src: currentStation.logoUrl || '', type: 'image/jpeg' },
        ]
    });

    // Action handler for the "Play" button in the media notification
    navigator.mediaSession.setActionHandler('play', () => {
        if (audioPlayer && audioPlayer.paused) {
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            audioPlayer.play().then(() => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                navigator.mediaSession.playbackState = 'playing';
                if (trackInfoInterval) clearInterval(trackInfoInterval);
                updateTrackInfo();
                trackInfoInterval = setInterval(updateTrackInfo, 7000); // Start polling for track info
            }).catch(e => console.error("Media Session resume failed", e));
        }
    });

    // Action handler for the "Pause" button in the media notification
    navigator.mediaSession.setActionHandler('pause', () => {
        if (audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            if (playIcon && pauseIcon) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                navigator.mediaSession.playbackState = 'paused';
                if (trackInfoInterval) clearInterval(trackInfoInterval); // Stop polling for track info
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
                <div id="current-station-info" class="flex items-center mb-4 md:mb-0 min-h-[4rem] text-center md:text-left flex-grow">
                    <div id="station-logo-container" class="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-white/20 dark:border-gray-800/20 shadow-lg flex-shrink-0">
                        <div id="logo-placeholder" class="w-full h-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300">Нет лого</div>
                    </div>
                    <div class="flex flex-col items-center md:items-start">
                        <p id="station-name-display" class="text-xl font-bold drop-shadow-md text-gray-900 dark:text-gray-100 truncate">Выберите станцию</p>
                        <p id="track-info-display" class="text-sm text-gray-600 dark:text-gray-300 mt-1 h-5"></p>
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

export function init() {
    const radioStations = [
        // --- Старые станции ---
        { name: "Маруся FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf176d9e.jpg", streams: { hi: "https://stream.pcradio.ru/marusya_fm-hi", med: "https://stream.pcradio.ru/marusya_fm-med", low: "https://stream.pcradio.ru/marusya_fm-low" }}, 
        { name: "Record Russian Hits", logoUrl: "https://pcradio.ru/images/stations/61b09ca2ead8f.jpg", streams: { hi: "https://stream.pcradio.ru/record_rushits-hi", med: "https://stream.pcradio.ru/record_rushits-med", low: "https://stream.pcradio.ru/record_rushits-low" }}, 
        { name: "Новое Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3eb91b608.jpg", streams: { hi: "https://stream.pcradio.ru/novoe_radio98_4-hi", med: "https://stream.pcradio.ru/novoe_radio98_4-med", low: "https://stream.pcradio.ru/novoe_radio98_4-low" }},
        { name: "Дорожное Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3ec011dd9.jpg", streams: { hi: "https://stream.pcradio.ru/rus_rodnye00-hi", med: "https://stream.pcradio.ru/rus_rodnye00-med", low: "https://stream.pcradio.ru/rus_rodnye00-low" }},
        { name: "Relax FM (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ebda8c01.jpg", streams: { hi: "https://stream.pcradio.ru/relax_fm_ru-hi", med: "https://stream.pcradio.ru/relax_fm_ru-med", low: "https://stream.pcradio.ru/relax_fm_ru-low" }},
        { name: "DFM 101.2 (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ec00ae9b.jpg", streams: { hi: "https://stream.pcradio.ru/dfm_moscow-hi", med: "https://stream.pcradio.ru/dfm_moscow-med", low: "https://stream.pcradio.ru/dfm_moscow-low" }},
        { name: "ТНТ Music Radio", logoUrl: "https://pcradio.ru/images/stations/61b09c403d308.jpg", streams: { hi: "https://stream.pcradio.ru/rad_rutntmsc-hi", med: "https://stream.pcradio.ru/rad_rutntmsc-med", low: "https://stream.pcradio.ru/rad_rutntmsc-low" }}, 
        { name: "Соль FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf2dc6d7.jpg", streams: { hi: "https://stream.pcradio.ru/sol_fm-hi", med: "https://stream.pcradio.ru/sol_fm-med", low: "https://stream.pcradio.ru/sol_fm-low" }}, 
        { name: "Maximum", logoUrl: "https://pcradio.ru/images/stations/62ea3ebe46311.jpg", streams: { hi: "https://stream.pcradio.ru/fm_maximum-hi", med: "https://stream.pcradio.ru/fm_maximum-med", low: "https://stream.pcradio.ru/fm_maximum-low" }},
        
        // --- НОВЫЕ СТАНЦИИ ИЗ ФАЙЛА ---
        { name: "РУССКАЯ ВОЛНА", logoUrl: "https://amgradio.ru/img/RuWavebg.svg", streams: { hi: "http://ru1.amgradio.ru/RuWave48", med: "http://ru1.amgradio.ru/RuWave48", low: "http://ru1.amgradio.ru/RuWave48" } },
        { name: "РЕТРО ХИТ", logoUrl: "https://amgradio.ru/img/retrohit.svg", streams: { hi: "http://retro.amgradio.ru/Retro", med: "http://retro.amgradio.ru/Retro", low: "http://retro.amgradio.ru/Retro" } },
        { name: "РУССКИЙ РОК", logoUrl: "https://amgradio.ru/img/rusrock.svg", streams: { hi: "http://rock.amgradio.ru/RusRock", med: "http://rock.amgradio.ru/RusRock", low: "http://rock.amgradio.ru/RusRock" } },
        { name: "ХАЙП FM", logoUrl: "https://amgradio.ru/img/hypefm.svg", streams: { hi: "http://hfm.amgradio.ru/HypeFM", med: "http://hfm.amgradio.ru/HypeFM", low: "http://hfm.amgradio.ru/HypeFM" } },
        { name: "REMIX FM", logoUrl: "https://amgradio.ru/img/remix.svg", streams: { hi: "http://rmx.amgradio.ru/RemixFM", med: "http://rmx.amgradio.ru/RemixFM", low: "http://rmx.amgradio.ru/RemixFM" } },
        { name: "DEEP FM", logoUrl: "https://amgradio.ru/img/deepfm.svg", streams: { hi: "http://deep.amgradio.ru/DeepFM", med: "http://deep.amgradio.ru/DeepFM", low: "http://deep.amgradio.ru/DeepFM" } },
        { name: "MEGA RADIO", logoUrl: "https://amgradio.ru/img/megaradio.svg", streams: { hi: "http://mega.amgradio.ru/mega", med: "http://mega.amgradio.ru/mega", low: "http://mega.amgradio.ru/mega" } },
        { name: "RADIO CAFE", logoUrl: "https://amgradio.ru/img/radiocafe.svg", streams: { hi: "http://cafe.amgradio.ru/Cafe", med: "http://cafe.amgradio.ru/Cafe", low: "http://cafe.amgradio.ru/Cafe" } },
        { name: "ХОРОШЕЕ РАДИО", logoUrl: "https://amgradio.ru/img/horoshee.svg", streams: { hi: "http://hr.amgradio.ru/Horoshee", med: "http://hr.amgradio.ru/Horoshee", low: "http://hr.amgradio.ru/Horoshee" } },
        { name: "РУССКОЕ FM", logoUrl: "https://amgradio.ru/img/rufm.svg", streams: { hi: "http://rufm.amgradio.ru/rufm", med: "http://rufm.amgradio.ru/rufm", low: "http://rufm.amgradio.ru/rufm" } },
        { name: "RADIO FRESH", logoUrl: "https://amgradio.ru/img/fresh.svg", streams: { hi: "http://fresh.amgradio.ru/Fresh", med: "http://fresh.amgradio.ru/Fresh", low: "http://fresh.amgradio.ru/Fresh" } },
        { name: "МУРКА FM", logoUrl: "https://amgradio.ru/img/murkafm.svg", streams: { hi: "http://murka.amgradio.ru/MurkaFM", med: "http://murka.amgradio.ru/MurkaFM", low: "http://murka.amgradio.ru/MurkaFM" } },
        { name: "РОДНЫЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rodnyepesni.svg", streams: { hi: "http://rodpesni.amgradio.ru/rp", med: "http://rodpesni.amgradio.ru/rp", low: "http://rodpesni.amgradio.ru/rp" } },
        { name: "РУССКИЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rusongswhite.svg", streams: { hi: "http://rusongs.amgradio.ru/rusongs", med: "http://rusongs.amgradio.ru/rusongs", low: "http://rusongs.amgradio.ru/rusongs" } },
        { name: "DJIN FM", logoUrl: "https://amgradio.ru/img/djin.svg", streams: { hi: "http://djin.amgradio.ru/djin", med: "http://djin.amgradio.ru/djin", low: "http://djin.amgradio.ru/djin" } },
        { name: "ШТОРМ FM", logoUrl: "https://amgradio.ru/img/shtormfm.svg", streams: { hi: "http://shtorm.amgradio.ru/shtormfm", med: "http://shtorm.amgradio.ru/shtormfm", low: "http://shtorm.amgradio.ru/shtormfm" } },
        { name: "MUSIC BOX RADIO", logoUrl: "https://amgradio.ru/img/musicboxradio.svg", streams: { hi: "http://musicbox.amgradio.ru/musicbox", med: "http://musicbox.amgradio.ru/musicbox", low: "http://musicbox.amgradio.ru/musicbox" } },
        { name: "CHILLA FM", logoUrl: "https://amgradio.ru/img/chillafm.svg", streams: { hi: "http://chilla.amgradio.ru/ChillaFM", med: "http://chilla.amgradio.ru/ChillaFM", low: "http://chilla.amgradio.ru/ChillaFM" } },
        { name: "LITE FM", logoUrl: "https://amgradio.ru/img/litefm.svg", streams: { hi: "http://litefm.amgradio.ru/litefm", med: "http://litefm.amgradio.ru/litefm", low: "http://litefm.amgradio.ru/litefm" } },
        { name: "ДЕТСКИЙ ХИТ", logoUrl: "https://amgradio.ru/img/detifm.svg", streams: { hi: "http://deti.amgradio.ru/Deti", med: "http://deti.amgradio.ru/Deti", low: "http://deti.amgradio.ru/Deti" } },
        { name: "СКАЗКА FM", logoUrl: "https://amgradio.ru/img/skazkafm.svg", streams: { hi: "http://skazka.amgradio.ru/Skazka", med: "http://skazka.amgradio.ru/Skazka", low: "http://skazka.amgradio.ru/Skazka" } },
        { name: "УМНОЕ РАДИО", logoUrl: "https://amgradio.ru/img/umnoe.svg", streams: { hi: "http://umnoe.amgradio.ru/Umnoe", med: "http://umnoe.amgradio.ru/Umnoe", low: "http://umnoe.amgradio.ru/Umnoe" } },
        { name: "LATINO RADIO", logoUrl: "https://amgradio.ru/img/latino.svg", streams: { hi: "https://latino.amgradio.ru/latino", med: "https://latino.amgradio.ru/latino", low: "https://latino.amgradio.ru/latino" } },
        { name: "РАДИО МЕЧТА", logoUrl: "https://amgradio.ru/img/mechta.svg", streams: { hi: "https://mechta.amgradio.ru/mechta", med: "https://mechta.amgradio.ru/mechta", low: "https://mechta.amgradio.ru/mechta" } },
        { name: "RADIO FUNK", logoUrl: "https://amgradio.ru/img/radiofunk.svg", streams: { hi: "http://funk.amgradio.ru/Funk", med: "http://funk.amgradio.ru/Funk", low: "http://funk.amgradio.ru/Funk" } },
        { name: "RBS FM", logoUrl: "https://amgradio.ru/img/rbsfm.svg", streams: { hi: "http://rbs.amgradio.ru/rbs", med: "http://rbs.amgradio.ru/rbs", low: "http://rbs.amgradio.ru/rbs" } },
        { name: "MAKKIRUS", logoUrl: "https://amgradio.ru/img/makkirus.svg", streams: { hi: "http://makkirus.amgradio.ru/makkirus", med: "http://makkirus.amgradio.ru/makkirus", low: "http://makkirus.amgradio.ru/makkirus" } },
        { name: "CLASSIC FM", logoUrl: "https://amgradio.ru/img/classicfm.svg", streams: { hi: "http://classic.amgradio.ru/ClassicFM", med: "http://classic.amgradio.ru/ClassicFM", low: "http://classic.amgradio.ru/ClassicFM" } },
        { name: "РАДИО ЗВУКИ ПРИРОДЫ", logoUrl: "https://amgradio.ru/img/zvuki.svg", streams: { hi: "http://zvuki.amgradio.ru/Zvuki", med: "http://zvuki.amgradio.ru/Zvuki", low: "http://zvuki.amgradio.ru/Zvuki" } }
    ];

    const radioStationsContainer = document.getElementById('radio-stations');
    audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn'), playIcon = document.getElementById('play-icon'), pauseIcon = document.getElementById('pause-icon'), stationNameDisplay = document.getElementById('station-name-display'), stationLogoContainer = document.getElementById('station-logo-container'), volumeSlider = document.getElementById('volume-slider'), fixedPlayerContainer = document.getElementById('fixed-player-container'), searchInput = document.getElementById('radio-search-input'), qualityBtns = document.querySelectorAll('.quality-btn');
    let currentQuality = 'med', playAttemptId = 0;
    const stationCards = [];
    const savedQuality = localStorage.getItem('radioQuality');
    if (savedQuality && ['low', 'med', 'hi'].includes(savedQuality)) { currentQuality = savedQuality; }
    function updateQualityUI() { qualityBtns.forEach(btn => { btn.classList.toggle('active', btn.dataset.quality === currentQuality); });}
    function createStationButtons() { radioStationsContainer.innerHTML = ''; stationCards.length = 0; radioStations.forEach((station, index) => { const button = document.createElement('button'); button.className = 'station-card flex flex-col items-center justify-between p-4 rounded-xl font-semibold text-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'; button.dataset.index = index; button.dataset.name = station.name; if (station.logoUrl) { const img = document.createElement('img'); img.src = station.logoUrl; img.alt = `${station.name} logo`; img.className = 'w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors duration-200'; img.onerror = () => { const fallbackIcon = document.createElement('div'); fallbackIcon.className = 'w-20 h-20 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'; fallbackIcon.textContent = 'Нет лого'; img.replaceWith(fallbackIcon); }; button.appendChild(img); } const stationNameContainer = document.createElement('div'); stationNameContainer.className = "h-12 flex justify-center items-start w-full"; const stationName = document.createElement('span'); stationName.textContent = station.name; stationName.className = 'text-center'; stationNameContainer.appendChild(stationName); button.appendChild(stationNameContainer); button.addEventListener('click', () => selectStation(station, button)); radioStationsContainer.appendChild(button); stationCards.push(button); }); }
    function playCurrentStation() { if (!currentStation) return; const attemptId = ++playAttemptId; audioPlayer.src = currentStation.streams[currentQuality]; playPauseBtn.disabled = true; stationNameDisplay.textContent = currentStation.name; stationNameDisplay.classList.remove('text-red-500'); const playPromise = audioPlayer.play(); if (playPromise !== undefined) { playPromise.then(() => { if (attemptId === playAttemptId) { playPauseBtn.disabled = false; playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'playing'; } updateMediaSession(); if (trackInfoInterval) clearInterval(trackInfoInterval); updateTrackInfo(); trackInfoInterval = setInterval(updateTrackInfo, 7000); } }).catch(error => { if (attemptId === playAttemptId) { console.error("Audio playback error:", error); playPauseBtn.disabled = true; playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'paused'; } } }); } }
    function selectStation(station, buttonElement) { document.querySelectorAll('#radio-stations button').forEach(btn => btn.classList.remove('card-active')); if (buttonElement) buttonElement.classList.add('card-active'); currentStation = station; stationNameDisplay.textContent = currentStation.name; const trackInfoDisplay = document.getElementById('track-info-display'); if(trackInfoDisplay) trackInfoDisplay.textContent = 'Загрузка...'; stationLogoContainer.innerHTML = ''; if (currentStation.logoUrl) { const img = document.createElement('img'); img.src = currentStation.logoUrl; img.alt = `${currentStation.name} logo`; img.className = 'w-16 h-16 rounded-full object-cover'; img.onerror = () => { const fallbackIcon = document.createElement('div'); fallbackIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'; fallbackIcon.textContent = 'Нет лого'; stationLogoContainer.appendChild(fallbackIcon); }; stationLogoContainer.appendChild(img); } else { const fallbackIcon = document.createElement('div'); fallbackIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'; fallbackIcon.textContent = 'Нет лого'; stationLogoContainer.appendChild(fallbackIcon); } fixedPlayerContainer.classList.remove('hidden'); playCurrentStation(); }
    playPauseBtn.addEventListener('click', () => { if (audioPlayer.paused) { const playPromise = audioPlayer.play(); if (playPromise !== undefined) { playPromise.then(() => { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'playing'; } if (trackInfoInterval) clearInterval(trackInfoInterval); updateTrackInfo(); trackInfoInterval = setInterval(updateTrackInfo, 7000); }).catch(e => console.error("UI resume failed", e)); } } else { audioPlayer.pause(); playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'paused'; } if (trackInfoInterval) clearInterval(trackInfoInterval); } });
    audioPlayer.addEventListener('error', (e) => { console.error('Ошибка загрузки или воспроизведения аудио-потока:', e); playPauseBtn.disabled = true; playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); stationNameDisplay.classList.remove('text-red-500'); });
    volumeSlider.addEventListener('input', (e) => { audioPlayer.volume = e.target.value / 100; }); 
    searchInput.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase(); stationCards.forEach(card => { const stationName = card.dataset.name.toLowerCase(); card.style.display = stationName.includes(searchTerm) ? 'flex' : 'none'; }); });
    qualityBtns.forEach(btn => { btn.addEventListener('click', () => { const newQuality = btn.dataset.quality; if(newQuality === currentQuality) return; const wasPlaying = !audioPlayer.paused && audioPlayer.currentTime > 0; currentQuality = newQuality; localStorage.setItem('radioQuality', currentQuality); updateQualityUI(); if(currentStation && wasPlaying){ playCurrentStation(); } else if (currentStation) { audioPlayer.src = currentStation.streams[currentQuality]; } }); });
    createStationButtons(); 
    updateQualityUI();
    audioPlayer.volume = 1.0; 
    playPauseBtn.disabled = true;
}

export function cleanup() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
        audioPlayer = null;
    }
    if (trackInfoInterval) {
        clearInterval(trackInfoInterval);
        trackInfoInterval = null;
    }
    const fixedPlayerContainer = document.getElementById('fixed-player-container');
    if (fixedPlayerContainer) {
        fixedPlayerContainer.classList.add('hidden');
    }
    // Clear the media session when leaving the app
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
    }
}
