function screenToWorldCoords(mx, my, v) {
	return [
		(mx - width / 2) / v.s - v.x,
		(my - height / 2) / v.s - v.y
	];
}

/**
 * Truncate a string to fit within a certain pixel width. Returns either the
 * original string if no truncation is needed, or a truncated string suffixed
 * with '...' to indicate truncation.
 */
function truncate(str, w) {
	const startW = textWidth(str);
	if (startW <= w) return str;

	let i = 1;
	let trunc = str.slice(0, -i) + '...';
	while (textWidth(trunc) > w && trunc !== '...') {
		trunc = str.slice(0, -i - 1) + '...';
		console.log(trunc);
		++i;
	}
	return trunc;
}
