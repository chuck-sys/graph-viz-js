/**
 * A visual input box to gain user input. Allows the user to enter in a value.
 * Has a callback function that gets called when the user is done with it.
 */
class InputBox {
	constructor(prmpt, hint, okcb, cancelcb) {
		this._input = "";
		this._focus = true;
		this._prmpt = prmpt + " ( " + hint + " )";
		this._okcb = okcb;
		this._badcb = cancelcb;
	}

	/**
	 * Called every frame you draw the box
	 */
	draw() {
		// Darken everything
		fill(20, 200);
		noStroke();
		rect(0, 0, width, height);

		rectMode(CENTER);
		textAlign(RIGHT, TOP)

		fill(20);
		rect(width / 2, height / 2, INFOBOX_WIDTH, 3.5 * EM);
		fill('white');
		textAlign(RIGHT, BOTTOM);
		text(this._prmpt, width / 2, height / 2);
		textAlign(CENTER, TOP);
		text(this._input, width / 2, height / 2);

		rectMode(CORNER);
	}

	/**
	 * Called every frame you obtain input. Takes the events themselves as
	 * input. We use this to see where the user clicks (if they focus on the
	 * textbox or not). The enter key is pressed to submit everything, the
	 * escape key is to cancel everything.
	 */
	handleInput(key) {
		if (key === ESCAPE) {
			this._badcb();
		} else if (key === ENTER) {
			this._okcb(this._input);
			this._badcb();				// Close everything afterwards
		} else if (key === BACKSPACE) {
			this._input = this._input.substring(0, this._input.length - 1);
		} else if (key >= 0x20) {
			if (key >= 65 && key <= 90 && !keyIsDown(SHIFT)) {
				// If you didn't press shift, turn it to lowercase
				this._input += String.fromCharCode(key).toLowerCase();
			} else {
				this._input += String.fromCharCode(key);
			}
		}

		// We don't recognize any other keys
	}
}
