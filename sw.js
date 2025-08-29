// sw.js

// ИЗМЕНЕНИЕ: Версия кэша увеличена, чтобы гарантировать обновление у всех пользователей.
const CACHE_NAME = 'mini-apps-cache-v17'; 

const onlineOnlyApps = ['speedTest', 'radio', 'myIp', 'currencyCalculator', 'notesAndTasks', 'siteSkeletonGenerator'];

const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator', 
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch', 
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator', 
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'caseConverter', 'imageConverter', 
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame', 
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048', 
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator', 'mouseTester', 'keyboardTester', 'drawingPad',
    // ДОБАВЛЕНО: Недостающий модуль changelogPage
    'changelogPage'
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
  
  // URL-ы сторонних сервисов лучше не кэшировать напрямую,
  // так как они могут измениться. Service Worker перехватит и закэширует их при первом запросе.
  
  '/img/logo.svg',
  '/img/loading.svg', // Уже был здесь, но убеждаемся, что он есть
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/plusapps.svg',
  '/img/minusapps.svg',
  '/img/minesweeper.svg',
  '/img/soundAndMicTest.svg',
  
  // ДОБАВЛЕНО: Звуки для приложений
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
        // Используем { cache: 'reload' } чтобы убедиться, что мы кэшируем свежие файлы, а не из HTTP-кэша браузера
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

// ИЗМЕНЕНИЕ: Улучшенная стратегия кэширования "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
  // Пропускаем не-GET запросы и запросы к расширениям Chrome
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Для навигационных запросов (переход по страницам) используем стратегию "Network falling back to Cache"
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Если сеть недоступна, пытаемся отдать страницу из кэша
          return caches.match(event.request)
            .then(response => response || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Для всех остальных ресурсов (CSS, JS, изображения) используем "Stale-While-Revalidate"
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // 1. Отдаем ресурс из кэша немедленно, если он там есть
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // 2. В фоне делаем запрос к сети
          // 3. Если запрос успешен, обновляем кэш
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
            // Если сеть недоступна и ресурса нет в кэше, вернется ошибка (что нормально для некритичных ресурсов)
        });
        
        return response || fetchPromise;
      });
    })
  );
});
