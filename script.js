var canv = document.getElementById("canvas"),
	ctx = canv.getContext("2d");
var controls = document.getElementById("controls"),
	scoreSpan = document.getElementById("score");
var gameInterval;
var config = {
	width: 7,
	height: 7,
	length: 3,
	timestep: 500
};
var timestep = 0;
var arrowHovered = "";
var State = {
	Off: 0,
	On: 1,
	Inv: 2
};
var snake = [],
	food = [],
	score = 0;
var CELL_SIZE = 40,
	CELL_PAD = 10;
var fieldColors = [],
	fieldStates = [];
function setColor(x, y, color) {
	fieldColors[y][x] = color;
};
function setState(x, y, state) {
	fieldStates[y][x] = state;
}
function getColor(x, y) {
	var colors = fieldColors[y][x];
	return [colors[0], colors[1], colors[2]];
}
function getState(x, y) {
	return fieldStates[y][x];
}
function isFood(x, y) {
	for(var i = 0, flen = food.length; i < flen; i++) {
		if(food[i][0] === x && food[i][1] === y) {
			return i;
		}
	}
	return null;
}
function isSnake(x, y) {
	for(var i = 0, slen = snake.length; i < slen; i++) {
		if(snake[i][0] === x && snake[i][1] === y) {
			return true;
		}
	}
	return false;
}
function addFood(x, y) {
	food.push([x, y]);
	setState(x, y, State.Inv);
}
function removeFood(i) {
	var x = food[i][0],
		y = food[i][1];
	food.splice(i, 1);
	setState(x, y, State.Off);
}
function switchFood(x, y) {
	var fIdx = isFood(x, y);
	if(fIdx !== null) {
		removeFood(fIdx);
	} else if(!isSnake(x, y)) {
		addFood(x, y);
	}
}
function draw() {
	ctx.clearRect(0, 0, canv.width, canv.height);
	for(var y = 0; y < config.height; y++) {
		for(var x = 0; x < config.width; x++) {
			var colors = getColor(x, y);
			switch(getState(x, y)) {
				case State.Off: {
					colors[0] = Math.floor(.2 * colors[0]);
					colors[1] = Math.floor(.2 * colors[1]);
					colors[2] = Math.floor(.2 * colors[2]);
					break;
				}
				case State.Inv: {
					colors[0] = Math.floor(255 - colors[0]);
					colors[1] = Math.floor(255 - colors[1]);
					colors[2] = Math.floor(255 - colors[2]);
					break;
				}
			}
			ctx.fillStyle = 'rgb(' + colors.join(', ') + ')';
			ctx.fillRect(CELL_PAD + x * (CELL_SIZE + CELL_PAD), CELL_PAD + y * (CELL_SIZE + CELL_PAD), CELL_SIZE, CELL_SIZE);
		}
	}
}
function getParameters() {
	var querystr = window.location.search.substr(1),
		chars = querystr.split('');
	var param = {},
		key = "",
		part = "";
	for(var i = 0, slen = chars.length; i < slen; i++) {
		if(chars[i] === '=') {
			key = part;
			part = "";
		} else if(chars[i] === '&') {
			param[key] = part;
			part = "";
		} else {
			part += chars[i];
		}
	}
	if(part) {
		param[key] = part;
	}
	return param;
}
function mergeObjects(original, newObj) {
	for(var key in newObj){
		if(newObj.hasOwnProperty(key)) {
			var newValue = newObj[key];
			original[key] = Number(newValue);
		}
	}
	return original;
}
function init() {
	var param = getParameters();
	config = mergeObjects(config, param);
	if(!config.hasOwnProperty("timedelta")) {
		config.timedelta = Math.floor(config.timestep / (config.width * config.height));
	}
	timestep = config.timestep;
	canv.width = CELL_PAD + config.width * (CELL_SIZE + CELL_PAD);
	canv.height = CELL_PAD + config.height * (CELL_SIZE + CELL_PAD);

	var middleX = Math.floor((config.width - 1) / 2),
		middleY = Math.floor((config.height - 1) / 2);
	for(var i = 0, slen = config.length; i < slen; i++) {
		snake.push([middleX, middleY]);
	}
	var r = 0,
		g = 0,
		b = 0;
	var maxDim2 = Math.max(config.width, config.height) * 2;
	for(var y = 0; y < config.height; y++) {
		fieldColors[y] = [];
		fieldStates[y] = [];
		r = (y / (config.height - 1)) * 255;
		for(var x = 0; x < config.width; x++) {
			g = (x / (config.width - 1)) * 255;
			b = (1 - ((x + y) / maxDim2)) * 255;
			setColor(x, y, [Math.floor(r), Math.floor(g), Math.floor(b)]);
			setState(x, y, State.Off);
		}
	}
	setState(snake[0][0], snake[0][1], State.On);
	gameInterval = window.setInterval(gameloop, config.timestep);
}
function click(ev) {
	var rect = canv.getBoundingClientRect();
	var pos = {
		x: Math.floor((ev.clientX - rect.left - CELL_PAD) / (CELL_SIZE + CELL_PAD)),
		y: Math.floor((ev.clientY - rect.top - CELL_PAD)  / (CELL_SIZE + CELL_PAD))
	};
	switchFood(pos.x, pos.y);
	draw();
}
function gameOver() {
	alert("Prohráli jste!\nSkóre: " + score + "\nPro restart stiskněte OK.");
	window.location.reload();
}
function shiftSnake(deltaX, deltaY) {
	var head = snake[0],
		newHead = [];
	newHead[0] = (config.width + head[0] + deltaX) % config.width;
	newHead[1] = (config.height + head[1] + deltaY) % config.height;
	var i = snake.length - 1,
		tail = [snake[i][0], snake[i][1]];
	setState(tail[0], tail[1], State.Off);
	for(; i > 0; i--) {
		var piece = snake[i];
		piece[0] = snake[i - 1][0];
		piece[1] = snake[i - 1][1];
		setState(piece[0], piece[1], State.On);
	}
	var fIdx = isFood(newHead[0], newHead[1]);
	if(fIdx !== null) {
		removeFood(fIdx);
		snake.push(tail);
		setState(tail[0], tail[1], State.On);

		timestep -= config.timedelta;
		window.clearInterval(gameInterval);
		gameInterval = window.setInterval(gameloop, timestep);
		scoreSpan.textContent = ++score;
	} else if(isSnake(newHead[0], newHead[1])) {
		return false;
	}
	head[0] = newHead[0];
	head[1] = newHead[1];
	setState(head[0], head[1], State.On);
	return true;
}
function checkDir(dir) {
	var delta = getDelta(dir),
		head = snake[0],
		newHead = [];
	newHead[0] = (config.width + head[0] + delta[0]) % config.width;
	newHead[1] = (config.height + head[1] + delta[1]) % config.height;
	return (snake.length < 2 || newHead[0] !== snake[1][0] || newHead[1] !== snake[1][1]);
}
function getDelta(dir) {
	var deltaX = 0, deltaY = 0;
	if(dir === "up") deltaY = -1;
	if(dir === "down") deltaY = +1;
	if(dir === "left") deltaX = -1;
	if(dir === "right") deltaX = +1;
	return [deltaX, deltaY];
}
function gameloop() {
	while(arrowHovered) {
		var delta = getDelta(arrowHovered),
			state = shiftSnake(delta[0], delta[1]);
		if(!state) {
			gameOver();
		}
		break;
	}
	draw();
}
function controlsMouseOver(ev) {
	var t = ev.target;
	var cl = t.className.split(' ');
	if(cl[0] === "arrow") {
		if(checkDir(cl[1])) {
			arrowHovered = cl[1];
		}
		controls.className = arrowHovered;
	}
}
init();
draw();
canv.onclick = click;
controls.onmouseover = controlsMouseOver;