justepApp.addPlugin(function() {
	/**
	 * This class contains position information.
	 * @param {Object} lat
	 * @param {Object} lng
	 * @param {Object} acc
	 * @param {Object} alt
	 * @param {Object} altAcc
	 * @param {Object} head
	 * @param {Object} vel
	 * @constructor
	 */
	var Position = function(coords, timestamp) {
		this.coords = Coordinates.cloneFrom(coords);
	    this.timestamp = timestamp || new Date().getTime();
	};

	Position.prototype.equals = function(other) {
	    return (this.coords && other && other.coords &&
	            this.coords.latitude == other.coords.latitude &&
	            this.coords.longitude == other.coords.longitude);
	};

	Position.prototype.clone = function()
	{
	    return new Position(
	        this.coords? this.coords.clone() : null,
	        this.timestamp? this.timestamp : new Date().getTime()
	    );
	}

	var Coordinates = function(lat, lng, alt, acc, head, vel, altAcc) {
		/**
		 * The latitude of the position.
		 */
		this.latitude = lat;
		/**
		 * The longitude of the position,
		 */
		this.longitude = lng;
		/**
		 * The altitude of the position.
		 */
		this.altitude = alt;
		/**
		 * The accuracy of the position.
		 */
		this.accuracy = acc;
		/**
		 * The direction the device is moving at the position.
		 */
		this.heading = head;
		/**
		 * The velocity with which the device is moving at the position.
		 */
		this.speed = vel;
		/**
		 * The altitude accuracy of the position.
		 */
		this.altitudeAccuracy = (altAcc != 'undefined') ? altAcc : null; 
	};

	Coordinates.prototype.clone = function()
	{
	    return new Coordinates(
	        this.latitude,
	        this.longitude,
	        this.altitude,
	        this.accuracy,
	        this.heading,
	        this.speed,
	        this.altitudeAccuracy
	    );
	};

	Coordinates.cloneFrom = function(obj)
	{
	    return new Coordinates(
	        obj.latitude,
	        obj.longitude,
	        obj.altitude,
	        obj.accuracy,
	        obj.heading,
	        obj.speed,
	        obj.altitudeAccuracy
	    );
	};

	/**
	 * This class specifies the options for requesting position data.
	 * @constructor
	 */
	var PositionOptions = function(enableHighAccuracy, timeout, maximumAge) {
		/**
		 * Specifies the desired position accuracy.
		 */
		this.enableHighAccuracy = enableHighAccuracy || false;
		/**
		 * The timeout after which if position data cannot be obtained the errorCallback
		 * is called.
		 */
		this.timeout = timeout || 10000;
		/**
	     * The age of a cached position whose age is no greater than the specified time 
	     * in milliseconds. 
	     */
		this.maximumAge = maximumAge || 0;
		
		if (this.maximumAge < 0) {
			this.maximumAge = 0;
		}
	};

	/**
	 * This class contains information about any GPS errors.
	 * @constructor
	 */
	var PositionError = function(code, message) {
		this.code = code || 0;
		this.message = message || "";
	};

	PositionError.UNKNOWN_ERROR = 0;
	PositionError.PERMISSION_DENIED = 1;
	PositionError.POSITION_UNAVAILABLE = 2;
	PositionError.TIMEOUT = 3;



	/**
	 * This class provides access to device GPS data.
	 * @constructor
	 */
	var Geolocation = function() {
		// The last known GPS position.
		this.lastPosition = null;
		this.listener = null;
		this.timeoutTimerId = 0;

	};

	/**
	 * Asynchronously aquires the current position.
	 * @param {Function} successCallback The function to call when the position
	 * data is available
	 * @param {Function} errorCallback The function to call when there is an error 
	 * getting the position data.
	 * @param {PositionOptions} options The options for getting the position data
	 * such as timeout.
	 * PositionOptions.forcePrompt:Bool default false, 
	 * - tells iPhone to prompt the user to turn on location services.
	 * - may cause your app to exit while the user is sent to the Settings app
	 * PositionOptions.distanceFilter:double aka Number
	 * - used to represent a distance in meters.
	 PositionOptions
	 {
	 desiredAccuracy:Number
	 - a distance in meters 
	 < 10   = best accuracy  ( Default value )
	 < 100  = Nearest Ten Meters
	 < 1000 = Nearest Hundred Meters
	 < 3000 = Accuracy Kilometers
	 3000+  = Accuracy 3 Kilometers

	 forcePrompt:Boolean default false ( iPhone Only! )
	 - tells iPhone to prompt the user to turn on location services.
	 - may cause your app to exit while the user is sent to the Settings app

	 distanceFilter:Number
	 - The minimum distance (measured in meters) a device must move laterally before an update event is generated.
	 - measured relative to the previously delivered location
	 - default value: null ( all movements will be reported )

	 }

	 */

	Geolocation.prototype.getCurrentPosition = function(successCallback,
			errorCallback, options) {
		// create an always valid local success callback
		var win = successCallback;
		if (!win || typeof (win) != 'function') {
			win = function(position) {
			};
		}

		// create an always valid local error callback
		var fail = errorCallback;
		if (!fail || typeof (fail) != 'function') {
			fail = function(positionError) {
			};
		}

		var self = this;
		var totalTime = 0;
		var timeoutTimerId;

		// set params to our default values
		var params = new PositionOptions();

		if (options) {
			if (options.maximumAge) {
				// special case here if we have a cached value that is younger than maximumAge
				if (this.lastPosition) {
					var now = new Date().getTime();
					if ((now - this.lastPosition.timestamp) < options.maximumAge) {
						win(this.lastPosition); // send cached position immediately 
						return; // Note, execution stops here -jm
					}
				}
				params.maximumAge = options.maximumAge;
			}
			if (options.enableHighAccuracy) {
				params.enableHighAccuracy = (options.enableHighAccuracy == true); // make sure it's truthy
			}
			if (options.timeout) {
				params.timeout = options.timeout;
			}
		}

		var successListener = win;
		var failListener = fail;
		if (!this.locationRunning) {
			successListener = function(position) {
				win(position);
				self.stop();
			};
			errorListener = function(positionError) {
				fail(positionError);
				self.stop();
			};
		}

		this.listener = {
			"success" : successListener,
			"fail" : failListener
		};
		this.start(params);

		var onTimeout = function() {
			self.setError(new PositionError(PositionError.TIMEOUT,
					"Geolocation Error: Timeout."));
		};

		clearTimeout(this.timeoutTimerId);
		this.timeoutTimerId = setTimeout(onTimeout, params.timeout);
	};

	/**
	 * Asynchronously aquires the position repeatedly at a given interval.
	 * @param {Function} successCallback The function to call each time the position
	 * data is available
	 * @param {Function} errorCallback The function to call when there is an error 
	 * getting the position data.
	 * @param {PositionOptions} options The options for getting the position data
	 * such as timeout and the frequency of the watch.
	 */
	Geolocation.prototype.watchPosition = function(successCallback, errorCallback,
			options) {
		// Invoke the appropriate callback with a new Position object every time the implementation 
		// determines that the position of the hosting device has changed. 

		var self = this; // those == this & that

		var params = new PositionOptions();

		if (options) {
			if (options.maximumAge) {
				params.maximumAge = options.maximumAge;
			}
			if (options.enableHighAccuracy) {
				params.enableHighAccuracy = options.enableHighAccuracy;
			}
			if (options.timeout) {
				params.timeout = options.timeout;
			}
		}

		var that = this;
		var lastPos = that.lastPosition ? that.lastPosition.clone() : null;

		var intervalFunction = function() {

			var filterFun = function(position) {
				if (lastPos == null || !position.equals(lastPos)) {
					// only call the success callback when there is a change in position, per W3C
					successCallback(position);
				}

				// clone the new position, save it as our last position (internal var)
				lastPos = position.clone();
			};

			that.getCurrentPosition(filterFun, errorCallback, params);
		};

		// Retrieve location immediately and schedule next retrieval afterwards
		intervalFunction();

		return setInterval(intervalFunction, params.timeout);
	};

	/**
	 * Clears the specified position watch.
	 * @param {String} watchId The ID of the watch returned from #watchPosition.
	 */
	Geolocation.prototype.clearWatch = function(watchId) {
		clearInterval(watchId);
	};

	/**
	 * Called by the geolocation framework when the current location is found.
	 * @param {PositionOptions} position The current position.
	 */
	Geolocation.prototype.setLocation = function(position) {
		var _position = new Position(position.coords, position.timestamp);

		if (this.timeoutTimerId) {
			clearTimeout(this.timeoutTimerId);
			this.timeoutTimerId = 0;
		}

		this.lastError = null;
		this.lastPosition = _position;

		if (this.listener && typeof (this.listener.success) == 'function') {
			this.listener.success(_position);
		}

		this.listener = null;
	};

	/**
	 * Called by the geolocation framework when an error occurs while looking up the current position.
	 * @param {String} message The text of the error message.
	 */
	Geolocation.prototype.setError = function(error) {
		var _error = new PositionError(error.code, error.message);

		this.locationRunning = false

		if (this.timeoutTimerId) {
			clearTimeout(this.timeoutTimerId);
			this.timeoutTimerId = 0;
		}

		this.lastError = _error;
		// call error handlers directly
		if (this.listener && typeof (this.listener.fail) == 'function') {
			this.listener.fail(_error);
		}
		this.listener = null;

	};

	Geolocation.prototype.start = function(positionOptions) {
		justepApp.exec("JustepAppGeolocation.startLocation", positionOptions);
		this.locationRunning = true

	};

	Geolocation.prototype.stop = function() {
		justepApp.exec("JustepAppGeolocation.stopLocation");
		this.locationRunning = false
	};

	if (typeof justepApp._geo == "undefined") {
		justepApp._geo = new Geolocation();
        justepApp.geolocation = justepApp._geo;
        justepApp.geolocation.setLocation = justepApp._geo.setLocation;
        justepApp.geolocation.getCurrentPosition = justepApp._geo.getCurrentPosition;
        justepApp.geolocation.watchPosition = justepApp._geo.watchPosition;
        justepApp.geolocation.clearWatch = justepApp._geo.clearWatch;
        justepApp.geolocation.start = justepApp._geo.start;
        justepApp.geolocation.stop = justepApp._geo.stop;

	}
});