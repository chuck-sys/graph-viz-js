const TUTORIAL = {
	'add_node': [
		'Press "A" anywhere on the screen to add a node!',
		'Join them with an edge by clicking and dragging from one',
		'node to another.'
	],
	'scrolling': [
		'It looks like you have added quite a few edges.',
		'Click and drag to move the viewing space.',
		'Scroll up or down to zoom in or out.'
	],
	'delete_edge': [
		'Another way to delete an edge is similar to how you create them.',
		'Just click and drag a node with an existing edge to delete it!'
	]
};

/**
 * An object to keep track of the tutorials that a user has gone through. Takes
 * from the attribute `tutorial` from `localStorage`.
 */
class TutorialController {
	/**
	 * `msgokcb`: Triggered whenever the user tells the tutorial dialog box to
	 * go away. Should remove the dialog box from main cleanly. Has no
	 * arguments.
	 * `installmsg`: Triggered whenever we want a tutorial to occur. Takes 1
	 * argument, which is the dialog box we use for the tutorial. It should
	 * instate said dialog box into main so that it's drawn correctly.
	 */
	constructor(msgokcb, installmsg) {
		this._msgokcb = msgokcb;
		this._install = installmsg;

		this.populate();
	}

	/**
	 * Triggers a tutorial of a given type. Does not trigger if the user has
	 * triggered one before. Immediately saves to `localStorage`. Uses an
	 * in-memory representation of `localStorage` to check if the user has
	 * triggered one before, so modifying `localStorage` must be accompanied by
	 * reloading the page for things to take into effect.
	 */
	trigger(name) {
		if (this.hasBeenTriggered(name)) {
			return;
		}

		this._install(new MsgBox(TUTORIAL[name], this._msgokcb));

		this.bypass(name);
	}

	/**
	 * Finishes a tutorial without calling one. Useful if you know the user
	 * already knows how to do the things that are in a specific tutorial
	 * before a tutorial has begun.
	 */
	bypass(name) {
		this._d.set(name, true);
		this.saveState();
	}

	/**
	 * Populates in-memory representation of `localStorage`. The thing should
	 * be JSON, with the key being the trigger name (for ease of translation)
	 * and the value a boolean being if the tutorial has been triggered before.
	 */
	populate() {
		this._d = new Map();
		

		const d = JSON.parse(localStorage.getItem('tutorial') || '{}');
		for (const k of Object.keys(d)) {
			this._d.set(k, d[k]);
		}
	}

	/**
	 * Checks to see if a tutorial has been triggered, returning true if it has
	 * been triggered before, and false otherwise. If said tutorial is not
	 * found, we return true and save the entire object to localStorage. We
	 * also add the new tutorial entry to the representation.
	 *
	 * Can also be used outside of this class to check if we have actually
	 * triggered something, just to bypass it if needed.
	 */
	hasBeenTriggered(name) {
		if (this._d.has(name)) {
			return this._d.get(name);
		} else {
			// This function doesn't trigger it directly, so we still set it to
			// false, and not true.
			this._d.set(name, false);

			this.saveState();

			return false;
		}
	}

	/**
	 * Saves the representation to localStorage.
	 */
	saveState() {
		let d = {};
		for (const [k, v] of this._d) {
			d[k] = v;
		}

		localStorage.setItem('tutorial', JSON.stringify(d));
	}
}
