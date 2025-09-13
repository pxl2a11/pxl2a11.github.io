// 27js/tvChannelsData.js

export const tvChannels = [

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
        name: "СТС", 
        logoUrl: "https://smotret.tv/images/sts.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://vkvideo.ru/video_ext.php?oid=-18496184&id=456260645&hd=2&autoplay=1"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "Солнце", 
        logoUrl: "https://sun-tv.ru/static/images/img/about/logo.png",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://vkvideo.ru/video_ext.php?oid=-217596589&id=456240257&hd=2&autoplay=1"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
        { 
        name: "Суббота!", 
        logoUrl: "https://smotret.tv/images/subbota.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://vkvideo.ru/video_ext.php?oid=-155566339&id=456243314&hd=2&autoplay=1"
                style="border: none; border-radius: 0.5rem;"
                allow="clipboard-write; autoplay"
                allowFullScreen
            ></iframe>`
    },
    { 
        name: "2х2", 
        logoUrl: "https://smotret.tv/images/2x2.webp",
        embedHtml: `
            <iframe
                width="100%"
                height="100%"
                src="https://vkvideo.ru/video_ext.php?oid=-48864id=456249172&hd=2&autoplay=1"
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
