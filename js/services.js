"use strict";

/* -------------------------------------------------------------------------- */
/*                      Initialize The Game On Page Load                      */
/* -------------------------------------------------------------------------- */

function onInit() {
  renderBoard(gBoard);
  renderLives();
  renderHints();
  updateStats();
  updateGlobalBestScores();
  saveStep();
  setProperDimensions();
}

/* -------------------------------------------------------------------------- */
/*                  When A Cell Is Clicked, Do The Following                  */
/* -------------------------------------------------------------------------- */

function cellClicked(elCell, i, j) {
  saveStep();
  var table=document.querySelector('tbody')
  var cell = gBoard[i][j];
  var pos = { i: i, j: j };
  var isHintMode = checkHintMode();
  if (gGame.numOfMinesToSet > 0 && gGame.isManualMode && !gGame.isOn) {
    setMineManualMode(cell, elCell);
    if (!gGame.numOfMinesToSet) {
      startGameManual();
      DisableClicks()
      return;
    }
  }
  if (gGame.isFirstClick && !gGame.isOn && !gGame.isManualMode) {
    FirstClick(i, j);
  }
  if (!getStats().livesLeft || !gGame.isOn) return;
  if (isHintMode) {
    deactivateHintMode();
    displayHints(pos);
    updateStats();
    return;
  }

  if (cell.minesAroundCount === 0 && !cell.isMine) {
    checkAndShowNegs(pos);
    updateStats();
    return;
  }
  if (cell.isMine) {
    table.classList.add('shake-hard')
    setTimeout(() => {
      table.classList.remove('shake-hard')
    }, 300);
    ReduceLives();
    if (!getStats().livesLeft) {
      explodeBombs();
      gameOver();
    }
  } else if (cell.isMarked) {
    unMarkCell(cell);
    updateShown(cell);

    elCell.innerHTML = cell.minesAroundCount;
    updateStats();
    return;
  } else {
    if (cell.isShown) removeLastSave();
    else {
      updateShown(cell);
      elCell.innerHTML = cell.minesAroundCount;
    }
  }
  updateStats();
}

/* -------------------------------------------------------------------------- */
/*                    Place A Flag At The Selected Location                   */
/* -------------------------------------------------------------------------- */

function plantFlag(e, elCell, i, j) {
  saveStep();
  e.preventDefault();
  if (!gGame.isOn) return;
  var cell = gBoard[i][j];
  if (cell.isMarked) {
    unMarkCell(cell);
    elCell.innerHTML = "";
  } else {
    markCell(cell);
    elCell.innerHTML = FLAG;
    elCell.classList.add('flagged')
  }
  updateStats();
}

/* -------------------------------------------------------------------------- */
/*      Update Game Starts In The Dom,end game if condition is satisfied      */
/* -------------------------------------------------------------------------- */

function updateStats() {
  var stats = getStats();
  if (stats.time === "null" || !stats.time)
    stats.time = "<br> No Winner On This Level Yet";
  document.querySelector(".difficulty").innerHTML = stats.currentLevel;
  document.querySelector(".results").innerHTML = stats.time;
  if (!stats.livesLeft) document.querySelector(".icon").innerHTML = SAD;
 else  if (
    stats.shownCount === stats.boardSize - stats.markedCount &&
    stats.markedCount === stats.minesCount
  ) {
    document.querySelector(".icon").innerHTML = WIN;
    gameOver();
  }
  else document.querySelector(".icon").innerHTML = NORMAL;
}

/* -------------------------------------------------------------------------- */
/*                      Reveal All The Bombs On The Board                     */
/* -------------------------------------------------------------------------- */

function explodeBombs() {
  var mines = MinesAroundMap();
  var elCells = mines.map(mine => {
    return document.querySelector(`.cell${mine.i}-${mine.j}`);
  });
  elCells.forEach(element => {
    element.innerHTML = BOMB;
    element.classList.add("exploded");
  });
}

/* -------------------------------------------------------------------------- */
/*                                 Set Levels                                 */
/* -------------------------------------------------------------------------- */

function easyMode() {
  setEasyMode();
  onInit();
  stopwatch.reset();
}
function hardMode() {
  setHardMode();
  onInit();
  stopwatch.reset();
}
function expertMode() {
  setExpertMode();
  onInit();
  stopwatch.reset();
}
function restartLevel() {
  restartCurrentLevel();
  onInit();
  stopwatch.reset();
}

/* -------------------------------------------------------------------------- */
/*     Set The Proper Height To The Td's Based On the Current Table Height    */
/* -------------------------------------------------------------------------- */

function setProperDimensions() {
  var elContainer = document.querySelector(".theBody");
  var table = document.querySelector(".container");
  var offsetHeight = elContainer.offsetHeight;
  var offsetWidth = table.offsetWidth;
  var level = gGame.currentLevel;
  if (level === "easy") table.style.fontSize = "2rem";
  if (level === "expert") table.style.fontSize = "0.6rem";
  document.querySelectorAll("td").forEach(td => {
    td.style.width = offsetWidth / (gBoard[0].length-1) + "px";
    td.style.height = offsetHeight / (gBoard.length-1) + "px";
  });
}

/* -------------------------------------------------------------------------- */
/*            Render Hints To The Game Board, Remove After 1.2 sec            */
/* -------------------------------------------------------------------------- */

function displayHints(pos) {
  var negCells = getNegCells(pos);
  var elements = [];
  for (var i = 0; i < negCells.length; i++) {
    var currCell = negCells[i];
    var cellPos = { i: currCell.i, j: currCell.j };
    var className = getClassName(cellPos);
    var elCell = document.querySelector(className);
    if (elCell.innerText !== "") continue;
    if (currCell.isMine) elCell.innerHTML = BOMB;
    else elCell.innerHTML = currCell.minesAroundCount;
    elements.push(elCell);
  }
  elements.forEach(element=>element.classList.add('open'))
  setTimeout(() => {
    removeHints(elements);
  }, 1200);
}

/* -------------------------------------------------------------------------- */
/*                                Remove Hints                                */
/* -------------------------------------------------------------------------- */

function removeHints(elements) {
  elements.forEach(element => (element.innerText = ""));
  elements.forEach(element=>element.classList.remove('open'))

}

function blinkCell(elCell) {
  elCell.classList.add("blinking");
  setTimeout(() => {
    elCell.classList.remove("blinking");
  }, 1800);
}
