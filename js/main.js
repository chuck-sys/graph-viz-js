var Engine, World, Bodies, Constraint, Composite;

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
var dialogBox = null;

var m_tutorialctl = new TutorialController(
	() => dialogBox = null,
	d => dialogBox = d
);

function setup() {
	let canvas = createCanvas(windowWidth * 0.7, windowHeight);
	canvas.parent('canvasParent');

	Engine = Matter.Engine;
	World = Matter.World;
	Bodies = Matter.Bodies;
	Constraint = Matter.Constraint;
	Composite = Matter.Composite;

	m_engine = Engine.create();
	m_engine.world.gravity.y = 0;

	textSize(EM);

	let saveToDisk = document.getElementById('save-to-disk-bt');
	let saveToBrowser = document.getElementById('save-to-browser-bt');
	let loadFromFile = document.getElementById('load-from-file-bt');
	let autoSave = document.getElementById('auto-save');
	let autoSaveLbl = document.getElementById('auto-save-lbl');
	let clearGraph = document.getElementById('clear-bt');

	// Load from browser by default
	const s = localStorage.getItem('data');
	if (s !== null) {
		[m_nodes, m_edges, view] = deserializeFile(m_engine.world, JSON.parse(s));
	}

	saveToDisk.addEventListener('click', () => {
		const s = JSON.stringify(serializeWorld(m_nodes, m_edges, view));
		download('graph.json', s);
	});

	saveToBrowser.addEventListener('click', () => {
		const obj = serializeWorld(m_nodes, m_edges, view);
		const now = new Date(Date.now());
		localStorage.setItem('data', JSON.stringify(obj));

		saveToBrowser.innerHTML = 'Saved!';
		saveToBrowser.classList.add('flash');
		autoSaveLbl.innerHTML = 'Auto-Save (last saved ' + now.toTimeString() + ')';

		setTimeout(() => {
			saveToBrowser.innerHTML = 'Save to browser (no download)';
			saveToBrowser.classList.remove('flash');
		}, 2000);
	});

	loadFromFile.addEventListener('change', evt => {
		const file = evt.target.files[0];
		readFile(file, text => {
			[m_nodes, m_edges, view] = deserializeFile(m_engine.world, JSON.parse(text));
		});
	});

	clearGraph.addEventListener('click', () => {
		World.clear(m_engine.world, false, true);
		m_nodes = [];
		m_edges = [];
	});

	// Setup autosave
	setInterval(() => {
		if (autoSave.checked) {
			saveToBrowser.click();
		}
	}, AUTOSAVE_INTERVAL);

	// Trigger initial tutorial
	m_tutorialctl.trigger('add_node');
}

function draw() {
	background('black');

	push();
	// Place (0, 0) at the center of the screen
	translate(width / 2, height / 2);
	// Add the edges
	for (let e of m_edges) {
		e.draw(view);
	}
	pop();

	// Draw the drag line
	if (m_state === 'makeEdges') {
		let color = makeEdges.targetNode === null ? 'red' : 'green';
		push();
		stroke(color);
		strokeWeight(3);
		translate(width / 2, height / 2);
		scale(view.s);
		translate(view.x, view.y);

		if (makeEdges.targetNode === null) {
			let [mx, my] = screenToWorldCoords(mouseX, mouseY, view);
			line(makeEdges.anchorNode.m_body.position.x,
				makeEdges.anchorNode.m_body.position.y,
				mx, my);
		} else {
			if (findEdge(makeEdges.targetNode.m_body, makeEdges.anchorNode.m_body) !== null) {
				// Make it explicit that we are deleting an edge constraint
				stroke(20);
			}
			line(makeEdges.anchorNode.m_body.position.x,
				makeEdges.anchorNode.m_body.position.y,
				makeEdges.targetNode.m_body.position.x,
				makeEdges.targetNode.m_body.position.y);
		}
		pop();
	}

	push();
	// Place (0, 0) at the center of the screen
	translate(width / 2, height / 2);
	// Add the nodes
	for (let b of m_nodes) {
		b.draw(view);
	}
	pop();

	// Display the infobox on top of everything else, at the top-left hand
	// corner of the screen, no scaling.
	if (selected !== null) {
		selected.box.draw(view);
	}

	// Display dialog box if needed
	if (dialogBox !== null) {
		dialogBox.draw();
	}

	tick(deltaTime);
}

function doubleClicked() {
	if (selected !== null && dialogBox === null) {
		// On the off chance that we clicked on something important, we need to
		// populate the dialogBox variable with an actual dialog box.
		selected.box.handleDblClick(mouseX, mouseY, (box) => {
			// Function called when we create the box
			dialogBox = box;
		}, (box) => {
			// Function called when we cancel the box (by pressing escape)
			dialogBox = null;
		});
	}
}

function keyPressed() {
	if (dialogBox !== null) {
		dialogBox.handleInput(keyCode);
		return;
	}

	if (selected !== null) {
		if (selected.box.handleInput(keyCode)) {
			return;
		}
	}

	if (keyCode === 65) {
		// Check to see if we are clicking outside of the playing area
		if (mouseX > width || mouseY > height) return;

		// Create the node
		let [mX, mY] = screenToWorldCoords(mouseX, mouseY, view);
		n = new Node(m_engine.world, mX, mY);
		// ... and then select that node
		selectNode(n);
		m_nodes.push(n);

		// If we have added more than 15 nodes on screen at once, trigger the
		// scrolling tutorial (of course, we bypass it if we already know how
		// to do that).
		if (m_nodes.length >= 15) {
			m_tutorialctl.trigger('scrolling');
		}
	} else if (keyCode === DELETE && selected !== null) {
		// If we are selecting a node, delete it
		World.remove(m_engine.world, selected.node.m_body);		// Remove from physics engine
		m_nodes.splice(m_nodes.indexOf(selected.node), 1);		// Remove from array (a ref)
		// Also delete all edges themselves that are connected
		for (let i = 0; i < m_edges.length; ++i) {
			if (selected.node.m_body === m_edges[i].m_b1 || selected.node.m_body === m_edges[i].m_b2) {
				World.remove(m_engine.world, m_edges[i].m_constraint);
				m_edges.splice(i, 1);
				--i;
			}
		}
		deselectNode();											// Deselect it, thus removing it entirely
	}
}

function mouseReleased() {
	if (dialogBox !== null) {
		return;
	}

	if (m_state === 'dragging') {
		m_state = 'normal';
	} else if (m_state === 'makeEdges') {
		m_state = 'normal';
		if (makeEdges.targetNode === null || makeEdges.anchorNode === null || makeEdges.anchorNode === makeEdges.targetNode) {
			// We haven't connected the nodes or we are connecting our own
			// nodes so we don't do anything and exit early
			makeEdges.anchorNode = null;
			makeEdges.targetNode = null;
			return;
		}

		let e = findEdge(makeEdges.targetNode.m_body, makeEdges.anchorNode.m_body);
		if (e !== null) {
			// The edge already exists. Delete it.
			World.remove(m_engine.world, e.m_constraint);
			m_edges.splice(m_edges.indexOf(e), 1);
		} else {
			// Make the edge!
			m_edges.push(new Edge(m_engine.world, makeEdges.anchorNode, makeEdges.targetNode));
		}
		makeEdges.anchorNode = null;
		makeEdges.targetNode = null;
	} else {
		// Click on a node to select it
		let n = isCoordCollide(mouseX, mouseY);
		if (n !== null) {
			selectNode(n);
		} else if (selected !== null && !selected.box.isHit(mouseX, mouseY)) {
			deselectNode();
		}
	}
}

function mouseDragged() {
	if (dialogBox !== null) {
		return;
	}

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
	// Check to see if we are clicking outside of the playing area
	if (mouseX > width || mouseY > height) return;
	view.s += evt.delta / 100;

	// If we haven't bypassed it already, bypass
	if (!m_tutorialctl.hasBeenTriggered('scrolling')) {
		m_tutorialctl.bypass('scrolling');
	}

	return false;
}

function tick(delta) {
	Engine.update(m_engine, delta);
}

function deselectNode() {
	if (selected !== null) {
		selected.node.deselect();
		selected = null;
	}
}

function selectNode(n) {
	deselectNode();
	selected = {node: n, box: new NodeInfobox(n)};
	n.select();
}

/**
 * Checks to see if we already have an edge between bodyA and bodyB. Returns
 * the edge if there is an edge already, and null if there isn't.
 */
function findEdge(bodyA, bodyB) {
	for (const e of m_edges) {
		if (e.equals(bodyA, bodyB)) {
			return e;
		}
	}

	return null;
}
