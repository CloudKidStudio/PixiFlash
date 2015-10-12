(function (lib) {

// Include classes
var Sprite = PIXI.flash.Sprite;
var Container = PIXI.flash.Container;
var ColorFilter = PIXI.flash.ColorFilter;
var Graphics = PIXI.flash.Graphics;
var fromFrame = PIXI.Texture.fromFrame;

// symbols:
lib.Bitmap1 = Sprite.extend(function()
{
	Sprite.call(this, fromFrame("Bitmap1"));
});

lib.Bitmap2 = Sprite.extend(function()
{
	Sprite.call(this, fromFrame("Bitmap2"));
});

lib.ShapeFace = Container.extend(function()
{
	Container.call(this);
	this.shape = new Graphics(graphics.ShapeFace);
	this.addChild(this.shape);
});

lib.BitmapFace = Container.extend(function() 
{
	Container.call(this);

	// Layer 2
	this.instance = new lib.Bitmap1()
		.tr(-58,-46.1);

	// Layer 1
	this.instance_1 = new lib.Bitmap2()
		.tr(-113.1,-114.1);

	this.ad(
		this.instance_1,
		this.instance
	);
});

// stage content:
lib.ColorEffects = Container.extend(function()
{
	Container.call(this);

	// Layer 2
	this.instance = new lib.BitmapFace()
		.tr(126,125.1,1,1,0,0,0,0.9,-0.1);

	this.instance_1 = new lib.ShapeFace()
		.tr(372,125,1,1,0,0,0,1,-0.1);

	this.instance_2 = new lib.BitmapFace()
		.tr(126,594,1,1,0,0,0,0.9,-0.1)
		.tn(1, 0.05078125, 0.328125);

	this.instance_3 = new lib.BitmapFace()
		.tr(126,360,1,1,0,0,0,0.9,-0.1)
		.tn(0.828125, 1, 0);

	this.instance_4 = new lib.ShapeFace()
		.tr(372,593.9,1,1,0,0,0,1,-0.1)
		.tn(0.2109375, 0.3515625, 1);

	this.instance_5 = new lib.ShapeFace()
		.tr(372,359.9,1,1,0,0,0,1,-0.1)
		.tn(0.8515625, 0.3515625, 1);

	this.ad(
		this.instance_5,
		this.instance_4,
		this.instance_3,
		this.instance_2,
		this.instance_1,
		this.instance
	);
});

})(lib = lib||{});
var lib;