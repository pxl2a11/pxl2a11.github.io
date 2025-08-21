// radioStationsData.js
/**
 * @typedef {Object} RadioStation
 * @property {string} name - Название радиостанции.
 * @property {string} logoUrl - URL логотипа радиостанции (может быть пустой строкой, если нет лого).
 * @property {Object.<string, string>} streams - Объект с URL потоков радиостанции по качеству (hi, med, low).
 */

/**
 * Массив объектов, представляющих радиостанции, с их названиями, URL логотипов и потоками.
 * @type {RadioStation[]}
 */
export const radioStations = [
    // Основные станции
    { name: "Маруся FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf176d9e.jpg", streams: { hi: "https://stream.pcradio.ru/marusya_fm-hi", med: "https://stream.pcradio.ru/marusya_fm-med", low: "https://stream.pcradio.ru/marusya_fm-low" }},
    { name: "Record Russian Hits", logoUrl: "https://pcradio.ru/images/stations/61b09ca2ead8f.jpg", streams: { hi: "https://stream.pcradio.ru/record_rushits-hi", med: "https://stream.pcradio.ru/record_rushits-med", low: "https://stream.pcradio.ru/record_rushits-low" }},
    { name: "Новое Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3eb91b608.jpg", streams: { hi: "https://stream.pcradio.ru/novoe_radio98_4-hi", med: "https://stream.pcradio.ru/novoe_radio98_4-med", low: "https://stream.pcradio.ru/novoe_radio98_4-low" }},
    { name: "Дорожное Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3ec011dd9.jpg", streams: { hi: "https://stream.pcradio.ru/rus_rodnye00-hi", med: "https://stream.pcradio.ru/rus_rodnye00-med", low: "https://stream.pcradio.ru/rus_rodnye00-low" }},
    { name: "Relax FM (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ebda8c01.jpg", streams: { hi: "https://stream.pcradio.ru/relax_fm_ru-hi", med: "https://stream.pcradio.ru/relax_fm_ru-med", low: "https://stream.pcradio.ru/relax_fm_ru-low" }},
    { name: "DFM 101.2 (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ec00ae9b.jpg", streams: { hi: "https://stream.pcradio.ru/dfm_moscow-hi", med: "https://stream.pcradio.ru/dfm_moscow-med", low: "https://stream.pcradio.ru/dfm_moscow-low" }},
    { name: "ТНТ Music Radio", logoUrl: "https://pcradio.ru/images/stations/61b09c403d308.jpg", streams: { hi: "https://stream.pcradio.ru/rad_rutntmsc-hi", med: "https://stream.pcradio.ru/rad_rutntmsc-med", low: "https://stream.pcradio.ru/rad_rutntmsc-low" }},
    { name: "Соль FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf2dc6d7.jpg", streams: { hi: "https://stream.pcradio.ru/sol_fm-hi", med: "https://stream.pcradio.ru/sol_fm-med", low: "https://stream.pcradio.ru/sol_fm-low" }},
    { name: "Maximum", logoUrl: "https://pcradio.ru/images/stations/62ea3ebe46311.jpg", streams: { hi: "https://stream.pcradio.ru/fm_maximum-hi", med: "https://stream.pcradio.ru/fm_maximum-med", low: "https://stream.pcradio.ru/fm_maximum-low" }},

    // Станции из нового списка (с HTTPS)
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
    { name: "РАДИО ЗВУКИ ПРИРОДЫ", logoUrl: "https://amgradio.ru/img/zvuki.svg", streams: { hi: "https://zvuki.amgradio.ru/Zvuki", med: "https://zvuki.amgradio.ru/Zvuki", low: "https://zvuki.amgradio.ru/Zvuki" } },
];
