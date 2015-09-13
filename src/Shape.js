/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiGraphics = PIXI.Graphics,
		Graphics = pixiflash.Graphics,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Shape
	 * @class Shape
	 * @extends PIXI.Graphics
	 */
	var Shape = function()
	{
		PixiGraphics.call(this);
		DisplayObject.call(this);

		/**
		 * The drawing graphics, these are necessary
		 * for the compability with EaselJS Flash exports.
		 * @property {pixiflash.Graphics} graphics
		 * @readOnly
		 */
		this.graphics = {
			f: beginFill.bind(this),
			s: beginStroke.bind(this),
			p: decodePath.bind(this),
			mt: this.moveTo.bind(this),
			lt: this.lineTo.bind(this),
			qt: quadraticCurveTo.bind(this),
			bt: this.bezierCurveTo.bind(this),
			cp: closePath.bind(this)
		};
	};

	// Extend PIXI.Sprite
	var p = Shape.prototype = Object.create(PixiGraphics.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards compatibility
	p.initialize = Shape;

	// Assign to namespace
	pixiflash.Shape = Shape;

	/**
	 * Wrapper for the graphics
	 * @class pixiflash.Graphics
	 */
	 /**
	 * Map of Base64 characters to values. Used by {{#crossLink "Graphics/decodePath"}}{{/crossLink}}.
	 * @property BASE_64
	 * @static
	 * @final
	 * @readonly
	 * @type {Object}
	 **/
	var BASE_64 = {
		"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,
		"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,
		"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,
		"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,
		"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,
		"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,
		"7":59,"8":60,"9":61,"+":62,"/":63
	};

	/**
	 * Shortcut to quadraticCurveTo / curveTo.
	 * @method quadraticCurveTo
	 * @private
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @protected
	 * @chainable
	 **/
	var quadraticCurveTo = function(cpx, cpy, x, y)
	{
		// Ensure that the draw shape is not closed
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = false;
		}
		this.quadraticCurveTo(cpx, cpy, x, y);
		return this.graphics;
	};

	/**
	 * Shortcut to closePath.
	 * @method closePath
	 * @private
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	var closePath = function()
	{
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = true;
		}
		return this.graphics;
	};

	/**
	 * Shortcut to beginFill.
	 * @method beginFill
	 * @private
	 * @param {String} color A CSS compatible color value (ex. "red", "#FF0000", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no fill.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	var beginFill = function(color)
	{
		if (color)
		{
			var rgb = colorToHex(color);
			var a = alphaFromColor(color);
			this.beginFill(rgb, a);
		}
		return this.graphics;
	};

	/**
	 * Shortcut to setStrokeStyle.
	 * @method setStrokeStyle
	 * @private
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
	var setStrokeStyle = function(thickness, caps, joints, miterLimit, ignoreScale)
	{
		this.lineWidth = thickness;
		return this.graphics;
	};

	/**
	 * Shortcut to beginStroke.
	 * @method beginStroke
	 * @private
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	var beginStroke = function(color)
	{
		if (color)
		{
			this.lineColor = colorToHex(color);
			this.lineAlpha = 1;
		}
		return this.graphics;
	};

	/**
	 * Shortcut to decodePath.
	 * @method decodePath
	 * @private
	 * @param {String} str The path string to decode.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	var decodePath = function(str)
	{
		var graphics = this.graphics;
		var instructions = [
			graphics.mt,
			graphics.lt, 
			graphics.qt, 
			graphics.bt, 
			graphics.cp
		];
		var paramCount = [2, 2, 4, 6, 0];
		var i=0, l=str.length;
		var params = [];
		var x=0, y=0;
		var base64 = BASE_64;

		while (i<l)
		{
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
			for (var p=0; p<pl; p++) 
			{
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
		return this.graphics;
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

}());