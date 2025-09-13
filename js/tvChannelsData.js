// js/tvChannelsData.js

export const tvChannels = [
    { 
        name: "Первый канал", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Channel_One_Russia_logo.svg/512px-Channel_One_Russia_logo.svg.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://rutube.ru/play/embed/c58f502c7bb34a8fcdd976b221fca292"
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
