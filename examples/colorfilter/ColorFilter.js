(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
var Sprite = cjs.Sprite;
var Rectangle = cjs.Rectangle;
var Container = cjs.Container;
var Shape = cjs.Shape;

// library properties:




// symbols:



(lib.Bitmap1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["ColorFilter_atlas_"];
	this.gotoAndStop(0);
}).prototype = p = new Sprite();



(lib.Bitmap2 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["ColorFilter_atlas_"];
	this.gotoAndStop(1);
}).prototype = p = new Sprite();



(lib.ShapeFace = function() {
	var shape_3;
	var shape_2;
	var shape_1;
	var shape;
	this.initialize();

	// Layer 2
	shape = this.shape = new Shape();
	shape.graphics.f().s("#666666").ss(16.2,1,1).p("AiBAAQAAA2AmAmQAnAmA0AAQA1AAAngmQAmgmAAg2QAAg0gmgnQgnglg1AAQg0AAgnAlQgmAnAAA0g");
	shape.setTransform(37,-25);

	shape_1 = this.shape_1 = new Shape();
	shape_1.graphics.f("#666666").s().p("ADnHVQgggfAAgrQAAgsAggfQAegeAsAAQArAAAfAeQAfAfAAAsQAAArgfAfQgfAegrAAQgsAAgegegAlykUQgmgmAAg2QAAg2AmgnQAmglA1gBQA2ABAmAlQAmAnAAA2QAAA2gmAmQgmAmg2gBQg1ABgmgmg");
	shape_1.setTransform(-17,12);

	shape_2 = this.shape_2 = new Shape();
	shape_2.graphics.f("#CCCCCC").s().p("AhaBcQgmgmAAg2QAAg0AmgnQAmglA0gBQA2ABAlAlQAnAnAAA0QAAA2gnAmQglAmg2gBQg0ABgmgmg");
	shape_2.setTransform(37,-25);

	// Layer 1
	shape_3 = this.shape_3 = new Shape();
	shape_3.graphics.f("#FFFFFF").s("#999999").ss(16.2,1,1).de(-106,-106,212,212);
	shape_3.setTransform(1,0,1,1,0,0,180);

	this.addChild(shape_3,shape_2,shape_1,shape);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(-113.1,-114.1,228.2,228.2);


(lib.BitmapFace = function() {
	var instance_1;
	var instance;
	this.initialize();

	// Layer 2
	instance = this.instance = new lib.Bitmap1();
	instance.setTransform(-58,-46.1);

	// Layer 1
	instance_1 = this.instance_1 = new lib.Bitmap2();
	instance_1.setTransform(-113.1,-114.1);

	this.addChild(instance_1,instance);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(-113.1,-114.1,228,228);


// stage content:
(lib.ColorFilter = function() {
	var instance_3;
	var instance_2;
	var instance_1;
	var instance;
	this.initialize();

	// Layer 2
	instance = this.instance = new lib.BitmapFace();
	instance.setTransform(149,392,1,1,0,0,0,0.9,-0.1);
	instance.filters = [new cjs.ColorFilter(1, 0.05078125, 0.328125, 1, 0, 0, 0, 0)];
	instance.cache(-115,-116,232,232);

	instance_1 = this.instance_1 = new lib.BitmapFace();
	instance_1.setTransform(149,135,1,1,0,0,0,0.9,-0.1);
	instance_1.filters = [new cjs.ColorFilter(0.828125, 1, 0, 1, 0, 0, 0, 0)];
	instance_1.cache(-115,-116,232,232);

	instance_2 = this.instance_2 = new lib.ShapeFace();
	instance_2.setTransform(395,391.9,1,1,0,0,0,1,-0.1);
	instance_2.filters = [new cjs.ColorFilter(0.2109375, 0.3515625, 1, 1, 0, 0, 0, 0)];
	instance_2.cache(-115,-116,232,232);

	instance_3 = this.instance_3 = new lib.ShapeFace();
	instance_3.setTransform(395,134.9,1,1,0,0,0,1,-0.1);
	instance_3.filters = [new cjs.ColorFilter(0.8515625, 0.3515625, 1, 1, 0, 0, 0, 0)];
	instance_3.cache(-115,-116,232,232);

	this.addChild(instance_3,instance_2,instance_1,instance);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(310,295.9,474.1,485.2);

})(pixiflash_lib = pixiflash_lib||{}, pixiflash_images = pixiflash_images||{}, pixiflash = pixiflash||{}, ss = ss||{});
var pixiflash_lib, pixiflash_images, pixiflash, ss;