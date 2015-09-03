/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiSprite = PIXI.Sprite,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Bitmap
	 * @class Sprite
	 * @extends PIXI.Sprite
	 */
	var Sprite = function()
	{
		PixiSprite.call(this);
		DisplayObject.call(this);

		/**
		 * The spritesheet to use
		 * @property {pixiflash.SpriteSheet} spriteSheet
		 */
		this.spriteSheet = null;
	};
	
	// Extend PIXI.Sprite
	var p = Sprite.prototype = Object.create(PixiSprite.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards compatibility
	p.initialize = Sprite;

	/**
	 * Goto and stop on a frame
	 * @method gotoAndStop
	 * @param {int} frame The frame index
	 */
	p.gotoAndStop = function(frame)
	{
		//Due to the way Flash exports Sprites, we need to initialize each instance on the first
		//use here.
		if(!this._initialized)
		{
			var spriteSheet = this.spriteSheet;
			this.initialize();
			this.spriteSheet = spriteSheet;
			this._initialized = true;
		}
		if (!this.spriteSheet)
		{
			throw "Sprite doesn't have a spriteSheet";
		}
		this.texture = this.spriteSheet.getFrame(frame);
	};
	
	// Assign to namespace
	pixiflash.Sprite = Sprite;
	
}());