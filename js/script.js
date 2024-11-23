// game engine

const runtime = {
	running: false,
	paper: new Palette('#canvas', { alpha: false }),
	times: [],
	score: 0,
	controls: new Set(),
	player: null,
	enemies: new Set(),
	effects: new Set()
};

window.addEventListener('keydown', function (event) {
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	//console.log('keydown', event.key);
	if (!runtime.running && (event.key === 'f' || event.key === 'F')) {
		runtime_reset();
		runtime_start();
	} else {
		runtime.controls.add(event.key);
	}
});
window.addEventListener('keyup', function (event) {
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	//console.log('keyup', event.key);
	runtime.controls.delete(event.key);
});

var runtime_reset = function () {
	const is_running = runtime.running;
	if (is_running) {
		runtime_stop();
	}
	runtime.score = 0;
	runtime.controls.clear();
	runtime.player = {
		x: runtime.paper.width / 2,
		y: runtime.paper.height / 2,
		d: -90,
		size: 20,
		speed: 2
	};
	runtime.enemies.clear();
	runtime.effects.clear();
	if (is_running) {
		runtime_start();
	}
};

var runtime_start = function () {
	runtime.running = true;
	runtime.game_loop = setInterval(runtime_tick, 10);
	runtime.frame_request = requestAnimationFrame(runtime_render);
};

var runtime_stop = function () {
	runtime.running = false;
	clearInterval(runtime.game_loop);
	delete runtime.game_loop;
	cancelAnimationFrame(runtime.frame_request);
	delete runtime.frame_request;
	runtime.times = [];
};

var runtime_tick = function () {
	if (!runtime.running) {
		return;
	}
	const timestamp = performance.now();
	// player
	const player = runtime.player;
	const controls = runtime.controls;
	// drive-controls
	if (controls.has('ArrowUp')) {
		// forward
		player.x = player.x + player.speed * Math.cos(player.d * Math.PI / 180);
		player.y = player.y + player.speed * Math.sin(player.d * Math.PI / 180);
	} else if (controls.has('ArrowDown')) {
		// backward
		player.x = player.x - player.speed * Math.cos(player.d * Math.PI / 180);
		player.y = player.y - player.speed * Math.sin(player.d * Math.PI / 180);
	}
	if (controls.has('ArrowLeft')) {
		// turn left
		player.d -= player.speed;
	} else if (controls.has('ArrowRight')) {
		// turn right
		player.d += player.speed;
	}
	// direction-controls
	/*
	const pressing_w = controls.has('w') || controls.has('W');
	const pressing_a = controls.has('a') || controls.has('A');
	const pressing_s = controls.has('s') || controls.has('S');
	const pressing_d = controls.has('d') || controls.has('D');
	if (pressing_w && pressing_d) {
		// ne
		player.x += player.speed;
		player.y -= player.speed;
		player.d = -45;
	} else if (pressing_w && pressing_a) {
		// nw
		player.x -= player.speed;
		player.y -= player.speed;
		player.d = -135;
	} else if (pressing_s && pressing_d) {
		// se
		player.x += player.speed;
		player.y += player.speed;
		player.d = 45;
	} else if (pressing_s && pressing_a) {
		// sw
		player.x -= player.speed;
		player.y += player.speed;
		player.d = 135;
	} else if (pressing_w) {
		// n
		player.y -= player.speed;
		player.d = -90;
	} else if (pressing_a) {
		// w
		player.x -= player.speed;
		player.d = 180;
	} else if (pressing_s) {
		// s
		player.y += player.speed;
		player.d = 90;
	} else if (pressing_d) {
		// e
		player.x += player.speed;
		player.d = 0;
	}
	*/
	// boundaries check
	const gap = player.size / 2;
	if (player.x < gap) {
		player.x = gap;
	}
	if (player.y < gap) {
		player.y = gap;
	}
	if (player.x > runtime.paper.width - gap) {
		player.x = runtime.paper.width - gap;
	}
	if (player.y > runtime.paper.height - gap) {
		player.y = runtime.paper.height - gap;
	}
	// player collision detection
	runtime.enemies.forEach(function (enemy) {
		const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if (distance - (player.size / 2) - (enemy.size / 2.5) <= 0) {
			runtime_stop();
			runtime.paper.text({
				text: 'GAME OVER',
				x: runtime.paper.width / 2,
				y: runtime.paper.height / 2,
				font: '60px Consolas, monospace',
				align: 'center',
				baseline: 'middle',
				fill: 'crimson'
			});
			runtime.paper.text({
				text: `SCORE: ${runtime.score}`,
				x: runtime.paper.width / 2,
				y: runtime.paper.height / 2 + 30 + 10,
				font: '14px Consolas, monospace',
				align: 'center',
				baseline: 'top',
				fill: 'crimson'
			});
			runtime.paper.text({
				text: 'Press F to retry',
				x: runtime.paper.width / 2,
				y: runtime.paper.height / 2 + 30 + 10 + 14 + 10,
				font: '14px Consolas, monospace',
				align: 'center',
				baseline: 'top',
				fill: 'crimson'
			});
		}
	});
	// skills
	if (controls.has(' ')) {
		const skill_1_cooldown = 50; // skill 1 cooldown in ms
		if (!player.skill_1_last || timestamp > player.skill_1_last + skill_1_cooldown) {
			player.skill_1_last = timestamp;
			runtime.effects.add({
				type: 'skill_1',
				x: player.x,
				y: player.y,
				d: player.d,
				size: 4,
				speed: 5
			});
		}
	}
	// effects AI
	runtime.effects.forEach(function (effect) {
		if (effect.type === 'skill_1') {
			effect.x = effect.x + effect.speed * Math.cos(effect.d * Math.PI / 180);
			effect.y = effect.y + effect.speed * Math.sin(effect.d * Math.PI / 180);
			if (effect.x < 0 || effect.y < 0 || effect.x > runtime.paper.width || effect.y > runtime.paper.height) {
				runtime.effects.delete(effect);
			}
		}
	});
	// enemies
	// enemies spawn
	const enemy_spawn_cooldown = 500;
	if (!runtime.enemy_spawn_last || timestamp > runtime.enemy_spawn_last + enemy_spawn_cooldown) {
		runtime.enemy_spawn_last = timestamp;
		let x, y;
		const side = Math.floor(Math.random() * 4);
		if (side === 0) {
			// north
			x = Math.floor(Math.random() * runtime.paper.width);
			y = 0;
		} else if (side === 1) {
			// east
			x = runtime.paper.width;
			y = Math.floor(Math.random() * runtime.paper.height);
		} else if (side === 2) {
			// south
			x = Math.floor(Math.random() * runtime.paper.width);
			y = runtime.paper.height;
		} else if (side === 3) {
			// west
			x = 0;
			y = Math.floor(Math.random() * runtime.paper.height);
		}
		runtime.enemies.add({
			x: x,
			y: y,
			d: 0,
			speed: 0.5,
			size: 20
		});
	}
	// enemies collision detection
	runtime.enemies.forEach(function (enemy) {
		runtime.effects.forEach(function (effect) {
			if ((effect.type === 'skill_1')) {
				//const distance = Math.sqrt(Math.pow(effect.x - enemy.x, 2) + Math.pow(effect.y - enemy.y, 2));
				const distance = Math.hypot(effect.x - enemy.x, effect.y - enemy.y);
				if (distance - (effect.size / 2) - (enemy.size / 2) <= 0) {
					runtime.score++;
					runtime.enemies.delete(enemy);
					runtime.effects.delete(effect);
				}
			}
		});
	});
	// enemies AI
	runtime.enemies.forEach(function (enemy) {
		enemy.d = Math.atan2(player.y - enemy.y, player.x - enemy.x) * (180 / Math.PI);
		enemy.x = enemy.x + enemy.speed * Math.cos(enemy.d * Math.PI / 180);
		enemy.y = enemy.y + enemy.speed * Math.sin(enemy.d * Math.PI / 180);
		if (enemy.x < 0 || enemy.y < 0 || enemy.x > runtime.paper.width || enemy.y > runtime.paper.height) {
			runtime.enemies.delete(enemy);
		}
	});
};

var runtime_render = function (timestamp) {
	if (!runtime.running) {
		return;
	}
	/*
	// frame rate limiter
	const delay = 33; // 30fps use 1000/30=33
	if (runtime.next_time && timestamp < runtime.next_time) {
		runtime.frame_request = requestAnimationFrame(runtime_render);
		return;
	}
	runtime.next_time = timestamp + delay;
	*/
	// calculate fps
	while (runtime.times.length > 0 && runtime.times[0] <= timestamp - 1000) {
		runtime.times.shift();
	}
	runtime.times.push(timestamp);
	// render frame
	const paper = runtime.paper;
	paper.clear();
	paper.rect({ x: 0, y: 0, width: paper.width, height: paper.height, fill: 'black' });
	runtime.effects.forEach(function (effect) {
		if (effect.type === 'skill_1') {
			paper.circle({ x: effect.x, y: effect.y, r: effect.size / 2, fill: 'white' });
		}
	});
	runtime.enemies.forEach(function (enemy) {
		//paper.circle({ x: enemy.x, y: enemy.y, r: enemy.size / 2, fill: 'white' });
		paper.rect({ x: enemy.x - enemy.size, y: enemy.y - enemy.size, width: enemy.size, height: enemy.size, fill: 'white', degree: enemy.d });
	});
	paper.polygon({
		x: runtime.player.x,
		y: runtime.player.y,
		sides: 3,
		size: runtime.player.size,
		degree: runtime.player.d,
		fill: 'white'
	});
	// print score
	paper.text({
		text: `SCORE: ${runtime.score}`,
		x: paper.width / 2,
		y: 10,
		font: '14px Consolas, monospace',
		align: 'center',
		baseline: 'top',
		fill: 'white'
	});
	// print help text
	paper.text({
		text: 'Use arrow keys to move and turn, and space to shoot.',
		x: paper.width / 2,
		y: paper.height - 10,
		font: '14px Consolas, monospace',
		align: 'center',
		baseline: 'bottom',
		fill: 'white'
	});
	// print fps
	paper.text({
		text: `FPS: ${runtime.times.length}`,
		x: paper.width - 10,
		y: 10,
		font: '14px Consolas, monospace',
		align: 'right',
		baseline: 'top',
		fill: 'white'
	});
	// loop
	if (runtime.running) {
		runtime.frame_request = requestAnimationFrame(runtime_render);
	}
};

runtime.paper.size(window.innerWidth, window.innerHeight);
window.addEventListener('resize', function () {
	runtime.paper.size(window.innerWidth, window.innerHeight);
});
runtime_reset();
runtime_start();