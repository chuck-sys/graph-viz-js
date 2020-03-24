const INFOBOX_WIDTH = 22 * EM;
const INFOBOX_HEIGHT = 10.5 * EM;

/**
 * This element is used for displaying only and does not need any physics
 * attached. It only needs the node it is attached on.
 */
class NodeInfobox {
	constructor(node) {
		this.node = node;
	}

	draw(v) {
		const nodepos = this.node.m_body.position;

		push();
		scale(v.s);
		translate(nodepos.x + v.x, nodepos.y + v.y);		// Normalize to node
		translate(NODE_RADIUS, -NODE_RADIUS - INFOBOX_HEIGHT);	// Go to LH corner of display

		fill(20);
		strokeWeight(1);
		stroke('white');
		rect(0, 0, INFOBOX_WIDTH, INFOBOX_HEIGHT);
		line(0, 2 * EM, 22 * EM, 2 * EM);

		// Draw the name
		textAlign(LEFT, TOP);
		const name = truncate(this.node.getName(), INFOBOX_WIDTH - EM);
		fill('white');
		noStroke();
		textStyle(BOLD);
		text(name, 0.5 * EM, 0.5 * EM);

		// Populate attributes below, if any
		const attrs = this.node.otherAttrs();
		let baseY = 2 * EM;
		textStyle(NORMAL);
		for (const k of Object.keys(attrs)) {
			text(truncate('-' + k, 8 * EM), 0.5 * EM, 0.5 * EM + baseY);
			text(truncate(attrs[k], 12 * EM), 9 * EM, 0.5 * EM + baseY);
			baseY += 1.5 * EM;
		}

		pop();
	}
}