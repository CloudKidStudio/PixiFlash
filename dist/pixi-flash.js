/*! Pixi Flash 0.2.5 */
/**
  * Copyright (c) 2009-2012 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */
/* jshint ignore:start */
(function(Array, undefined) {
    "use strict";

    // Some lookup tables
    var chrTable = new Array(256),
        maskTable = new Array(9),
        powTable = new Array(9),
        reversePowTable = new Array(9);

    for(var i = 0; i < 256; i++) {
        chrTable[i] = String.fromCharCode(i);
    }

    for(var f = 0; f < 9; f++) {
        maskTable[f] = ~((powTable[f] = Math.pow(2, f) - 1) ^ 0xFF);
        reversePowTable[f] = Math.pow(10, f);
    }

    var bitStream = '',
        bitValue = 0,
        bitsLeft = 8,
        streamIndex = 0;

    function write(val, count) {

        var overflow = count - bitsLeft,
            use = bitsLeft < count ? bitsLeft : count,
            shift = bitsLeft - use;

        if (overflow > 0) {
            bitValue += val >> overflow << shift;

        } else {
            bitValue += val << shift;
        }

        bitsLeft -= use;

        if (bitsLeft === 0) {

            bitStream += chrTable[bitValue];
            bitsLeft = 8;
            bitValue = 0;

            if (overflow > 0) {
                bitValue += (val & powTable[overflow]) << (8 - overflow);
                bitsLeft -= overflow;
            }

        }

    }

    function read(count) {

        var overflow = count - bitsLeft,
            use = bitsLeft < count ? bitsLeft : count,
            shift = bitsLeft - use;

        // Wrap bits over to next byte
        var val = (bitValue & maskTable[bitsLeft]) >> shift;
        bitsLeft -= use;

        if (bitsLeft === 0) {

            bitValue = bitStream.charCodeAt(++streamIndex);
            bitsLeft = 8;

            if (overflow > 0) {
                val = val << overflow | ((bitValue & maskTable[bitsLeft]) >> 8 - overflow);
                bitsLeft -= overflow;
            }

        }

        if (streamIndex > bitStream.length) {
            return 7;
        }

        return val;

    }


    // Encoder ----------------------------------------------------------------
    function _encode(value, top) {

        // Numbers
        if (typeof value === 'number') {

            var type = value !== (value | 0) ? 1 : 0,
                sign = 0;

            if (value < 0) {
                value = -value;
                sign = 1;
            }

            write(1 + type, 3);

            // Float
            if (type) {

                var shift = 0,
                    step = 10,
                    m = value,
                    tmp = 0;

                // Figure out the exponent
                do {
                    m = value * step;
                    step *= 10;
                    shift++;
                    tmp = m | 0;

                } while(m - tmp > 1 / step && shift < 8 && m < 214748364);

                // Correct if we overshoot
                step = tmp / 10;
                if (step === (step | 0)) {
                    tmp = step;
                    shift--;
                }

                value = tmp;

            }

            // 2 size 0-3: 0 = < 16 1 = < 256 2 = < 65536 3 >=
            if (value < 2) {
                write(value, 4);

            } else if (value < 16) {
                write(1, 3);
                write(value, 4);

            } else if (value < 256) {
                write(2, 3);
                write(value, 8);

            } else if (value < 4096) {
                write(3, 3);
                write(value >> 8 & 0xff, 4);
                write(value & 0xff, 8);

            } else if (value < 65536) {
                write(4, 3);
                write(value >> 8 & 0xff, 8);
                write(value & 0xff, 8);

            } else if (value < 1048576) {
                write(5, 3);
                write(value >> 16 & 0xff, 4);
                write(value >> 8 & 0xff, 8);
                write(value & 0xff, 8);

            } else if (value < 16777216) {
                write(6, 3);
                write(value >> 16 & 0xff, 8);
                write(value >> 8 & 0xff, 8);
                write(value & 0xff, 8);

            } else {
                write(7, 3);
                write(value >> 24 & 0xff, 8);
                write(value >> 16 & 0xff, 8);
                write(value >> 8 & 0xff, 8);
                write(value & 0xff, 8);
            }

            write(sign, 1);

            if (type) {
                write(shift, 4);
            }

        // Strings
        } else if (typeof value === 'string') {

            var len = value.length;
            write(3, 3);

            if (len > 65535) {
                write(31, 5);
                write(len >> 24 & 0xff, 8);
                write(len >> 16 & 0xff, 8);
                write(len >> 8 & 0xff, 8);
                write(len & 0xff, 8);

            } else if (len > 255) {
                write(30, 5);
                write(len >> 8 & 0xff, 8);
                write(len & 0xff, 8);

            } else if (len > 28) {
                write(29, 5);
                write(len, 8);

            } else {
                write(len, 5);
            }

            // Write a raw string to the stream
            if (bitsLeft !== 8) {
                bitStream += chrTable[bitValue];
                bitValue = 0;
                bitsLeft = 8;
            }

            bitStream += value;

        // Booleans
        } else if (typeof value === 'boolean') {
            write(+value, 4);

        // Null
        } else if (value === null) {
            write(7, 3);
            write(0, 1);

        // Arrays
        } else if (value instanceof Array) {

            write(4, 3);
            for(var i = 0, l = value.length; i < l; i++) {
                _encode(value[i]);
            }

            if (!top) {
                write(6, 3);
            }

        // Object
        } else {

            write(5, 3);
            for(var e in value) {
                _encode(e);
                _encode(value[e]);
            }

            if (!top) {
                write(6, 3);
            }

        }

    }

    function encode(value) {

        bitsLeft = 8;
        bitValue = 0;
        bitStream = '';

        _encode(value, true);

        write(7, 3);
        write(1, 1);

        if (bitValue > 0) {
            bitStream += chrTable[bitValue];
        }

        return bitStream;

    }

    // Decoder ----------------------------------------------------------------
    function decode(string) {

        var stack = [], i = -1, decoded,
            type, top, value,
            getKey = false, key, isObj;

        bitsLeft = 8;
        streamIndex = 0;
        bitStream = string;
        bitValue = bitStream.charCodeAt(streamIndex);

        while(true) {

            // Grab type
            type = read(3);

            switch(type) {

            // Bool
            case 0:
                value = read(1) ? true : false;
                break;

            // EOS / Stream Overrun / Null
            case 7:
                switch(read(1)) {
                    case 1:
                        return decoded;

                    case 7:
                        return undefined;

                    default:
                        value = null;
                }
                break;

            // Integer / Float
            case 1:
            case 2:
                switch(read(3)) {
                    case 0:
                        value = read(1);
                        break;

                    case 1:
                        value = read(4);
                        break;

                    case 2:
                        value = read(8);
                        break;

                    case 3:
                        value = (read(4) << 8)
                                + read(8);

                        break;

                    case 4:
                        value = (read(8) << 8)
                                + read(8);

                        break;

                    case 5:
                        value = (read(4) << 16)
                                + (read(8) << 8)
                                + read(8);

                        break;

                    case 6:
                        value = (read(8) << 16)
                                + (read(8) << 8)
                                + read(8);

                        break;

                    case 7:
                        value = (read(8) << 24)
                                + (read(8) << 16)
                                + (read(8) << 8)
                                + read(8);

                        break;
                }

                if (read(1)) {
                    value = -value;
                }

                if (type === 2) {
                    value /= reversePowTable[read(4)];
                }

                break;

            // String
            case 3:

                var size = read(5);
                switch(size) {
                    case 31:
                        size = (read(8) << 24)
                               + (read(8) << 16)
                               + (read(8) << 8)
                               + read(8);

                        break;

                    case 30:
                        size = (read(8) << 8)
                               + read(8);

                        break;

                    case 29:
                        size = read(8);
                        break;

                }

                // Read a raw string from the stream
                if (bitsLeft !== 8) {
                    streamIndex++;
                    bitValue = 0;
                    bitsLeft = 8;
                }

                value = bitStream.substr(streamIndex, size);
                streamIndex += size;
                bitValue = bitStream.charCodeAt(streamIndex);

                if (getKey) {
                    key = value;
                    getKey = false;
                    continue;
                }

                break;

            // Open Array / Objects
            case 4:
            case 5:
                getKey = type === 5;
                value = getKey ? {} : [];

                if (decoded === undefined) {
                    decoded = value;

                } else {

                    if (isObj) {
                        top[key] = value;

                    } else {
                        top.push(value);
                    }
                }

                top = stack[++i] = value;
                isObj = !(top instanceof Array);
                continue;

            // Close Array / Object
            case 6:
                top = stack[--i];
                getKey = isObj = !(top instanceof Array);
                continue;
            }

            // Assign value to top of stack or return value
            if (isObj) {
                top[key] = value;
                getKey = true;

            } else if (top !== undefined) {
                top.push(value);

            } else {
                return value;
            }

        }

    }

    // Exports
    if (typeof exports !== 'undefined') {
        exports.encode = encode;
        exports.decode = decode;

    } else {
        window.BISON = {
            encode: encode,
            decode: decode
        };
    }

})(Array);
/* jshint ignore:end */
(function(PIXI)
{
	var BISONLoader = function()
	{
		return function(resource, next)
		{
			if (/\.bson$/i.test(resource.url))
			{
				resource.data = BISON.decode(resource.data);
			}
			next();	
		};
	};

	PIXI.loaders.Loader.addPixiMiddleware(BISONLoader);

}(PIXI));
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
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var BaseSprite = PIXI.Sprite;
	var DisplayObject = PIXI.flash.DisplayObject;

	/**
	 * The class to emulate createjs.Sprite
	 * @class Sprite
	 * @extends PIXI.Sprite
	 * @param {PIXI.Texture} texture The texture to assign to Sprite
	 */
	var Sprite = PIXI.flash.Sprite = function(texture)
	{
		BaseSprite.call(this, texture);
		DisplayObject.call(this);
	};

	// Extend PIXI.Sprite
	var p = BaseSprite.extend(Sprite).prototype;

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
	var Graphics = function(commands)
	{
		BaseGraphics.call(this);
		DisplayObject.call(this);

		if (commands)
		{
			this.drawCommands(commands);
		}
	};

	// Extend PIXI.Graphics
	var p = BaseGraphics.extend(Graphics).prototype;

	// Mixin the display object
	DisplayObject.mixin(p);

	p.drawCommands = function(commands)
	{
		var currentCommand, params = [], i = 0;
		
		while(i <= commands.length)
		{
			var item = commands[i++];
			if (item === undefined || this[item])
			{
				if (currentCommand)
				{
					this[currentCommand].apply(this, params);
					params.length = 0;
				}
				currentCommand = item;
			}
			else
			{
				// convert colors to int
				if (/^#/.test(item)) 
					item = parseInt(item.substr(1), 16);
				params.push(item);
			}
		}
	};

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
	p.s = p.lineStyle;

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
		var rows = [];
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
		var names = [
			"mt",
			"lt",
			"qt",
			"bt",
			"cp"
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
			addDrawCommand(rows, names[fi], params);
			f.apply(this, params);
		}
		console.log(rows);
		return this;
	};

	function addDrawCommand(rows, cmd, args)
	{
		rows.push(cmd);
		args.forEach(function(arg, i, args)
		{
			rows.push(Math.round(arg * 1000)/1000);
		});
	}

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
	Graphics.extend(Mask);

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
	var p = BaseText.extend(Text).prototype;

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