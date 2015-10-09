/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	// Import classes
	var utils = pixiflash.utils;

	/**
	 * The class to emulate createjs.Shadow
	 * @class Shadow
	 */
	var Shadow = function(color, x, y, blur)
	{
		this.color = color;
		// CreateJS export doesn't support these properties
		// this.angle = Math.atan(y / x);
		// this.distance = Math.sqrt(x * x + y * y);
		// this.blur = blur;
	};
	
	// Extend PIXI.Sprite
	var p = Shadow.prototype;
	
	// Assign to namespace
	pixiflash.Shadow = Shadow;
	
}());