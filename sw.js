// sw.js

const CACHE_NAME = 'mini-apps-cache-v9'; // <-- ВЕРСИЯ КЭША ОБНОВЛЕНА!

// Приложения, которые НЕ работают офлайн
const onlineOnlyApps = ['speedTest', 'radio', 'myIp', 'currencyCalculator', 'notesAndTasks'];

// ИЗ СПИСКА УДАЛЕН 'changelogPage', так как у него нет отдельных файлов
const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator', 
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch', 
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator', 
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'caseConverter', 'imageConverter', 
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame', 
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048', 
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator',
    'mouseTester', // <-- ДОБАВЛЕНО
    'keyboardTester', // <-- ДОБАВЛЕНО
    'drawingPad' // <-- ДОБАВЛЕНО
];

// Эти две строки автоматически генерируют правильные пути для ВСЕХ модулей
const appJsFiles = appModules.map(module => `/js/apps/${module}.js`);
const appSvgIcons = appModules.map(module => `/img/${module}.svg`);

// Список файлов для кэширования (App Shell)
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
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  '/img/logo.svg',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/plusapps.svg',
  '/img/minusapps.svg',
  
  // РУЧНОЕ ДОБАВЛЕНИЕ УДАЛЕНО. Теперь всё добавляется автоматически и без ошибок.
  ...appJsFiles,
  ...appSvgIcons
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт для установки');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
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
      );
    })
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', event => {
  if (event.request.url.includes('firebase') || event.request.url.includes('google.com') || event.request.url.includes('googleapis.com')) {
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          const url = new URL(event.request.url);
          const requestedAppModule = url.searchParams.get('app');
          if (requestedAppModule && onlineOnlyApps.includes(requestedAppModule)) {
            return caches.match('/offline.html');
          }
          return caches.match('/index.html');
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
  );
});
