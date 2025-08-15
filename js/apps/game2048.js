// js/apps/game2048.js

// Глобальные переменные модуля, чтобы к ним был доступ из всех функций
let gameContainer;
let scoreValueEl;
let descriptionEl;
let statusEl;

function getHtml() {
    // Возвращаем HTML-структуру, адаптированную для вставки в контейнер приложения
    return `
        <div class="game-2048-new-container">
            <div class="head">
                <div class="a">2048 <button class="info">i</button> <button id="repeat" class="info repeat">↻</button></div>
                <div class="score">Score<br/><span id="value">0</span></div>
            </div>
            <div class="description" id="description">
                How to play:<br/><br/>
                Use your arrow-keys to slide the tiles. <br/>
                Two tiles with the same value in line can be merged. The goal is to merge the tiles and get the 2048 tile.<br/><br/>
                The score is a sum of the merged tiles.<br><br/>
                <span>_______________________________</span><br/><br/>
                Made by Fabian Richter 01/2017
            </div>
            <div class="field">
                <div class="row">
                    <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                </div>
                <div class="row">
                    <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                </div>
                <div class="row">
                    <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                </div>
                <div class="row">
                    <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
                </div>
            </div>
            <div class='' id='status'></div>
        </div>
    `;
}


function init() {
    // Находим основные элементы внутри контейнера приложения
    gameContainer = document.querySelector('.game-2048-new-container');
    scoreValueEl = gameContainer.querySelector('#value');
    descriptionEl = gameContainer.querySelector('#description');
    statusEl = gameContainer.querySelector('#status');

    // Привязываем события к кнопкам
    gameContainer.querySelector('.info').addEventListener('click', info);
    gameContainer.querySelector('#repeat').addEventListener('click', reset);

    // Запускаем игровую логику
    buildGridOverlay();
    cellCreator(2, 0);
    document.addEventListener('keydown', directions);
    updateScoreDisplay(0);
}

function cleanup() {
    // Удаляем глобальный слушатель событий клавиатуры при выходе из приложения
    document.removeEventListener('keydown', directions);
}

// --- ВСЯ ИГРОВАЯ ЛОГИКА ИЗ ПРЕДОСТАВЛЕННОГО КОДА ---

function buildGridOverlay() {
  var size = 4;
  var table = document.createElement('DIV');

  table.className = 'grid';
  table.id = 'grid-overlay';
  table.dataset.value = 0;
  
  for (var i = 0; i < size; i++) {
    var tr = document.createElement('DIV');
    table.appendChild(tr);
    tr.id = 'row_' + (i+1);
    tr.className = 'grid_row';
    
    for (var j = 0; j < size; j++) {
      var td = document.createElement('DIV');
      td.id = '' +(i+1) +(j+1);
      td.className = 'grid_cell';
      tr.appendChild(td);
    }
  }
  // Вставляем сетку в наш основной контейнер, а не в body
  gameContainer.appendChild(table);
  return table;
}

function cellCreator(c, timeOut) {
  for (var i = 0; i < c; i++) {
    var value = 1;
    var randomX, randomY, checker;
    do {
      randomX = Math.floor((Math.random()*4)+1);
      randomY = Math.floor((Math.random()*4)+1);
      checker = gameContainer.querySelector('#' + CSS.escape(randomX) + CSS.escape(randomY));
    } while (checker && checker.innerHTML !== '');

    var randomValue = Math.random() < 0.9 ? 2 : 4;
    var position = checker;
    var tile = document.createElement('DIV');
    position.appendChild(tile);
    tile.innerHTML = ''+randomValue;
    
    colorSet(randomValue, tile);
    tile.dataset.value = ''+randomValue;
    tile.id = 'tile_'+randomX +randomY;
    position.className += ' active';
    
    if (timeOut == 0) {
      tile.className = 'tile v'+randomValue;
    } else {
      setTimeout(() => {
        tile.className = 'tile v'+randomValue;
      }, 10);
    }
  }
}

function directions(e) {
  e = e || window.event;
  var gridOverlay = gameContainer.querySelector('#grid-overlay');
  if (!gridOverlay) return; // Проверка, что мы находимся в игре
  gridOverlay.id = '';

  if (e.keyCode == '38') { // UP
    for (let i=0; i<3; i++) {
      for (let x = 2; x < 5; x++) {
        for (let y = 1; y < 5; y++) {
          moveTilesMain(x, y, -1, 0);
        }
      }
    }
  } else if (e.keyCode == '40') { // DOWN
    for (let i=0; i<3; i++) {
      for (let x = 3; x > 0; x--) {
        for (let y = 1; y < 5; y++) {
          moveTilesMain(x, y, 1, 0);
        }
      }
    }
  } else if (e.keyCode == '37') { // LEFT
    for (let i=0; i<3; i++) {
      for (let y = 2; y < 5; y++) {
        for (let x = 1; x < 5; x++) {
          moveTilesMain(x, y, 0, -1);
        }
      }
    }
  } else if (e.keyCode == '39') { // RIGHT
    for (let i=0; i<3; i++) {
      for (let y = 3; y > 0; y--) {
        for (let x = 1; x < 5; x++) {
          moveTilesMain(x, y, 0, 1);
        }
      }
    }
  }
  
  if(['37','38','39','40'].includes(e.keyCode.toString())) {
      cellReset();
  }
}

function moveTilesMain(x, y, X, Y) {
  var tile = gameContainer.querySelector('#tile_'+x +y);
  var checker = gameContainer.querySelector('#' + CSS.escape(x) + CSS.escape(y));
  
  if (!tile) return;

  var xAround = x + X;
  var yAround = y + Y;

  if (xAround > 0 && xAround < 5 && yAround > 0 && yAround < 5) {
    var around = gameContainer.querySelector('#' + CSS.escape(xAround) + CSS.escape(yAround));
    var aroundTile = gameContainer.querySelector('#tile_'+xAround +yAround);

    if (!aroundTile) { // Move
      around.appendChild(tile);
      around.className = 'grid_cell active';
      tile.id = 'tile_'+xAround +yAround;
      checker.className = 'grid_cell';
      gameContainer.querySelector('#grid-overlay').id = 'moved';
    } else if (aroundTile.innerHTML == tile.innerHTML && around.className.indexOf('merged') === -1) { // Merge
      var value = parseInt(tile.dataset.value) * 2;
      aroundTile.dataset.value = value;
      aroundTile.className = 'tile v'+value;
      aroundTile.innerHTML = value;
      colorSet(value, aroundTile);
      checker.removeChild(tile);
      checker.className = 'grid_cell';
      around.className = 'grid_cell active merged';
      gameContainer.querySelector('#grid-overlay').id = 'moved';
      
      var grid = gameContainer.querySelector('#grid-overlay');
      var scoreValue = parseInt(grid.dataset.value);
      var newScore = value + scoreValue;
      grid.dataset.value = newScore;
      updateScoreDisplay(newScore);
    }
  }
}

function cellReset() {
  var count = 0;
  var gridOverlay = gameContainer.querySelector('#grid-overlay');
  var moved = gridOverlay.id === 'moved';
  
  for (var x=1; x<5; x++) {
    for (var y=1; y<5; y++) {
      var resetter = gameContainer.querySelector('#' + CSS.escape(x) + CSS.escape(y));
      if (resetter.innerHTML !== '') count++;
      if (resetter.className.indexOf('merged') !== -1) {
        resetter.className = 'grid_cell active';
      }
    }
  }
  
  if (count === 16) {
    statusEl.className = 'lose';
  } else if (moved) {
    cellCreator(1, 1); 
  }
  gridOverlay.id = '';
}

function updateScoreDisplay(newScore) {
    if(scoreValueEl) scoreValueEl.innerHTML = newScore;
}

function colorSet(value, tile) {
  const colors = {
    2:    { bg: '#fbfced', color: 'black' },
    4:    { bg: '#ecefc6', color: 'black' },
    8:    { bg: '#ffb296', color: 'black' },
    16:   { bg: '#ff7373', color: 'black' },
    32:   { bg: '#f6546a', color: 'white' },
    64:   { bg: '#8b0000', color: 'white' },
    128:  { bg: '#794044', color: 'white', fs: '50px' },
    256:  { bg: '#31698a', color: 'white', fs: '50px' },
    512:  { bg: '#297A76', color: 'white', fs: '50px' },
    1024: { bg: '#2D8A68', color: 'white', fs: '40px' },
    2048: { bg: '#1C9F4E', color: 'white', fs: '40px' },
    4096: { bg: '#468499', color: 'white', fs: '40px' },
    8192: { bg: '#0E2F44', color: 'white', fs: '40px' }
  };
  
  const style = colors[value];
  if (style) {
    tile.style.background = style.bg;
    tile.style.color = style.color;
    if (style.fs) tile.style.fontSize = style.fs;
  }

  if (value === 2048 && statusEl) {
      statusEl.className = 'won';
  }
}

function info() {
  if (descriptionEl) descriptionEl.classList.toggle('show');
}

function reset() {
  for (var x = 1; x < 5; x++) {
    for (var y = 1; y < 5; y++) {
      var resetter = gameContainer.querySelector('#' + CSS.escape(x) + CSS.escape(y));
      if (resetter && resetter.className.indexOf('active') !== -1) {
        resetter.innerHTML = '';
      }
    }
  }
  if(statusEl) statusEl.className = '';
  const grid = gameContainer.querySelector('#grid-overlay');
  if(grid) grid.dataset.value = 0;
  
  updateScoreDisplay(0);
  cellReset();
  cellCreator(2, 0);
}

// Экспортируем функции, необходимые для работы с main.js
export { getHtml, init, cleanup };
