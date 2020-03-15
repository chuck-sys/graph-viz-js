function screenToWorldCoords(mx, my, v) {
	return [
		(mx - WIDTH / 2) / v.s - v.x,
		(my - HEIGHT / 2) / v.s - v.y
	];
}
