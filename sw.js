// sw.js

const CACHE_NAME = 'mini-apps-cache-v24'; // ВЕРСИЯ КЭША ОБНОВЛЕНА!
const APP_SHELL_URL = '/index.html';

const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator',
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch',
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator',
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'caseConverter', 'imageConverter',
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame',
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048',
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator', 'mouseTester', 'keyboardTester', 'drawingPad',
    'textDiffTool', 'faviconGenerator', 'loanCalculator', 'typingTest',
    'changelogPage'
];

const appJsFiles = appModules.map(module => `/js/apps/${module}.js`);
const appSvgIcons = appModules.map(module => `/img/${module}.svg`);

const urlsToCache = [
  '/',
  APP_SHELL_URL,
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

  '/img/logo.svg',
  '/img/loading.svg',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/plusapps.svg',
  '/img/minusapps.svg',

  '/sounds/notification.wav',
  '/sounds/wheel-spinning.wav',
  '/sounds/wheel-winner.wav',
  // --- НОВЫЕ ЗВУКИ ДЛЯ ТАЙМЕРА ---
  '/sounds/notification.mp3',
  '/sounds/notification2.mp3',
  '/sounds/notification3.mp3',
  '/sounds/notification4.mp3',
  // ----------------------------------

  ...appJsFiles,
  ...appSvgIcons
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование основных ресурсов...');
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .catch(error => {
        console.error('Ошибка при кэшировании:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(APP_SHELL_URL);
        })
    );
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(fetchResponse => {
          if (request.method !== 'GET' || !fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
  );
});
