// js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://1tv.live/images/logo1.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://vkvideo.ru/video-25380626_456283287"
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
