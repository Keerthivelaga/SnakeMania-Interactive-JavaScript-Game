# 🐍 SnakeMania

A classic Snake game built with vanilla HTML, CSS, and JavaScript — featuring retro 8-bit aesthetics, Web Audio sound effects, mobile swipe support, and a custom speed control.

## 🎮 Play Now

🔗 **[Live Demo](https://snakemania-interactivejavascriptgame.netlify.app)** 

---

## ✨ Features

- 🎨 Retro pixel art aesthetic with scanline overlay and animated background
- 🔊 8-bit Web Audio sound effects (no external audio files needed)
- 📱 Mobile-friendly — swipe to move or use the on-screen D-pad
- ⌨️ Keyboard support — Arrow keys or WASD
- 🏆 High score saved locally via `localStorage`
- ⚡ Speed control (1–5) — choose your difficulty before or during the game
- 🚫 No 180° reversal bug — can't accidentally go back into yourself
- ✨ New Record detection with flashing banner

---

## 🗂️ Project Structure

```
SnakeMania/
├── index.html   # Game markup & layout
├── style.css    # All styles, animations & retro effects
└── index.js     # Game logic, audio engine & input handling
```

---

## 🚀 Getting Started

### Run locally
No build tools or dependencies needed. Just clone and open in your browser:

```bash
git clone https://github.com/YOUR_USERNAME/SnakeMania.git
cd SnakeMania
# Open index.html in your browser
```

Or simply double-click `index.html`.

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop the `SnakeMania` folder onto the Netlify dashboard
3. Your game is live instantly! 🎉

---

## 🕹️ How to Play

| Control | Action |
|---|---|
| `Arrow Keys` / `WASD` | Move the snake |
| Swipe | Move on mobile |
| On-screen D-pad | Move on touch devices |
| Speed buttons `1–5` | Set game speed |

- Eat the 🔴 red food to grow and score points
- Avoid hitting the walls or your own body
- Speed increases automatically every 5 points
- Try to beat your high score!

---

## 🛠️ Built With

- **HTML5** — structure & game board grid
- **CSS3** — animations, retro effects, responsive layout
- **Vanilla JavaScript** — game logic, Web Audio API for sounds
- **localStorage** — persistent high score
- **requestAnimationFrame** — smooth game loop

---
