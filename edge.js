class Edge {
	constructor(world, body1, body2) {
		this.m_b1 = body1.m_body;
		this.m_b2 = body2.m_body;
		let config = {
			bodyA: this.m_b1,
			bodyB: this.m_b2
		};
		this.m_constraint = Constraint.create(config);

		World.addConstraint(world, this.m_constraint);
	}

	draw(v) {
		push();
		scale(v.s);
		translate(v.x, v.y);
		stroke('white');
		strokeWeight(3);
		line(this.m_b1.position.x,
			this.m_b1.position.y,
			this.m_b2.position.x,
			this.m_b2.position.y);
		pop();
	}
}
