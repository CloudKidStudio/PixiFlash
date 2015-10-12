(function (lib) {

var Container = PIXI.flash.Container;
var Text = PIXI.flash.Text;
var Graphics = PIXI.flash.Graphics;

// stage content:
lib.Text = Container.extend(function()
{
	Container.call(this);

	// Layer 1
	this.text = new Text("Prepare to die.", {
		font: "35px 'Verdana'", 
		fill: 0x33CC00,
		align: 'right',
		lineHeight: 37,
		wordWrap: true,
		wordWrapWidth: 511,
		padding: 10
	})
	.tr(654,285);

	this.text_1 = new Text("You killed my father.", {
		font: "35px 'Times'", 
		fill: "#1F2CB4",
		align: 'center',
		lineHeight: 37,
		wordWrap: true,
		wordWrapWidth: 511,
		padding: 10
	})
	.tr(398.5,237)
	.sh(0xFFFFFF);

	this.text_2 = new Text("My name is Inigo Montoya.", {
		font: "35px 'Helvetica'", 
		fill: "#FF0000",
		lineHeight: 37,
		wordWrap: true,
		wordWrapWidth: 510,
		padding: 10
	})
	.tr(143,185);

	// Layer 4
	this.shape = new Graphics()
		.f(0xCCCCCC)
		.p("EgqAANHIAA6NMBUBAAAIAAaNg")
		.tr(400,258);

	this.ad(
		this.shape,
		this.text_2,
		this.text_1,
		this.text
	);

});

})(lib = lib||{});
var lib;