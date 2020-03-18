"use strict";

/* -------------------------------------------------------------------------- */
/*                              Global Variables                              */
/* -------------------------------------------------------------------------- */

const BOMB = "&#128163;";
const FLAG = "&#x1f6a9";
const NORMAL = "&#128526";
const WIN = "&#128513";
const SAD = "&#128555";
const LOSS = "&#128551";
const LIGHTBOLB=" &#x1F4A1";
var id = 101;

var gGame = {
  isOn: false,
  isFirstClick: true,
  manualMode: false,
  hintMode: false,
  isManualMode: false,
  currentLevel: "easy",
  lives: 3,
  shownCount: 0,
  markedCount: 0,
  bestScore: updateGlobalBestScores(),
  safeClicks: 3,
  SIZE: 4,
  Mines: 2,
  hints: 3
};
var gGameCopy = [];
var elMinesInManualMode = [];
var gBoard = creatBoard(gGame.SIZE);
gGame["board"] = gBoard;
gGame["numOfMinesToSet"] = gGame.Mines;

/* --------------------------- Creat A Game Board --------------------------- */

function creatBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = creatCell(i, j);
    }
  }
  return board;
}

/* -------------------------- Render The Game Board ------------------------- */

function renderBoard(board) {
  var strHtml = '<table border="1" cellspacing="0"><tBody>';
  for (var i = 0; i < board.length; i++) {
    strHtml += "<tr>";
    for (var j = 0; j < board.length; j++) {
      var className = `cell${i}-${j}`;
      var cell ='';
      strHtml += `<td class="${className}" onclick="cellClicked(this,${i},${j})" oncontextmenu="plantFlag(event,this,${i},${j})"> ${cell}</td>`;
    }
    strHtml += "</tr>";
  }
  document.querySelector(".container").innerHTML = strHtml;
  var board = document.querySelector("table");
  gGame["gameBoard"] = board;
}

/* ------------------------------ Creat A Cell ------------------------------ */

function creatCell(i, j) {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
    id: id++,
    i: i,
    j: j
  };
}

/* -------------------------------------------------------------------------- */
/*                            Check For First Click                           */
/* -------------------------------------------------------------------------- */

/* -- If Its The First Click Set Mines At Random Locations Around The Board - */
/* ------------------ Set The Mines Count Around Each Cell ------------------ */

function FirstClick(i, j) {
  if (!gGame.isFirstClick) return;
  else {
    addMines(gBoard, i, j);
    setMinesCount(gBoard);
    gGame.isFirstClick = false;
    gGame.isOn = true;
    stopwatch.start();
  }
}

/* -------------------------------------------------------------------------- */
/*                      Set Mines Count Around Each Cell                      */
/* -------------------------------------------------------------------------- */

function setMinesCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      cell.minesAroundCount = minedNeighborsOfCell(board, i, j);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*               Count Mined Neighbors Of Each Cell, Return That Count        */
/* -------------------------------------------------------------------------- */

function minedNeighborsOfCell(board, posI, posJ) {
  var minesCount = 0;
  for (var i = posI - 1; i <= posI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = posJ - 1; j <= posJ + 1; j++) {
      if (j < 0 || j >= board.length) continue;
      if (i === posI && j === posJ) continue;
      var cell = board[i][j];
      if (cell.isMine) minesCount++;
    }
  }
  return minesCount;
}

/* -------------------------------------------------------------------------- */
/*                            Adding Mines To Board                           */
/* -------------------------------------------------------------------------- */

/* ---------------- Skip the clicked cell while adding mines ------------------ */
/* ------------- Prevent mines from being placed on top each other ------------ */
/* ------------ push the random mines cells to an array and return it --------- */

function addMines(board, i, j) {
  var minedCells = [];
  while (minedCells.length < gGame.Mines) {
    var randRow = getRandomIntInclusive(0, board.length - 1);
    var randCol = getRandomIntInclusive(0, board[0].length - 1);
    var cell = board[randRow][randCol];
    if (cell.isMine) continue;
    cell.isMine = true;
    board[i][j].isMine = false;
    if (cell.isMine) minedCells.push(cell);
  }
  minedCells.forEach(mine => (mine.isMine = true));
}

/* -------------------------------------------------------------------------- */
/*                        Update Lives And Hints  , Get Stats                 */
/* -------------------------------------------------------------------------- */

function updateLivesHintsCount() {}

function ReduceLives() {
  gGame.lives--;
}
function reduceHints() {
  gGame.hints--;
}
function activateHintMode() {
  var cell = getSafeCell();
  // saveStep();
  if (!gGame.hints||!cell) return;
  gGame.hintMode = true;
  gGame.hints--;
  var elCell = getElementByCell(cell);
  blinkCell(elCell);
}
function deactivateHintMode() {
  gGame.hintMode = false;
}
function checkHintMode() {
  return gGame.hintMode;
}

function removeLastSave() {
  gGameCopy.pop();
}

/* -------------------------------------------------------------------------- */
/*               Mark Unmark ,Show Unshow The Cell, Update Stats              */
/* -------------------------------------------------------------------------- */

function markCell(cell) {
  cell.isMarked = true;
  gGame.markedCount++;
}

function unMarkCell(cell) {
  cell.isMarked = false;
  gGame.markedCount--;
}
function updateShown(cell) {
  cell.isShown = true;
  gGame.shownCount++;
}
function unShowCell(cell) {
  cell.isShown = false;
  gGame.shownCount--;
}

/* -------------------------------------------------------------------------- */
/*               Return An Object Containing All The Game Stats               */
/* -------------------------------------------------------------------------- */

function getStats() {
  return {
    hintsLeft: gGame.hints,
    livesLeft: gGame.lives,
    markedCount: gGame.markedCount,
    shownCount: gGame.shownCount,
    minesCount: gGame.Mines,
    boardSize: gBoard.length ** 2,
    isGameOn: gGame.isOn,
    time: gGame.bestScore[gGame.currentLevel],
    currentLevel: gGame.currentLevel,
    board: gGame.board,
    safeClicks: gGame.safeClicks
  };
}

/* -------------------------------------------------------------------------- */
/*                              Restart The Game                              */
/* -------------------------------------------------------------------------- */

/* -------------------- Change Only The Non Dynamic Data -------------------- */

function restartGame() {
  gGame.isOn = false;
  gGame.manualMode = false;
  gGame.hintMode = false;
  gGame.isFirstClick = true;
  gGame.lives = 3;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  gGame.hints = 3;
  gGame.bestScore = updateGlobalBestScores();
  gGame.safeClicks = 3;
  document.querySelector(".manual").onclick = manualMode;
  gGameCopy = [];
}

/* -------------------------------------------------------------------------- */
/*                                 Set Levels                                 */
/* -------------------------------------------------------------------------- */

function setEasyMode() {
  restartGame();
  gGame.currentLevel = "easy";
  gGame.SIZE = 4;
  gGame.Mines = 2;
  gGame.numOfMinesToSet = 2;
  gBoard = creatBoard(gGame.SIZE);
}
function setHardMode() {
  restartGame();
  gGame.currentLevel = "hard";
  gGame.SIZE = 8;
  gGame.Mines = 4;
  gGame.numOfMinesToSet = 4;
  gBoard = creatBoard(gGame.SIZE);
}
function setExpertMode() {
  restartGame();
  gGame.currentLevel = "expert";
  gGame.SIZE = 12;
  gGame.Mines = 30;
  gGame.numOfMinesToSet = 30;
  gBoard = creatBoard(gGame.SIZE);
}

function restartCurrentLevel() {
  restartGame();
  gBoard = creatBoard(gGame.SIZE);
}

/* -------------------------------------------------------------------------- */
/*                Get All The Minded Cells From Around The Map                */
/* -------------------------------------------------------------------------- */

function MinesAroundMap() {
  var mines = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine) mines.push(cell);
    }
  }
  return mines;
}

/* -------------------------------------------------------------------------- */
/*       open cells in a recursive manner, till u encounter a        */
/* -------------------------------------------------------------------------- */

function checkAndShowNegs(cellPos) {
  for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue;
      var cell = gBoard[i][j];
      if (cell.isMine || cell.isShown || cell.isMarked) continue;
      var location = { i: i, j: j };
      var elCell = document.querySelector(getClassName(location));
      updateShown(cell);
      if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount;
      } else {
        elCell.innerText = cell.minesAroundCount;
        checkAndShowNegs(location);
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                 Get All The Neighboring Cells via Position                 */
/* -------------------------------------------------------------------------- */

function getNegCells(cellPos) {
  var cells = [];
  for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue;
      var cell = gBoard[i][j];
      cells.push(cell);
    }
  }
  return cells;
}

/* -------------------------------------------------------------------------- */
/*                                End The Game                                */
/* -------------------------------------------------------------------------- */

function gameOver() {
  var time = getTime();
  gGame.isOn = false;
  stopwatch.stop();
  updateBestScore(time);
  updateGlobalBestScores()
  // updateStats()
}

/* ------------------------ Return The Watch Element ------------------------ */

function getTime() {
  return document.querySelector(".stopwatch").innerText;
}

/* ----------------------------- Random Integer inclusive ----------------------------- */

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -------------------------------------------------------------------------- */
/*                               Get class name                               */
/* -------------------------------------------------------------------------- */

function getClassName(location) {
  var cellClass = ".cell" + location.i + "-" + location.j;
  return cellClass;
}

/* -------------------------------------------------------------------------- */
/*                              update Best Score                             */
/* -------------------------------------------------------------------------- */

function updateBestScore(time) {
  var level = gGame.currentLevel;
  var currentBestScore = localStorage.getItem(level);
  if (currentBestScore === "null"||!currentBestScore) {
    currentBestScore = "00:00:00";
  }
  if (time > currentBestScore) {
    currentBestScore = time;
    localStorage.setItem(level, currentBestScore);
    gGame.bestScore[level] = currentBestScore;
  }
}

/* ---------------------- Update The Score Inside gGame, for display purposes. --------------------- */

function updateGlobalBestScores() {
  return {
    easy: localStorage.getItem("easy"),
    hard: localStorage.getItem("hard"),
    expert: localStorage.getItem("expert")
  };
}

/* ------------------- Return a Cell That is safe to click ------------------ */

function getSafeCell() {
  var cell = [];
  var cnt = 100;
  while (cell.length < 1) {
    var randCell =
      gBoard[getRandomIntInclusive(0, gBoard.length - 1)][
        getRandomIntInclusive(0, gBoard[0].length - 1)
      ];
    if (!randCell.isMine && !randCell.isShown) cell.push(randCell);
    if (!cnt) break;
    cnt--;
  }
  if (!cell.length)
    document.querySelector(".safe span").innerText = "No Safe Clicks Found";
  else return cell[0];
}

 

function getElementPos(elCell) {
  var className = elCell.className;
  var posI = className.splice(4, className.lastIndexOf("-"));
  var posI = className.splice(className.lastIndexOf("-"));
  return { i: posI, j: posJ };
}



function getElementByCell(cell) {
  return document.querySelector(`.cell${cell.i}-${cell.j}`);
}

/* -------------------------------------------------------------------------- */
/*                            Save The Current step                           */
/* -------------------------------------------------------------------------- */

function saveStep() {
  let copy = JSON.parse(JSON.stringify(gGame));
  var board = gBoard;
  var table = document.getElementsByTagName("table")[0];
  copy.board = JSON.parse(JSON.stringify(board));
  copy.gameBoard = table.cloneNode(true);
  gGameCopy.push(copy);
}

/* -------------------------------------------------------------------------- */
/*                    Restore The Game State One Step Back                    */
/* -------------------------------------------------------------------------- */

function stepBack() {
  if (!gGameCopy.length || !gGame.isOn) return;
  var lastStep = gGameCopy.pop();
  gGame = JSON.parse(JSON.stringify(lastStep));
  gGame.board = JSON.parse(JSON.stringify(lastStep.board));
  gBoard = gGame.board;
  var table = document.getElementsByTagName("table")[0];
  gGame.gameBoard = lastStep.gameBoard.cloneNode(true);
  table.remove();
  document.querySelector(".container").appendChild(gGame.gameBoard);
  updateStats();
  if (gGame.isFirstClick) stopwatch.restart();
}

/* -------------------------------------------------------------------------- */
/*                              Blink a Safe Cell                             */
/* -------------------------------------------------------------------------- */

function safeClick() {
  if (!gGame.safeClicks) return;
  gGame.safeClicks--;
  var cell = getSafeCell();
  if(!cell) return;
  var elCell = getElementByCell(cell);
  blinkCell(elCell);
  updateStats()
}

/* -------------------------------------------------------------------------- */
/*                                 Manual Mine  Mode                          */
/* -------------------------------------------------------------------------- */

function manualMode() {
  if (gGame.isManualMode || gGame.isOn) return;
  gGame.isManualMode = true;
  updateStats();
}

function deactivateManualMode() {
  gGame.isManualMode = false;
}

function setMineManualMode(cell, elCell) {
  cell.isMine = true;
  gGame.numOfMinesToSet--;
  elCell.innerHTML = BOMB;
  elMinesInManualMode.push(elCell) + stopwatch.reset();
}


function startGameManual() {
  //making  sure that function FirstClick is not executed
  gGame.isFirstClick = false;
  gGame.isOn = true;
  setMinesCount(gBoard);
  deactivateManualMode();
  setTimeout(() => {
    elMinesInManualMode.forEach(element => (element.innerHTML = ""));
  }, 3000);
  setTimeout(() => {
    stopwatch.restart();
  }, 3000);
  document.querySelector(".manual").removeAttribute("onclick");
}
