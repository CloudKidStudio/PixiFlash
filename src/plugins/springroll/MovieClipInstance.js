/**
 * @module SpringRoll Plugin
 * @namespace pixiflash
 * @requires Pixi Flash
 */
(function(undefined)
{
	var MovieClip = include('pixiflash.MovieClip');
	var AnimatorInstance = include('springroll.AnimatorInstance');
	var GenericMovieClipInstance = include('springroll.GenericMovieClipInstance');

	/**
	 * The plugin for working with movieclip and animator
	 * @class MovieClipInstance
	 * @extends springroll.GenericMovieClipInstance
	 * @private
	 */
	var MovieClipInstance = function()
	{
		GenericMovieClipInstance.call(this);
	};

	/**
	 * Required to test clip
	 * @method test
	 * @static
	 * @param {*} clip The object to test
	 * @return {Boolean} If the clip is compatible with this plugin
	 */
	MovieClipInstance.test = function(clip)
	{
		return clip instanceof MovieClip;
	};
	
	MovieClipInstance.hasAnimation = GenericMovieClipInstance.hasAnimation;
	MovieClipInstance.getDuration = GenericMovieClipInstance.getDuration;

	// Inherit the AnimatorInstance
	var s = GenericMovieClipInstance.prototype;
	var p = AnimatorInstance.extend(MovieClipInstance, GenericMovieClipInstance);
	
	p._Generic_beginAnim = p.beginAnim;
	
	p.beginAnim = function(animObj, isRepeat)
	{
		this._Generic_beginAnim(animObj, isRepeat);
		
		//because pixiflash.MovieClip no longer updates the timeline in advance(), we need
		//to make sure the timeline is updated immediately in this case
		this.clip._updateTimeline();
	};
	
	p._Generic_setPosition = p.setPosition;
	p.setPosition = function(newPos)
	{
		this._Generic_setPosition(newPos);
		
		//update the timeline manually, because MovieClips that are children of other PixiFlash
		//display objects won't get their ticks fired when tickEnabled is false.
		this.clip._updateTimeline();
	};

	// Assign to namespace
	namespace('pixiflash').MovieClipInstance = MovieClipInstance;

}());