// To Do:
// Further Customization
// 1.Advanced AI:
// Add patrol behavior or random movement before chasing the player.

// 2.Dynamic Difficulty:
// Gradually increase enemy speed and spawn frequency based on the score.

// 3.Effects:
// Allow effects to have unique properties (e.g., size, damage) and handle them accordingly.


(function() {
    let gameConsole = new GameConsole("space");
    let stars = new StarsEffect(500);
    let ship = new Ship();

    ship.bindToVelocity(stars);

    gameConsole.addEntity(stars);
    gameConsole.addEntity(ship);

    gameConsole.addMouseMoveListener(ship);

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            ship.fireBullet();
        }
    });
    

    gameConsole.start();
})();
