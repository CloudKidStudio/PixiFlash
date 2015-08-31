(function(window)
{
	fl.addEventListener("postPublish", onPostPublish);

	function onPostPublish()
	{
		fl.showIdleMessage(false);
		postPublish();
		fl.showIdleMessage(true);
	}

	function postPublish()
	{
		// Get the current document
		var dom = fl.getDocumentDOM();
		
		// Ignore unsaved FLAs
		if (!dom.pathURI) return;

		// Check for canvas
		if (dom.type != "htmlcanvas") return;

		// The folder URI
		var folder = dirname(dom.pathURI);

		// If the FLA is uncompressed use the parent
		// folder for relative publish pathing
		if (/\.xfl$/i.test(dom.pathURI))
		{
			folder = dirname(folder);
		}

		// Add the trailing slash
		folder += "/";

		// Get the file name
		var filename = exportFile(dom);

		// No filename found
		if (!filename) return;

		var file = folder + filename;

		// Output file doesn't exist
		if (!FLfile.exists(file)) return;

		var content = FLfile.read(file);
		
		//find the 'var lib, images, createjs, ss;' line at the end of the file
		var varFinder = /var (\w+), (\w+), (\w+), (\w+);$/m;
		//also, the Flash 2014 'var lib, images, createjs;'
		var oldVarFinder = /var (\w+), (\w+), (\w+);$/m;
		
		var result = varFinder.exec(content) || oldVarFinder.exec(content);
		if(!result)
		{
			//don't throw an error or anything, as the standard post publish file should have caught
			//this and informed the user.
			return;
		}
		
		//result[1] == 'lib' or equivalent
		//result[2] == 'images' or equivalent
		//result[3] == 'createjs' or equivalent
		if(result[3] == "pixiflash")
		{
			if(result[1] != "pixiflash_lib")
			{
				fl.trace("Error: pixiflash documents must use 'pixiflash_lib' for the Symbols namespace.");
			}
			if(result[2] != "pixiflash_images")
			{
				fl.trace("Error: pixiflash documents must use 'pixiflash_images' for the Images namespace.");
			}
			if(content.indexOf("new Shape(") > -1 || content.indexOf("new cjs.Shape("))
			{
				fl.trace("Error: pixiflash documents can't contain Shapes");
			}
		}
	}
	
	/**
	 * Get the director path from another path
	 * @method  dirname
	 * @private
	 * @param  {string} path The incoming path
	 * @return {string} The base parent folder
	 */
	function dirname(path)
	{
		return path.replace(/\\/g, '/')
		.replace(/\/[^\/]*\/?$/, '');
	}
	
	/**
	 * Get an export filename
	 * @method exportFile
	 * @return {String|null} The export filename
	 */
	function exportFile(dom)
	{
		// We need to get some information from the publish profile
		// this includes the path to the images, the libs namespace
		// and the export file name
		var profile = dom.exportPublishProfileString(),
			xml = new XML(profile),
			properties = xml.PublishProperties,
			name;

		for (var i = 0, len = properties.length(); i < len; i++)
		{
			name = properties[i].attribute('name');

			// Ignore other PublishProperties properties other than HTML
			if (name != "JavaScript/HTML") continue;
			
			// Get the list of properties
			var props = properties[i].Property;

			// Find the export filename
			for (var j = 0, l = props.length(); j < l; j++)
			{
				name = props[j].attribute('name');
				if (name == "filename") return String(props[j]);
			}
		}
		return null;
	}

}(window));