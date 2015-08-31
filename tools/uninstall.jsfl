(function()
{
	// Copy the script to the Tools folder
	var filename = 'PixiFlashPostPublish.jsfl';
	var path = fl.configURI + "Tools/" + filename;
	
	if (!FLfile.exists(path))
	{
		alert("Nothing to uninstall");
	}
	else
	{
		FLfile.remove(path);

		// Restart Flash
		fl.quit();
	}

}());