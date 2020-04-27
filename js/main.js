var Engine, World, Bodies, Constraint, Composite;

var delta = 0;
var running = true;

/** We have a few state strings:
 * - "normal" for normal operations
 * - "dragging" for moving the view
 * - "makeEdges" for connecting nodes with edges
 * - "select" for selecting things, which is a special mode that you exit from
 *   by pressing the ENTER key, which is different from selecting things
 *   normally because we want to use it for when features require a select
 *   callback.
 */
var g_state = "normal";
var g_engine;
var g_nodes = [];
var g_edges = [];
var g_statbar = new StatusBar(s => g_state = s);

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

var g_selected = {
	state: 'normal',
	nodes: [],
	box: null,
	cb: nodes => {}
};
var dialogBox = null;

var g_tutorialctl = new TutorialController(
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

	g_engine = Engine.create();
	g_engine.world.gravity.y = 0;

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
		[g_nodes, g_edges, view] = deserializeFile(g_engine.world, JSON.parse(s));
	}

	saveToDisk.addEventListener('click', () => {
		const s = JSON.stringify(serializeWorld(g_nodes, g_edges, view));
		download('graph.json', s);
	});

	saveToBrowser.addEventListener('click', () => {
		const obj = serializeWorld(g_nodes, g_edges, view);
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
			[g_nodes, g_edges, view] = deserializeFile(g_engine.world, JSON.parse(text));
		});
	});

	clearGraph.addEventListener('click', () => {
		World.clear(g_engine.world, false, true);
		g_nodes = [];
		g_edges = [];

		deselectAllNodes();
	});

	// Setup autosave
	setInterval(() => {
		if (autoSave.checked) {
			saveToBrowser.click();
		}
	}, AUTOSAVE_INTERVAL);

	// Trigger initial tutorial
	g_tutorialctl.trigger('add_node');
}

function draw() {
	background('black');

	push();
	// Place (0, 0) at the center of the screen
	translate(width / 2, height / 2);
	// Add the edges
	for (let e of g_edges) {
		e.draw(view);
	}
	pop();

	// Draw the drag line
	if (g_state === 'makeEdges') {
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
	for (let b of g_nodes) {
		b.draw(view);
	}
	pop();

	// Display the infobox on top of everything else, at the top-left hand
	// corner of the screen, no scaling.
	if (g_selected.nodes.length === 1 && g_selected.state === 'normal') {
		g_selected.box.draw(view);
	}

	// Display dialog box if needed
	if (dialogBox !== null) {
		dialogBox.draw();
	}

	tick(deltaTime);
}

function doubleClicked() {
	if (g_selected.nodes.length === 1 && dialogBox === null) {
		// On the off chance that we clicked on something important, we need to
		// populate the dialogBox variable with an actual dialog box.
		g_selected.box.handleDblClick(mouseX, mouseY, (box) => {
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

	if (g_selected.nodes.length === 1) {
		if (g_selected.box.handleInput(keyCode)) {
			return;
		}
	}

	if (keyCode === 65 && !keyIsDown(CONTROL) && g_selected.state === 'normal') {
		// Check to see if we are clicking outside of the playing area
		if (mouseX > width || mouseY > height) return;

		// Create the node
		let [mX, mY] = screenToWorldCoords(mouseX, mouseY, view);
		n = new Node(g_engine.world, mX, mY);
		// ... and then select that node
		deselectAllNodes();
		toggleNode(n);
		g_nodes.push(n);

		// If we have added more than 15 nodes on screen at once, trigger the
		// scrolling tutorial (of course, we bypass it if we already know how
		// to do that).
		if (g_nodes.length >= 15) {
			g_tutorialctl.trigger('scrolling');
		}
	} else if (keyCode === 65 && keyIsDown(CONTROL)) {
		// CTRL-A is select all
		g_selected.nodes = g_nodes;
		for (const n of g_nodes) {
			n.select();
		}
	} else if (keyCode === DELETE && g_selected.state === 'normal') {
		// If we are selecting nodes, delete them
		let yeet = false;
		for (const n of g_selected.nodes) {
			World.remove(g_engine.world, n.m_body);
			g_nodes.splice(g_nodes.indexOf(n), 1);

			for (let i = 0; i < g_edges.length; ++i) {
				if (n.m_body === g_edges[i].m_b1 || n.m_body === g_edges[i].m_b2) {
					World.remove(g_engine.world, g_edges[i].m_constraint);
					g_edges.splice(i, 1);
					--i;
					yeet = true;
				}
			}
		}

		deselectAllNodes();

		// If there is an edge attached to this node that we have deleted,
		// trigger the edge deletion tutorial
		if (yeet) {
			g_tutorialctl.trigger('delete_edge');
		}
	} else if (keyCode === ESCAPE) {
		// Deselect all nodes
		deselectAllNodes();
	} else if (g_selected.state === 'select' && keyCode === ENTER) {
		// When pressing ENTER key in select mode, we return to whatever we got
		// for the callback. This could be anything, but provides a way for
		// other features to hook onto this existing selection system.
		g_selected.cb(g_selected.nodes);
	} else {
		return true;
	}

	return false;
}

function mouseReleased() {
	if (dialogBox !== null) {
		return;
	}

	if (g_state === 'dragging') {
		g_statbar.setState('normal');
	} else if (g_state === 'makeEdges') {
		g_statbar.setState('normal');
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
			World.remove(g_engine.world, e.m_constraint);
			g_edges.splice(g_edges.indexOf(e), 1);

			// Bypass the edge deletion tutorial if necessary
			if (!g_tutorialctl.hasBeenTriggered('delete_edge')) {
				g_tutorialctl.bypass('delete_edge');
			}
		} else {
			// Make the edge!
			g_edges.push(new Edge(g_engine.world, makeEdges.anchorNode, makeEdges.targetNode));
		}
		makeEdges.anchorNode = null;
		makeEdges.targetNode = null;
	} else {
		// Click on a node to select it
		let n = isCoordCollide(mouseX, mouseY);
		if (n !== null && keyIsDown(CONTROL)) {
			// If we are holding down control, toggle and don't touch the
			// others
			toggleNode(n);
		} else if (n !== null && !keyIsDown(CONTROL)) {
			// If we aren't holding down control, deselect everything and
			// select that one
			deselectAllNodes();
			toggleNode(n);
		}
	}
}

function mouseDragged() {
	if (dialogBox !== null) {
		return false;
	}

	if (g_state === 'normal') {
		// Check to see if we are dragging and starting at a node
		// If so we start making an edge
		// If not we are simply dragging the view around
		makeEdges.anchorNode = isCoordCollide(mouseX, mouseY);
		if (makeEdges.anchorNode === null) {
			g_statbar.setState('dragging');
			dragging.x = mouseX;
			dragging.y = mouseY;
			dragging.vx = view.x;
			dragging.vy = view.y;
		} else if (g_selected.state === 'normal') {
			g_statbar.setState('makeEdges');
		}
	} else if (g_state === 'makeEdges') {
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
	for (let n of g_nodes) {
		if (n.isCollide(mx, my)) {
			return n;
		}
	}
	return null;
}

function mouseWheel(evt) {
	// No need to scroll within a dialog box
	if (dialogBox !== null) {
		return;
	}

	// Check to see if we are clicking outside of the playing area
	if (mouseX > width || mouseY > height) return;
	view.s += evt.delta / 100;

	// If we haven't bypassed it already, bypass
	if (!g_tutorialctl.hasBeenTriggered('scrolling')) {
		g_tutorialctl.bypass('scrolling');
	}

	return false;
}

function tick(delta) {
	Engine.update(g_engine, delta);
}

function deselectAllNodes() {
	for (const n of g_selected.nodes) {
		n.deselect();
	}

	g_selected.nodes = [];
	g_selected.box = null;
}

function toggleNode(n) {
	if (g_selected.nodes.includes(n)) {
		// If node is already g_selected, deselect it
		n.deselect();
		g_selected.nodes.splice(g_selected.nodes.indexOf(n), 1);
	} else {
		// If nodes is not g_selected already, select it
		n.select();
		g_selected.nodes.push(n);
	}

	// If needed, we use an infobox
	if (g_selected.nodes.length === 1) {
		g_selected.box = new NodeInfobox(g_selected.nodes[0], g_selected);
	}
}

/**
 * Checks to see if we already have an edge between bodyA and bodyB. Returns
 * the edge if there is an edge already, and null if there isn't.
 */
function findEdge(bodyA, bodyB) {
	for (const e of g_edges) {
		if (e.equals(bodyA, bodyB)) {
			return e;
		}
	}

	return null;
}
