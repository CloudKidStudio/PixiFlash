(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 790,
	height: 500,
	fps: 30,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



// stage content:
(lib.Text = function() {
	this.initialize();

	// Layer 1
	this.text = new cjs.Text("Prepare to die.", "35px 'Verdana'", "#33CC00");
	this.text.textAlign = "right";
	this.text.lineHeight = 37;
	this.text.lineWidth = 511;
	this.text.setTransform(654,285);

	this.text_1 = new cjs.Text("You killed my father.", "35px 'Times'", "#1F2CB4");
	this.text_1.textAlign = "center";
	this.text_1.lineHeight = 37;
	this.text_1.lineWidth = 511;
	this.text_1.setTransform(398.5,237);
	this.text_1.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,4);

	this.text_2 = new cjs.Text("My name is Inigo Montoya.", "35px 'Helvetica'", "#FF0000");
	this.text_2.lineHeight = 37;
	this.text_2.lineWidth = 510;
	this.text_2.setTransform(143,185);

	// Layer 4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#CCCCCC").s().p("EgqAANHIAA6NMBUBAAAIAAaNg");
	this.shape.setTransform(400,258);

	this.addChild(this.shape,this.text_2,this.text_1,this.text);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(526,424,538,168);

})(pixiflash_lib = pixiflash_lib||{}, pixiflash_images = pixiflash_images||{}, pixiflash = pixiflash||{}, ss = ss||{});
var pixiflash_lib, pixiflash_images, pixiflash, ss;