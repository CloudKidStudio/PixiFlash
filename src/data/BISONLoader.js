/**
 * @module Pixi Flash
 * @namespace PIXI
 */
(function(PIXI)
{
	/**
	 * Contains the collection of graphics data
	 * @class GraphicsCache
	 */
	PIXI.GraphicsCache = PIXI.GraphicsCache ||
	{};

	/**
	 * The middleware for PIXI's ResourceLoader to be able to 
	 * decode the laoding for bson files, which are graphic maps.
	 * @class BISONLoader
	 */
	var BISONLoader = function()
	{
		return function(resource, next)
		{
			if (/\.bson$/i.test(resource.url))
			{
				resource.data = BISON.decode(resource.data);
				for (var name in resource.data)
				{
					PIXI.GraphicsCache[name] = resource.data[name];
				}
			}
			next();
		};
	};

	// Assign to the loader
	PIXI.loaders.Loader.addPixiMiddleware(BISONLoader);

}(PIXI));