# PIXI Flash [![Build Status](https://travis-ci.org/SpringRoll/PixiFlash.svg)](https://travis-ci.org/SpringRoll/PixiFlash) [![Dependency Status](https://david-dm.org/SpringRoll/PixiFlash.svg)](https://david-dm.org/SpringRoll/PixiFlash)

A library for bridging CreateJS animations from Flash for use in PIXI. Publish Flash content like you normally would for CreateJS, but export for Flash. There can be _no_ vectors used, this publishing process only supports bitmaps, movieclips and timeline animations.

## Flash Publishing 

### Installing

Install the post-publish tool by running **tools/install.jsfl**. This will allow for some error checking when publishing for PIXI Flash.

### Flash Setup

* Make sure you use a Flash "HTML5 Canvas" document type 
* Change the publishing settings under JavaScript Namespaces
 * Symbols: **pixiflash_lib**
 * Images: **pixiflash_images**
 * CreateJS: **pixiflash**
* Publishing document

## Running Content

### Installing Library

To run content exported with PixiFlash, you must load the JavaScript library within your project. You can install using [Bower](http://bower.io):

```
bower install SpringRoll/PixiFlash
```

### Dependencies

[TweenJS](http://createjs.com/tweenjs) is a dependency for doing timeline animation. Make sure this is also included in your project.
