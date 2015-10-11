/**
 * @module Pixi Flash
 * @namespace window
 */
(function(PIXI)
{
	/**
	 * Prototype methods for Function
	 * @class Function
	 */
	/**
	 * Extend function (class) to another class
	 * @method extend
	 * @param {function} parent The parent class to inherit
	 * @return {function} Instance of class for chaining
	 */
	Function.prototype.extend = function(parent)
	{
		return PIXI.utils.extend(this, parent);
	};

}(PIXI));