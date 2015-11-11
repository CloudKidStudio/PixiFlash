/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI)
{
	// Import libraries
	var Tween = PIXI.flash.Tween;

	// constructor
	/**
	 * The Timeline class represents a
	 * @class Timeline
	 * @param {DisplayObject} Target The target for this string of tweens.
	 * @extends Array
	 * @constructor
	 **/
	function Timeline(target)
	{
		Array.call(this);

		// public properties:
		/**
		 * The target DisplayObject.
		 * @property target
		 * @type DisplayObject
		 **/
		this.target = target;

		/**
		 * Current properties in the tween, to make building the timeline more
		 * efficient.
		 * @property _currentProps
		 * @type Object
		 * @private
		 **/
		this._currentProps = {};
	}

	var p = Timeline.prototype = Object.create(Array.prototype);

	// public methods:
	/**
	 * Adds one or more tweens (or timelines) to this timeline. The tweens will be paused (to remove them from the normal ticking system)
	 * and managed by this timeline. Adding a tween to multiple timelines will result in unexpected behaviour.
	 * @method addTween
	 * @param tween The tween(s) to add. Accepts multiple arguments.
	 * @return Tween The first tween that was passed in.
	 **/
	p.addTween = function(instance, properties, startFrame, duration, ease)
	{
		var startProps = {};
		var prop;
		//figure out what the starting values for this tween should be
		for(prop in properties)
		{
			if(this._currentProps.hasOwnProperty(prop))
				startProps[prop] = this._currentProps[prop];
			else
				startProps[prop] = getPropFromShorthand(instance, prop);
		}
		//create the new Tween
		this.push(new Tween(instance, startProps, properties, startFrame, duration, ease));
		//update starting values for the next tween
		for(prop in properties)
		{
			this._currentProps[prop] = properties[prop];
		}
	};
	
	function getPropFromShorthand(target, prop)
	{
		switch(prop)
		{
			case "x":
				return target.position.x;
			case "y":
				return target.position.y;
			case "sx":
				return target.scale.x;
			case "sy":
				return target.scale.y;
			case "kx":
				return target.skew.x;
			case "ky":
				return target.skew.y;
			case "r":
				return target.rotation;
			case "a":
				return target.alpha;
			case "t":
				return target.tint;
			case "v"://visibility isn't actually tweened anyway
				return target.visible;
			case "m"://mask isn't actually tweened anyway
				return target.mask;
			//g: null,//not sure if we'll actually handle graphics this way?
			case "p"://playback mode/frame isn't tweened, so we won't return anything
				return null;
		}
	}

	// Assign to namespace
	PIXI.flash.Timeline = Timeline;

}(PIXI));