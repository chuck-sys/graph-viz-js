const WIDTH = 1280;
const HEIGHT = 720;

var Engine, World, Bodies;

var delta = 0;
var running = true;

var m_engine;
var m_bodies = [];

var view = {
	x: 0, y: 0, s: 1
}

var dragging = {
	x: 0, y: 0, inState: false,
	vx: 0, vy: 0
};

var selected = null;

function setup() {
	createCanvas(WIDTH, HEIGHT);

	Engine = Matter.Engine;
	World = Matter.World;
	Bodies = Matter.Bodies;

	m_engine = Engine.create();
	m_engine.world.gravity.y = 0;
}

function draw() {
	background('black');

	push();
	// Place (0, 0) at the center of the screen
	translate(WIDTH / 2, HEIGHT / 2);
	for (let b of m_bodies) {
		b.draw(view);
	}
	pop();

	tick(deltaTime);
}

function mouseReleased() {
	if (dragging.inState) {
		dragging.inState = false;
	} else {
		let mX = (mouseX - WIDTH / 2) / view.s - view.x;
		let mY = (mouseY - HEIGHT / 2) / view.s - view.y;
		let n = new Node(m_engine.world, mX, mY);
		if (selected !== null) {
			selected.deselect();
		}
		selected = n;
		m_bodies.push(n);
	}
}

function mouseDragged() {
	if (!dragging.inState) {
		dragging.inState = true;
		dragging.x = mouseX;
		dragging.y = mouseY;
		dragging.vx = view.x;
		dragging.vy = view.y;
	} else {
		let mX = (mouseX - dragging.x) / view.s;
		let mY = (mouseY - dragging.y) / view.s;
		view.x = dragging.vx + mX;
		view.y = dragging.vy + mY;
	}
}

function mouseWheel(evt) {
	view.s += evt.delta / 100;

	return false;
}

function tick(delta) {
	Engine.update(m_engine, delta);
}
