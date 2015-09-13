/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiGraphics = PIXI.Graphics,
		Graphics = pixiflash.Graphics,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Shape
	 * @class Shape
	 * @extends PIXI.Graphics
	 */
	var Shape = function()
	{
		PixiGraphics.call(this);
		DisplayObject.call(this);

		/**
		 * The drawing graphics
		 * @property {pixiflash.Graphics} graphics
		 */
		this.graphics = new Graphics(this);
	};

	// Extend PIXI.Sprite
	var p = Shape.prototype = Object.create(PixiGraphics.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards compatibility
	p.initialize = Shape;

	// Assign to namespace
	pixiflash.Shape = Shape;

}());