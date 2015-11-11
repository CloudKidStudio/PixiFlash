(function(PIXI)
{
	var Tween = function(target, startProps, endProps, startFrame, duration, ease)
	{
		//target display object
		this.target = target;
		//properties at the start of the tween
		this.startProps = startProps;
		//properties at the end of the tween, as well as any properties that are set
		//instead of tweened
		this.endProps = endProps;
		//duration of tween in frames. For a keyframe with no tweening, the duration
		//will be 0.
		this.duration = duration;
		//the frame that the tween starts on
		this.startFrame = startFrame;
		//the frame that the tween ends on
		this.endFrame = startFrame + duration;
		//easing function to use, if any
		this.ease = ease;
	};

	var p = Tween.prototype;
	
	function lerpValue(start, end, t)
	{
		//standard tweening
		return start + (end - start) * t;
	}
	
	function lerpColor(start, end, t)
	{
		//split r, g, b into separate values for tweening
		if(t < 0)
			t = 0;
		else if(t > 1)
			t = 1;
		var sR = start >> 16 & 0xFF;
		var sG = start >> 8 & 0xFF;
		var sB = start & 0xFF;
		var eR = end >> 16 & 0xFF;
		var eG = end >> 8 & 0xFF;
		var eB = end & 0xFF;
		var r = sR + (eR - sR) * percent;
		var g = sG + (eG - sG) * percent;
		var b = sB + (eB - sB) * percent;
		
		var combined = (r << 16) | (g << 8) | b;
		return combined;
	}
	
	var PI = Math.PI;
	var TWO_PI = PI * 2;
	
	function lerpRotation(start, end, t)
	{
		//handle 355 -> 5 degrees only going through a 10 degree change instead of
		//the long way around
		//Math from http://stackoverflow.com/a/2708740
		
		var difference = Math.abs(end - start);
		if (difference > PI)
		{
			// We need to add on to one of the values.
			if (end > start)
			{
				// We'll add it on to start...
				start += TWO_PI;
			}
			else
			{
				// Add it on to end.
				end += PI + TWO_PI;
			}
		}

		// Interpolate it.
		var value = (start + ((end - start) * t));

		// wrap to 0-2PI
		/*if (value >= 0 && value <= TWO_PI)
			return value;
		return value % TWO_PI;*/
		
		//just return, as it's faster
		return value;
	}
	
	Tween.propDict =
	{
		//position
		x: lerpValue,
		y: lerpValue,
		//scale
		sx: lerpValue,
		sy: lerpValue,
		//skew
		kx: lerpValue,
		ky: lerpValue,
		//rotation
		r: lerpRotation,
		//alpha
		a: lerpValue,
		//tinting
		t: lerpColor,
		//values to be set
		v: null,//visible
		m: null,//mask
		g: null,//not sure if we'll actually handle graphics this way?
		p: null//Graphic position/mode
	};
	
	p.setPosition = function(currentFrame)
	{
		//if this is a single frame with no tweening, or at the end of the tween, then
		//just speed up the process by setting values
		if(currentFrame >= this.endFrame)
			this.setToEnd();
		
		var time = (currentFrame - this.startFrame) / this.duration;
		if(this.ease)
			time = this.ease(time);
		var startProps = this.startProps;
		var endProps = this.endProps;
		for(var prop in endProps)
		{
			var lerp = Tween.propDict[prop];
			if(lerp)
				setPropFromShorthand(target, prop, lerp(startProps[prop], endProps[prop], time));
			else
				setPropFromShorthand(target, prop, endProps[prop]);
		}
	};
	
	p.setToEnd = function()
	{
		var endProps = this.endProps;
		for(var prop in endProps)
		{
			setPropFromShorthand(target, prop, endProps[prop]);
		}
	};
	
	function setPropFromShorthand(target, prop, value)
	{
		switch(prop)
		{
			case "x":
				target.position.x = value;
				break;
			case "y":
				target.position.y = value;
				break;
			case "sx":
				target.scale.x = value;
				break;
			case "sy":
				target.scale.y = value;
				break;
			case "kx":
				target.skew.x = value;
				break;
			case "ky":
				target.skew.y = value;
				break;
			case "r":
				target.rotation = value;
				break;
			case "a":
				target.alpha = value;
				break;
			case "t":
				target.tint = value;
				break;
			case "v":
				target.visible = value;
				break;
			case "m":
				target.mask = value;
				break;
			//g: null,//not sure if we'll actually handle graphics this way?
			case "p":
				target.mode = value.m;
				target.startPosition = value.sp;
				break;
		}
	}


	// Assign to namespace
	PIXI.flash.Tween = Tween;

}(PIXI));
/* jshint ignore:end */