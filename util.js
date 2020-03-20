function screenToWorldCoords(mx, my, v) {
	return [
		(mx - width / 2) / v.s - v.x,
		(my - height / 2) / v.s - v.y
	];
}
