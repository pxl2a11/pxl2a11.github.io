// js/apps/audiobookPlayer.js
import { getUserData, saveUserData } from '../dataManager.js';

// --- Глобальные переменные модуля ---
let audioPlayer, fileInput, chapterList, bookmarkList, speedSlider, speedValue, addBookmarkBtn;
let currentBook = null;
let eventListeners = [];

// --- Вспомогательные функции ---

/**
 * Добавляет обработчик событий и сохраняет его для последующей очистки.
 * @param {HTMLElement} element - Элемент, к которому добавляется слушатель.
 * @param {string} event - Тип события.
 * @param {Function} handler - Функция-обработчик.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

/**
 * Форматирует секунды в строку вида ЧЧ:ММ:СС.
 * @param {number} totalSeconds - Общее количество секунд.
 * @returns {string} - Отформатированное время.
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Создает уникальный идентификатор для книги на основе имен ее файлов.
 * @param {FileList} files - Список файлов книги.
 * @returns {string} - Уникальный ключ.
 */
function generateBookKey(files) {
    return Array.from(files).map(f => `${f.name}_${f.size}`).join('|');
}


// --- Основная логика ---

/**
 * Загружает и отображает аудиокнигу.
 * @param {FileList} files - Файлы, выбранные пользователем.
 */
function loadBook(files) {
    // Сортируем файлы по имени для правильного порядка глав
    const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
    const bookKey = generateBookKey(sortedFiles);
    const savedData = getUserData(bookKey, { chapter: 0, time: 0, bookmarks: [] });
    
    currentBook = {
        key: bookKey,
        files: sortedFiles,
        currentChapter: savedData.chapter,
        bookmarks: savedData.bookmarks
    };
    
    document.getElementById('player-section').classList.remove('hidden');
    document.getElementById('upload-section').classList.add('hidden');
    
    renderChapterList();
    renderBookmarkList();
    loadChapter(currentBook.currentChapter, savedData.time);
}

/**
 * Загружает определенную главу в плеер.
 * @param {number} chapterIndex - Индекс главы для загрузки.
 * @param {number} startTime - Время, с которого начать воспроизведение.
 */
function loadChapter(chapterIndex, startTime = 0) {
    if (!currentBook || chapterIndex < 0 || chapterIndex >= currentBook.files.length) return;
    
    currentBook.currentChapter = chapterIndex;
    const file = currentBook.files[chapterIndex];
    const fileUrl = URL.createObjectURL(file);
    
    audioPlayer.src = fileUrl;
    audioPlayer.currentTime = startTime;
    audioPlayer.playbackRate = parseFloat(speedSlider.value);
    
    // Обновляем UI
    document.querySelectorAll('#chapter-list button').forEach((btn, index) => {
        btn.classList.toggle('active', index === chapterIndex);
    });
}

/**
 * Сохраняет текущий прогресс прослушивания.
 */
function saveProgress() {
    if (!currentBook) return;
    saveUserData(currentBook.key, {
        chapter: currentBook.currentChapter,
        time: audioPlayer.currentTime,
        bookmarks: currentBook.bookmarks
    });
}

/**
 * Добавляет новую закладку.
 */
function addBookmark() {
    if (!currentBook || audioPlayer.paused) return;
    
    const newBookmark = {
        chapter: currentBook.currentChapter,
        time: audioPlayer.currentTime,
        name: `Глава ${currentBook.currentChapter + 1} - ${formatTime(audioPlayer.currentTime)}`
    };
    
    // Предотвращаем дублирование закладок
    if (!currentBook.bookmarks.some(b => b.chapter === newBookmark.chapter && b.time === newBookmark.time)) {
        currentBook.bookmarks.push(newBookmark);
        saveProgress();
        renderBookmarkList();
    }
}


// --- Функции рендеринга UI ---

/**
 * Отображает список глав.
 */
function renderChapterList() {
    chapterList.innerHTML = '';
    currentBook.files.forEach((file, index) => {
        const chapterButton = document.createElement('button');
        chapterButton.className = 'chapter-btn w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 truncate';
        chapterButton.textContent = file.name;
        chapterButton.onclick = () => loadChapter(index);
        chapterList.appendChild(chapterButton);
    });
}

/**
 * Отображает список закладок.
 */
function renderBookmarkList() {
    bookmarkList.innerHTML = '';
    if (currentBook.bookmarks.length === 0) {
        bookmarkList.innerHTML = `<p class="text-sm text-gray-500 dark:text-gray-400">Нет закладок.</p>`;
        return;
    }
    
    currentBook.bookmarks.forEach((bookmark, index) => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item flex justify-between items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600';
        bookmarkItem.innerHTML = `
            <button class="flex-grow text-left truncate" title="${bookmark.name}">${bookmark.name}</button>
            <button data-index="${index}" class="remove-bookmark-btn text-red-500 hover:text-red-700 p-1 flex-shrink-0">✖</button>
        `;
        
        bookmarkItem.querySelector('button.flex-grow').onclick = () => {
            loadChapter(bookmark.chapter, bookmark.time);
            audioPlayer.play();
        };
        
        bookmarkItem.querySelector('.remove-bookmark-btn').onclick = () => {
            currentBook.bookmarks.splice(index, 1);
            saveProgress();
            renderBookmarkList();
        };
        
        bookmarkList.appendChild(bookmarkItem);
    });
}


// --- Экспортируемые функции для main.js ---

export function getHtml() {
    return `
        <style>
            .chapter-btn.active { background-color: #3b82f6; color: white; }
            .dark .chapter-btn.active { background-color: #60a5fa; color: #1f2937; }
        </style>
        <div class="space-y-6 max-w-4xl mx-auto">
            <!-- Секция загрузки -->
            <div id="upload-section">
                <h3 class="text-xl font-semibold text-center mb-4">Загрузите аудиокнигу</h3>
                <label for="audiobook-file-input" class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H12a4 4 0 014 4v1m-6 4h6m-3-3v6"></path></svg>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Нажмите, чтобы выбрать файлы глав (.mp3, .m4a, .wav)</p>
                </label>
                <input type="file" id="audiobook-file-input" multiple accept="audio/*" class="hidden">
            </div>

            <!-- Секция плеера (изначально скрыта) -->
            <div id="player-section" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Основной плеер и элементы управления -->
                <div class="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
                    <audio id="audiobook-player" controls class="w-full"></audio>
                    <div class="flex items-center gap-4">
                        <label for="speed-slider" class="text-sm font-medium">Скорость:</label>
                        <input type="range" id="speed-slider" min="0.5" max="2" step="0.1" value="1" class="w-full">
                        <span id="speed-value" class="font-mono w-10 text-center">1.0x</span>
                    </div>
                    <button id="add-bookmark-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Добавить закладку</button>
                </div>

                <!-- Списки глав и закладок -->
                <div class="lg:col-span-1 space-y-4">
                    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h4 class="text-lg font-semibold mb-2">Главы</h4>
                        <div id="chapter-list" class="space-y-1 max-h-48 overflow-y-auto"></div>
                    </div>
                    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h4 class="text-lg font-semibold mb-2">Закладки</h4>
                        <div id="bookmark-list" class="space-y-1 max-h-48 overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    // Получаем элементы DOM
    audioPlayer = document.getElementById('audiobook-player');
    fileInput = document.getElementById('audiobook-file-input');
    chapterList = document.getElementById('chapter-list');
    bookmarkList = document.getElementById('bookmark-list');
    speedSlider = document.getElementById('speed-slider');
    speedValue = document.getElementById('speed-value');
    addBookmarkBtn = document.getElementById('add-bookmark-btn');
    
    // --- Назначаем обработчики событий ---

    // Выбор файлов
    addListener(fileInput, 'change', (e) => {
        if (e.target.files.length > 0) {
            loadBook(e.target.files);
        }
    });

    // Изменение скорости воспроизведения
    addListener(speedSlider, 'input', () => {
        const speed = parseFloat(speedSlider.value);
        audioPlayer.playbackRate = speed;
        speedValue.textContent = `${speed.toFixed(1)}x`;
    });

    // Добавление закладки
    addListener(addBookmarkBtn, 'click', addBookmark);

    // Автоматическое сохранение прогресса каждые 5 секунд
    addListener(audioPlayer, 'timeupdate', () => {
        if (Math.floor(audioPlayer.currentTime) % 5 === 0) {
            saveProgress();
        }
    });

    // Переход к следующей главе по окончании текущей
    addListener(audioPlayer, 'ended', () => {
        if (currentBook && currentBook.currentChapter < currentBook.files.length - 1) {
            loadChapter(currentBook.currentChapter + 1);
            audioPlayer.play();
        }
    });
}

export function cleanup() {
    // Сохраняем прогресс перед выходом
    saveProgress();
    
    // Очищаем URL объекта, чтобы избежать утечек памяти
    if (audioPlayer && audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
    }
    
    // Удаляем все слушатели событий
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
    currentBook = null;
}
