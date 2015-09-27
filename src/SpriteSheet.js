/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function()
{
	// Impor classes
	var Rectangle = PIXI.Rectangle;
	var Texture = PIXI.Texture;
	var Loader = PIXI.loaders.Loader;

	/**
	 * SpriteSheet for export from flash
	 * @class SpriteSheet
	 * @constructor
	 * @param {Object} data The spritesheet to load
	 * @param {Array} data.images The collection of BaseTextures
	 * @param {Array} data.frames The collection of frames
	 */
	var SpriteSheet = function(data)
	{
		/**
		 * The collection of frames
		 * @property {Array} frames
		 * @private
		 */
		this.frames = [];

		/**
		 * The global id of the spriteshet
		 * @property {String} _id
		 * @private
		 */
		this._id = null;

		if (data)
		{
			this._addFrames(data);
		}
	};

	// Reference to prototype
	var p = SpriteSheet.prototype;

	/**
	 * Add the frames data
	 * @method _addFrames
	 * @private
	 * @param {Object} data The spritesheet to load
	 * @param {Array} data.images The collection of BaseTextures
	 * @param {Array} data.frames The collection of frames
	 */
	p._addFrames = function(data)
	{
		// Convert the frame into textures
		for(var frame, i = 0; i < data.frames.length; i++)
		{
			frame = data.frames[i];
			this.frames.push(new Texture(
				data.images[frame[4] || 0],
				new Rectangle(
					frame[0],
					frame[1],
					frame[2],
					frame[3]
				)
			));
		}
	};

	/**
	 * Get a frame of the spritesheet
	 * @method getFrame
	 * @param {int} index The index or frame to get
	 */
	p.getFrame = function(index)
	{
		return this.frames[index] || null;
	};

	/**
	 * Destroy the spritesheet
	 * @method destroy
	 */
	p.destroy = function()
	{
		if (this._id)
		{
			delete window.ss[this._id];
			this._id = null;
		}
		if (this.frames)
		{
			this.frames.forEach(function(frame)
			{
				frame.destroy(true);
			});
			this.frames = null;
		}
	};

	/**
	 * Get a frame of the spritesheet
	 * @method addToGlobal
	 * @param {String} id The id of the spritesheet
	 */
	p.addToGlobal = function(id)
	{
		// Make sure the global object is setup
		window.ss = window.ss || {};

		this._id = id;
		window.ss[id] = this;
	};

	/**
	 * Create a spritesheet
	 * @method fromData
	 * @static
	 * @param {Object} input The flash spritesheet data
	 * @param {function} Callback when complete
	 */
	SpriteSheet.fromData = function(input, done)
	{
		// Create a new spritesheet object
		var spriteSheet = new SpriteSheet();

		// Clone the data
		var data = {
			frames: input.frames.slice(),
			images: input.images.slice()
		};

		var id, loader = new Loader();

		// Add the images to the loader
		for(var file, i = 0; i < data.images.length; i++)
		{
			file = data.images[i];
			loader.add(file, file);
			
			// Get the first name and use as the global ID
			if (!id)
			{
				id = file;
				var index = id.indexOf('/');
				if (index > -1)
					id = file.substr(index + 1);
				id = id.substr(0, id.lastIndexOf('.'));
				spriteSheet.addToGlobal(id);
			}
		}

		// Load the images
		loader.once('complete', function(loader, resources)
		{
			// Replace the images paths with base textures
			for(var name in resources)
			{
				var i = data.images.indexOf(name);
				data.images[i] = resources[name].texture.baseTexture;
			}
			spriteSheet._addFrames(data);
			done(spriteSheet);
		});

		// Star the load
		loader.load();
	};

	// Assign to namespace
	pixiflash.SpriteSheet = SpriteSheet;

}());