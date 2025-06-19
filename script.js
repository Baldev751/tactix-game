const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

let board = [];
let currentPlayer = 1;
let gameMode = null;
let selected = [];
let isAI = false;

const winSound = new Audio("win.mp3"); // 🔊 Load winning sound

function startGame(mode) {
  gameMode = mode;
  isAI = mode === "ai";
  board = Array(4).fill(null).map(() => Array(4).fill(1));
  currentPlayer = 1;
  selected = [];
  renderBoard();
  statusText.classList.remove("winner");
  statusText.textContent = isAI ? "Your turn (Player 1)" : "Player 1's Turn";
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
    alert("Invalid selection! Must be adjacent in the same row or column.");
    return;
  }

  applyMove(selected);
  if (checkWin()) {
    celebrateWin(`🎉 Player ${currentPlayer} wins!`);
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  statusText.textContent = isAI && currentPlayer === 2 ? "AI's turn..." : `Player ${currentPlayer}'s Turn`;
  selected = [];

  if (isAI && currentPlayer === 2) {
    setTimeout(aiMove, 1000);
  }

  renderBoard();
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
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] && board[r][c + 1]) {
        applyMove([[r, c], [r, c + 1]]);
        finishAITurn();
        return;
      }
    }
  }

  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] && board[r + 1][c]) {
        applyMove([[r, c], [r + 1, c]]);
        finishAITurn();
        return;
      }
    }
  }

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 1) {
        applyMove([[r, c]]);
        finishAITurn();
        return;
      }
    }
  }
}

function finishAITurn() {
  if (checkWin()) {
    celebrateWin("🤖 AI wins!");
    return;
  }
  currentPlayer = 1;
  statusText.textContent = "Your turn (Player 1)";
  renderBoard();
}

// ✨ Show winner + play sound
function celebrateWin(message) {
  statusText.textContent = message;
  statusText.classList.add("winner");
  winSound.play();
}
