/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiBlur = PIXI.filters.BlurFilter;
	/**
	 * The class to translate the functionality of createjs.BlurFilter to PIXI.filters.BlurFilter.
	 * This will only function in WebGL.
	 * @class BlurFilter
	 * @param {Number} blurX Pixels of blur in the x direction.
	 * @param {Number} blurY Pixels of blur in the y direction.
	 * @param {Number} passes Number of passes to make - more passes is higher quality.
	 */
	var BlurFilter = function(blurX, blurY, passes)
	{
		PixiBlur.call(this);
		this.blurX = blurX;
		this.blurY = blurY;
		this.passes = passes;
		this.padding = Math.max(Math.abs(blurX), Math.abs(blurY)) * 0.5;
	};
	
	var s = PixiBlur.prototype;
	var p = BlurFilter.prototype = Object.create(s);
	
	pixiflash.BlurFilter = BlurFilter;
	
}());