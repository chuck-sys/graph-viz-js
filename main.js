var Engine, World, Bodies;

var delta = 0;
var running = true;

var m_engine;
var m_bodies = [];

var view = {
	x: 0, y: 0, s: 1
}

function setup() {
	createCanvas(1280, 720);

	Engine = Matter.Engine;
	World = Matter.World;
	Bodies = Matter.Bodies;

	m_engine = Engine.create();
	m_engine.world.gravity.y = 0;
}

function draw() {
	background('black');

	for (let b of m_bodies) {
		b.draw(view);
	}

	tick(deltaTime);
}

function mouseReleased() {
	m_bodies.push(new Node(m_engine.world, mouseX, mouseY));
}

function mouseWheel(evt) {
	view.s += evt.delta / 100;
}

function tick(delta) {
	Engine.update(m_engine, delta);
}
