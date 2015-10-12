/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseSprite = PIXI.Sprite;
	var Texture = PIXI.Texture;
	var DisplayObject = PIXI.flash.DisplayObject;

	/**
	 * The class to emulate createjs.Sprite
	 * @class Sprite
	 * @extends PIXI.Sprite
	 * @param {PIXI.Texture|String} texture The texture to assign to Sprite
	 */
	var Sprite = PIXI.flash.Sprite = function(texture)
	{
		if (typeof texture == "string")
		{
			texture = Texture.fromFrame(texture);
		}
		BaseSprite.call(this, texture);
		DisplayObject.call(this);
	};

	// Extend PIXI.Sprite
	var p = BaseSprite.extend(Sprite).prototype;

	// Mixin the display object
	DisplayObject.mixin(p);

	// Assign to namespace
	PIXI.flash.Sprite = Sprite;

}(PIXI));