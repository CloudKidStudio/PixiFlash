/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiCMFilter = PIXI.filters.ColorMatrixFilter;

	/**
	 * The class to emulate some of the functionality of createjs.ColorFilter (multiplicative values only -Advanced Color option in Flash)
	 * (acts only as a container for multiplicative values, to be  used by DisplayObject)
	 * @class ColorFilter
	 * @param {Number} r red multiplier
	 * @param {Number} g green multiplier
	 * @param {Number} b blue multiplier
	 * @param {Number} a alpha multiplier
	 * @param {Number} rO red offset, 0-255
	 * @param {Number} gO green offset, 0-255
	 * @param {Number} bO blue offset, 0-255
	 * @param {Number} aO alpha offset, 0-255
	 */
	var ColorFilter = function(r, g, b, a, rO, gO, bO, aO)
	{
		if(r < 0)
			r = 0;
		if(g < 0)
			g = 0;
		if(b < 0)
			b = 0;

		if(!rO && !gO && !bO)
		{
			var max = 255;
			this.isTintOnly = true;
			this.tint = (Math.round(r * max) << 16) | (Math.round(g * max) << 8) | Math.round(b * max);
		}
		else
		{
			PixiCMFilter.call(this);
			this.isTintOnly = false;
			this.uniforms.m.value = [r, 0, 0, 0, rO / 255,
									0, g, 0, 0, gO / 255,
									0, 0, b, 0, bO / 255,
									0, 0, 0, a, aO / 255];
		}
	};

	var s = PixiCMFilter.prototype;
	var p = ColorFilter.prototype = Object.create(s);

	pixiflash.ColorFilter = ColorFilter;

}());