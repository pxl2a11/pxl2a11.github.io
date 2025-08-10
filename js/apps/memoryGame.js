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
            <div class="flex justify-between w-full max-w-lg">
                <div class="text-lg">Ходы: <span id="moves-counter">0</span></div>
                <button id="reset-game-btn" class="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">Начать заново</button>
            </div>
            <div id="memory-game-board" class="grid grid-cols-4 gap-4 w-full max-w-lg">
                <!-- Карточки будут сгенерированы здесь -->
            </div>
        </div>
    `;
}

let boardClickListener;

export function cleanup() {
    const board = document.getElementById('memory-game-board');
    if (board && boardClickListener) {
        board.removeEventListener('click', boardClickListener);
    }
}

export function init() {
    const gameBoard = document.getElementById('memory-game-board');
    const movesCounter = document.getElementById('moves-counter');
    const resetBtn = document.getElementById('reset-game-btn');
    
    const cardIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    let cards = [...cardIcons, ...cardIcons];

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function createBoard() {
        shuffle(cards);
        gameBoard.innerHTML = '';
        moves = 0;
        movesCounter.textContent = moves;
        
        cards.forEach(icon => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card', 'w-full', 'h-24', 'cursor-pointer');
            cardElement.dataset.icon = icon;
            
            cardElement.innerHTML = `
                <div class="card-inner relative w-full h-full">
                    <div class="card-face card-front absolute w-full h-full flex items-center justify-center bg-blue-500 rounded-lg"></div>
                    <div class="card-face card-back absolute w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg text-4xl">${icon}</div>
                </div>
            `;
            gameBoard.appendChild(cardElement);
        });
    }

    function flipCard(card) {
        if (lockBoard) return;
        if (card === firstCard) return;

        card.classList.add('is-flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = card;
            return;
        }

        secondCard = card;
        moves++;
        movesCounter.textContent = moves;
        checkForMatch();
    }

    function checkForMatch() {
        lockBoard = true;
        let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('is-flipped');
            secondCard.classList.remove('is-flipped');
            resetBoard();
        }, 1000);
    }
    
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    boardClickListener = function(e) {
        const clickedCard = e.target.closest('.memory-card');
        if (clickedCard) {
            flipCard(clickedCard);
        }
    };
    
    gameBoard.addEventListener('click', boardClickListener);

    resetBtn.addEventListener('click', createBoard);

    // Initial board creation
    createBoard();
}
