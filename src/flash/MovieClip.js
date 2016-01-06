/**
 * @module Pixi Flash
 * @namespace PIXI.flash
 */
(function(PIXI, undefined)
{
	var Container = PIXI.Container,
		DisplayObject = PIXI.DisplayObject,
		Timeline = PIXI.flash.Timeline,
		Tween = PIXI.flash.Tween,
		SharedTicker = PIXI.ticker.shared;

	/**
	 * The class to emulate createjs.MovieClip, requires TweenJS
	 * @class MovieClip
	 * @extends PIXI.Container
	 */
	var MovieClip = function(mode, startPosition, loop, labels)
	{
		Container.call(this);

		/**
		 * Controls how this MovieClip advances its time. Must be one of 0 (INDEPENDENT), 1 (SINGLE_FRAME), or 2 (SYNCHED).
		 * See each constant for a description of the behaviour.
		 * @property mode
		 * @type String
		 * @default null
		 **/
		this.mode = mode || MovieClip.INDEPENDENT;

		/**
		 * Specifies what the first frame to play in this movieclip, or the only frame to display if mode is SINGLE_FRAME.
		 * @property startPosition
		 * @type Number
		 * @default 0
		 */
		this.startPosition = startPosition || 0;

		/**
		 * Indicates whether this MovieClip should loop when it reaches the end of its timeline.
		 * @property loop
		 * @type Boolean
		 * @default true
		 */
		this.loop = !!loop;

		/**
		 * The current frame of the movieclip.
		 * @property currentFrame
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		this.currentFrame = 0;
		
		this._labels = [];
		this._labelDict = labels || {};
		if (labels)
		{
			for (var name in labels)
			{
				var label = {
					label: name,
					position: labels[name]
				};
				this._labels.push(label);
			}
			this._labels.sort(function(a, b)
				{
					return a.position - b.position;
				});
		}

		/**
		 * If true, this movieclip will animate automatically whenever it is on the stage.
		 * @property selfAdvance
		 * @type Boolean
		 * @default true
		 */
		this.selfAdvance = true;

		/**
		 * If true, the MovieClip's position will not advance when ticked.
		 * @property paused
		 * @type Boolean
		 * @default false
		 */
		this.paused = false;

		/**
		 * If true, actions in this MovieClip's tweens will be run when the playhead advances.
		 * @property actionsEnabled
		 * @type Boolean
		 * @default true
		 */
		this.actionsEnabled = true;

		/**
		 * If true, the MovieClip will automatically be reset to its first frame whenever the timeline adds
		 * it back onto the display list. This only applies to MovieClip instances with mode=INDEPENDENT.
		 * <br><br>
		 * For example, if you had a character animation with a "body" child MovieClip instance
		 * with different costumes on each frame, you could set body.autoReset = false, so that
		 * you can manually change the frame it is on, without worrying that it will be reset
		 * automatically.
		 * @property autoReset
		 * @type Boolean
		 * @default true
		 */
		this.autoReset = true;

		/**
		 * @property _synchOffset
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._synchOffset = 0;

		/**
		 * @property _prevPos
		 * @type Number
		 * @default -1
		 * @private
		 */
		this._prevPos = -1; // TODO: evaluate using a ._reset Boolean prop instead of -1.

		/**
		 * Note - changed from default: When the MovieClip is framerate independent, this is the time
		 * elapsed from frame 0 in seconds.
		 * @property _t
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._t = 0;

		/**
		 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
		 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
		 * framerate.
		 *
		 * @property _framerate
		 * @type {Number}
		 * @default 0
		 **/
		this._framerate = 0;
		/**
		 * The total time in seconds for the animation. This is changed when setting the framerate.
		 * @property _duration
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._duration = 0;
		
		/**
		 * The total duration in frames for the animation.
		 * @property _frameDuration
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._frameDuration = 0;
		
		/**
		 * Standard tween timelines for all objects. Each element in the _timelines array
		 * is an array of tweens for one target, in order of occurrence.
		 * @property _timelines
		 * @type Array
		 * @protected
		 **/
		this._timelines = [];
		
		/**
		 * Array of frame scripts, indexed by frame.
		 * @property _actions
		 * @type {Array}
		 * @protected
		 */
		this._actions = [];
		
		if(this.mode == MovieClip.INDEPENDENT)
		{
			this._tickListener = this._tickListener.bind(this);
			this._onAdded = this._onAdded.bind(this);
			this._onRemoved = this._onRemoved.bind(this);
			this.on("added", this._onAdded);
			this.on("removed", this._onRemoved);
		}
	};

	/**
	 * The MovieClip will advance independently of its parent, even if its parent is paused.
	 * This is the default mode.
	 * @property INDEPENDENT
	 * @static
	 * @type String
	 * @default "independent"
	 * @readonly
	 **/
	MovieClip.INDEPENDENT = "independent";

	/**
	 * The MovieClip will only display a single frame (as determined by the startPosition property).
	 * @property SINGLE_FRAME
	 * @static
	 * @type String
	 * @default "single"
	 * @readonly
	 **/
	MovieClip.SINGLE_FRAME = "single";

	/**
	 * The MovieClip will be advanced only when its parent advances and will be synched to the position of
	 * the parent MovieClip.
	 * @property SYNCHED
	 * @static
	 * @type String
	 * @default "synched"
	 * @readonly
	 **/
	MovieClip.SYNCHED = "synched";

	var p = MovieClip.prototype = Object.create(Container.prototype);

	//constructor for backwards/Flash exporting compatibility
	p.initialize = MovieClip;

	p._onAdded = function()
	{
		SharedTicker.add(this._tickListener);
	};

	p._tickListener = function(tickerDeltaTime)
	{
		if(this.paused || !this.selfAdvance)
		{
			//see if the movieclip needs to be updated even though it isn't animating
			if(this._prevPos < 0)
				this._goto(this.currentFrame);
			return;
		}
		var seconds = tickerDeltaTime / SharedTicker.speed / PIXI.TARGET_FPMS / 1000;
		this._tick(seconds);
	};

	p._onRemoved = function()
	{
		SharedTicker.remove(this._tickListener);
	};

	/**
	 * Returns a sorted list of the labels defined on this AdvancedMovieClip.
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame)
	 *                        properties.
	 */
	p.getLabels = function()
	{
		return this._labels;
	};

	/**
	 * Returns the name of the label on or immediately before the current frame.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 */
	p.getCurrentLabel = function()
	{
		var labels = this._labels;
		var current = null;
		for (var i = 0, len = labels.length; i < len; ++i)
		{
			if (labels[i].position <= this.currentFrame)
				current = labels[i].label;
			else
				break;
		}
		return current;
	};

	/**
	 * Returns an array of objects with label and position (aka frame) properties, sorted by position.
	 * @property labels
	 * @type {Array}
	 * @readonly
	 **/

	/**
	 * Returns the name of the label on or immediately before the current frame.
	 * @property currentLabel
	 * @type {String}
	 * @readonly
	 **/
	try
	{
		Object.defineProperties(p,
		{
			labels:
			{
				get: p.getLabels
			},
			currentLabel:
			{
				get: p.getCurrentLabel
			}
		});
	}
	catch (e)
	{}

	/**
	 * When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime',
	{
		get: function()
		{
			return this._t;
		},
		set: function(value)
		{
			this._t = value;
		}
	});

	/**
	 * By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 *
	 * For example, if a MovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the MovieClip will
	 * advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	 * vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	 * passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate',
	{
		get: function()
		{
			return this._framerate;
		},
		set: function(value)
		{
			if (value > 0)
			{
				this._framerate = value;
				this._duration = value ? this._frameDuration / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});
	
	/**
	 * Add a tween to the clip
	 * @method addTween
	 * @param {PIXI.DisplayObject} instance The clip to tween
	 * @param {Object} properties The property or property to tween
	 * @param {int} startFrame The frame to start tweening
	 * @param {int} [duration=0] Number of frames to tween. If 0, then the properties are set
	 *                           with no tweening.
	 * @param {Function} [ease] An optional easing function that takes the tween time from 0-1.
	 * @return {MovieClip}
	 */
	p.tw = p.addTween = function(instance, properties, startFrame, duration, ease)
	{
		//1. determine if there is already a tween for this instance, and if so prepare to add it
		//   on/insert it - if there isn't, then make one and set up a wait until startFrame
		var timeline, i;
		for(i = this._timelines.length - 1; i >= 0; --i)
		{
			if(this._timelines[i].target == instance)
			{
				timeline = this._timelines[i];
				break;
			}
		}
		if(!timeline)
		{
			timeline = new Timeline(instance);
			this._timelines.push(timeline);
		}
		//2. create the tween segment, recording the starting values of properties and using the
		//   supplied properties as the ending values
		timeline.addTween(instance, properties, startFrame, duration, ease);
		return this;
	};
	
	/**
	 * Add a child to show for a certain number of frames before automatic removal.
	 * @method addTimedChild
	 * @param {PIXI.DisplayObject} instance The clip to show
	 * @param {int} startFrame The starting frame
	 * @param {int} [duration=1] The number of frames to display the child before removing it.
	 * @return {MovieClip}
	 */
	p.at = p.addTimedChild = function(instance, startFrame, duration)
	{
		if(startFrame == null)// jshint ignore:line
			startFrame = 0;
		if(duration == null || duration < 1)// jshint ignore:line
			duration = 1;
		//TODO: add tweening info about this child's visibility/presence on stage
		//when the child is added, if it has 'autoReset' set to true, then it should be set back to
		//frame 0
		return this;
	};
	
	/**
	 * Handle frame actions, callback is bound to the instance of the MovieClip
	 * @method addAction
	 * @param {Function} callback The clip call on a certain frame
	 * @param {int} startFrame The starting frame
	 * @return {MovieClip}
	 */
	p.aa = p.addAction = function(callback, startFrame)
	{
		var _actions = this._actions;
		//ensure that the movieclip timeline is long enough to support the target frame
		if(_actions.length <= startFrame)
			_actions.length = startFrame + 1;
		if(this._frameDuration <= startFrame)
			this._frameDuration = startFrame;
		//add the action
		if(_actions[startFrame])
		{
			_actions[startFrame].push(callback);
		}
		else
		{
			_actions[startFrame] = [callback];
		}
		return this;
	};

	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function()
	{
		this.paused = false;
	};

	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function()
	{
		this.paused = true;
	};

	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel)
	{
		this.paused = false;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel)
	{
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in seconds to advance by. Only applicable if framerate is set.
	 * @method advance
	 */
	p.advance = function(time)
	{
		if (!this._framerate)
		{
			var o = this,
				fps = o._framerate;
			while ((o = o.parent) && !fps)
			{
				if (o.mode == independent)
				{
					fps = o._framerate;
				}
			}
			this.framerate = fps;
		}

		if (time)
			this._t += time;
		if (this._t > this._duration)
			this._t = this.timeline.loop ? this._t - this._duration : this._duration;
		//add a tiny amount to account for potential floating point errors
		this.currentFrame = Math.floor(this._t * this._framerate + 0.00000001);
		//final error checking
		if (this.currentFrame >= this._frameDuration)
			this.currentFrame = this._frameDuration - 1;
		//update all tweens & actions in the timeline
		this._updateTimeline();
	};

	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in seconds.
	 * @protected
	 **/
	p._tick = function(delta)
	{
		this.advance(delta);
	};

	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel)
	{
		var pos = typeof positionOrLabel == "string" ? this._labelDict[positionOrLabel] : positionOrLabel;
		if (pos == null)// jshint ignore:line
		{
			return;
		}
		// prevent _updateTimeline from overwriting the new position because of a reset:
		if (this._prevPos == -1)
		{
			this._prevPos = NaN;
		}
		this.currentFrame = pos;
		//update the elapsed time if a time based movieclip
		if (this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};

	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function()
	{
		this._prevPos = -1;
		this._t = 0;
		this.currentFrame = 0;
	};

	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function()
	{
		var synched = this.mode != MovieClip.INDEPENDENT;
		
		if(synched)
		{
			this.currentFrame = this.startPosition + (this.mode == MovieClip.SINGLE_FRAME ? 0 : this._synchOffset);
		}
		
		if (this._prevPos == this.currentFrame)
		{
			return;
		}
		
		// update timeline position, ignoring actions if this is a graphic.
		var startFrame = this._prevPos < 0 ? 0 : this._prevPos;
		this._setTimelinePosition(startFrame, this.currentFrame, synched ? false : this.actionsEnabled);
		
		this._prevPos = this.currentFrame;
	};
	
	p._setTimelinePosition = function(startFrame, currentFrame, doActions)
	{
		//handle all tweens
		var i, j, length, _timelines = this._timelines;
		for(i = _timelines.length - 1; i >= 0; --i)
		{
			var timeline = _timelines[i];
			for(j = 0, length = timeline.length; j < length; ++j)
			{
				var tween = timeline[j];
				//if the tween contains part of the timeline that we are travelling through
				if(currentFrame >= tween.startFrame &&
					currentFrame <= tween.endFrame)
				{
					// set the position within that tween
					//and break the loop to move onto the next timeline
					tween.setPosition(currentFrame);
					break;
				}
			}
		}
		//TODO: handle children removal and adding - try to avoid adding & removing each child
		//each frame the way CreateJS does
		
		//TODO: go through all children and update synched movieclips that are not single frames
		
		//handle actions
		if(doActions)
		{
			var actions = this._actions;
			for(i = startFrame, length = Math.min(currentFrame + 1, actions.length); i < length; ++i)
			{
				if(actions[i])
				{
					var frameActions = actions[i];
					for(j = 0; j < frameActions.length; ++j)
						frameActions[j].call(this);
				}
			}
		}
	};

	/**
	 * Adds a child to the timeline, and sets it up as a managed child.
	 * @method _addManagedChild
	 * @param {MovieClip} child The child MovieClip to manage
	 * @param {Number} offset
	 * @private
	 **/
	p._addManagedChild = function(child, offset)
	{
		if (child._off)
		{
			return;
		}
		this.addChildAt(child, 0);

		if (child instanceof MovieClip)
		{
			child._synchOffset = offset;
			child._updateTimeline();
			// TODO: this does not precisely match Flash. Flash loses track of the clip if it is renamed or removed from the timeline, which causes it to reset.
			if (child.mode == MovieClip.INDEPENDENT && child.autoReset && !this._managed[child.id])
			{
				child._reset();
			}
		}
		this._managed[child.id] = 2;
	};

	p.__Container_destroy = p.destroy;
	p.destroy = function(destroyChildren)
	{
		if (this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}

		this.__Container_destroy(destroyChildren);
	};

	// Assign to namespace
	PIXI.flash.MovieClip = MovieClip;

}(PIXI));