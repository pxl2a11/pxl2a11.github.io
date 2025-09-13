// js/apps/onlineTv.js
import { tvChannels } from '../tvChannelsData.js';

let channelListContainer, playerContainer, playerPlaceholder, channelCards = [];

function getHtml() {
    return `
        <style>
            .channel-list {
                max-height: 500px;
                overflow-y: auto;
                padding-right: 8px; /* Отступ для скроллбара */
            }
            .channel-card {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                border: 2px solid transparent;
            }
            .channel-card:hover {
                background-color: #f3f4f6; /* gray-100 */
            }
            .dark .channel-card:hover {
                background-color: #374151; /* dark:gray-700 */
            }
            .channel-card.active {
                background-color: #dbeafe; /* blue-100 */
                border-color: #3b82f6; /* blue-500 */
            }
            .dark .channel-card.active {
                background-color: #1e3a8a; /* dark:blue-900 */
                border-color: #60a5fa; /* dark:blue-400 */
            }
            .channel-card img {
                width: 40px;
                height: 40px;
                border-radius: 0.25rem;
                object-fit: contain;
                flex-shrink: 0;
            }
        </style>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1">
                <h3 class="text-lg font-semibold mb-3">Список каналов</h3>
                <div id="channel-list-container" class="channel-list space-y-2">
                    <!-- Каналы будут добавлены здесь -->
                </div>
            </div>
            <div class="lg:col-span-2">
                 <div id="tv-player-container" class="w-full aspect-video bg-black rounded-lg shadow-lg flex justify-center items-center">
                    <p id="tv-player-placeholder" class="text-gray-400">Выберите канал для просмотра</p>
                </div>
            </div>
        </div>
    `;
}

function selectChannel(channel) {
    playerContainer.innerHTML = channel.embedHtml;
    playerPlaceholder.classList.add('hidden');

    // Обновление активного состояния в списке
    channelCards.forEach(card => {
        card.classList.toggle('active', card.dataset.channelName === channel.name);
    });
}

function init() {
    channelListContainer = document.getElementById('channel-list-container');
    playerContainer = document.getElementById('tv-player-container');
    playerPlaceholder = document.getElementById('tv-player-placeholder');

    // Очищаем массив карточек перед заполнением
    channelCards = [];

    // Создаем карточки каналов
    tvChannels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.dataset.channelName = channel.name;
        card.innerHTML = `
            <img src="${channel.logoUrl}" alt="Логотип ${channel.name}">
            <span class="font-medium truncate">${channel.name}</span>
        `;
        card.addEventListener('click', () => selectChannel(channel));
        channelListContainer.appendChild(card);
        channelCards.push(card);
    });
}

function cleanup() {
    // Очищаем плеер при выходе из приложения, чтобы остановить воспроизведение
    if (playerContainer) {
        playerContainer.innerHTML = '';
    }
}

export { getHtml, init, cleanup };
