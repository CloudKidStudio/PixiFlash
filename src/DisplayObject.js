/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Point = PIXI.Point;
	var ColorFilter = pixiflash.ColorFilter;
	var uniqueId = 0;
	
	/**
	*  Mixins for the display objects used for bridging CreateJS over to PIXI.
	*  @class DisplayObject
	*/
	var DisplayObject = function()
	{
		this.id = ++uniqueId;
		
		//mark these objects so that we can recognize them internally.
		this._isPixiFlash = true;
		/**
		 * x and y skew of the display object, with values in radians.
		 * @property {PIXI.Point} skew
		 */
		this.skew = new Point();
		
		/**
		 * Rotation of the display object, with values in radians.
		 * @property {Number} rotation
		 */
		this._rotation = 0;
		
		this._srB = 0;
		this._srC = 0;
		this._crA = 1;
		this._crD = 1;
		
		this._cachedRotY = 0;
		this._cachedRotX = 0;
		
		/**
		 * If false, the tick will not run on this display object (or its children). This can provide some performance benefits.
		 * In addition to preventing the "tick" event from being dispatched, it will also prevent tick related updates
		 * on some display objects (ex. Sprite & MovieClip frame advancing, DOMElement visibility handling).
		 * @property tickEnabled
		 * @type Boolean
		 * @default true
		 **/
		this.tickEnabled = true;
		
		//remove all listeners on this instance, because the CreateJS published files from flash
		//makes prototypes in a way that breaks normal PIXI listener usage.
		this.removeAllListeners();

		// Bound functions need to be bound later
		this.boundMaskChanged = false;

		//initialize tint variables:
		this._lastComputedTint = this._lastSelfTint = this._lastParentTint = this._selfTint = 0xFFFFFF;
		this.__filters = null;
	};

	var p = DisplayObject.prototype;
	
	var DEG_TO_RAD = Math.PI / 180;
	var RAD_TO_DEG = 180 / Math.PI;
	var PI_2 = Math.PI * 2;
	
	Object.defineProperties(p,
	{
		/**
		 * Private array of filters - for interpretation of CJS ColorFilters as PIXI tint
		 * @property {Array} _filters
		 */
		_filters:
		{
			enumerable: true,
			get: function() { return this.__filters; },
			set: function(value)
			{
				if(!value)
				{
					this.__filters = null;
				}
				else if(value.length == 1 && value[0] instanceof ColorFilter && value[0].isTintOnly)
				{
					//ColorFilter added by CJS exporter - convert to PIXI tint
					this.tint = value[0].tint;
					this.__filters = null;
				}
				else
				{
					//make a copy, strip out any possible ColorFilters
					this.__filters = [];
					for(var i = 0; i < value.length; ++i)
					{
						if(value[i] instanceof ColorFilter && value[i].isTintOnly)
						{
							//ColorFilter added by CJS exporter - convert to PIXI tint
							this.tint = value[i].tint;
						}
						else
						{
							//normal PIXI filter or our wrapper for one?
							this.__filters.push(value[i]);
						}
					}
				}
			}
		},
		/**
		 * Tint to apply to this display object - Interpreted from CJS ColorFilter (multiplicative only)
		 * @property {UInt} tint
		 */
		tint:
		{
			enumerable: true,
			get: function() {
				var parent = this.parent;
				if(parent && parent._isPixiFlash)
				{
					var selfTint = this._selfTint;
					var parentTint = parent.tint;

					if(selfTint == 0xFFFFFF)
						this._lastComputedTint = parentTint;
					else if(parentTint == 0xFFFFFF)
						this._lastComputedTint = selfTint;
					else if(selfTint != this._lastSelfTint || parentTint != this._lastParentTint)
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
					return this._selfTint;
				}
			},
			set: function(value)
			{
				this._selfTint = value;
			}
		},
		/**
		 * The x skew value of the display object, in degrees.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} skewX
		 */
		skewX:
		{
			enumerable: true,
			get: function() { return this.skew.x * RAD_TO_DEG; },
			set: function(value)
			{
				this.skew.x = value * DEG_TO_RAD;
			}
		},
		/**
		 * The y skew value of the display object, in degrees.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} skewY
		 */
		skewY:
		{
			enumerable: true,
			get: function() { return this.skew.y * RAD_TO_DEG; },
			set: function(value)
			{
				this.skew.y = value * DEG_TO_RAD;
			}
		},
		/**
		 * The rotation of the display object, in degrees.
		 * This overrides the radian degrees of the PIXI display objects so that
		 * tweening exported from Flash will work correctly.
		 * @property {Number} rotation
		 */
		rotation:
		{
			enumerable: true,
			get: function() { return this._rotation * RAD_TO_DEG; },
			set: function(value)
			{
				this._rotation = value * DEG_TO_RAD;
			}
		},
		/**
		 * The x scale value of the display object.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} scaleX
		 */
		scaleX:
		{
			enumerable: true,
			get: function() { return this.scale.x; },
			set: function(value)
			{
				this.scale.x = value;
			}
		},
		/**
		 * The y scale value of the display object.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} scaleY
		 */
		scaleY:
		{
			enumerable: true,
			get: function() { return this.scale.y; },
			set: function(value)
			{
				this.scale.y = value;
			}
		},
		/**
		 * The x value of the registration, or pivot, point.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} regX
		 */
		regX:
		{
			enumerable: true,
			get: function() { return this.pivot.x; },
			set: function(value)
			{
				this.pivot.x = value;
			}
		},
		/**
		 * The y value of the registration, or pivot, point.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} regY
		 */
		regY:
		{
			enumerable: true,
			get: function() { return this.pivot.y; },
			set: function(value)
			{
				this.pivot.y = value;
			}
		},

		/**
		 * The drawing graphics, these are necessary
		 * for the compability with EaselJS Flash exports.
		 * @property {pixiflash.Shape|pixiflash.Sprite} mask
		 */
		mask: {
			enumerable: true,
			get: function()
			{
				return this._mask;
			},
			set: function (mask)
			{
				var _maskShape = this._maskShape;
				//if the old mask is a shape and is not the new mask, remove it
				if (_maskShape && mask != _maskShape)
				{
					if(--_maskShape._maskUses < 1)
					{
						if(_maskShape.parent)
							_maskShape.parent.removeChild(_maskShape);
					}
					_maskShape.off('graphicsChanged', this.onShapeChanged);
				}
				if (this._mask)
				{
					//is this safe if a mask is reused multiple places?
					this._mask.renderable = true;
				}
				// If the mask is a shape apply the graphics as the shape
				if (mask && mask instanceof pixiflash.Shape)
				{
					if(!this.boundMaskChanged)
					{
						this.boundMaskChanged = true;
						this.onShapeChanged = this.onShapeChanged.bind(this);
						this.onAddedWithMask = this.onAddedWithMask.bind(this);
					}
					if(_maskShape != mask)
					{
						_maskShape = this._maskShape = mask;
						++_maskShape._maskUses;
						_maskShape.on('graphicsChanged', this.onShapeChanged);
					}
					if(mask.graphics.graphicsData.length)
					{
						this._mask = mask.graphics;
					}
					else
						this._mask = null;
				}
				else
				{
					this._mask = mask;
				}
				if(!mask)
				{
					
					if(this._hasAddedEvent)
					{
						this.off("added", this.onAddedWithMask);
						this._hasAddedEvent = false;
					}
				}
				if (this._mask)
				{
					// Wait until we're add and then add the mask
					// on the same container as this display object
					if (!this.parent)
					{
						//only add event if it isn't already included
						if(!this._hasAddedEvent)
						{
							this._hasAddedEvent = true;
							this.once("added", this.onAddedWithMask);
						}
					}
					else
					{
						if(mask.parent != this.parent)
							this.parent.addChild(mask);
					}
					this._mask.renderable = false;
				}
			}
		}
	});
	
	p.onAddedWithMask = function()
	{
		if(!this._mask) return;
		var mask = this._maskShape || this._mask;
		if(mask.parent != this.parent)
			this.parent.addChild(mask);
	};
	
	/**
	 * Dummy function for CJS export compatibility
	 * @method cache
	 */
	p.cache = function()
	{
		//don't do anything!
	};

	/**
	 * Graphics object was updated on the shape dynamically, update the mask
	 * @method onShapeChanged
	 * @private
	 * @param {pixiflash.Shape} shape
	 */
	p.onShapeChanged = function(shape)
	{
		// reset the shape mask
		this.mask = shape;
	};
	
	p.displayObjectUpdateTransform = function()
	{
		// create some matrix refs for easy access
		var pt = this.parent.worldTransform;
		var wt = this.worldTransform;
		
		var scale = this.scale, skew = this.skew, position = this.position, pivot = this.pivot;

		// temporary matrix variables
		var a, b, c, d, tx, ty,
			rotY = this._rotation + skew.y,
			rotX = this._rotation + skew.x;

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
			a  = this._crA * scale.x;
			b  = this._srB * scale.x;
			c  = this._srC * scale.y;
			d  = this._crD * scale.y;
			tx =  position.x;
			ty =  position.y;

			// check for pivot.. not often used so geared towards that fact!
			if (pivot.x || pivot.y)
			{
				tx -= pivot.x * a + pivot.y * c;
				ty -= pivot.x * b + pivot.y * d;
			}

			// concat the parent matrix with the objects transform.
			wt.a  = a  * pt.a + b  * pt.c;
			wt.b  = a  * pt.b + b  * pt.d;
			wt.c  = c  * pt.a + d  * pt.c;
			wt.d  = c  * pt.b + d  * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}
		else
		{
			// lets do the fast version as we know there is no rotation..
			a  = scale.x;
			d  = scale.y;

			tx = position.x - pivot.x * a;
			ty = position.y - pivot.y * d;

			wt.a  = a  * pt.a;
			wt.b  = a  * pt.b;
			wt.c  = d  * pt.c;
			wt.d  = d  * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}

		// multiply the alphas..
		this.worldAlpha = this.alpha * this.parent.worldAlpha;

		// reset the bounds each time this is called!
		this._currentBounds = null;
	};
	
	p.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY)
	{
		this.position.x = x || 0;
		this.position.y = y || 0;
		this.scale.x = !scaleX ? 1 : scaleX;
		this.scale.y = !scaleY ? 1 : scaleY;
		this.rotation = rotation || 0;
		this.skewX = skewX || 0;
		this.skewY = skewY || 0;
		this.pivot.x = regX || 0;
		this.pivot.y = regY || 0;
		return this;
	};
	
	DisplayObject.mixin = function(targetPrototype)
	{
		for(var prop in p)
		{
			// For things that we set using Object.defineProperty
			// very important that enumerable:true for the
			// defineProperty options
			var propDesc = Object.getOwnPropertyDescriptor(p, prop);
			if(propDesc)
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
	
	pixiflash.DisplayObject = DisplayObject;
	
}());