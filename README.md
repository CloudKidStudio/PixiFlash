# PIXI Flash [![Build Status](https://travis-ci.org/CloudKidStudio/PixiFlash.svg)](https://travis-ci.org/CloudKidStudio/PixiFlash) [![Dependency Status](https://david-dm.org/CloudKidStudio/PixiFlash.svg)](https://david-dm.org/CloudKidStudio/PixiFlash)  [![GitHub version](https://badge.fury.io/gh/CloudKidStudio%2FPixiFlash.svg)](https://github.com/CloudKidStudio/PixiFlash/releases/latest)

A library for bridging CreateJS animations from Flash for use in Pixi.js. Publish Flash content like you normally would for CreateJS (with an HTML5 Canvas document), but export for Pixi.js instead. While there are some [known issues](https://github.com/CloudKidStudio/PixiFlash#known-issues) with this approach, it produces fast animation playback for WebGL and is superior to using Flash's WebGL document.

## Examples

* [Animation using all bitmaps](http://cloudkidstudio.github.io/PixiFlash/examples/animation/)
* [Animation using all vectors](http://cloudkidstudio.github.io/PixiFlash/examples/shapes/)
* [Masking](http://cloudkidstudio.github.io/PixiFlash/examples/masking/)
* [Color Effects](http://cloudkidstudio.github.io/PixiFlash/examples/color_effects/)
* [Text](http://cloudkidstudio.github.io/PixiFlash/examples/text/)

_Animated examples are from [Fizzy's Lunch Lab](http://pbskids.org/lunchlab/) and used with permission from Lunch Lab, LLC_

## Flash Publishing 

### Install Publishing Helper (optional)

Install the post-publish tool by running **tools/install.jsfl**. This provides some error checking when publishing for PIXI Flash, including error checking images and symbol namespaces.

### Flash Setup

1. Make sure you use a Flash "HTML5 Canvas" document type 
2. Change the publishing settings under JavaScript Namespaces
 * Symbols: **pixiflash_lib**
 * Images: **pixiflash_images**
 * CreateJS: **pixiflash**
3. Publishing document

## Running Content

### Installing Library

To run content exported with PixiFlash, you must load the JavaScript library within your project. You can install using [Bower](http://bower.io) or [NPM](http://www.npmjs.org):

#### Bower
```
bower install pixi-flash
```
#### NPM
```
npm install pixi-flash
```

### Dependencies

* [Pixi.js](http://pixijs.com) is required
* [TweenJS](http://createjs.com/tweenjs) is a dependency for doing timeline animation


### Usage

Here's a example using PIXI where the images were assembled using TexturePacker. See the **example** folder for an example which uses the Flash SpriteSheet exporting.

```js
var renderer = new PIXI.autoDetectRenderer(800, 500);
var stage = new PIXI.Container();

// Load the atlas for the character
var loader = new PIXI.loaders.Loader();

// This atlas is created with TexturePacker from the 
// output individual images from Flash publishing
loader.add('CharacterAtlas',"CharacterAtlas.json");
loader.once('complete',function(loader, resources)
{
	// Assign the atlas to global images in pixiflash_images
	pixiflash.utils.addImages(resources.CharacterAtlas);

	// Create the character, all library symbols live
	// on the pixiflash_lib window object
	var character = new pixiflash_lib.Character();
	character.framerate = 30;
	character.play();

	// Add to stage
	stage.addChild(character);
});
loader.load();

// Normal render
update();
function update()
{
    requestAnimationFrame(update);
    renderer.render(stage);
}
```

##Known Issues

* Abutting vector shapes create a small seams which make it possible to see the color underneath (similar to EaselJS)
* Complex shapes with a negative shape inside of it only render the outer-most shape. For example, a donut shape would only render the outer circle and not the hole.
* Cannot "Test Movie" in side of Flash to preview the animation
* No support for Text fields
* Flash Color Effects are supported only for Advanced style multiplicative color changes (RGB percents) by translating to PIXI 'tint' property. Additive color effects such as Tint, and the additive RGB modifiers in the Advanced Color Effect style will be ignored. The Brightness effect is only capable of darkening the symbol (Brightened symbols will be rendered darker than original). Keyframes and tweening of Color Effects are not supported.

##License

Copyright (c) 2015 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.
