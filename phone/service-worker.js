const CACHE_NAME = 'contact-list-v1';
const urlsToCache = [
    '/phone/',
    '/phone/index.html',
    '/phone/style.css',
    '/phone/script.js',
    '/phone/manifest.json',
    '/phone/logo.png',
    '/phone/img/logo-osk.png',
    '/phone/img/logo-nssz.png',
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
