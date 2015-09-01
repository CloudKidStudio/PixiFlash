/**
 * @module SpringRoll Plugin
 * @namespace pixiflash
 * @requires Pixi Flash
 */
(function()
{	
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	// Create a new plugin
	var plugin = new ApplicationPlugin();

	plugin.setup = function()
	{	
		this.assetManager.register('pixiflash.FlashArtTask', 60);
	};

}());