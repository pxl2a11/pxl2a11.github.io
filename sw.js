// sw.js

const CACHE_NAME = 'mini-apps-cache-v12'; // <-- ВЕРСЯ КЭША ОБНОВЛЕНА!

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
  '/js/lame.min.js',
  '/js/jsQR.min.js',
  '/js/leaflet.js',
  '/js/qrcode.min.js',
  '/js/jszip.min.js',
  '/js/JsBarcode.all.min.js',
  '/js/tailwind.js',
  '/js/Sortable.min.js',
  '/js/dataManager.js',
  '/js/firebaseConfig.js',
  '/js/radioStationsData.js',
  '/js/utils/changelog.js',
  
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
  '/img/soundAndMicTest.svg', // <-- Добавлен недостающий ресурс для Диктофона
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
