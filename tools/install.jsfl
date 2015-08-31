(function()
{
	// Copy the script to the Tools folder
	var filename = 'PixiFlashPostPublish.jsfl';
	FLfile.copy(
		fl.scriptURI.replace('install.jsfl', filename), 
		fl.configURI + "Tools/" + filename
	);

	alert("PixiFlash Publish scrip installed. Restart Flash.");

	// Restart Flash
	fl.quit();

}());