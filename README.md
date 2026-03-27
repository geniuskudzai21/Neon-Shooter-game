# Neon Shooter

A fast-paced, neon-styled browser-based shooter game with dynamic sound effects, particle systems, and full mobile support.

## 🎮 About the Game

Neon Shooter is an action-packed arcade game where you control a glowing spaceship defending against waves of colorful enemies. The game features a vibrant neon aesthetic with particle effects, realistic synthesized audio, and progressive difficulty that keeps players engaged.

### Core Features
- **Dynamic Combat**: Fast-paced shooting with multiple weapon types
- **Enemy Variety**: 5 unique enemy types with different behaviors and challenges
- **Progressive Difficulty**: Levels increase enemy speed and spawn rates
- **Visual Effects**: Neon glow effects, particle explosions, and screen shake
- **Audio System**: Realistic synthesized gunshots, explosions, and background music
- **Mobile Support**: Touch controls with tap-to-kill mechanics for mobile devices

## 🎯 How to Play

### Desktop Controls
- **WASD/Arrow Keys** - Move your spaceship
- **Mouse** - Aim direction
- **Left Click** - Shoot weapons
- **ESC** - Pause/Resume game
- **A** - Toggle Auto-Play mode

### Mobile Controls
- **Left Side Drag** - Move your spaceship
- **Right Side Tap** - Tap enemies to destroy them instantly
- **Touch Anywhere** - Aim your weapons

### Gameplay
1. **Survive** against waves of incoming enemies
2. **Shoot** enemies to earn points and gain experience
3. **Level Up** to restore health and increase difficulty
4. **Unlock Weapons** at score milestones:
   - 200 points: Spread Shot (3-bullet)
   - 500 points: Laser (rapid fire)
   - 800 points: Rapid Fire (very fast)
   - 1200 points: Mega Blast (7-bullet spread)
5. **Beat Your High Score** - Your best score is saved locally

### Enemy Types
- **Basic (Pink)** - Standard enemies, 10 points
- **Fast (Orange)** - Quick movement, 20 points
- **Zigzag (Green)** - Unpredictable pattern, 30 points
- **Ghost (Cyan)** - Semi-transparent, 40 points
- **Tank (Red)** - High health, 50 points

### Tips
- Keep moving to avoid enemy collisions
- Prioritize fast enemies first
- Use corners to funnel enemies
- Different weapons work better for different situations

## �️ Technology Stack

### Frontend Technologies
- **HTML5 Canvas** - Game rendering and graphics
- **JavaScript ES6+** - Game logic and mechanics
- **CSS3** - UI styling and responsive design
- **Web Audio API** - Dynamic sound synthesis and effects

### Audio System
- **Procedural Sound Generation** - All sounds created programmatically
- **Multi-layered Synthesis** - Realistic gunshot and explosion effects
- **Background Music** - MP3 audio with loop and volume controls
- **Browser Compatibility** - Handles autoplay restrictions gracefully

### Mobile Features
- **Touch Events** - Full touch control support
- **Responsive Design** - Adapts to all screen sizes
- **Tap-to-Kill Mechanics** - Instant enemy destruction on touch
- **Performance Optimization** - Smooth gameplay on mobile devices

### Data Persistence
- **LocalStorage** - High scores and settings persistence
- **Settings Management** - Volume controls and audio preferences
- **Cross-session** - Settings remembered between sessions

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Audio output for full experience

### Installation
1. Download the game files
2. Ensure all files are in the same directory:
   - `index.html`
   - `script.js`
   - `style.css`
   - `openmindaudio-cartoon-background-music-modern-path-short-preview-short-preview-497396.mp3`
3. Open `index.html` in your web browser

### Local Development
For development with a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Then visit http://localhost:8000
```

---

**Enjoy playing Neon Shooter! 🚀**
