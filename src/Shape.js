/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Container = PIXI.Container,
		Graphics = pixiflash.Graphics,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Shape
	 * @class Shape
	 * @extends PIXI.Container
	 */
	var Shape = function()
	{
		Container.call(this);
		DisplayObject.call(this);

		// Shapes have a graphic by default
		this.graphics = new Graphics();
		
		//keep track of the number of things using this as a mask so we can avoid adding/removing
		//it more than needed
		this._maskUses = 0;
	};

	// Extend PIXI.Sprite
	var s = Container.prototype;
	var p = Shape.prototype = Object.create(s);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Shape;

	// Assign to namespace
	pixiflash.Shape = Shape;
	
	/**
	 * The drawing graphics, these are necessary
	 * for the compability with EaselJS Flash exports.
	 * @property {pixiflash.Graphics} graphics
	 */
	Object.defineProperty(p, "graphics",
	{
		get: function()
		{
			return this._graphics;
		},
		set: function(graphics)
		{
			if (this._graphics)
			{
				this.removeChild(this._graphics);
			}
			this._graphics = graphics;
			if (graphics)
			{
				this.addChild(graphics);
			}
			this.emit('graphicsChanged', this);
		}
	});

	/**
	 * Override for the destroy
	 * @method  destroy
	 * @param  {Boolean} recursive If we should destroy the children of this shape
	 */
	p.destroy = function(recursive)
	{
		this.graphics = null;
		s.destroy.call(this, recursive);
	};

}());