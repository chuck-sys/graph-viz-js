function screenToWorldCoords(mx, my, v) {
	return [
		(mx - width / 2) / v.s - v.x,
		(my - height / 2) / v.s - v.y
	];
}

var truncCache = new Cache(20);
/**
 * Truncate a string to fit within a certain pixel width. Returns either the
 * original string if no truncation is needed, or a truncated string suffixed
 * with '...' to indicate truncation.
 *
 * Caches past results in a custom cache.
 */
function truncate(str, w) {
	const startW = textWidth(str);
	if (startW <= w) return str;
	if (truncCache.has([str, w].toString())) return truncCache.get([str, w].toString());

	let i = 1;
	let trunc = str.slice(0, -i) + '...';
	while (textWidth(trunc) > w && trunc !== '...') {
		trunc = str.slice(0, -i - 1) + '...';
		++i;
	}
	truncCache.set([str, w].toString(), trunc);
	return trunc;
}

/**
 * Have a user download a file using link href. A bit hacky but what can you do
 * if you don't have a server?
 */
function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

/**
 * Read a file and when we read finish reading it, call the callback function
 * with the contents of the file.
 */
function readFile(file, cb) {
	const reader = new FileReader();
	reader.readAsText(file, 'UTF-8');

	reader.onload = evt => {
		const content = evt.target.result;
		cb(content);
	};
}
