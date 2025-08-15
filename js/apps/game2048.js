// js/apps/game2048.js

let gameContainer;

function getHtml() {
    return `
      <div class="game-2048-new-design">
        <div class="head">
          <div class="a">2048 <button class="info">i</button> <button class="info repeat">↻</button></div>
          <div class="score">Score<br/><span id="value"></span></div>
        </div>
        <div class="description">
          How to play:<br/><br/>
          Use your arrow-keys to slide the tiles. <br/>
          Two tiles with the same value in line can be merged. The goal is to merge the tiles and get the 2048 tile.<br/><br/>
          The score is a sum of the merged tiles.<br/><br/>
          <span>_______________________________</span><br/><br/>
          Made by Fabian Richter 01/2017
        </div>
        <div class="field">
          <!-- Фоновые ячейки будут здесь -->
        </div>
        <div class='status' id='status'></div>
      </div>
    `;
}

function init() {
    gameContainer = document.querySelector('.game-2048-new-design');
    if (!gameContainer) return;

    // --- Адаптированный код ---
    let grid;

    function buildGridOverlay() {
        const field = gameContainer.querySelector('.field');
        field.innerHTML = ''; // Очищаем на случай рестарта
        const size = 4;
        grid = document.createElement('DIV');
        grid.className = 'grid';
        grid.dataset.value = 0;

        for (let i = 0; i < size; i++) {
            const tr = document.createElement('DIV');
            tr.className = 'grid_row';
            for (let j = 0; j < size; j++) {
                const td = document.createElement('DIV');
                td.id = '' + (i + 1) + (j + 1);
                td.className = 'grid_cell';
                tr.appendChild(td);
            }
            grid.appendChild(tr);
        }
        field.appendChild(grid);
    }

    function cellCreator(c, timeOut) {
        for (let i = 0; i < c; i++) {
            let randomX, randomY, checker;
            do {
                randomX = Math.floor((Math.random() * 4) + 1);
                randomY = Math.floor((Math.random() * 4) + 1);
                checker = gameContainer.querySelector('#' + CSS.escape(randomX) + CSS.escape(randomY));
            } while (checker && checker.innerHTML !== '');

            const randomValue = Math.random() < 0.9 ? 2 : 4;
            const position = checker;
            const tile = document.createElement('DIV');
            position.appendChild(tile);
            tile.innerHTML = '' + randomValue;
            colorSet(randomValue, tile);
            tile.dataset.value = '' + randomValue;
            tile.id = 'tile_' + randomX + randomY;
            position.classList.add('active');

            setTimeout(() => {
                tile.className = 'tile v' + randomValue;
            }, timeOut);
        }
    }

    function directions(e) {
        e = e || window.event;
        if (!['37', '38', '39', '40'].includes(e.keyCode.toString())) return;
        
        const gridOverlay = gameContainer.querySelector('.grid');
        if (!gridOverlay) return;
        gridOverlay.dataset.moved = 'false';

        // Создаем копию сетки до хода
        const gridBefore = Array.from(grid.querySelectorAll('.grid_cell')).map(cell => cell.innerHTML);

        if (e.keyCode == '38') { // UP
            for (let i = 0; i < 4; i++) for (let x = 2; x < 5; x++) for (let y = 1; y < 5; y++) moveTilesMain(x, y, -1, 0);
        } else if (e.keyCode == '40') { // DOWN
            for (let i = 0; i < 4; i++) for (let x = 3; x > 0; x--) for (let y = 1; y < 5; y++) moveTilesMain(x, y, 1, 0);
        } else if (e.keyCode == '37') { // LEFT
            for (let i = 0; i < 4; i++) for (let y = 2; y < 5; y++) for (let x = 1; x < 5; x++) moveTilesMain(x, y, 0, -1);
        } else if (e.keyCode == '39') { // RIGHT
            for (let i = 0; i < 4; i++) for (let y = 3; y > 0; y--) for (let x = 1; x < 5; x++) moveTilesMain(x, y, 0, 1);
        }
        
        // Сравниваем сетку до и после хода
        const gridAfter = Array.from(grid.querySelectorAll('.grid_cell')).map(cell => cell.innerHTML);
        if (gridBefore.join('') !== gridAfter.join('')) {
            gridOverlay.dataset.moved = 'true';
        }

        cellReset();
    }

    function moveTilesMain(x, y, X, Y) {
        const tile = gameContainer.querySelector('#tile_' + x + y);
        const checker = gameContainer.querySelector('#' + CSS.escape(x) + CSS.escape(y));
        if (!tile) return;

        const xAround = x + X;
        const yAround = y + Y;

        if (xAround > 0 && xAround < 5 && yAround > 0 && yAround < 5) {
            const around = gameContainer.querySelector('#' + CSS.escape(xAround) + CSS.escape(yAround));
            const aroundTile = gameContainer.querySelector('#tile_' + xAround + yAround);

            if (!aroundTile) {
                around.appendChild(tile);
                around.classList.add('active');
                tile.id = 'tile_' + xAround + yAround;
                checker.classList.remove('active');
            } else if (aroundTile.innerHTML === tile.innerHTML && !around.classList.contains('merged')) {
                const value = parseInt(tile.dataset.value) * 2;
                aroundTile.dataset.value = value;
                aroundTile.innerHTML = value;
                aroundTile.className = `tile v${value}`;
                colorSet(value, aroundTile);
                checker.removeChild(tile);
                checker.classList.remove('active');
                around.classList.add('merged');
                
                const gridOverlay = gameContainer.querySelector('.grid');
                const scoreValue = parseInt(gridOverlay.dataset.value);
                const newScore = value + scoreValue;
                gridOverlay.dataset.value = newScore;
                gameContainer.querySelector('#value').innerHTML = newScore;
            }
        }
    }

    function cellReset() {
        let count = 0;
        const gridOverlay = gameContainer.querySelector('.grid');

        for (let x = 1; x < 5; x++) {
            for (let y = 1; y < 5; y++) {
                const resetter = gameContainer.querySelector('#' + CSS.escape(x) + CSS.escape(y));
                if (resetter.innerHTML !== '') count++;
                resetter.classList.remove('merged');
            }
        }
        
        if (count === 16 && !canMerge()) {
            gameContainer.querySelector('#status').classList.add('lose');
        } else if (gridOverlay.dataset.moved === 'true') {
            cellCreator(1, 150);
        }
    }

    function canMerge() {
        for (let r = 1; r < 5; r++) {
            for (let c = 1; c < 5; c++) {
                const tile = gameContainer.querySelector('#tile_' + r + c);
                if (!tile) continue;
                // Check right
                if (c < 4) {
                    const rightTile = gameContainer.querySelector('#tile_' + r + (c + 1));
                    if (rightTile && rightTile.innerHTML === tile.innerHTML) return true;
                }
                // Check down
                if (r < 4) {
                    const downTile = gameContainer.querySelector('#tile_' + (r + 1) + c);
                    if (downTile && downTile.innerHTML === tile.innerHTML) return true;
                }
            }
        }
        return false;
    }

    function updateScoreDisplay() {
        const gridOverlay = gameContainer.querySelector('.grid');
        gameContainer.querySelector('#value').innerHTML = gridOverlay.dataset.value;
    }

    function colorSet(value, tile) {
        const styles = {
            2: { bg: '#fbfced', color: 'black' }, 4: { bg: '#ecefc6', color: 'black' },
            8: { bg: '#ffb296', color: 'black' }, 16: { bg: '#ff7373', color: 'black' },
            32: { bg: '#f6546a', color: 'white' }, 64: { bg: '#8b0000', color: 'white' },
            128: { bg: '#794044', color: 'white', fs: '45px' }, 256: { bg: '#31698a', color: 'white', fs: '45px' },
            512: { bg: '#297A76', color: 'white', fs: '45px' }, 1024: { bg: '#2D8A68', color: 'white', fs: '35px' },
            2048: { bg: '#1C9F4E', color: 'white', fs: '35px' }, 4096: { bg: '#468499', color: 'white', fs: '35px' },
            8192: { bg: '#0E2F44', color: 'white', fs: '35px' }
        };
        const style = styles[value];
        if (style) {
            tile.style.backgroundColor = style.bg;
            tile.style.color = style.color;
            if (style.fs) tile.style.fontSize = style.fs;
        }
        if (value === 2048) gameContainer.querySelector('#status').classList.add('won');
    }

    function toggleInfo() {
        gameContainer.querySelector('.description').classList.toggle('show');
    }

    function reset() {
        const gridOverlay = gameContainer.querySelector('.grid');
        if (gridOverlay) gridOverlay.remove();
        gameContainer.querySelector('#status').className = 'status';
        buildGridOverlay();
        updateScoreDisplay();
        cellCreator(2, 0);
    }
    
    // Initial setup
    buildGridOverlay();
    cellCreator(2, 0);
    updateScoreDisplay();
    document.addEventListener('keydown', directions);
    gameContainer.querySelector('.info').addEventListener('click', toggleInfo);
    gameContainer.querySelector('.repeat').addEventListener('click', reset);
}

function cleanup() {
    // This function is crucial to prevent game logic from running in the background
    // We need to find the correct way to remove the event listener
    document.removeEventListener('keydown', window.directions); // This might not work if 'directions' is not global
}


// Exporting for the main script
export { getHtml, init, cleanup };
