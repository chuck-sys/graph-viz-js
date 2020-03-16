const WIDTH = 1280;
const HEIGHT = 720;

var Engine, World, Bodies, Constraint;

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
	anchorNode: null,
	targetNode: null
}

var selected = null;

function setup() {
	createCanvas(WIDTH, HEIGHT);

	Engine = Matter.Engine;
	World = Matter.World;
	Bodies = Matter.Bodies;
	Constraint = Matter.Constraint;

	m_engine = Engine.create();
	m_engine.world.gravity.y = 0;
}

function draw() {
	background('black');

	// Draw the drag line
	if (m_state === 'makeEdges') {
		let color = makeEdges.targetNode === null ? 'red' : 'green';
		push();
		stroke(color);
		strokeWeight(1);
		translate(WIDTH / 2, HEIGHT / 2);
		scale(view.s);
		translate(view.x, view.y);

		if (makeEdges.targetNode === null) {
			let [mx, my] = screenToWorldCoords(mouseX, mouseY, view);
			line(makeEdges.anchorNode.m_body.position.x,
				makeEdges.anchorNode.m_body.position.y,
				mx, my);
		} else {
			line(makeEdges.anchorNode.m_body.position.x,
				makeEdges.anchorNode.m_body.position.y,
				makeEdges.targetNode.m_body.position.x,
				makeEdges.targetNode.m_body.position.y);
		}
		pop();
	}

	push();
	// Place (0, 0) at the center of the screen
	translate(WIDTH / 2, HEIGHT / 2);
	// Add the edges
	for (let e of m_edges) {
		e.draw(view);
	}
	// Add the nodes
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
		if (makeEdges.targetNode === null || makeEdges.anchorNode === null || makeEdges.anchorNode === makeEdges.targetNode) {
			// We haven't connected the nodes or we are connecting our own
			// nodes so we don't do anything
		} else {
			// Make the edge!
			m_edges.push(new Edge(m_engine.world, makeEdges.anchorNode, makeEdges.targetNode));
		}
		makeEdges.anchorNode = null;
		makeEdges.targetNode = null;
	} else {
		let n = isCoordCollide(mouseX, mouseY);
		if (n === null) {
			// We click on nothing, so create a new node
			let [mX, mY] = screenToWorldCoords(mouseX, mouseY, view);
			n = new Node(m_engine.world, mX, mY);
			// ... and then select that node
			selectNode(n);
			m_nodes.push(n);
		} else {
			// We click on a node, so select it
			selectNode(n);
		}
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
	} else if (m_state === 'makeEdges') {
		makeEdges.targetNode = isCoordCollide(mouseX, mouseY);
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
	[mx, my] = screenToWorldCoords(mx, my, view);
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

function selectNode(n) {
	if (selected !== null) {
		selected.deselect();
	}
	selected = n;
	n.select();
}
