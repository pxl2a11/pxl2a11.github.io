// 12js/radioStationsData.js

export const radioStations = [
    // --- ПРИМЕР НОВОГО ФОРМАТА ---
    { name: "Русское радио", logoUrl: "img/radio/russkoe.png", streams: [
        { name: "96 kbps", url: "https://rusradio.hostingradio.ru/rusradio96.aacp" }, 
        { name: "128 kbps", url: "https://rusradio.hostingradio.ru/rusradio128.mp3" }] },
    { name: "Бизнес FM", logoUrl: "img/radio/biznes_fm.png", streams: [
        { name: "128 kbps", url: "https://bfmreg.hostingradio.ru/spb.bfm128.mp3" },
        { name: "256 kbps", url: "https://bfm.hostingradio.ru/bfm256.mp3" }] },
    { name: "Радио Маяк", logoUrl: "img/radio/radio_mayak.png", streams: [
        { name: "64 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_64kbps" },
        { name: "128 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_128kbps" },
        { name: "192 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_192kbps" }] },
    { name: "Радио Рекорд", logoUrl: "img/radio/radio_rekord.png", streams: [
        { name: "96 kbps", url: "https://radiorecord.hostingradio.ru/rr_main96.aacp" },
        { name: "112 kbps", url: "https://hls-01-radiorecord.hostingradio.ru/record/playlist.m3u8" },
        { name: "192 kbps", url: "https://radio-srv1.11one.ru/record192k.mp3" }] },
    { name: "Радио Монте-Карло", logoUrl: "img/radio/radio_monte-karlo.png", streams: [
        { name: "96 kbps", url: "https://montecarlo.hostingradio.ru/montecarlo96.aacp" },
        { name: "128 kbps", url: "https://montecarlo.hostingradio.ru/montecarlo128.mp3" }] },
    { name: "НАШЕ Радио", logoUrl: "img/radio/nashe_radio.png", streams: [
        { name: "64 kbps", url: "https://nashe1.hostingradio.ru/nashe-64.mp3" },
        { name: "128 kbps", url: "https://nashe1.hostingradio.ru/nashe-128.mp3" },
        { name: "256 kbps", url: "https://nashe1.hostingradio.ru/nashe-256" }] },
    { name: "Детское Радио", logoUrl: "img/radio/detskoe_radio.png", streams: [
        { name: "64 kbps", url: "https://pub0201.101.ru/stream/air/aac/64/199" },
        { name: "64 kbps (резерв)", url: "https://srv21.gpmradio.ru:8443/stream/air/aac/64/199" }] },
    { name: "Радио DFM", logoUrl: "img/radio/radio_dfm.png", streams: [
        { name: "32 kbps", url: "https://hls-01-dfm.hostingradio.ru/dfm/32/playlist.m3u8" },
        { name: "96 kbps", url: "https://hls-01-dfm.hostingradio.ru/dfm/96/playlist.m3u8" },
        { name: "128 kbps", url: "https://dfm.hostingradio.ru/dfm128.mp3" }] },
    { name: "Радио Maximum", logoUrl: "img/radio/radio_maximum.png", streams: [
        { name: "96 kbps", url: "https://maximum.hostingradio.ru/maximum96.aacp" },
        { name: "128 kbps", url: "https://maximum.hostingradio.ru/maximum128.mp3" }] },
    { name: "Радио МЕТРО", logoUrl: "img/radio/radio_metro.png", streams: [
        { name: "128 kbps", url: "https://stream.radiometro.ru:8443/metro.mp3" }] },
    { name: "Радио ТВОЯ ВОЛНА", logoUrl: "img/radio/radio_tvoya_volna.png", streams: [
        { name: "256 kbps", url: "https://icecast-tvoyavolna.cdnvideo.ru/tvoyavolna" }] },
    { name: "Эльдорадио", logoUrl: "img/radio/eldoradio.png", streams: [
        { name: "64 kbps", url: "https://emgspb.hostingradio.ru/eldoradio64.mp3" },
        { name: "96 kbps", url: "https://hls-01-eldoradio.emgsound.ru/4/96/playlist.m3u8" },
        { name: "128 kbps", url: "https://emgspb.hostingradio.ru/eldoradio128.mp3" }] },
    { name: "Питер FM", logoUrl: "img/radio/piter_fm.png", streams: [
        { name: "Основной поток", url: "https://piterfm-hls.cdnvideo.ru/piterfm-live/piterfm.stream/tracks-a1/mono.ts.m3u8" }] },
    { name: "Европа Плюс", logoUrl: "img/radio/evropa_plyus.png", streams: [
        { name: "32 kbps", url: "https://hls-02-europaplus.emgsound.ru/11/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-02-europaplus.emgsound.ru/11/64/playlist.m3u8" },
        { name: "112 kbps", url: "https://hls-02-europaplus.emgsound.ru/11/112/playlist.m3u8" }] },
    { name: "Радио России", logoUrl: "img/radio/radio_rossii.png", streams: [
        { name: "64 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/rrzonam_aac_64kbps" },
        { name: "128 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/rrzonam_mp3_128kbps" },
        { name: "192 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/rrzonam_mp3_192kbps" }] },
    { name: "Royal Radio", logoUrl: "img/radio/royal_radio.png", streams: [
        { name: "128 kbps", url: "https://royalradio.space/986FM" }] },
    { name: "Comedy Radio", logoUrl: "img/radio/comedy_radio.png", streams: [
        { name: "64 kbps", url: "https://pub0201.101.ru/stream/air/aac/64/200" },
        { name: "64 kbps (резерв)", url: "https://srv21.gpmradio.ru:8443/stream/air/aac/64/202" }] },
    { name: "STUDIO 21", logoUrl: "img/radio/studio_21.png", streams: [
        { name: "32 kbps", url: "https://hls.studio21.ru/studio21/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls.studio21.ru/studio21/64/playlist.m3u8" },
        { name: "112 kbps", url: "https://hls.studio21.ru/studio21/112/playlist.m3u8" }] },
    { name: "Радио ENERGY", logoUrl: "img/radio/radio_energy.png", streams: [
        { name: "32 kbps", url: "https://hls-01-gpm.hostingradio.ru/energyfm495/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-gpm.hostingradio.ru/energyfm495/64/playlist.m3u8" },
        { name: "128 kbps", url: "https://hls-01-gpm.hostingradio.ru/energyfm495/128/playlist.m3u8" }] },
    { name: "Радио Звезда", logoUrl: "img/radio/radio_zvezda.png", streams: [
        { name: "64 kbps", url: "https://icecast-zvezda.mediacdn.ru/radio/zvezda/zvezda_64" },
        { name: "96 kbps", url: "https://icecast-zvezda.mediacdn.ru/radio/zvezda/zvezda_96" },
        { name: "128 kbps", url: "https://zvezda-radio-rzv.mediacdn.ru/radio/zvezda/zvezda_128" }] },
    { name: "Радио Гордость", logoUrl: "img/radio/radio_gordost.png", streams: [
        { name: "64 kbps", url: "https://rgordost.hostingradio.ru/rgordost64.aacp" },
        { name: "128 kbps", url: "https://rgordost.hostingradio.ru/rgordost128.aacp" }] },
    { name: "Хит FM", logoUrl: "img/radio/hit_fm.png", streams: [
        { name: "32 kbps", url: "https://hls-01-hitfm.hostingradio.ru/hitfm/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-hitfm.hostingradio.ru/hitfm/64/playlist.m3u8" },
        { name: "96 kbps", url: "https://hls-01-hitfm.hostingradio.ru/hitfm/96/playlist.m3u8" }] },
    { name: "Комсомольская правда", logoUrl: "img/radio/komsomolskaya_pravda.png", streams: [
        { name: "32 kbps", url: "https://hls-01-kpradio.hostingradio.ru/kpradio-msk/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-kpradio.hostingradio.ru/kpradio-msk/64/playlist.m3u8" },
        { name: "112 kbps", url: "https://hls-01-kpradio.hostingradio.ru/kpradio-msk/112/playlist.m3u8" }] },
    { name: "Новое Радио", logoUrl: "img/radio/novoe_radio.png", streams: [
        { name: "64 kbps", url: "https://emgspb.hostingradio.ru/novoespb64.mp3" },
        { name: "96 kbps", url: "https://stream.newradio.ru/novoe96.aacp" },
        { name: "128 kbps", url: "https://emgspb.hostingradio.ru/novoespb128.mp3" }] },
    { name: "Радио ВАНЯ", logoUrl: "img/radio/radio_vanya.png", streams: [
        { name: "128 kbps", url: "https://air2.volna.top/Vanya-SPB" }] },
    { name: "Радио Эрмитаж", logoUrl: "img/radio/radio_ermitazh.png", streams: [
        { name: "128 kbps", url: "https://hermitage.hostingradio.ru/hermitage128.mp3" }] },
    { name: "Радио Зенит", logoUrl: "https://top-radio.ru/assets/image/radio/180/zenit-fm.jpg", streams: [
        { name: "256 kbps", url: "https://radiozenit.hostingradio.ru/radiozenit256.mp3" }] },
    { name: "Вести ФМ", logoUrl: "img/radio/russkoe.png", streams: [
        { name: "64 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_64kbps" },
        { name: "128 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_128kbps" },
        { name: "192 kbps", url: "https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_192kbps" }] },
    { name: "Юмор FM", logoUrl: "img/radio/yumor fm.png", streams: [
        { name: "32 kbps", url: "https://hls-01-gpm.hostingradio.ru/humorfm495/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-gpm.hostingradio.ru/humorfm495/64/playlist.m3u8" },
        { name: "128 kbps", url: "https://hls-01-gpm.hostingradio.ru/humorfm495/128/playlist.m3u8" }] },
    { name: "Авторадио", logoUrl: "img/radio/avtoradio.png", streams: [
        { name: "32 kbps", url: "https://hls-01-gpm.hostingradio.ru/avtoradio495/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-gpm.hostingradio.ru/avtoradio495/64/playlist.m3u8" },
        { name: "128 kbps", url: "https://hls-01-gpm.hostingradio.ru/avtoradio495/128/playlist.m3u8" }] },
    { name: "Ретро FM", logoUrl: "img/radio/retro_fm.png", streams: [
        { name: "64 kbps", url: "https://retro.hostingradio.ru:8043/retro64" },
        { name: "128 kbps", url: "https://retro.hostingradio.ru:8043/retro128" },
        { name: "256 kbps", url: "https://retro.hostingradio.ru:8043/retro256.mp3" }] },
    { name: "Дорожное Радио", logoUrl: "img/radio/dorozhnoe_radio.png", streams: [
        { name: "32 kbps", url: "https://hls-01-dorognoe.emgsound.ru/15_spb/32/playlist.m3u8" },
        { name: "64 kbps", url: "https://hls-01-dorognoe.emgsound.ru/15_spb/64/playlist.m3u8" },
        { name: "112 kbps", url: "https://hls-01-regions.emgsound.ru/15_spb/112/playlist.m3u8" }] },
    { name: "Маруся FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf176d9e.jpg", streams: [{ name: "Основной поток", url: "https://msk8.radio-holding.ru/marusya_default" }] },
    { name: "Record Russian Hits", logoUrl: "https://pcradio.ru/images/stations/61b09ca2ead8f.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/record_rushits-med" }] },
    { name: "Relax FM", logoUrl: "https://pcradio.ru/images/stations/62ea3ebda8c01.jpg", streams: [
        { name: "64 kbps", url: "https://pub0201.101.ru/stream/air/aac/64/200" },
        { name: "128 kbps", url: "https://hls-01-gpm.hostingradio.ru/relaxfm495/128/playlist.m3u8" }] },
    { name: "Соль FM", logoUrl: "https://pcradio.ru/images/stations/61b09cf2dc6d7.jpg", streams: [{ name: "Основной поток", url: "https://stream.pcradio.ru/sol_fm-hi" }] },
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
