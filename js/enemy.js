class EnemyShip {
    constructor(target, enemyType = "default") {
        this.position = [0, 0];
        this.speed = 50; // Default speed
        this.target = target; // Reference to the player
        this.health = 100; // Default health
        this.radius = 15; // Default size
        this.enemyType = this.getEnemyType(enemyType); // Get enemy type attributes
        this.color = this.enemyType.color; // Assign color
        this.angle = Math.random() * Math.PI * 2; // Random initial direction
    }

    // Initialize enemy position off-screen
    init(width, height) {
        const direction = normalize_vector([Math.random() - 0.5, Math.random() - 0.5]);
        snap_with_direction(this.position, direction, width, height);
        this.width = width;
        this.height = height;
    }

    // Get attributes based on enemy type
    getEnemyType(type) {
        const enemyTypes = {
            "Red Goblin": { color: "red", health: 50, speed: 80, behavior: "zigzag" },
            "Blue Orc": { color: "blue", health: 100, speed: 60, behavior: "rush" },
            "Green Troll": { color: "green", health: 150, speed: 40, behavior: "wave" },
            default: { color: "gray", health: 100, speed: 50, behavior: "basic" },
        };
        return enemyTypes[type] || enemyTypes.default;
    }

    update(deltaTime) {
        // Behavior-specific movement logic
        switch (this.enemyType.behavior) {
            case "zigzag":
                this.angle += Math.sin(frameCount * 0.05) * 0.01; // Zigzag pattern
                break;
            case "rush":
                this.speed += 0.001 * deltaTime; // Gradually increase speed
                break;
            case "wave":
                this.position[1] += Math.sin(frameCount * 0.05) * 2; // Wave motion
                break;
            default:
                // Basic movement towards the player
                const targetPosition = this.target.screenCenter;
                const direction = normalize_vector([
                    targetPosition[0] - this.position[0],
                    targetPosition[1] - this.position[1],
                ]);
                const velocity = magnify_vector(direction, this.speed * deltaTime / 1000);
                this.position = vector_sum(this.position, velocity);
                break;
        }

        // Collision detection with bullets
        const collidedBullet = this.checkCollisionWith("bullet");
        if (collidedBullet) {
            this.health -= collidedBullet.damage;
            collidedBullet.remove(); // Remove the bullet
            if (this.health <= 0) {
                this.destroy(); // Handle destruction
            }
        }
    }

    render(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position[0], this.position[1], this.radius, 0, Math.PI * 2);
        context.fill();

        // Draw health bar
        context.fillStyle = "green";
        context.fillRect(this.position[0] - this.radius, this.position[1] - this.radius - 10, (this.health / 100) * this.radius * 2, 5);
    }

    checkCollisionWith(type) {
        // Check for collisions with specific object types (e.g., bullets)
        const entities = this.scene.getEntitiesByType(type);
        for (let entity of entities) {
            const distance = Math.hypot(
                this.position[0] - entity.position[0],
                this.position[1] - entity.position[1]
            );
            if (distance < this.radius + entity.radius) {
                return entity; // Return the collided entity
            }
        }
        return null;
    }

    destroy() {
        // Remove the enemy and trigger effects
        this.scene.addExplosion(this.position); // Optional: Explosion effect
        this.scene.incrementScore(this.enemyType.health / 10); // Award points
        this.remove(); // Remove the enemy
    }

    increaseDifficulty(score) {
        this.speed = 50 + score / 100; // Gradually increase speed
    }
}
