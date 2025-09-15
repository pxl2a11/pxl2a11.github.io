// sw.js

const CACHE_NAME = 'mini-apps-cache-v58'; // ВЕРСИЯ КЭША ОБНОВЛЕНА!
const APP_SHELL_URL = '/index.html';
const OFFLINE_URL = '/offline.html';

// Список модулей приложений для автоматического кеширования их JS и SVG файлов
const appModules = [
    'speedTest', 'radio', 'notesAndTasks', 'soundAndMicTest', 'audioCompressor', 'myIp', 'passwordGenerator',
    'percentageCalculator', 'timer', 'fortuneWheel', 'magicBall', 'ticTacToe', 'minesweeper', 'stopwatch',
    'randomColor', 'numberGenerator', 'qrCodeGenerator', 'emojiAndSymbols', 'unitConverter', 'dateCalculator',
    'bmiCalculator', 'qrScanner', 'piano', 'caseConverter',
    'colorConverter', 'memoryGame', 'textTranslit', 'currencyCalculator', 'snakeGame',
    'timezoneConverter', 'textToSpeech', 'rockPaperScissors', 'sudoku', 'zipArchiver', 'game2048',
    'barcodeGenerator', 'voiceRecorder', 'siteSkeletonGenerator', 'mouseTester', 'keyboardTester', 'drawingPad',
    'textDiffTool', 'faviconGenerator', 'loanCalculator', 'typingTest',
    'screenRecorder',
    'flappyBird',
    'changelogPage',
    'textAnalyzer',
    'virtualDice',
    'calorieCalculator',
    'calculator',
    'imageEditor',
    'onlineTv'
];

// Автоматически генерируем пути к файлам на основе списка модулей
const appJsFiles = appModules.map(module => `/js/apps/${module}.js`);
const appSvgIcons = appModules.map(module => `/img/${module}.svg`);

// Основной список файлов для кеширования
const urlsToCache = [
  '/',
  APP_SHELL_URL,
  OFFLINE_URL,
  '/manifest.json?v=3',
  '/css/style.css',
  '/css/leaflet.css',
  
  // Основные скрипты
  '/js/main.js',
  '/js/changelog.js',
  '/js/dataManager.js',
  '/js/firebaseConfig.js',
  '/js/radioStationsData.js',
  '/js/tvChannelsData.js',
  
  // Библиотеки из папки /js/utils/
  '/js/utils/lame.min.js',
  '/js/utils/jsQR.min.js',
  '/js/utils/leaflet.js',
  '/js/utils/qrcode.min.js',
  '/js/utils/jszip.min.js',
  '/js/utils/JsBarcode.all.min.js',
  '/js/utils/tailwind.js',
  '/js/utils/Sortable.min.js',
  
  // Изображения из папки /img/
  '/img/logo.svg',
  '/img/loading.svg',
  '/img/plusapps.svg',
  '/img/minusapps.svg',
  '/img/lock.svg',
  '/img/unlock.svg',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-512x512.png',
  
  // Звуки из папки /sounds/
  '/sounds/wheel-spinning.wav',
  '/sounds/wheel-winner.wav',
  '/sounds/notification.mp3',
  '/sounds/notification2.mp3',
  '/sounds/notification3.mp3',
  '/sounds/notification4.mp3',
  
  // Автоматически добавленные JS-файлы приложений и их иконки
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

  // Стратегия для навигационных запросов (переход по страницам)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Сначала пытаемся загрузить из сети
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // Если сеть не удалась, ищем в кеше основную страницу
          console.log('Сетевой запрос не удался. Попытка открыть из кеша...');
          const cachedResponse = await caches.match(APP_SHELL_URL);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Если и в кеше нет, показываем оффлайн-страницу
          console.log('Основная страница не найдена в кеше. Показываем оффлайн-страницу.');
          return await caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // Стратегия "сначала кеш, потом сеть" для остальных ресурсов (JS, CSS, картинки)
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Если ресурс есть в кеше, возвращаем его
        if (response) {
          return response;
        }
        // Иначе, делаем запрос в сеть
        return fetch(request).then(fetchResponse => {
          // Не кешируем неудачные запросы или не-GET запросы
          if (request.method !== 'GET' || !fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          // Клонируем ответ и сохраняем его в кеш для будущего использования
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
  );
});
