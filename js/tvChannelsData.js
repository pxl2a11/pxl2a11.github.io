// 27js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://smotret.tv/images/1-kanal.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/pervyy-kanal/player"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
        { 
        name: "Россия 1", 
        logoUrl: "https://smotret.tv/images/rossiya-1.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/rossiya-1/player"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
        { 
        name: "Матч!", 
        logoUrl: "https://smotret.tv/images/ntv.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/match-tv/player"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "НТВ", 
        logoUrl: "https://smotret.tv/images/ntv.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/telekompaniya-ntv/player"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
        { 
        name: "ТВ3", 
        logoUrl: "https://federal.tv/i/tv3.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=7bf12d9c050f9a7ef3728db5730432ae"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "ТНТ4", 
        logoUrl: "https://smotret.tv/images/tnt4.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://ok.ru/videoembed/979125083771?nochat=1&autoplay=1"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    // Вы можете добавлять новые каналы сюда, копируя и изменяя этот объект
    // { 
    //     name: "Название канала", 
    //     logoUrl: "ссылка на логотип",
    //     embedHtml: "HTML код плеера (iframe)"
    // },
];
