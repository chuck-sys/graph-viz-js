class StatusBar {
	/**
	 * Constructor takes in an argument, which is the callback function that
	 * gets called whenever the state gets changed. Callback function takes a
	 * single argument, which is the state string.
	 */
	constructor(statecb, state) {
		this.status = "";
		this.state = state;
		this.statecb = statecb;
	}

	setState(s) {
		this.state = s;
		this.statecb(s);
	}

	setStatus(s) {
		this.status = s;
	}

	/**
	 * Draw the status anchored at the bottom of the screen
	 */
	draw() {
		// Draw a divider
		stroke('white');
		line(0, height - 2 * EM, width, height - 2 * EM);
		// Draw the state [STATE]
		textAlign(LEFT, TOP);
		noStroke();
		fill('white');
		text('State: ' + this.state.toUpperCase(), 0.5 * EM, height - 1.5 * EM);

		// Draw the status with padding
		text(this.status, 15.5 * EM, height - 1.5 * EM);
	}
}
