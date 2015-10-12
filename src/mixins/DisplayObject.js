/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI)
{
	var p = PIXI.DisplayObject.prototype;

	/**
	 * Short-hand method for setTransform
	 * @method tr
	 * @param {Number} x The X position
	 * @param {Number} y The Y position
	 * @param {Number} scaleX The X Scale value
	 * @param {Number} scaleY The Y Scale value
	 * @param {Number} skewX The X skew value
	 * @param {Number} skewY The Y skew value
	 * @param {Number} pivotX The X pivot value
	 * @param {Number} pivotY The Y pivot value
	 * @return {PIXI.DisplayObject} Instance for chaining
	 */
	p.tr = p.setTransform;

	/**
	 * Short-hand for setMask method
	 * @method ma
	 * @param {PIXI.Graphics} mask The mask shape to use
	 * @return {PIXI.DisplayObject} Instance for chaining
	 */
	p.setMask = p.ma = function(mask)
	{
		this.mask = mask;
		return this;
	};

	/**
	 * Set the tint values by RGB
	 * @method setTint
	 * @param {Number} r The red percentage value
	 * @param {Number} g The green percentage value
	 * @param {Number} b The blue percentage value
	 * @return {DisplayObject} Object for chaining
	 */
	/**
	 * Shortcut method for setTint
	 * @method tn
	 * @param {Number} ting The red percentage value
	 * @return {DisplayObject} Object for chaining
	 */
	p.setTint = p.tn = function(tint)
	{
		this.tint = tint;
		return this;
	};

}(PIXI));