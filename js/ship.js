function Ship() {
    let heading = 0;
    let speed = [0, 0];
    let velocityListeners = [];
    let bullets = [];
    
const WING_SHIFT = Math.PI * 3 / 4;

    
    this.health = 100;

    this.takeDamage = function(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    };

    this.renderHealth = function(context) {
        context.fillStyle = "green";
        context.fillRect(10, 10, this.health * 2, 20); // Health bar
        context.strokeStyle = "white";
        context.strokeRect(10, 10, 200, 20); // Health bar border
    };

    this.render = function(context) {
        // Render ship health
        this.renderHealth(context);
    
        // Render shield
        this.renderShield(context);
    
        const speedShift = magnify_vector(speed, 0.05);
    
        // Transform function to calculate positions
        let transform = (function(angle, len) {
            return vector_sum(magnify_vector(angle_to_vector(angle), len),
                              this.screenCenter,
                              speedShift);
        }).bind(this);
    
        // Define ship points
        const tip = transform(heading, 40);
        const leftWing = transform(heading + WING_SHIFT, 20);
        const rightWing = transform(heading - WING_SHIFT, 20);
    
        // Create a gradient for the ship
        let gradient = context.createLinearGradient(tip[0], tip[1], leftWing[0], leftWing[1]);
        gradient.addColorStop(0, "#00ffcc");  // Bright teal
        gradient.addColorStop(1, "#004d99"); // Dark blue
    
        // Draw the ship
        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(tip[0], tip[1]);
        context.lineTo(leftWing[0], leftWing[1]);
        context.lineTo(rightWing[0], rightWing[1]);
        context.fill();
    
        // Render bullets
        bullets.forEach(function(bullet) {
            bullet.render(context);
        });
    };
    

    // Render thrusters
    // this.renderThrusters = function(context) {
    //     const flameLength = Math.random() * 20 + 10; // Flickering effect
    //     const flameColor = `rgba(255, ${Math.random() * 100 + 155}, 0, 0.8)`; // Orange with transparency

    //     const thrusterPosition = vector_sum(this.screenCenter, magnify_vector(angle_to_vector(heading + Math.PI), 15));

    //     context.fillStyle = flameColor;
    //     context.beginPath();
    //     context.moveTo(thrusterPosition[0], thrusterPosition[1]);
    //     context.lineTo(thrusterPosition[0] - 5, thrusterPosition[1] + flameLength);
    //     context.lineTo(thrusterPosition[0] + 5, thrusterPosition[1] + flameLength);
    //     context.closePath();
    //     context.fill();
    // };

    // Render shield
    this.renderShield = function(context) {
        const shieldRadius = 90;
        context.strokeStyle = "rgba(0, 255, 255, 0.1)"; // Cyan glow
        context.lineWidth = 2;

        context.beginPath();
        context.arc(this.screenCenter[0], this.screenCenter[1], shieldRadius, 0, Math.PI * 2);
        context.stroke();
    };

    // Update ship and bullets
    this.update = function(deltaTime) {
        // Update bullets
        bullets.forEach(function(bullet, index) {
            bullet.update(deltaTime);

            // Remove bullets that go off-screen
            if (bullet.position[0] < 0 || bullet.position[0] > this.width ||
                bullet.position[1] < 0 || bullet.position[1] > this.height) {
                bullets.splice(index, 1);
            }
        });
    };

    // Initialize ship
    this.init = function(width, height) {
        this.width = width;
        this.height = height;
        this.screenCenter = [this.width / 2, this.height / 2];
    };

    // Fire a bullet
    this.fireBullet = function() {
        const bulletVelocity = magnify_vector(angle_to_vector(heading), 500);
        const bulletPosition = [...this.screenCenter]; // Start from the ship's center
        bullets.push(new Bullet(bulletPosition, bulletVelocity));
    };

    // Handle mouse movement to adjust ship heading and speed
    this.onMouseMove = function(position) {
        let direction = [position[0] - this.width / 2, position[1] - this.height / 2];
        heading = vector_angle(direction);
        speed = [direction[0], direction[1]];

        velocityListeners.forEach(function(listener) {
            listener.onVelocityUpdated(speed);
        });
    };

    // Bind velocity listeners
    this.bindToVelocity = function(listener) {
        velocityListeners.push(listener);
    };
}

// Bullet class
function Bullet(position, velocity) {
    this.position = position;
    this.velocity = velocity;

    this.update = function(deltaTime) {
        this.position[0] += this.velocity[0] * deltaTime / 1000;
        this.position[1] += this.velocity[1] * deltaTime / 1000;
    };

    this.render = function(context) {
        context.fillStyle = "#ff0000";
        context.beginPath();
        context.arc(this.position[0], this.position[1], 5, 0, Math.PI * 2);
        context.fill();
    };

    this.init = function() {}; // No initialization needed for bullets
}
