# Neon Shooter Game

A fast-paced, neon-styled browser-based shooter game with dynamic sound effects and particle systems.

## 🎮 Game Features

### Core Gameplay
- **Dynamic Shooting**: Click to shoot with realistic gunshot sounds
- **Enemy Types**: Multiple enemy types with unique behaviors
  - Basic (pink) - Standard enemies
  - Fast (orange) - Quick movement, low health
  - Tank (red) - Slow but high health
  - Zigzag (green) - Unpredictable movement pattern
  - Ghost (cyan) - Semi-transparent, fades in/out
- **Progressive Difficulty**: Levels increase enemy speed and spawn rates
- **Health System**: Player health with visual feedback
- **Score System**: Points for defeating enemies, persistent high score

### Weapons System
- **Basic Weapon** (Cyan) - Standard shot
- **Spread Shot** (Green) - 3-bullet spread (unlock at 200 points)
- **Laser** (Orange) - Rapid fire, high damage (unlock at 500 points)
- **Rapid Fire** (Orange) - Very fast shooting (unlock at 800 points)
- **Mega Blast** (Pink) - 7-bullet spread (unlock at 1200 points)

### Visual Effects
- **Neon Aesthetic**: Vibrant colors with glow effects
- **Particle System**: Explosions and hit effects
- **Screen Shake**: Impact feedback for hits and damage
- **Dynamic Background**: Animated grid with moving stars
- **Health Bars**: Visual health indicators for player and tank enemies

### Audio System
- **Realistic Gunshots**: Multi-layered synthesized gunshot sounds
- **Explosion Effects**: Dynamic explosion sounds for enemy hits
- **Movement Sounds**: Footstep audio feedback when moving
- **UI Sounds**: Button click sounds
- **Damage Audio**: Impact sounds when player takes damage

## 🎯 Controls

### Movement
- **WASD** - Move up, left, down, right
- **Arrow Keys** - Alternative movement controls
- **Mouse** - Aim direction

### Actions
- **Left Click** - Shoot weapon
- **ESC** - Pause/Resume game
- **A** - Toggle Auto-Play mode

### UI Controls
- **START GAME** - Begin new game
- **PAUSE/RESUME** - Pause or resume gameplay
- **AUTO-PLAY** - Toggle AI-controlled movement
- **RESTART** - Start new game after game over

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Audio output for sound effects

### Installation
1. Clone or download the game files
2. Ensure all files are in the same directory:
   - `index.html`
   - `script.js`
   - `style.css`
3. Open `index.html` in your web browser

### Local Development
For development, you can use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## 🎮 Gameplay Tips

### Survival Strategies
- Keep moving to avoid enemy collisions
- Prioritize fast enemies (orange) first
- Use corners to funnel enemies
- Save health by avoiding collisions when possible

### Weapon Strategy
- Basic weapon is accurate but slow
- Spread shot great for crowd control
- Laser ideal for high-health enemies (tanks)
- Rapid fire perfect for overwhelming enemies
- Mega blast devastating but watch ammunition timing

### Scoring
- Basic enemies: 10 points
- Fast enemies: 20 points
- Zigzag enemies: 30 points
- Ghost enemies: 40 points
- Tank enemies: 50 points

### Level Progression
- Defeat enemies to gain experience
- Each level requires more enemies to advance
- Level up restores 20 health points
- Enemy speed increases with each level

## 🔧 Technical Details

### Technologies Used
- **HTML5 Canvas** for game rendering
- **JavaScript ES6+** for game logic
- **Web Audio API** for dynamic sound generation
- **CSS3** for UI styling and effects
- **LocalStorage** for high score persistence

### Performance Features
- Optimized particle system with automatic cleanup
- Efficient collision detection
- Frame-based animation loop
- Smart enemy spawning limits

### Audio Architecture
- Procedurally generated sound effects
- No external audio files required
- Multi-layered synthesis for realistic effects
- Browser-compatible audio context handling

## 🐛 Troubleshooting

### Common Issues

**No Sound Effects**
- Click the START GAME button first (required for audio initialization)
- Ensure browser is not muted
- Check if audio permissions are granted

**Game Not Starting**
- Refresh the page
- Check browser console for errors
- Ensure all files are present

**Performance Issues**
- Close other browser tabs
- Update browser to latest version
- Reduce browser zoom level

**Controls Not Responding**
- Click on the game canvas to focus
- Check if other applications are capturing keyboard input
- Try refreshing the page

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user interaction for audio)
- **Mobile**: Limited support (touch controls not implemented)

## 🎨 Customization

### Game Constants
Modify these values in `script.js`:
```javascript
const PLAYER_SPEED = 5;        // Movement speed
const BULLET_SPEED = 10;       // Projectile speed
const ENEMY_BASE_SPEED = 1;     // Base enemy speed
```

### Color Scheme
Change neon colors by modifying color constants:
- Player ship: `#00ffff` (cyan)
- Enemy types: Various hex colors
- UI elements: CSS color values

### Sound Settings
Adjust audio parameters in the `playSound()` function:
- Frequency ranges
- Gain (volume) levels
- Effect durations

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎮 Game Credits

- **Game Design & Development**: Neon Shooter Team
- **Audio Engine**: Web Audio API synthesis
- **Visual Effects**: Canvas 2D rendering
- **UI/UX**: Responsive web design

---

**Enjoy playing Neon Shooter! 🚀**
