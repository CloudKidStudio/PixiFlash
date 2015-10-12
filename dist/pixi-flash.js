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
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI)
{
	var p = PIXI.DisplayObject.prototype;

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
	 * @return {PIXI.DisplayObject} Instance for chaining
	 */
	p.tr = p.setTransform;

	/**
	 * Short-hand for setMask method
	 * @method ma
	 * @param {PIXI.Graphics} mask The mask shape to use
	 * @return {PIXI.DisplayObject} Instance for chaining
	 */
	p.setMask = p.ma = function(mask)
	{
		this.mask = mask;
		return this;
	};

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
	 * @param {Number} ting The red percentage value
	 * @return {DisplayObject} Object for chaining
	 */
	p.setTint = p.tn = function(tint)
	{
		this.tint = tint;
		return this;
	};

}(PIXI));
/**
 * @module Pixi Flash
 * @namespace PIXI
 */
(function(PIXI, undefined)
{
	var p = PIXI.Graphics.prototype;

	/**
	 * Shortcut for drawCommands
	 * @method d
	 * @param  {Array} commands The commands and parameters to draw
	 * @return {PIXI.Graphics}
	 */
	/**
	 * Execute a series of commands
	 * @method drawCommands
	 * @param  {Array} commands The commands and parameters to draw
	 * @return {PIXI.Graphics}
	 */
	p.drawCommands = p.d = function(commands)
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
		return this;
	};

	/**
	 * Make renderable
	 * @method setRenderable
	 * @param  {Boolean} [renderable=false] Make renderable
	 * @return {PIXI.Graphics}
	 */
	/**
	 * Make renderable
	 * @method re
	 * @param  {Boolean} [renderable=false] Make renderable
	 * @return {PIXI.Graphics}
	 */
	p.setRenderable = p.re = function(renderable)
	{
		this.renderable = !!renderable;
		return this;
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
		console.log(JSON.stringify(rows));
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

}(PIXI));
/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var p = PIXI.Text.prototype;

	/**
	 * The class to emulate createjs.Text
	 * @method setAlign
	 * @param {String} align Either, center, right, left
	 * @return {PIXI.Text} For chaining
	 */
	p.setAlign = p.al = function(align)
	{
		this.style.align = align || "left";
		var x = 0;
		switch (align)
		{
			case "center":
				x = 0.5;
				break;
			case "right":
				x = 1;
				break;
		}
		this.anchor.x = x;
		return this;
	};

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

}(PIXI));