// sw.js

const CACHE_NAME = 'mini-apps-cache-v6'; // ВЕРСИЯ КЭША ОБНОВЛЕНА!

// Приложения, которые НЕ работают офлайн
const onlineOnlyApps = ['speedTest', 'radio', 'myIp', 'currencyCalculator', 'notesAndTasks'];

const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator', 
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch', 
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator', 
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'changelogPage', 'caseConverter', 'imageConverter', 
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame', 
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048', 
    'barcodeGenerator', 'voiceRecorder'
];

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
  '/img/colorConverter.svg',
  '/img/img/memoryGame.svg',
  '/img/textTranslit.svg',
  '/img/imageResizer.svg',
  '/img/currencyCalculator.svg',
  '/img/snakeGame.svg',
  '/img/timezoneConverter.svg',
  '/img/textToSpeech.svg',
  '/img/rockPaperScissors.svg',
  '/img/sudoku.svg',
  '/img/zipArchiver.svg',
  '/img/game2048.svg',
  '/img/barcodeGenerator.svg',
  '/img/voiceRecorder.svg',
  '/img/caseConverter.svg',
  '/img/imageConverter.svg',
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
  // Игнорируем запросы к Firebase и Google API
  if (event.request.url.includes('firebase') || event.request.url.includes('google.com') || event.request.url.includes('googleapis.com')) {
    return;
  }

  // === ИСПРАВЛЕННАЯ ЛОГИКА ===
  // Стратегия для навигационных запросов (переход по страницам)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Сначала пытаемся загрузить страницу из сети
      fetch(event.request)
        .catch(() => {
          // Если сеть недоступна (офлайн)
          const url = new URL(event.request.url);
          const requestedAppModule = url.searchParams.get('app');

          // Проверяем, не является ли запрашиваемое приложение "только онлайн"
          if (requestedAppModule && onlineOnlyApps.includes(requestedAppModule)) {
            // Если да, показываем специальную офлайн-страницу
            return caches.match('/offline.html');
          }

          // Для ВСЕХ остальных офлайн-запросов (главная страница, офлайн-приложения)
          // возвращаем главный файл-оболочку 'index.html'.
          // JS-роутер на клиенте сам поймет, какое приложение отрисовать.
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Стратегия "Сначала кэш, потом сеть" для всех остальных ресурсов (JS, CSS, SVG)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Если ресурс есть в кэше, отдаем его. Иначе идем в сеть.
        return cachedResponse || fetch(event.request);
      })
  );
});
