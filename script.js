const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

const startScreen = document.getElementById("startScreen");
const modeSelect = document.getElementById("modeSelect");
const aiOptions = document.getElementById("aiOptions");
const gameContainer = document.getElementById("gameContainer");
const restartButton = document.getElementById("restartButton");

// Add Home Button
const homeBtn = document.createElement("button");
homeBtn.textContent = "🏠 Home";
homeBtn.onclick = goHome;
homeBtn.style.margin = "10px";
homeBtn.style.backgroundColor = "#555";
homeBtn.style.color = "white";
homeBtn.style.borderRadius = "12px";
homeBtn.style.fontWeight = "bold";
homeBtn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
homeBtn.style.padding = "10px 20px";
homeBtn.style.cursor = "pointer";
gameContainer.appendChild(homeBtn);

let board = [];
let currentPlayer = 1;
let selected = [];
let isAI = false;
let playerAI = 2;
let playerHuman = 1;

// Rules Modal Functions
function showRules() {
  document.getElementById("rulesModal").classList.add("active");
}

function hideRules() {
  document.getElementById("rulesModal").classList.remove("active");
}

// Close modal when clicking outside
document.getElementById("rulesModal").addEventListener('click', function(e) {
  if (e.target === this) {
    hideRules();
  }
});

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  
  if (notification.timeout) clearTimeout(notification.timeout);
  notification.timeout = setTimeout(() => {
    notification.classList.add("hidden");
  }, 1500);
}

function showModeSelect() {
  startScreen.classList.add("hidden");
  modeSelect.classList.remove("hidden");
}

function showAIOptions() {
  modeSelect.classList.add("hidden");
  aiOptions.classList.remove("hidden");
}

function startGame(mode, aiPlayer = 2) {
  isAI = mode === 'ai';
  playerAI = aiPlayer;
  playerHuman = aiPlayer === 1 ? 2 : 1;

  board = Array(4).fill(null).map(() => Array(4).fill(1));
  selected = [];
  currentPlayer = 1;

  startScreen.classList.add("hidden");
  modeSelect.classList.add("hidden");
  aiOptions.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  restartButton.classList.add("hidden");
  statusText.classList.remove("winner");

  renderBoard();

  if (isAI && currentPlayer === playerAI) {
    statusText.textContent = "AI's turn...";
    setTimeout(aiMove, 800);
  } else {
    statusText.textContent = isAI ? "Your turn" : "Player 1's Turn";
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (board[r][c] === 0) cell.classList.add("removed");
      if (selected.some(s => s[0] === r && s[1] === c)) cell.classList.add("selected");
      cell.addEventListener("click", () => toggleSelection(r, c));
      boardElement.appendChild(cell);
    }
  }
}

function toggleSelection(r, c) {
  if (board[r][c] === 0) return;
  if (isAI && currentPlayer !== playerHuman) return;

  const idx = selected.findIndex(([sr, sc]) => sr === r && sc === c);
  if (idx !== -1) {
    selected.splice(idx, 1);
  } else {
    selected.push([r, c]);
  }
  renderBoard();
}

function isValidSelection(sel) {
  if (sel.length === 0) return false;
  const rows = sel.map(([r]) => r);
  const cols = sel.map(([, c]) => c);
  const allSameRow = rows.every(r => r === rows[0]);
  const allSameCol = cols.every(c => c === cols[0]);
  if (!(allSameRow || allSameCol)) return false;

  const indices = allSameRow ? cols : rows;
  indices.sort((a, b) => a - b);
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }

  return true;
}

function confirmMove() {
  if (!isValidSelection(selected)) {
    showNotification("Invalid selection! Must select adjacent cells in same row/column");
    selected = [];
    renderBoard();
    return;
  }

  applyMove(selected);
  renderBoard();

  if (checkWin()) {
    celebrateWin();
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  selected = [];

  if (isAI && currentPlayer === playerAI) {
    statusText.textContent = "AI's turn...";
    setTimeout(aiMove, 800);
  } else {
    statusText.textContent = isAI ? "Your turn" : `Player ${currentPlayer}'s Turn`;
  }
}

function applyMove(sel) {
  for (const [r, c] of sel) {
    board[r][c] = 0;
  }
}

function checkWin() {
  return board.flat().every(cell => cell === 0);
}

function clearSelection() {
  selected = [];
  renderBoard();
}

function aiMove() {
  const moves = getAllValidMoves();

  for (const move of moves) {
    const testBoard = board.map(row => [...row]);
    for (const [r, c] of move) testBoard[r][c] = 0;
    if (calculateNimSum(testBoard) === 0) {
      applyMove(move);
      endAITurn();
      return;
    }
  }

  const fallback = moves[0];
  applyMove(fallback);
  endAITurn();
}

function endAITurn() {
  renderBoard();

  if (checkWin()) {
    celebrateWin();
    return;
  }

  currentPlayer = playerHuman;
  selected = [];
  statusText.textContent = "Your turn";
}

function calculateNimSum(tempBoard) {
  const rowCounts = tempBoard.map(row => row.filter(cell => cell === 1).length);
  return rowCounts.reduce((a, b) => a ^ b, 0);
}

function getAllValidMoves() {
  const moves = [];

  for (let r = 0; r < 4; r++) {
    let run = [];
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 1) {
        run.push([r, c]);
      } else if (run.length) {
        addSubarrays(run, moves);
        run = [];
      }
    }
    if (run.length) addSubarrays(run, moves);
  }

  for (let c = 0; c < 4; c++) {
    let run = [];
    for (let r = 0; r < 4; r++) {
      if (board[r][c] === 1) {
        run.push([r, c]);
      } else if (run.length) {
        addSubarrays(run, moves);
        run = [];
      }
    }
    if (run.length) addSubarrays(run, moves);
  }

  return moves;
}

function addSubarrays(arr, moves) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j <= arr.length; j++) {
      moves.push(arr.slice(i, j));
    }
  }
}

function celebrateWin() {
  let winMessage;
  if (isAI) {
    winMessage = currentPlayer === playerHuman ? "🎉 You win!" : "🤖 AI wins!";
  } else {
    winMessage = `🎉 Player ${currentPlayer} wins!`;
  }
  
  statusText.textContent = winMessage;
  statusText.classList.add("winner");
  restartButton.classList.remove("hidden");
}

function goHome() {
  gameContainer.classList.add("hidden");
  startScreen.classList.remove("hidden");
  modeSelect.classList.add("hidden");
  aiOptions.classList.add("hidden");
  statusText.classList.remove("winner");
  restartButton.classList.add("hidden");
  selected = [];
}