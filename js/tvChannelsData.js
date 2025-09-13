// js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://1tv.live/images/logo1.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/pl/?pl_id&pl_type&pl_video=c58f502c7bb34a8fcdd976b221fca292/?r=plwd"
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
