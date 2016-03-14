/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	/**
	 * A class that stores values output by Flash for the actual color matrix filter.
	 * @class ColorMatrix
	 * @param {Number} brightness Amount to adjust brightness by, as a value to add from -255 to 255
	 * @param {Number} contrast Amount to adjust contrast by, as a % from -100 to 100
	 * @param {Number} saturation Amount to adjust saturation by, as a % from -100 to 100
	 * @param {Number} hue Amount to adjust hue by, as a degree from -180 to 180
	 */
	var ColorMatrix = function(brightness, contrast, saturation, hue)
	{
		this.brightness = brightness || 0;
		this.contrast = contrast || 0;
		this.saturation = saturation || 0;
		this.hue = hue || 0;
	};
	
	pixiflash.ColorMatrix = ColorMatrix;
	
}());