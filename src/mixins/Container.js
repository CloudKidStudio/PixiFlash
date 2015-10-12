/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var p = PIXI.Container.prototype;

	/**
	 * Add multiple children
	 * @method addChildren
	 * @param {*} [child*] N-number of children
	 * @return {Container} Instance of this container
	 */
	/**
	 * Add multiple children, shortcut for addChildren
	 * @method ac
	 * @param {*} [child*] N-number of children
	 * @return {Container} Instance of this container
	 */
	p.addChildren = p.ac = function(child)
	{
		for (var i = 0; i < arguments.length; i++)
		{
			this.addChild(arguments[i]);
		}
		return this;
	};

	// Assign to namespace
	PIXI.flash.Container = PIXI.Container;

}(PIXI));