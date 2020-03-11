const NODE_RADIUS = 20;

class Node {
	constructor(world, x, y) {
		this.m_body = Bodies.circle(x, y, NODE_RADIUS);
		this.m_selected = false;
		this.m_data = {};

		World.add(world, this.m_body);
	}

	/**
	 * Draw the node onto the screen.
	 * @param v The current viewing area (with offsets and scale)
	 */
	draw(v) {
		const pos = this.m_body.position;

		fill(20);
		strokeWeight(4);
		if (this.m_selected) {
			stroke('green');
		} else {
			stroke(50);
		}

		push();
		scale(v.s);
		translate(pos.x + v.x, pos.y + v.y);
		circle(0, 0, NODE_RADIUS);
		pop();
	}
}
