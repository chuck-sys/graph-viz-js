const NODE_RADIUS = 50;

class Node {
	constructor(world, x, y) {
		this.m_body = Bodies.circle(x, y, NODE_RADIUS);
		this.m_selected = true;
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
			stroke('white');
		}

		push();
		scale(v.s);
		translate(pos.x + v.x, pos.y + v.y);
		circle(0, 0, NODE_RADIUS);

		if (this.m_data.name) {
			fill('white');
			noStroke();
			textAlign(CENTER, CENTER);
			text(this.m_data.name[0].toUpperCase(), 0, 0);
		}

		pop();
	}

	deselect() {
		this.m_selected = false;
	}

	select() {
		this.m_selected = true;
	}

	/**
	 * Return true if coordinate is within the body
	 */
	isCollide(mx, my) {
		const pos = this.m_body.position;
		return Math.pow(mx - pos.x, 2) + Math.pow(my - pos.y, 2) <= NODE_RADIUS * NODE_RADIUS
	}
}
