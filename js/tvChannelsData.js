// js/tvChannelsData.js

export const tvChannels = [
    {
        name: "Первый канал HD",
        logoUrl: "https://smotret.tv/images/1-kanal.webp",
        type: "hls", // Указываем тип потока
        streamUrl: "https://edge1.1internet.tv/dash-live2/streams/1tv-dvr/1tvdash.mpd"
    },
    {
        name: "Первый канал FHD",
        logoUrl: "https://smotret.tv/images/1-kanal-hd.webp",
        type: "hls", // Указываем тип потока
        streamUrl: "https://edge4.1internet.tv/dash-live2/streams/1tv-dvr/1tvdash.mpd"
    },
       {
        name: "Россия 1",
        logoUrl: "https://smotret.tv/images/1-kanal.webp",
        type: "hls", // Указываем тип потока
        streamUrl: "https://zabava-htlive.cdn.ngenix.net/hls/CH_RUSSIA1/variant.m3u8"
    },
    {
        name: "Россия 1 HD",
        logoUrl: "https://smotret.tv/images/1-kanal-hd.webp",
        type: "hls", // Указываем тип потока
        streamUrl: "https://live-mirror-01.ott.tricolor.tv/live/live/Rossia_1_0_hd/hls_enc/Rossia_1_0_hd.m3u8?drmreq=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfdHlwZSI6ImFwdHBfb3R0IiwiY2xhc3MiOiJCUk9XU0VSIiwiZHJlaWQiOiI0NTAyNTUwMDM1ODM5NSIsImV4cCI6MTc1ODA3NDQyNywiaHdpZCI6IjhkMjA0NWE1N2E3NjVkYzUyMjVmYzJkZmRlNWY0NzViMDA0NzU0MmFlZDhjMWEyNGNlY2YzODNkY2ZjYmY2MjYiLCJsYXN0X3JlcV9kYXRlIjoxNzU3NDY5NjI3LCJzZXNzaW9uX2lkIjoiZDlmZTgxOTFmYTFjMjQ4ZjUzN2ViNjVlOWE0M2ZjOGQiLCJ0b2tlbl90eXBlIjoiQ29udGVudEFjY2Vzc1Rva2VuIiwidHlwZSI6Ik1PWklMTEEifQ.g1L-cwTkjltXHyAVVKPyFgLG7fmTOOKtj33WrsSL8hE"
    },
    {
        name: "МАТЧ ТВ",
        logoUrl: "https://smotret.tv/images/matchtv.webp",
        type: "iframe",
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
        type: "iframe",
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
        type: "iframe",
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
        type: "iframe",
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
];
