/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiText = PIXI.Text,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Text
	 * @class Text
	 * @extends PIXI.Text
	 */
	var Text = function(text, font, color)
	{
		PixiText.call(this, text, { 
			font: font, 
			fill: color,
			padding: 10 // so text doesn't get cut off
		});
		DisplayObject.call(this);
	};
	
	// Extend PIXI.Text
	var p = Text.prototype = Object.create(PixiText.prototype);

	Object.defineProperties(p, 
	{
		/**
		 * The text align
		 * @property {String} textAlign 
		 */
		textAlign: 
		{
			set: function(align)
			{
				if (align == "center")
					this.anchor.x = 0.5;
				else if (align == "right")
					this.anchor.x = 1;
				else 
					this.anchor.x = 0;

				this.style.align = align;
			}, 
			get: function()
			{
				return this.style.align;
			}
		},
		/**
		 * The text line height
		 * @property {Number} lineHeight 
		 */
		lineHeight: 
		{
			set: function(lineHeight)
			{
				this.style.lineHeight = lineHeight;
			},
			get: function()
			{
				return this.style.lineHeight;
			}
		},
		/**
		 * The text line width
		 * @property {Number} lineWidth 
		 */
		lineWidth: 
		{
			set: function(wordWrapWidth)
			{
				this.style.wordWrapWidth = wordWrapWidth;
			},
			get: function()
			{
				return this.style.wordWrapWidth;
			}
		},
		shadow: 
		{
			set: function(shadow)
			{
				this.style.dropShadow = !!shadow;
				if (shadow)
				{
					this.style.dropShadowColor = shadow.color;
					// CreateJS can't handle these
					// this.style.dropShadowAngle = shadow.angle;
					// this.style.dropShadowDistance = shadow.distance;
				}
			}
		}
	});
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Text;
	
	// Assign to namespace
	pixiflash.Text = Text;
	
}());