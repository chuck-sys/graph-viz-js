const INFOBOX_WIDTH = 22 * EM;
const INFOBOX_HEIGHT = 10.5 * EM;
const INFOBOX_ALPHA = 200;

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
		const attrs = this.node.otherAttrs();
		const keys = Object.keys(attrs);
		const i = Math.floor((mouseY - 2 * EM) / (1.5 * EM));
		const mouseInside = this.isHit(mouseX, mouseY);

		push();

		fill(20, INFOBOX_ALPHA);
		strokeWeight(1);
		stroke(255, 255, 255, INFOBOX_ALPHA);
		// Draw the infobox background
		rect(0, 0, INFOBOX_WIDTH, INFOBOX_HEIGHT);
		line(0, 2 * EM, 22 * EM, 2 * EM);

		// Draw the name
		textAlign(LEFT, TOP);
		const name = truncate(this.node.getName(), INFOBOX_WIDTH - EM);
		fill(255, 255, 255, INFOBOX_ALPHA);
		noStroke();
		textStyle(BOLD);
		text(name, 0.5 * EM, 0.5 * EM);

		// Populate attributes below, if any
		let baseY = 2 * EM;
		textStyle(NORMAL);
		for (const k of keys) {
			text(truncate('-' + k, 8 * EM), 0.5 * EM, 0.5 * EM + baseY);
			text(truncate(attrs[k], 12 * EM), 9 * EM, 0.5 * EM + baseY);

			if (mouseInside && i < keys.length && i >= 0) {
				noFill();
				fill(255, 255, 255, INFOBOX_ALPHA);
				noStroke();
			}
			baseY += 1.5 * EM;
		}

		if (mouseInside && i < keys.length && i >= 0) {
			// If we mouse over attributes, highlight the attribute and add
			// helpful text
			const y = 2 * EM + i * 1.5 * EM;
			noFill();
			stroke('red');
			rect(0, y, INFOBOX_WIDTH, 1.5 * EM);
			textAlign(LEFT, CENTER);
			fill('red');
			noStroke();
			text('remove attr [delete], edit attr [dblClick]', INFOBOX_WIDTH, y + 0.75 * EM);
		}
		if (mouseInside && i >= keys.length) {
			// If we mouse over the blank space below the attributes, highlight
			// the space and add helpful text
			const y = 2 * EM + 1.5 * EM * keys.length;
			const h = INFOBOX_HEIGHT - y;
			noFill();
			stroke('green');
			rect(0, y, INFOBOX_WIDTH, h);
			textAlign(CENTER, CENTER);
			fill('green');
			noStroke();
			text('add attribute', INFOBOX_WIDTH / 2, y + h / 2);
		}

		pop();
	}

	handleInput(key) {
		if (key === DELETE && this.isHit(mouseX, mouseY)) {
			const i = Math.floor((mouseY - 2 * EM) / (1.5 * EM));
			const attrs = this.node.otherAttrs();
			const keys = Object.keys(attrs);

			if (i < keys.length && i >= 0) {
				delete this.node.m_data[keys[i]];
			}

			return true;
		}

		return false;
	}

	handleDblClick(x, y, fn_inputBox, fn_cancel) {
		if (!this.isHit(x, y)) return;

		// Check name hit
		let box = null;
		if (y < 2 * EM) {
			box = new InputBox("Name", this.node.m_data.name, (s) => this.node.m_data.name = s, fn_cancel);
		} else {
			const i = Math.floor((y - 2 * EM) / (1.5 * EM));
			const attrs = this.node.otherAttrs();
			const keys = Object.keys(attrs);
			const vals = Object.values(attrs);
			if (i < keys.length) {
				// Check to see if we are changing the key or the value
				if (x < 9 * EM) {
					box = new InputBox("Change the key?", keys[i], (s) => {
						this.node.m_data[s] = vals[i];
						delete this.node.m_data[keys[i]];
					}, fn_cancel);
				} else {
					box = new InputBox(keys[i], vals[i], (s) => this.node.m_data[keys[i]] = s, fn_cancel);
				}
			} else {
				// Else, we add it as a new attribute
				box = new InputBox("Add new key", '???', (s) => this.node.m_data[s] = '', fn_cancel);
			}
		}
		fn_inputBox(box);
	}

	/**
	 * Return true if (x, y) is within the infobox.
	 */
	isHit(x, y) {
		return x < INFOBOX_WIDTH && y < INFOBOX_HEIGHT;
	}
}
