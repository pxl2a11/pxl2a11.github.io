// js/radioStationsData.js

export const radioStations = [
    // --- ПРИМЕР НОВОГО ФОРМАТА ---
    { name: "Русское радио", logoUrl: "https://radiopotok.ru/f/station/512/85.png", streams: [
        { name: "96 kbps", url: "https://rusradio.hostingradio.ru/rusradio96.aacp" }, 
        { name: "128 kbps", url: "https://rusradio.hostingradio.ru/rusradio128.mp3" }] },
    { name: "Бизнес FM", logoUrl: "https://top-radio.ru/assets/image/radio/180/bfm-russia.png", streams: [
        { name: "128 kbps", url: "https://bfmreg.hostingradio.ru/spb.bfm128.mp3" },
        { name: "256 kbps", url: "https://bfm.hostingradio.ru/bfm256.mp3" }] },
    { name: "Радио Маяк", logoUrl: "https://radiopotok.ru/f/station/512/89.png", streams: [
        { name: "64 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_64kbps" },
        { name: "128 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_128kbps" },
        { name: "192 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_192kbps" }] },
    { name: "Радио Рекорд", logoUrl: "https://top-radio.ru/assets/image/radio/180/radiorecod.png", streams: [
        { name: "96 kbps", url: "https://radiorecord.hostingradio.ru/rr_main96.aacp" },
        { name: "112 kbps", url: "https://hls-01-radiorecord.hostingradio.ru/record/playlist.m3u8" },
        { name: "192 kbps", url: "https://radio-srv1.11one.ru/record192k.mp3" }] },
    { name: "Радио Монте-Карло", logoUrl: "https://montecarlo.ru/uploads/logo_for_og.png", streams: [
        { name: "96 kbps", url: "https://montecarlo.hostingradio.ru/montecarlo96.aacp" },
        { name: "128 kbps", url: "https://montecarlo.hostingradio.ru/montecarlo128.mp3" }] },
    { name: "НАШЕ Радио", logoUrl: "https://top-radio.ru/assets/image/radio/180/nase-radio.png", streams: [
        { name: "64 kbps", url: "https://nashe1.hostingradio.ru/nashe-64.mp3" },
        { name: "128 kbps", url: "https://nashe1.hostingradio.ru/nashe-128.mp3" },
        { name: "256 kbps", url: "https://nashe1.hostingradio.ru/nashe-256" }] },
    { name: "Детское Радио", logoUrl: "https://pic.rutubelist.ru/user/5a/0a/5a0a80014f20a20ef9868fa3ab9eb751.jpg", streams: [
        { name: "64 kbps", url: "https://pub0201.101.ru/stream/air/aac/64/199" },
        { name: "64 kbps (резерв)", url: "https://srv21.gpmradio.ru:8443/stream/air/aac/64/199" }] },
    { name: "Радио DFM", logoUrl: "https://top-radio.ru/assets/image/radio/180/radio-dfm.webp", streams: [
        { name: "32 kbps", url: "https://hls-01-dfm.hostingradio.ru/dfm/32/playlist.m3u8" },
        { name: "96 kbps", url: "https://hls-01-dfm.hostingradio.ru/dfm/96/playlist.m3u8" },
        { name: "128 kbps", url: "https://dfm.hostingradio.ru/dfm128.mp3" }] },
    { name: "Маруся FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf176d9e.jpg", streams: [{ name: "Основной поток", url: "https://msk8.radio-holding.ru/marusya_default" }] },
    { name: "Record Russian Hits", logoUrl: "https://pcradio.ru/images/stations/61b09ca2ead8f.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/record_rushits-med" }] },
    { name: "Новое Радио", logoUrl: "https://pcradio.ru/images/stations/62ea3eb91b608.jpg", streams: [
        { name: "64 kbps", url: "https://emgspb.hostingradio.ru/novoespb64.mp3" },
        { name: "96 kbps", url: "https://stream.newradio.ru/novoe96.aacp" },
        { name: "128 kbps", url: "https://emgspb.hostingradio.ru/novoespb128.mp3" }] },
    { name: "Дорожное Радио", logoUrl: "https://top-radio.ru/assets/image/radio/180/dorojnoe.png", streams: [
        { name: "32 kbps", url: "https://hls-01-dorognoe.emgsound.ru/15/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-dorognoe.emgsound.ru/15/64/playlist.m3u8" },
        { name: "112 kbps", url: "https://hls-01-dorognoe.emgsound.ru/15/112/playlist.m3u8" }] },
    { name: "Relax FM", logoUrl: "https://pcradio.ru/images/stations/62ea3ebda8c01.jpg", streams: [
        { name: "64 kbps", url: "https://pub0201.101.ru/stream/air/aac/64/200" },
        { name: "128 kbps", url: "https://hls-01-gpm.hostingradio.ru/relaxfm495/128/playlist.m3u8" }] },
    { name: "Соль FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf2dc6d7.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/sol_fm-hi" }] },
    { name: "Maximum", logoUrl: "https://pcradio.ru/images/stations/62ea3ebe46311.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/fm_maximum-hi" }] },
        { name: "Эльдорадио", logoUrl: "https://top-radio.ru/assets/image/radio/180/eldo-radio.jpg", streams: [
        { name: "64 kbps", url: "https://emgspb.hostingradio.ru/eldoradio64.mp3" },
        { name: "96 kbps", url: "https://hls-01-eldoradio.emgsound.ru/4/96/playlist.m3u8" },
        { name: "128 kbps", url: "https://emgspb.hostingradio.ru/eldoradio128.mp3" }] },
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
    { name: "ТНТ Music Radio", logoUrl: "https://pcradio.ru/images/stations/61b09c403d308.jpg", streams: [
        { name: "128 kbps", url: "https://tntradio.hostingradio.ru:8027/tntradio128.mp3" }] },
];
