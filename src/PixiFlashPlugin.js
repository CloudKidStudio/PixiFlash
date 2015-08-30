/**
 * @module Pixi Flash
 * @namespace pixiflash
 * @requires Core, Pixi Display
 */
(function()
{
	if(!window.include || !include('springroll')) return;
	
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	plugin.setup = function()
	{	
		this.assetManager.register('pixiflash.FlashArtTask', 60);
	};

}());