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
                src="https://vkvideo.ru/video_ext.php?oid=-47443314&id=456248162&hd=2&autoplay=1"
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
        name: "Пятый канал", 
        logoUrl: "https://smotret.tv/images/5-kanal.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/peterburg-5-kanal/player"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "Россия К", 
        logoUrl: "https://smotret.tv/images/kultura.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://kinodrom.tv/tv/rossiya-k/player"
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
