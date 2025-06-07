// Game State Management
const gameState = {
    currentScreen: 'main-menu',
    slingshotGame: {
        coins: 0,
        shots: 0,
        hits: 0,
        isDragging: false,
        startPos: { x: 0, y: 0 },
        currentPos: { x: 0, y: 0 },
        power: 0,
        slowMotion: false,
        projectileElement: null
    },
    battleGame: {
        playerCards: [],
        aiCards: [],
        selectedPlayerCard: null,
        selectedAiCard: null,
        playerScore: 5,
        aiScore: 5,
        playerWins: 0,
        aiWins: 0,
        round: 1,
        wonCards: [],
        autoPlay: false,
        battleHistory: [],
        difficulty: 'normal',
        leaderboard: JSON.parse(localStorage.getItem('battleLeaderboard') || '[]')
    }
};

// Card Templates for Battle Game
const cardTemplates = [
    { name: 'Dragon King', attack: 85, health: 90 },
    { name: 'Shadow Assassin', attack: 95, health: 60 },
    { name: 'Ice Wizard', attack: 70, health: 85 },
    { name: 'Fire Demon', attack: 90, health: 75 },
    { name: 'Storm Lord', attack: 80, health: 80 },
    { name: 'Earth Guardian', attack: 65, health: 95 },
    { name: 'Lightning Beast', attack: 100, health: 55 },
    { name: 'Void Reaper', attack: 75, health: 70 },
    { name: 'Crystal Golem', attack: 60, health: 100 },
    { name: 'Wind Dancer', attack: 88, health: 65 }
];

// Navigation Functions
function startGame(gameType) {
    console.log('Starting game:', gameType);
    hideAllScreens();
    
    if (gameType === 'slingshot') {
        document.getElementById('slingshot-game').classList.add('active');
        gameState.currentScreen = 'slingshot-game';
        setTimeout(() => initSlingshotGame(), 100);
    } else if (gameType === 'battle') {
        document.getElementById('battle-game').classList.add('active');
        gameState.currentScreen = 'battle-game';
        setTimeout(() => initBattleGame(), 100);
    } else if (gameType === 'gems') {
        document.getElementById('gems-game').classList.add('active');
        gameState.currentScreen = 'gems-game';
        setTimeout(() => initGemGame(), 100);
    } else if (gameType === 'tower') {
        document.getElementById('tower-game').classList.add('active');
        gameState.currentScreen = 'tower-game';
        setTimeout(() => initTowerGame(), 100);
    }
}

function goToMenu() {
    hideAllScreens();
    document.getElementById('main-menu').classList.add('active');
    gameState.currentScreen = 'main-menu';
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
}

// ===== SLINGSHOT GAME =====

function initSlingshotGame() {
    console.log('Initializing slingshot game...');
    gameState.slingshotGame.coins = 0;
    gameState.slingshotGame.shots = 0;
    gameState.slingshotGame.hits = 0;
    updateSlingshotDisplay();
    resetBankItems();
    setupSlingshotControls();
    
    // Initialize enhanced features
    setTimeout(() => {
        enhanceSlingshotGame();
    }, 500);
    
    console.log('Slingshot game initialized!');
}

function resetSlingshotGame() {
    gameState.slingshotGame.coins = 0;
    gameState.slingshotGame.shots = 0;
    gameState.slingshotGame.hits = 0;
    updateSlingshotDisplay();
    resetBankItems();
    resetProjectile();
}

function resetBankItems() {
    const bankItems = document.querySelectorAll('.bank-item');
    bankItems.forEach(item => {
        item.classList.remove('destroyed', 'coin-collected');
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.pointerEvents = 'auto';
        item.style.animation = '';
    });
}

function updateSlingshotDisplay() {
    const coinsEl = document.getElementById('coins');
    const shotsEl = document.getElementById('shots');
    const accuracyEl = document.getElementById('accuracy');
    
    if (coinsEl) coinsEl.textContent = gameState.slingshotGame.coins;
    if (shotsEl) shotsEl.textContent = gameState.slingshotGame.shots;
    
    const accuracy = gameState.slingshotGame.shots > 0 
        ? Math.round((gameState.slingshotGame.hits / gameState.slingshotGame.shots) * 100) 
        : 0;
    if (accuracyEl) accuracyEl.textContent = accuracy + '%';
}

function setupSlingshotControls() {
    const projectile = document.getElementById('projectile');
    if (!projectile) {
        console.error('Projectile element not found!');
        return;
    }
    
    gameState.slingshotGame.projectileElement = projectile;
    
    // Remove existing listeners
    projectile.removeEventListener('mousedown', handleMouseDown);
    projectile.removeEventListener('touchstart', handleTouchStart);
    
    // Add fresh listeners
    projectile.addEventListener('mousedown', handleMouseDown);
    projectile.addEventListener('touchstart', handleTouchStart);
    
    console.log('Slingshot controls set up successfully!');
}

function handleMouseDown(e) {
    e.preventDefault();
    console.log('Mouse down detected!');
    gameState.slingshotGame.isDragging = true;
    gameState.slingshotGame.startPos = { x: e.clientX, y: e.clientY };
    
    // Add document listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    showTrajectoryLine();
}

function handleTouchStart(e) {
    e.preventDefault();
    console.log('Touch start detected!');
    const touch = e.touches[0];
    gameState.slingshotGame.isDragging = true;
    gameState.slingshotGame.startPos = { x: touch.clientX, y: touch.clientY };
    
    // Add document listeners for touch move and end
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    showTrajectoryLine();
}

function handleMouseMove(e) {
    if (!gameState.slingshotGame.isDragging) return;
    
    const currentPos = { x: e.clientX, y: e.clientY };
    updateAimIndicator(currentPos);
    gameState.slingshotGame.currentPos = currentPos;
}

function handleTouchMove(e) {
    if (!gameState.slingshotGame.isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    updateAimIndicator(currentPos);
    gameState.slingshotGame.currentPos = currentPos;
}

function handleMouseUp(e) {
    if (!gameState.slingshotGame.isDragging) return;
    
    console.log('Mouse up - firing projectile!');
    gameState.slingshotGame.isDragging = false;
    
    // Remove document listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    hideTrajectoryLine();
    fireProjectile();
}

function handleTouchEnd(e) {
    if (!gameState.slingshotGame.isDragging) return;
    
    console.log('Touch end - firing projectile!');
    gameState.slingshotGame.isDragging = false;
    
    // Remove document listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    hideTrajectoryLine();
    fireProjectile();
}

function showTrajectoryLine() {
    const trajectoryLine = document.getElementById('trajectoryLine');
    if (trajectoryLine) trajectoryLine.style.opacity = '1';
}

function hideTrajectoryLine() {
    const trajectoryLine = document.getElementById('trajectoryLine');
    const powerFill = document.getElementById('powerFill');
    const bandLeft = document.getElementById('bandLeft');
    const bandRight = document.getElementById('bandRight');
    
    if (trajectoryLine) trajectoryLine.style.opacity = '0';
    if (powerFill) powerFill.style.width = '0%';
    if (bandLeft) bandLeft.style.transform = 'rotate(-25deg)';
    if (bandRight) bandRight.style.transform = 'rotate(25deg)';
}

function updateAimIndicator(currentPos) {
    const trajectoryLine = document.getElementById('trajectoryLine');
    const powerFill = document.getElementById('powerFill');
    const bandLeft = document.getElementById('bandLeft');
    const bandRight = document.getElementById('bandRight');
    
    if (!trajectoryLine || !powerFill || !bandLeft || !bandRight) return;
    
    const deltaX = currentPos.x - gameState.slingshotGame.startPos.x;
    const deltaY = currentPos.y - gameState.slingshotGame.startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const maxDistance = 150;
    const clampedDistance = Math.min(distance, maxDistance);
    const power = clampedDistance / maxDistance;
    
    gameState.slingshotGame.power = power;
    
    // Update trajectory line
    trajectoryLine.style.height = `${clampedDistance * 2}px`;
    const aimAngle = Math.atan2(-deltaX, -deltaY);
    trajectoryLine.style.transform = `translateX(-50%) rotate(${aimAngle}rad)`;
    
    // Update power meter
    powerFill.style.width = `${power * 100}%`;
    
    // Update slingshot bands
    const bandTension = Math.min(power * 20, 15);
    bandLeft.style.transform = `rotate(${-25 - bandTension}deg)`;
    bandRight.style.transform = `rotate(${25 + bandTension}deg)`;
}

function fireProjectile() {
    const projectile = gameState.slingshotGame.projectileElement;
    if (!projectile) return;
    
    gameState.slingshotGame.shots++;
    
    // Calculate trajectory
    const deltaX = gameState.slingshotGame.currentPos.x - gameState.slingshotGame.startPos.x;
    const deltaY = gameState.slingshotGame.currentPos.y - gameState.slingshotGame.startPos.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const power = Math.min(distance / 50, 4);
    
    // Opposite direction for slingshot physics
    const targetX = -deltaX * power;
    const targetY = -deltaY * power;
    
    console.log(`Firing projectile! Power: ${power}, Target: (${targetX}, ${targetY})`);
    
    // Animate projectile
    const duration = gameState.slingshotGame.slowMotion ? 2000 : 1000;
    
    projectile.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    projectile.style.transform = `translateX(-50%) translateX(${targetX}px) translateY(${targetY}px)`;
    
    // Start collision detection
    setTimeout(() => {
        checkCollisionsDuringFlight(targetX, targetY, duration);
    }, 100);
    
    // Reset projectile after animation
    setTimeout(() => {
        resetProjectile();
        updateSlingshotDisplay();
    }, duration + 200);
}

function checkCollisionsDuringFlight(targetX, targetY, duration) {
    const projectile = gameState.slingshotGame.projectileElement;
    if (!projectile) return;
    
    const startTime = Date.now();
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    const gameAreaRect = gameArea.getBoundingClientRect();
    const initialProjectileRect = projectile.getBoundingClientRect();
    
    function checkFrame() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress >= 1) return;
        
        // Get current projectile position
        const currentProjectileRect = projectile.getBoundingClientRect();
        
        // Check collision with bank items
        const bankItems = document.querySelectorAll('.bank-item:not(.destroyed)');
        bankItems.forEach(item => {
            if (item.classList.contains('hit')) return;
            
            const itemRect = item.getBoundingClientRect();
            
            // Check if projectile overlaps with item
            const projectileCenterX = currentProjectileRect.left + currentProjectileRect.width / 2;
            const projectileCenterY = currentProjectileRect.top + currentProjectileRect.height / 2;
            
            const itemCenterX = itemRect.left + itemRect.width / 2;
            const itemCenterY = itemRect.top + itemRect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(projectileCenterX - itemCenterX, 2) + 
                Math.pow(projectileCenterY - itemCenterY, 2)
            );
            
            if (distance < 40) { // Collision threshold
                console.log('Collision detected with:', item.dataset.type);
                item.classList.add('hit');
                destroyBankItem(item);
                gameState.slingshotGame.hits++;
                return;
            }
        });
        
        requestAnimationFrame(checkFrame);
    }
    
    requestAnimationFrame(checkFrame);
}

function resetProjectile() {
    const projectile = gameState.slingshotGame.projectileElement;
    if (!projectile) return;
    
    projectile.style.transition = '';
    projectile.style.transform = 'translateX(-50%)';
}

function destroyBankItem(item) {
    const value = parseInt(item.dataset.value) || 0;
    const itemRect = item.getBoundingClientRect();
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
    
    // Calculate center position relative to game area
    const centerX = itemRect.left + itemRect.width / 2 - gameAreaRect.left;
    const centerY = itemRect.top + itemRect.height / 2 - gameAreaRect.top;
    
    // Update game state with combo system
    if (!gameState.slingshotGame.combo) gameState.slingshotGame.combo = 0;
    gameState.slingshotGame.combo++;
    
    const comboMultiplier = Math.min(gameState.slingshotGame.combo, 5);
    const finalValue = value * comboMultiplier;
    
    gameState.slingshotGame.coins += finalValue;
    
    console.log(`💥 Destroyed ${item.dataset.type} for ${finalValue} coins! (Combo x${comboMultiplier})`);
    
    // Spectacular destruction effects
    createAdvancedExplosionEffect(item, centerX, centerY);
    createParticleSystem(centerX, centerY, item.dataset.type === 'diamond' ? 'ice' : 
                        item.dataset.type === 'crown' ? 'lightning' : 'fire');
    
    // Enhanced coin effects
    const coinValue = createAdvancedCoinEffect(item);
    createFloatingScore(centerX, centerY, finalValue, comboMultiplier);
    
    // Screen shake for big hits
    if (comboMultiplier > 2 || item.dataset.type === 'crown') {
        createScreenShake();
    }
    
    // Visual destruction with enhanced animation
    item.classList.add('destroyed');
    item.style.animation = 'gemExplosionSpectacular 1.2s ease-out forwards';
    
    // Remove item after spectacular effects
    setTimeout(() => {
        item.style.opacity = '0';
        item.style.pointerEvents = 'none';
        item.style.display = 'none';
    }, 1200);
}

function createFloatingCoin(item, value) {
    const floatingCoin = document.createElement('div');
    floatingCoin.innerHTML = `
        <div class="floating-value">+${value}</div>
        <div class="floating-coin-sprite">
            <div class="coin-face"></div>
            <div class="coin-shine"></div>
        </div>
    `;
    floatingCoin.className = 'floating-treasure';
    floatingCoin.style.position = 'absolute';
    floatingCoin.style.left = (item.offsetLeft + 20) + 'px';
    floatingCoin.style.top = (item.offsetTop + 10) + 'px';
    floatingCoin.style.zIndex = '1000';
    floatingCoin.style.pointerEvents = 'none';
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) gameArea.appendChild(floatingCoin);
    
    setTimeout(() => {
        floatingCoin.remove();
    }, 1500);
}

// Advanced Effects System
function createAdvancedExplosionEffect(item, centerX, centerY) {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    // Main explosion
    const explosion = document.createElement('div');
    explosion.className = 'advanced-explosion';
    explosion.style.cssText = `
        position: absolute;
        left: ${centerX - 30}px;
        top: ${centerY - 30}px;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, #FF6B6B, #FFD700, transparent);
        border-radius: 50%;
        animation: advancedExplode 0.8s ease-out forwards;
        z-index: 999;
    `;
    gameArea.appendChild(explosion);
    
    // Particle effects
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        const angle = (i / 12) * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #FFD700, #FF6B6B);
            border-radius: 50%;
            animation: particleExplode 1s ease-out forwards;
            transform: translate(${endX - centerX}px, ${endY - centerY}px) scale(0);
            z-index: 998;
        `;
        gameArea.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
    
    // Lightning flash effect
    const flash = document.createElement('div');
    flash.className = 'explosion-flash';
    flash.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        animation: explosionFlash 0.3s ease-out forwards;
        z-index: 1001;
    `;
    gameArea.appendChild(flash);
    
    setTimeout(() => {
        explosion.remove();
        flash.remove();
    }, 1000);
}

function createAdvancedCoinEffect(item) {
    const baseValue = parseInt(item.dataset.value) || 10;
    const bonusMultiplier = item.dataset.type === 'crown' ? 3 : 
                           item.dataset.type === 'diamond' ? 2 : 1;
    
    // Create multiple floating coins
    for (let i = 0; i < bonusMultiplier; i++) {
        setTimeout(() => {
            createFloatingCoin(item, baseValue);
        }, i * 100);
    }
    
    return baseValue * bonusMultiplier;
}

function createFloatingScore(x, y, points, multiplier) {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    const scoreElement = document.createElement('div');
    scoreElement.className = 'floating-score';
    scoreElement.innerHTML = multiplier > 1 ? 
        `<span class="score-points">+${points}</span><span class="score-combo">x${multiplier}</span>` :
        `<span class="score-points">+${points}</span>`;
    
    scoreElement.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: ${multiplier > 1 ? '#FFD700' : '#4ECDC4'};
        font-size: ${multiplier > 1 ? '24px' : '18px'};
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        animation: scoreFloat 2s ease-out forwards;
        z-index: 1000;
        pointer-events: none;
    `;
    
    gameArea.appendChild(scoreElement);
    
    setTimeout(() => scoreElement.remove(), 2000);
}

function createScreenShake() {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    gameArea.style.animation = 'screenShake 0.5s ease-out';
    setTimeout(() => {
        gameArea.style.animation = '';
    }, 500);
}

// Professional Particle System
function createParticleSystem(x, y, type) {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    const colors = {
        fire: ['#FF6B6B', '#FFD700', '#FF4500'],
        ice: ['#87CEEB', '#B0E0E6', '#E6F3FF'],
        lightning: ['#FFD700', '#FFFF00', '#FFA500'],
        magic: ['#9B59B6', '#E6E6FA', '#DDA0DD']
    };
    
    const particleColors = colors[type] || colors.fire;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        const size = 2 + Math.random() * 4;
        
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 6px ${color};
            animation: particleDrift ${1 + Math.random()}s ease-out forwards;
            z-index: 999;
        `;
        
        gameArea.appendChild(particle);
        
        // Animate particle movement
        let particleX = x;
        let particleY = y;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const animate = () => {
            particleX += vx;
            particleY += vy;
            particle.style.left = particleX + 'px';
            particle.style.top = particleY + 'px';
            particle.style.opacity = parseFloat(particle.style.opacity || 1) - 0.02;
            
            if (parseFloat(particle.style.opacity) > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function quickShot() {
    const projectile = gameState.slingshotGame.projectileElement;
    if (!projectile) return;
    
    // Simulate a quick shot
    gameState.slingshotGame.startPos = { x: 400, y: 300 };
    gameState.slingshotGame.currentPos = {
        x: 400 + (Math.random() - 0.5) * 200,
        y: 300 + (Math.random() - 0.5) * 200
    };
    
    fireProjectile();
}

function toggleSlowMotion() {
    gameState.slingshotGame.slowMotion = !gameState.slingshotGame.slowMotion;
    const btn = document.getElementById('slow-motion-btn');
    if (btn) btn.textContent = `🕐 Slow Motion: ${gameState.slingshotGame.slowMotion ? 'ON' : 'OFF'}`;
}

function autoAim() {
    const bankItems = document.querySelectorAll('.bank-item:not(.destroyed)');
    if (bankItems.length === 0) return;
    
    const target = bankItems[Math.floor(Math.random() * bankItems.length)];
    const targetRect = target.getBoundingClientRect();
    const projectile = gameState.slingshotGame.projectileElement;
    if (!projectile) return;
    
    const projectileRect = projectile.getBoundingClientRect();
    
    gameState.slingshotGame.startPos = { 
        x: projectileRect.left + projectileRect.width/2, 
        y: projectileRect.top + projectileRect.height/2 
    };
    gameState.slingshotGame.currentPos = {
        x: gameState.slingshotGame.startPos.x - (targetRect.left - projectileRect.left) * 0.4,
        y: gameState.slingshotGame.startPos.y - (targetRect.top - projectileRect.top) * 0.4
    };
    
    fireProjectile();
}

function showSlingshotHelp() {
    alert(`🎯 SLINGSHOT MADNESS GUIDE\n\n🎮 HOW TO PLAY:\n• Click and drag the cannonball backwards to aim\n• Release to shoot towards the bank treasures\n• Collect valuable items to earn coins\n\n💰 SCORING:\n• Gold Coin: 25 coins\n• Treasure Chest: 50 coins\n• Trophy: 75 coins\n• Medal: 80 coins\n• Money Stack: 120 coins\n• Crown: 150 coins\n• Diamond: 100 coins\n• Royal Ring: 200 coins\n\n⚡ FEATURES:\n• Auto Aim: Automatically targets treasures\n• Quick Shot: Random direction shot\n• Slow Motion: Slows down projectile\n• Track your accuracy and progress!`);
}

// ===== BATTLE GAME =====

function initBattleGame() {
    console.log('Initializing battle game...');
    generateCards();
    renderPlayerCards();
    renderAiCards();
    updateBattleDisplay();
    updateWonCardsDisplay();
    resetBattleUI();
    console.log('Battle game initialized!');
}

function generateCards() {
    const battleGame = gameState.battleGame;
    
    // Difficulty modifiers
    const difficultyMods = {
        easy: { player: 1.2, ai: 0.8 },
        normal: { player: 1.0, ai: 1.0 },
        hard: { player: 0.9, ai: 1.1 },
        nightmare: { player: 0.8, ai: 1.3 }
    };
    
    const mod = difficultyMods[battleGame.difficulty];
    
    // Generate player cards
    battleGame.playerCards = [];
    for (let i = 0; i < 5; i++) {
        const template = cardTemplates[Math.floor(Math.random() * cardTemplates.length)];
        const card = {
            id: 'player_' + i,
            name: template.name,
            attack: Math.round(template.attack * mod.player),
            health: Math.round(template.health * mod.player)
        };
        battleGame.playerCards.push(card);
    }
    
    // Generate AI cards
    battleGame.aiCards = [];
    for (let i = 0; i < 5; i++) {
        const template = cardTemplates[Math.floor(Math.random() * cardTemplates.length)];
        const card = {
            id: 'ai_' + i,
            name: template.name,
            attack: Math.round(template.attack * mod.ai),
            health: Math.round(template.health * mod.ai)
        };
        battleGame.aiCards.push(card);
    }
    
    // Reset scores
    battleGame.playerScore = 5;
    battleGame.aiScore = 5;
}

function renderPlayerCards() {
    const playerHand = document.getElementById('player-hand');
    if (!playerHand) return;
    
    playerHand.innerHTML = '';
    
    gameState.battleGame.playerCards.forEach(card => {
        const cardElement = createCardElement(card, 'player');
        playerHand.appendChild(cardElement);
    });
}

function renderAiCards() {
    const aiHand = document.getElementById('ai-hand');
    if (!aiHand) return;
    
    aiHand.innerHTML = '';
    
    gameState.battleGame.aiCards.forEach(card => {
        const cardElement = createCardElement(card, 'ai');
        aiHand.appendChild(cardElement);
    });
}

function createCardElement(card, owner) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'battle-card epic-card';
    cardDiv.dataset.cardId = card.id;
    
    cardDiv.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-border"></div>
        <div class="card-portrait">
            <div class="card-avatar ${getCardAvatar(card.name)}"></div>
            <div class="card-frame"></div>
        </div>
        <div class="card-name">${card.name}</div>
        <div class="card-stats">
            <div class="attack-stat">
                <div class="stat-icon attack-icon">⚔️</div>
                <div class="stat-value">${card.attack}</div>
            </div>
            <div class="health-stat">
                <div class="stat-icon health-icon">❤️</div>
                <div class="stat-value">${card.health}</div>
            </div>
        </div>
        <div class="card-power">${card.attack + card.health}</div>
    `;
    
    if (owner === 'player') {
        cardDiv.style.cursor = 'pointer';
        cardDiv.onclick = () => selectPlayerCard(card);
    }
    
    return cardDiv;
}

function getCardAvatar(cardName) {
    const avatars = {
        'Dragon King': 'dragon-avatar',
        'Shadow Assassin': 'assassin-avatar', 
        'Ice Wizard': 'wizard-avatar',
        'Fire Demon': 'demon-avatar',
        'Storm Lord': 'storm-avatar',
        'Earth Guardian': 'guardian-avatar',
        'Lightning Beast': 'beast-avatar',
        'Void Reaper': 'reaper-avatar',
        'Crystal Golem': 'golem-avatar',
        'Wind Dancer': 'dancer-avatar'
    };
    return avatars[cardName] || 'default-avatar';
}

function selectPlayerCard(card) {
    console.log('Selected card:', card.name);
    const battleGame = gameState.battleGame;
    
    // Remove previous selection
    document.querySelectorAll('.battle-card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new card
    battleGame.selectedPlayerCard = card;
    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
    if (cardElement) {
        cardElement.classList.add('selected');
        cardElement.style.transform = 'translateY(-10px) scale(1.05)';
    }
    
    updateSelectedCardDisplay(card, 'player-selected');
    
    // Enable battle button
    const battleBtn = document.getElementById('battle-btn');
    if (battleBtn) {
        battleBtn.disabled = false;
        battleBtn.style.opacity = '1';
        battleBtn.style.cursor = 'pointer';
        console.log('Battle button enabled!');
    }
}

function updateSelectedCardDisplay(card, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="selected-card-display">
            <div class="selected-card-portrait">
                <div class="card-avatar ${getCardAvatar(card.name)}"></div>
            </div>
            <h4>${card.name}</h4>
            <div class="card-stats">
                <div class="attack-stat">⚔️ ${card.attack}</div>
                <div class="health-stat">❤️ ${card.health}</div>
            </div>
            <div class="total-power">Total Power: ${card.attack + card.health}</div>
        </div>
    `;
}

function playBattle() {
    console.log('BATTLE STARTED!');
    const battleGame = gameState.battleGame;
    if (!battleGame.selectedPlayerCard) {
        console.log('No player card selected!');
        return;
    }
    
    // AI selects a random card
    const aiCard = battleGame.aiCards[Math.floor(Math.random() * battleGame.aiCards.length)];
    battleGame.selectedAiCard = aiCard;
    
    console.log('AI selected:', aiCard.name);
    
    // Highlight AI selection
    document.querySelectorAll('#ai-hand .battle-card').forEach(el => {
        el.classList.remove('selected');
    });
    const aiCardElement = document.querySelector(`[data-card-id="${aiCard.id}"]`);
    if (aiCardElement) {
        aiCardElement.classList.add('selected');
        aiCardElement.style.transform = 'translateY(-10px) scale(1.05)';
    }
    
    updateSelectedCardDisplay(aiCard, 'ai-selected');
    
    // Calculate battle result
    const playerCard = battleGame.selectedPlayerCard;
    const playerPower = playerCard.attack + playerCard.health;
    const aiPower = aiCard.attack + aiCard.health;
    
    let resultText = '';
    let resultClass = '';
    
    if (playerPower > aiPower) {
        // Player wins
        resultText = `🏆 Victory! ${playerCard.name} defeats ${aiCard.name}!`;
        resultClass = 'result-win';
        battleGame.playerScore++;
        battleGame.aiScore--;
        battleGame.wonCards.push({...aiCard, round: battleGame.round});
        
        // Remove AI card
        battleGame.aiCards = battleGame.aiCards.filter(c => c.id !== aiCard.id);
        console.log('Player wins!');
    } else if (aiPower > playerPower) {
        // AI wins
        resultText = `💀 Defeat! ${aiCard.name} defeats ${playerCard.name}!`;
        resultClass = 'result-lose';
        battleGame.aiScore++;
        battleGame.playerScore--;
        
        // Remove player card
        battleGame.playerCards = battleGame.playerCards.filter(c => c.id !== playerCard.id);
        console.log('AI wins!');
    } else {
        // Draw
        resultText = `⚖️ Draw! Both warriors fall!`;
        resultClass = 'result-draw';
        
        // Remove both cards
        battleGame.playerCards = battleGame.playerCards.filter(c => c.id !== playerCard.id);
        battleGame.aiCards = battleGame.aiCards.filter(c => c.id !== aiCard.id);
        console.log('Draw!');
    }
    
    // Show result
    const resultDiv = document.getElementById('battle-result');
    if (resultDiv) {
        resultDiv.textContent = resultText;
        resultDiv.className = resultClass;
        resultDiv.style.fontSize = '1.2rem';
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.padding = '10px';
        resultDiv.style.borderRadius = '8px';
        resultDiv.style.margin = '10px 0';
    }
    
    // Add to battle history
    battleGame.battleHistory.push({
        round: battleGame.round,
        playerCard: playerCard.name,
        aiCard: aiCard.name,
        result: resultText,
        playerPower,
        aiPower
    });
    
    // Update displays
    setTimeout(() => {
        renderPlayerCards();
        renderAiCards();
        updateBattleDisplay();
        updateWonCardsDisplay();
        
        // Reset selections
        battleGame.selectedPlayerCard = null;
        battleGame.selectedAiCard = null;
        const battleBtn = document.getElementById('battle-btn');
        if (battleBtn) {
            battleBtn.disabled = true;
            battleBtn.style.opacity = '0.5';
            battleBtn.style.cursor = 'not-allowed';
        }
        
        // Clear selected displays
        const playerSelected = document.getElementById('player-selected');
        const aiSelected = document.getElementById('ai-selected');
        if (playerSelected) playerSelected.innerHTML = '<p>Select your warrior!</p>';
        if (aiSelected) aiSelected.innerHTML = '<p>AI will choose...</p>';
        
        // Increment round
        battleGame.round++;
        
        // Check for game end
        checkGameEnd();
    }, 2000);
}

function updateBattleDisplay() {
    const battleGame = gameState.battleGame;
    
    const roundEl = document.getElementById('round-number');
    const playerScoreEl = document.getElementById('player-score');
    const aiScoreEl = document.getElementById('ai-score');
    const playerCardsLeftEl = document.getElementById('player-cards-left');
    const aiCardsLeftEl = document.getElementById('ai-cards-left');
    
    if (roundEl) roundEl.textContent = battleGame.round;
    if (playerScoreEl) playerScoreEl.textContent = battleGame.playerScore;
    if (aiScoreEl) aiScoreEl.textContent = battleGame.aiScore;
    if (playerCardsLeftEl) playerCardsLeftEl.textContent = battleGame.playerCards.length;
    if (aiCardsLeftEl) aiCardsLeftEl.textContent = battleGame.aiCards.length;
}

function updateWonCardsDisplay() {
    const wonCardsDiv = document.getElementById('won-cards-display');
    if (!wonCardsDiv) return;
    
    const battleGame = gameState.battleGame;
    
    if (battleGame.wonCards.length === 0) {
        wonCardsDiv.innerHTML = '<div class="empty-trophy">No victories yet... Claim your first trophy!</div>';
    } else {
        wonCardsDiv.innerHTML = '';
        battleGame.wonCards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'won-card';
            cardDiv.innerHTML = `
                <div class="won-card-portrait">
                    <div class="card-avatar ${getCardAvatar(card.name)}"></div>
                </div>
                <div class="card-name">${card.name}</div>
                <div class="card-round">Round ${card.round}</div>
            `;
            wonCardsDiv.appendChild(cardDiv);
        });
    }
    
    // Update stats
    const totalWonEl = document.getElementById('total-won-cards');
    const winRateEl = document.getElementById('win-rate');
    
    if (totalWonEl) totalWonEl.textContent = battleGame.wonCards.length;
    
    if (winRateEl) {
        const winRate = battleGame.battleHistory.length > 0 
            ? Math.round((battleGame.wonCards.length / battleGame.battleHistory.length) * 100) 
            : 0;
        winRateEl.textContent = winRate + '%';
    }
}

function checkGameEnd() {
    const battleGame = gameState.battleGame;
    
    if (battleGame.playerCards.length === 0 || battleGame.aiCards.length === 0) {
        let endMessage = '';
        if (battleGame.playerCards.length === 0 && battleGame.aiCards.length === 0) {
            endMessage = '⚖️ Epic Draw! Both armies have fallen!';
        } else if (battleGame.playerCards.length === 0) {
            endMessage = '💀 Defeat! The AI conquers your army!';
        } else {
            endMessage = '🏆 Victory! You have conquered the AI!';
        }
        
        const finalScore = calculateFinalScore();
        alert(`🏁 BATTLE COMPLETE!\n\n${endMessage}\n\nFinal Score: ${finalScore}\nCards Won: ${battleGame.wonCards.length}\nRounds Played: ${battleGame.round - 1}`);
        
        // Reset for new game
        setTimeout(() => {
            resetBattleGame();
        }, 1000);
    }
}

function calculateFinalScore() {
    const battleGame = gameState.battleGame;
    let score = battleGame.wonCards.length * 100;
    score += battleGame.playerScore * 50;
    return score;
}

function resetBattleGame() {
    gameState.battleGame.round = 1;
    gameState.battleGame.wonCards = [];
    gameState.battleGame.battleHistory = [];
    initBattleGame();
}

function resetBattleUI() {
    const battleResult = document.getElementById('battle-result');
    const battleBtn = document.getElementById('battle-btn');
    
    if (battleResult) battleResult.textContent = '';
    if (battleBtn) {
        battleBtn.disabled = true;
        battleBtn.style.opacity = '0.5';
        battleBtn.style.cursor = 'not-allowed';
    }
}

function toggleDifficulty() {
    const difficulties = ['easy', 'normal', 'hard', 'nightmare'];
    const current = gameState.battleGame.difficulty;
    const currentIndex = difficulties.indexOf(current);
    const newIndex = (currentIndex + 1) % difficulties.length;
    
    gameState.battleGame.difficulty = difficulties[newIndex];
    
    const btn = document.getElementById('difficulty-btn');
    if (btn) {
        btn.textContent = `⚔️ Difficulty: ${gameState.battleGame.difficulty.charAt(0).toUpperCase() + gameState.battleGame.difficulty.slice(1)}`;
    }
    
    // Regenerate cards with new difficulty
    generateCards();
    renderPlayerCards();
    renderAiCards();
}

function showCardDetails() {
    const battleGame = gameState.battleGame;
    let details = '📊 CARD ANALYSIS\n\n';
    
    details += '🛡️ YOUR CARDS:\n';
    battleGame.playerCards.forEach((card, i) => {
        details += `${i+1}. ${card.name} - ⚔️${card.attack} ❤️${card.health} (Power: ${card.attack + card.health})\n`;
    });
    
    details += '\n🤖 AI CARDS:\n';
    battleGame.aiCards.forEach((card, i) => {
        details += `${i+1}. ${card.name} - ⚔️${card.attack} ❤️${card.health} (Power: ${card.attack + card.health})\n`;
    });
    
    if (battleGame.wonCards.length > 0) {
        details += '\n🏆 CAPTURED CARDS:\n';
        battleGame.wonCards.forEach(card => {
            details += `• ${card.name} (Round ${card.round})\n`;
        });
    }
    
    alert(details);
}

function showBattleHelp() {
    alert(`⚔️ BATTLE OF ROYALS GUIDE\n\n🎮 HOW TO PLAY:\n• Select a warrior card from your hand\n• Click BATTLE to fight AI's random choice\n• Card power = Attack + Health combined\n• Higher power wins the battle\n\n🏆 WINNING:\n• Defeat AI cards to capture them\n• Collect trophies in your victory case\n• Survive until AI runs out of cards\n\n⚡ DIFFICULTY LEVELS:\n• Easy: AI cards are weaker\n• Normal: Balanced gameplay\n• Hard: AI cards are stronger\n• Nightmare: Ultimate challenge!`);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Epic Games Collection - Initializing...');
    
    // Create stars animation for main menu
    createStarsAnimation();
    
    // Setup game animations
    setupGameAnimations();
    
    console.log('✅ Games initialized and ready to play!');
});

function createStarsAnimation() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    // Clear existing stars
    starsContainer.innerHTML = '';
    
    // Create animated stars
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starsContainer.appendChild(star);
    }
}

function setupGameAnimations() {
    // Add game-specific CSS animations
    if (!document.querySelector('#gameAnimations')) {
        const style = document.createElement('style');
        style.id = 'gameAnimations';
        style.textContent = `
            .star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                animation: twinkle 2s infinite;
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            
            @keyframes treasureDestroy {
                0% { 
                    transform: scale(1) rotate(0deg); 
                    opacity: 1; 
                    filter: brightness(1);
                }
                25% { 
                    transform: scale(1.3) rotate(90deg); 
                    opacity: 0.8;
                    filter: brightness(1.5);
                }
                75% { 
                    transform: scale(0.8) rotate(270deg); 
                    opacity: 0.3;
                    filter: brightness(2);
                }
                100% { 
                    transform: scale(0) rotate(360deg); 
                    opacity: 0;
                    filter: brightness(3);
                }
            }
            
            .floating-treasure {
                animation: floatTreasure 1.5s ease-out forwards;
            }
            
            @keyframes floatTreasure {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

window.addEventListener('load', function() {
    console.log('🎮 Page fully loaded - Games ready!');
});

// ===== ENHANCED SLINGSHOT FEATURES =====
function enhanceSlingshotGame() {
    gameState.slingshotGame.powerLevel = 0;
    gameState.slingshotGame.specialShots = {
        explosive: { count: 3, unlocked: true },
        penetrating: { count: 2, unlocked: false },
        homing: { count: 1, unlocked: false }
    };
    gameState.slingshotGame.windEffect = Math.random() * 0.4 - 0.2;
    updateSpecialShotsDisplay();
    updateWindIndicator();
}

function updateWindIndicator() {
    const windDirection = gameState.slingshotGame.windEffect > 0 ? '→' : '←';
    const windStrength = Math.abs(gameState.slingshotGame.windEffect);
    let windDisplay = document.querySelector('.wind-indicator');
    if (!windDisplay) {
        windDisplay = document.createElement('div');
        windDisplay.className = 'wind-indicator';
        windDisplay.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; z-index: 100;';
        document.querySelector('.game-area').appendChild(windDisplay);
    }
    windDisplay.textContent = `💨 Wind: ${windDirection} ${Math.round(windStrength * 100)}%`;
}

function updateSpecialShotsDisplay() {
    let display = document.querySelector('.special-shots');
    if (!display) {
        display = document.createElement('div');
        display.className = 'special-shots';
        display.style.cssText = 'position: absolute; bottom: 100px; right: 10px; background: rgba(26, 26, 46, 0.95); border: 2px solid #4ecdc4; border-radius: 15px; padding: 15px; min-width: 200px; z-index: 100;';
        document.querySelector('.game-area').appendChild(display);
    }
    
    const shots = gameState.slingshotGame.specialShots;
    display.innerHTML = `
        <h4 style="color: #4ecdc4; margin: 0 0 10px 0; text-align: center;">⚡ Special Shots</h4>
        <button onclick="useSpecialShot('explosive')" style="width: 100%; background: linear-gradient(145deg, #ff6b6b, #e74c3c); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; font-weight: bold;" ${shots.explosive.count <= 0 ? 'disabled' : ''}>
            💥 Explosive (${shots.explosive.count})
        </button>
        <button onclick="useSpecialShot('penetrating')" style="width: 100%; background: linear-gradient(145deg, #ff6b6b, #e74c3c); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; font-weight: bold;" ${!shots.penetrating.unlocked || shots.penetrating.count <= 0 ? 'disabled' : ''}>
            🔫 Penetrating (${shots.penetrating.count})
        </button>
        <button onclick="useSpecialShot('homing')" style="width: 100%; background: linear-gradient(145deg, #ff6b6b, #e74c3c); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; font-weight: bold;" ${!shots.homing.unlocked || shots.homing.count <= 0 ? 'disabled' : ''}>
            🎯 Homing (${shots.homing.count})
        </button>
    `;
}

function useSpecialShot(type) {
    if (!gameState.slingshotGame.specialShots[type].unlocked || 
        gameState.slingshotGame.specialShots[type].count <= 0) {
        return;
    }
    
    gameState.slingshotGame.selectedSpecialShot = type;
    gameState.slingshotGame.specialShots[type].count--;
    updateSpecialShotsDisplay();
}

// ===== GEM CRUSHER GAME =====
const gemState = {
    score: 0, combo: 0, level: 1, board: [], selectedGems: [],
    powerUps: { bomb: { ready: true }, lightning: { ready: true }, rainbow: { ready: true } },
    stats: { gemsCrushed: 0, bestCombo: 0, time: 0 }, gameTimer: null, isPaused: false
};

const gemTypes = [
    { type: 'ruby', icon: '🔴', class: 'gem-ruby', value: 10 },
    { type: 'emerald', icon: '🟢', class: 'gem-emerald', value: 15 },
    { type: 'sapphire', icon: '🔵', class: 'gem-sapphire', value: 20 },
    { type: 'topaz', icon: '🟡', class: 'gem-topaz', value: 25 },
    { type: 'amethyst', icon: '🟣', class: 'gem-amethyst', value: 30 },
    { type: 'diamond', icon: '⚪', class: 'gem-diamond', value: 50 }
];

function initGemGame() {
    console.log('Initializing Gem Crusher...');
    gemState.score = 0; gemState.combo = 0; gemState.level = 1; gemState.selectedGems = [];
    gemState.stats = { gemsCrushed: 0, bestCombo: 0, time: 0 };
    createGemBoard(); updateGemDisplay(); startGemTimer();
    console.log('Gem Crusher initialized!');
}

function createGemBoard() {
    const board = document.getElementById('gem-board');
    if (!board) return;
    board.innerHTML = ''; gemState.board = [];
    for (let row = 0; row < 8; row++) {
        gemState.board[row] = [];
        for (let col = 0; col < 8; col++) {
            const gem = createRandomGem(row, col);
            gemState.board[row][col] = gem;
            board.appendChild(gem.element);
        }
    }
}

function createRandomGem(row, col) {
    const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
    const gemElement = document.createElement('div');
    gemElement.className = `gem ${gemType.class}`;
    gemElement.textContent = gemType.icon;
    gemElement.dataset.row = row; gemElement.dataset.col = col; gemElement.dataset.type = gemType.type;
    gemElement.onclick = () => selectGem(row, col);
    return { type: gemType.type, element: gemElement, row: row, col: col, value: gemType.value };
}

function selectGem(row, col) {
    if (gemState.isPaused) return;
    const gem = gemState.board[row][col];
    if (!gem) return;
    
    if (gemState.selectedGems.length === 0) {
        gemState.selectedGems = [gem];
        gem.element.classList.add('selected');
    } else {
        const lastGem = gemState.selectedGems[gemState.selectedGems.length - 1];
        if (isAdjacent(lastGem, gem) && gem.type === lastGem.type && !gemState.selectedGems.includes(gem)) {
            gemState.selectedGems.push(gem);
            gem.element.classList.add('selected');
            if (gemState.selectedGems.length >= 3) {
                setTimeout(() => executeGemChain(), 500);
            }
        } else {
            clearGemSelection();
        }
    }
}

function clearGemSelection() {
    gemState.selectedGems.forEach(gem => gem.element.classList.remove('selected'));
    gemState.selectedGems = [];
}

function executeGemChain() {
    if (gemState.selectedGems.length < 3) { clearGemSelection(); return; }
    
    const chainLength = gemState.selectedGems.length;
    const baseScore = gemState.selectedGems.reduce((sum, gem) => sum + gem.value, 0);
    const totalScore = (baseScore + (chainLength * 50)) * gemState.level;
    
    gemState.score += totalScore; gemState.combo++; gemState.stats.gemsCrushed += chainLength;
    if (gemState.combo > gemState.stats.bestCombo) gemState.stats.bestCombo = gemState.combo;
    
    createGemEffect(); removeMatchedGems();
    setTimeout(() => { applyGravity(); setTimeout(() => fillEmptySpaces(), 400); }, 600);
}

function createGemEffect() {
    gemState.selectedGems.forEach(gem => {
        gem.element.style.animation = 'gemExplode 0.8s ease-out forwards';
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `position: absolute; left: ${gem.col * 63 + 30}px; top: ${gem.row * 63 + 30}px; width: 4px; height: 4px; background: #ffd700; border-radius: 50%; animation: particleFloat 1s ease-out forwards; --dx: ${(Math.random()-0.5)*100}px; --dy: ${(Math.random()-0.5)*100}px;`;
            document.getElementById('gem-effects').appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    });
}

function removeMatchedGems() {
    gemState.selectedGems.forEach(gem => {
        gem.element.remove();
        gemState.board[gem.row][gem.col] = null;
    });
    clearGemSelection();
}

function applyGravity() {
    for (let col = 0; col < 8; col++) {
        let writeIndex = 7;
        for (let row = 7; row >= 0; row--) {
            if (gemState.board[row][col] !== null) {
                if (writeIndex !== row) {
                    gemState.board[writeIndex][col] = gemState.board[row][col];
                    gemState.board[writeIndex][col].row = writeIndex;
                    gemState.board[row][col] = null;
                }
                writeIndex--;
            }
        }
    }
}

function fillEmptySpaces() {
    for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
            if (gemState.board[row][col] === null) {
                const newGem = createRandomGem(row, col);
                gemState.board[row][col] = newGem;
                document.getElementById('gem-board').appendChild(newGem.element);
            }
        }
    }
    updateGemDisplay();
}

function isAdjacent(gem1, gem2) {
    const rowDiff = Math.abs(gem1.row - gem2.row);
    const colDiff = Math.abs(gem1.col - gem2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function updateGemDisplay() {
    const scoreEl = document.getElementById('gem-score');
    const comboEl = document.getElementById('combo-count');
    const levelEl = document.getElementById('gem-level');
    const comboFillEl = document.getElementById('combo-fill');
    const comboMultiplierEl = document.getElementById('combo-multiplier');
    const gemsCrushedEl = document.getElementById('gems-crushed');
    const bestComboEl = document.getElementById('best-combo');
    
    if (scoreEl) scoreEl.textContent = gemState.score.toLocaleString();
    if (comboEl) comboEl.textContent = gemState.combo;
    if (levelEl) levelEl.textContent = gemState.level;
    if (comboFillEl) comboFillEl.style.width = Math.min(gemState.combo * 10, 100) + '%';
    if (comboMultiplierEl) comboMultiplierEl.textContent = `x${Math.max(1, gemState.combo)}`;
    if (gemsCrushedEl) gemsCrushedEl.textContent = gemState.stats.gemsCrushed;
    if (bestComboEl) bestComboEl.textContent = gemState.stats.bestCombo;
}

function startGemTimer() {
    gemState.gameTimer = setInterval(() => {
        if (!gemState.isPaused) {
            gemState.stats.time++;
            const timeEl = document.getElementById('gem-time');
            if (timeEl) {
                const minutes = Math.floor(gemState.stats.time / 60);
                const seconds = gemState.stats.time % 60;
                timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);
}

function usePowerUp(type) {
    if (!gemState.powerUps[type].ready) return;
    if (type === 'bomb' && gemState.selectedGems.length > 0) {
        const centerGem = gemState.selectedGems[0];
        for (let row = Math.max(0, centerGem.row - 1); row <= Math.min(7, centerGem.row + 1); row++) {
            for (let col = Math.max(0, centerGem.col - 1); col <= Math.min(7, centerGem.col + 1); col++) {
                if (gemState.board[row][col]) {
                    gemState.board[row][col].element.remove();
                    gemState.board[row][col] = null;
                }
            }
        }
        gemState.powerUps.bomb.ready = false;
        setTimeout(() => gemState.powerUps.bomb.ready = true, 10000);
        setTimeout(() => { applyGravity(); setTimeout(() => fillEmptySpaces(), 400); }, 300);
    }
}

function resetGemGame() {
    if (gemState.gameTimer) clearInterval(gemState.gameTimer);
    clearGemSelection(); initGemGame();
}

function pauseGemGame() {
    gemState.isPaused = !gemState.isPaused;
}

function showGemHint() {
    alert('💡 Look for 3 or more adjacent gems of the same type to create chains!');
}

function showGemHelp() {
    alert(`💎 GEM CRUSHER GUIDE\n\n🎮 HOW TO PLAY:\n• Click adjacent gems of same type\n• Create chains of 3+ gems\n• Longer chains = higher scores\n• Use power-ups for big effects\n\n⚡ POWER-UPS:\n• 💣 Bomb: Destroys surrounding area\n• ⚡ Lightning: Chain effect\n• 🌈 Rainbow: Clears same type\n\n🏆 SCORING:\n• Basic gems: 10-50 points\n• Chain bonus: +50 per gem\n• Combo multiplier increases\n• Level multiplier applied`);
}

// ===== TOWER DEFENSE GAME =====
const towerState = {
    gold: 100, lives: 20, wave: 1, towers: [], enemies: [], projectiles: [],
    selectedTowerType: null, selectedTower: null, gameSpeed: 1, isPaused: false, waveInProgress: false,
    stats: { enemiesKilled: 0, damageDealt: 0, towersBuilt: 0 },
    enemyPath: [
        { x: 0, y: 200 }, { x: 150, y: 200 }, { x: 150, y: 100 }, { x: 300, y: 100 },
        { x: 300, y: 300 }, { x: 450, y: 300 }, { x: 450, y: 150 }, { x: 600, y: 150 }
    ]
};

const towerTypes = {
    basic: { cost: 20, damage: 25, range: 100, speed: 1000, icon: '🗼' },
    cannon: { cost: 50, damage: 75, range: 80, speed: 1500, icon: '💥' },
    ice: { cost: 40, damage: 15, range: 90, speed: 800, icon: '❄️', effect: 'slow' },
    lightning: { cost: 80, damage: 150, range: 120, speed: 2000, icon: '⚡', effect: 'chain' }
};

const enemyTypes = {
    basic: { health: 100, speed: 50, gold: 10, icon: '👹' },
    fast: { health: 75, speed: 100, gold: 15, icon: '💨' },
    tank: { health: 300, speed: 30, gold: 25, icon: '🛡️' },
    boss: { health: 1000, speed: 40, gold: 100, icon: '👑' }
};

function initTowerGame() {
    console.log('Initializing Tower Defense...');
    towerState.gold = 100; towerState.lives = 20; towerState.wave = 1;
    towerState.towers = []; towerState.enemies = []; towerState.projectiles = [];
    towerState.stats = { enemiesKilled: 0, damageDealt: 0, towersBuilt: 0 };
    setupBattlefield(); updateTowerDisplay();
    console.log('Tower Defense initialized!');
}

function setupBattlefield() {
    const battlefield = document.getElementById('battlefield');
    if (!battlefield) return;
    battlefield.onclick = (e) => { if (towerState.selectedTowerType) placeTower(e); };
}

function selectTower(type) {
    document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
    towerState.selectedTowerType = type;
    document.querySelector(`[data-tower="${type}"]`).classList.add('selected');
}

function placeTower(e) {
    if (!towerState.selectedTowerType) return;
    const towerType = towerTypes[towerState.selectedTowerType];
    if (towerState.gold < towerType.cost) { alert('Not enough gold!'); return; }
    
    const battlefield = document.getElementById('battlefield');
    const rect = battlefield.getBoundingClientRect();
    const x = e.clientX - rect.left - 20; const y = e.clientY - rect.top - 20;
    
    if (isValidTowerPosition(x, y)) {
        const tower = {
            id: Date.now(), type: towerState.selectedTowerType, x: x, y: y, level: 1,
            damage: towerType.damage, range: towerType.range, speed: towerType.speed,
            lastShot: 0, effect: towerType.effect
        };
        
        towerState.towers.push(tower); towerState.gold -= towerType.cost; towerState.stats.towersBuilt++;
        createTowerElement(tower); updateTowerDisplay();
        
        towerState.selectedTowerType = null;
        document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
    }
}

function isValidTowerPosition(x, y) {
    for (let path of towerState.enemyPath) {
        if (Math.abs(x - path.x) < 40 && Math.abs(y - path.y) < 40) return false;
    }
    for (let tower of towerState.towers) {
        if (Math.abs(x - tower.x) < 40 && Math.abs(y - tower.y) < 40) return false;
    }
    return true;
}

function createTowerElement(tower) {
    const towersLayer = document.getElementById('towers-layer');
    if (!towersLayer) return;
    
    const towerEl = document.createElement('div');
    towerEl.className = `tower tower-${tower.type}`;
    towerEl.style.left = tower.x + 'px'; towerEl.style.top = tower.y + 'px';
    towerEl.textContent = towerTypes[tower.type].icon;
    towerEl.onclick = () => selectTowerForUpgrade(tower);
    towerEl.id = `tower-${tower.id}`;
    towersLayer.appendChild(towerEl);
}

function selectTowerForUpgrade(tower) {
    towerState.selectedTower = tower;
    const upgradesDiv = document.getElementById('tower-upgrades');
    const infoDiv = document.getElementById('selected-tower-info');
    if (upgradesDiv && infoDiv) {
        upgradesDiv.style.display = 'block';
        infoDiv.innerHTML = `<h4>${tower.type} Tower (Level ${tower.level})</h4><div>Damage: ${tower.damage}</div><div>Range: ${tower.range}</div>`;
    }
}

function startWave() {
    if (towerState.waveInProgress) return;
    towerState.waveInProgress = true;
    const startBtn = document.getElementById('start-wave-btn');
    if (startBtn) startBtn.disabled = true;
    spawnEnemies(); startGameLoop();
}

function spawnEnemies() {
    const enemiesPerWave = 10 + (towerState.wave - 1) * 2;
    let enemiesSpawned = 0;
    
    const spawnInterval = setInterval(() => {
        if (enemiesSpawned >= enemiesPerWave) { clearInterval(spawnInterval); return; }
        
        let enemyType = 'basic';
        if (towerState.wave > 3 && Math.random() < 0.3) enemyType = 'fast';
        if (towerState.wave > 5 && Math.random() < 0.2) enemyType = 'tank';
        if (towerState.wave > 10 && Math.random() < 0.1) enemyType = 'boss';
        
        const enemy = createEnemy(enemyType);
        towerState.enemies.push(enemy); createEnemyElement(enemy);
        enemiesSpawned++;
    }, 1000);
}

function createEnemy(type) {
    const enemyData = enemyTypes[type];
    return {
        id: Date.now() + Math.random(), type: type, health: enemyData.health, maxHealth: enemyData.health,
        speed: enemyData.speed, gold: enemyData.gold, x: towerState.enemyPath[0].x, y: towerState.enemyPath[0].y,
        pathIndex: 0, slowEffect: 0
    };
}

function createEnemyElement(enemy) {
    const enemiesLayer = document.getElementById('enemies-layer');
    if (!enemiesLayer) return;
    
    const enemyEl = document.createElement('div');
    enemyEl.className = `enemy enemy-${enemy.type}`;
    enemyEl.style.left = enemy.x + 'px'; enemyEl.style.top = enemy.y + 'px';
    enemyEl.textContent = enemyTypes[enemy.type].icon;
    enemyEl.id = `enemy-${enemy.id}`;
    enemiesLayer.appendChild(enemyEl);
}

function startGameLoop() {
    const gameLoop = setInterval(() => {
        if (towerState.isPaused) return;
        updateEnemies(); updateTowers(); updateProjectiles(); updateTowerDisplay();
        
        if (towerState.enemies.length === 0 && towerState.waveInProgress) {
            towerState.waveInProgress = false; towerState.wave++; towerState.gold += 50;
            const startBtn = document.getElementById('start-wave-btn');
            if (startBtn) startBtn.disabled = false;
            
            if (towerState.wave > 20) {
                clearInterval(gameLoop);
                alert('🏆 Victory! You defended your realm!');
                resetTowerGame(); return;
            }
        }
        
        if (towerState.lives <= 0) {
            clearInterval(gameLoop);
            alert('💀 Game Over! Defenses fallen!');
            resetTowerGame(); return;
        }
    }, 50);
}

function updateEnemies() {
    towerState.enemies.forEach((enemy, index) => {
        moveEnemyAlongPath(enemy);
        if (enemy.pathIndex >= towerState.enemyPath.length - 1) {
            towerState.lives--; removeEnemy(index);
        }
        const enemyEl = document.getElementById(`enemy-${enemy.id}`);
        if (enemyEl) {
            enemyEl.style.left = enemy.x + 'px'; enemyEl.style.top = enemy.y + 'px';
        }
    });
}

function moveEnemyAlongPath(enemy) {
    if (enemy.pathIndex >= towerState.enemyPath.length - 1) return;
    
    const currentPoint = towerState.enemyPath[enemy.pathIndex];
    const nextPoint = towerState.enemyPath[enemy.pathIndex + 1];
    const dx = nextPoint.x - currentPoint.x; const dy = nextPoint.y - currentPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = enemy.speed * (enemy.slowEffect > 0 ? 0.5 : 1) * towerState.gameSpeed;
    const moveDistance = speed * 0.05;
    
    if (distance <= moveDistance) {
        enemy.pathIndex++; enemy.x = nextPoint.x; enemy.y = nextPoint.y;
    } else {
        enemy.x += (dx / distance) * moveDistance; enemy.y += (dy / distance) * moveDistance;
    }
    
    if (enemy.slowEffect > 0) enemy.slowEffect--;
}

function updateTowers() {
    const currentTime = Date.now();
    towerState.towers.forEach(tower => {
        if (currentTime - tower.lastShot >= tower.speed) {
            const target = findNearestEnemy(tower);
            if (target) { shootProjectile(tower, target); tower.lastShot = currentTime; }
        }
    });
}

function findNearestEnemy(tower) {
    let nearest = null; let minDistance = tower.range;
    towerState.enemies.forEach(enemy => {
        const distance = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
        if (distance <= minDistance) { nearest = enemy; minDistance = distance; }
    });
    return nearest;
}

function shootProjectile(tower, target) {
    const projectile = {
        id: Date.now() + Math.random(), x: tower.x + 20, y: tower.y + 20,
        targetX: target.x + 12, targetY: target.y + 12, damage: tower.damage,
        effect: tower.effect, speed: 300
    };
    towerState.projectiles.push(projectile); createProjectileElement(projectile);
}

function createProjectileElement(projectile) {
    const projectilesLayer = document.getElementById('projectiles-layer');
    if (!projectilesLayer) return;
    
    const projEl = document.createElement('div');
    projEl.className = 'tower-projectile';
    projEl.style.left = projectile.x + 'px'; projEl.style.top = projectile.y + 'px';
    projEl.id = `projectile-${projectile.id}`;
    projectilesLayer.appendChild(projEl);
}

function updateProjectiles() {
    towerState.projectiles.forEach((projectile, index) => {
        const dx = projectile.targetX - projectile.x; const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= 10) {
            dealDamage(projectile); removeProjectile(index);
        } else {
            projectile.x += (dx / distance) * projectile.speed * 0.05;
            projectile.y += (dy / distance) * projectile.speed * 0.05;
            const projEl = document.getElementById(`projectile-${projectile.id}`);
            if (projEl) { projEl.style.left = projectile.x + 'px'; projEl.style.top = projectile.y + 'px'; }
        }
    });
}

function dealDamage(projectile) {
    const enemy = towerState.enemies.find(e => {
        const distance = Math.sqrt(Math.pow(e.x - projectile.targetX, 2) + Math.pow(e.y - projectile.targetY, 2));
        return distance <= 25;
    });
    
    if (enemy) {
        enemy.health -= projectile.damage; towerState.stats.damageDealt += projectile.damage;
        if (projectile.effect === 'slow') enemy.slowEffect = 100;
        
        if (enemy.health <= 0) {
            const enemyIndex = towerState.enemies.indexOf(enemy);
            towerState.gold += enemy.gold; towerState.stats.enemiesKilled++;
            removeEnemy(enemyIndex);
        }
        createExplosion(projectile.targetX, projectile.targetY);
    }
}

function createExplosion(x, y) {
    const effectsLayer = document.getElementById('effects-layer');
    if (!effectsLayer) return;
    
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = (x - 20) + 'px'; explosion.style.top = (y - 20) + 'px';
    effectsLayer.appendChild(explosion);
    setTimeout(() => explosion.remove(), 500);
}

function removeEnemy(index) {
    const enemy = towerState.enemies[index];
    const enemyEl = document.getElementById(`enemy-${enemy.id}`);
    if (enemyEl) enemyEl.remove();
    towerState.enemies.splice(index, 1);
}

function removeProjectile(index) {
    const projectile = towerState.projectiles[index];
    const projEl = document.getElementById(`projectile-${projectile.id}`);
    if (projEl) projEl.remove();
    towerState.projectiles.splice(index, 1);
}

function updateTowerDisplay() {
    const goldEl = document.getElementById('tower-gold');
    const livesEl = document.getElementById('tower-lives');
    const waveEl = document.getElementById('tower-wave');
    const enemiesKilledEl = document.getElementById('enemies-killed');
    const damageDealtEl = document.getElementById('damage-dealt');
    const towersBuiltEl = document.getElementById('towers-built');
    const enemiesRemainingEl = document.getElementById('enemies-remaining');
    
    if (goldEl) goldEl.textContent = towerState.gold;
    if (livesEl) livesEl.textContent = towerState.lives;
    if (waveEl) waveEl.textContent = towerState.wave;
    if (enemiesKilledEl) enemiesKilledEl.textContent = towerState.stats.enemiesKilled;
    if (damageDealtEl) damageDealtEl.textContent = towerState.stats.damageDealt;
    if (towersBuiltEl) towersBuiltEl.textContent = towerState.stats.towersBuilt;
    if (enemiesRemainingEl) enemiesRemainingEl.textContent = towerState.enemies.length;
}

function upgradeTower(upgradeType) {
    if (!towerState.selectedTower) return;
    const costs = { damage: 50, range: 30, speed: 40 };
    const cost = costs[upgradeType];
    if (towerState.gold < cost) { alert('Not enough gold!'); return; }
    
    towerState.gold -= cost;
    const tower = towerState.selectedTower;
    switch (upgradeType) {
        case 'damage': tower.damage += 15; break;
        case 'range': tower.range += 20; break;
        case 'speed': tower.speed = Math.max(200, tower.speed - 200); break;
    }
    tower.level++; selectTowerForUpgrade(tower); updateTowerDisplay();
}

function sellTower() {
    if (!towerState.selectedTower) return;
    const tower = towerState.selectedTower;
    const sellPrice = Math.floor(towerTypes[tower.type].cost * 0.7);
    towerState.gold += sellPrice;
    
    const towerEl = document.getElementById(`tower-${tower.id}`);
    if (towerEl) towerEl.remove();
    const index = towerState.towers.indexOf(tower);
    if (index > -1) towerState.towers.splice(index, 1);
    
    const upgradesDiv = document.getElementById('tower-upgrades');
    if (upgradesDiv) upgradesDiv.style.display = 'none';
    towerState.selectedTower = null; updateTowerDisplay();
}

function pauseTowerGame() {
    towerState.isPaused = !towerState.isPaused;
    const pauseBtn = document.getElementById('pause-tower-btn');
    if (pauseBtn) pauseBtn.textContent = towerState.isPaused ? '▶️ Resume' : '⏸️ Pause';
}

function speedUpGame() {
    const speeds = [1, 1.5, 2, 0.5];
    const currentIndex = speeds.indexOf(towerState.gameSpeed);
    towerState.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) speedBtn.textContent = `⏩ Speed: ${towerState.gameSpeed}x`;
}

function resetTowerGame() {
    document.getElementById('towers-layer').innerHTML = '';
    document.getElementById('enemies-layer').innerHTML = '';
    document.getElementById('projectiles-layer').innerHTML = '';
    document.getElementById('effects-layer').innerHTML = '';
    const upgradesDiv = document.getElementById('tower-upgrades');
    if (upgradesDiv) upgradesDiv.style.display = 'none';
    initTowerGame();
}

function showTowerHelp() {
    alert(`🏰 TOWER DEFENSE GUIDE\n\n🎮 HOW TO PLAY:\n• Select tower type and click to place\n• Start waves to spawn enemies\n• Towers automatically target enemies\n• Defend your base!\n\n🗼 TOWER TYPES:\n• Basic: Balanced stats\n• Cannon: High damage\n• Ice: Slows enemies\n• Lightning: Chain damage\n\n⬆️ UPGRADES:\n• Click towers to upgrade\n• Improve damage, range, or speed\n• Sell towers for partial refund\n\n🎯 STRATEGY:\n• Block enemy paths strategically\n• Mix tower types for synergy\n• Upgrade key defensive positions!`);
}

// Enhanced slingshot initialization
setTimeout(() => {
    if (gameState.currentScreen === 'slingshot-game') {
        enhanceSlingshotGame();
    }
}, 1000);

// ===== VISUAL ENHANCEMENT SYSTEM =====

// Initialize enhanced visual effects when page loads
document.addEventListener('DOMContentLoaded', function() {
    initVisualEnhancements();
    createDynamicBackground();
    setupAdvancedAnimations();
});

function initVisualEnhancements() {
    // Enhanced card hover effects
    setupCardHoverEffects();
    
    // Dynamic button animations
    setupButtonAnimations();
    
    // Screen transition effects
    setupScreenTransitions();
    
    // Add floating particles to main menu
    addFloatingParticles();
}

function createDynamicBackground() {
    // Create aurora effect
    const aurora = document.createElement('div');
    aurora.className = 'aurora-effect';
    aurora.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, 
            rgba(255, 107, 107, 0.05) 0%,
            rgba(78, 205, 196, 0.05) 25%,
            rgba(69, 183, 209, 0.05) 50%,
            rgba(150, 206, 180, 0.05) 75%,
            rgba(255, 234, 167, 0.05) 100%);
        background-size: 400% 400%;
        animation: auroraMove 25s ease infinite;
        pointer-events: none;
        z-index: -2;
    `;
    document.body.appendChild(aurora);
    
    // Add CSS for aurora animation
    if (!document.querySelector('#aurora-style')) {
        const style = document.createElement('style');
        style.id = 'aurora-style';
        style.textContent = `
            @keyframes auroraMove {
                0% { background-position: 0% 50%; }
                25% { background-position: 100% 50%; }
                50% { background-position: 50% 100%; }
                75% { background-position: 0% 100%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupCardHoverEffects() {
    // Enhanced game card interactions
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            createCardSparkles(this);
        });
    });
}

function createCardSparkles(card) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #fff 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10;
                animation: sparkleFloat 1.5s ease-out forwards;
            `;
            
            const rect = card.getBoundingClientRect();
            sparkle.style.left = Math.random() * rect.width + 'px';
            sparkle.style.top = Math.random() * rect.height + 'px';
            
            card.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1500);
        }, i * 200);
    }
    
    // Add sparkle animation
    if (!document.querySelector('#sparkle-style')) {
        const style = document.createElement('style');
        style.id = 'sparkle-style';
        style.textContent = `
            @keyframes sparkleFloat {
                0% { 
                    opacity: 0; 
                    transform: translateY(0px) scale(0); 
                }
                50% { 
                    opacity: 1; 
                    transform: translateY(-15px) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translateY(-30px) scale(0); 
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupButtonAnimations() {
    // Enhanced button effects
    const buttons = document.querySelectorAll('button, .play-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            createButtonRipple(this);
        });
    });
}

function createButtonRipple(button) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.marginLeft = -size/2 + 'px';
    ripple.style.marginTop = -size/2 + 'px';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    // Add ripple animation
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupScreenTransitions() {
    // Enhanced screen transition effects with smooth animations
    const originalStartGame = window.startGame;
    window.startGame = function(gameType) {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            currentScreen.style.transition = 'all 0.5s ease-in';
            currentScreen.style.transform = 'scale(0.95)';
            currentScreen.style.opacity = '0';
            
            setTimeout(() => {
                originalStartGame(gameType);
                const newScreen = document.querySelector('.screen.active');
                if (newScreen) {
                    newScreen.style.transition = 'all 0.8s ease-out';
                    newScreen.style.transform = 'scale(1)';
                    newScreen.style.opacity = '1';
                }
            }, 500);
        } else {
            originalStartGame(gameType);
        }
    };
}

function addFloatingParticles() {
    // Create additional floating elements for enhanced atmosphere
    setInterval(() => {
        if (gameState.currentScreen === 'main-menu') {
            createFloatingElement();
        }
    }, 3000);
}

function createFloatingElement() {
    const element = document.createElement('div');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    element.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, ${randomColor} 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: floatUp 8s linear forwards;
    `;
    
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 8000);
    
    // Add float animation
    if (!document.querySelector('#float-style')) {
        const style = document.createElement('style');
        style.id = 'float-style';
        style.textContent = `
            @keyframes floatUp {
                0% { 
                    transform: translateY(0px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% { 
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupAdvancedAnimations() {
    // Add subtle animations to enhance user experience
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    });
    
    // Observe game elements for entrance animations
    const gameElements = document.querySelectorAll('.game-card, .battle-card, .gem, .bank-item');
    gameElements.forEach(el => observer.observe(el));
    
    // Add fade in animation
    if (!document.querySelector('#fadein-style')) {
        const style = document.createElement('style');
        style.id = 'fadein-style';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}