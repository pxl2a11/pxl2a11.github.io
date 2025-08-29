// sw.js

const CACHE_NAME = 'mini-apps-cache-v19'; // ВЕРСИЯ КЭША ОБНОВЛЕНА!

const APP_SHELL_URL = '/index.html'; // Явно указываем наш главный файл

const urlsToCache = [
  '/',
  APP_SHELL_URL, // Обязательно кэшируем главный файл
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
  '/img/minesweeper.svg',
  '/img/soundAndMicTest.svg',
  '/sounds/notification.wav',
  '/sounds/wheel-spinning.wav',
  '/sounds/wheel-winner.wav',
  // Динамически добавляемые ресурсы
  ...[
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator', 
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch', 
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator', 
    'bmiCalculator', 'wordCounter', 'qrScanner', 'piano', 'caseConverter', 'imageConverter', 
    'colorConverter', 'memoryGame', 'textTranslit', 'imageResizer', 'currencyCalculator', 'snakeGame', 
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048', 
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator', 'mouseTester', 'keyboardTester', 'drawingPad',
    'changelogPage'
  ].flatMap(module => [`/js/apps/${module}.js`, `/img/${module}.svg`])
];

// Установка Service Worker и кэширование всех ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование основных ресурсов...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Активируем новый SW сразу
  );
});

// Активация и очистка старых кэшей
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
    }).then(() => self.clients.claim()) // Берем контроль над открытыми страницами
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', event => {
  const { request } = event;

  // Для навигационных запросов (переход по страницам, запуск, обновление)
  if (request.mode === 'navigate') {
    event.respondWith(
      // Сначала пытаемся загрузить из сети
      fetch(request)
        .then(response => {
          // Если успешно, кэшируем свежую версию и отдаем ее
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, отдаем главный файл из кэша
          return caches.match(APP_SHELL_URL);
        })
    );
    return;
  }

  // Для всех остальных запросов (CSS, JS, картинки) - стратегия "Сначала кэш"
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Если ресурс есть в кэше - отдаем его
        if (response) {
          return response;
        }
        // Если нет - идем в сеть
        return fetch(request).then(networkResponse => {
            // И кэшируем его на будущее
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
            return networkResponse;
        });
      })
      .catch(() => {
        // Если ресурс не найден ни в кэше, ни в сети (для не-навигационных запросов)
        // можно вернуть заглушку, но для JS/CSS это обычно не нужно.
        // Для картинок можно было бы вернуть картинку-заглушку.
      })
  );
});
