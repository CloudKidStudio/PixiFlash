/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseContainer = PIXI.Container;
	var DisplayObject = PIXI.flash.DisplayObject;
	var SharedTicker = PIXI.ticker.shared;

	/**
	 * The class to emulate createjs.Container
	 * @class Container
	 * @extends PIXI.Container
	 */
	var Container = function()
	{
		BaseContainer.call(this);
		DisplayObject.call(this);

		/**
		 * If false, the tick will not be propagated to children of this Container. 
		 * This can provide some performance benefits. In addition to preventing 
		 * the "tick" event from being dispatched, it will also prevent tick related 
		 * updates on some display objects (ex. Sprite & MovieClip frame advancing, 
		 * DOMElement visibility handling).
		 * @property {Boolean} tickChildren
		 * @default true
		 **/
		this.tickChildren = true;

		// add a listener for the first time the object is added, to get around
		// using new instances for prototypes that the CreateJS exporting does.
		this.once("added", function()
			{
				this._tickListener = this._tickListener.bind(this);
				this._onAdded();
				this._onAdded = this._onAdded.bind(this);
				this._onRemoved = this._onRemoved.bind(this);
				this.on("added", this._onAdded);
				this.on("removed", this._onRemoved);
			}
			.bind(this));
	};

	// Extend the base container
	var p = BaseContainer.extend(Container).prototype;

	// Mixin display object properties to the prototype
	DisplayObject.mixin(p);

	/**
	 * Add multiple children
	 * @method addChildren
	 * @param {*} [child*] N-number of children
	 * @return {Container} Instance of this container
	 */
	/**
	 * Shortcut method for addChildren
	 * @method ad
	 * @param {*} [child*] N-number of children
	 * @return {Container} Instance of this container
	 */
	p.addChildren = p.ad = function(child)
	{
		var addChild = this.__parent.addChild.bind(this);
		for (var i = 0; i < arguments.length; i++)
		{
			addChild(arguments[i]);
		}
		return this;
	};

	/**
	 * When this container is added to a display list
	 * @method _onAdded
	 * @private
	 */
	p._onAdded = function()
	{
		if (!this.parent._isPixiFlash)
		{
			SharedTicker.add(this._tickListener);
		}
	};


	/**
	 * The update tick
	 * @method _tickListener
	 * @param {int} tickerDeltaTime Time in seconds since last update
	 */
	p._tickListener = function(tickerDeltaTime)
	{
		var ms = tickerDeltaTime / SharedTicker.speed / PIXI.TARGET_FPMS;
		this._tick(ms);
	};

	/**
	 * When this container is removed from a display list
	 * @method _onRemoved
	 * @private
	 */
	p._onRemoved = function()
	{
		if (this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
		}
	};

	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in milliseconds.
	 * @protected
	 **/
	p._tick = p.Container__tick = function(delta)
	{
		if (this.tickChildren)
		{
			for (var i = this.children.length - 1; i >= 0; i--)
			{
				var child = this.children[i];
				if (child.tickEnabled && child._tick)
				{
					child._tick(delta);
				}
				else if (child.tickChildren && child.Container__tick)
				{
					child.Container__tick(delta);
				}
			}
		}
	};

	/**
	 * Override the destroy method of container
	 * @method destroy
	 * @param {Boolean} [destroyChildren=false] Recursively destory children
	 */
	p.destroy = function(destroyChildren)
	{
		if (this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}
		this.__parent.destroy.call(this, destroyChildren);
	};

	// Assign to namespace
	PIXI.flash.Container = Container;

}(PIXI));