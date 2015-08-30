/**
 * @module Pixi Flash
 * @namespace pixiflash
 * @requires Core, Pixi Display
 */
(function(undefined)
{
	var Sprite = PIXI.Sprite,
		DisplayObjectMixin = pixiflash.DisplayObjectMixin;
	
	var Bitmap = function(image)
	{
		Sprite.call(this, image);
		DisplayObjectMixin.call(this);
	};
	
	var p = extend(Bitmap, Sprite);
	
	DisplayObjectMixin.mixin(p);
	
	//constructor for backwards compatibility
	p.initialize = Bitmap;
	
	pixiflash.Bitmap = Bitmap;
	
}());