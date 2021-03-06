(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
var MovieClip = cjs.MovieClip;
var Bitmap = cjs.Bitmap;
var Tween = cjs.Tween;
var Rectangle = cjs.Rectangle;
var Shape = cjs.Shape;

// library properties:




// symbols:



(lib.MaskedSprite = function() {
	this.initialize(img.MaskedSprite);
}).prototype = p = new Bitmap();
p.nominalBounds = new Rectangle(0,0,370,233);


// stage content:
(lib.Masking = function(mode,startPosition,loop) {
	var shape_1;
	var shape;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// mask (mask)
	var mask = new Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("AcHLuQAACNgkCCQgkCBhDByQhDByhdBdQhcBchyBDQhyBDiCAkQiCAkiNAAQjUgBi5hPQi4hPiMiLQiKiMhOi5QhPi4gCjUQABiOAkiCQAkiBBDhyQBDhyBahdQBdhaByhDQBxhDCCgkQCCgkCNAAQCNAACCAkQCCAkByBDQByBDBcBaQBdBdBDByQBDByAkCBQAkCCAACOg");
	var mask_graphics_12 = new cjs.Graphics().p("AKxhsMAkQAAAIAAdfMgkQAAAg");

	this.timeline.addTween(Tween.get(mask).to({graphics:mask_graphics_0,x:180,y:177}).wait(12).to({graphics:mask_graphics_12,x:301,y:178}).wait(13));

	// sprite
	instance = this.instance = new lib.MaskedSprite();
	instance.setTransform(167,130);

	instance.mask = mask;

	this.timeline.addTween(Tween.get(instance).wait(25));

	// shape 1
	shape = this.shape = new Shape();
	shape.graphics.f("#666699").s().dr(-94,-148.5,188,297);
	shape.setTransform(350,259.5);

	shape.mask = mask;

	this.timeline.addTween(Tween.get(shape).wait(25));

	// shape 2
	shape_1 = this.shape_1 = new Shape();
	shape_1.graphics.f("#004166").s().dr(-283,-171,566,342);
	shape_1.setTransform(391,257);

	shape_1.mask = mask;

	this.timeline.addTween(Tween.get(shape_1).wait(25));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(551,400,204,204);

})(pixiflash_lib = pixiflash_lib||{}, pixiflash_images = pixiflash_images||{}, pixiflash = pixiflash||{}, ss = ss||{});
var pixiflash_lib, pixiflash_images, pixiflash, ss;