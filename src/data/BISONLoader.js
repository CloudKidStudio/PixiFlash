(function(PIXI)
{
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

	PIXI.loaders.Loader.addPixiMiddleware(BISONLoader);

}(PIXI));