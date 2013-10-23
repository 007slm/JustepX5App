justepApp.addPlugin(function() {
	var Media = {
			// Media messages
			MEDIA_STATE : 1,
			MEDIA_DURATION : 2,
			MEDIA_POSITION : 3,
			MEDIA_ERROR : 9,

			// Media states
			MEDIA_NONE : 0,
			MEDIA_STARTING : 1,
			MEDIA_RUNNING : 2,
			MEDIA_PAUSED : 3,
			MEDIA_STOPPED : 4,
			MEDIA_MSG : ["None", "Starting", "Running", "Paused", "Stopped"]


	};
    Media.MediaError = function() {
        this.code = null,
        this.message = "";
    };
    Media.MediaError.MEDIA_ERR_ABORTED = 1;
    Media.MediaError.MEDIA_ERR_NETWORK = 2;
    Media.MediaError.MEDIA_ERR_DECODE =  3;
    Media.MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;
	/**
	 * List of media objects.
	 * PRIVATE
	 */
	Media.mediaObjects = {};

	/**
	 * Get the media object.
	 * PRIVATE
	 *
	 * @param id            The media object id (string)
	 */
	Media.getMediaObject = function(id) {
	    return Media.mediaObjects[id];
	};

	/**
	 * Audio has status update.
	 * PRIVATE
	 *
	 * @param id            The media object id (string)
	 * @param msg           The status message (int)
	 * @param value        The status code (int)
	 */
	Media.onStatus = function(id, msg, value) {
	    var media = Media.mediaObjects[id];

	    // If state update
	    if (msg == Media.MEDIA_STATE) {
	        if (value == Media.MEDIA_STOPPED) {
	            if (media.successCallback) {
	                media.successCallback();
	            }
	        }
	        if (media.statusCallback) {
	            media.statusCallback(value);
	        }
	    }
	    else if (msg == Media.MEDIA_DURATION) {
	        media._duration = value;
	    }
	    else if (msg == Media.MEDIA_ERROR) {
	        if (media.errorCallback) {
	            media.errorCallback(value);
	        }
	    }
	    else if (msg == Media.MEDIA_POSITION) {
	    	media._position = value;
	    }
	};

	/**
	 * This class provides access to the device media, interfaces to both sound and video
	 *
	 * @param src                   The file name or url to play
	 * @param successCallback       The callback to be called when the file is done playing or recording.
	 *                                  successCallback() - OPTIONAL
	 * @param errorCallback         The callback to be called if there is an error.
	 *                                  errorCallback(int errorCode) - OPTIONAL
	 * @param statusCallback        The callback to be called when media status has changed.
	 *                                  statusCallback(int statusCode) - OPTIONAL
	 * @param positionCallback      The callback to be called when media position has changed.
	 *                                  positionCallback(long position) - OPTIONAL
	 */
	Media.getInstance = function(src, successCallback, errorCallback, statusCallback, positionCallback) {
		var MediaEntity = function(){
			
		};
		/**
		 * Start or resume playing audio file.
		 */
		MediaEntity.prototype.play = function(options) {
		    justepApp.exec("JustepAppSound.play:withSrc:", this.id, this.src, options);
		};

		/**
		 * Stop playing audio file.
		 */
		MediaEntity.prototype.stop = function() {
		    justepApp.exec("JustepAppSound.stop:withSrc:", this.id, this.src);
		};

		/**
		 * Pause playing audio file.
		 */
		MediaEntity.prototype.pause = function() {
		    justepApp.exec("JustepAppSound.pause:withSrc:", this.id, this.src);
		};

		/**
		 * Seek or jump to a new time in the track..
		 */
		MediaEntity.prototype.seekTo = function(milliseconds) {
		    justepApp.exec("JustepAppSound.seekTo:withSrc:toTimeStamp:", this.id, this.src, milliseconds);
		};

		/**
		 * Get duration of an audio file.
		 * The duration is only set for audio that is playing, paused or stopped.
		 *
		 * @return      duration or -1 if not known.
		 */
		MediaEntity.prototype.getDuration = function() {
		    return this._duration;
		};

		/**
		 * Get position of audio.
		 *
		 * @return
		 */
		MediaEntity.prototype.getCurrentPosition = function(successCB, errorCB) {
			var errCallback = (errorCB == undefined || errorCB == null) ? null : errorCB;
		    justepApp.exec(successCB, errorCB, "JustepAppSound.getCurrentPosition:withId:withSrc:", this.id, this.src);
		};

		// iOS only.  prepare/load the audio in preparation for playing
		MediaEntity.prototype.prepare = function(successCB, errorCB) {
			justepApp.exec(successCB, errorCB, "JustepAppSound.prepare:withId:withSrc",this.id, this.src);
		};

		/**
		 * Start recording audio file.
		 */
		MediaEntity.prototype.startRecord = function() {
		    justepApp.exec("JustepAppSound.startAudioRecord:withSrc",this.id, this.src);
		};

		/**
		 * Stop recording audio file.
		 */
		MediaEntity.prototype.stopRecord = function() {
		    justepApp.exec("JustepAppSound.stopAudioRecord:withSrc:", this.id, this.src);
		};

		/**
		 * Release the resources.
		 */
		MediaEntity.prototype.release = function() {
		    justepApp.exec("JustepAppSound.release:withSrc:", this.id, this.src);
		};
		var self = new MediaEntity();
	    // successCallback optional
	    if (successCallback && (typeof successCallback != "function")) {
	        console.log("Media Error: successCallback is not a function");
	        return;
	    }

	    // errorCallback optional
	    if (errorCallback && (typeof errorCallback != "function")) {
	        console.log("Media Error: errorCallback is not a function");
	        return;
	    }

	    // statusCallback optional
	    if (statusCallback && (typeof statusCallback != "function")) {
	        console.log("Media Error: statusCallback is not a function");
	        return;
	    }

	    // positionCallback optional -- NOT SUPPORTED
	    if (positionCallback && (typeof positionCallback != "function")) {
	        console.log("Media Error: positionCallback is not a function");
	        return;
	    }

	    self.id = justepApp.createUUID();
	    justepApp.Media.mediaObjects[this.id] = this;
	    self.src = src;
	    self.successCallback = successCallback;
	    self.errorCallback = errorCallback;
	    self.statusCallback = statusCallback;
	    self.positionCallback = positionCallback;
	    self._duration = -1;
	    self._position = -1;
	    return self;
	};
    if (typeof justepApp.media == "undefined"){
    	justepApp.Media = Media;
    }
});