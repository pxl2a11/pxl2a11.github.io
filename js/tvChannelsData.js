// js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://smotret.tv/images/1-kanal.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://smotret.tv/1a/1-kanal.html"
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
                src="https://smotret.tv/live/rossiya_1.html"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "МАТЧ ТВ", 
        logoUrl: "https://smotret.tv/images/matchtv.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=11bbbec75a2ceb8cf446ad16813c6eec"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "НТВ", 
        logoUrl: "https://federal.tv/i/ntv.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=c37cd74192c6bc3d6cd6077c0c4fd686"
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
