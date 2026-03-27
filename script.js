let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;
const ENEMY_BASE_SPEED = 1;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
}

resizeCanvas();

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;
    
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Apply volume settings
    const finalVolume = masterVolume * sfxVolume;
    
    switch(type) {
        case 'shoot':
            // Layer 1: Initial sharp crack
            const crack = audioContext.createOscillator();
            const crackGain = audioContext.createGain();
            const crackFilter = audioContext.createBiquadFilter();
            
            crack.type = 'sawtooth';
            crack.frequency.setValueAtTime(3000, audioContext.currentTime);
            crack.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.03);
            
            crackFilter.type = 'highpass';
            crackFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
            crackFilter.Q.setValueAtTime(5, audioContext.currentTime);
            
            crackGain.gain.setValueAtTime(0.4 * finalVolume, audioContext.currentTime);
            crackGain.gain.exponentialRampToValueAtTime(0.01 * finalVolume, audioContext.currentTime + 0.05);
            
            crack.connect(crackFilter);
            crackFilter.connect(crackGain);
            crackGain.connect(audioContext.destination);
            crack.start(audioContext.currentTime);
            crack.stop(audioContext.currentTime + 0.05);
            
            // Layer 2: Low frequency thud
            const thud = audioContext.createOscillator();
            const thudGain = audioContext.createGain();
            
            thud.type = 'sine';
            thud.frequency.setValueAtTime(80, audioContext.currentTime);
            thud.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
            
            thudGain.gain.setValueAtTime(0.6, audioContext.currentTime);
            thudGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            thud.connect(thudGain);
            thudGain.connect(audioContext.destination);
            thud.start(audioContext.currentTime);
            thud.stop(audioContext.currentTime + 0.15);
            
            // Layer 3: Noise burst for muzzle blast
            const noiseSize = audioContext.sampleRate * 0.08;
            const noiseBuffer = audioContext.createBuffer(1, noiseSize, audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < noiseSize; i++) {
                noiseData[i] = (Math.random() - 0.5) * 2 * Math.exp(-i * 0.02);
            }
            
            const noise = audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            
            const noiseFilter = audioContext.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1500, audioContext.currentTime);
            noiseFilter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.06);
            noiseFilter.Q.setValueAtTime(2, audioContext.currentTime);
            
            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.5, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            noise.start(audioContext.currentTime);
            
            // Layer 4: Echo effect
            const echoDelay = audioContext.createDelay(0.3);
            const echoGain = audioContext.createGain();
            const echoFilter = audioContext.createBiquadFilter();
            
            echoDelay.delayTime.setValueAtTime(0.15, audioContext.currentTime);
            echoGain.gain.setValueAtTime(0.2, audioContext.currentTime);
            echoGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            echoFilter.type = 'lowpass';
            echoFilter.frequency.setValueAtTime(800, audioContext.currentTime);
            
            crack.connect(echoDelay);
            echoDelay.connect(echoFilter);
            echoFilter.connect(echoGain);
            echoGain.connect(audioContext.destination);
            
            break;
            
        case 'hit':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'targetHit':
            // Explosion sound with multiple layers
            const explosionSize = audioContext.sampleRate * 0.4;
            const explosionBuffer = audioContext.createBuffer(1, explosionSize, audioContext.sampleRate);
            const explosionData = explosionBuffer.getChannelData(0);
            
            for (let i = 0; i < explosionSize; i++) {
                const t = i / explosionSize;
                explosionData[i] = (Math.random() - 0.5) * 2 * Math.exp(-t * 8) * (1 - t * 0.5);
            }
            
            const explosionNoise = audioContext.createBufferSource();
            explosionNoise.buffer = explosionBuffer;
            
            const explosionFilter = audioContext.createBiquadFilter();
            explosionFilter.type = 'lowpass';
            explosionFilter.frequency.setValueAtTime(3000, audioContext.currentTime);
            explosionFilter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            
            const explosionGain = audioContext.createGain();
            explosionGain.gain.setValueAtTime(0.6, audioContext.currentTime);
            explosionGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            explosionNoise.connect(explosionFilter);
            explosionFilter.connect(explosionGain);
            explosionGain.connect(audioContext.destination);
            explosionNoise.start(audioContext.currentTime);
            
            // Low frequency boom
            const boom = audioContext.createOscillator();
            const boomGain = audioContext.createGain();
            
            boom.type = 'sine';
            boom.frequency.setValueAtTime(60, audioContext.currentTime);
            boom.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.25);
            
            boomGain.gain.setValueAtTime(0.8, audioContext.currentTime);
            boomGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
            
            boom.connect(boomGain);
            boomGain.connect(audioContext.destination);
            boom.start(audioContext.currentTime);
            boom.stop(audioContext.currentTime + 0.35);
            
            // High frequency crackle
            const crackle = audioContext.createOscillator();
            const crackleGain = audioContext.createGain();
            const crackleFilter = audioContext.createBiquadFilter();
            
            crackle.type = 'square';
            crackle.frequency.setValueAtTime(500, audioContext.currentTime);
            crackle.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);
            
            crackleFilter.type = 'highpass';
            crackleFilter.frequency.setValueAtTime(800, audioContext.currentTime);
            crackleFilter.Q.setValueAtTime(3, audioContext.currentTime);
            
            crackleGain.gain.setValueAtTime(0.3, audioContext.currentTime);
            crackleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            crackle.connect(crackleFilter);
            crackleFilter.connect(crackleGain);
            crackleGain.connect(audioContext.destination);
            crackle.start(audioContext.currentTime);
            crackle.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'targetMiss':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'move':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;
            
        case 'click':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
    }
}

// Music system functions - MP3 background music
let backgroundMusic = null;
let musicAudioElement = null;

function startBackgroundMusic() {
    if (!musicEnabled || musicAudioElement) return;
    
    // Create audio element for MP3
    musicAudioElement = new Audio('openmindaudio-cartoon-background-music-modern-path-short-preview-short-preview-497396.mp3');
    musicAudioElement.loop = true;
    musicAudioElement.volume = musicVolume * masterVolume * 0.3; // Lower volume for background music
    
    // Handle audio loading and playback
    musicAudioElement.addEventListener('canplaythrough', () => {
        musicAudioElement.play().catch(error => {
            console.log('Music autoplay prevented:', error);
        });
    });
    
    musicAudioElement.addEventListener('error', (error) => {
        console.log('Music loading error:', error);
    });
    
    // Start loading
    musicAudioElement.load();
}

function stopBackgroundMusic() {
    if (musicAudioElement) {
        musicAudioElement.pause();
        musicAudioElement.currentTime = 0;
        musicAudioElement = null;
    }
}

function updateMusicVolume() {
    if (musicAudioElement) {
        musicAudioElement.volume = musicVolume * masterVolume * 0.3;
    }
}

// Settings management
function loadSettings() {
    const saved = localStorage.getItem('neonShooterSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        masterVolume = settings.masterVolume || 0.5;
        sfxVolume = settings.sfxVolume || 0.5;
        musicVolume = settings.musicVolume || 0.3;
        soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
        
        // Update UI
        document.getElementById('masterVolume').value = masterVolume * 100;
        document.getElementById('sfxVolume').value = sfxVolume * 100;
        document.getElementById('musicVolume').value = musicVolume * 100;
        document.getElementById('masterVolumeValue').textContent = Math.round(masterVolume * 100) + '%';
        document.getElementById('sfxVolumeValue').textContent = Math.round(sfxVolume * 100) + '%';
        document.getElementById('musicVolumeValue').textContent = Math.round(musicVolume * 100) + '%';
        document.getElementById('soundEnabled').checked = soundEnabled;
        document.getElementById('musicEnabled').checked = musicEnabled;
    }
}

function saveSettings() {
    const settings = {
        masterVolume,
        sfxVolume,
        musicVolume,
        soundEnabled,
        musicEnabled
    };
    localStorage.setItem('neonShooterSettings', JSON.stringify(settings));
}

function resetSettings() {
    masterVolume = 0.5;
    sfxVolume = 0.5;
    musicVolume = 0.3;
    soundEnabled = true;
    musicEnabled = true;
    
    // Update UI
    document.getElementById('masterVolume').value = 50;
    document.getElementById('sfxVolume').value = 50;
    document.getElementById('musicVolume').value = 30;
    document.getElementById('masterVolumeValue').textContent = '50%';
    document.getElementById('sfxVolumeValue').textContent = '50%';
    document.getElementById('musicVolumeValue').textContent = '30%';
    document.getElementById('soundEnabled').checked = true;
    document.getElementById('musicEnabled').checked = true;
    
    saveSettings();
    updateMusicVolume();
}

let gameRunning = false;
let gamePaused = false;
let autoPlay = false;
let score = 0;
let level = 1;
let highScore = localStorage.getItem('neonShooterHighScore') || 0;
let mouseX = CANVAS_WIDTH / 2;
let mouseY = CANVAS_HEIGHT / 2;
let screenShake = 0;
let backgroundOffset = 0;
let levelProgress = 0;
let enemiesDefeated = 0;
let lastMoveSoundTime = 0;

let isMobile = false;

// Audio settings
let masterVolume = 0.5;
let sfxVolume = 0.5;
let musicVolume = 0.3;
let soundEnabled = true;
let musicEnabled = true;

// Music system
let musicNodes = [];
let musicCurrentVolume = 0.3;

const WEAPONS = {
    BASIC: { fireRate: 250, spread: 0, damage: 2, color: '#00ffff' },
    SPREAD: { fireRate: 400, spread: 30, damage: 2, color: '#00ff00' },
    RAPID: { fireRate: 100, spread: 0, damage: 1, color: '#ff6600' },
    LASER: { fireRate: 50, spread: 0, damage: 5, color: '#ff6600' },
    MEGA: { fireRate: 200, spread: 60, damage: 3, color: '#ff0066' }
};

let currentWeapon = WEAPONS.BASIC;
let lastShotTime = 0;

class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= this.decay;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Player {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
        this.radius = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.x = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, this.y));

        this.angle = Math.atan2(mouseY - this.y, mouseX - this.x);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(5, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        const barWidth = 40;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        screenShake = 10;
        playSound('hit');
        
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const velocity = {
                x: Math.cos(angle) * Math.random() * 5,
                y: Math.sin(angle) * Math.random() * 5
            };
            particles.push(new Particle(this.x, this.y, '#ff0000', velocity));
        }
    }
}

class Bullet {
    constructor(x, y, angle, weapon = currentWeapon) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.velocity = {
            x: Math.cos(angle) * BULLET_SPEED,
            y: Math.sin(angle) * BULLET_SPEED
        };
        this.damage = weapon.damage;
        this.color = weapon.color;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        this.trail.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.x < 0 || this.x > CANVAS_WIDTH || 
               this.y < 0 || this.y > CANVAS_HEIGHT;
    }
}

class Enemy {
    constructor(type = 'basic') {
        this.type = type;
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        
        switch(type) {
            case 'fast':
                this.radius = 8;
                this.speed = 2.5;
                this.health = 1;
                this.maxHealth = 1;
                this.color = '#ff6600';
                this.points = 20;
                break;
            case 'tank':
                this.radius = 20;
                this.speed = 0.5;
                this.health = 3;
                this.maxHealth = 3;
                this.color = '#ff0000';
                this.points = 50;
                break;
            case 'zigzag':
                this.radius = 10;
                this.speed = 1.5;
                this.health = 1;
                this.maxHealth = 1;
                this.color = '#00ff00';
                this.points = 30;
                this.zigzagTimer = 0;
                break;
            case 'ghost':
                this.radius = 12;
                this.speed = 1.2;
                this.health = 1;
                this.maxHealth = 1;
                this.color = '#00ffff';
                this.points = 40;
                this.opacity = 0.5;
                break;
            default:
                this.radius = 12;
                this.speed = 1;
                this.health = 1;
                this.maxHealth = 1;
                this.color = '#ff0066';
                this.points = 10;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        this.x = player.x + Math.cos(angle) * distance;
        this.y = player.y + Math.sin(angle) * distance;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const speedMultiplier = 1 + (level - 1) * 0.1;
        
        if (this.type === 'zigzag') {
            this.zigzagTimer += 0.1;
            const zigzagAngle = angle + Math.sin(this.zigzagTimer) * 0.5;
            this.x += Math.cos(zigzagAngle) * this.speed * speedMultiplier;
            this.y += Math.sin(zigzagAngle) * this.speed * speedMultiplier;
        } else {
            this.x += Math.cos(angle) * this.speed * speedMultiplier;
            this.y += Math.sin(angle) * this.speed * speedMultiplier;
        }
        
        if (this.type === 'ghost') {
            this.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.3;
        }
    }

    draw() {
        ctx.save();
        
        if (this.type === 'ghost') {
            ctx.globalAlpha = this.opacity;
        }
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'zigzag') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.type === 'tank' && this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 3;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
    }

    takeDamage(amount) {
        this.health -= amount;
        
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const velocity = {
                x: Math.cos(angle) * Math.random() * 3,
                y: Math.sin(angle) * Math.random() * 3
            };
            particles.push(new Particle(this.x, this.y, this.color, velocity));
        }
        
        if (this.health <= 0) {
            score += this.points;
            screenShake = 5;
            
            for (let i = 0; i < 15; i++) {
                const angle = (Math.PI * 2 * i) / 15;
                const velocity = {
                    x: Math.cos(angle) * Math.random() * 8,
                    y: Math.sin(angle) * Math.random() * 8
                };
                particles.push(new Particle(this.x, this.y, this.color, velocity));
            }
            
            return true;
        }
        return false;
    }
}

let player;
let bullets = [];
let enemies = [];
let particles = [];
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'Escape' && gameRunning) {
        togglePause();
    }
    if (e.key === 'a' && gameRunning) {
        toggleAutoPlay();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('click', (e) => {
    if (gameRunning && !isMobile) {
        shoot();
    }
});

// Mobile detection and responsive setup
function detectMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 720;
    
    if (isMobile) {
        document.body.classList.add('mobile');
        // Initially hide game elements and show mobile message
        if (document.getElementById('gameCanvas').style.display !== 'block') {
            document.getElementById('gameCanvas').style.display = 'none';
            document.getElementById('mobileMessage').classList.remove('hidden');
        }
    } else {
        document.body.classList.remove('mobile');
        // Show game elements and hide mobile message
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('mobileMessage').classList.add('hidden');
    }
}

function shoot() {
    if (gamePaused) return;
    
    const now = Date.now();
    if (now - lastShotTime < currentWeapon.fireRate) return;
    
    lastShotTime = now;
    playSound('shoot');
    
    if (currentWeapon === WEAPONS.SPREAD) {
        for (let i = -1; i <= 1; i++) {
            const spreadAngle = Math.atan2(mouseY - player.y, mouseX - player.x) + 
                              (i * currentWeapon.spread * Math.PI / 180);
            bullets.push(new Bullet(player.x, player.y, spreadAngle, currentWeapon));
        }
    } else if (currentWeapon === WEAPONS.MEGA) {
        for (let i = -3; i <= 3; i++) {
            const spreadAngle = Math.atan2(mouseY - player.y, mouseX - player.x) + 
                              (i * currentWeapon.spread * Math.PI / 180);
            bullets.push(new Bullet(player.x, player.y, spreadAngle, currentWeapon));
        }
    } else {
        const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
        bullets.push(new Bullet(player.x, player.y, angle, currentWeapon));
    }
    
    for (let i = 0; i < 8; i++) {
        const velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        particles.push(new Particle(player.x, player.y, currentWeapon.color, velocity));
    }
}

function handleMovement() {
    if (gamePaused) return;
    
    if (autoPlay) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            const avoidDistance = 150;
            if (closestDistance < avoidDistance) {
                const avoidAngle = Math.atan2(player.y - closestEnemy.y, player.x - closestEnemy.x);
                player.velocity.x = Math.cos(avoidAngle) * PLAYER_SPEED * 1.2;
                player.velocity.y = Math.sin(avoidAngle) * PLAYER_SPEED * 1.2;
            } else {
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
            
            mouseX = closestEnemy.x;
            mouseY = closestEnemy.y;
            shoot();
        }
    } else {
        player.velocity.x = 0;
        player.velocity.y = 0;
        
        if (keys['w'] || keys['arrowup']) player.velocity.y = -PLAYER_SPEED;
        if (keys['s'] || keys['arrowdown']) player.velocity.y = PLAYER_SPEED;
        if (keys['a'] || keys['arrowleft']) player.velocity.x = -PLAYER_SPEED;
        if (keys['d'] || keys['arrowright']) player.velocity.x = PLAYER_SPEED;
        
        if (player.velocity.x !== 0 && player.velocity.y !== 0) {
            player.velocity.x *= 0.707;
            player.velocity.y *= 0.707;
        }
        

    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bullet.radius + enemy.radius) {
                playSound('targetHit');
                if (enemy.takeDamage(bullet.damage)) {
                    enemies.splice(j, 1);
                    enemiesDefeated++;
                    levelProgress++;
                    checkLevelUp();
                }
                bullets.splice(i, 1);
                hit = true;
                break;
            }
        }
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.radius + player.radius) {
            player.takeDamage(10);
            enemies.splice(i, 1);
            
            if (player.health <= 0) {
                gameOver();
            }
        }
    }
}

function spawnEnemies() {
    if (gamePaused) return;
    
    const enemyCount = Math.min(3 + Math.floor(level / 2), 12);
    
    if (enemies.length < enemyCount) {
        const rand = Math.random();
        let type = 'basic';
        
        if (level > 2 && rand < 0.2) type = 'fast';
        if (level > 4 && rand < 0.15) type = 'tank';
        if (level > 6 && rand < 0.1) type = 'zigzag';
        if (level > 8 && rand < 0.05) type = 'ghost';
        
        enemies.push(new Enemy(type));
    }
}

function drawBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const hue = (backgroundOffset * 2) % 360;
    const colors = ['#00ffff', '#ff0066', '#ff6600', '#00ff00', '#ff0000'];
    const colorIndex = Math.floor(hue / 72) % colors.length;
    ctx.strokeStyle = colors[colorIndex] + '33';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const offsetX = (backgroundOffset % gridSize);
    const offsetY = (backgroundOffset % gridSize);
    
    for (let x = -gridSize + offsetX; x < CANVAS_WIDTH + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    for (let y = -gridSize + offsetY; y < CANVAS_HEIGHT + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    for (let i = 0; i < 150; i++) {
        const x = (i * 73 + backgroundOffset * 0.5) % CANVAS_WIDTH;
        const y = (i * 37 + backgroundOffset * 0.3) % CANVAS_HEIGHT;
        const size = (i % 3) + 1;
        
        const starColors = ['#00ffff', '#ff0066', '#ff6600', '#00ff00', '#ff0000', '#ffffff'];
        ctx.fillStyle = starColors[i % starColors.length];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    backgroundOffset += 0.5;
}

function applyScreenShake() {
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('health').textContent = Math.max(0, player.health);
    document.getElementById('highScore').textContent = highScore;
    
    const healthElement = document.getElementById('health');
    if (player.health > 60) {
        healthElement.style.color = '#00ff00';
        healthElement.style.textShadow = '0 0 15px #00ff00';
    } else if (player.health > 30) {
        healthElement.style.color = '#ffff00';
        healthElement.style.textShadow = '0 0 15px #ffff00';
    } else {
        healthElement.style.color = '#ff0000';
        healthElement.style.textShadow = '0 0 15px #ff0000';
    }
    
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    
    if (autoPlay) {
        autoPlayBtn.textContent = 'AUTO-PLAY ON';
        autoPlayBtn.classList.add('active');
    } else {
        autoPlayBtn.textContent = 'AUTO-PLAY';
        autoPlayBtn.classList.remove('active');
    }
}

function checkLevelUp() {
    const enemiesPerLevel = 10 + level * 2;
    if (levelProgress >= enemiesPerLevel) {
        level++;
        levelProgress = 0;
        player.health = Math.min(player.health + 20, player.maxHealth);
        showUpgradeMessage(`LEVEL ${level}! Health restored!`);
        screenShake = 20;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = {
                x: Math.cos(angle) * Math.random() * 10,
                y: Math.sin(angle) * Math.random() * 10
            };
            particles.push(new Particle(player.x, player.y, `hsl(${Math.random() * 360}, 100%, 50%)`, velocity));
        }
    }
}

function upgradeWeapon() {
    if (score >= 200 && currentWeapon === WEAPONS.BASIC) {
        currentWeapon = WEAPONS.SPREAD;
        showUpgradeMessage('SPREAD SHOT UNLOCKED!');
    } else if (score >= 500 && currentWeapon === WEAPONS.SPREAD) {
        currentWeapon = WEAPONS.LASER;
        showUpgradeMessage('LASER UNLOCKED!');
    } else if (score >= 800 && currentWeapon === WEAPONS.LASER) {
        currentWeapon = WEAPONS.RAPID;
        showUpgradeMessage('RAPID FIRE UNLOCKED!');
    } else if (score >= 1200 && currentWeapon === WEAPONS.RAPID) {
        currentWeapon = WEAPONS.MEGA;
        showUpgradeMessage('MEGA BLAST UNLOCKED!');
    }
}

function showUpgradeMessage(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffff00;
        font-size: 32px;
        font-weight: bold;
        text-shadow: 0 0 20px #ffff00;
        z-index: 100;
        animation: pulse 1s ease-in-out;
        pointer-events: none;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

function togglePause() {
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gamePaused) {
        pauseBtn.textContent = 'RESUME';
        pauseBtn.classList.add('active');
    } else {
        pauseBtn.textContent = 'PAUSE';
        pauseBtn.classList.remove('active');
    }
}

function toggleAutoPlay() {
    autoPlay = !autoPlay;
    if (autoPlay) {
        showUpgradeMessage('AUTO-PLAY ON!');
    } else {
        showUpgradeMessage('AUTO-PLAY OFF!');
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        drawBackground();
        
        ctx.save();
        applyScreenShake();
        
        handleMovement();
        player.update();
        player.draw();
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].draw();
            
            if (bullets[i].isOffScreen()) {
                playSound('targetMiss');
                bullets.splice(i, 1);
            }
        }
        
        enemies.forEach(enemy => {
            enemy.update();
            enemy.draw();
        });
        
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        ctx.restore();
        
        checkCollisions();
        spawnEnemies();
        upgradeWeapon();
        updateUI();
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = 'RESUME';
        pauseBtn.classList.add('active');
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (isMobile) {
        return;
    }
    
    gameRunning = true;
    gamePaused = false;
    autoPlay = false;
    score = 0;
    level = 1;
    levelProgress = 0;
    enemiesDefeated = 0;
    currentWeapon = WEAPONS.BASIC;
    
    // Initialize mobile detection
    detectMobile();
    
    player = new Player();
    bullets = [];
    enemies = [];
    particles = [];
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    
    // Load settings and start music
    loadSettings();
    if (musicEnabled) {
        startBackgroundMusic();
    }
    
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    stopBackgroundMusic();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonShooterHighScore', highScore);
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

document.getElementById('startBtn').addEventListener('click', () => {
    // Initialize audio context on first user interaction
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    playSound('click');
    startGame();
});
document.getElementById('restartBtn').addEventListener('click', () => {
    playSound('click');
    startGame();
});
document.getElementById('pauseBtn').addEventListener('click', () => {
    playSound('click');
    togglePause();
});
document.getElementById('autoPlayBtn').addEventListener('click', () => {
    playSound('click');
    toggleAutoPlay();
});
document.getElementById('settingsBtn').addEventListener('click', () => {
    playSound('click');
    if (gameRunning && !gamePaused) {
        togglePause();
    }
    document.getElementById('settingsModal').classList.remove('hidden');
});
document.getElementById('closeSettings').addEventListener('click', () => {
    playSound('click');
    document.getElementById('settingsModal').classList.add('hidden');
    saveSettings();
});
document.getElementById('resetSettings').addEventListener('click', () => {
    playSound('click');
    resetSettings();
});

// Volume control listeners
document.getElementById('masterVolume').addEventListener('input', (e) => {
    masterVolume = e.target.value / 100;
    document.getElementById('masterVolumeValue').textContent = e.target.value + '%';
    updateMusicVolume();
});

document.getElementById('sfxVolume').addEventListener('input', (e) => {
    sfxVolume = e.target.value / 100;
    document.getElementById('sfxVolumeValue').textContent = e.target.value + '%';
});

document.getElementById('musicVolume').addEventListener('input', (e) => {
    musicVolume = e.target.value / 100;
    document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
    updateMusicVolume();
});

document.getElementById('soundEnabled').addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
});

document.getElementById('musicEnabled').addEventListener('change', (e) => {
    musicEnabled = e.target.checked;
    if (musicEnabled) {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
});

// Also initialize audio on any click to ensure it's active
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

window.addEventListener('resize', () => {
    resizeCanvas();
    detectMobile();
});

window.addEventListener('load', () => {
    detectMobile();
    if (isMobile) {
        document.getElementById('instructions').textContent = 'Mobile not available - please use desktop';
    } else {
        document.getElementById('instructions').textContent = 'WASD/Arrows to move • Mouse to aim • Click to shoot';
    }
});

document.getElementById('highScore').textContent = highScore;