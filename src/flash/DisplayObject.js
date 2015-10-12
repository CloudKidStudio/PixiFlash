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
		this.tr = this.setTransform;
	};

	// Reference to prototype
	var p = DisplayObject.prototype;

	/**
	 * Short-hand for setMask method
	 * @method ma
	 * @param {PIXI.Graphics} mask The mask shape to use
	 * @return {PIXI.flash.DisplayObject} Instance for chaining
	 */
	p.ma = function(mask)
	{
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
			return this._rotation * PIXI.RAD_TO_DEG;
		},
		set: function(value)
		{
			this._rotation = value * PIXI.DEG_TO_RAD;
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
			rotY = this.rotation + this.skew.y * PIXI.DEG_TO_RAD,
			rotX = this.rotation + this.skew.x * PIXI.DEG_TO_RAD;

		// so if rotation is between 0 then we can simplify the multiplication process...
		if (rotY % PIXI.PI_2 || rotX % PIXI.PI_2)
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