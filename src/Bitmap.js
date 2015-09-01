/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Sprite = PIXI.Sprite,
		DisplayObjectMixin = pixiflash.DisplayObjectMixin;
	
	/**
	 * The class to emulate createjs.Bitmap
	 * @class Bitmap
	 * @extends PIXI.Sprite
	 */
	var Bitmap = function(image)
	{
		Sprite.call(this, image);
		DisplayObjectMixin.call(this);
	};
	
	// Extend PIXI.Sprite
	var p = Bitmap.prototype = Object.create(Sprite.prototype);
	
	// Mixin the display object
	DisplayObjectMixin.mixin(p);
	
	//constructor for backwards compatibility
	p.initialize = Bitmap;
	
	// Assign to namespace
	pixiflash.Bitmap = Bitmap;
	
}());