(function(PIXI)
{
	// Import classes
	var Graphics = PIXI.flash.Graphics;

	/**
	 * Convenience wrapper for Mask graphics
	 * @class Mask
	 * @constructor
	 * @param {Number} x The x position
	 * @param {Number} y The y position
	 * @param {String} path Encoded path for shape
	 */
	var Mask = function(x, y, path)
	{
		Graphics.call(this);
		this.renderable = false;
		this.p(path).tr(x, y);
	};

	// Extends base graphics
	Graphics.extend(Mask);

	// Assign to namespace
	PIXI.flash.Mask = Mask;

}(PIXI));