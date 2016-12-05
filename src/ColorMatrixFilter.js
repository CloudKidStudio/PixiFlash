/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiCMFilter = PIXI.filters.ColorMatrixFilter;

	/**
	 * The class to emulate some the functionality of the AdjustColor filter in Flash. This is a
	 * modified version of PIXI.filters.ColorMatrixFilter, with the same fragment shader as
	 * pixiflash.ColorFilter and a constructor to automatically apply the parameters from the
	 * ColorMatrix input.
	 * @class ColorMatrixFilter
	 * @param {pixiflash.ColorMatrix} colorData The ColorMatrix object containing color settings.
	 */
	var ColorMatrixFilter = function(colorData)
	{
		PixiCMFilter.call(this);

		//values are handled in a specific order: hue, contrast, brightness, saturation
		if(colorData.hue !== 0)
		{
			this.hue(colorData.hue, true);
		}
		if(colorData.contrast !== 0)
		{
			this.contrast(colorData.contrast / 100, true);
		}
		//while PIXI.filters.ColorMatrixFilter has a brightness function, this is how
		//EaselJS and Flash handle it, instead of being a straight multiplier
		if(colorData.brightness !== 0)
		{
			var b = colorData.brightness / 255;
			var matrix =   [1, 0, 0, 0, b,
							0, 1, 0, 0, b,
							0, 0, 1, 0, b,
							0, 0, 0, 1, 0];
			this._loadMatrix(matrix, true);
		}
		if(colorData.saturation !== 0)
		{
			this.saturate(colorData.saturation / 100, true);
		}
	};

	var s = PixiCMFilter.prototype;
	var p = ColorMatrixFilter.prototype = Object.create(s);

	pixiflash.ColorMatrixFilter = ColorMatrixFilter;

}());