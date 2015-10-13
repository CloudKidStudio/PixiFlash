(function(PIXI)
{
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
			}
			next();
		};
	};

	// Assign to the loader
	PIXI.loaders.Loader.addPixiMiddleware(BISONLoader);

}(PIXI));