/*! Pixi Flash 0.2.5 */
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(window)
{
	if (!window.PIXI)
	{
		if (true)
		{
			throw "Pixi Flash requires PIXI to be loaded before Pixi Flash is loaded!";
		}
		else
		{
			throw "Requires PIXI";
		}
	}

	// Define PIXI Flash namespace
	window.PIXI.flash = {};

}(window));
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
		this.prototype.constructor = this;
		return this;
	};

}());
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI)
{
	// Include classes
	var Point = PIXI.Point;

	/**
	 * Root display object
	 * @class DisplayObject
	 */
	var DisplayObject = function()
	{
		/**
		 * Mark these objects so that we can recognize them internally
		 * @property {Boolean} _isPixiFlash
		 */
		this._isPixiFlash = true;

		/**
		 * X and Y skew of the display object, with values in radians.
		 * @property {PIXI.Point} skew
		 */
		this.skew = new Point();

		/**
		 * Rotation of the display object, with values in radians.
		 * @property {Number} _rotation
		 * @private
		 */
		this._rotation = 0;

		// Transform matrix properties
		this._srB = 0;
		this._srC = 0;
		this._crA = 1;
		this._crD = 1;

		/**
		 * Cached Y Rotation
		 * @property {Number} _cachedRotY
		 * @private
		 */
		this._cachedRotY = 0;

		/**
		 * Cached X Rotation
		 * @property {Number} _cachedRotX
		 * @private
		 */
		this._cachedRotX = 0;

		/**
		 * The last computed tint value
		 * @property {Uint} _lastComputedTint
		 * @private
		 * @default 0xFFFFFF
		 */
		this._lastComputedTint = 0xFFFFFF;

		/**
		 * The last self tint value
		 * @property {Uint} _lastSelfTint
		 * @private
		 * @default 0xFFFFFF
		 */
		this._lastSelfTint = 0xFFFFFF;

		/**
		 * The last parent tint value
		 * @property {Uint} _lastParentTint
		 * @private
		 * @default 0xFFFFFF
		 */
		this._lastParentTint = 0xFFFFFF;

		/**
		 * The current self tint value
		 * @property {Uint} _tint
		 * @private
		 * @default 0xFFFFFF
		 */
		this._tint = 0xFFFFFF;
	};

	// Reference to prototype
	var p = DisplayObject.prototype;

	/**
	 * Double Pi
	 * @property {Number} PI_2
	 * @static
	 * @private
	 * @final
	 */
	var PI_2 = Math.PI * 2;

	/**
	 * Convert degrees to radian
	 * @property {Number} DEG_TO_RAD
	 * @static
	 * @private
	 * @final
	 */
	var DEG_TO_RAD = Math.PI / 180;

	/**
	 * Convert radians to degrees
	 * @property {Number} RAD_TO_DEG
	 * @static
	 * @private
	 * @final
	 */
	var RAD_TO_DEG = 180 / Math.PI;

	/**
	 * Short method to initial set transforms
	 * @method setTransform
	 * @param {Number} x The X position
	 * @param {Number} y The Y position
	 * @param {Number} scaleX The X Scale value
	 * @param {Number} scaleY The Y Scale value
	 * @param {Number} skewX The X skew value
	 * @param {Number} skewY The Y skew value
	 * @param {Number} pivotX The X pivot value
	 * @param {Number} pivotY The Y pivot value
	 * @return {PIXI.flash.DisplayObject} Instance for chaining
	 */
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
	 * @return {PIXI.flash.DisplayObject} Instance for chaining
	 */
	p.setTransform = p.tr = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY)
	{
		this.position.x = x || 0;
		this.position.y = y || 0;
		this.scale.x = !scaleX ? 1 : scaleX;
		this.scale.y = !scaleY ? 1 : scaleY;
		this.rotation = rotation || 0;
		this.skew.x = skewX || 0;
		this.skew.y = skewY || 0;
		this.pivot.x = pivotX || 0;
		this.pivot.y = pivotY || 0;
		return this;
	};

	/**
	 * Set the initial mask
	 * @method setMask
	 * @param {PIXI.Graphics} mask The mask shape to use
	 * @return {PIXI.flash.DisplayObject} Instance for chaining
	 */
	/**
	 * Short-hand for setMask method
	 * @method ma
	 * @param {PIXI.Graphics} mask The mask shape to use
	 * @return {PIXI.flash.DisplayObject} Instance for chaining
	 */
	p.setMask = p.ma = function(mask)
	{
		mask.renderable = false;
		this.mask = mask;
		return this;
	};

	/**
	 * The rotation of the display object, in degrees.
	 * This overrides the radian degrees of the PIXI display objects so that
	 * tweening exported from Flash will work correctly.
	 * @property {Number} rotation
	 */
	Object.defineProperty(p, "rotation",
	{
		enumerable: true,
		get: function()
		{
			return this._rotation * RAD_TO_DEG;
		},
		set: function(value)
		{
			this._rotation = value * DEG_TO_RAD;
		}
	});

	/**
	 * Tint to apply to this display object - Interpreted from CJS 
	 * ColorFilter (multiplicative only)
	 * @property {UInt} tint
	 */
	Object.defineProperty(p, "tint",
	{
		enumerable: true,
		get: function()
		{
			if (this.parent && this.parent._isPixiFlash)
			{
				var selfTint = this._tint;
				var parentTint = this.parent.tint;

				if (selfTint == 0xFFFFFF)
				{
					this._lastComputedTint = parentTint;
				}
				else if (parentTint == 0xFFFFFF)
				{
					this._lastComputedTint = selfTint;
				}
				if (this._tint != this._lastSelfTint || this.parent.tint != this._lastParentTint)
				{
					//calculate tint first time
					var max = 255;
					var parentR = (parentTint >> 16) & 0xff;
					var parentG = (parentTint >> 8) & 0xff;
					var parentB = parentTint & 0xff;
					var selfR = (selfTint >> 16) & 0xff;
					var selfG = (selfTint >> 8) & 0xff;
					var selfB = selfTint & 0xff;
					this._lastComputedTint = (Math.round((parentR * selfR) / max) << 16) | (Math.round((parentG * selfG) / max) << 8) | Math.round((parentB * selfB) / max);
				}

				this._lastSelfTint = selfTint;
				this._lastParentTint = parentTint;

				return this._lastComputedTint;
			}
			else
			{
				return this._tint;
			}
		},
		set: function(value)
		{
			this._tint = value;
		}
	});

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
	 * @param {Number} r The red percentage value
	 * @param {Number} g The green percentage value
	 * @param {Number} b The blue percentage value
	 * @return {DisplayObject} Object for chaining
	 */
	p.setTint = p.tn = function(r, g, b)
	{
		if (r < 0) r = 0;
		if (g < 0) g = 0;
		if (b < 0) b = 0;
		var max = 255;

		this.tint = (Math.round(r * max) << 16) |
			(Math.round(g * max) << 8) |
			Math.round(b * max);

		return this;
	};

	/**
	 * Override the object tranforms
	 * @method displayObjectUpdateTransform
	 * @protected
	 */
	p.displayObjectUpdateTransform = function()
	{
		// create some matrix refs for easy access
		var pt = this.parent.worldTransform;
		var wt = this.worldTransform;

		// temporary matrix variables
		var a, b, c, d, tx, ty,
			rotY = this.rotation + this.skew.y * DEG_TO_RAD,
			rotX = this.rotation + this.skew.x * DEG_TO_RAD;

		// so if rotation is between 0 then we can simplify the multiplication process...
		if (rotY % PI_2 || rotX % PI_2)
		{
			// check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
			if (rotX !== this._cachedRotX || rotY !== this._cachedRotY)
			{
				// cache new values
				this._cachedRotX = rotX;
				this._cachedRotY = rotY;

				// recalculate expensive ops
				this._crA = Math.cos(rotY);
				this._srB = Math.sin(rotY);

				this._srC = Math.sin(-rotX);
				this._crD = Math.cos(rotX);
			}

			// get the matrix values of the displayobject based on its transform properties..
			a = this._crA * this.scale.x;
			b = this._srB * this.scale.x;
			c = this._srC * this.scale.y;
			d = this._crD * this.scale.y;
			tx = this.position.x;
			ty = this.position.y;

			// check for pivot.. not often used so geared towards that fact!
			if (this.pivot.x || this.pivot.y)
			{
				tx -= this.pivot.x * a + this.pivot.y * c;
				ty -= this.pivot.x * b + this.pivot.y * d;
			}

			// concat the parent matrix with the objects transform.
			wt.a = a * pt.a + b * pt.c;
			wt.b = a * pt.b + b * pt.d;
			wt.c = c * pt.a + d * pt.c;
			wt.d = c * pt.b + d * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}
		else
		{
			// lets do the fast version as we know there is no rotation..
			a = this.scale.x;
			d = this.scale.y;

			tx = this.position.x - this.pivot.x * a;
			ty = this.position.y - this.pivot.y * d;

			wt.a = a * pt.a;
			wt.b = a * pt.b;
			wt.c = d * pt.c;
			wt.d = d * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}

		// multiply the alphas..
		this.worldAlpha = this.alpha * this.parent.worldAlpha;

		// reset the bounds each time this is called!
		this._currentBounds = null;
	};

	/**
	 * Mixin display options
	 * @method mixin
	 * @static
	 * @param {Object} targetPrototype The prototype to add methods to
	 */
	DisplayObject.mixin = function(targetPrototype)
	{
		for (var prop in p)
		{
			// For things that we set using Object.defineProperty
			// very important that enumerable:true for the
			// defineProperty options
			var propDesc = Object.getOwnPropertyDescriptor(p, prop);
			if (propDesc)
			{
				Object.defineProperty(targetPrototype, prop, propDesc);
			}
			else
			{
				// Should cover all other prototype methods/properties
				targetPrototype[prop] = p[prop];
			}
		}
	};

	// Assign to namespace
	PIXI.flash.DisplayObject = DisplayObject;

}(PIXI));
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
	var p = Container.extend(BaseContainer).prototype;

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
	var p = Sprite.extend(BaseSprite).prototype;

	// Mixin the display object
	DisplayObject.mixin(p);

	// Assign to namespace
	PIXI.flash.Sprite = Sprite;

}(PIXI));
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseGraphics = PIXI.Graphics;
	var DisplayObject = PIXI.flash.DisplayObject;

	/**
	 * The class to emulate createjs.Graphics
	 * @class Graphics
	 * @extends PIXI.Graphics
	 */
	var Graphics = function()
	{
		BaseGraphics.call(this);
		DisplayObject.call(this);
	};

	// Extend PIXI.Graphics
	var p = Graphics.extend(BaseGraphics).prototype;

	// Mixin the display object
	DisplayObject.mixin(p);

	/**
	 * Map of Base64 characters to values. Used by {{#crossLink "Graphics/decodePath"}}{{/crossLink}}.
	 * @property {Object} BASE_64
	 * @static
	 * @final
	 * @private
	 * @readonly
	 **/
	var BASE_64 = {
		"A": 0,
		"B": 1,
		"C": 2,
		"D": 3,
		"E": 4,
		"F": 5,
		"G": 6,
		"H": 7,
		"I": 8,
		"J": 9,
		"K": 10,
		"L": 11,
		"M": 12,
		"N": 13,
		"O": 14,
		"P": 15,
		"Q": 16,
		"R": 17,
		"S": 18,
		"T": 19,
		"U": 20,
		"V": 21,
		"W": 22,
		"X": 23,
		"Y": 24,
		"Z": 25,
		"a": 26,
		"b": 27,
		"c": 28,
		"d": 29,
		"e": 30,
		"f": 31,
		"g": 32,
		"h": 33,
		"i": 34,
		"j": 35,
		"k": 36,
		"l": 37,
		"m": 38,
		"n": 39,
		"o": 40,
		"p": 41,
		"q": 42,
		"r": 43,
		"s": 44,
		"t": 45,
		"u": 46,
		"v": 47,
		"w": 48,
		"x": 49,
		"y": 50,
		"z": 51,
		"0": 52,
		"1": 53,
		"2": 54,
		"3": 55,
		"4": 56,
		"5": 57,
		"6": 58,
		"7": 59,
		"8": 60,
		"9": 61,
		"+": 62,
		"/": 63
	};

	/**
	 * Moves the drawing point to the specified position. A tiny API method "mt" also exists.
	 * @method mt
	 * @param {Number} x The x coordinate the drawing point should move to.
	 * @param {Number} y The y coordinate the drawing point should move to.
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls).
	 **/
	p.mt = p.moveTo;

	/**
	 * Draws a line from the current drawing point to the specified position, which become the new current drawing
	 * point. A tiny API method "lt" also exists.
	 *
	 * For detailed information, read the
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#complex-shapes-(paths)">
	 * whatwg spec</a>.
	 * @method lt
	 * @param {Number} x The x coordinate the drawing point should draw to.
	 * @param {Number} y The y coordinate the drawing point should draw to.
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.lt = p.lineTo;

	/**
	 * Draws a bezier curve from the current drawing point to (x, y) using the control points (cp1x, cp1y) and (cp2x,
	 * cp2y). For detailed information, read the
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-beziercurveto">
	 * whatwg spec</a>. A tiny API method "bt" also exists.
	 * @method bt
	 * @param {Number} cp1x
	 * @param {Number} cp1y
	 * @param {Number} cp2x
	 * @param {Number} cp2y
	 * @param {Number} x
	 * @param {Number} y
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bt = p.bezierCurveTo;

	/**
	 * Shortcut to drawRect.
	 * @method dr
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	/**
	 * Shortcut to drawRect.
	 * @method r
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.dr = p.r = p.drawRect;

	/**
	 * Shortcut to drawRoundedRect.
	 * @method rr
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @param {Number} radius The corner radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.rr = p.drawRoundedRect;

	/**
	 * Shortcut to drawRoundRectComplex. Not supported by PIXI.flash
	 * @method rc
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @param {Number} radius The corner radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.rc = function(x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL)
	{
		if (true)
		{
			console.warn("Complex rounded rectangles not supported");
		}
		return this.rr(x, y, w, h, radiusTL);
	};

	/**
	 * Shortcut to drawCircle.
	 * @method dc
	 * @param {Number} x x coordinate center point of circle.
	 * @param {Number} y y coordinate center point of circle.
	 * @param {Number} radius Radius of circle.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.dc = p.drawCircle;

	/**
	 * Shortcut to arc.
	 * @method a
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 * @param {Number} startAngle Measured in radians.
	 * @param {Number} endAngle Measured in radians.
	 * @param {Boolean} anticlockwise
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @protected
	 * @chainable
	 **/
	p.a = p.arc;

	/**
	 * Shortcut to arcTo.
	 * @method at
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.at = p.arcTo;

	/**
	 * Override the draw ellipse method
	 * @method  de
	 * @param  {Number} x      [description]
	 * @param  {Number} y      [description]
	 * @param  {Number} width  [description]
	 * @param  {Number} height [description]
	 */
	p.de = function(x, y, width, height)
	{
		// Math conversion
		return this.drawEllipse(
			x + width / 2,
			y + height / 2,
			width / 2,
			height / 2
		);
	};

	/**
	 * Draws a quadratic curve from the current drawing point to (x, y) using the control point (cpx, cpy). For detailed
	 * information, read the <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-quadraticcurveto">
	 * whatwg spec</a>. A tiny API method "qt" also exists.
	 * @method qt
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.qt = function(cpx, cpy, x, y)
	{
		// Ensure that the draw shape is not closed
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = false;
		}
		return this.quadraticCurveTo(cpx, cpy, x, y);
	};

	/**
	 * Closes the current path, effectively drawing a line from the current drawing point to the first drawing point specified
	 * since the fill or stroke was last set. A tiny API method "cp" also exists.
	 * @method cp
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.cp = function()
	{
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = true;
		}
		return this;
	};

	/**
	 * Begins a fill with the specified color. This ends the current sub-path. A tiny API method "f" also exists.
	 * @method f
	 * @param {Uint} color The hex color value (e.g. 0xFFFFFF)
	 * null will result in no fill.
	 * @param {Number} [alpha=1] The alpha value of fill
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.f = function(color, alpha)
	{
		if (color !== undefined)
		{
			this.beginFill(color, alpha);
		}
		return this;
	};

	/**
	 * Placeholder method for a linear fill. Pixi does not support linear fills,
	 * so we just pick the first color in colorArray
	 * @method lf
	 * @param {Array} colorArray An array of CSS compatible color values @see `f`
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.lf = function(colorArray)
	{
		if (true)
		{
			console.warn("Linear gradient fills are not supported");
		}
		return this.f(colorArray[0]);
	};

	/**
	 * Placeholder method for a radial fill. Pixi does not support radial fills,
	 * so we just pick the first color in colorArray
	 * @method rf
	 * @param {Array} colorArray An array of CSS compatible color values @see `f`
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.rf = function(colorArray)
	{
		if (true)
		{
			console.warn("Radial gradient fills are not supported");
		}
		return this.f(colorArray[0]);
	};

	/**
	 * Placeholder method for a beginBitmapFill. Pixi does not support bitmap fills.
	 * @method bf
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bf = function()
	{
		if (true)
		{
			console.warn("Bitmap fills are not supported");
		}
		return this.f("#000000");
	};

	/**
	 * Placeholder method for a setStrokeDash. Pixi does not support dashed strokes.
	 * @method sd
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.sd = function()
	{
		if (true)
		{
			console.warn("Dashed strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginBitmapStroke. Pixi does not support bitmap strokes.
	 * @method bs
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bs = function()
	{
		if (true)
		{
			console.warn("Bitmap strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginLinearGradientStroke. Pixi does not support gradient strokes.
	 * @method ls
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.ls = function()
	{
		if (true)
		{
			console.warn("Linear gradient strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginRadialGradientStroke. Pixi does not support gradient strokes.
	 * @method rs
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.rs = function()
	{
		if (true)
		{
			console.warn("Radial gradient strokes are not supported");
		}
		return this;
	};

	/**
	 * Short-hand version for setStroke
	 * @method s
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @param {Number} [thickness=1] The thickness of the stroke
	 * @param {Number} [alpha=1] The alpha value from 0 (invisibile) to 1 (visible)
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	/**
	 * Begins a stroke with the specified color. This ends the current sub-path. A tiny API method "s" also exists.
	 * @method setStroke
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @param {Number} [thickness=1] The thickness of the stroke
	 * @param {Number} [alpha=1] The alpha value from 0 (invisibile) to 1 (visible)
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.setStroke = p.s = function(color, thickness, alpha)
	{
		if (color !== undefined)
		{
			this.lineColor = color;
			this.lineAlpha = alpha || 1;
			this.lineWidth = thickness || 1;
		}
		return this;
	};

	/**
	 * Decodes a compact encoded path string into a series of draw instructions.
	 * This format is not intended to be human readable, and is meant for use by authoring tools.
	 * The format uses a base64 character set, with each character representing 6 bits, to define a series of draw
	 * commands.
	 *
	 * Each command is comprised of a single "header" character followed by a variable number of alternating x and y
	 * position values. Reading the header bits from left to right (most to least significant): bits 1 to 3 specify the
	 * type of operation (0-moveTo, 1-lineTo, 2-quadraticCurveTo, 3-bezierCurveTo, 4-closePath, 5-7 unused). Bit 4
	 * indicates whether position values use 12 bits (2 characters) or 18 bits (3 characters), with a one indicating the
	 * latter. Bits 5 and 6 are currently unused.
	 *
	 * Following the header is a series of 0 (closePath), 2 (moveTo, lineTo), 4 (quadraticCurveTo), or 6 (bezierCurveTo)
	 * parameters. These parameters are alternating x/y positions represented by 2 or 3 characters (as indicated by the
	 * 4th bit in the command char). These characters consist of a 1 bit sign (1 is negative, 0 is positive), followed
	 * by an 11 (2 char) or 17 (3 char) bit integer value. All position values are in tenths of a pixel. Except in the
	 * case of move operations which are absolute, this value is a delta from the previous x or y position (as
	 * appropriate).
	 *
	 * For example, the string "A3cAAMAu4AAA" represents a line starting at -150,0 and ending at 150,0.
	 * <br />A - bits 000000. First 3 bits (000) indicate a moveTo operation. 4th bit (0) indicates 2 chars per
	 * parameter.
	 * <br />n0 - 110111011100. Absolute x position of -150.0px. First bit indicates a negative value, remaining bits
	 * indicate 1500 tenths of a pixel.
	 * <br />AA - 000000000000. Absolute y position of 0.
	 * <br />I - 001100. First 3 bits (001) indicate a lineTo operation. 4th bit (1) indicates 3 chars per parameter.
	 * <br />Au4 - 000000101110111000. An x delta of 300.0px, which is added to the previous x value of -150.0px to
	 * provide an absolute position of +150.0px.
	 * <br />AAA - 000000000000000000. A y delta value of 0.
	 *
	 * A tiny API method "p" also exists.
	 * @method p
	 * @param {String} str The path string to decode.
	 * @return {PIXI.flash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.p = function(str)
	{
		// Masking implentation doesn't call f(), must beginFill
		if (!this.filling)
		{
			this.beginFill();
		}
		var instructions = [
			this.mt,
			this.lt,
			this.qt,
			this.bt,
			this.cp
		];
		var paramCount = [2, 2, 4, 6, 0];
		var i = 0,
			l = str.length;
		var params = [];
		var x = 0,
			y = 0;
		var base64 = BASE_64;

		while (i < l)
		{
			var c = str.charAt(i);
			var n = base64[c];
			var fi = n >> 3; // highest order bits 1-3 code for operation.
			var f = instructions[fi];
			// check that we have a valid instruction & that the unused bits are empty:
			if (!f || (n & 3))
			{
				throw ("bad path data (@" + i + "): " + c);
			}
			var pl = paramCount[fi];
			if (!fi)
			{
				x = y = 0;
			} // move operations reset the position.
			params.length = 0;
			i++;
			var charCount = (n >> 2 & 1) + 2; // 4th header bit indicates number size for this operation.
			for (var p = 0; p < pl; p++)
			{
				var num = base64[str.charAt(i)];
				var sign = (num >> 5) ? -1 : 1;
				num = ((num & 31) << 6) | (base64[str.charAt(i + 1)]);
				if (charCount == 3)
				{
					num = (num << 6) | (base64[str.charAt(i + 2)]);
				}
				num = sign * num / 10;
				if (p % 2)
				{
					x = (num += x);
				}
				else
				{
					y = (num += y);
				}
				params[p] = num;
				i += charCount;
			}
			f.apply(this, params);
		}
		return this;
	};

	// Assign to namespace
	PIXI.flash.Graphics = Graphics;

}(PIXI));
(function(PIXI)
{
	// Import classes
	var Graphics = PIXI.flash.Graphics;

	/**
	 * Convenience wrapper for Mask graphics
	 * @class Mask
	 * @constructor
	 * @param {Number} x The x position
	 * @param {Number} y The y position
	 * @param {String} path Encoded path for shape
	 */
	var Mask = function(x, y, path)
	{
		Graphics.call(this);
		this.renderable = false;
		this.p(path).tr(x, y);
	};

	// Extends base graphics
	Mask.extend(Graphics);

	// Assign to namespace
	PIXI.flash.Mask = Mask;

}(PIXI));
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseText = PIXI.Text;
	var DisplayObject = PIXI.flash.DisplayObject;

	/**
	 * The class to emulate createjs.Text
	 * @class Text
	 * @extends PIXI.Text
	 * @param {String} text The text to add
	 * @param {Object} [style] The text style
	 */
	var Text = function(text, style)
	{
		BaseText.call(this, text, style);
		DisplayObject.call(this);

		if (style && style.align)
		{
			var x;
			switch (style.align)
			{
				case "center":
					x = 0.5;
					break;
				case "right":
					x = 1;
					break;
				case "left":
					x = 0;
					break;
			}
			this.anchor.x = x;
		}
	};

	// Extend PIXI.Text
	var p = Text.extend(BaseText).prototype;

	// Mixin the display object
	DisplayObject.mixin(p);

	/**
	 * Initial setting of the drop shadow
	 * @method setShadow
	 * @param {String} [color="#000000"] The color to set
	 * @param {Number} [angle=Math.PI/4] The angle of offset, in radians
	 * @param {Number} [distance=5] The offset distance
	 * @return {Text} For chaining
	 */
	/**
	 * Shortcut for adding drop shadow
	 * @method sh
	 * @param {String} [color="#000000"] The color to set
	 * @param {Number} [angle=Math.PI/4] The angle of offset, in radians
	 * @param {Number} [distance=5] The offset distance
	 * @return {Text} For chaining
	 */
	p.setShadow = p.sh = function(color, angle, distance)
	{
		var style = this.style;
		style.dropShadow = true;

		// Convert color to hex string
		if (color !== undefined)
		{
			color = "#" + color.toString(16);
		}
		style.dropShadowColor = isUndefinedOr(color, style.dropShadowColor);
		style.dropShadowAngle = isUndefinedOr(angle, style.dropShadowAngle);
		style.dropShadowDistance = isUndefinedOr(distance, style.dropShadowDistance);
		return this;
	};

	/**
	 * Check if a value is undefined, fallback to default value
	 * @method isUndefinedOr 
	 * @private
	 */
	var isUndefinedOr = function(value, defaultValue)
	{
		return value === undefined ? defaultValue : value;
	};

	// Assign to namespace
	PIXI.flash.Text = Text;

}(PIXI));
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var Container = PIXI.Container,
		DisplayObject = PIXI.flash.DisplayObject,
		Timeline = PIXI.flash.Timeline,
		Tween = createjs.Tween,
		SharedTicker = PIXI.ticker.shared;

	//*** Note: the vast majority of the code here is from EaselJS's MovieClip class.

	/*
	 * MovieClip
	 * Visit http://createjs.com/ for documentation, updates and examples.
	 *
	 * Copyright (c) 2010 gskinner.com, inc.
	 *
	 * Permission is hereby granted, free of charge, to any person
	 * obtaining a copy of this software and associated documentation
	 * files (the "Software"), to deal in the Software without
	 * restriction, including without limitation the rights to use,
	 * copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following
	 * conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	 * OTHER DEALINGS IN THE SOFTWARE.
	 */

	/**
	 * The class to emulate createjs.MovieClip, requires TweenJS
	 * @class MovieClip
	 * @extends PIXI.Container
	 */
	var MovieClip = function(mode, startPosition, loop, labels)
	{
		Container.call(this);
		DisplayObject.call(this);

		this.tickChildren = true;

		/**
		 * Controls how this MovieClip advances its time. Must be one of 0 (INDEPENDENT), 1 (SINGLE_FRAME), or 2 (SYNCHED).
		 * See each constant for a description of the behaviour.
		 * @property mode
		 * @type String
		 * @default null
		 **/
		this.mode = mode || MovieClip.INDEPENDENT;

		/**
		 * Specifies what the first frame to play in this movieclip, or the only frame to display if mode is SINGLE_FRAME.
		 * @property startPosition
		 * @type Number
		 * @default 0
		 */
		this.startPosition = startPosition || 0;

		/**
		 * Indicates whether this MovieClip should loop when it reaches the end of its timeline.
		 * @property loop
		 * @type Boolean
		 * @default true
		 */
		this.loop = loop;

		/**
		 * The current frame of the movieclip.
		 * @property currentFrame
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		this.currentFrame = 0;

		/**
		 * The TweenJS Timeline that is associated with this MovieClip. This is created automatically when the MovieClip
		 * instance is initialized. Animations are created by adding <a href="http://tweenjs.com">TweenJS</a> Tween
		 * instances to the timeline.
		 *
		 * <h4>Example</h4>
		 *
		 *      var tween = createjs.Tween.get(target).to({x:0}).to({x:100}, 30);
		 *      var mc = new createjs.MovieClip();
		 *      mc.timeline.addTween(tween);
		 *
		 * Elements can be added and removed from the timeline by toggling an "_off" property
		 * using the <code>tweenInstance.to()</code> method. Note that using <code>Tween.set</code> is not recommended to
		 * create MovieClip animations. The following example will toggle the target off on frame 0, and then back on for
		 * frame 1. You can use the "visible" property to achieve the same effect.
		 *
		 *      var tween = createjs.Tween.get(target).to({_off:false})
		 *          .wait(1).to({_off:true})
		 *          .wait(1).to({_off:false});
		 *
		 * @property timeline
		 * @type Timeline
		 * @default null
		 */
		this.timeline = new Timeline(null, labels,
		{
			paused: true,
			position: startPosition,
			useTicks: true
		});

		/**
		 * If true, the MovieClip's position will not advance when ticked.
		 * @property paused
		 * @type Boolean
		 * @default false
		 */
		this.paused = false;

		/**
		 * If true, actions in this MovieClip's tweens will be run when the playhead advances.
		 * @property actionsEnabled
		 * @type Boolean
		 * @default true
		 */
		this.actionsEnabled = true;

		/**
		 * If true, the MovieClip will automatically be reset to its first frame whenever the timeline adds
		 * it back onto the display list. This only applies to MovieClip instances with mode=INDEPENDENT.
		 * <br><br>
		 * For example, if you had a character animation with a "body" child MovieClip instance
		 * with different costumes on each frame, you could set body.autoReset = false, so that
		 * you can manually change the frame it is on, without worrying that it will be reset
		 * automatically.
		 * @property autoReset
		 * @type Boolean
		 * @default true
		 */
		this.autoReset = true;

		/**
		 * @property _synchOffset
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._synchOffset = 0;

		/**
		 * @property _prevPos
		 * @type Number
		 * @default -1
		 * @private
		 */
		this._prevPos = -1; // TODO: evaluate using a ._reset Boolean prop instead of -1.

		/**
		 * @property _prevPosition
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._prevPosition = 0;

		/**
		 * Note - changed from default: When the MovieClip is framerate independent, this is the time
		 * elapsed from frame 0 in seconds.
		 * @property _t
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._t = 0;

		/**
		 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
		 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
		 * framerate.
		 *
		 * @property _framerate
		 * @type {Number}
		 * @default 0
		 **/
		this._framerate = 0;
		/**
		 * When the MovieClip is framerate independent, this is the total time in seconds for the animation.
		 * @property _duration
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._duration = 0;

		/**
		 * List of display objects that are actively being managed by the MovieClip.
		 * @property _managed
		 * @type Object
		 * @private
		 */
		this._managed = {};

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

	/**
	 * The MovieClip will advance independently of its parent, even if its parent is paused.
	 * This is the default mode.
	 * @property INDEPENDENT
	 * @static
	 * @type String
	 * @default "independent"
	 * @readonly
	 **/
	MovieClip.INDEPENDENT = "independent";

	/**
	 * The MovieClip will only display a single frame (as determined by the startPosition property).
	 * @property SINGLE_FRAME
	 * @static
	 * @type String
	 * @default "single"
	 * @readonly
	 **/
	MovieClip.SINGLE_FRAME = "single";

	/**
	 * The MovieClip will be advanced only when its parent advances and will be synched to the position of
	 * the parent MovieClip.
	 * @property SYNCHED
	 * @static
	 * @type String
	 * @default "synched"
	 * @readonly
	 **/
	MovieClip.SYNCHED = "synched";

	var p = MovieClip.prototype = Object.create(Container.prototype);

	DisplayObject.mixin(p);

	//constructor for backwards/Flash exporting compatibility
	p.initialize = MovieClip;

	p._onAdded = function()
	{
		if (!this.parent._isPixiFlash)
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
		if (this._tickListener)
			SharedTicker.remove(this._tickListener);
	};

	/**
	 * Use the {{#crossLink "MovieClip/labels:property"}}{{/crossLink}} property instead.
	 * @method getLabels
	 * @return {Array}
	 * @deprecated
	 **/
	p.getLabels = function()
	{
		return this.timeline.getLabels();
	};

	/**
	 * Use the {{#crossLink "MovieClip/currentLabel:property"}}{{/crossLink}} property instead.
	 * @method getCurrentLabel
	 * @return {String}
	 * @deprecated
	 **/
	p.getCurrentLabel = function()
	{
		this._updateTimeline();
		return this.timeline.getCurrentLabel();
	};

	/**
	 * Returns an array of objects with label and position (aka frame) properties, sorted by position.
	 * Shortcut to TweenJS: Timeline.getLabels();
	 * @property labels
	 * @type {Array}
	 * @readonly
	 **/

	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @property currentLabel
	 * @type {String}
	 * @readonly
	 **/
	try
	{
		Object.defineProperties(p,
		{
			labels:
			{
				get: p.getLabels
			},
			currentLabel:
			{
				get: p.getCurrentLabel
			}
		});
	}
	catch (e)
	{}

	/**
	 * When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function()
		{
			return this._t;
		},
		set: function(value)
		{
			this._t = value;
		}
	});

	/**
	 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 *
	 * For example, if a MovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the MovieClip will
	 * advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	 * vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	 * passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate',
	{
		get: function()
		{
			return this._framerate;
		},
		set: function(value)
		{
			if (value > 0)
			{
				this._framerate = value;
				this._duration = value ? this.timeline.duration / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});

	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function()
	{
		this.paused = false;
	};

	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function()
	{
		this.paused = true;
	};

	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel)
	{
		this.paused = false;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel)
	{
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. Only applicable if framerate is set.
	 * @method advance
	 */
	p.advance = function(time)
	{
		// TODO: should we worry at all about clips who change their own modes via frame scripts?
		var independent = MovieClip.INDEPENDENT;
		if (this.mode != independent)
		{
			return;
		}

		if (!this._framerate)
		{
			var o = this,
				fps = o._framerate;
			while ((o = o.parent) && !fps)
			{
				if (o.mode == independent)
				{
					fps = o._framerate;
				}
			}
			this.framerate = fps;
		}

		if (!this.paused)
		{
			if (this._framerate > 0)
			{
				if (time)
					this._t += time * 0.001; //milliseconds -> seconds
				if (this._t > this._duration)
					this._t = this.timeline.loop ? this._t - this._duration : this._duration;
				//add a tiny amount to account for potential floating point errors
				this._prevPosition = Math.floor(this._t * this._framerate + 0.00000001);
				if (this._prevPosition > this.timeline.duration)
					this._prevPosition = this.timeline.duration;
			}
			else
				this._prevPosition = (this._prevPos < 0) ? 0 : this._prevPosition + 1;
			//Timeline is always updated in the tick function for PixiFlash MovieClips,
			//to replace EaselJS's timeline updating in draw().
			//this._updateTimeline();
		}
	};

	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in milliseconds.
	 * function.
	 * @protected
	 **/
	p._tick = function(delta)
	{
		if (this.tickEnabled)
			this.advance(delta);
		this._updateTimeline();
		this.Container__tick(delta);
	};

	p.Container__tick = function(delta)
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
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel)
	{
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos === null || pos === undefined)
		{
			return;
		}
		// prevent _updateTimeline from overwriting the new position because of a reset:
		if (this._prevPos == -1)
		{
			this._prevPos = NaN;
		}
		this._prevPosition = pos;
		//update the elapsed time if a time based movieclip
		if (this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};

	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function()
	{
		this._prevPos = -1;
		this._t = 0;
		this.currentFrame = 0;
	};

	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function()
	{
		var tl = this.timeline;
		var synched = this.mode != MovieClip.INDEPENDENT;
		tl.loop = (this.loop == null) ? true : this.loop; // jshint ignore:line

		// update timeline position, ignoring actions if this is a graphic.
		if (synched)
		{
			tl.setPosition(this.startPosition + (this.mode == MovieClip.SINGLE_FRAME ? 0 : this._synchOffset), Tween.NONE);
		}
		else
		{
			tl.setPosition(this._prevPos < 0 ? 0 : this._prevPosition, this.actionsEnabled ? null : Tween.NONE);
		}

		this._prevPosition = tl._prevPosition;
		if (this._prevPos == tl._prevPos)
		{
			return;
		}
		this.currentFrame = this._prevPos = tl._prevPos;

		for (var n in this._managed)
		{
			this._managed[n] = 1;
		}

		var tweens = tl._tweens;
		for (var i = 0, l = tweens.length; i < l; i++)
		{
			var tween = tweens[i];
			var target = tween._target;
			if (target == this || tween.passive)
			{
				continue;
			} // TODO: this assumes actions tween has this as the target. Valid?
			var offset = tween._stepPosition;

			//Containers, Bitmaps(Sprites), and MovieClips(also Containers) all inherit from
			//Container for PIXI
			if (target instanceof Container)
			{
				// motion tween.
				this._addManagedChild(target, offset);
			}
			else
			{
				// state tween.
				this._setState(target.state, offset);
			}
		}

		var kids = this.children;
		for (i = kids.length - 1; i >= 0; i--)
		{
			var id = kids[i].id;
			if (this._managed[id] == 1)
			{
				this.removeChildAt(i);
				delete(this._managed[id]);
			}
		}
	};

	/**
	 * @method _setState
	 * @param {Array} state
	 * @param {Number} offset
	 * @protected
	 **/
	p._setState = function(state, offset)
	{
		if (!state)
		{
			return;
		}
		for (var i = state.length - 1; i >= 0; i--)
		{
			var o = state[i];
			var target = o.t;
			var props = o.p;
			for (var n in props)
			{
				target[n] = props[n];
			}
			this._addManagedChild(target, offset);
		}
	};

	/**
	 * Adds a child to the timeline, and sets it up as a managed child.
	 * @method _addManagedChild
	 * @param {MovieClip} child The child MovieClip to manage
	 * @param {Number} offset
	 * @private
	 **/
	p._addManagedChild = function(child, offset)
	{
		if (child._off)
		{
			return;
		}
		this.addChildAt(child, 0);

		if (child instanceof MovieClip)
		{
			child._synchOffset = offset;
			child._updateTimeline();
			// TODO: this does not precisely match Flash. Flash loses track of the clip if it is renamed or removed from the timeline, which causes it to reset.
			if (child.mode == MovieClip.INDEPENDENT && child.autoReset && !this._managed[child.id])
			{
				child._reset();
			}
		}
		this._managed[child.id] = 2;
	};

	p.__Container_destroy = p.destroy;
	p.destroy = function(destroyChildren)
	{
		if (this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}

		this.__Container_destroy(destroyChildren);
	};

	// Assign to namespace
	PIXI.flash.MovieClip = MovieClip;

	/**
	 * This plugin works with <a href="http://tweenjs.com" target="_blank">TweenJS</a> to prevent the startPosition
	 * property from tweening.
	 * @private
	 * @class MovieClipPlugin
	 * @constructor
	 **/
	function MovieClipPlugin()
	{
		throw ("MovieClipPlugin cannot be instantiated.");
	}

	/**
	 * @method priority
	 * @private
	 **/
	MovieClipPlugin.priority = 100; // very high priority, should run first

	/**
	 * @method install
	 * @private
	 **/
	MovieClipPlugin.install = function()
	{
		Tween.installPlugin(MovieClipPlugin, ["startPosition"]);
	};

	/**
	 * @method init
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String|Number|Boolean} value
	 * @private
	 **/
	MovieClipPlugin.init = function(tween, prop, value)
	{
		return value;
	};

	/**
	 * @method step
	 * @private
	 **/
	MovieClipPlugin.step = function()
	{
		// unused.
	};

	/**
	 * @method tween
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String | Number | Boolean} value
	 * @param {Array} startValues
	 * @param {Array} endValues
	 * @param {Number} ratio
	 * @param {Object} wait
	 * @param {Object} end
	 * @return {*}
	 */
	MovieClipPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end)
	{
		if (!(tween.target instanceof MovieClip))
		{
			return value;
		}
		return (ratio == 1 ? endValues[prop] : startValues[prop]);
	};

}(PIXI));
/*
 * Timeline
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI)
{
	// Import libraries
	var Tween = createjs.Tween;

	// constructor	
	/**
	 * The Timeline class synchronizes multiple tweens and allows them to be controlled as a group. Please note that if a
	 * timeline is looping, the tweens on it may appear to loop even if the "loop" property of the tween is false.
	 * @class Timeline
	 * @param {Array} tweens An array of Tweens to add to this timeline. See addTween for more info.
	 * @param {Object} labels An object defining labels for using {{#crossLink "Timeline/gotoAndPlay"}}{{/crossLink}}/{{#crossLink "Timeline/gotoAndStop"}}{{/crossLink}}.
	 * See {{#crossLink "Timeline/setLabels"}}{{/crossLink}}
	 * for details.
	 * @param {Object} props The configuration properties to apply to this tween instance (ex. `{loop:true}`). All properties
	 * default to false. Supported props are:<UL>
	 *    <LI> loop: sets the loop property on this tween.</LI>
	 *    <LI> useTicks: uses ticks for all durations instead of milliseconds.</LI>
	 *    <LI> ignoreGlobalPause: sets the ignoreGlobalPause property on this tween.</LI>
	 *    <LI> paused: indicates whether to start the tween paused.</LI>
	 *    <LI> position: indicates the initial position for this timeline.</LI>
	 *    <LI> onChange: specifies a listener to add for the {{#crossLink "Timeline/change:event"}}{{/crossLink}} event.</LI>
	 * </UL>
	 * @extends EventDispatcher
	 * @constructor
	 **/
	function Timeline(tweens, labels, props)
	{
		EventEmitter.call(this);

		// public properties:
		/**
		 * Causes this timeline to continue playing when a global pause is active.
		 * @property ignoreGlobalPause
		 * @type Boolean
		 **/
		this.ignoreGlobalPause = false;

		/**
		 * Read-only property specifying the total duration of this timeline in milliseconds (or ticks if useTicks is true).
		 * This value is usually automatically updated as you modify the timeline. See updateDuration for more information.
		 * @property duration
		 * @type Number
		 **/
		this.duration = 0;

		/**
		 * If true, the timeline will loop when it reaches the end. Can be set via the props param.
		 * @property loop
		 * @type Boolean
		 **/
		this.loop = false;

		/**
		 * Read-only. The current normalized position of the timeline. This will always be a value between 0 and duration.
		 * Changing this property directly will have no effect.
		 * @property position
		 * @type Object
		 **/
		this.position = null;

		// private properties:
		/**
		 * @property _paused
		 * @type Boolean
		 * @protected
		 **/
		this._paused = false;

		/**
		 * @property _tweens
		 * @type Array[Tween]
		 * @protected
		 **/
		this._tweens = [];

		/**
		 * @property _labels
		 * @type Object
		 * @protected
		 **/
		this._labels = null;

		/**
		 * @property _labelList
		 * @type Array[Object]
		 * @protected
		 **/
		this._labelList = null;

		/**
		 * @property _prevPosition
		 * @type Number
		 * @default 0
		 * @protected
		 **/
		this._prevPosition = 0;

		/**
		 * @property _prevPos
		 * @type Number
		 * @default -1
		 * @protected
		 **/
		this._prevPos = -1;

		/**
		 * @property _useTicks
		 * @type Boolean
		 * @default false
		 * @protected
		 **/
		this._useTicks = false;


		if (props)
		{
			this._useTicks = props.useTicks;
			this.loop = props.loop;
			this.ignoreGlobalPause = props.ignoreGlobalPause;
			if (props.onChange)
				this.addEventListener("change", props.onChange);
		}
		if (tweens)
		{
			this.addTween.apply(this, tweens);
		}
		this.setLabels(labels);

		if (props && props.paused)
		{
			this._paused = true;
		}
		else
		{
			Tween._register(this, true);
		}
		if (props && props.position != null) // jshint ignore:line
		{
			this.setPosition(props.position, Tween.NONE);
		}
	}

	var p = Timeline.extend(EventEmitter).prototype;

	// events:
	/**
	 * Called whenever the timeline's position changes.
	 * @event change
	 * @since 0.5.0
	 **/

	// public methods:
	/**
	 * Adds one or more tweens (or timelines) to this timeline. The tweens will be paused (to remove them from the normal ticking system)
	 * and managed by this timeline. Adding a tween to multiple timelines will result in unexpected behaviour.
	 * @method addTween
	 * @param tween The tween(s) to add. Accepts multiple arguments.
	 * @return Tween The first tween that was passed in.
	 **/
	p.addTween = function(tween)
	{
		var l = arguments.length;
		if (l > 1)
		{
			for (var i = 0; i < l; i++)
			{
				this.addTween(arguments[i]);
			}
			return arguments[0];
		}
		else if (l === 0)
		{
			return null;
		}
		this.removeTween(tween);
		this._tweens.push(tween);
		tween.setPaused(true);
		tween._paused = false;
		tween._useTicks = this._useTicks;
		if (tween.duration > this.duration)
		{
			this.duration = tween.duration;
		}
		if (this._prevPos >= 0)
		{
			tween.setPosition(this._prevPos, Tween.NONE);
		}
		return tween;
	};

	/**
	 * Removes one or more tweens from this timeline.
	 * @method removeTween
	 * @param tween The tween(s) to remove. Accepts multiple arguments.
	 * @return Boolean Returns true if all of the tweens were successfully removed.
	 **/
	p.removeTween = function(tween)
	{
		var l = arguments.length;
		var i;
		if (l > 1)
		{
			var good = true;
			for (i = 0; i < l; i++)
			{
				good = good && this.removeTween(arguments[i]);
			}
			return good;
		}
		else if (l === 0)
		{
			return false;
		}

		var tweens = this._tweens;
		i = tweens.length;
		while (i--)
		{
			if (tweens[i] == tween)
			{
				tweens.splice(i, 1);
				if (tween.duration >= this.duration)
				{
					this.updateDuration();
				}
				return true;
			}
		}
		return false;
	};

	/**
	 * Adds a label that can be used with {{#crossLink "Timeline/gotoAndPlay"}}{{/crossLink}}/{{#crossLink "Timeline/gotoAndStop"}}{{/crossLink}}.
	 * @method addLabel
	 * @param {String} label The label name.
	 * @param {Number} position The position this label represents.
	 **/
	p.addLabel = function(label, position)
	{
		this._labels[label] = position;
		var list = this._labelList;
		if (list)
		{
			for (var i = 0, l = list.length; i < l; i++)
			{
				if (position < list[i].position)
				{
					break;
				}
			}
			list.splice(i, 0,
			{
				label: label,
				position: position
			});
		}
	};

	/**
	 * Defines labels for use with gotoAndPlay/Stop. Overwrites any previously set labels.
	 * @method setLabels
	 * @param {Object} o An object defining labels for using gotoAndPlay/Stop in the form `{labelName:time}` where time is in
	 * milliseconds (or ticks if `useTicks` is true).
	 **/
	p.setLabels = function(o)
	{
		this._labels = o ? o :
		{};
	};

	/**
	 * Returns a sorted list of the labels defined on this timeline.
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position properties.
	 **/
	p.getLabels = function()
	{
		var list = this._labelList;
		if (!list)
		{
			list = this._labelList = [];
			var labels = this._labels;
			for (var n in labels)
			{
				list.push(
				{
					label: n,
					position: labels[n]
				});
			}
			list.sort(function(a, b)
			{
				return a.position - b.position;
			});
		}
		return list;
	};

	/**
	 * Returns the name of the label on or immediately before the current position. For example, given a timeline with
	 * two labels, "first" on frame index 4, and "second" on frame 8, getCurrentLabel would return:<UL>
	 * <LI>null if the current position is 2.</LI>
	 * <LI>"first" if the current position is 4.</LI>
	 * <LI>"first" if the current position is 7.</LI>
	 * <LI>"second" if the current position is 15.</LI></UL>
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label
	 **/
	p.getCurrentLabel = function()
	{
		var labels = this.getLabels();
		var pos = this.position;
		var l = labels.length;
		if (l)
		{
			for (var i = 0; i < l; i++)
			{
				if (pos < labels[i].position)
				{
					break;
				}
			}
			return (i === 0) ? null : labels[i - 1].label;
		}
		return null;
	};

	/**
	 * Unpauses this timeline and jumps to the specified position or label.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The position in milliseconds (or ticks if `useTicks` is true) or label to jump to.
	 **/
	p.gotoAndPlay = function(positionOrLabel)
	{
		this.setPaused(false);
		this._goto(positionOrLabel);
	};

	/**
	 * Pauses this timeline and jumps to the specified position or label.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The position in milliseconds (or ticks if `useTicks` is true) or label to jump to.
	 **/
	p.gotoAndStop = function(positionOrLabel)
	{
		this.setPaused(true);
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the timeline to the specified position.
	 * @method setPosition
	 * @param {Number} value The position to seek to in milliseconds (or ticks if `useTicks` is true).
	 * @param {Number} [actionsMode] parameter specifying how actions are handled. See the Tween {{#crossLink "Tween/setPosition"}}{{/crossLink}}
	 * method for more details.
	 * @return {Boolean} Returns true if the timeline is complete (ie. the full timeline has run & loop is false).
	 **/
	p.setPosition = function(value, actionsMode)
	{
		if (value < 0)
		{
			value = 0;
		}
		var t = this.loop ? value % this.duration : value;
		var end = !this.loop && value >= this.duration;
		if (t == this._prevPos)
		{
			return end;
		}
		this._prevPosition = value;
		this.position = this._prevPos = t; // in case an action changes the current frame.
		for (var i = 0, l = this._tweens.length; i < l; i++)
		{
			this._tweens[i].setPosition(t, actionsMode);
			if (t != this._prevPos)
			{
				return false;
			} // an action changed this timeline's position.
		}
		if (end)
		{
			this.setPaused(true);
		}
		this.dispatchEvent("change");
		return end;
	};

	/**
	 * Pauses or plays this timeline.
	 * @method setPaused
	 * @param {Boolean} value Indicates whether the tween should be paused (true) or played (false).
	 **/
	p.setPaused = function(value)
	{
		this._paused = !!value;
		Tween._register(this, !value);
	};

	/**
	 * Recalculates the duration of the timeline.
	 * The duration is automatically updated when tweens are added or removed, but this method is useful
	 * if you modify a tween after it was added to the timeline.
	 * @method updateDuration
	 **/
	p.updateDuration = function()
	{
		this.duration = 0;
		for (var i = 0, l = this._tweens.length; i < l; i++)
		{
			var tween = this._tweens[i];
			if (tween.duration > this.duration)
			{
				this.duration = tween.duration;
			}
		}
	};

	/**
	 * Advances this timeline by the specified amount of time in milliseconds (or ticks if useTicks is true).
	 * This is normally called automatically by the Tween engine (via Tween.tick), but is exposed for advanced uses.
	 * @method tick
	 * @param {Number} delta The time to advance in milliseconds (or ticks if useTicks is true).
	 **/
	p.tick = function(delta)
	{
		this.setPosition(this._prevPosition + delta);
	};

	/**
	 * If a numeric position is passed, it is returned unchanged. If a string is passed, the position of the
	 * corresponding frame label will be returned, or null if a matching label is not defined.
	 * @method resolve
	 * @param {String|Number} positionOrLabel A numeric position value or label string.
	 **/
	p.resolve = function(positionOrLabel)
	{
		var pos = Number(positionOrLabel);
		if (isNaN(pos))
		{
			pos = this._labels[positionOrLabel];
		}
		return pos;
	};

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function()
	{
		return "[Timeline]";
	};

	// private methods:
	/**
	 * @method _goto
	 * @protected
	 **/
	p._goto = function(positionOrLabel)
	{
		var pos = this.resolve(positionOrLabel);
		if (pos != null) // jshint ignore:line
		{
			this.setPosition(pos);
		}
	};

	// Assign to namespace
	PIXI.flash.Timeline = Timeline;

}(PIXI));