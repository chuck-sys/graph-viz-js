/**
 * Cache system with a set number of maximum slots with LFU policy.
 */
class Cache {
	constructor(maxSlots) {
		this._m = new Map();
		this._max = maxSlots;
		this._nextRemove = null;
	}

	get(k) {
		if (!this.has(k)) return null;
		this._m.get(k).freq++;
		if (k === this._nextRemove) {
			// Find another _nextRemove if we can find one
			for (let [key, v] of this._m.entries()) {
				if (v.freq < this._m.get(this._nextRemove).freq) {
					this._nextRemove = key;
				}
			}
		}
		return this._m.get(k).data;
	}

	has(k) {
		return this._m.has(k);
	}

	set(k, v) {
		if (this._m.size >= this._max) {
			this._m.delete(this._nextRemove);
		}

		this._m.set(k, {freq: 1, data: v});
		this._nextRemove = k;
	}
}
