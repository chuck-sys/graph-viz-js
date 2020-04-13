/**
 * Turn the graph (and your current settings) into a JSON object.
 */
function serializeWorld(nodes, edges, view) {
	let ret = {};
	ret.view = view;
	ret.nodes = [];
	ret.edges = [];

	let i = 0;
	for (let n of nodes) {
		let o = {
			id: i,
			position: [n.m_body.position.x, n.m_body.position.y],
			data: n.m_data
		};
		n.id = i++;

		ret.nodes.push(o);
	}

	for (let e of edges) {
		let o = {
			nodeA: e.m_n1.id,
			nodeB: e.m_n2.id
		};

		ret.edges.push(o);
	}

	return ret;
}

/**
 * Turn a JSON object (and your current settings) into a tuple of nodes, edges,
 * and a view.
 */
function deserializeFile(world, obj) {
	let nodes = {};			// key with node id for easier lookup
	let edges = [];
	let view = obj.view;

	for (let n of obj.nodes) {
		let o = new Node(world, n.position[0], n.position[1]);
		o.m_selected = false;
		o.m_data = n.data;
		nodes[n.id] = o;	// key with node id for easier lookup
	}

	for (let e of obj.edges) {
		let o = new Edge(world, nodes[e.nodeA], nodes[e.nodeB]);
		edges.push(o);
	}

	return [Object.values(nodes), edges, view];
}
