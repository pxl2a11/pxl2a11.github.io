// sw.js

const CACHE_NAME = 'mini-apps-cache-v10'; // <-- ВЕРСИЯ КЭША ОБНОВЛЕНА!

// Приложения, которые НЕ работают офлайн
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
  '/js/Sortable.min.js', // <-- ИСПРАВЛЕН ПУТЬ!
  '/js/dataManager.js',
  '/js/firebaseConfig.js',
  '/js/radioStationsData.js',
  '/js/utils/changelog.js',
  
  // Кэшируем основные библиотеки Firebase и Google
  'https://accounts.google.com/gsi/client',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js',

  // Иконки и звуки
  '/img/logo.svg',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  '/img/plusapps.svg',
  '/img/minusapps.svg',
  '/sounds/notification.wav',
  '/sounds/wheel-spinning.wav',
  '/sounds/wheel-winner.wav',
  
  // Автоматически сгенерированные списки
  ...appJsFiles,
  ...appSvgIcons
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт для установки');
        // Используем { cache: 'reload' } чтобы убедиться, что мы кэшируем свежие файлы, а не из HTTP-кэша браузера
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
            console.error("Не удалось закэшировать все файлы при установке:", err);
            // Если какой-то файл не удалось загрузить, установка SW провалится.
            // Это хорошо, т.к. предотвращает установку "сломанной" версии.
        });
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
  const url = new URL(event.request.url);

  // Для навигации: пытаемся загрузить из сети, при ошибке показываем офлайн-страницу
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          const requestedAppModule = url.searchParams.get('app');
          if (requestedAppModule && onlineOnlyApps.includes(requestedAppModule)) {
            return caches.match('/offline.html');
          }
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Для статических ресурсов: сначала из кэша, потом из сети (Cache First)
  // Это подходит для большинства наших локальных файлов (css, js, img)
  if (url.origin === self.location.origin) {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || fetch(event.request);
          })
      );
      return;
  }

  // Для сторонних ресурсов (Firebase, Google, Leaflet): сначала из сети, потом из кэша (Network Falling Back to Cache)
  // Это обеспечивает актуальность библиотек, но позволяет работать офлайн
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request).then(response => {
        // Если запрос успешен, кэшируем его и возвращаем
        cache.put(event.request, response.clone());
        return response;
      }).catch(() => {
        // Если сеть недоступна, пытаемся найти ответ в кэше
        return caches.match(event.request);
      });
    })
  );
});
