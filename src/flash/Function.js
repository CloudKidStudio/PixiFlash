/**
 * @module Pixi Flash
 * @namespace window
 */
(function()
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
		this.prototype = Object.create(parent.prototype);
		this.prototype.__parent = parent.prototype;
		return this;
	};

}());