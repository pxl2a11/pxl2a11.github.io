// 04js/apps/onlineTv.js
import { tvChannels } from '../tvChannelsData.js';
import { getUserData, saveUserData } from '../dataManager.js';

// --- Глобальные переменные модуля ---
let channelListContainer, playerContainer, playerPlaceholder, searchInput, favoritesFilterBtn;
let channelCards = [];
let eventListeners = [];
let favorites = [];
let isFavoritesFilterActive = false;
const FAVORITES_KEY = 'favoriteTvChannels';

/**
 * Вспомогательная функция для безопасного добавления и отслеживания обработчиков событий.
 */
function addListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

function getHtml() {
    return `
        <style>
            .channel-list {
                overflow-y: auto;
                padding-right: 8px;
                flex-grow: 1; /* Растягивается на всё доступное место в flex-контейнере */
                min-height: 0; 
            }
            .channel-card {
                display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.75rem;
                transition: all 0.2s ease-in-out; border: 2px solid transparent; width: 100%; text-align: left;
            }
            .channel-card:hover { background-color: #f3f4f6; }
            .dark .channel-card:hover { background-color: #374151; }
            .channel-card.active { background-color: #dbeafe; border-color: #3b82f6; }
            .dark .channel-card.active { background-color: #1e3a8a; border-color: #60a5fa; }
            .channel-card img { width: 50px; height: 50px; border-radius: 0.5rem; object-fit: contain; flex-shrink: 0; }
            .channel-card .play-area { cursor: pointer; flex-grow: 1; display: flex; align-items: center; gap: 0.75rem; }

            .favorite-btn { padding: 0.25rem; border-radius: 9999px; margin-left: auto; flex-shrink: 0; background: none; border: none; cursor: pointer; }
            .favorite-btn:hover { background-color: rgba(0,0,0,0.1); }
            .dark .favorite-btn:hover { background-color: rgba(255,255,255,0.1); }
            .favorite-btn .star-icon { width: 24px; height: 24px; color: #9ca3af; transition: all 0.2s; }
            .favorite-btn.is-favorite .star-icon { color: #f59e0b; fill: currentColor; }
            #favorites-filter-btn.active { background-color: #f59e0b; }
            #favorites-filter-btn.active svg { color: white; fill: white; }
        </style>
        <!-- Контейнер, который ограничивает максимальную ширину и центрирует контент -->
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                     <!-- Плеер с фиксированной высотой 480px -->
                     <div id="tv-player-container" class="w-full h-[480px] bg-black rounded-lg shadow-lg flex justify-center items-center">
                        <p id="tv-player-placeholder" class="text-gray-400">Выберите канал для просмотра</p>
                    </div>
                </div>
                <!-- Правая колонка с фиксированной высотой 480px -->
                <div class="lg:col-span-1 flex flex-col h-[480px]">
                    <!-- Панель поиска не будет сжиматься -->
                    <div class="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div class="relative flex-grow">
                            <input id="channel-search-input" type="search" placeholder="Поиск канала..." class="w-full p-3 pl-10 rounded-full border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"/>
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button id="favorites-filter-btn" title="Показать избранное" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0">
                            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </button>
                    </div>
                    <!-- Этот контейнер растягивается, заполняя оставшееся место, и скроллится при необходимости -->
                    <div id="channel-list-container" class="channel-list space-y-2">
                        <!-- Каналы будут добавлены здесь -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectChannel(channel) {
    playerContainer.innerHTML = channel.embedHtml;
    playerPlaceholder.classList.add('hidden');
    channelCards.forEach(card => {
        card.classList.toggle('active', card.dataset.channelName === channel.name);
    });
}

async function loadFavorites() {
    favorites = await getUserData(FAVORITES_KEY, []);
}

async function saveFavorites() {
    await saveUserData(FAVORITES_KEY, favorites);
}

async function toggleFavorite(channelName) {
    const index = favorites.indexOf(channelName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(channelName);
    }
    await saveFavorites();
    const cardToUpdate = channelCards.find(card => card.dataset.channelName === channelName);
    if (cardToUpdate) {
        cardToUpdate.querySelector('.favorite-btn').classList.toggle('is-favorite', index === -1);
    }
    if (isFavoritesFilterActive && index > -1) {
        filterChannels();
    }
}

function createChannelCards() {
    channelListContainer.innerHTML = '';
    channelCards = [];
    tvChannels.forEach(channel => {
        const isFavorite = favorites.includes(channel.name);
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.dataset.channelName = channel.name;
        card.innerHTML = `
            <div class="play-area">
                <img src="${channel.logoUrl}" alt="Логотип ${channel.name}">
                <span class="font-medium truncate">${channel.name}</span>
            </div>
            <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" title="Добавить в избранное">
                <svg class="star-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </button>
        `;
        addListener(card.querySelector('.play-area'), 'click', () => selectChannel(channel));
        addListener(card.querySelector('.favorite-btn'), 'click', () => toggleFavorite(channel.name));
        channelListContainer.appendChild(card);
        channelCards.push(card);
    });
}

function filterChannels() {
    const searchTerm = searchInput.value.toLowerCase();
    channelCards.forEach(card => {
        const channelName = card.dataset.channelName;
        const isFavorite = favorites.includes(channelName);
        
        const matchesSearch = channelName.toLowerCase().includes(searchTerm);
        const matchesFilter = !isFavoritesFilterActive || isFavorite;
        
        card.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
}

async function init() {
    channelListContainer = document.getElementById('channel-list-container');
    playerContainer = document.getElementById('tv-player-container');
    playerPlaceholder = document.getElementById('tv-player-placeholder');
    searchInput = document.getElementById('channel-search-input');
    favoritesFilterBtn = document.getElementById('favorites-filter-btn');

    await loadFavorites();
    createChannelCards();

    addListener(searchInput, 'input', filterChannels);
    addListener(favoritesFilterBtn, 'click', () => {
        isFavoritesFilterActive = !isFavoritesFilterActive;
        favoritesFilterBtn.classList.toggle('active', isFavoritesFilterActive);
        filterChannels();
    });
}

function cleanup() {
    if (playerContainer) {
        playerContainer.innerHTML = '';
    }
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
    isFavoritesFilterActive = false;
}

export { getHtml, init, cleanup };
