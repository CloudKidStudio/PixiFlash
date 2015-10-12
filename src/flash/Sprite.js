/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseSprite = PIXI.Sprite;
	var DisplayObject = PIXI.flash.DisplayObject;

	/**
	 * The class to emulate createjs.Sprite
	 * @class Sprite
	 * @extends PIXI.Sprite
	 * @param {PIXI.Texture} texture The texture to assign to Sprite
	 */
	var Sprite = PIXI.flash.Sprite = function(texture)
	{
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