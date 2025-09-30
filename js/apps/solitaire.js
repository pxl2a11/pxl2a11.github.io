// js/apps/solitaire.js

// --- Глобальные переменные модуля ---
let deck = [];
let stock = [];
let waste = [];
let foundations = [[], [], [], []]; // 4 "дома"
let tableau = [[], [], [], [], [], [], []]; // 7 стопок на столе

let draggedCards = [];
let sourcePileElement = null;

// --- HTML и CSS ---

export function getHtml() {
    return `
        <style>
            .solitaire-board { user-select: none; }
            .solitaire-top, .solitaire-tableau { display: flex; gap: 10px; }
            .solitaire-tableau { margin-top: 20px; }
            .pile { width: 90px; height: 130px; border: 2px solid rgba(0,0,0,0.2); border-radius: 8px; position: relative; }
            .dark .pile { border-color: rgba(255,255,255,0.2); }

            .card {
                width: 90px; height: 130px; border-radius: 8px;
                background-color: white; border: 1px solid #777;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                position: absolute; cursor: pointer;
                display: flex; flex-direction: column; justify-content: space-between; padding: 5px;
                font-size: 1.2rem; font-weight: bold;
                box-sizing: border-box;
            }
            .dark .card { background-color: #374151; border-color: #6b7280; color: #f3f4f6; }

            .card .suit { font-size: 1.5rem; }
            .card.red { color: #dc2626; }
            .dark .card.red { color: #f87171; }
            .card.black { color: #111827; }
            .dark .card.black { color: #f3f4f6; }

            .card.face-down {
                background-image: linear-gradient(135deg, #4299e1 25%, #5a67d8 25%, #5a67d8 50%, #4299e1 50%, #4299e1 75%, #5a67d8 75%, #5a67d8 100%);
                background-size: 28.28px 28.28px;
            }
            .card.face-down .rank, .card.face-down .suit { display: none; }
            
            .tableau-pile .card { margin-top: 25px; } /* Смещение карт в стопках */
            .tableau-pile .card:first-child { margin-top: 0; }
            
            #stock-pile.empty {
                background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%239CA3AF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 4v6h-6\"/><path d=\"M1 20v-6h6\"/><path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"/></svg>');
                background-repeat: no-repeat;
                background-position: center;
                cursor: pointer;
            }

            .dragging { opacity: 0.5; }
            .drag-over { border-style: dashed; border-color: #3b82f6; }

            .solitaire-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; text-align: center; }
        </style>

        <div class="solitaire-board max-w-2xl mx-auto p-4 bg-green-700 dark:bg-green-900 rounded-lg shadow-lg relative">
            <div class="solitaire-top">
                <div class="flex gap-4">
                    <div id="stock-pile" class="pile"></div>
                    <div id="waste-pile" class="pile"></div>
                </div>
                <div class="flex-grow"></div>
                <div class="solitaire-foundations">
                    ${[0,1,2,3].map(i => `<div id="foundation-${i}" class="pile foundation-pile"></div>`).join('')}
                </div>
            </div>
            <div class="solitaire-tableau">
                 ${[0,1,2,3,4,5,6].map(i => `<div id="tableau-${i}" class="pile tableau-pile"></div>`).join('')}
            </div>
            <div class="mt-4 text-center">
                <button id="new-game-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Новая игра</button>
            </div>
            <div id="win-overlay" class="solitaire-overlay rounded-lg">
                <div class="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                    <h2 class="text-3xl font-bold text-green-500">Поздравляем!</h2>
                    <p class="mt-2">Вы выиграли!</p>
                </div>
            </div>
        </div>
    `;
}


// --- Логика игры ---

function startGame() {
    // 1. Создание и тасование колоды
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    deck = [];
    for (const suit of suits) {
        for (let i = 0; i < ranks.length; i++) {
            deck.push({
                rank: ranks[i],
                suit: suit,
                value: i + 1,
                color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                id: `${ranks[i]}${suit[0].toUpperCase()}`,
                isFaceUp: false,
            });
        }
    }
    
    // Тасование (алгоритм Фишера-Йетса)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // 2. Сброс состояния и раздача
    stock = [];
    waste = [];
    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    document.getElementById('win-overlay').style.display = 'none';

    // Раздача на стол (tableau)
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            if (j === i) card.isFaceUp = true; // Последняя карта в стопке лицом вверх
            tableau[i].push(card);
        }
    }
    
    // Остаток колоды в "магазин" (stock)
    stock = deck;
    
    renderBoard();
}

function renderBoard() {
    // Очистка и рендер стопок стола (tableau)
    for (let i = 0; i < 7; i++) {
        const pileEl = document.getElementById(`tableau-${i}`);
        pileEl.innerHTML = '';
        tableau[i].forEach((card, index) => {
            const cardEl = createCardElement(card);
            cardEl.style.top = `${index * 25}px`;
            pileEl.appendChild(cardEl);
        });
    }

    // Рендер "домов" (foundations)
    for (let i = 0; i < 4; i++) {
        const pileEl = document.getElementById(`foundation-${i}`);
        pileEl.innerHTML = '';
        if (foundations[i].length > 0) {
            const topCard = foundations[i][foundations[i].length - 1];
            pileEl.appendChild(createCardElement(topCard));
        }
    }
    
    // Рендер "сброса" (waste)
    const wastePileEl = document.getElementById('waste-pile');
    wastePileEl.innerHTML = '';
    if (waste.length > 0) {
        const topCard = waste[waste.length - 1];
        wastePileEl.appendChild(createCardElement(topCard));
    }
    
    // Рендер "магазина" (stock)
    const stockPileEl = document.getElementById('stock-pile');
    stockPileEl.innerHTML = '';
    stockPileEl.classList.toggle('empty', stock.length === 0);
    if (stock.length > 0) {
        const stockCard = createCardElement(stock[0]);
        stockCard.classList.add('face-down');
        stockPileEl.appendChild(stockCard);
    }
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className = `card ${card.color}`;
    el.draggable = card.isFaceUp;
    el.dataset.cardId = card.id;

    if (!card.isFaceUp) {
        el.classList.add('face-down');
    } else {
        const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        el.innerHTML = `
            <div class="rank">${card.rank}</div>
            <div class="suit">${suitSymbols[card.suit]}</div>
        `;
    }
    return el;
}

// --- Обработка действий игрока ---

function handleStockClick() {
    if (stock.length > 0) {
        const card = stock.pop();
        card.isFaceUp = true;
        waste.push(card);
    } else if (waste.length > 0) {
        stock = waste.reverse();
        stock.forEach(c => c.isFaceUp = false);
        waste = [];
    }
    renderBoard();
}

function canMoveToTableau(draggedCards, targetCard) {
    if (draggedCards.length === 0) return false;
    const firstDragged = draggedCards[0];
    
    if (!targetCard) { // Перемещение на пустую стопку
        return firstDragged.value === 13; // Только Король (K)
    }
    
    // Перемещение на другую карту
    return firstDragged.color !== targetCard.color && firstDragged.value === targetCard.value - 1;
}

function canMoveToFoundation(draggedCard, foundationPile) {
    if (!draggedCard) return false;
    
    if (foundationPile.length === 0) { // Перемещение на пустой "дом"
        return draggedCard.value === 1; // Только Туз (A)
    }
    
    const topCard = foundationPile[foundationPile.length - 1];
    return draggedCard.suit === topCard.suit && draggedCard.value === topCard.value + 1;
}

function getCardById(cardId) {
    const allPiles = [...tableau, ...foundations, waste, stock];
    for (const pile of allPiles) {
        const found = pile.find(c => c.id === cardId);
        if (found) return found;
    }
    return null;
}

function findCardLocation(cardId) {
    for (let i = 0; i < tableau.length; i++) {
        const cardIndex = tableau[i].findIndex(c => c.id === cardId);
        if (cardIndex > -1) return { pile: 'tableau', pileIndex: i, cardIndex: cardIndex };
    }
    if (waste.length > 0 && waste[waste.length - 1].id === cardId) {
        return { pile: 'waste', pileIndex: -1, cardIndex: waste.length - 1 };
    }
     for (let i = 0; i < foundations.length; i++) {
        if (foundations[i].length > 0 && foundations[i][foundations[i].length - 1].id === cardId) {
            return { pile: 'foundation', pileIndex: i, cardIndex: foundations[i].length - 1 };
        }
    }
    return null;
}

function checkWinCondition() {
    const totalCardsInFoundations = foundations.reduce((sum, pile) => sum + pile.length, 0);
    if (totalCardsInFoundations === 52) {
        document.getElementById('win-overlay').style.display = 'flex';
    }
}

// --- Инициализация и очистка ---

export function init() {
    const boardEl = document.querySelector('.solitaire-board');

    boardEl.addEventListener('click', (e) => {
        const stockPile = e.target.closest('#stock-pile');
        if (stockPile) {
            handleStockClick();
        }
    });

    boardEl.addEventListener('dblclick', (e) => {
        const cardEl = e.target.closest('.card:not(.face-down)');
        if (!cardEl) return;
        
        const cardId = cardEl.dataset.cardId;
        const card = getCardById(cardId);
        const location = findCardLocation(cardId);
        
        // Позволяем авто-перемещение только для верхних карт стопок и сброса
        if (!card || (location.pile === 'tableau' && location.cardIndex !== tableau[location.pileIndex].length - 1) && location.pile !== 'waste') {
            return;
        }

        for (let i = 0; i < 4; i++) {
            if (canMoveToFoundation(card, foundations[i])) {
                // Убираем карту из исходной стопки
                let sourcePile;
                if (location.pile === 'tableau') sourcePile = tableau[location.pileIndex];
                else if (location.pile === 'waste') sourcePile = waste;
                
                sourcePile.pop();
                
                // Переворачиваем карту, если нужно
                if (location.pile === 'tableau' && sourcePile.length > 0) {
                     sourcePile[sourcePile.length - 1].isFaceUp = true;
                }
                
                // Добавляем в "дом"
                foundations[i].push(card);
                renderBoard();
                checkWinCondition();
                return;
            }
        }
    });

    // --- Логика Drag & Drop ---
    
    boardEl.addEventListener('dragstart', (e) => {
        const cardEl = e.target.closest('.card:not(.face-down)');
        if (!cardEl) { e.preventDefault(); return; }
        
        const location = findCardLocation(cardEl.dataset.cardId);
        if (!location) return;

        draggedCards = [];
        if (location.pile === 'tableau') {
            draggedCards = tableau[location.pileIndex].slice(location.cardIndex);
        } else {
            const card = getCardById(cardEl.dataset.cardId);
            if (card) draggedCards.push(card);
        }
        
        sourcePileElement = cardEl.parentElement;
        setTimeout(() => {
             draggedCards.forEach(c => {
                const el = document.querySelector(`[data-card-id="${c.id}"]`);
                if (el) el.classList.add('dragging');
            });
        }, 0);
    });

    boardEl.addEventListener('dragend', (e) => {
        draggedCards = [];
        sourcePileElement = null;
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    });

    boardEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        const pileEl = e.target.closest('.pile');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        if(pileEl) pileEl.classList.add('drag-over');
    });

    boardEl.addEventListener('drop', (e) => {
        e.preventDefault();
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        const targetPileEl = e.target.closest('.pile');
        if (!targetPileEl || draggedCards.length === 0) return;

        const sourceLocation = findCardLocation(draggedCards[0].id);
        if(!sourceLocation) return;
        
        let isValid = false;

        // Перемещение на "дом"
        if (targetPileEl.classList.contains('foundation-pile')) {
            const foundationIndex = parseInt(targetPileEl.id.split('-')[1]);
            if (draggedCards.length === 1 && canMoveToFoundation(draggedCards[0], foundations[foundationIndex])) {
                foundations[foundationIndex].push(draggedCards[0]);
                isValid = true;
            }
        }
        // Перемещение на стол
        else if (targetPileEl.classList.contains('tableau-pile')) {
            const tableauIndex = parseInt(targetPileEl.id.split('-')[1]);
            const targetPile = tableau[tableauIndex];
            const targetCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;
            if (canMoveToTableau(draggedCards, targetCard)) {
                tableau[tableauIndex].push(...draggedCards);
                isValid = true;
            }
        }

        if (isValid) {
            // Убираем карты из исходной стопки
            let sourcePile;
            if (sourceLocation.pile === 'tableau') sourcePile = tableau[sourceLocation.pileIndex];
            else if (sourceLocation.pile === 'waste') sourcePile = waste;
            else if (sourceLocation.pile === 'foundation') sourcePile = foundations[sourceLocation.pileIndex];

            sourcePile.splice(sourceLocation.cardIndex);
            
            // Переворачиваем карту в исходной стопке, если нужно
            if (sourceLocation.pile === 'tableau' && sourcePile.length > 0) {
                sourcePile[sourcePile.length-1].isFaceUp = true;
            }

            renderBoard();
            checkWinCondition();
        }
    });

    document.getElementById('new-game-btn').addEventListener('click', startGame);
    
    startGame();
}

export function cleanup() {
    // В данном приложении нет глобальных слушателей или таймеров,
    // все события привязаны к элементам внутри .solitaire-board,
    // поэтому специальная очистка не требуется.
}
