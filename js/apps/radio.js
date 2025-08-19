let audioPlayer; // Module-level variable
let currentStation = null; // Module-level variable for the current station

/**
 * Updates the browser's media session to show info in OS-level UI.
 */
function updateMediaSession() {
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

    // Action handler for the "Play" button in the media notification
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

        // --- НОВЫЕ СТАНЦИИ ИЗ ФАЙЛА (с HTTPS) ---
        { name: "РУССКАЯ ВОЛНА", logoUrl: "https://amgradio.ru/img/RuWavebg.svg", streams: { hi: "https://ru1.amgradio.ru/RuWave48", med: "https://ru1.amgradio.ru/RuWave48", low: "https://ru1.amgradio.ru/RuWave48" } },
        { name: "РЕТРО ХИТ", logoUrl: "https://amgradio.ru/img/retrohit.svg", streams: { hi: "https://retro.amgradio.ru/Retro", med: "https://retro.amgradio.ru/Retro", low: "https://retro.amgradio.ru/Retro" } },
        { name: "РУССКИЙ РОК", logoUrl: "https://amgradio.ru/img/rusrock.svg", streams: { hi: "https://rock.amgradio.ru/RusRock", med: "https://rock.amgradio.ru/RusRock", low: "https://rock.amgradio.ru/RusRock" } },
        { name: "ХАЙП FM", logoUrl: "https://amgradio.ru/img/hypefm.svg", streams: { hi: "https://hfm.amgradio.ru/HypeFM", med: "https://hfm.amgradio.ru/HypeFM", low: "https://hfm.amgradio.ru/HypeFM" } },
        { name: "REMIX FM", logoUrl: "https://amgradio.ru/img/remix.svg", streams: { hi: "https://rmx.amgradio.ru/RemixFM", med: "https://rmx.amgradio.ru/RemixFM", low: "https://rmx.amgradio.ru/RemixFM" } },
        { name: "DEEP FM", logoUrl: "https://amgradio.ru/img/deepfm.svg", streams: { hi: "https://deep.amgradio.ru/DeepFM", med: "https://deep.amgradio.ru/DeepFM", low: "https://deep.amgradio.ru/DeepFM" } },
        { name: "MEGA RADIO", logoUrl: "https://amgradio.ru/img/megaradio.svg", streams: { hi: "https://mega.amgradio.ru/mega", med: "https://mega.amgradio.ru/mega", low: "https://mega.amgradio.ru/mega" } },
        { name: "RADIO CAFE", logoUrl: "https://amgradio.ru/img/radiocafe.svg", streams: { hi: "https://cafe.amgradio.ru/Cafe", med: "https://cafe.amgradio.ru/Cafe", low: "https://cafe.amgradio.ru/Cafe" } },
        { name: "ХОРОШЕЕ РАДИО", logoUrl: "https://amgradio.ru/img/horoshee.svg", streams: { hi: "https://hr.amgradio.ru/Horoshee", med: "https://hr.amgradio.ru/Horoshee", low: "https://hr.amgradio.ru/Horoshee" } },
        { name: "РУССКОЕ FM", logoUrl: "https://amgradio.ru/img/rufm.svg", streams: { hi: "https://rufm.amgradio.ru/rufm", med: "https://rufm.amgradio.ru/rufm", low: "https://rufm.amgradio.ru/rufm" } },
        { name: "RADIO FRESH", logoUrl: "https://amgradio.ru/img/fresh.svg", streams: { hi: "https://fresh.amgradio.ru/Fresh", med: "https://fresh.amgradio.ru/Fresh", low: "https://fresh.amgradio.ru/Fresh" } },
        { name: "МУРКА FM", logoUrl: "https://amgradio.ru/img/murkafm.svg", streams: { hi: "https://murka.amgradio.ru/MurkaFM", med: "https://murka.amgradio.ru/MurkaFM", low: "https://murka.amgradio.ru/MurkaFM" } },
        { name: "РОДНЫЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rodnyepesni.svg", streams: { hi: "https://rodpesni.amgradio.ru/rp", med: "https://rodpesni.amgradio.ru/rp", low: "https://rodpesni.amgradio.ru/rp" } },
        { name: "РУССКИЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rusongswhite.svg", streams: { hi: "https://rusongs.amgradio.ru/rusongs", med: "https://rusongs.amgradio.ru/rusongs", low: "https://rusongs.amgradio.ru/rusongs" } },
        { name: "DJIN FM", logoUrl: "https://amgradio.ru/img/djin.svg", streams: { hi: "https://djin.amgradio.ru/djin", med: "https://djin.amgradio.ru/djin", low: "https://djin.amgradio.ru/djin" } },
        { name: "ШТОРМ FM", logoUrl: "https://amgradio.ru/img/shtormfm.svg", streams: { hi: "https://shtorm.amgradio.ru/shtormfm", med: "https://shtorm.amgradio.ru/shtormfm", low: "https://shtorm.amgradio.ru/shtormfm" } },
        { name: "MUSIC BOX RADIO", logoUrl: "https://amgradio.ru/img/musicboxradio.svg", streams: { hi: "https://musicbox.amgradio.ru/musicbox", med: "https://musicbox.amgradio.ru/musicbox", low: "https://musicbox.amgradio.ru/musicbox" } },
        { name: "CHILLA FM", logoUrl: "https://amgradio.ru/img/chillafm.svg", streams: { hi: "https://chilla.amgradio.ru/ChillaFM", med: "https://chilla.amgradio.ru/ChillaFM", low: "https://chilla.amgradio.ru/ChillaFM" } },
        { name: "LITE FM", logoUrl: "https://amgradio.ru/img/litefm.svg", streams: { hi: "https://litefm.amgradio.ru/litefm", med: "https://litefm.amgradio.ru/litefm", low: "https://litefm.amgradio.ru/litefm" } },
        { name: "ДЕТСКИЙ ХИТ", logoUrl: "https://amgradio.ru/img/detifm.svg", streams: { hi: "https://deti.amgradio.ru/Deti", med: "https://deti.amgradio.ru/Deti", low: "https://deti.amgradio.ru/Deti" } },
        { name: "СКАЗКА FM", logoUrl: "https://amgradio.ru/img/skazkafm.svg", streams: { hi: "https://skazka.amgradio.ru/Skazka", med: "https://skazka.amgradio.ru/Skazka", low: "https://skazka.amgradio.ru/Skazka" } },
        { name: "УМНОЕ РАДИО", logoUrl: "https://amgradio.ru/img/umnoe.svg", streams: { hi: "https://umnoe.amgradio.ru/Umnoe", med: "https://umnoe.amgradio.ru/Umnoe", low: "https://umnoe.amgradio.ru/Umnoe" } },
        { name: "LATINO RADIO", logoUrl: "https://amgradio.ru/img/latino.svg", streams: { hi: "https://latino.amgradio.ru/latino", med: "https://latino.amgradio.ru/latino", low: "https://latino.amgradio.ru/latino" } },
        { name: "РАДИО МЕЧТА", logoUrl: "https://amgradio.ru/img/mechta.svg", streams: { hi: "https://mechta.amgradio.ru/mechta", med: "https://mechta.amgradio.ru/mechta", low: "https://mechta.amgradio.ru/mechta" } },
        { name: "RADIO FUNK", logoUrl: "https://amgradio.ru/img/radiofunk.svg", streams: { hi: "https://funk.amgradio.ru/Funk", med: "https://funk.amgradio.ru/Funk", low: "https://funk.amgradio.ru/Funk" } },
        { name: "RBS FM", logoUrl: "https://amgradio.ru/img/rbsfm.svg", streams: { hi: "https://rbs.amgradio.ru/rbs", med: "https://rbs.amgradio.ru/rbs", low: "https://rbs.amgradio.ru/rbs" } },
        { name: "MAKKIRUS", logoUrl: "https://amgradio.ru/img/makkirus.svg", streams: { hi: "https://makkirus.amgradio.ru/makkirus", med: "https://makkirus.amgradio.ru/makkirus", low: "https://makkirus.amgradio.ru/makkirus" } },
        { name: "CLASSIC FM", logoUrl: "https://amgradio.ru/img/classicfm.svg", streams: { hi: "https://classic.amgradio.ru/ClassicFM", med: "https://classic.amgradio.ru/ClassicFM", low: "https://classic.amgradio.ru/ClassicFM" } },
        { name: "РАДИО ЗВУКИ ПРИРОДЫ", logoUrl: "https://amgradio.ru/img/zvuki.svg", streams: { hi: "https://zvuki.amgradio.ru/Zvuki", med: "https://zvuki.amgradio.ru/Zvuki", low: "https://zvuki.amgradio.ru/Zvuki" } }
    {
        name: "Русское Радио Москва",
        logoUrl: "https://radio.pervii.com/im/1/1549717041.jpg",
        streams: {
            hi: "https://rusradio.hostingradio.ru/rusradio96.aacp",
            med: "https://rusradio.hostingradio.ru/rusradio96.aacp",
            low: "https://rusradio.hostingradio.ru/rusradio96.aacp"
        }
    },
    {
        name: "Русские Песни",
        logoUrl: "https://radio.pervii.com/im/3/1537442683.jpg",
        streams: {
            hi: "https://listen.rusongs.ru/ru-mp3-128",
            med: "https://listen.rusongs.ru/ru-mp3-128",
            low: "https://listen.rusongs.ru/ru-mp3-128"
        }
    },
    {
        name: "Monte-Karlo Санкт-Петербург",
        logoUrl: "https://radio.pervii.com/logo/59339.jpg",
        streams: {
            hi: "https://icecast227.ptspb.ru:8104/monte",
            med: "https://icecast227.ptspb.ru:8104/monte",
            low: "https://icecast227.ptspb.ru:8104/monte"
        }
    },
    {
        name: "Monte-Karlo Орел",
        logoUrl: "https://radio.pervii.com/logo/59339.jpg",
        streams: {
            hi: "https://icecast227.ptspb.ru:8443/monte",
            med: "https://icecast227.ptspb.ru:8443/monte",
            low: "https://icecast227.ptspb.ru:8443/monte"
        }
    },
    {
        name: "Радио Дача Волгодонск",
        logoUrl: "https://radio.pervii.com/logo/0909171033.jpg",
        streams: {
            hi: "https://listen.vdfm.ru:8000/dacha",
            med: "https://listen.vdfm.ru:8000/dacha",
            low: "https://listen.vdfm.ru:8000/dacha"
        }
    },
    {
        name: "Пассаж Москва",
        logoUrl: "https://radio.pervii.com/im/5/1537514485.jpg",
        streams: {
            hi: "https://listen.radiopassazh.ru:8005/aac-64",
            med: "https://listen.radiopassazh.ru:8005/aac-64",
            low: "https://listen.radiopassazh.ru:8005/aac-64"
        }
    },
    {
        name: "Радио Континенталь Челябинск",
        logoUrl: "https://radio.pervii.com/logo/1403693894.png",
        streams: {
            hi: "https://stream01.radiocon.ru:8000/live",
            med: "https://stream01.radiocon.ru:8000/live",
            low: "https://stream01.radiocon.ru:8000/live"
        }
    },
    {
        name: "Hit FM Москва",
        logoUrl: "https://radio.pervii.com/im/1/1549776861.jpg",
        streams: {
            hi: "https://hitfm.hostingradio.ru/hitfm96.aacp",
            med: "https://hitfm.hostingradio.ru/hitfm96.aacp",
            low: "https://hitfm.hostingradio.ru/hitfm96.aacp"
        }
    },
    {
        name: "Радио Максимум Москва",
        logoUrl: "https://radio.pervii.com/logo/29024.jpg",
        streams: {
            hi: "https://maximum.hostingradio.ru/maximum96.aacp",
            med: "https://maximum.hostingradio.ru/maximum96.aacp",
            low: "https://maximum.hostingradio.ru/maximum96.aacp"
        }
    },
    {
        name: "Вести FM Москва",
        logoUrl: "https://radio.pervii.com/im/8/1556387358.jpg",
        streams: {
            hi: "https://icecast.vgtrk.cdnvideo.ru/vestifm",
            med: "https://icecast.vgtrk.cdnvideo.ru/vestifm",
            low: "https://icecast.vgtrk.cdnvideo.ru/vestifm"
        }
    },
    {
        name: "Ностальгия FM",
        logoUrl: "https://radio.pervii.com/im/8/1556387358.jpg",
        streams: {
            hi: "https://93.189.147.117:8000/nostalgiafm.mp3",
            med: "https://93.189.147.117:8000/nostalgiafm.mp3",
            low: "https://93.189.147.117:8000/nostalgiafm.mp3"
        }
    },
    {
        name: "Шторм.FM Клубный",
        logoUrl: "https://radio.pervii.com/logo/1443541015.jpg",
        streams: {
            hi: "https://live.shtorm.fm:8000/mp3_club",
            med: "https://live.shtorm.fm:8000/mp3_club",
            low: "https://live.shtorm.fm:8000/mp3_club"
        }
    },
    {
        name: "Радио Шансон Иркутск",
        logoUrl: "https://radio.pervii.com/logo/1443541015.jpg",
        streams: {
            hi: "https://live.nts-tv.ru:8000/Shanson",
            med: "https://live.nts-tv.ru:8000/Shanson",
            low: "https://live.nts-tv.ru:8000/Shanson"
        }
    },
    {
        name: "Хиты России Рига",
        logoUrl: "https://radio.pervii.com/logo/1380753029.jpg",
        streams: {
            hi: "https://stream.superfm.lv:8000/khr.mp3",
            med: "https://stream.superfm.lv:8000/khr.mp3",
            low: "https://stream.superfm.lv:8000/khr.mp3"
        }
    },
    {
        name: "Старое Радио",
        logoUrl: "https://radio.pervii.com/logo/1403628116.png",
        streams: {
            hi: "https://staroeradio.ru:8000/ices128",
            med: "https://staroeradio.ru:8000/ices128",
            low: "https://staroeradio.ru:8000/ices128"
        }
    },
    {
        name: "Радио 99.1 FM Красноярск",
        logoUrl: "https://radio.pervii.com/logo/1403768728.png",
        streams: {
            hi: "https://online.volgogradfm.ru:8000/99i1",
            med: "https://online.volgogradfm.ru:8000/99i1",
            low: "https://online.volgogradfm.ru:8000/99i1"
        }
    },
    {
        name: "Дорожное Радио Москва",
        logoUrl: "https://radio.pervii.com/logo/1403667572.png",
        streams: {
            hi: "https://dor2server.streamr.ru:8000/dor_64_no",
            med: "https://dor2server.streamr.ru:8000/dor_64_no",
            low: "https://dor2server.streamr.ru:8000/dor_64_no"
        }
    },
    {
        name: "Европа Плюс Москва",
        logoUrl: "https://radio.pervii.com/logo/1439098397.png",
        streams: {
            hi: "https://europaplus.hostingradio.ru:8014/europaplus320.mp3",
            med: "https://europaplus.hostingradio.ru:8014/europaplus320.mp3",
            low: "https://europaplus.hostingradio.ru:8014/europaplus320.mp3"
        }
    },
    {
        name: "ЭКОРАДИО.РУ",
        logoUrl: "https://radio.pervii.com/im/3/1549779293.jpg",
        streams: {
            hi: "https://109.198.108.42:8000/stream/1/",
            med: "https://109.198.108.42:8000/stream/1/",
            low: "https://109.198.108.42:8000/stream/1/"
        }
    },
    {
        name: "Наше Радио Санкт-Петербург",
        logoUrl: "https://radio.pervii.com/im/0/1537439750.jpg",
        streams: {
            hi: "https://nashe1.hostingradio.ru/nashespb128.mp3",
            med: "https://nashe1.hostingradio.ru/nashespb128.mp3",
            low: "https://nashe1.hostingradio.ru/nashespb128.mp3"
        }
    },
    {
        name: "New Life Radio",
        logoUrl: "https://radio.pervii.com/im/4/1537544294.jpg",
        streams: {
            hi: "https://ic2.christiannetcast.com/nlradio",
            med: "https://ic2.christiannetcast.com/nlradio",
            low: "https://ic2.christiannetcast.com/nlradio"
        }
    },
    {
        name: "Радио Спутник Екатеринбург",
        logoUrl: "https://radio.pervii.com/im/0/1550286730.jpg",
        streams: {
            hi: "https://online.volgogradfm.ru:8000/sputnik107_aacplus",
            med: "https://online.volgogradfm.ru:8000/sputnik107_aacplus",
            low: "https://online.volgogradfm.ru:8000/sputnik107_aacplus"
        }
    },
    {
        name: "Радио Камчатка Live Chillout",
        logoUrl: "https://radio.pervii.com/im/4/1574053514.jpg",
        streams: {
            hi: "https://radio.kamchatkalive.ru:8100/chillout",
            med: "https://radio.kamchatkalive.ru:8100/chillout",
            low: "https://radio.kamchatkalive.ru:8100/chillout"
        }
    },
    {
        name: "Радио Борнео Воронеж",
        logoUrl: "https://radio.pervii.com/logo/1403407439.png",
        streams: {
            hi: "https://live.borneo.ru:8888/128",
            med: "https://live.borneo.ru:8888/128",
            low: "https://live.borneo.ru:8888/128"
        }
    },
    {
        name: "Веда-радио",
        logoUrl: "https://radio.pervii.com/logo/124188.jpg",
        streams: {
            hi: "https://listen.vedaradio.fm:8000/high",
            med: "https://listen.vedaradio.fm:8000/high",
            low: "https://listen.vedaradio.fm:8000/high"
        }
    },
    {
        name: "Радио Юнитон",
        logoUrl: "https://radio.pervii.com/logo/1403409742.png",
        streams: {
            hi: "https://online.uniton.ru:8300/RadioUniton128?",
            med: "https://online.uniton.ru:8300/RadioUniton128?",
            low: "https://online.uniton.ru:8300/RadioUniton128?"
        }
    },
    {
        name: "Радио Романтика Москва",
        logoUrl: "https://radio.pervii.com/im/2/1578023322.jpg",
        streams: {
            hi: "https://pub0302.101.ru:8443/stream/air/aac/64/101",
            med: "https://pub0302.101.ru:8443/stream/air/aac/64/101",
            low: "https://pub0302.101.ru:8443/stream/air/aac/64/101"
        }
    },
    {
        name: "Русское Радио",
        logoUrl: "https://radio.pervii.com/logo/1403867861.png",
        streams: {
            hi: "https://vdfm.ru:8000/z_rusradio",
            med: "https://vdfm.ru:8000/z_rusradio",
            low: "https://vdfm.ru:8000/z_rusradio"
        }
    },
    {
        name: "Русское Радио Новосибирск",
        logoUrl: "https://radio.pervii.com/logo/1403867861.png",
        streams: {
            hi: "https://gmedia54.fvds.ru:8000/rusradio_nsk_low",
            med: "https://gmedia54.fvds.ru:8000/rusradio_nsk_low",
            low: "https://gmedia54.fvds.ru:8000/rusradio_nsk_low"
        }
    },
    {
        name: "Красноярск FM",
        logoUrl: "https://radio.pervii.com/im/1/1561222161.jpg",
        streams: {
            hi: "https://online.krasnoyarskfm.ru:8000/krasnoyarskfm_mp3",
            med: "https://online.krasnoyarskfm.ru:8000/krasnoyarskfm_mp3",
            low: "https://online.krasnoyarskfm.ru:8000/krasnoyarskfm_mp3"
        }
    },
    {
        name: "Русское Христианское Радио Волна Счастья",
        logoUrl: "https://radio.pervii.com/im/7/1537583587.jpg",
        streams: {
            hi: "https://176.9.150.230:9970/stream/1/",
            med: "https://176.9.150.230:9970/stream/1/",
            low: "https://176.9.150.230:9970/stream/1/"
        }
    },
    {
        name: "Love City FM",
        logoUrl: "https://radio.pervii.com/im/7/1537583587.jpg",
        streams: {
            hi: "https://radio.lovecity3d.com:8130",
            med: "https://radio.lovecity3d.com:8130",
            low: "https://radio.lovecity3d.com:8130"
        }
    },
    {
        name: "Радио Монте-Карло 2",
        logoUrl: "https://radio.pervii.com/logo/1478990611.jpg",
        streams: {
            hi: "https://icecast.unitedradio.it/RMC.mp3",
            med: "https://icecast.unitedradio.it/RMC.mp3",
            low: "https://icecast.unitedradio.it/RMC.mp3"
        }
    },
    {
        name: "ROCK-FM",
        logoUrl: "https://radio.pervii.com/logo/1436065484.jpg",
        streams: {
            hi: "https://nashe1.hostingradio.ru/rock-64.mp3",
            med: "https://nashe1.hostingradio.ru/rock-64.mp3",
            low: "https://nashe1.hostingradio.ru/rock-64.mp3"
        }
    },
    {
        name: "Зайцев FM - Русские Хиты",
        logoUrl: "https://radio.pervii.com/logo/1419724220.jpg",
        streams: {
            hi: "https://zaycevfm.cdnvideo.ru/ZaycevFM_rus_256.mp3",
            med: "https://zaycevfm.cdnvideo.ru/ZaycevFM_rus_256.mp3",
            low: "https://zaycevfm.cdnvideo.ru/ZaycevFM_rus_256.mp3"
        }
    },
    {
        name: "Freedom Radio",
        logoUrl: "https://radio.pervii.com/im/3/1572662133.jpg",
        streams: {
            hi: "https://nradio.net:8080/free",
            med: "https://nradio.net:8080/free",
            low: "https://nradio.net:8080/free"
        }
    },
    {
        name: "Православное радио «Воскресение»",
        logoUrl: "https://radio.pervii.com/im/6/1549768906.jpg",
        streams: {
            hi: "https://www.orthodox-ural.ru:8000/stream.mp3",
            med: "https://www.orthodox-ural.ru:8000/stream.mp3",
            low: "https://www.orthodox-ural.ru:8000/stream.mp3"
        }
    },
    {
        name: "Noise FM - Modern Electronic Radio",
        logoUrl: "https://radio.pervii.com/logo/1403829477.png",
        streams: {
            hi: "https://noisefm.ru:8000/play_256",
            med: "https://noisefm.ru:8000/play_256",
            low: "https://noisefm.ru:8000/play_256"
        }
    },
    {
        name: "Радио Камчатка Dance",
        logoUrl: "https://radio.pervii.com/im/3/1552627553.jpg",
        streams: {
            hi: "https://radio.kamchatkalive.ru:8100/dance",
            med: "https://radio.kamchatkalive.ru:8100/dance",
            low: "https://radio.kamchatkalive.ru:8100/dance"
        }
    },
    {
        name: "Радио Талси Lounge",
        logoUrl: "https://radio.pervii.com/im/3/1552627553.jpg",
        streams: {
            hi: "https://kuums.lv:5555/stream/1/",
            med: "https://kuums.lv:5555/stream/1/",
            low: "https://kuums.lv:5555/stream/1/"
        }
    },
    {
        name: "DNB FM",
        logoUrl: "https://radio.pervii.com/logo/1403729004.png",
        streams: {
            hi: "https://go.dnbfm.ru:8000/play",
            med: "https://go.dnbfm.ru:8000/play",
            low: "https://go.dnbfm.ru:8000/play"
        }
    },
    {
        name: "Шансон USA",
        logoUrl: "https://radio.pervii.com/im/0/1555250540.jpg",
        streams: {
            hi: "https://usa7.fastcast4u.com:5949/stream/1/",
            med: "https://usa7.fastcast4u.com:5949/stream/1/",
            low: "https://usa7.fastcast4u.com:5949/stream/1/"
        }
    },
    {
        name: "Старое Радио - Музыка",
        logoUrl: "https://radio.pervii.com/logo/1403628116.png",
        streams: {
            hi: "https://staroeradio.ru:8000/r_music128",
            med: "https://staroeradio.ru:8000/r_music128",
            low: "https://staroeradio.ru:8000/r_music128"
        }
    },
    {
        name: "Европа Плюс Light",
        logoUrl: "https://radio.pervii.com/logo/1439098397.png",
        streams: {
            hi: "https://emg02.hostingradio.ru/ep-light128.mp3",
            med: "https://emg02.hostingradio.ru/ep-light128.mp3",
            low: "https://emg02.hostingradio.ru/ep-light128.mp3"
        }
    },
    {
        name: "DEEP ONE Radio",
        logoUrl: "https://radio.pervii.com/im/5/1550034225.jpg",
        streams: {
            hi: "https://stream.deep1.ru:8000/deep1mp3",
            med: "https://stream.deep1.ru:8000/deep1mp3",
            low: "https://stream.deep1.ru:8000/deep1mp3"
        }
    },
    {
        name: "Радио 107",
        logoUrl: "https://radio.pervii.com/logo/1403631205.png",
        streams: {
            hi: "https://62.183.34.109:8000/radio107.mp3",
            med: "https://62.183.34.109:8000/radio107.mp3",
            low: "https://62.183.34.109:8000/radio107.mp3"
        }
    },
    {
        name: "Детское Радио",
        logoUrl: "https://radio.pervii.com/logo/1403628116.png",
        streams: {
            hi: "https://staroeradio.ru:8000/detskoe128",
            med: "https://staroeradio.ru:8000/detskoe128",
            low: "https://staroeradio.ru:8000/detskoe128"
        }
    },
    {
        name: "Русское Радио Волгодонск",
        logoUrl: "https://radio.pervii.com/logo/1403867861.png",
        streams: {
            hi: "https://vdfm.ru:8000/rusradio",
            med: "https://vdfm.ru:8000/rusradio",
            low: "https://vdfm.ru:8000/rusradio"
        }
    },
    {
        name: "Радио Ваня - Не лихие 90-е",
        logoUrl: "https://radio.pervii.com/logo/0912090917.jpg",
        streams: {
            hi: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_90",
            med: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_90",
            low: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_90"
        }
    },
    {
        name: "Радио для двоих Санкт-Петербург",
        logoUrl: "https://radio.pervii.com/logo/1442040545.jpg",
        streams: {
            hi: "https://icecast-radiofortwo.cdnvideo.ru/radiofortwo?radio",
            med: "https://icecast-radiofortwo.cdnvideo.ru/radiofortwo?radio",
            low: "https://icecast-radiofortwo.cdnvideo.ru/radiofortwo?radio"
        }
    },
    {
        name: "Русское Радио Волгодонск",
        logoUrl: "https://radio.pervii.com/im/7/1555353847.jpg",
        streams: {
            hi: "https://listen.vdfm.ru:8000/rusradio",
            med: "https://listen.vdfm.ru:8000/rusradio",
            low: "https://listen.vdfm.ru:8000/rusradio"
        }
    },
    {
        name: "Радио Фантастики",
        logoUrl: "https://radio.pervii.com/logo/108291.jpg",
        streams: {
            hi: "https://fantasyradioru.no-ip.biz:8002/live",
            med: "https://fantasyradioru.no-ip.biz:8002/live",
            low: "https://fantasyradioru.no-ip.biz:8002/live"
        }
    },
    {
        name: "Эльдорадио",
        logoUrl: "https://radio.pervii.com/logo/29055.jpg",
        streams: {
            hi: "https://emgspb.hostingradio.ru/eldoradio64.mp3",
            med: "https://emgspb.hostingradio.ru/eldoradio64.mp3",
            low: "https://emgspb.hostingradio.ru/eldoradio64.mp3"
        }
    },
    {
        name: "Русское Радио Оренбург",
        logoUrl: "https://radio.pervii.com/logo/29055.jpg",
        streams: {
            hi: "https://radio.omg56.ru:8000/Russkoe_Oren",
            med: "https://radio.omg56.ru:8000/Russkoe_Oren",
            low: "https://radio.omg56.ru:8000/Russkoe_Oren"
        }
    },
    {
        name: "RadioMv.com - Русское Христианское Радио",
        logoUrl: "https://radio.pervii.com/logo/6166.jpg",
        streams: {
            hi: "https://65.19.173.132:2202",
            med: "https://65.19.173.132:2202",
            low: "https://65.19.173.132:2202"
        }
    },
    {
        name: "Rock Arsenal Екатеринбург",
        logoUrl: "https://radio.pervii.com/logo/1433629785.png",
        streams: {
            hi: "https://online.volgogradfm.ru:8000/rockarsenal",
            med: "https://online.volgogradfm.ru:8000/rockarsenal",
            low: "https://online.volgogradfm.ru:8000/rockarsenal"
        }
    },
    {
        name: "Зайцев FM - Разное",
        logoUrl: "https://radio.pervii.com/logo/1419724220.jpg",
        streams: {
            hi: "https://zaycevfm.cdnvideo.ru/ZaycevFM_pop_256.mp3",
            med: "https://zaycevfm.cdnvideo.ru/ZaycevFM_pop_256.mp3",
            low: "https://zaycevfm.cdnvideo.ru/ZaycevFM_pop_256.mp3"
        }
    },
    {
        name: "Кабриолет",
        logoUrl: "https://radio.pervii.com/logo/1419724220.jpg",
        streams: {
            hi: "https://setmedia.ru:8000/low3",
            med: "https://setmedia.ru:8000/low3",
            low: "https://setmedia.ru:8000/low3"
        }
    },
    {
        name: "Garage FM Online",
        logoUrl: "https://radio.pervii.com/im/7/1569230447.jpg",
        streams: {
            hi: "https://213.189.208.146:8005/Garagefm192",
            med: "https://213.189.208.146:8005/Garagefm192",
            low: "https://213.189.208.146:8005/Garagefm192"
        }
    },
    {
        name: "Европа Плюс New",
        logoUrl: "https://radio.pervii.com/logo/1439098397.png",
        streams: {
            hi: "https://emg02.hostingradio.ru/ep-new128.mp3",
            med: "https://emg02.hostingradio.ru/ep-new128.mp3",
            low: "https://emg02.hostingradio.ru/ep-new128.mp3"
        }
    },
    {
        name: "Радио PREMIUM Москва",
        logoUrl: "https://radio.pervii.com/im/0/1563844970.jpg",
        streams: {
            hi: "https://89.175.27.162:9000/aacp64",
            med: "https://89.175.27.162:9000/aacp64",
            low: "https://89.175.27.162:9000/aacp64"
        }
    },
    {
        name: "AnimeRadio.SU",
        logoUrl: "https://radio.pervii.com/im/7/1549707387.jpg",
        streams: {
            hi: "https://animeradio.su:8000",
            med: "https://animeradio.su:8000",
            low: "https://animeradio.su:8000"
        }
    },
    {
        name: "Говорит Москва",
        logoUrl: "https://radio.pervii.com/im/5/1551605155.jpg",
        streams: {
            hi: "https://video.govoritmoskva.ru:8000/rufm_m.mp3",
            med: "https://video.govoritmoskva.ru:8000/rufm_m.mp3",
            low: "https://video.govoritmoskva.ru:8000/rufm_m.mp3"
        }
    },
    {
        name: "Спутник FM Волгоград",
        logoUrl: "https://radio.pervii.com/im/5/1537500965.jpg",
        streams: {
            hi: "https://online.volgogradfm.ru:8000/sputnik_mp3",
            med: "https://online.volgogradfm.ru:8000/sputnik_mp3",
            low: "https://online.volgogradfm.ru:8000/sputnik_mp3"
        }
    },
    {
        name: "16Bit.FM CAFE Channel",
        logoUrl: "https://radio.pervii.com/logo/82839.jpg",
        streams: {
            hi: "https://16bitfm.com:8000/cafe_mp3_192",
            med: "https://16bitfm.com:8000/cafe_mp3_192",
            low: "https://16bitfm.com:8000/cafe_mp3_192"
        }
    },
    {
        name: "Радио Весна - Наше смоленское радио",
        logoUrl: "https://radio.pervii.com/im/4/1549776004.jpg",
        streams: {
            hi: "https://91.203.176.214:8000/vesnafm",
            med: "https://91.203.176.214:8000/vesnafm",
            low: "https://91.203.176.214:8000/vesnafm"
        }
    },
    {
        name: "Православное Радио",
        logoUrl: "https://radio.pervii.com/im/4/1549776004.jpg",
        streams: {
            hi: "https://radio-spb.rusk.ru:8000/stream",
            med: "https://radio-spb.rusk.ru:8000/stream",
            low: "https://radio-spb.rusk.ru:8000/stream"
        }
    },
    {
        name: "Дорожное Радио - Дорожка фронтовая",
        logoUrl: "https://radio.pervii.com/logo/1403667572.png",
        streams: {
            hi: "https://dor2server.streamr.ru:8000/dorognoe1945.mp3",
            med: "https://dor2server.streamr.ru:8000/dorognoe1945.mp3",
            low: "https://dor2server.streamr.ru:8000/dorognoe1945.mp3"
        }
    },
    {
        name: "Радио Ваня - Ретро",
        logoUrl: "https://radio.pervii.com/logo/1458570246.jpg",
        streams: {
            hi: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_retro",
            med: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_retro",
            low: "https://icecast-radiovanya.cdnvideo.ru:8000/rv_retro"
        }
    },
    {
        name: "Anima Amoris (Dream Progressive Electronic Energy Various Mix)",
        logoUrl: "https://radio.pervii.com/logo/1403682921.png",
        streams: {
            hi: "https://amoris.sknt.ru/newage.mp3",
            med: "https://amoris.sknt.ru/newage.mp3",
            low: "https://amoris.sknt.ru/newage.mp3"
        }
    },
    {
        name: "Радио Ультра",
        logoUrl: "https://radio.pervii.com/logo/0705130436.jpg",
        streams: {
            hi: "https://nashe1.hostingradio.ru/ultra-64.mp3",
            med: "https://nashe1.hostingradio.ru/ultra-64.mp3",
            low: "https://nashe1.hostingradio.ru/ultra-64.mp3"
        }
    },
    {
        name: "Anima Amoris (Trance)",
        logoUrl: "https://radio.pervii.com/logo/1403682921.png",
        streams: {
            hi: "https://anima.sknt.ru/trance.mp3",
            med: "https://anima.sknt.ru/trance.mp3",
            low: "https://anima.sknt.ru/trance.mp3"
        }
    },
    {
        name: "Комсомольская Правда Москва",
        logoUrl: "https://radio.pervii.com/logo/1302922628.jpg",
        streams: {
            hi: "https://kpradio.hostingradio.ru:8000/64",
            med: "https://kpradio.hostingradio.ru:8000/64",
            low: "https://kpradio.hostingradio.ru:8000/64"
        }
    },
    {
        name: "Радио Джаз",
        logoUrl: "https://radio.pervii.com/im/5/1537515045.jpg",
        streams: {
            hi: "https://nashe1.hostingradio.ru/jazz-64.mp3",
            med: "https://nashe1.hostingradio.ru/jazz-64.mp3",
            low: "https://nashe1.hostingradio.ru/jazz-64.mp3"
        }
    },
    {
        name: "Радио 54 Новосибирск",
        logoUrl: "https://radio.pervii.com/im/5/1572701205.jpg",
        streams: {
            hi: "https://91.202.68.50:8000/stream/1/",
            med: "https://91.202.68.50:8000/stream/1/",
            low: "https://91.202.68.50:8000/stream/1/"
        }
    },
    {
        name: "Радио Камчатка Live Rock",
        logoUrl: "https://radio.pervii.com/im/3/1552627553.jpg",
        streams: {
            hi: "https://radio.kamchatkalive.ru:8100/rock",
            med: "https://radio.kamchatkalive.ru:8100/rock",
            low: "https://radio.kamchatkalive.ru:8100/rock"
        }
    },
    {
        name: "Шторм.FM Русский",
        logoUrl: "https://radio.pervii.com/im/0/1537544360.jpg",
        streams: {
            hi: "https://live.shtorm.fm:8000/mp3_rushtorm",
            med: "https://live.shtorm.fm:8000/mp3_rushtorm",
            low: "https://live.shtorm.fm:8000/mp3_rushtorm"
        }
    },
    {
        name: "Радио Метро",
        logoUrl: "https://radio.pervii.com/im/7/1537547327.jpg",
        streams: {
            hi: "https://stream.radiometro.ru:8230/",
            med: "https://stream.radiometro.ru:8230/",
            low: "https://stream.radiometro.ru:8230/"
        }
    },
    {
        name: "Radio RUSREK Нью-Йорк, США",
        logoUrl: "https://radio.pervii.com/im/0/1548167880.jpg",
        streams: {
            hi: "https://s1.premium-streaming.com:9002",
            med: "https://s1.premium-streaming.com:9002",
            low: "https://s1.premium-streaming.com:9002"
        }
    },
    {
        name: "Радио Шок",
        logoUrl: "https://radio.pervii.com/im/6/1537498836.jpg",
        streams: {
            hi: "https://spb.radioshock.ru/radioshock",
            med: "https://spb.radioshock.ru/radioshock",
            low: "https://spb.radioshock.ru/radioshock"
        }
    },
    {
        name: "Радиола Саратов",
        logoUrl: "https://radio.pervii.com/logo/259716.png",
        streams: {
            hi: "https://online1.gkvr.ru:8000/radiola_srt_128.mp3",
            med: "https://online1.gkvr.ru:8000/radiola_srt_128.mp3",
            low: "https://online1.gkvr.ru:8000/radiola_srt_128.mp3"
        }
    },
    {
        name: "Pilot FM Dance",
        logoUrl: "https://radio.pervii.com/logo/1403709059.png",
        streams: {
            hi: "https://188.254.50.254:8000/pilot_dance",
            med: "https://188.254.50.254:8000/pilot_dance",
            low: "https://188.254.50.254:8000/pilot_dance"
        }
    },
    {
        name: "Радио Кафе",
        logoUrl: "https://radio.pervii.com/logo/1403630429.png",
        streams: {
            hi: "https://s03.radio-tochka.com:6045",
            med: "https://s03.radio-tochka.com:6045",
            low: "https://s03.radio-tochka.com:6045"
        }
    },
    {
        name: "Радио Шок",
        logoUrl: "https://radio.pervii.com/im/6/1537498836.jpg",
        streams: {
            hi: "https://spb.radioshock.ru:80/radioshock",
            med: "https://spb.radioshock.ru:80/radioshock",
            low: "https://spb.radioshock.ru:80/radioshock"
        }
    },
    {
        name: "Радио Интерволна Челябинск",
        logoUrl: "https://radio.pervii.com/logo/108310.jpg",
        streams: {
            hi: "https://online.intervolna.ru:8001/radio128",
            med: "https://online.intervolna.ru:8001/radio128",
            low: "https://online.intervolna.ru:8001/radio128"
        }
    },
    {
        name: "Business FM",
        logoUrl: "https://radio.pervii.com/im/2/1549769932.jpg",
        streams: {
            hi: "https://bfmstream.bfm.ru:8004/fm32",
            med: "https://bfmstream.bfm.ru:8004/fm32",
            low: "https://bfmstream.bfm.ru:8004/fm32"
        }
    },
    {
        name: "Наше Радио 2.0",
        logoUrl: "https://radio.pervii.com/im/0/1537439750.jpg",
        streams: {
            hi: "https://nashe1.hostingradio.ru/nashe20-128.mp3",
            med: "https://nashe1.hostingradio.ru/nashe20-128.mp3",
            low: "https://nashe1.hostingradio.ru/nashe20-128.mp3"
        }
    },
    {
        name: "Ретро FM Москва",
        logoUrl: "https://radio.pervii.com/logo/1436073235.png",
        streams: {
            hi: "https://retroserver.streamr.ru:8043/retro64",
            med: "https://retroserver.streamr.ru:8043/retro64",
            low: "https://retroserver.streamr.ru:8043/retro64"
        }
    },
    {
        name: "Radio Caprice Relaxation Music",
        logoUrl: "https://radio.pervii.com/im/7/1551052627.jpg",
        streams: {
            hi: "https://79.120.39.202:9109",
            med: "https://79.120.39.202:9109",
            low: "https://79.120.39.202:9109"
        }
    },
    {
        name: "Юмор FM Online",
        logoUrl: "https://radio.pervii.com/im/7/1551052627.jpg",
        streams: {
            hi: "https://listen.vdfm.ru:8000/humor",
            med: "https://listen.vdfm.ru:8000/humor",
            low: "https://listen.vdfm.ru:8000/humor"
        }
    },
    {
        name: "Радио Мегаполис Самара",
        logoUrl: "https://radio.pervii.com/logo/1366593615.jpg",
        streams: {
            hi: "https://online.volgogradfm.ru:8000/megapolis",
            med: "https://online.volgogradfm.ru:8000/megapolis",
            low: "https://online.volgogradfm.ru:8000/megapolis"
        }
    },
    {
        name: "Кунель Радио Набережные Челны",
        logoUrl: "https://radio.pervii.com/im/1/1554861291.jpg",
        streams: {
            hi: "https://live.kunelradio.ru:8000/128.mp3",
            med: "https://live.kunelradio.ru:8000/128.mp3",
            low: "https://live.kunelradio.ru:8000/128.mp3"
        }
    },
    {
        name: "Radio X-MAS",
        logoUrl: "https://radio.pervii.com/logo/1029113058.jpg",
        streams: {
            hi: "https://77.75.16.238:443/stream/1/",
            med: "https://77.75.16.238:443/stream/1/",
            low: "https://77.75.16.238:443/stream/1/"
        }
    },
    {
        name: "Радио Вышка",
        logoUrl: "https://radio.pervii.com/logo/1476474581.jpg",
        streams: {
            hi: "https://stream.vyshka24.ru/256",
            med: "https://stream.vyshka24.ru/256",
            low: "https://stream.vyshka24.ru/256"
        }
    },
    {
        name: "Радио 42fm",
        logoUrl: "https://radio.pervii.com/im/8/1556421328.jpg",
        streams: {
            hi: "https://listen.42fm.ru:8000/stealkill",
            med: "https://listen.42fm.ru:8000/stealkill",
            low: "https://listen.42fm.ru:8000/stealkill"
        }
    },
    {
        name: "Кавказ Радио",
        logoUrl: "https://radio.pervii.com/im/8/1556421328.jpg",
        streams: {
            hi: "https://radio.alania.net:8000/kvk",
            med: "https://radio.alania.net:8000/kvk",
            low: "https://radio.alania.net:8000/kvk"
        }
    },
    {
        name: "RADIO SATURN FM - СССР",
        logoUrl: "https://radio.pervii.com/logo/1454820257.jpg",
        streams: {
            hi: "https://s4.radioheart.ru:8002/nonstop",
            med: "https://s4.radioheart.ru:8002/nonstop",
            low: "https://s4.radioheart.ru:8002/nonstop"
        }
    },
    {
        name: "MDS Station - Модель для сборки",
        logoUrl: "https://radio.pervii.com/im/0/1563080240.jpg",
        streams: {
            hi: "https://stream.mds-station.com:8000/01-mds",
            med: "https://stream.mds-station.com:8000/01-mds",
            low: "https://stream.mds-station.com:8000/01-mds"
        }
    },
    {
        name: "Радио Метро Санкт-Петербург",
        logoUrl: "https://radio.pervii.com/im/7/1537547327.jpg",
        streams: {
            hi: "https://stream.radiometro.ru:8230",
            med: "https://stream.radiometro.ru:8230",
            low: "https://stream.radiometro.ru:8230"
        }
    },
    {
        name: "Radio Caprice - Club Dance",
        logoUrl: "https://radio.pervii.com/im/7/1551052627.jpg",
        streams: {
            hi: "https://79.111.119.111:9099",
            med: "https://79.111.119.111:9099",
            low: "https://79.111.119.111:9099"
        }
    }
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
    function playCurrentStation() { if (!currentStation) return; const attemptId = ++playAttemptId; audioPlayer.src = currentStation.streams[currentQuality]; playPauseBtn.disabled = true; stationNameDisplay.textContent = currentStation.name; stationNameDisplay.classList.remove('text-red-500'); const playPromise = audioPlayer.play(); if (playPromise !== undefined) { playPromise.then(() => { if (attemptId === playAttemptId) { playPauseBtn.disabled = false; playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'playing'; } updateMediaSession(); } }).catch(error => { if (attemptId === playAttemptId) { console.error("Audio playback error:", error); playPauseBtn.disabled = true; playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'paused'; } } }); } }
    function selectStation(station, buttonElement) { document.querySelectorAll('#radio-stations button').forEach(btn => btn.classList.remove('card-active')); if (buttonElement) buttonElement.classList.add('card-active'); currentStation = station; stationNameDisplay.textContent = currentStation.name; stationLogoContainer.innerHTML = ''; if (currentStation.logoUrl) { const img = document.createElement('img'); img.src = currentStation.logoUrl; img.alt = `${currentStation.name} logo`; img.className = 'w-16 h-16 rounded-full object-cover'; img.onerror = () => { const fallbackIcon = document.createElement('div'); fallbackIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'; fallbackIcon.textContent = 'Нет лого'; stationLogoContainer.appendChild(fallbackIcon); }; stationLogoContainer.appendChild(img); } else { const fallbackIcon = document.createElement('div'); fallbackIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'; fallbackIcon.textContent = 'Нет лого'; stationLogoContainer.appendChild(fallbackIcon); } fixedPlayerContainer.classList.remove('hidden'); playCurrentStation(); }
    playPauseBtn.addEventListener('click', () => { if (audioPlayer.paused) { const playPromise = audioPlayer.play(); if (playPromise !== undefined) { playPromise.then(() => { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'playing'; } }).catch(e => console.error("UI resume failed", e)); } } else { audioPlayer.pause(); playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); if ('mediaSession' in navigator) { navigator.mediaSession.playbackState = 'paused'; } } });
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
