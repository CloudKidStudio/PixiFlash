(function(undefined)
{
	//Set up namespaces, and check that PIXI and CreateJS have been set up
	//any failures will likely cause other failures in the library set up, but that's okay
	if(!window.PIXI)
	{
		console.error("Pixi Flash requires PIXI to be loaded before Pixi Flash is loaded!");
		return;
	}
	if(!window.createjs || !createjs.Tween)
	{
		console.error("PIXI Flash requires TweenJS to be loaded before Pixi Flash is loaded!");
		return;
	}
	if(!window.pixiflash)
		window.pixiflash =
		{
			Rectangle: PIXI.Rectangle,
			Tween: createjs.Tween,
			Ease: createjs.Ease
		};
	if(!window.pixiflash_lib)
		window.pixiflash_lib = {};
	if(!window.pixiflash_images)
		window.pixiflash_images = {};
}());