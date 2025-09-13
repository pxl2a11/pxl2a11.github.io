// js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://1tv.live/images/logo1.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=c58f502c7bb34a8fcdd976b221fca292"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
        { 
        name: "Россия 1", 
        logoUrl: "https://pic.rutubelist.ru/user/2025-02-24/59/f2/59f297ee687a9efe83c248bb2cf17911.jpg",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=c58f502c7bb34a8fcdd976b221fca292"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
            { 
        name: "МАТЧ ТВ", 
        logoUrl: "https://federal.tv/i/match-tv.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/play/embed/11bbbec75a2ceb8cf446ad16813c6eec"
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
    // Вы можете добавлять новые каналы сюда, копируя и изменяя этот объект
    // { 
    //     name: "Название канала", 
    //     logoUrl: "ссылка на логотип",
    //     embedHtml: "HTML код плеера (iframe)"
    // },
];
