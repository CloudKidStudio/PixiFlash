/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiContainer = PIXI.Container,
		DisplayObject = pixiflash.DisplayObject,
		SharedTicker = PIXI.ticker.shared;

	/**
	 * The class to emulate createjs.Container
	 * @class Container
	 * @extends PIXI.Container
	 */
	var Container = function()
	{
		PixiContainer.call(this);
		DisplayObject.call(this);

		/**
		 * If false, the tick will not be propagated to children of this Container. This can provide some performance benefits.
		 * In addition to preventing the "tick" event from being dispatched, it will also prevent tick related updates
		 * on some display objects (ex. Sprite & MovieClip frame advancing, DOMElement visibility handling).
		 * @property tickChildren
		 * @type Boolean
		 * @default true
		 **/
		this.tickChildren = true;

		//add a listener for the first time the object is added, to get around
		//using new instances for prototypes that the CreateJS exporting does.
		this.once("added", function()
		{
			this._tickListener = this._tickListener.bind(this);
			this._onAdded();
			this._onAdded = this._onAdded.bind(this);
			this._onRemoved = this._onRemoved.bind(this);
			this.on("added", this._onAdded);
			this.on("removed", this._onRemoved);
		}.bind(this));
	};

	var s = PixiContainer.prototype;
	var p = Container.prototype = Object.create(s);

	DisplayObject.mixin(p);

	//constructor for backwards/Flash exporting compatibility
	p.initialize = Container;

	p.__Container_addChild = p.addChild;
	p.addChild = function(child)
	{
		for(var i = 0; i < arguments.length; i++)
		{
			this.__Container_addChild(arguments[i]);
		}
	};

	p._onAdded = function()
	{
		if(!this.parent._isPixiFlash)
		{
			SharedTicker.add(this._tickListener);
		}
	};

	p._tickListener = function(tickerDeltaTime)
	{
		var ms = tickerDeltaTime / SharedTicker.speed / PIXI.TARGET_FPMS;
		this._tick(ms);
	};

	p._onRemoved = function()
	{
		if(this._tickListener)
			SharedTicker.remove(this._tickListener);
	};

	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in milliseconds.
	 * @protected
	 **/
	p._tick = p.Container__tick = function(delta) {
		if (this.tickChildren) {
			for (var i=this.children.length-1; i>=0; i--) {
				var child = this.children[i];
				if (child.tickEnabled && child._tick) { child._tick(delta); }
				else if(child.tickChildren && child.Container__tick)
				{
					child.Container__tick(delta);
				}
			}
		}
	};

	p.__Container_destroy = p.destroy;
	p.destroy = function(destroyParams)
	{
		if(this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}

		this.__Container_destroy(destroyParams);
	};

	pixiflash.Container = Container;

}());