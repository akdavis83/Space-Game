class Enemy {
    constructor(x, y, size = 20, speed = 0.5) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.direction = 0; // Angle in degrees
    }

    // Move the enemy toward a target (e.g., player)
    moveTowards(targetX, targetY, deltaTime) {
        this.direction = Math.atan2(targetY - this.y, targetX - this.x) * (180 / Math.PI);
        const radians = this.direction * (Math.PI / 180);
        this.x += this.speed * Math.cos(radians) * deltaTime;
        this.y += this.speed * Math.sin(radians) * deltaTime;
    }

    // Check collision with another entity
    checkCollision(other) {
        const distance = Math.hypot(this.x - other.x, this.y - other.y);
        return distance <= (this.size / 2) + (other.size / 2);
    }

    // Render the enemy (abstracted for any rendering engine)
    render(drawFn) {
        drawFn(this.x, this.y, this.size, this.direction);
    }
}

// Enemy manager to handle spawning, rendering, and updating
class EnemyManager {
    constructor(spawnCooldown = 500) {
        this.enemies = new Set();
        this.lastSpawnTime = 0;
        this.spawnCooldown = spawnCooldown;
    }

    // Spawn an enemy at a random edge of the screen
    spawn(screenWidth, screenHeight) {
        let x, y;
        const side = Math.floor(Math.random() * 4); // 0: North, 1: East, 2: South, 3: West
        if (side === 0) {
            x = Math.random() * screenWidth;
            y = 0; // North
        } else if (side === 1) {
            x = screenWidth; // East
            y = Math.random() * screenHeight;
        } else if (side === 2) {
            x = Math.random() * screenWidth;
            y = screenHeight; // South
        } else {
            x = 0; // West
            y = Math.random() * screenHeight;
        }

        const enemy = new Enemy(x, y);
        this.enemies.add(enemy);
    }

    // Update all enemies
    update(targetX, targetY, deltaTime, screenWidth, screenHeight) {
        this.enemies.forEach((enemy) => {
            enemy.moveTowards(targetX, targetY, deltaTime);

            // Remove enemy if it goes off-screen
            if (enemy.x < 0 || enemy.y < 0 || enemy.x > screenWidth || enemy.y > screenHeight) {
                this.enemies.delete(enemy);
            }
        });
    }

    // Check collisions with effects
    checkCollisions(effects, onCollision) {
        this.enemies.forEach((enemy) => {
            effects.forEach((effect) => {
                if (enemy.checkCollision(effect)) {
                    this.enemies.delete(enemy);
                    effects.delete(effect);
                    if (onCollision) onCollision(enemy, effect);
                }
            });
        });
    }

    // Render all enemies
    render(drawFn) {
        this.enemies.forEach((enemy) => enemy.render(drawFn));
    }
}

// Export the Enemy and EnemyManager classes
export { Enemy, EnemyManager };
