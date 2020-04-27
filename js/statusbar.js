class StatusBar {
	/**
	 * Constructor takes in an argument, which is the callback function that
	 * gets called whenever the state gets changed. Callback function takes a
	 * single argument, which is the state string.
	 */
	constructor(statecb) {
		this.status = "";
		this.state = "";
		this.statecb = statecb;
	}

	setState(s) {
		this.state = s;
		this.statecb(s);
	}

	/**
	 * Draw the status anchored at the bottom of the screen
	 */
	draw() {
	}
}
