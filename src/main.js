/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(window)
{
	//Set up namespaces, and check that PIXI and CreateJS have been set up
	//any failures will likely cause other failures in the library set up, but that's okay
	if (!window.PIXI)
	{
		if (DEBUG)
		{
			throw "Pixi Flash requires PIXI to be loaded before Pixi Flash is loaded!";
		}
		else
		{
			throw "Requires PIXI";
		}
	}

	// Check for TweenJS
	if (!window.createjs || !createjs.Tween)
	{
		if (DEBUG)
		{
			throw "PIXI Flash requires TweenJS to be loaded before Pixi Flash is loaded!";
		}
		else
		{
			throw "Requires TweenJS";
		}
	}

	// Add the pixiflash namespace
	if (!window.pixiflash)
	{
		window.pixiflash = {
			Rectangle: PIXI.Rectangle,
			Tween: createjs.Tween,
			Ease: createjs.Ease
		};
	}

	// Add namespace for pixiflash symbols from Flash
	if(!window.pixiflash_lib)
	{
		window.pixiflash_lib = {};
	}

	// Add namespace for pixiflash images from Flash
	if(!window.pixiflash_images)
	{
		window.pixiflash_images = {};
	}

}(window));