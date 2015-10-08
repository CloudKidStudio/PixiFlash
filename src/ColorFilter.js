/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	
	/**
	 * The class to emulate some of the functionality of createjs.ColorFilter (multiplicative values only -Advanced Color option in Flash)
	 * (acts only as a container for multiplicative values, to be  used by DisplayObject)
	 * @class ColorFilter
	 * @param {Number} r red multiplier
	 * @param {Number} g green multiplier
	 * @param {Number} b blue multiplier
	 */
	var ColorFilter = function(r, g, b)
	{
		if(r < 0)
			r = 0;
		if(g < 0)
			g = 0;
		if(b < 0)
			b = 0;
		
		var max = 255;
		this.tint = (Math.round(r * max) << 16) | (Math.round(g * max) << 8) | Math.round(b * max);
	};
	
	
	pixiflash.ColorFilter = ColorFilter;
	
}());