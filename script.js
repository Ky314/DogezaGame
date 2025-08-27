document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const container = document.getElementById('game-container');
    const message = document.getElementById('message');

    // 🔊 ジャンプ音の準備
    const jumpSound = new Audio('jump_sound.mp3'); 
    jumpSound.preload = 'auto'; // ファイルを事前に読み込んでおく

    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let obstacleSpeed = 5;
    let jumpHeight = 180;
    let jumpSpeed = 10;

    let playerPositionX = 50;
    const playerSpeedX = 5;
    let keysPressed = {};
    let animationFrameId;

    const HITBOX_WIDTH = 50;
    const HITBOX_HEIGHT = 70;

    document.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true;
        
        if (e.code === 'Space' && !isJumping && !isGameOver) {
            jump();
        }
        if (isGameOver && e.code === 'Space') {
            resetGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false;
    });

    function jump() {
        isJumping = true;
        player.classList.add('dogeza');
        
        // 🔊 ジャンプ音の再生
        jumpSound.currentTime = 0; // 複数回ジャンプしても最初から再生されるようにする
        jumpSound.play();

        let position = 0;
        
        let jumpInterval = setInterval(() => {
            if (position >= jumpHeight) {
                clearInterval(jumpInterval);
                let downInterval = setInterval(() => {
                    if (position <= 0) {
                        clearInterval(downInterval);
                        isJumping = false;
                        player.classList.remove('dogeza');
                    }
                    position -= jumpSpeed;
                    player.style.bottom = position + 'px';
                }, 20);
            }
            position += jumpSpeed;
            player.style.bottom = position + 'px';
        }, 20);
    }

    function createObstacle() {
        if (isGameOver) return;

        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        
        const obstacleHeight = 40 + Math.random() * 80;
        obstacle.style.height = obstacleHeight + 'px';
        obstacle.style.left = container.offsetWidth + 'px';
        container.appendChild(obstacle);

        let obstaclePosition = container.offsetWidth;
        let obstacleInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(obstacleInterval);
                return;
            }

            obstaclePosition -= obstacleSpeed;
            obstacle.style.left = obstaclePosition + 'px';

            const playerHitboxRect = {
                left: player.offsetLeft + (player.offsetWidth - HITBOX_WIDTH) / 2,
                right: player.offsetLeft + (player.offsetWidth + HITBOX_WIDTH) / 2,
                top: player.offsetTop + (player.offsetHeight - HITBOX_HEIGHT),
                bottom: player.offsetTop + player.offsetHeight
            };
            const obstacleRect = obstacle.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            if (
                playerHitboxRect.right > (obstacleRect.left - containerRect.left) &&
                playerHitboxRect.left < (obstacleRect.right - containerRect.left) &&
                playerHitboxRect.bottom > (obstacleRect.top - containerRect.top)
            ) {
                endGame();
            }

            if (obstaclePosition < -40) {
                container.removeChild(obstacle);
                clearInterval(obstacleInterval);
                score++;
                message.textContent = `スコア: ${score}`;
            }
        }, 20);
    }
    
    function gameLoop() {
        if (!isGameOver) {
            if (keysPressed['KeyA'] || keysPressed['KeyW']) {
                playerPositionX -= playerSpeedX;
            }
            if (keysPressed['KeyD'] || keysPressed['KeyS']) {
                playerPositionX += playerSpeedX;
            }

            const playerWidth = isJumping ? 100 : 80;
            const containerWidth = container.offsetWidth;
            if (playerPositionX < 0) {
                playerPositionX = 0;
            }
            if (playerPositionX > containerWidth - playerWidth) {
                playerPositionX = containerWidth - playerWidth;
            }

            player.style.left = playerPositionX + 'px';
        }

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        isGameOver = true;
        message.textContent = `ゲームオーバー！スコア: ${score}。再挑戦するにはスペースキーを押してください。`;
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obs => obs.remove());
        player.classList.remove('dogeza');
        cancelAnimationFrame(animationFrameId);
    }

    function resetGame() {
        isGameOver = false;
        score = 0;
        message.textContent = `スコア: ${score}`;
        startGame();
    }

    function startGame() {
        function generateObstacles() {
            if (isGameOver) return;
            createObstacle();
            const minInterval = 1500;
            const maxInterval = 2500;
            const nextInterval = Math.random() * (maxInterval - minInterval) + minInterval;
            setTimeout(generateObstacles, nextInterval);
        }
        generateObstacles();
        requestAnimationFrame(gameLoop);
    }

    message.textContent = 'ゲームを始めるにはスペースキーを押してください';
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isGameOver) {
            startGame();
            message.textContent = `スコア: ${score}`;
        }
    }, { once: true });
});