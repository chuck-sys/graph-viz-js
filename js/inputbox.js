/**
 * A visual input box to gain user input. Allows the user to enter in a value.
 * Has a callback function that gets called when the user is done with it.
 */
class InputBox {
	constructor(prmpt, okcb, cancelcb) {
		this._input = "";
		this._focus = true;
		this._prmpt = prmpt;
		this._okcb = okcb;
		this._badcb = cancelcb;
	}

	/**
	 * Called every frame you draw the box
	 */
	draw() {
	}

	/**
	 * Called every frame you obtain input. Takes the events themselves as
	 * input. We use this to see where the user clicks (if they focus on the
	 * textbox or not). The enter key is pressed to submit everything, the
	 * escape key is to cancel everything.
	 */
	handleInput(key) {
	}
}
