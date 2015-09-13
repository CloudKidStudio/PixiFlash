/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	/**
	 * The class to emulate createjs.Graphics
	 * @class Graphics
	 */
	var Graphics = function(shape)
	{
		/**
		 * Reference to the parent shape
		 * @property {pixiflash.Shape} _shape
		 * @private
		 * @final
		 */
		this._shape = shape;

		/**
		 * The fill color
		 * @private {int} _fillColor
		 * @private
		 */
		this._fillColor = 0x0;

		/**
		 * The fill alpha
		 * @private {int} _fillAlpha
		 * @private
		 */
		this._fillAlpha = 1;
	};

	// Reference to prototype
	var p = Graphics.prototype;

	/**
	 * Map of Base64 characters to values. Used by {{#crossLink "Graphics/decodePath"}}{{/crossLink}}.
	 * @property BASE_64
	 * @static
	 * @final
	 * @readonly
	 * @type {Object}
	 **/
	Graphics.BASE_64 = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,
		"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,
		"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,
		"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,
		"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,
		"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,
		"7":59,"8":60,"9":61,"+":62,"/":63
	};

	/**
	 * Shortcut to moveTo.
	 * @method mt
	 * @param {Number} x The x coordinate the drawing point should move to.
	 * @param {Number} y The y coordinate the drawing point should move to.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls).
	 * @chainable
	 * @protected
	 **/
	p.moveTo = p.mt = function(x, y)
	{
		this._shape.moveTo(x, y);
		return this;
	};

	/**
	 * Shortcut to lineTo.
	 * @method lt
	 * @param {Number} x The x coordinate the drawing point should draw to.
	 * @param {Number} y The y coordinate the drawing point should draw to.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.lineTo = p.lt = function(x, y)
	{
		this._shape.lineTo(x, y);
		return this;
	};

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
	p.arcTo = p.at = function(x1, y1, x2, y2, radius)
	{
		this._shape.arcTo(x1, y1, x2, y2, radius);
		return this;
	};

	/**
	 * Shortcut to bezierCurveTo.
	 * @method bt
	 * @param {Number} cp1x
	 * @param {Number} cp1y
	 * @param {Number} cp2x
	 * @param {Number} cp2y
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.bezierCurveTo = p.bt = function(cp1x, cp1y, cp2x, cp2y, x, y)
	{
		this._shape.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
		return this;
	};

	/**
	 * Shortcut to quadraticCurveTo / curveTo.
	 * @method qt
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @protected
	 * @chainable
	 **/
	p.quadraticCurveTo = p.curveTo = p.qt = function(cpx, cpy, x, y)
	{
		// Ensure that the draw shape is not closed
		var currentPath = this._shape.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = false;
		}
		this._shape.quadraticCurveTo(cpx, cpy, x, y);
		return this;
	};

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
	p.arc = p.a = function(x, y, radius, startAngle, endAngle, anticlockwise)
	{
		this._shape.arc(x, y, radius, startAngle, endAngle, anticlockwise);
		return this;
	};

	/**
	 * Shortcut to closePath.
	 * @method cp
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.cp = function()
	{
		var currentPath = this._shape.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = true;
		}
		return this;
	};

	/**
	 * Shortcut to clear.
	 * @method c
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.clear = p.c = function()
	{
		this._shape.clear();
		return this;
	};

	/**
	 * Shortcut to beginFill.
	 * @method f
	 * @param {String} color A CSS compatible color value (ex. "red", "#FF0000", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no fill.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginFill = p.f = function(color)
	{
		if (color)
		{
			var rgb = this._fillColor = colorToHex(color);
			var a = this._fillAlpha = alphaFromColor(color);
			this._shape.beginFill(rgb, a);
		}
		return this;
	};

	/**
	 * Shortcut to beginLinearGradientFill.
	 * @method lf
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient
	 * drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw
	 * the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param {Number} y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginLinearGradientFill = p.lf = function(colors, ratios, x0, y0, x1, y1)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginLinearGradientFill not supported");
		}
		return this;
	};

	/**
	 * Shortcut to beginRadialGradientFill.
	 * @method rf
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 Center position of the inner circle that defines the gradient.
	 * @param {Number} y0 Center position of the inner circle that defines the gradient.
	 * @param {Number} r0 Radius of the inner circle that defines the gradient.
	 * @param {Number} x1 Center position of the outer circle that defines the gradient.
	 * @param {Number} y1 Center position of the outer circle that defines the gradient.
	 * @param {Number} r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginRadialGradientFill = p.rf = function(colors, ratios, x0, y0, r0, x1, y1, r1)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginRadialGradientFill not supported");
		}
		return this;
	};

	/**
	 * Shortcut to beginBitmapFill.
	 * @method bf
	 * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image The Image, Canvas, or Video object to use
	 * as the pattern.
	 * @param {String} repetition Optional. Indicates whether to repeat the image in the fill area. One of "repeat",
	 * "repeat-x", "repeat-y", or "no-repeat". Defaults to "repeat". Note that Firefox does not support "repeat-x" or
	 * "repeat-y" (latest tests were in FF 20.0), and will default to "repeat".
	 * @param {Matrix2D} matrix Optional. Specifies a transformation matrix for the bitmap fill. This transformation
	 * will be applied relative to the parent transform.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginBitmapFill = p.bf = function(image, repetition, matrix)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginBitmapFill not supported");
		}
		return this;
	};

	/**
	 * Shortcut to endFill.
	 * @method ef
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.endFill = p.ef = function()
	{
		this._shape.endFill();
		if (this._fillColor)
		{
			this._shape.beginFill(this._fillColor, this._fillAlpha);
		}
		return this;
	};

	/**
	 * Shortcut to setStrokeStyle.
	 * @method ss
	 * @param {Number} thickness The width of the stroke.
	 * @param {String | Number} [caps=0] Indicates the type of caps to use at the end of lines. One of butt,
	 * round, or square. Defaults to "butt". Also accepts the values 0 (butt), 1 (round), and 2 (square) for use with
	 * the tiny API.
	 * @param {String | Number} [joints=0] Specifies the type of joints that should be used where two lines meet.
	 * One of bevel, round, or miter. Defaults to "miter". Also accepts the values 0 (miter), 1 (round), and 2 (bevel)
	 * for use with the tiny API.
	 * @param {Number} [miterLimit=10] If joints is set to "miter", then you can specify a miter limit ratio which
	 * controls at what point a mitered joint will be clipped.
	 * @param {Boolean} [ignoreScale=false] If true, the stroke will be drawn at the specified thickness regardless
	 * of active transformations.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.setStrokeStyle = p.ss = function(thickness, caps, joints, miterLimit, ignoreScale)
	{
		this._shape.lineWidth = thickness;
		return this;
	};
	
	/**
	 * Shortcut to setStrokeDash.
	 * @method sd
	 * @param {Array} [segments] An array specifying the dash pattern, alternating between line and gap.
	 * For example, [20,10] would create a pattern of 20 pixel lines with 10 pixel gaps between them.
	 * Passing null or an empty array will clear any existing dash.
	 * @param {Number} [offset=0] The offset of the dash pattern. For example, you could increment this value to create a "marching ants" effect.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.setStrokeDash = p.sd = function(segments, offset)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: setStrokeDash not supported");
		}
		return this;
	};

	/**
	 * Shortcut to beginStroke.
	 * @method s
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginStroke = p.s = function(color)
	{
		if (color)
		{
			this._shape.lineColor = colorToHex(color);
			this._shape.lineAlpha = 1;
		}
		return this;
	};

	/**
	 * Shortcut to beginLinearGradientStroke.
	 * @method ls
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param {Number} y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginLinearGradientStroke = p.ls = function(colors, ratios, x0, y0, x1, y1)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginLinearGradientStroke not supported");
		}
		return this;
	};

	/**
	 * Shortcut to beginRadialGradientStroke.
	 * @method rs
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%, then draw the second color
	 * to 100%.
	 * @param {Number} x0 Center position of the inner circle that defines the gradient.
	 * @param {Number} y0 Center position of the inner circle that defines the gradient.
	 * @param {Number} r0 Radius of the inner circle that defines the gradient.
	 * @param {Number} x1 Center position of the outer circle that defines the gradient.
	 * @param {Number} y1 Center position of the outer circle that defines the gradient.
	 * @param {Number} r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginRadialGradientStroke = p.rs = function(colors, ratios, x0, y0, r0, x1, y1, r1)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginRadialGradientStroke not supported");
		}
		return this;
	};

	/**
	 * Shortcut to beginBitmapStroke.
	 * @method bs
	 * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image The Image, Canvas, or Video object to use
	 * as the pattern.
	 * @param {String} [repetition=repeat] Optional. Indicates whether to repeat the image in the fill area. One of
	 * "repeat", "repeat-x", "repeat-y", or "no-repeat". Defaults to "repeat".
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.beginBitmapStroke = p.bs = function(image, repetition)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: beginBitmapStroke not supported");
		}
		return this;
	};

	/**
	 * Shortcut to endStroke.
	 * @method es
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.endStroke = p.es = function()
	{
		this.ef();
		return this;
	};

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
	p.drawRect = p.dr = p.r = function(x, y, w, h)
	{
		this._shape.drawRect(x, y, w, h);
		return this;
	};

	/**
	 * Shortcut to drawRoundRect.
	 * @method rr
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @param {Number} radius Corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.drawRoundRect = p.rr = function(x, y, w, h, radius)
	{
		this._shape.drawRoundedRect(x, y, w, h, radius);
		return this;
	};

	/**
	 * Shortcut to drawRoundRectComplex.
	 * @method rc
	 * @param {Number} x The horizontal coordinate to draw the round rect.
	 * @param {Number} y The vertical coordinate to draw the round rect.
	 * @param {Number} w The width of the round rect.
	 * @param {Number} h The height of the round rect.
	 * @param {Number} radiusTL Top left corner radius.
	 * @param {Number} radiusTR Top right corner radius.
	 * @param {Number} radiusBR Bottom right corner radius.
	 * @param {Number} radiusBL Bottom left corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.drawRoundRectComplex = p.rc = function(x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL)
	{
		// TODO: this is incomplete, and only does rounded rect with even corners
		this._shape.drawRoundedRect(x, y, w, h, radiusTL);
		return this;
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
	p.drawCircle = p.dc = function(x, y, radius)
	{
		this._shape.drawCircle(x, y, radius);
		return this;
	};

	/**
	 * Shortcut to drawEllipse.
	 * @method de
	 * @param {Number} x The left coordinate point of the ellipse. Note that this is different from {{#crossLink "Graphics/drawCircle"}}{{/crossLink}}
	 * which draws from center.
	 * @param {Number} y The top coordinate point of the ellipse. Note that this is different from {{#crossLink "Graphics/drawCircle"}}{{/crossLink}}
	 * which draws from the center.
	 * @param {Number} w The height (horizontal diameter) of the ellipse. The horizontal radius will be half of this
	 * number.
	 * @param {Number} h The width (vertical diameter) of the ellipse. The vertical radius will be half of this number.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.drawEllipse = p.de = function(x, y, w, h)
	{
		this._shape.drawEllipse(x, y, w, h);
		return this;
	};

	/**
	 * Shortcut to drawPolyStar.
	 * @method dp
	 * @param {Number} x Position of the center of the shape.
	 * @param {Number} y Position of the center of the shape.
	 * @param {Number} radius The outer radius of the shape.
	 * @param {Number} sides The number of points on the star or sides on the polygon.
	 * @param {Number} pointSize The depth or "pointy-ness" of the star points. A pointSize of 0 will draw a regular
	 * polygon (no points), a pointSize of 1 will draw nothing because the points are infinitely pointy.
	 * @param {Number} angle The angle of the first point / corner. For example a value of 0 will draw the first point
	 * directly to the right of the center.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.drawPolyStar = p.dp =function(x, y, radius, sides, pointSize, angle)
	{
		if (DEBUG)
		{
			console.warn("pixiflash.Graphics: drawPolyStar not supported");
		}
		return this;
	};

	/**
	 * Shortcut to decodePath.
	 * @method p
	 * @param {String} str The path string to decode.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.decodePath = p.p = function(str)
	{
		var instructions = [this.mt, this.lt, this.qt, this.bt, this.cp];
		var paramCount = [2, 2, 4, 6, 0];
		var i=0, l=str.length;
		var params = [];
		var x=0, y=0;
		var base64 = Graphics.BASE_64;

		while (i<l) {
			var c = str.charAt(i);
			var n = base64[c];
			var fi = n>>3; // highest order bits 1-3 code for operation.
			var f = instructions[fi];
			// check that we have a valid instruction & that the unused bits are empty:
			if (!f || (n&3)) { throw("bad path data (@"+i+"): "+c); }
			var pl = paramCount[fi];
			if (!fi) { x=y=0; } // move operations reset the position.
			params.length = 0;
			i++;
			var charCount = (n>>2&1)+2;  // 4th header bit indicates number size for this operation.
			for (var p=0; p<pl; p++) {
				var num = base64[str.charAt(i)];
				var sign = (num>>5) ? -1 : 1;
				num = ((num&31)<<6)|(base64[str.charAt(i+1)]);
				if (charCount == 3) { num = (num<<6)|(base64[str.charAt(i+2)]); }
				num = sign*num/10;
				if (p%2) { x = (num += x); }
				else { y = (num += y); }
				params[p] = num;
				i += charCount;
			}
			f.apply(this,params);
		}
		return this;
	};

	/** 
	 * Convert a string color "#ffffff" to int 0xffffff
	 * @method colorToHex
	 * @private
	 * @param {String} color 
	 * @return {int} The hex color
	 */
	var colorToHex = function(color)
	{
		if (/^rgba\(/.test(color))
		{
			// Remove "rgba(" and ")" and turn into array
			color = color.substring(5, color.length - 1).split(',');
			color = 65536 * parseInt(color[0]) + 
				256 * parseInt(color[1]) + 
				parseInt(color[2]); 
		}
		else
		{
			color = parseInt(color.replace(/^#/, ''), 16);
		}
		return color;
	};

	/**
	 * Get the alpha color from color string
	 * @method alphaFromColor
	 * @private
	 * @param {String} color
	 */
	var alphaFromColor = function(color)
	{
		if (/^rgba\(/.test(color))
		{
			return parseFloat(color.substring(
				color.lastIndexOf(',') + 1,
				color.lastIndexOf(')')
			));
		}
		return 1;
	};

	// Assign to namespace
	pixiflash.Graphics = Graphics;

}());