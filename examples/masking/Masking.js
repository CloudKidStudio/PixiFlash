(function (lib) {

var MovieClip = PIXI.flash.Container;
var Mask = PIXI.flash.Mask;
var Graphics = PIXI.flash.Graphics;

// stage content:
lib.Masking = MovieClip.extend(function(mode, startPosition, loop)
{
	MovieClip.call(this, mode, startPosition, loop);

	// Layer 2 (mask)
	var mask_graphics_0 = new Mask(180, 177, "AcHLuQAACNgkCCQgkCBhDByQhDByhdBdQhcBchyBDQhyBDiCAkQiCAkiNAAQjUgBi5hPQi4hPiMiLQiKiMhOi5QhPi4gCjUQABiOAkiCQAkiBBDhyQBDhyBahdQBdhaByhDQBxhDCCgkQCCgkCNAAQCNAACCAkQCCAkByBDQByBDBcBaQBdBdBDByQBDByAkCBQAkCCAACOg");
	var mask_graphics_12 = new Mask(301, 178, "AKxhsMAkQAAAIAAdfMgkQAAAg");

	// this.timeline.addTween(
	// 	Tween.get(this)
	// 		.to({ mask: mask_graphics_0 })
	// 		.wait(12)
	// 		.to({ mask: mask_graphics_12 })
	// 		.wait(13)
	// );

	// Layer 3
	this.shape = new Graphics()
		.f(0x666699)
		.dr(-94,-148.5,188,297)
		.tr(350,259.5)
		.ma(mask_graphics_0);

	// this.timeline.addTween(Tween.get(shape).wait(25));

	// Layer 1
	this.shape_1 = new Graphics()
		.f(0x004166)
		.dr(-283,-171,566,342)
		.tr(391,257)
		.ma(mask_graphics_0);

	// this.timeline.addTween(Tween.get(shape_1).wait(25));

	this.ad(
		mask_graphics_0,
		mask_graphics_12,
		this.shape_1,
		this.shape
	);

});

})(lib = lib||{});
var lib;