/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var AbstractFilter = PIXI.AbstractFilter;
	var PixiCMFilter = PIXI.filters.ColorMatrixFilter;
	
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
	 * The class to emulate some the functionality of the AdjustColor filter in Flash. This is a
	 * modified version of PIXI.filters.ColorMatrixFilter, with the same fragment shader as
	 * pixiflash.ColorFilter and a constructor to automatically apply the parameters from the
	 * ColorMatrix input.
	 * @class ColorMatrixFilter
	 * @param {pixiflash.ColorMatrix} colorData The ColorMatrix object containing color settings.
	 */
	var ColorMatrixFilter = function(colorData)
	{
		AbstractFilter.call(this, null, COLOR_FRAG, UNIFORMS);
		
		//values are handled in a specific order: hue, contrast, brightness, saturation
		if(colorData.hue !== 0)
		{
			this.hue(colorData.hue, true);
		}
		if(colorData.contrast !== 0)
		{
			this.contrast(colorData.contrast / 100, true);
		}
		//while PIXI.filters.ColorMatrixFilter has a brightness function, this is how
		//EaselJS and Flash handle it, instead of being a straight multiplier
		if(colorData.brightness !== 0)
		{
			var b = colorData.brightness / 255;
			var matrix =   [1, 0, 0, 0, b,
							0, 1, 0, 0, b,
							0, 0, 1, 0, b,
							0, 0, 0, 1, 0];
			this._loadMatrix(matrix, true);
		}
		if(colorData.saturation !== 0)
		{
			this.saturate(colorData.saturation / 100, true);
		}
	};
	
	var s = AbstractFilter.prototype;
	var p = ColorMatrixFilter.prototype = Object.create(s);
	
	pixiflash.ColorMatrixFilter = ColorMatrixFilter;
	
}());