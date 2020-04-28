/**
 * A visual box that simply displays some text. Allows the user to press any
 * key to get it out of their faces. Allows multi-line text via array textual
 * input.
 */
class MsgBox {
	constructor(lines, okcb) {
		this._lines = this.getTextWidths(lines);
		this._okcb = okcb;
	}

	draw() {
		// Darken everything
		fill(20, 200);
		noStroke();
		rect(0, 0, width, height);

		rectMode(CENTER);
		textAlign(CENTER, TOP);

		// padding: 1em
		const boxHeight = (this._lines.length * 1.5 + 2) * EM;
		fill(20);
		rect(width / 2, height / 2, this._maxWidthLine + 2 * EM, boxHeight);

		fill('white');
		textAlign(CENTER, BOTTOM);
		for (let i = 0; i < this._lines.length; ++i) {
			text(this._lines[i].t, width / 2, (height - boxHeight) / 2 + (i * 1.5 + 2) * EM);
		}

		textAlign(RIGHT, BOTTOM);
		fill(100);
		text('Press any key to continue', (width + this._maxWidthLine + 2 * EM) / 2, (height - boxHeight) / 2 + (this._lines.length * 1.5 + 2) * EM);

		rectMode(CORNER);
	}

	handleInput(key) {
		// We recognize all keys
		this._okcb();
	}

	/**
	 * Return a list of tuples, where the first element is the original line
	 * and the second element is the width of the line in pixels determined by
	 * p5js' textWidth function. Has the side effect of finding and storing the
	 * width of the line with the maximal width.
	 */
	getTextWidths(lines) {
		this._maxWidthLine = 0;
		
		return lines.map(l => {
			const w = textWidth(l);
			if (w > this._maxWidthLine) {
				this._maxWidthLine = w;
			}

			return {t: l, w: textWidth(l)};
		});
	}
}
