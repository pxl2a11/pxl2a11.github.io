// sw.js

const CACHE_NAME = 'mini-apps-cache-v13'; // <-- ВЕРСЯ КЭША ОБНОВЛЕНА!

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
  // --- ИЗМЕНЕННЫЕ ПУТИ ---
  '/js/utils/lame.min.js',
  '/js/utils/jsQR.min.js',
  '/js/utils/leaflet.js',
  '/js/utils/qrcode.min.js',
  '/js/utils/jszip.min.js',
  '/js/utils/JsBarcode.all.min.js',
  '/js/utils/tailwind.js',
  '/js/utils/Sortable.min.js',
  '/js/changelog.js', // <-- ИЗМЕНЕННЫЙ ПУТЬ
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---
  '/js/dataManager.js',
  '/js/firebaseConfig.js',
  '/js/radioStationsData.js',
  
  // Кэшируем основные библиотеки Firebase и Google
  'https://accounts.google.com/gsi/client',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js',

  // Иконки, звуки и другие ресурсы
  '/img/logo.svg',
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
  self.skipWaiting(); // Принудительная активация нового SW
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
      ).then(() => self.clients.claim()); // Захватываем контроль над открытыми страницами
    })
  );
});

self.addEventListener('fetch', event => {
  // Игнорируем запросы, не являющиеся GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Стратегия: Cache falling back to network
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Если есть в кэше, отдаем из кэша
        if (cachedResponse) {
          return cachedResponse;
        }

        // Если нет в кэше, идем в сеть
        return fetch(event.request).catch(() => {
            // Если сеть недоступна, проверяем, это навигация или нет
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
        });
      });
    })
  );
});
