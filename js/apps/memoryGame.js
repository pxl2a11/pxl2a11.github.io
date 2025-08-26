// js/apps/memoryGame.js

export function getHtml() {
    return `
        <style>
            .memory-card { perspective: 1000px; }
            .memory-card .card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
            .memory-card.is-flipped .card-inner { transform: rotateY(180deg); }
            .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            .card-back { transform: rotateY(180deg); }
        </style>
        <div class="flex flex-col items-center gap-4">
            <div class="flex justify-between w-full max-w-lg items-center">
                <!-- ИЗМЕНЕНИЕ: ДОБАВЛЕН ТАЙМЕР -->
                <div class="flex gap-4 text-lg">
                    <div>Ходы: <span id="moves-counter">0</span></div>
                    <div>Время: <span id="timer">00:00</span></div>
                </div>
                <button id="reset-game-btn" class="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">Начать заново</button>
            </div>
            <div id="memory-game-board" class="grid grid-cols-4 gap-4 w-full max-w-lg relative">
                <!-- НОВЫЙ ЭЛЕМЕНТ: СООБЩЕНИЕ О ПОБЕДЕ -->
                <div id="win-message" class="hidden absolute inset-0 bg-black bg-opacity-70 flex-col items-center justify-center text-white text-2xl font-bold rounded-lg z-10">
                    <p>Поздравляем!</p>
                    <p id="win-stats" class="text-lg mt-2"></p>
                </div>
                <!-- Карточки будут сгенерированы здесь -->
            </div>
        </div>
    `;
}

let boardClickListener, timerInterval; // Добавлен timerInterval

export function cleanup() {
    const board = document.getElementById('memory-game-board');
    if (board && boardClickListener) board.removeEventListener('click', boardClickListener);
    if (timerInterval) clearInterval(timerInterval); // Очистка таймера
}

export function init() {
    const gameBoard = document.getElementById('memory-game-board');
    const movesCounter = document.getElementById('moves-counter');
    const resetBtn = document.getElementById('reset-game-btn');
    const timerEl = document.getElementById('timer'); // Новый элемент
    const winMessageEl = document.getElementById('win-message'); // Новый элемент
    const winStatsEl = document.getElementById('win-stats'); // Новый элемент
    
    const cardIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    let cards = [...cardIcons, ...cardIcons];
    let hasFlippedCard = false, lockBoard = false, firstCard, secondCard;
    let moves = 0, matchedPairs = 0, seconds = 0;

    const startTimer = () => {
        if(timerInterval) clearInterval(timerInterval);
        seconds = 0;
        timerEl.textContent = '00:00';
        timerInterval = setInterval(() => {
            seconds++;
            const min = String(Math.floor(seconds / 60)).padStart(2, '0');
            const sec = String(seconds % 60).padStart(2, '0');
            timerEl.textContent = `${min}:${sec}`;
        }, 1000);
    };

    function createBoard() {
        shuffle(cards);
        gameBoard.innerHTML = '';
        winMessageEl.classList.add('hidden');
        moves = 0;
        matchedPairs = 0;
        movesCounter.textContent = moves;
        lockBoard = false;
        
        cards.forEach(icon => { /* ... (без изменений) ... */ });
        startTimer();
    }
    
    function checkForMatch() {
        lockBoard = true;
        let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        if (isMatch) {
            matchedPairs++;
            disableCards();
            if (matchedPairs === cardIcons.length) {
                clearInterval(timerInterval);
                winStatsEl.textContent = `Вы справились за ${moves} ходов и ${timerEl.textContent}!`;
                setTimeout(() => winMessageEl.classList.remove('hidden'), 500);
            }
        } else {
            unflipCards();
        }
    }
    
    // Остальные функции (shuffle, flipCard, disableCards, unflipCards, resetBoard) без изменений,
    // за исключением createBoard и checkForMatch.
    function shuffle(array) { array.sort(() => Math.random() - 0.5); }
    function flipCard(card) { if (lockBoard || card === firstCard) return; card.classList.add('is-flipped'); if (!hasFlippedCard) { hasFlippedCard = true; firstCard = card; return; } secondCard = card; moves++; movesCounter.textContent = moves; checkForMatch(); }
    function disableCards() { firstCard.removeEventListener('click', flipCard); secondCard.removeEventListener('click', flipCard); resetBoard(); }
    function unflipCards() { setTimeout(() => { firstCard.classList.remove('is-flipped'); secondCard.classList.remove('is-flipped'); resetBoard(); }, 1000); }
    function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }
    
    boardClickListener = function(e) { /* ... (без изменений) ... */ };
    
    gameBoard.addEventListener('click', boardClickListener);
    resetBtn.addEventListener('click', createBoard);
    createBoard();
}
