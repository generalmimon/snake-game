var canv = document.getElementById("canvas"),
	ctx = canv.getContext("2d");
var controls = document.getElementById("controls");
var gameInterval;
var config = {
	width: 7,
	height: 7,
	length: 3,
	timestep: 500
};
var arrowHovered = "";
var State = {
	Off: 0,
	On: 1,
	Inv: 2
};
var snake = [[2, 3], [3, 3], [4, 3]],
	food = [];
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
	var fIdx = isFood(x, y)
	if(fIdx !== null) {
		removeFood(fIdx);
	} else {
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
					colors[0] = Math.floor(0.2 * colors[0]);
					colors[1] = Math.floor(0.2 * colors[1]);
					colors[2] = Math.floor(0.2 * colors[2]);
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
			console.log(x,y, fieldColors[y][x]);
		}
	}
}
function init() {
	if(!config.hasOwnProperty("timedelta")) {
		config.timedelta = config.timestep / (config.width * config.height);
	}
	canv.width = CELL_PAD + config.width * (CELL_SIZE + CELL_PAD);
	canv.height = CELL_PAD + config.height * (CELL_SIZE + CELL_PAD);
	var r = 0,
		g = 0,
		b = 0;
	for(var y = 0; y < config.height; y++) {
		fieldColors[y] = [];
		fieldStates[y] = [];
		r = (y / (config.height - 1)) * 255;
		for(var x = 0; x < config.width; x++) {
			g = (x / (config.width - 1)) * 255;
			b = 127; // jak?
			setColor(x, y, [Math.floor(r), Math.floor(g), Math.floor(b)]);
			setState(x, y, State.Off);
		}
	}
	gameInterval = setInterval(gameloop, config.timestep);
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
function shiftSnake(deltaX, deltaY) {
	for(var i = 0, slen = snake.length; i < slen; i++) {
		var piece = snake[i];
		setState(piece[0], piece[1], State.Off);
		piece[0] = (config.width + piece[0] + deltaX) % config.width;
		piece[1] = (config.height + piece[1] + deltaY) % config.height;
		setState(piece[0], piece[1], State.On);
	}
}
function gameloop() {
	if(arrowHovered) {
		var deltaX = 0, deltaY = 0;
		if(arrowHovered === "up") deltaY = -1;
		if(arrowHovered === "down") deltaY = +1;
		if(arrowHovered === "left") deltaX = -1;
		if(arrowHovered === "right") deltaX = +1;
		shiftSnake(deltaX, deltaY);
	}
	draw();
}
function controlsMouseOver(ev) {
	var t = ev.target;
	var cl = t.className.split(' ');
	if(cl[0] === "arrow") {
		arrowHovered = cl[1];
	}
}
function controlsMouseOut(ev) {
	arrowHovered = "";
}
init();
draw();
canv.onclick = click;
controls.onmouseover = controlsMouseOver;
controls.onmouseout = controlsMouseOut;