const CACHE_NAME = 'contact-list-v1';
const urlsToCache = [
  '/',
  'file:///D:\SOFT\Phone\2.0.html',
  '/manifest.json',
  '/sw.js',
  // Добавьте пути к вашим иконкам здесь
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Установка сервис-воркера и кэширование статических ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', event => {
  // Для iframe, который загружает http://contacts.nssz.local,
  // мы не можем напрямую кэшировать его содержимое из-за политики безопасности CORS.
  // Этот сервис-воркер будет кэшировать только ресурсы,
  // обслуживаемые с того же домена, что и PWA.
  // Запросы к http://contacts.nssz.local будут проходить напрямую через сеть.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Кэш попадает - возвращаем ресурс из кэша
        if (response) {
          return response;
        }
        // Кэш не попадает - делаем сетевой запрос
        return fetch(event.request).catch(() => {
          // Если сеть недоступна, а ресурс не в кэше,
          // можно вернуть заглушку или страницу offline.
          // В данном случае, так как основной контент iframe,
          // это сложнее сделать для внешнего домена.
          // Для ресурсов, которые вы контролируете, это будет работать.
        });
      })
  );
});

// Активация сервис-воркера и удаление старых кэшей
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
