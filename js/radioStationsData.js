// js/radioStationsData.js
/**
 * @typedef {Object} Stream
 * @property {string} name - Пользовательское название качества потока (например, "Высокое 128kbps").
 * @property {string} url - URL аудиопотока.
 *
 * @typedef {Object} RadioStation
 * @property {string} name - Название радиостанции.
 * @property {string} logoUrl - URL логотипа радиостанции.
 * @property {Stream[]} streams - Массив доступных потоков.
 */

/**
 * Массив объектов, представляющих радиостанции.
 * @type {RadioStation[]}
 */
export const radioStations = [
    // --- ПРИМЕР НОВОГО ФОРМАТА ---
    { name: "Маруся FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf176d9e.jpg", streams: [{ name: "Основной поток", url: "https://msk8.radio-holding.ru/marusya_default" }] },
    { name: "Record Russian Hits", logoUrl: "https://pcradio.ru/images/stations/61b09ca2ead8f.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/record_rushits-med" }] },
    { name: "Новое Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3eb91b608.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/novoe_radio98_4-hi" }] },
    { name: "Дорожное Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3ec011dd9.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/rus_rodnye00-hi" }] },
    { name: "Relax FM (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ebda8c01.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/relax_fm_ru-hi" }] },
    { name: "DFM 101.2 (Москва)", logoUrl: "https://pcradio.ru/images/stations/62ea3ec00ae9b.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/dfm_moscow-hi" }] },
    { name: "ТНТ Music Radio", logoUrl: "https://pcradio.ru/images/stations/61b09c403d308.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/rad_rutntmsc-hi" }] },
    { name: "Соль FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf2dc6d7.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/sol_fm-hi" }] },
    { name: "Maximum", logoUrl: "https://pcradio.ru/images/stations/62ea3ebe46311.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/fm_maximum-hi" }] },
    { name: "РУССКАЯ ВОЛНА", logoUrl: "https://amgradio.ru/img/RuWavebg.svg", streams: [{ name: "Поток 48kbps", url: "https://ru1.amgradio.ru/RuWave48" }] },
    { name: "РЕТРО ХИТ", logoUrl: "https://amgradio.ru/img/retrohit.svg", streams: [{ name: "Основной поток", url: "https://retro.amgradio.ru/Retro" }] },
    { name: "РУССКИЙ РОК", logoUrl: "https://amgradio.ru/img/rusrock.svg", streams: [{ name: "Основной поток", url: "https://rock.amgradio.ru/RusRock" }] },
    { name: "ХАЙП FM", logoUrl: "https://amgradio.ru/img/hypefm.svg", streams: [{ name: "Основной поток", url: "https://hfm.amgradio.ru/HypeFM" }] },
    { name: "REMIX FM", logoUrl: "https://amgradio.ru/img/remix.svg", streams: [{ name: "Основной поток", url: "https://rmx.amgradio.ru/RemixFM" }] },
    { name: "DEEP FM", logoUrl: "https://amgradio.ru/img/deepfm.svg", streams: [{ name: "Основной поток", url: "https://deep.amgradio.ru/DeepFM" }] },
    { name: "MEGA RADIO", logoUrl: "https://amgradio.ru/img/megaradio.svg", streams: [{ name: "Основной поток", url: "https://mega.amgradio.ru/mega" }] },
    { name: "RADIO CAFE", logoUrl: "https://amgradio.ru/img/radiocafe.svg", streams: [{ name: "Основной поток", url: "https://cafe.amgradio.ru/Cafe" }] },
    { name: "ХОРОШЕЕ РАДИО", logoUrl: "https://amgradio.ru/img/horoshee.svg", streams: [{ name: "Основной поток", url: "https://hr.amgradio.ru/Horoshee" }] },
    { name: "РУССКОЕ FM", logoUrl: "https://amgradio.ru/img/rufm.svg", streams: [{ name: "Основной поток", url: "https://rufm.amgradio.ru/rufm" }] },
    { name: "RADIO FRESH", logoUrl: "https://amgradio.ru/img/fresh.svg", streams: [{ name: "Основной поток", url: "https://fresh.amgradio.ru/Fresh" }] },
    { name: "МУРКА FM", logoUrl: "https://amgradio.ru/img/murkafm.svg", streams: [{ name: "Основной поток", url: "https://murka.amgradio.ru/MurkaFM" }] },
    { name: "РОДНЫЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rodnyepesni.svg", streams: [{ name: "Основной поток", url: "https://rodpesni.amgradio.ru/rp" }] },
    { name: "РУССКИЕ ПЕСНИ", logoUrl: "https://amgradio.ru/img/rusongswhite.svg", streams: [{ name: "Основной поток", url: "https://rusongs.amgradio.ru/rusongs" }] },
    { name: "DJIN FM", logoUrl: "https://amgradio.ru/img/djin.svg", streams: [{ name: "Основной поток", url: "https://djin.amgradio.ru/djin" }] },
    { name: "ШТОРМ FM", logoUrl: "https://amgradio.ru/img/shtormfm.svg", streams: [{ name: "Основной поток", url: "https://shtorm.amgradio.ru/shtormfm" }] },
    { name: "MUSIC BOX RADIO", logoUrl: "https://amgradio.ru/img/musicboxradio.svg", streams: [{ name: "Основной поток", url: "https://musicbox.amgradio.ru/musicbox" }] },
    { name: "CHILLA FM", logoUrl: "https://amgradio.ru/img/chillafm.svg", streams: [{ name: "Основной поток", url: "https://chilla.amgradio.ru/ChillaFM" }] },
    { name: "LITE FM", logoUrl: "https://amgradio.ru/img/litefm.svg", streams: [{ name: "Основной поток", url: "https://litefm.amgradio.ru/litefm" }] },
    { name: "ДЕТСКИЙ ХИТ", logoUrl: "https://amgradio.ru/img/detifm.svg", streams: [{ name: "Основной поток", url: "https://deti.amgradio.ru/Deti" }] },
    { name: "СКАЗКА FM", logoUrl: "https://amgradio.ru/img/skazkafm.svg", streams: [{ name: "Основной поток", url: "https://skazka.amgradio.ru/Skazka" }] },
    { name: "УМНОЕ РАДИО", logoUrl: "https://amgradio.ru/img/umnoe.svg", streams: [{ name: "Основной поток", url: "https://umnoe.amgradio.ru/Umnoe" }] },
    { name: "LATINO RADIO", logoUrl: "https://amgradio.ru/img/latino.svg", streams: [{ name: "Основной поток", url: "https://latino.amgradio.ru/latino" }] },
    { name: "РАДИО МЕЧТА", logoUrl: "https://amgradio.ru/img/mechta.svg", streams: [{ name: "Основной поток", url: "https://mechta.amgradio.ru/mechta" }] },
    { name: "RADIO FUNK", logoUrl: "https://amgradio.ru/img/radiofunk.svg", streams: [{ name: "Основной поток", url: "https://funk.amgradio.ru/Funk" }] },
    { name: "RBS FM", logoUrl: "https://amgradio.ru/img/rbsfm.svg", streams: [{ name: "Основной поток", url: "https://rbs.amgradio.ru/rbs" }] },
    { name: "MAKKIRUS", logoUrl: "https://amgradio.ru/img/makkirus.svg", streams: [{ name: "Основной поток", url: "https://makkirus.amgradio.ru/makkirus" }] },
    { name: "CLASSIC FM", logoUrl: "https://amgradio.ru/img/classicfm.svg", streams: [{ name: "Основной поток", url: "https://classic.amgradio.ru/ClassicFM" }] },
    { name: "РАДИО ЗВУКИ ПРИРОДЫ", logoUrl: "https://amgradio.ru/img/zvuki.svg", streams: [{ name: "Основной поток", url: "https://zvuki.amgradio.ru/Zvuki" }] },
    { name: "Спутник Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3ebe43be0.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/sputnik_ria_ru-med" }] },
];
