/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(window)
{
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

	// Define PIXI Flash namespace
	window.PIXI.flash = {};

}(window));