/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(window)
{
	/**
	 * Utilities for converting 
	 * @class utils
	 */
	var utils = {};

	/**
	 * Convert the loaded texture atlas to images
	 * @method addImages
	 * @static
	 * @param {PIXI.Texture} atlas The atlas to convert images
	 */
	utils.addImages = function(atlas)
	{
		var id;

		// This needs to happen before we create the character
		// so that the textures exist for the movieclip
		for(var frame in atlas.textures)
		{
			// Remove the file extension from the image name
			id = frame.substring(0, frame.indexOf("."));
			window.pixiflash_images[id] = atlas.textures[frame];
		}
	};

	// Assign to namespace
	pixiflash.utils = utils;

}(window));