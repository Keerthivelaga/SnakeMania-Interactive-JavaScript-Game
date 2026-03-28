// ─── Web Audio Engine ────────────────────────────────────────────────────────
const AC = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, type, dur, vol = 0.3, delay = 0) {
  const t = AC.currentTime + delay;
  const osc  = AC.createOscillator();
  const gain = AC.createGain();
  osc.connect(gain);
  gain.connect(AC.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

function playEat()      { beep(520,'square',0.06,0.25); beep(780,'square',0.06,0.2,0.06); }
function playMove()     { beep(180,'triangle',0.04,0.06); }
function playGameOver() { [220,196,165,130].forEach((f,i) => beep(f,'sawtooth',0.18,0.3,i*0.18)); }
function playStart()    { [262,330,392,523].forEach((f,i) => beep(f,'square',0.12,0.2,i*0.1)); }

// ─── Game Constants ──────────────────────────────────────────────────────────
const GRID        = 20;
const BASE_SPEED  = 8;
const SPEED_TABLE = [8, 10, 12, 15, 19];

// ─── State ───────────────────────────────────────────────────────────────────
let inputDir    = { x: 0, y: 0 };
let nextDir     = { x: 0, y: 0 };
let speed       = BASE_SPEED;
let score       = 0;
let hiscoreval  = 0;
let lastPaintTime = 0;
let gameRunning = false;
let manualTier  = 0;
let snakeArr, food;

// ─── DOM References ──────────────────────────────────────────────────────────
const board      = document.getElementById('board');
const scoreVal   = document.getElementById('scoreVal');
const hiscoreVal = document.getElementById('hiscoreVal');
const overlay    = document.getElementById('overlay');
const playBtn    = document.getElementById('play-btn');
const modalTitle = document.getElementById('modal-title');
const modalScore = document.getElementById('modal-score-val');
const modalHi    = document.getElementById('modal-hiscore-val');
const newRecord  = document.getElementById('new-record');
const hint       = document.getElementById('hint');
const speedBtns  = document.querySelectorAll('.spd-btn');

// ─── Speed buttons ───────────────────────────────────────────────────────────
speedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    manualTier = parseInt(btn.dataset.tier);
    speed = SPEED_TABLE[manualTier];
    speedBtns.forEach(b => b.classList.toggle('active', b === btn));
  });
});

// ─── Load hi-score ───────────────────────────────────────────────────────────
const saved = localStorage.getItem('snakeMania_hiscore');
hiscoreval = saved ? parseInt(saved) : 0;
hiscoreVal.textContent = hiscoreval;
modalHi.textContent    = hiscoreval;

// ─── Floating particles ──────────────────────────────────────────────────────
for (let i = 0; i < 12; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = 20 + Math.random() * 60;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}vw;
    animation-duration:${8 + Math.random() * 18}s;
    animation-delay:${-Math.random() * 20}s;
  `;
  document.body.appendChild(p);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * (GRID - 2)) + 2,
      y: Math.floor(Math.random() * (GRID - 2)) + 2
    };
  } while (snakeArr.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function isCollide(snake) {
  const head = snake[0];
  if (head.x < 1 || head.x > GRID || head.y < 1 || head.y > GRID) return true;
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) return true;
  }
  return false;
}

function updateSpeed() {
  const autoTier = Math.min(Math.floor(score / 5), SPEED_TABLE.length - 1);
  const tier = Math.max(autoTier, manualTier);
  speed = SPEED_TABLE[tier];
  speedBtns.forEach((b, i) => b.classList.toggle('active', i === tier));
}

function popScore(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// ─── Init game ───────────────────────────────────────────────────────────────
function initGame() {
  snakeArr = [{ x: 10, y: 10 }];
  food     = randFood();
  inputDir = { x: 0, y: 0 };
  nextDir  = { x: 0, y: 0 };
  score    = 0;
  speed    = SPEED_TABLE[manualTier];
  scoreVal.textContent = 0;
  speedBtns.forEach((b, i) => b.classList.toggle('active', i === manualTier));
  lastPaintTime = 0;
  gameRunning   = true;
}

// ─── Render ──────────────────────────────────────────────────────────────────
function renderBoard() {
  board.innerHTML = '';

  snakeArr.forEach((seg, idx) => {
    const el = document.createElement('div');
    el.style.gridRowStart    = seg.y;
    el.style.gridColumnStart = seg.x;
    el.classList.add(idx === 0 ? 'head' : 'snake');
    if (idx > 0) {
      el.style.opacity = Math.max(0.4, 1 - (idx / snakeArr.length) * 0.6);
    }
    board.appendChild(el);
  });

  const foodEl = document.createElement('div');
  foodEl.style.gridRowStart    = food.y;
  foodEl.style.gridColumnStart = food.x;
  foodEl.classList.add('food');
  board.appendChild(foodEl);
}

// ─── Game engine ─────────────────────────────────────────────────────────────
function gameEngine() {
  inputDir = { ...nextDir };

  // Wait for first keypress before moving
  if (inputDir.x === 0 && inputDir.y === 0) {
    renderBoard();
    return;
  }

  if (isCollide(snakeArr)) {
    gameRunning = false;
    playGameOver();

    const isNewRecord = score > hiscoreval;
    if (isNewRecord) {
      hiscoreval = score;
      localStorage.setItem('snakeMania_hiscore', hiscoreval);
      hiscoreVal.textContent = hiscoreval;
    }

    setTimeout(() => {
      modalTitle.textContent = 'GAME OVER';
      modalScore.textContent = score;
      modalHi.textContent    = hiscoreval;
      newRecord.classList.toggle('show', isNewRecord);
      playBtn.textContent = '▶ PLAY AGAIN';
      overlay.classList.remove('hidden');
    }, 400);
    return;
  }

  // Eat food
  if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
    playEat();
    score++;
    updateSpeed();
    popScore(scoreVal);
    scoreVal.textContent = score;

    if (score > hiscoreval) {
      hiscoreval = score;
      localStorage.setItem('snakeMania_hiscore', hiscoreval);
      hiscoreVal.textContent = hiscoreval;
      popScore(hiscoreVal);
    }

    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y
    });
    food = randFood();
  }

  // Move snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  renderBoard();
}

// ─── RAF loop ─────────────────────────────────────────────────────────────────
function main(ctime) {
  window.requestAnimationFrame(main);
  if (!gameRunning) return;
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;
  lastPaintTime = ctime;
  gameEngine();
}

// ─── Direction control ────────────────────────────────────────────────────────
function setDir(nx, ny) {
  if (inputDir.x === 0 && inputDir.y === 0) {
    nextDir = { x: nx, y: ny };
    inputDir = { x: nx, y: ny };
    return;
  }
  // Prevent 180° reversal
  if (nx !== 0 && nx === -inputDir.x) return;
  if (ny !== 0 && ny === -inputDir.y) return;
  nextDir = { x: nx, y: ny };
}

// Keyboard
window.addEventListener('keydown', e => {
  if (!gameRunning) return;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  playMove();
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': setDir(0, -1); break;
    case 'ArrowDown':  case 's': case 'S': setDir(0,  1); break;
    case 'ArrowLeft':  case 'a': case 'A': setDir(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': setDir(1,  0); break;
  }
});

// Mobile D-pad buttons
document.getElementById('btn-up').addEventListener('click',    () => { if (gameRunning) { playMove(); setDir(0, -1); } });
document.getElementById('btn-down').addEventListener('click',  () => { if (gameRunning) { playMove(); setDir(0,  1); } });
document.getElementById('btn-left').addEventListener('click',  () => { if (gameRunning) { playMove(); setDir(-1, 0); } });
document.getElementById('btn-right').addEventListener('click', () => { if (gameRunning) { playMove(); setDir(1,  0); } });

// Swipe support
let touchStartX = 0, touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (!gameRunning) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    dx > 0 ? setDir(1, 0) : setDir(-1, 0);
  } else {
    dy > 0 ? setDir(0, 1) : setDir(0, -1);
  }
  playMove();
}, { passive: true });

// ─── Play button ──────────────────────────────────────────────────────────────
playBtn.addEventListener('click', () => {
  AC.resume();
  overlay.classList.add('hidden');
  hint.textContent = 'USE ARROWS / WASD / SWIPE TO MOVE';
  initGame();
  playStart();
});

// ─── Kick off ─────────────────────────────────────────────────────────────────
window.requestAnimationFrame(main);
