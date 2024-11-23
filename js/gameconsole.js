function GameConsole(documentId) {
    const deltaTime = 33;

    let canvas = document.getElementById(documentId);
    if (!canvas) {
        throw new Error(`Canvas element with ID '${documentId}' not found.`);
    }
    let context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let entities = [];
    let mouseMoveListeners = [];

    canvas.addEventListener("mousemove", function(evt) {
        let rect = canvas.getBoundingClientRect();
        let position = [evt.clientX - rect.left, evt.clientY - rect.top];
        mouseMoveListeners.forEach(function(listener) {
            listener.onMouseMove(position);
        });
    });

    window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        clearView();
    });

    function clearView() {
        context.fillStyle = "#151515";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        entities.forEach(function(entity) {
            entity.update(deltaTime);
        });
    }

    function render() {
        clearView();
        entities.forEach(function(entity) {
            entity.render(context);
        });
    }

    function eventLoop() {
        update();
        render();
        requestAnimationFrame(eventLoop); // Use requestAnimationFrame
    }

    this.start = function() {
        requestAnimationFrame(eventLoop); // Start the loop with requestAnimationFrame
    };

    this.addEntity = function(entity) {
        if (entity.init) {
            entity.init(canvas.width, canvas.height);
        }
        entities.push(entity);
    };

    this.addMouseMoveListener = function(listener) {
        mouseMoveListeners.push(listener);
    };

    this.getEntities = function() {
        return entities; // Expose entities safely
    };
    
}
