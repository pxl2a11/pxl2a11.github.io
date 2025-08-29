// sw.js

const CACHE_NAME = 'mini-apps-cache-v15'; // <-- ВЕРСИЯ КЭША ОБНОВЛЕНА!

// ... (остальные константы остаются без изменений) ...

const onlineOnlyApps = ['speedTest', 'radio', 'myIp', 'currencyCalculator', 'notesAndTasks', 'siteSkeletonGenerator'];

const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator', 
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch', 
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator', 
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'caseConverter', 'imageConverter', 
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame', 
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048', 
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator', 'mouseTester', 'keyboardTester', 'drawingPad'
];

const appJsFiles = appModules.map(module => `/js/apps/${module}.js`);
const appSvgIcons = appModules.map(module => `/img/${module}.svg`);

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/css/leaflet.css',
  '/js/main.js',
  '/js/utils/lame.min.js',
  '/js/utils/jsQR.min.js',
  '/js/utils/leaflet.js',
  '/js/utils/qrcode.min.js',
  '/js/utils/jszip.min.js',
  '/js/utils/JsBarcode.all.min.js',
  '/js/utils/tailwind.js',
  '/js/utils/Sortable.min.js',
  '/js/changelog.js',
  '/js/dataManager.js',
  '/js/firebaseConfig.js',
  '/js/radioStationsData.js',
  
  'https://accounts.google.com/gsi/client',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js',

  '/img/logo.svg',
  '/img/loading.svg',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/plusapps.svg',
  '/img/minusapps.svg',
  '/img/minesweeper.svg',
  '/img/soundAndMicTest.svg',
  '/sounds/notification.wav',
  '/sounds/wheel-spinning.wav',
  '/sounds/wheel-winner.wav',
  
  ...appJsFiles,
  ...appSvgIcons
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт для установки');
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
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
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});


// --- ИЗМЕНЕНИЕ: НОВАЯ, УЛУЧШЕННАЯ ЛОГИКА ОБРАБОТКИ FETCH ---
self.addEventListener('fetch', event => {
  // Игнорируем запросы, не являющиеся GET
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Для HTML-страниц (навигационных запросов) используем стратегию "Network First"
  // Это гарантирует, что пользователь всегда получит самую свежую версию страницы, если есть интернет.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Если ответ успешный, кэшируем его
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся достать из кэша
          return caches.match(event.request).then(response => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Для всех остальных ресурсов (JS, CSS, картинки) используем "Stale-While-Revalidate"
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Запрос в сеть для обновления кэша
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Возвращаем ответ из кэша немедленно, если он есть,
        // или ждем ответа из сети, если его нет в кэше.
        return response || fetchPromise;
      });
    })
  );
});
