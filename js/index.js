(function() {
    let gameConsole = new GameConsole("space");
    let stars = new StarsEffect(500);
    let ship = new Ship();

    ship.bindToVelocity(stars);

    gameConsole.addEntity(stars);
    gameConsole.addEntity(ship);

    // Handle enemy spawning
    let enemies = [];
    setInterval(function() {
        const enemy = new EnemyShip(ship);
        gameConsole.addEntity(enemy);
        enemies.push(enemy);
    }, 2000); // Adjust spawn rate for dynamic difficulty

    // Difficulty Adjustment
    let score = 0;
    setInterval(function() {
        score += 10; // Simulate score increase
        enemies.forEach(enemy => enemy.increaseDifficulty(score));
    }, 1000);

    gameConsole.addMouseMoveListener(ship);

    document.addEventListener("keydown", function(event) {
        if (event.code === 'Space') {
            ship.fireBullet();
        }
    });

    gameConsole.start();
})();

// Enemy Ship Class
function EnemyShip(target) {
    let position = [0, 0];
    let speed = 50; // Initial speed
    let targetPosition = target.screenCenter;

    // Initialize enemy position off-screen
    this.init = function(width, height) {
        const direction = normalize_vector([Math.random() - 0.5, Math.random() - 0.5]);
        snap_with_direction(position, direction, width, height);
        this.width = width;
        this.height = height;
    };

    this.update = function(deltaTime) {
        // Move towards the player
        let direction = normalize_vector([
            targetPosition[0] - position[0],
            targetPosition[1] - position[1]
        ]);
        let velocity = magnify_vector(direction, speed * deltaTime / 1000);
        position = vector_sum(position, velocity);
    };

    this.render = function(context) {
        context.fillStyle = "#0f00ff";
        context.beginPath();
        context.arc(position[0], position[1], 15, 0, Math.PI * 2); // Render as a red circle
        context.fill();
    };
    

    this.increaseDifficulty = function(score) {
        speed = 50 + score / 100; // Gradually increase speed based on score
    };
    
}
