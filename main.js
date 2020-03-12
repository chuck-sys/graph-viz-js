const WIDTH = 1280;
const HEIGHT = 720;

var Engine, World, Bodies;

var delta = 0;
var running = true;

/** We have a few state strings:
 * - "normal" for normal operations
 * - "dragging" for moving the view
 * - "makeEdges" for connecting nodes with edges
 */
var m_state = "normal";
var m_engine;
var m_nodes = [];
var m_edges = [];

var view = {
	x: 0, y: 0, s: 1
}

var dragging = {
	x: 0, y: 0,
	vx: 0, vy: 0
};

var makeEdges = {
	anchorNode: null
}

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
	for (let b of m_nodes) {
		b.draw(view);
	}
	pop();

	tick(deltaTime);
}

function mouseReleased() {
	if (m_state === 'dragging') {
		m_state = 'normal';
	} else if (m_state === 'makeEdges') {
		m_state = 'normal';
		let n = isCoordCollide(mouseX, mouseY);
		if (n === null || n === makeEdges.anchorNode) {
			// We haven't connected the nodes or we are connecting our own
			// nodes so we don't do anything
		} else {
			// Make the edge!
		}
	} else {
		let mX = (mouseX - WIDTH / 2) / view.s - view.x;
		let mY = (mouseY - HEIGHT / 2) / view.s - view.y;
		let n = new Node(m_engine.world, mX, mY);

		if (selected !== null) {
			selected.deselect();
		}

		selected = n;
		m_nodes.push(n);
	}
}

function mouseDragged() {
	if (m_state === 'normal') {
		// Check to see if we are dragging and starting at a node
		// If so we start making an edge
		// If not we are simply dragging the view around
		makeEdges.anchorNode = isCoordCollide(mouseX, mouseY);
		if (makeEdges.anchorNode === null) {
			m_state = 'dragging';
			dragging.x = mouseX;
			dragging.y = mouseY;
			dragging.vx = view.x;
			dragging.vy = view.y;
		} else {
			m_state = 'makeEdges';
		}
	} else {
		let mX = (mouseX - dragging.x) / view.s;
		let mY = (mouseY - dragging.y) / view.s;
		view.x = dragging.vx + mX;
		view.y = dragging.vy + mY;
	}
}

/**
 * Checks to see if a screen coordinate has collided with any of the nodes.
 * Returns the node it collided with if there is a node that we have collided
 * with, or null if there isn't.
 */
function isCoordCollide(mx, my) {
	mx = (mx - WIDTH / 2) / view.s - view.x;
	my = (my - HEIGHT / 2) / view.s - view.y;
	for (let n of m_nodes) {
		if (n.isCollide(mx, my)) {
			return n;
		}
	}
	return null;
}

function mouseWheel(evt) {
	view.s += evt.delta / 100;

	return false;
}

function tick(delta) {
	Engine.update(m_engine, delta);
}
