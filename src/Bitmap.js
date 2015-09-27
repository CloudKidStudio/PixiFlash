/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Sprite = PIXI.Sprite,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Bitmap
	 * @class Bitmap
	 * @extends PIXI.Sprite
	 */
	var Bitmap = function(image)
	{
		Sprite.call(this, image);
		DisplayObject.call(this);
	};
	
	// Extend PIXI.Sprite
	var p = Bitmap.prototype = Object.create(Sprite.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Bitmap;
	
	// Assign to namespace
	pixiflash.Bitmap = Bitmap;
	
}());