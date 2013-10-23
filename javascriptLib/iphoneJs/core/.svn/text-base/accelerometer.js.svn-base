justepApp.addPlugin(function(){
	var Acceleration = function(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.timestamp = new Date().getTime();
	};

	var Accelerometer = function() {
		this.lastAcceleration = new Acceleration(0, 0, 0);
	};

	Accelerometer.prototype.getCurrentAcceleration = function(successCallback,
			errorCallback, options) {
		if (typeof successCallback == "function") {
			successCallback(this.lastAcceleration);
		}
	};

	Accelerometer.prototype._onAccelUpdate = function(x, y, z) {
		this.lastAcceleration = new Acceleration(x, y, z);
	};

	Accelerometer.prototype.watchAcceleration = function(successCallback,
			errorCallback, options) {
		var frequency = (options != undefined && options.frequency != undefined) ? options.frequency
				: 10000;
		var updatedOptions = {
			desiredFrequency : frequency
		}
		justepApp.exec("JustepAppAccelerometer.start",
				options);

		return setInterval(function() {
			justepApp.accelerometer.getCurrentAcceleration(successCallback,
					errorCallback, options);
		}, frequency);
	};

	Accelerometer.prototype.clearWatch = function(watchId) {
		justepApp.exec("JustepAppAccelerometer.stop");
		clearInterval(watchId);
	};
	if (typeof justepApp.accelerometer == "undefined") {
		justepApp.accelerometer = new Accelerometer();
		
		if (!(window.DeviceMotionEvent == undefined)) {
			// html5 默认特性 如果浏览器支持就直接返回
			return;
		}
		var self = this;
		var devicemotionEvent = 'devicemotion';
		self.deviceMotionWatchId = null;
		self.deviceMotionListenerCount = 0;
		self.deviceMotionLastEventTimestamp = 0;

		var _addEventListener = window.addEventListener;
		var _removeEventListener = window.removeEventListener;

		var windowDispatchAvailable = !(window.dispatchEvent === undefined);

		var accelWin = function(acceleration) {
			var evt = document.createEvent('Events');
			evt.initEvent(devicemotionEvent);

			evt.acceleration = null; 
			evt.rotationRate = null; 
			evt.accelerationIncludingGravity = acceleration; 

			var currentTime = new Date().getTime();
			evt.interval = (self.deviceMotionLastEventTimestamp == 0) ? 0
					: (currentTime - self.deviceMotionLastEventTimestamp);
			self.deviceMotionLastEventTimestamp = currentTime;

			if (windowDispatchAvailable) {
				window.dispatchEvent(evt);
			} else {
				document.dispatchEvent(evt);
			}
		};

		var accelFail = function() {

		};

		// override `window.addEventListener`
		window.addEventListener = function() {
			if (arguments[0] === devicemotionEvent) {
				++(self.deviceMotionListenerCount);
				if (self.deviceMotionListenerCount == 1) { // start
					self.deviceMotionWatchId = justepApp.accelerometer
							.watchAcceleration(accelWin, accelFail, {
								frequency : 500
							});
				}
			}

			if (!windowDispatchAvailable) {
				return document.addEventListener.apply(this, arguments);
			} else {
				return _addEventListener.apply(this, arguments);
			}
		};

		// override `window.removeEventListener'
		window.removeEventListener = function() {
			if (arguments[0] === devicemotionEvent) {
				--(self.deviceMotionListenerCount);
				if (self.deviceMotionListenerCount == 0) { // stop
					justepApp.accelerometer.clearWatch(self.deviceMotionWatchId);
				}
			}

			if (!windowDispatchAvailable) {
				return document.removeEventListener.apply(this, arguments);
			} else {
				return _removeEventListener.apply(this, arguments);
			}
		};
	}
});
