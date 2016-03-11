/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var AbstractFilter = PIXI.AbstractFilter;
	
	//Modified colorMatrix.frag from PIXI to avoid having color offsets mess with transparency
	var COLOR_FRAG =
	"precision mediump float;" +
	"varying vec2 vTextureCoord;" +
	"uniform sampler2D uSampler;" +
	"uniform float m[25];" +
	"void main(void)" +
	"{" +
	"vec4 c = texture2D(uSampler, vTextureCoord);" +
	"gl_FragColor.r = (m[0] * c.r);" +
	"    gl_FragColor.r += (m[1] * c.g);" +
	"    gl_FragColor.r += (m[2] * c.b);" +
	"    gl_FragColor.r += (m[3] * c.a);" +
	"    gl_FragColor.r += m[4] * c.a;" +
	"gl_FragColor.g = (m[5] * c.r);" +
	"    gl_FragColor.g += (m[6] * c.g);" +
	"    gl_FragColor.g += (m[7] * c.b);" +
	"    gl_FragColor.g += (m[8] * c.a);" +
	"    gl_FragColor.g += m[9] * c.a;" +
	" gl_FragColor.b = (m[10] * c.r);" +
	"    gl_FragColor.b += (m[11] * c.g);" +
	"    gl_FragColor.b += (m[12] * c.b);" +
	"    gl_FragColor.b += (m[13] * c.a);" +
	"    gl_FragColor.b += m[14] * c.a;" +
	" gl_FragColor.a = (m[15] * c.r);" +
	"    gl_FragColor.a += (m[16] * c.g);" +
	"    gl_FragColor.a += (m[17] * c.b);" +
	"    gl_FragColor.a += (m[18] * c.a);" +
	"    gl_FragColor.a += m[19] * c.a;" +
	"}";

	//uniform from PIXI.ColorMatrixFilter
	var UNIFORMS =
	{
	    m: {
	        type: '1fv', value: [
	            1, 0, 0, 0, 0,
	            0, 1, 0, 0, 0,
	            0, 0, 1, 0, 0,
	            0, 0, 0, 1, 0
	        ]
	    }
	};
	
	
	/**
	 * The class to emulate some of the functionality of createjs.ColorFilter (multiplicative values only -Advanced Color option in Flash)
	 * (acts only as a container for multiplicative values, to be  used by DisplayObject)
	 * @class ColorFilter
	 * @param {Number} r red multiplier
	 * @param {Number} g green multiplier
	 * @param {Number} b blue multiplier
	 * @param {Number} a alpha multiplier
	 * @param {Number} rO red offset, 0-255
	 * @param {Number} gO green offset, 0-255
	 * @param {Number} bO blue offset, 0-255
	 * @param {Number} aO alpha offset, 0-255
	 */
	var ColorFilter = function(r, g, b, a, rO, gO, bO, aO)
	{
		if(r < 0)
			r = 0;
		if(g < 0)
			g = 0;
		if(b < 0)
			b = 0;
		
		if(!rO && !gO && !bO)
		{
			var max = 255;
			this.isTintOnly = true;
			this.tint = (Math.round(r * max) << 16) | (Math.round(g * max) << 8) | Math.round(b * max);
		}
		else
		{
			AbstractFilter.call(this, null, COLOR_FRAG, UNIFORMS);
			this.isTintOnly = false;
			this.uniforms.m.value = [r, 0, 0, 0, rO / 255,
									0, g, 0, 0, gO / 255,
									0, 0, b, 0, bO / 255,
									0, 0, 0, a, aO / 255];
		}
	};
	
	var s = AbstractFilter.prototype;
	var p = ColorFilter.prototype = Object.create(s);
	
	pixiflash.ColorFilter = ColorFilter;
	
}());