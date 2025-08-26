// js/apps/rockPaperScissors.js

const CHOICES = ['rock', 'paper', 'scissors'];
const ICONS = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};
let playerScore = 0;
let computerScore = 0;

let playerScoreEl, computerScoreEl, resultTextEl, playerChoiceEl, computerChoiceEl;

function computerPlay() {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex];
}

function playRound(playerSelection, computerSelection) {
    if (playerSelection === computerSelection) {
        return "Ничья!";
    }
    if (
        (playerSelection === 'rock' && computerSelection === 'scissors') ||
        (playerSelection === 'scissors' && computerSelection === 'paper') ||
        (playerSelection === 'paper' && computerSelection === 'rock')
    ) {
        playerScore++;
        return "Вы выиграли!";
    } else {
        computerScore++;
        return "Вы проиграли!";
    }
}

function updateUI(playerSelection, computerSelection, result) {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    resultTextEl.textContent = result;
    playerChoiceEl.textContent = `Ваш выбор: ${ICONS[playerSelection]}`;
    computerChoiceEl.textContent = `Выбор компьютера: ${ICONS[computerSelection]}`;
}

function handlePlayerChoice(event) {
    const playerSelection = event.target.closest('button')?.dataset.choice;
    if (!playerSelection) return;

    const computerSelection = computerPlay();
    const result = playRound(playerSelection, computerSelection);
    updateUI(playerSelection, computerSelection, result);
}

export function getHtml() {
    return `
        <div class="text-center">
            <h3 class="text-2xl font-bold mb-4">Сделайте свой выбор!</h3>
            
            <div class="flex justify-center gap-4 sm:gap-8 mb-8">
                <button data-choice="rock" class="rps-btn text-5xl p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-110">${ICONS.rock}</button>
                <button data-choice="paper" class="rps-btn text-5xl p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-110">${ICONS.paper}</button>
                <button data-choice="scissors" class="rps-btn text-5xl p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-110">${ICONS.scissors}</button>
            </div>

            <div class="text-xl font-semibold p-4 rounded-lg bg-blue-100 dark:bg-gray-700 min-h-[50px] flex items-center justify-center mb-6">
                <span id="result-text">Начните игру</span>
            </div>

            <div class="flex justify-around items-center text-lg">
                <div id="player-choice" class="font-medium">Ваш выбор: ?</div>
                <div id="computer-choice" class="font-medium">Выбор компьютера: ?</div>
            </div>

            <div class="mt-6 text-2xl font-bold">
                <span>Счет:</span>
                <span id="player-score" class="text-green-500">0</span> : <span id="computer-score" class="text-red-500">0</span>
                <span>(Вы : Компьютер)</span>
            </div>
        </div>
    `;
}

export function init() {
    playerScoreEl = document.getElementById('player-score');
    computerScoreEl = document.getElementById('computer-score');
    resultTextEl = document.getElementById('result-text');
    playerChoiceEl = document.getElementById('player-choice');
    computerChoiceEl = document.getElementById('computer-choice');

    const choiceButtons = document.querySelectorAll('.rps-btn');
    choiceButtons.forEach(button => {
        button.addEventListener('click', handlePlayerChoice);
    });

    // Сброс счета при инициализации
    playerScore = 0;
    computerScore = 0;
}

export function cleanup() {
    // Никаких таймеров или глобальных слушателей, поэтому очистка не требуется.
}
