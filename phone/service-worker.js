const CACHE_NAME = 'contact-list-v1';
const urlsToCache = [
    'https://pxl2a11.github.io/phone/index.html',
    'https://pxl2a11.github.io/phone/style.css',
    'https://pxl2a11.github.io/phone/script.js',
    'https://pxl2a11.github.io/phone/manifest.json',
    'https://pxl2a11.github.io/phone/logo.png',
    'https://pxl2a11.github.io/phone/img/logo-osk.png',
    'https://pxl2a11.github.io/phone/img/logo-nssz.png',
    // Добавьте сюда пути ко всем изображениям аватаров, если они существуют
    // Например: '/img/Имя контакта.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
