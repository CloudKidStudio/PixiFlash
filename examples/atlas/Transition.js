(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
var Ease = cjs.Ease;
var MovieClip = cjs.MovieClip;
var Bitmap = cjs.Bitmap;
var Tween = cjs.Tween;
var Rectangle = cjs.Rectangle;
var Container = cjs.Container;

// library properties:




// symbols:



(lib.Bitmap1 = function() {
	this.initialize(img.Bitmap1);
}).prototype = p = new Bitmap();
p.nominalBounds = new Rectangle(0,0,16,16);


(lib.Transition1 = function() {
	this.initialize(img.Transition1);
}).prototype = p = new Bitmap();
p.nominalBounds = new Rectangle(0,0,300,16);


(lib.TransitionLoading = function() {
	this.initialize(img.TransitionLoading);
}).prototype = p = new Bitmap();
p.nominalBounds = new Rectangle(0,0,355,106);


(lib.loading = function() {
	var instance;
	this.initialize();

	// bitmap
	instance = this.instance = new lib.TransitionLoading();
	instance.setTransform(-190.3,-57.3);

	this.addChild(instance);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(-190.3,-57.3,355,106);


(lib.blue_shapes = function(mode,startPosition,loop) {
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	instance = this.instance = new lib.Transition1();

	instance_1 = this.instance_1 = new lib.Bitmap1();

	this.timeline.addTween(Tween.get({}).to({state:[{t:instance}]}).to({state:[{t:instance_1}]},1).wait(1));
	
	this.gotoAndStop(0);

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(0,0,300,16);


(lib.blue = function() {
	var instance_2;
	var instance_1;
	var instance;
	this.initialize();

	// blue_shapes
	instance = this.instance = new lib.blue_shapes("synched",0);
	instance.setTransform(1350,300,1,37.499,180,0,0,150,8);

	// blue_shapes
	instance_1 = this.instance_1 = new lib.blue_shapes("synched",1);
	instance_1.setTransform(11250,300,75,37.5,0,0,0,150,8);

	// blue_shapes
	instance_2 = this.instance_2 = new lib.blue_shapes("synched",0);
	instance_2.setTransform(-150,300,1,37.502,0,0,0,150,8);

	this.addChild(instance_2,instance_1,instance);
}).prototype = p = new Container();
p.nominalBounds = new Rectangle(-300,-0.1,1800,600.3);


// stage content:
(lib.Transition = function(mode,startPosition,loop) {
	var instance_1;
	var instance;
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{onTransitionOut:0,onTransitionOut_stop:48,onTransitionLoading:49,onTransitionLoading_loop:99,onTransitionIn:100,onTransitionIn_stop:126});

	// loading
	instance = this.instance = new lib.loading("synched",0);
	instance.setTransform(-230.8,293);
	instance._off = true;

	this.timeline.addTween(Tween.get(instance).wait(5).to({_off:false},0).to({x:643.2},7).to({x:616.2},4,Ease.get(0.5)).wait(84).to({startPosition:0},0).wait(1).to({regX:-12.8,regY:-4.4,x:601.7,y:288.6},0).wait(1).to({x:596.6},0).wait(1).to({x:588.6},0).wait(1).to({x:580.5},0).wait(1).to({x:575.1},0).wait(1).to({regX:0,regY:0,x:586.2,y:293},0).wait(1).to({regX:-12.8,regY:-4.4,x:587.5,y:288.6},0).wait(1).to({x:633.8},0).wait(1).to({x:717.5},0).wait(1).to({x:839.3},0).wait(1).to({x:988.1},0).wait(1).to({x:1139},0).wait(1).to({x:1265.1},0).wait(1).to({x:1352.7},0).wait(1).to({x:1401.5},0).wait(1).to({regX:0,regY:0,x:1429.2,y:293},0).to({_off:true},1).wait(10));

	// blue
	instance_1 = this.instance_1 = new lib.blue();
	instance_1.setTransform(-1366.3,0);
	instance_1._off = true;

	this.timeline.addTween(Tween.get(instance_1).wait(5).to({_off:false},0).to({x:0},11).wait(91).to({x:1500.3},9).to({_off:true},1).wait(10));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(508.8,300,1137.3,600);

})(pixiflash_lib = pixiflash_lib||{}, pixiflash_images = pixiflash_images||{}, pixiflash = pixiflash||{}, ss = ss||{});
var pixiflash_lib, pixiflash_images, pixiflash, ss;