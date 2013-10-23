/**
 * 
 * TODO: 暂时webkit内核存在的问题,不要使用"-webkit-overflow-scrolling: touch". 
 * 
 * http://stackoverflow.com/questions/9801687/using-webkit-overflow-scrolling-touch-hides-content-while-scrolling-dragging
 * https://issues.apache.org/jira/browse/CB-593
 * 
 * @author 007slm
 * @email 007slm@163.com
 * @support bbs.justep.com
 */
 
/**
 * 初始化justepApp
 */
;
(function(window) {
	if (typeof(parent.top.justepApp) === 'object' && justepApp.isAndroid) {
		return;
	}

	/**
	 * TODO:callback 的支持
	 */
	justepApp = {
		"isAndroid" : true,
		appEventHandler : {},
		"commandQueue" : {
			requests : [],
			ready : true,
			commands : [],
			timer : null
		},
		"_plugins" : [],
		"callbackId" : 0,
		"callbacks" : {},
		"callbackStatus" : {
			"NO_RESULT" : 0,
			"OK" : 1,
			"CLASS_NOT_FOUND_EXCEPTION" : 2,
			"ILLEGAL_ACCESS_EXCEPTION" : 3,
			"INSTANTIATION_EXCEPTION" : 4,
			"MALFORMED_URL_EXCEPTION" : 5,
			"IO_EXCEPTION" : 6,
			"INVALID_ACTION" : 7,
			"JSON_EXCEPTION" : 8,
			"ERROR" : 9,
			"EXECUTING" : 10
		},
		"checkFn" : function(fn) {
			/**
			 * 不支持采用怪异的参数传递方案 比如：(function(){alert(1231)}) if (fn) { var m =
			 * fn.toString().match(/^\s*function\s+([^\s\(]+)/); return m ? m[1] :
			 * "alert"; } else { return null; }
			 * 
			 */
			if (typeof fn === "function") {
				return fn;
			} else {
				if (!fn) {
					return null;
				} else if (fn && (typeof fn.toString === 'function')) {
					alert('参数传递不正常fn:[' + fn.toString() + '],fn type [ '
							+ (typeof fn) + ']');
				}
			}
		},
		/**
		 *  此方法为兼容方法，不推荐使用
		 * 
		 */
		"eventHandle" : function(params) {
			nativeApp.eventHandle(params);
		},
		/**
		 *  此方法为兼容方法，不推荐使用
		 * 
		 */
		"dispachAppEvent" : function(event) {
			event = event || {};
			var eData = [];
			if (typeof {} === "object") {
				for (var p in event) {
					eData.push(p + "=" + event[p]);
				}
			} else if (typeof {} === "string") {
				eData.push("event=" + event);
			}
			eData.push("time=" + new Date().getTime());
			this.eventHandle(eData.join("&"));
		},
		"getAndClearQueuedCommands" : function() {
			json = JSON.stringify(justepApp.commandQueue.commands);
			justepApp.commandQueue.commands = [];
			return json;
		},
		"addPlugin" : function(func) {
			var state = document.readyState;
			if (state != 'loaded' && state != 'complete')
				justepApp._plugins.push(func);
			else {
				func();
			}
		},
		/**
		 * 
		 * successCallback,failCallback, className, methodName, methodArgs,methodOptions
		 * 或者传递
		 * ClassName.method,methodArgs,methodOptions
		 * 
		 */
		"exec" : function() {
			justepApp.commandQueue.requests.push(arguments);
			if (justepApp.commandQueue.timer == null) {
				justepApp.commandQueue.timer = setInterval(
						justepApp.run_command, 10);
			}

		},
		"run_command" : function() {
			if (!justepApp.available) {
				alert("ERROR: 不能在justepApp初始化之前调用justepApp的命令");
				return;
			}
			var args = justepApp.commandQueue.requests.shift();
			if (justepApp.commandQueue.requests.length == 0) {
				clearInterval(justepApp.commandQueue.timer);
				justepApp.commandQueue.timer = null;
			}
			var successCallback, failCallback, className, action, methodArgs;
			if (typeof args[0] !== "string") {
				successCallback = args[0];
				failCallback = args[1];
				className = args[2];
				action = args[3];
				methodArgs = args[4];
			} else {
				className = args[0];
				action = args[1];
				methodArgs = args[2];
			}

			var callbackId = null;
			if (successCallback || failCallback) {
				callbackId = 'callback' + '_' + className + '_' + action + '_'
						+ justepApp.callbackId++;
				justepApp.callbacks[callbackId] = {
					success : successCallback,
					fail : failCallback
				};
			}
			var r = prompt(JSON.stringify(methodArgs), "justepApp:"
							+ JSON.stringify([className, action, callbackId,
									true]));
			if (r.length > 0) {
				if(r.charAt(r.length -1) == ";"){
					eval(r);
				}else{
					eval("var v=" + r + ";");
					if (v.status === justepApp.callbackStatus.OK) {
						if (successCallback) {
							try {
								successCallback(v.message);
							} catch (e) {
								console.log("Error in success callback: "
										+ callbackId + " = " + e);
							}
							if (!v.keepCallback) {
								delete justepApp.callbacks[callbackId];
							}
						}
						return v.message;
					} else if (v.status === justepApp.callbackStatus.NO_RESULT) {
						if (!v.keepCallback) {
							delete justepApp.callbacks[callbackId];
						}
					} else {
						console.log("Error: Status=" + v.status + " Message="
								+ v.message);
						if (failCallback) {
							try {
								failCallback(v.message);
							} catch (e1) {
								console.log("Error in error callback: "
										+ callbackId + " = " + e1);
							}
							if (!v.keepCallback) {
								delete justepApp.callbacks[callbackId];
							}
						}
						return null;
					}	
				}
				
			}
		},
		"onSuccess" : function(callbackId, args) {
			if (justepApp.callbacks[callbackId]) {
				if (args.status == justepApp.callbackStatus.OK) {
					try {
						if (justepApp.callbacks[callbackId].success) {
							justepApp.callbacks[callbackId]
									.success(args.message);
						}
					} catch (e) {
						console.log("Error in success callback: " + callbackId
								+ " = " + e);
					}
				}
				if (!args.keepCallback) {
					delete justepApp.callbacks[callbackId];
				}
			}
		},
		"onError" : function(callbackId, args) {
			if (justepApp.callbacks[callbackId]) {
				try {
					if (justepApp.callbacks[callbackId].fail) {
						justepApp.callbacks[callbackId].fail(args.message);
					}
				} catch (e) {
					console.log("Error in error callback: " + callbackId
							+ " = " + e);
				}
				if (!args.keepCallback) {
					delete justepApp.callbacks[callbackId];
				}
			}
		},
		"fireEvent" : function(type, target, data) {
			var e = document.createEvent('Events');
			e.initEvent(type, false, false);
			if (data) {
				for (var i in data) {
					e[i] = data[i];
				}
			}
			target = target || document;
			target.dispatchEvent(e);
		},
		"addEventHandler" : function(evt, target, handler, capture) {
			target = target || document;
			if (typeof justepApp.appEventHandler[evt] !== "undefined") {
				if (justepApp.appEventHandler[evt](evt, handler, true)) {
					return;
				}
			}
			target.addEventListener.call(target, evt, handler, capture);
		},
		"removeEventHandler" : function(evt, target, handler, capture) {
			if (typeof justepApp.appEventHandler[evt] !== "undefined") {
				delete justepApp.appEventHandler[evt];
			}
			target = target || document;
			if (typeof justepApp.appEventHandler[e] !== "undefined") {
				if (justepApp.appEventHandler[e](e, handler, false)) {
					return;
				}
			}
			target.removeEventListener.call(target, evt, handler, capture);
		},
		"clone" : function(obj) {
			if (!obj) {
				return obj;
			}

			if (obj instanceof Array) {
				var retVal = new Array();
				for (var i = 0; i < obj.length; ++i) {
					retVal.push(justepApp.clone(obj[i]));
				}
				return retVal;
			}

			if (obj instanceof Function) {
				return obj;
			}

			if (!(obj instanceof Object)) {
				return obj;
			}

			if (obj instanceof Date) {
				return obj;
			}

			retVal = new Object();
			for (i in obj) {
				if (!(i in retVal) || retVal[i] != obj[i]) {
					retVal[i] = justepApp.clone(obj[i]);
				}
			}
			return retVal;
		},
		"createUUID" : function() {
			return justepApp.UUIDcreatePart(4) + '-'
					+ justepApp.UUIDcreatePart(2) + '-'
					+ justepApp.UUIDcreatePart(2) + '-'
					+ justepApp.UUIDcreatePart(2) + '-'
					+ justepApp.UUIDcreatePart(6);
		},
		"UUIDcreatePart" : function(length) {
			var uuidpart = "";
			for (var i = 0; i < length; i++) {
				var uuidchar = parseInt((Math.random() * 256)).toString(16);
				if (uuidchar.length == 1) {
					uuidchar = "0" + uuidchar;
				}
				uuidpart += uuidchar;
			}
			return uuidpart;
		},
		/**
		 * for android
		 */
		"JSCallbackPort" : null,
		"JSCallbackToken" : null,
		"JSCallback" : function() {
			if (justepApp.UsePolling) {
				justepApp.JSCallbackPolling();
				return;
			}
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) {
					if (xmlhttp.status === 200) {
						var msg = decodeURIComponent(xmlhttp.responseText);
						setTimeout(function() {
									try {
										var t = eval(msg);
									} catch (e) {
										console
												.log("JSCallback: Message from Server: "
														+ msg);
										console.log("JSCallback Error: " + e);
									}
								}, 1);
						setTimeout(justepApp.JSCallback, 1);
					} else if (xmlhttp.status === 404) {
						setTimeout(justepApp.JSCallback, 10);
					} else if (xmlhttp.status === 403) {
						console
								.log("JSCallback Error: Invalid token.  Stopping callbacks.");
					} else if (xmlhttp.status === 503) {
						console
								.log("JSCallback Server Closed: Stopping callbacks.");
					} else if (xmlhttp.status === 400) {
						console
								.log("JSCallback Error: Bad request.  Stopping callbacks.");
					} else {
						console.log("JSCallback Error: Request failed.");
						justepApp.UsePolling = true;
						justepApp.JSCallbackPolling();
					}
				}
			};
			if (justepApp.JSCallbackPort === null) {
				justepApp.JSCallbackPort = prompt("getPort",
						"justepApp_callbackServer:");
			}
			if (justepApp.JSCallbackToken === null) {
				justepApp.JSCallbackToken = prompt("getToken",
						"justepApp_callbackServer:");
			}
			xmlhttp.open("GET", "http://127.0.0.1:" + justepApp.JSCallbackPort
							+ "/" + justepApp.JSCallbackToken, true);
			xmlhttp.send();
		},
		"JSCallbackPollingPeriod" : 50,
		"UsePolling" : false,
		"JSCallbackPolling" : function() {
			if (justepApp.shuttingDown) {
				return;
			}
			if (!justepApp.UsePolling) {
				justepApp.JSCallback();
				return;
			}
			var msg = prompt("", "justepApp_poll:");
			if (msg) {
				setTimeout(function() {
							try {
								var t = eval("" + msg);
							} catch (e) {
								console
										.log("JSCallbackPolling: Message from Server: "
												+ msg);
								console.log("JSCallbackPolling Error: " + e);
							}
						}, 1);
				setTimeout(justepApp.JSCallbackPolling, 1);
			} else {
				setTimeout(justepApp.JSCallbackPolling,
						justepApp.JSCallbackPollingPeriod);
			}
		},
		"close" : function(context, func, params) {
			if (typeof params === 'undefined') {
				return function() {
					return func.apply(context, arguments);
				};
			} else {
				return function() {
					return func.apply(context, params);
				};
			}
		}
	};
	(function() {
		var timer = setInterval(function() {
					var state = document.readyState;
					if (state != 'loaded' && state != 'complete') {
						return;
					}
					justepApp.available = true;
					clearInterval(timer);
					while (justepApp._plugins.length > 0) {
						var __plugin = justepApp._plugins.shift();
						try {
							__plugin();
						} catch (e) {
							if (typeof justepApp.logger !== "undefined"
									&& typeof(justepApp.logger['log']) == 'function')
								justepApp.logger.log("添加plugin失败:"
										+ justepApp.logger.processMessage(e));
							else {
								alert("添加plugin失败:" + e.message);
							}
						}
					}
					justepApp.fireEvent('justepAppReady', window)
				}, 1);
	})();
})(window);

/**
 * 开始加载插件
 *    每个addPlugin加载一个插件
 */
justepApp.addPlugin(function() {
	if (typeof justepApp.accelerometer === "undefined") {
		var Acceleration = function(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.timestamp = new Date().getTime();
		};

		var Accelerometer = function() {
			this.lastAcceleration = null;
			this.timers = {};
		};

		Accelerometer.ERROR_MSG = ["Not running", "Starting", "",
				"Failed to start"];

		Accelerometer.prototype.getCurrentAcceleration = function(
				successCallback, errorCallback, options) {
			if (typeof successCallback !== "function") {
				console
						.log("Accelerometer Error: successCallback is not a function");
				return;
			}
			if (errorCallback && (typeof errorCallback !== "function")) {
				console
						.log("Accelerometer Error: errorCallback is not a function");
				return;
			}
			justepApp.exec(successCallback, errorCallback, "Accelerometer",
					"getAcceleration", []);
		};

		Accelerometer.prototype.watchAcceleration = function(successCallback,
				errorCallback, options) {
			var frequency = (options !== undefined) ? options.frequency : 10000;

			if (typeof successCallback !== "function") {
				console
						.log("Accelerometer Error: successCallback is not a function");
				return;
			}

			if (errorCallback && (typeof errorCallback !== "function")) {
				console
						.log("Accelerometer Error: errorCallback is not a function");
				return;
			}

			justepApp.exec(function(timeout) {
						if (timeout < (frequency + 10000)) {
							justepApp.exec(null, null, "Accelerometer",
									"setTimeout", [frequency + 10000]);
						}
					}, function(e) {
					}, "Accelerometer", "getTimeout", []);

			var id = justepApp.createUUID();
			justepApp.accelerometer.timers[id] = setInterval(function() {
						justepApp.exec(successCallback, errorCallback,
								"Accelerometer", "getAcceleration", []);
					}, (frequency ? frequency : 1));

			return id;
		};

		Accelerometer.prototype.clearWatch = function(id) {
			if (id && justepApp.accelerometer.timers[id] !== undefined) {
				clearInterval(justepApp.accelerometer.timers[id]);
				delete justepApp.accelerometer.timers[id];
			}
		};
		justepApp.accelerometer = new Accelerometer();
		justepApp.Acceleration = Acceleration;
	}
});

justepApp.addPlugin(function() {
	if (typeof justepApp.battery === "undefined") {
		var Battery = function() {
			this._level = null;
			this._isPlugged = null;
			this._batteryListener = [];
			this._lowListener = [];
			this._criticalListener = [];
		};
		Battery.prototype.eventHandler = function(eventType, handler, add) {
			var me = justepApp.battery;
			if (add) {
				if (me._batteryListener.length === 0
						&& me._lowListener.length === 0
						&& me._criticalListener.length === 0) {
					justepApp.exec(me._status, me._error, "Battery", "start",
							[]);
				}
				if (eventType === "batterystatus") {
					if (me._batteryListener.indexOf(handler) === -1) {
						me._batteryListener.push(handler);
					}
				} else if (eventType === "batterylow") {
					if (me._lowListener.indexOf(handler) === -1) {
						me._lowListener.push(handler);
					}
				} else if (eventType === "batterycritical") {
					if (me._criticalListener.indexOf(handler) === -1) {
						me._criticalListener.push(handler);
					}
				}
			} else {
				var pos = -1;
				if (eventType === "batterystatus") {
					pos = me._batteryListener.indexOf(handler);
					if (pos > -1) {
						me._batteryListener.splice(pos, 1);
					}
				} else if (eventType === "batterylow") {
					pos = me._lowListener.indexOf(handler);
					if (pos > -1) {
						me._lowListener.splice(pos, 1);
					}
				} else if (eventType === "batterycritical") {
					pos = me._criticalListener.indexOf(handler);
					if (pos > -1) {
						me._criticalListener.splice(pos, 1);
					}
				}
				if (me._batteryListener.length === 0
						&& me._lowListener.length === 0
						&& me._criticalListener.length === 0) {
					justepApp.exec(null, null, "Battery", "stop", []);
				}
			}
		};
		Battery.prototype._status = function(info) {
			if (info) {
				var me = this;
				var level = info.level;
				if (me._level !== level || me._isPlugged !== info.isPlugged) {
					justepApp.fireEvent("batterystatus", window, info);
					if (level === 20 || level === 5) {
						if (level === 20) {
							justepApp.fireEvent("batterylow", window, info);
						} else {
							justepApp
									.fireEvent("batterycritical", window, info);
						}
					}
				}
				me._level = level;
				me._isPlugged = info.isPlugged;
			}
		};

		Battery.prototype._error = function(e) {
			console.log("Error initializing Battery: " + e);
		};
		justepApp.battery = new Battery();
		justepApp.addEventHandler("batterystatus", window,
				justepApp.battery.eventHandler);
		justepApp.addEventHandler("batterylow", window,
				justepApp.battery.eventHandler);
		justepApp.addEventHandler("batterycritical", window,
				justepApp.battery.eventHandler);
	}
});

justepApp.addPlugin(function() {
			if (typeof justepApp.camera === "undefined") {
				var Camera = function() {
					this.successCallback = null;
					this.errorCallback = null;
					this.options = null;
				};

				Camera.DestinationType = {
					DATA_URL : 0,
					FILE_URI : 1

				};
				Camera.prototype.DestinationType = Camera.DestinationType;

				Camera.EncodingType = {
					JPEG : 0,
					PNG : 1

				};
				Camera.prototype.EncodingType = Camera.EncodingType;

				Camera.MediaType = {
					PICTURE : 0,
					VIDEO : 1,
					ALLMEDIA : 2
				};
				Camera.prototype.MediaType = Camera.MediaType;

				Camera.PictureSourceType = {
					PHOTOLIBRARY : 0,
					CAMERA : 1,
					SAVEDPHOTOALBUM : 2
				};
				Camera.prototype.PictureSourceType = Camera.PictureSourceType;

				Camera.prototype.getPicture = function(successCallback,
						errorCallback, options) {
					if (typeof successCallback !== "function") {
						console
								.log("Camera Error: successCallback is not a function");
						return;
					}
					if (errorCallback && (typeof errorCallback !== "function")) {
						console
								.log("Camera Error: errorCallback is not a function");
						return;
					}

					if (options === null || typeof options === "undefined") {
						options = {};
					}
					if (options.quality === null
							|| typeof options.quality === "undefined") {
						options.quality = 80;
					}
					if (options.maxResolution === null
							|| typeof options.maxResolution === "undefined") {
						options.maxResolution = 0;
					}
					if (options.destinationType === null
							|| typeof options.destinationType === "undefined") {
						options.destinationType = Camera.DestinationType.FILE_URI;
					}
					if (options.sourceType === null
							|| typeof options.sourceType === "undefined") {
						options.sourceType = Camera.PictureSourceType.CAMERA;
					}
					if (options.encodingType === null
							|| typeof options.encodingType === "undefined") {
						options.encodingType = Camera.EncodingType.JPEG;
					}
					if (options.mediaType === null
							|| typeof options.mediaType === "undefined") {
						options.mediaType = Camera.MediaType.PICTURE;
					}
					if (options.targetWidth === null
							|| typeof options.targetWidth === "undefined") {
						options.targetWidth = -1;
					} else if (typeof options.targetWidth === "string") {
						var width = new Number(options.targetWidth);
						if (isNaN(width) === false) {
							options.targetWidth = width.valueOf();
						}
					}
					if (options.targetHeight === null
							|| typeof options.targetHeight === "undefined") {
						options.targetHeight = -1;
					} else if (typeof options.targetHeight === "string") {
						var height = new Number(options.targetHeight);
						if (isNaN(height) === false) {
							options.targetHeight = height.valueOf();
						}
					}
					justepApp.exec(successCallback, errorCallback, "Camera",
							"takePicture", [options]);
				};
				justepApp.camera = new Camera();
			}
		});
justepApp.addPlugin(function() {
	if (typeof justepApp.capture === "undefined") {
		var MediaFile = function(name, fullPath, type, lastModifiedDate, size) {
			this.name = name || null;
			this.fullPath = fullPath || null;
			this.type = type || null;
			this.lastModifiedDate = lastModifiedDate || null;
			this.size = size || 0;
		};

		MediaFile.prototype.getFormatData = function(successCallback,
				errorCallback) {
			justepApp.exec(successCallback, errorCallback, "Capture",
					"getFormatData", [this.fullPath, this.type]);
		};

		var MediaFileData = function(codecs, bitrate, height, width, duration) {
			this.codecs = codecs || null;
			this.bitrate = bitrate || 0;
			this.height = height || 0;
			this.width = width || 0;
			this.duration = duration || 0;
		};

		var CaptureError = function() {
			this.code = null;
		};

		CaptureError.CAPTURE_INTERNAL_ERR = 0;
		CaptureError.CAPTURE_APPLICATION_BUSY = 1;
		CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
		CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
		CaptureError.CAPTURE_NOT_SUPPORTED = 20;

		var Capture = function() {
			this.supportedAudioModes = [];
			this.supportedImageModes = [];
			this.supportedVideoModes = [];
		};

		Capture.prototype.captureAudio = function(successCallback,
				errorCallback, options) {
			justepApp.exec(successCallback, errorCallback, "Capture",
					"captureAudio", [options]);
		};

		Capture.prototype.captureImage = function(successCallback,
				errorCallback, options) {
			justepApp.exec(successCallback, errorCallback, "Capture",
					"captureImage", [options]);
		};

		Capture.prototype._castMediaFile = function(pluginResult) {
			var mediaFiles = [];
			var i;
			for (i = 0; i < pluginResult.message.length; i++) {
				var mediaFile = new MediaFile();
				mediaFile.name = pluginResult.message[i].name;
				mediaFile.fullPath = pluginResult.message[i].fullPath;
				mediaFile.type = pluginResult.message[i].type;
				mediaFile.lastModifiedDate = pluginResult.message[i].lastModifiedDate;
				mediaFile.size = pluginResult.message[i].size;
				mediaFiles.push(mediaFile);
			}
			pluginResult.message = mediaFiles;
			return pluginResult;
		};

		Capture.prototype.captureVideo = function(successCallback,
				errorCallback, options) {
			justepApp.exec(successCallback, errorCallback, "Capture",
					"captureVideo", [options]);
		};

		var ConfigurationData = function() {
			// The ASCII-encoded string in lower case representing the media type. 
			this.type = null;
			// The height attribute represents height of the image or video in pixels. 
			// In the case of a sound clip this attribute has value 0. 
			this.height = 0;
			// The width attribute represents width of the image or video in pixels. 
			// In the case of a sound clip this attribute has value 0
			this.width = 0;
		};

		var CaptureImageOptions = function() {
			// Upper limit of images user can take. Value must be equal or greater than 1.
			this.limit = 1;
			// The selected image mode. Must match with one of the elements in supportedImageModes array.
			this.mode = null;
		};

		var CaptureVideoOptions = function() {
			this.limit = 1;
			this.duration = 0;
			this.mode = null;
		};

		var CaptureAudioOptions = function() {
			this.limit = 1;
			this.duration = 0;
			this.mode = null;
		};
		justepApp.capture = new Capture();
		justepApp.CaptureAudioOptions = CaptureAudioOptions; 
		justepApp.CaptureImageOptions = CaptureImageOptions;
		justepApp.CaptureVideoOptions = CaptureVideoOptions;
		justepApp.ConfigurationData = ConfigurationData;
		justepApp.MediaFile = MediaFile; 
		justepApp.MediaFileData = MediaFileData; 
	}
});

justepApp.addPlugin(function() {
	if (typeof justepApp.compass === "undefined") {
		var CompassError = function() {
			this.code = null;
		};

		CompassError.COMPASS_INTERNAL_ERR = 0;
		CompassError.COMPASS_NOT_SUPPORTED = 20;

		var CompassHeading = function() {
			this.magneticHeading = null;
			this.trueHeading = null;
			this.headingAccuracy = null;
			this.timestamp = null;
		};

		var Compass = function() {
			this.lastHeading = null;
			this.timers = {};
		};

		Compass.ERROR_MSG = ["Not running", "Starting", "", "Failed to start"];

		Compass.prototype.getCurrentHeading = function(successCallback,
				errorCallback, options) {
			if (typeof successCallback !== "function") {
				console.log("Compass Error: successCallback is not a function");
				return;
			}
			if (errorCallback && (typeof errorCallback !== "function")) {
				console.log("Compass Error: errorCallback is not a function");
				return;
			}
			justepApp.exec(successCallback, errorCallback, "Compass",
					"getHeading", []);
		};
		Compass.prototype.watchHeading = function(successCallback,
				errorCallback, options) {
			var frequency = (options !== undefined) ? options.frequency : 100;
			if (typeof successCallback !== "function") {
				console.log("Compass Error: successCallback is not a function");
				return;
			}
			if (errorCallback && (typeof errorCallback !== "function")) {
				console.log("Compass Error: errorCallback is not a function");
				return;
			}
			justepApp.exec(function(timeout) {
						if (timeout < (frequency + 10000)) {
							justepApp.exec(null, null, "Compass", "setTimeout",
									[frequency + 10000]);
						}
					}, function(e) {
					}, "Compass", "getTimeout", []);
			var id = justepApp.createUUID();
			justepApp.compass.timers[id] = setInterval(function() {
						justepApp.exec(successCallback, errorCallback,
								"Compass", "getHeading", []);
					}, (frequency ? frequency : 1));

			return id;
		};
		Compass.prototype.clearWatch = function(id) {

			// Stop javascript timer & remove from timer list
			if (id && justepApp.compass.timers[id]) {
				clearInterval(justepApp.compass.timers[id]);
				delete justepApp.compass.timers[id];
			}
		};
		Compass.prototype._castDate = function(pluginResult) {
			if (pluginResult.message.timestamp) {
				var timestamp = new Date(pluginResult.message.timestamp);
				pluginResult.message.timestamp = timestamp;
			}
			return pluginResult;
		};

		justepApp.compass = new Compass();
	}
});
justepApp.addPlugin(function() {
	if (typeof justepApp.contacts === "undefined") {
		var Contact = function(id, displayName, name, nickname, phoneNumbers,
				emails, addresses, ims, organizations, birthday, note, photos,
				categories, urls) {
			this.id = id || null;
			this.rawId = null;
			this.displayName = displayName || null;
			this.name = name || null; // ContactName
			this.nickname = nickname || null;
			this.phoneNumbers = phoneNumbers || null; // ContactField[]
			this.emails = emails || null; // ContactField[]
			this.addresses = addresses || null; // ContactAddress[]
			this.ims = ims || null; // ContactField[]
			this.organizations = organizations || null; // ContactOrganization[]
			this.birthday = birthday || null;
			this.note = note || null;
			this.photos = photos || null; // ContactField[]
			this.categories = categories || null; // ContactField[]
			this.urls = urls || null; // ContactField[]
		};
		var ContactError = function() {
			this.code = null;
		};
		ContactError.UNKNOWN_ERROR = 0;
		ContactError.INVALID_ARGUMENT_ERROR = 1;
		ContactError.TIMEOUT_ERROR = 2;
		ContactError.PENDING_OPERATION_ERROR = 3;
		ContactError.IO_ERROR = 4;
		ContactError.NOT_SUPPORTED_ERROR = 5;
		ContactError.PERMISSION_DENIED_ERROR = 20;
		Contact.prototype.remove = function(successCB, errorCB) {
			if (this.id === null) {
				var errorObj = new ContactError();
				errorObj.code = ContactError.UNKNOWN_ERROR;
				errorCB(errorObj);
			} else {
				justepApp.exec(successCB, errorCB, "Contacts", "remove",
						[this.id]);
			}
		};
		Contact.prototype.clone = function() {
			var clonedContact = justepApp.clone(this);
			var i;
			clonedContact.id = null;
			clonedContact.rawId = null;
			if (clonedContact.phoneNumbers) {
				for (i = 0; i < clonedContact.phoneNumbers.length; i++) {
					clonedContact.phoneNumbers[i].id = null;
				}
			}
			if (clonedContact.emails) {
				for (i = 0; i < clonedContact.emails.length; i++) {
					clonedContact.emails[i].id = null;
				}
			}
			if (clonedContact.addresses) {
				for (i = 0; i < clonedContact.addresses.length; i++) {
					clonedContact.addresses[i].id = null;
				}
			}
			if (clonedContact.ims) {
				for (i = 0; i < clonedContact.ims.length; i++) {
					clonedContact.ims[i].id = null;
				}
			}
			if (clonedContact.organizations) {
				for (i = 0; i < clonedContact.organizations.length; i++) {
					clonedContact.organizations[i].id = null;
				}
			}
			if (clonedContact.tags) {
				for (i = 0; i < clonedContact.tags.length; i++) {
					clonedContact.tags[i].id = null;
				}
			}
			if (clonedContact.photos) {
				for (i = 0; i < clonedContact.photos.length; i++) {
					clonedContact.photos[i].id = null;
				}
			}
			if (clonedContact.urls) {
				for (i = 0; i < clonedContact.urls.length; i++) {
					clonedContact.urls[i].id = null;
				}
			}
			return clonedContact;
		};
		Contact.prototype.save = function(successCB, errorCB) {
			justepApp.exec(successCB, errorCB, "Contacts", "save", [this]);
		};
		var ContactName = function(formatted, familyName, givenName, middle,
				prefix, suffix) {
			this.formatted = formatted || null;
			this.familyName = familyName || null;
			this.givenName = givenName || null;
			this.middleName = middle || null;
			this.honorificPrefix = prefix || null;
			this.honorificSuffix = suffix || null;
		};
		var ContactField = function(type, value, pref) {
			this.id = null;
			this.type = type || null;
			this.value = value || null;
			this.pref = pref || null;
		};
		var ContactAddress = function(pref, type, formatted, streetAddress,
				locality, region, postalCode, country) {
			this.id = null;
			this.pref = pref || null;
			this.type = type || null;
			this.formatted = formatted || null;
			this.streetAddress = streetAddress || null;
			this.locality = locality || null;
			this.region = region || null;
			this.postalCode = postalCode || null;
			this.country = country || null;
		};
		var ContactOrganization = function(pref, type, name, dept, title) {
			this.id = null;
			this.pref = pref || null;
			this.type = type || null;
			this.name = name || null;
			this.department = dept || null;
			this.title = title || null;
		};
		var Contacts = function() {
			this.inProgress = false;
			this.records = [];
		};
		Contacts.prototype.find = function(fields, successCB, errorCB, options) {
			if (successCB === null) {
				throw new TypeError("You must specify a success callback for the find command.");
			}
			if (fields === null || fields === "undefined"
					|| fields.length === "undefined" || fields.length <= 0) {
				if (typeof errorCB === "function") {
					errorCB({
								"code" : ContactError.INVALID_ARGUMENT_ERROR
							});
				}
			} else {
				justepApp.exec(successCB, errorCB, "Contacts", "search", [
								fields, options]);
			}
		};
		Contacts.prototype.create = function(properties) {
			var i;
			var contact = new Contact();
			for (i in properties) {
				if (contact[i] !== 'undefined') {
					contact[i] = properties[i];
				}
			}
			return contact;
		};

		Contacts.prototype.cast = function(pluginResult) {
			var contacts = [];
			var i;
			for (i = 0; i < pluginResult.message.length; i++) {
				contacts.push(justepApp.contacts
						.create(pluginResult.message[i]));
			}
			pluginResult.message = contacts;
			return pluginResult;
		};

		var ContactFindOptions = function(filter, multiple) {
			this.filter = filter || '';
			this.multiple = multiple || false;
		};
		justepApp.contacts = new Contacts();
		justepApp.Contact = Contact;
		justepApp.ContactField = ContactField;
		justepApp.ContactOrganization = ContactOrganization;
		justepApp.ContactFindOptions = ContactFindOptions;
		justepApp.ContactError = ContactError;
	}
});
justepApp.addPlugin(function() {
			if (typeof justepApp.Crypto === "undefined") {
				var Crypto = function() {
				};

				Crypto.prototype.encrypt = function(seed, string, callback) {
					this.encryptWin = callback;
					justepApp.exec(null, null, "Crypto", "encrypt", [seed,
									string]);
				};

				Crypto.prototype.decrypt = function(seed, string, callback) {
					this.decryptWin = callback;
					justepApp.exec(null, null, "Crypto", "decrypt", [seed,
									string]);
				};

				Crypto.prototype.gotCryptedString = function(string) {
					this.encryptWin(string);
				};

				Crypto.prototype.getPlainString = function(string) {
					this.decryptWin(string);
				};
				justepApp.Crypto = new Crypto();
			}
		});
/**
 * 硬件基本信息 
 */
justepApp.addPlugin(function() {
			if (typeof justepApp.device === "undefined") {
				var Device = function() {
					this.available = justepApp.available;
					this.platform = null;
					this.version = null;
					this.name = null;
					this.uuid = null;
					this.justepAppVersion = null;

					var me = this;
					this.getInfo(function(info) {
								me.available = true;
								me.platform = info.platform;
								me.version = info.version;
								me.name = info.name;
								me.uuid = info.uuid;
								me.justepAppVersion = info.justepAppVersion;
							}, function(e) {
								me.available = false;
								console.log("Error initializing justepApp: "
										+ e);
								alert("Error initializing justepApp: " + e);
							});
				};
				Device.prototype.getInfo = function(successCallback,
						errorCallback) {
					if (typeof successCallback !== "function") {
						console
								.log("Device Error: successCallback is not a function");
						return;
					}
					if (errorCallback && (typeof errorCallback !== "function")) {
						console
								.log("Device Error: errorCallback is not a function");
						return;
					}
					justepApp.exec(successCallback, errorCallback, "Device",
							"getDeviceInfo", []);
				};
				justepApp.device = new Device();
			}

		});

/**
 * Add the FileSystem interface into the browser.
 */
justepApp.addPlugin(function() {
	var FileProperties = function(filePath) {
		this.filePath = filePath;
		this.size = 0;
		this.lastModifiedDate = null;
	};
	var File = function(name, fullPath, type, lastModifiedDate, size) {
		this.name = name || null;
		this.fullPath = fullPath || null;
		this.type = type || null;
		this.lastModifiedDate = lastModifiedDate || null;
		this.size = size || 0;
	};
	var FileError = function() {
		this.code = null;
	};
	FileError.NOT_FOUND_ERR = 1;
	FileError.SECURITY_ERR = 2;
	FileError.ABORT_ERR = 3;
	FileError.NOT_READABLE_ERR = 4;
	FileError.ENCODING_ERR = 5;
	FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
	FileError.INVALID_STATE_ERR = 7;
	FileError.SYNTAX_ERR = 8;
	FileError.INVALID_MODIFICATION_ERR = 9;
	FileError.QUOTA_EXCEEDED_ERR = 10;
	FileError.TYPE_MISMATCH_ERR = 11;
	FileError.PATH_EXISTS_ERR = 12;

	//-----------------------------------------------------------------------------
	// File Reader
	//-----------------------------------------------------------------------------

	var FileReader = function() {
		this.fileName = "";

		this.readyState = 0;

		// File data
		this.result = null;

		// Error
		this.error = null;

		// Event handlers
		this.onloadstart = null; // When the read starts.
		this.onprogress = null; // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
		this.onload = null; // When the read has successfully completed.
		this.onerror = null; // When the read has failed (see errors).
		this.onloadend = null; // When the request has completed (either in success or failure).
		this.onabort = null; // When the read has been aborted. For instance, by invoking the abort() method.
	};

	// States
	FileReader.EMPTY = 0;
	FileReader.LOADING = 1;
	FileReader.DONE = 2;

	/**
	 * Abort reading file.
	 */
	FileReader.prototype.abort = function() {
		var evt;
		this.readyState = FileReader.DONE;
		this.result = null;

		// set error
		var error = new FileError();
		error.code = error.ABORT_ERR;
		this.error = error;

		// If error callback
		if (typeof this.onerror === "function") {
			this.onerror({
						"type" : "error",
						"target" : this
					});
		}
		// If abort callback
		if (typeof this.onabort === "function") {
			this.onabort({
						"type" : "abort",
						"target" : this
					});
		}
		// If load end callback
		if (typeof this.onloadend === "function") {
			this.onloadend({
						"type" : "loadend",
						"target" : this
					});
		}
	};

	FileReader.prototype.readAsText = function(file, encoding) {
		this.fileName = "";
		if (typeof file.fullPath === "undefined") {
			this.fileName = file;
		} else {
			this.fileName = file.fullPath;
		}

		// LOADING state
		this.readyState = FileReader.LOADING;

		// If loadstart callback
		if (typeof this.onloadstart === "function") {
			this.onloadstart({
						"type" : "loadstart",
						"target" : this
					});
		}

		// Default encoding is UTF-8
		var enc = encoding ? encoding : "UTF-8";

		var me = this;

		// Read file
		justepApp.exec(
				// Success callback
				function(r) {
			var evt;

			// If DONE (cancelled), then don't do anything
			if (me.readyState === FileReader.DONE) {
				return;
			}

			// Save result
			me.result = r;

			// If onload callback
			if (typeof me.onload === "function") {
				me.onload({
							"type" : "load",
							"target" : me
						});
			}

			// DONE state
			me.readyState = FileReader.DONE;

			// If onloadend callback
			if (typeof me.onloadend === "function") {
				me.onloadend({
							"type" : "loadend",
							"target" : me
						});
			}
		},
				// Error callback
				function(e) {
					var evt;
					// If DONE (cancelled), then don't do anything
					if (me.readyState === FileReader.DONE) {
						return;
					}

					// Save error
					me.error = e;

					// If onerror callback
					if (typeof me.onerror === "function") {
						me.onerror({
									"type" : "error",
									"target" : me
								});
					}

					// DONE state
					me.readyState = FileReader.DONE;

					// If onloadend callback
					if (typeof me.onloadend === "function") {
						me.onloadend({
									"type" : "loadend",
									"target" : me
								});
					}
				}, "File", "readAsText", [this.fileName, enc]);
	};

	FileReader.prototype.readAsDataURL = function(file) {
		this.fileName = "";
		if (typeof file.fullPath === "undefined") {
			this.fileName = file;
		} else {
			this.fileName = file.fullPath;
		}

		// LOADING state
		this.readyState = FileReader.LOADING;

		// If loadstart callback
		if (typeof this.onloadstart === "function") {
			this.onloadstart({
						"type" : "loadstart",
						"target" : this
					});
		}

		var me = this;

		// Read file
		justepApp.exec(
				// Success callback
				function(r) {
			var evt;

			// If DONE (cancelled), then don't do anything
			if (me.readyState === FileReader.DONE) {
				return;
			}

			// Save result
			me.result = r;

			// If onload callback
			if (typeof me.onload === "function") {
				me.onload({
							"type" : "load",
							"target" : me
						});
			}

			// DONE state
			me.readyState = FileReader.DONE;

			// If onloadend callback
			if (typeof me.onloadend === "function") {
				me.onloadend({
							"type" : "loadend",
							"target" : me
						});
			}
		},
				// Error callback
				function(e) {
					var evt;
					// If DONE (cancelled), then don't do anything
					if (me.readyState === FileReader.DONE) {
						return;
					}

					// Save error
					me.error = e;

					// If onerror callback
					if (typeof me.onerror === "function") {
						me.onerror({
									"type" : "error",
									"target" : me
								});
					}

					// DONE state
					me.readyState = FileReader.DONE;

					// If onloadend callback
					if (typeof me.onloadend === "function") {
						me.onloadend({
									"type" : "loadend",
									"target" : me
								});
					}
				}, "File", "readAsDataURL", [this.fileName]);
	};

	/**
	 * Read file and return data as a binary data.
	 *
	 * @param file          {File} File object containing file properties
	 */
	FileReader.prototype.readAsBinaryString = function(file) {
		// TODO - Can't return binary data to browser.
		this.fileName = file;
	};

	/**
	 * Read file and return data as a binary data.
	 *
	 * @param file          {File} File object containing file properties
	 */
	FileReader.prototype.readAsArrayBuffer = function(file) {
		// TODO - Can't return binary data to browser.
		this.fileName = file;
	};

	//-----------------------------------------------------------------------------
	// File Writer
	//-----------------------------------------------------------------------------

	/**
	 * This class writes to the mobile device file system.
	 *
	 * For Android:
	 *      The root directory is the root of the file system.
	 *      To write to the SD card, the file name is "sdcard/my_file.txt"
	 *
	 * @constructor
	 * @param file {File} File object containing file properties
	 * @param append if true write to the end of the file, otherwise overwrite the file
	 */
	var FileWriter = function(file) {
		this.fileName = "";
		this.length = 0;
		if (file) {
			this.fileName = file.fullPath || file;
			this.length = file.size || 0;
		}
		// default is to write at the beginning of the file
		this.position = 0;

		this.readyState = 0; // EMPTY

		this.result = null;

		// Error
		this.error = null;

		// Event handlers
		this.onwritestart = null; // When writing starts
		this.onprogress = null; // While writing the file, and reporting partial file data
		this.onwrite = null; // When the write has successfully completed.
		this.onwriteend = null; // When the request has completed (either in success or failure).
		this.onabort = null; // When the write has been aborted. For instance, by invoking the abort() method.
		this.onerror = null; // When the write has failed (see errors).
	};

	// States
	FileWriter.INIT = 0;
	FileWriter.WRITING = 1;
	FileWriter.DONE = 2;

	/**
	 * Abort writing file.
	 */
	FileWriter.prototype.abort = function() {
		// check for invalid state
		if (this.readyState === FileWriter.DONE
				|| this.readyState === FileWriter.INIT) {
			throw FileError.INVALID_STATE_ERR;
		}

		// set error
		var error = new FileError(), evt;
		error.code = error.ABORT_ERR;
		this.error = error;

		// If error callback
		if (typeof this.onerror === "function") {
			this.onerror({
						"type" : "error",
						"target" : this
					});
		}
		// If abort callback
		if (typeof this.onabort === "function") {
			this.onabort({
						"type" : "abort",
						"target" : this
					});
		}

		this.readyState = FileWriter.DONE;

		// If write end callback
		if (typeof this.onwriteend === "function") {
			this.onwriteend({
						"type" : "writeend",
						"target" : this
					});
		}
	};

	/**
	 * Writes data to the file
	 *
	 * @param text to be written
	 */
	FileWriter.prototype.write = function(text) {
		// Throw an exception if we are already writing a file
		if (this.readyState === FileWriter.WRITING) {
			throw FileError.INVALID_STATE_ERR;
		}

		// WRITING state
		this.readyState = FileWriter.WRITING;

		var me = this;

		// If onwritestart callback
		if (typeof me.onwritestart === "function") {
			me.onwritestart({
						"type" : "writestart",
						"target" : me
					});
		}

		// Write file
		justepApp.exec(
				// Success callback
				function(r) {
			var evt;
			// If DONE (cancelled), then don't do anything
			if (me.readyState === FileWriter.DONE) {
				return;
			}

			// position always increases by bytes written because file would be extended
			me.position += r;
			// The length of the file is now where we are done writing.
			me.length = me.position;

			// If onwrite callback
			if (typeof me.onwrite === "function") {
				me.onwrite({
							"type" : "write",
							"target" : me
						});
			}

			// DONE state
			me.readyState = FileWriter.DONE;

			// If onwriteend callback
			if (typeof me.onwriteend === "function") {
				me.onwriteend({
							"type" : "writeend",
							"target" : me
						});
			}
		},
				// Error callback
				function(e) {
					var evt;

					// If DONE (cancelled), then don't do anything
					if (me.readyState === FileWriter.DONE) {
						return;
					}

					// Save error
					me.error = e;

					// If onerror callback
					if (typeof me.onerror === "function") {
						me.onerror({
									"type" : "error",
									"target" : me
								});
					}

					// DONE state
					me.readyState = FileWriter.DONE;

					// If onwriteend callback
					if (typeof me.onwriteend === "function") {
						me.onwriteend({
									"type" : "writeend",
									"target" : me
								});
					}
				}, "File", "write", [this.fileName, text, this.position]);
	};

	/**
	 * Moves the file pointer to the location specified.
	 *
	 * If the offset is a negative number the position of the file
	 * pointer is rewound.  If the offset is greater than the file
	 * size the position is set to the end of the file.
	 *
	 * @param offset is the location to move the file pointer to.
	 */
	FileWriter.prototype.seek = function(offset) {
		// Throw an exception if we are already writing a file
		if (this.readyState === FileWriter.WRITING) {
			throw FileError.INVALID_STATE_ERR;
		}

		if (!offset) {
			return;
		}

		// See back from end of file.
		if (offset < 0) {
			this.position = Math.max(offset + this.length, 0);
		}
		// Offset is bigger then file size so set position
		// to the end of the file.
		else if (offset > this.length) {
			this.position = this.length;
		}
		// Offset is between 0 and file size so set the position
		// to start writing.
		else {
			this.position = offset;
		}
	};

	/**
	 * Truncates the file to the size specified.
	 *
	 * @param size to chop the file at.
	 */
	FileWriter.prototype.truncate = function(size) {
		// Throw an exception if we are already writing a file
		if (this.readyState === FileWriter.WRITING) {
			throw FileError.INVALID_STATE_ERR;
		}

		// WRITING state
		this.readyState = FileWriter.WRITING;

		var me = this;

		// If onwritestart callback
		if (typeof me.onwritestart === "function") {
			me.onwritestart({
						"type" : "writestart",
						"target" : this
					});
		}

		// Write file
		justepApp.exec(
				// Success callback
				function(r) {
			var evt;
			// If DONE (cancelled), then don't do anything
			if (me.readyState === FileWriter.DONE) {
				return;
			}

			// Update the length of the file
			me.length = r;
			me.position = Math.min(me.position, r);

			// If onwrite callback
			if (typeof me.onwrite === "function") {
				me.onwrite({
							"type" : "write",
							"target" : me
						});
			}

			// DONE state
			me.readyState = FileWriter.DONE;

			// If onwriteend callback
			if (typeof me.onwriteend === "function") {
				me.onwriteend({
							"type" : "writeend",
							"target" : me
						});
			}
		},
				// Error callback
				function(e) {
					var evt;
					// If DONE (cancelled), then don't do anything
					if (me.readyState === FileWriter.DONE) {
						return;
					}

					// Save error
					me.error = e;

					// If onerror callback
					if (typeof me.onerror === "function") {
						me.onerror({
									"type" : "error",
									"target" : me
								});
					}

					// DONE state
					me.readyState = FileWriter.DONE;

					// If onwriteend callback
					if (typeof me.onwriteend === "function") {
						me.onwriteend({
									"type" : "writeend",
									"target" : me
								});
					}
				}, "File", "truncate", [this.fileName, size]);
	};

	/**
	 * Information about the state of the file or directory
	 *
	 * @constructor
	 * {Date} modificationTime (readonly)
	 */
	var Metadata = function() {
		this.modificationTime = null;
	};

	/**
	 * Supplies arguments to methods that lookup or create files and directories
	 *
	 * @constructor
	 * @param {boolean} create file or directory if it doesn't exist
	 * @param {boolean} exclusive if true the command will fail if the file or directory exists
	 */
	var Flags = function(create, exclusive) {
		this.create = create || false;
		this.exclusive = exclusive || false;
	};

	/**
	 * An interface representing a file system
	 *
	 * @constructor
	 * {DOMString} name the unique name of the file system (readonly)
	 * {DirectoryEntry} root directory of the file system (readonly)
	 */
	var FileSystem = function() {
		this.name = null;
		this.root = null;
	};

	/**
	 * An interface that lists the files and directories in a directory.
	 * @constructor
	 */
	var DirectoryReader = function(fullPath) {
		this.fullPath = fullPath || null;
	};

	/**
	 * Returns a list of entries from a directory.
	 *
	 * @param {Function} successCallback is called with a list of entries
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryReader.prototype.readEntries = function(successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "readEntries",
				[this.fullPath]);
	};

	/**
	 * An interface representing a directory on the file system.
	 *
	 * @constructor
	 * {boolean} isFile always false (readonly)
	 * {boolean} isDirectory always true (readonly)
	 * {DOMString} name of the directory, excluding the path leading to it (readonly)
	 * {DOMString} fullPath the absolute full path to the directory (readonly)
	 * {FileSystem} filesystem on which the directory resides (readonly)
	 */
	var DirectoryEntry = function() {
		this.isFile = false;
		this.isDirectory = true;
		this.name = null;
		this.fullPath = null;
		this.filesystem = null;
	};

	/**
	 * Copies a directory to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to copy the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.copyTo = function(parent, newName,
			successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "copyTo", [
						this.fullPath, parent, newName]);
	};

	/**
	 * Looks up the metadata of the entry
	 *
	 * @param {Function} successCallback is called with a Metadata object
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.getMetadata = function(successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getMetadata",
				[this.fullPath]);
	};

	/**
	 * Gets the parent of the entry
	 *
	 * @param {Function} successCallback is called with a parent entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.getParent = function(successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getParent",
				[this.fullPath]);
	};

	/**
	 * Moves a directory to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to move the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.moveTo = function(parent, newName,
			successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "moveTo", [
						this.fullPath, parent, newName]);
	};

	/**
	 * Removes the entry
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.remove = function(successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "remove",
				[this.fullPath]);
	};

	/**
	 * Returns a URI that can be used to identify this entry.
	 *
	 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
	 * @return uri
	 */
	DirectoryEntry.prototype.toURI = function(mimeType) {
		return "file://" + this.fullPath;
	};

	/**
	 * Creates a new DirectoryReader to read entries from this directory
	 */
	DirectoryEntry.prototype.createReader = function(successCallback,
			errorCallback) {
		return new DirectoryReader(this.fullPath);
	};

	/**
	 * Creates or looks up a directory
	 *
	 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
	 * @param {Flags} options to create or excluively create the directory
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.getDirectory = function(path, options,
			successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getDirectory",
				[this.fullPath, path, options]);
	};

	/**
	 * Creates or looks up a file
	 *
	 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
	 * @param {Flags} options to create or excluively create the file
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.getFile = function(path, options, successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getFile", [
						this.fullPath, path, options]);
	};

	/**
	 * Deletes a directory and all of it's contents
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	DirectoryEntry.prototype.removeRecursively = function(successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File",
				"removeRecursively", [this.fullPath]);
	};

	/**
	 * An interface representing a directory on the file system.
	 *
	 * @constructor
	 * {boolean} isFile always true (readonly)
	 * {boolean} isDirectory always false (readonly)
	 * {DOMString} name of the file, excluding the path leading to it (readonly)
	 * {DOMString} fullPath the absolute full path to the file (readonly)
	 * {FileSystem} filesystem on which the directory resides (readonly)
	 */
	var FileEntry = function() {
		this.isFile = true;
		this.isDirectory = false;
		this.name = null;
		this.fullPath = null;
		this.filesystem = null;
	};

	/**
	 * Copies a file to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to copy the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.copyTo = function(parent, newName, successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "copyTo", [
						this.fullPath, parent, newName]);
	};

	/**
	 * Looks up the metadata of the entry
	 *
	 * @param {Function} successCallback is called with a Metadata object
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.getMetadata = function(successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getMetadata",
				[this.fullPath]);
	};

	/**
	 * Gets the parent of the entry
	 *
	 * @param {Function} successCallback is called with a parent entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.getParent = function(successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "getParent",
				[this.fullPath]);
	};

	/**
	 * Moves a directory to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to move the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.moveTo = function(parent, newName, successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "moveTo", [
						this.fullPath, parent, newName]);
	};

	/**
	 * Removes the entry
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.remove = function(successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File", "remove",
				[this.fullPath]);
	};

	/**
	 * Returns a URI that can be used to identify this entry.
	 *
	 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
	 * @return uri
	 */
	FileEntry.prototype.toURI = function(mimeType) {
		return "file://" + this.fullPath;
	};

	/**
	 * Creates a new FileWriter associated with the file that this FileEntry represents.
	 *
	 * @param {Function} successCallback is called with the new FileWriter
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
		this.file(function(filePointer) {
					var writer = new FileWriter(filePointer);

					if (writer.fileName === null || writer.fileName === "") {
						if (typeof errorCallback === "function") {
							errorCallback({
										"code" : FileError.INVALID_STATE_ERR
									});
						}
					}

					if (typeof successCallback === "function") {
						successCallback(writer);
					}
				}, errorCallback);
	};

	/**
	 * Returns a File that represents the current state of the file that this FileEntry represents.
	 *
	 * @param {Function} successCallback is called with the new File object
	 * @param {Function} errorCallback is called with a FileError
	 */
	FileEntry.prototype.file = function(successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File",
				"getFileMetadata", [this.fullPath]);
	};

	/** @constructor */
	var LocalFileSystem = function() {
	};

	// File error codes
	LocalFileSystem.TEMPORARY = 0;
	LocalFileSystem.PERSISTENT = 1;
	LocalFileSystem.RESOURCE = 2;
	LocalFileSystem.APPLICATION = 3;

	/**
	 * Requests a filesystem in which to store application data.
	 *
	 * @param {int} type of file system being requested
	 * @param {Function} successCallback is called with the new FileSystem
	 * @param {Function} errorCallback is called with a FileError
	 */
	LocalFileSystem.prototype.requestFileSystem = function(type, size,
			successCallback, errorCallback) {
		if (type < 0 || type > 3) {
			if (typeof errorCallback === "function") {
				errorCallback({
							"code" : FileError.SYNTAX_ERR
						});
			}
		} else {
			justepApp.exec(successCallback, errorCallback, "File",
					"requestFileSystem", [type, size]);
		}
	};

	/**
	 *
	 * @param {DOMString} uri referring to a local file in a filesystem
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	LocalFileSystem.prototype.resolveLocalFileSystemURI = function(uri,
			successCallback, errorCallback) {
		justepApp.exec(successCallback, errorCallback, "File",
				"resolveLocalFileSystemURI", [uri]);
	};

	/**
	 * This function returns and array of contacts.  It is required as we need to convert raw
	 * JSON objects into concrete Contact objects.  Currently this method is called after
	 * justepApp.service.contacts.find but before the find methods success call back.
	 *
	 * @param a JSON Objects that need to be converted to DirectoryEntry or FileEntry objects.
	 * @returns an entry
	 */
	LocalFileSystem.prototype._castFS = function(pluginResult) {
		var entry = null;
		entry = new DirectoryEntry();
		entry.isDirectory = pluginResult.message.root.isDirectory;
		entry.isFile = pluginResult.message.root.isFile;
		entry.name = pluginResult.message.root.name;
		entry.fullPath = pluginResult.message.root.fullPath;
		pluginResult.message.root = entry;
		return pluginResult;
	};

	LocalFileSystem.prototype._castEntry = function(pluginResult) {
		var entry = null;
		if (pluginResult.message.isDirectory) {
			entry = new DirectoryEntry();
		} else if (pluginResult.message.isFile) {
			entry = new FileEntry();
		}
		entry.isDirectory = pluginResult.message.isDirectory;
		entry.isFile = pluginResult.message.isFile;
		entry.name = pluginResult.message.name;
		entry.fullPath = pluginResult.message.fullPath;
		pluginResult.message = entry;
		return pluginResult;
	};

	LocalFileSystem.prototype._castEntries = function(pluginResult) {
		var entries = pluginResult.message;
		var retVal = [];
		for (var i = 0; i < entries.length; i++) {
			retVal.push(window.localFileSystem._createEntry(entries[i]));
		}
		pluginResult.message = retVal;
		return pluginResult;
	};

	LocalFileSystem.prototype._createEntry = function(castMe) {
		var entry = null;
		if (castMe.isDirectory) {
			entry = new DirectoryEntry();
		} else if (castMe.isFile) {
			entry = new FileEntry();
		}
		entry.isDirectory = castMe.isDirectory;
		entry.isFile = castMe.isFile;
		entry.name = castMe.name;
		entry.fullPath = castMe.fullPath;
		return entry;
	};

	LocalFileSystem.prototype._castDate = function(pluginResult) {
		if (pluginResult.message.modificationTime) {
			var modTime = new Date(pluginResult.message.modificationTime);
			pluginResult.message.modificationTime = modTime;
		} else if (pluginResult.message.lastModifiedDate) {
			var file = new File();
			file.size = pluginResult.message.size;
			file.type = pluginResult.message.type;
			file.name = pluginResult.message.name;
			file.fullPath = pluginResult.message.fullPath;
			file.lastModifiedDate = new Date(pluginResult.message.lastModifiedDate);
			pluginResult.message = file;
		}
		return pluginResult;
	};
	
	var FileTransfer = function() {
	};
	var FileUploadResult = function() {
		this.bytesSent = 0;
		this.responseCode = null;
		this.response = null;
	};
	
	var FileTransferError = function() {
		this.code = null;
	};
	
	FileTransferError.FILE_NOT_FOUND_ERR = 1;
	FileTransferError.INVALID_URL_ERR = 2;
	FileTransferError.CONNECTION_ERR = 3;
	FileTransfer.prototype.upload = function(filePath, server, successCallback,
			errorCallback, options, debug) {
	
		// check for options
		var fileKey = null;
		var fileName = null;
		var mimeType = null;
		var params = null;
		var chunkedMode = true;
		if (options) {
			fileKey = options.fileKey;
			fileName = options.fileName;
			mimeType = options.mimeType;
			if (options.chunkedMode !== null
					|| typeof options.chunkedMode !== "undefined") {
				chunkedMode = options.chunkedMode;
			}
			if (options.params) {
				params = options.params;
			} else {
				params = {};
			}
		}
	
		justepApp.exec(successCallback, errorCallback, 'FileTransfer', 'upload', [
						filePath, server, fileKey, fileName, mimeType, params,
						debug, chunkedMode]);
	};
	
	FileTransfer.prototype.download = function(source, target, successCallback,
			errorCallback) {
		justepApp.exec(successCallback, errorCallback, 'FileTransfer', 'download',
				[source, target]);
	};
	
	var FileUploadOptions = function(fileKey, fileName, mimeType, params) {
		this.fileKey = fileKey || null;
		this.fileName = fileName || null;
		this.mimeType = mimeType || null;
		this.params = params || null;
	};
	
	var pgLocalFileSystem = new LocalFileSystem();
	if (typeof justepApp.localFileSystem === "undefined") {
		justepApp.localFileSystem = pgLocalFileSystem;
	}
	if (typeof justepApp.requestFileSystem === "undefined") {
		justepApp.requestFileSystem = pgLocalFileSystem.requestFileSystem;
	}
	if (typeof justepApp.resolveLocalFileSystemURI === "undefined") {
		justepApp.resolveLocalFileSystemURI = pgLocalFileSystem.resolveLocalFileSystemURI;
	}
	justepApp.DirectoryEntry = DirectoryEntry; 
	justepApp.DirectoryReader = DirectoryReader;
	justepApp.File = File;
	justepApp.FileEntry = FileEntry;
	justepApp.FileError = FileError;
	justepApp.FileReader = FileReader;
	justepApp.FileSystem = FileSystem;
	justepApp.FileTransfer = FileTransfer;
	justepApp.FileTransferError = FileTransferError;
	justepApp.FileUploadOptions = FileUploadOptions;
	justepApp.FileUploadResult = FileUploadResult;
	justepApp.FileWriter = FileWriter;
	justepApp.Flags = Flags;
	justepApp.LocalFileSystem = LocalFileSystem;
	justepApp.Metadata = Metadata;
});

justepApp.addPlugin(function() {
	var Position = function(coords, timestamp) {
		this.coords = coords;
		this.timestamp = (timestamp !== 'undefined') ? timestamp : new Date()
				.getTime();
	};

	/** @constructor */
	var Coordinates = function(lat, lng, alt, acc, head, vel, altacc) {
		/**
		 * The latitude of the position.
		 */
		this.latitude = lat;
		/**
		 * The longitude of the position,
		 */
		this.longitude = lng;
		/**
		 * The accuracy of the position.
		 */
		this.accuracy = acc;
		/**
		 * The altitude of the position.
		 */
		this.altitude = alt;
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
		this.altitudeAccuracy = (altacc !== 'undefined') ? altacc : null;
	};

	/**
	 * This class specifies the options for requesting position data.
	 * @constructor
	 */
	var PositionOptions = function() {
		/**
		 * Specifies the desired position accuracy.
		 */
		this.enableHighAccuracy = true;
		/**
		 * The timeout after which if position data cannot be obtained the errorCallback
		 * is called.
		 */
		this.timeout = 10000;
	};

	/**
	 * This class contains information about any GSP errors.
	 * @constructor
	 */
	var PositionError = function() {
		this.code = null;
		this.message = "";
	};

	PositionError.UNKNOWN_ERROR = 0;
	PositionError.PERMISSION_DENIED = 1;
	PositionError.POSITION_UNAVAILABLE = 2;
	PositionError.TIMEOUT = 3;

	var Geolocation = function() {
		this.lastPosition = null;
		this.listeners = {};
	};

	var PositionError = function(code, message) {
		this.code = code;
		this.message = message;
	};

	PositionError.PERMISSION_DENIED = 1;
	PositionError.POSITION_UNAVAILABLE = 2;
	PositionError.TIMEOUT = 3;

	Geolocation.prototype.getCurrentPosition = function(successCallback,
			errorCallback, options) {
		if (justepApp._geo.listeners.global) {
			console
					.log("Geolocation Error: Still waiting for previous getCurrentPosition() request.");
			try {
				errorCallback(new PositionError(PositionError.TIMEOUT,
						"Geolocation Error: Still waiting for previous getCurrentPosition() request."));
			} catch (e) {
			}
			return;
		}
		var maximumAge = 10000;
		var enableHighAccuracy = false;
		var timeout = 10000;
		if (typeof options !== "undefined") {
			if (typeof options.maximumAge !== "undefined") {
				maximumAge = options.maximumAge;
			}
			if (typeof options.enableHighAccuracy !== "undefined") {
				enableHighAccuracy = options.enableHighAccuracy;
			}
			if (typeof options.timeout !== "undefined") {
				timeout = options.timeout;
			}
		}
		justepApp._geo.listeners.global = {
			"success" : successCallback,
			"fail" : errorCallback
		};
		justepApp.exec(null, null, "Geolocation", "getCurrentLocation", [
						enableHighAccuracy, timeout, maximumAge]);
	};

	Geolocation.prototype.watchPosition = function(successCallback,
			errorCallback, options) {
		var maximumAge = 10000;
		var enableHighAccuracy = false;
		var timeout = 10000;
		if (typeof options !== "undefined") {
			if (typeof options.frequency !== "undefined") {
				maximumAge = options.frequency;
			}
			if (typeof options.maximumAge !== "undefined") {
				maximumAge = options.maximumAge;
			}
			if (typeof options.enableHighAccuracy !== "undefined") {
				enableHighAccuracy = options.enableHighAccuracy;
			}
			if (typeof options.timeout !== "undefined") {
				timeout = options.timeout;
			}
		}
		var id = justepApp.createUUID();
		justepApp._geo.listeners[id] = {
			"success" : successCallback,
			"fail" : errorCallback
		};
		justepApp.exec(null, null, "Geolocation", "start", [id,
						enableHighAccuracy, timeout, maximumAge]);
		return id;
	};

	Geolocation.prototype.success = function(id, lat, lng, alt, altacc, head,
			vel, stamp) {
		var coords = new Coordinates(lat, lng, alt, altacc, head, vel);
		var loc = new Position(coords, stamp);
		try {
			if (lat === "undefined" || lng === "undefined") {
				justepApp._geo.listeners[id].fail(new PositionError(
						PositionError.POSITION_UNAVAILABLE,
						"Lat/Lng are undefined."));
			} else {
				justepApp._geo.lastPosition = loc;
				justepApp._geo.listeners[id].success(loc);
			}
		} catch (e) {
			console.log("Geolocation Error: Error calling success callback function.");
		}

		if (id === "global") {
			delete justepApp._geo.listeners.global;
		}
	};

	Geolocation.prototype.fail = function(id, code, msg) {
		try {
			justepApp._geo.listeners[id].fail(new PositionError(code, msg));
		} catch (e) {
			console
					.log("Geolocation Error: Error calling error callback function.");
		}
	};

	Geolocation.prototype.clearWatch = function(id) {
		justepApp.exec(null, null, "Geolocation", "stop", [id]);
		delete justepApp._geo.listeners[id];
	};

	Geolocation.usingJustepApp = false;

	if (typeof justepApp.geolocation === 'undefined') {
		justepApp._geo = new Geolocation();
		justepApp.geolocation = justepApp._geo;
		Geolocation.usingJustepApp = true;
		justepApp.Position = Position;
		justepApp.PositionError = PositionError;
		justepApp.Coordinates = Coordinates;
	}
});

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
		this.code = null, this.message = "";
	};
	Media.MediaError.MEDIA_ERR_ABORTED = 1;
	Media.MediaError.MEDIA_ERR_NETWORK = 2;
	Media.MediaError.MEDIA_ERR_DECODE = 3;
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
		} else if (msg == Media.MEDIA_DURATION) {
			media._duration = value;
		} else if (msg == Media.MEDIA_ERROR) {
			if (media.errorCallback) {
				media.errorCallback(value);
			}
		} else if (msg == Media.MEDIA_POSITION) {
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
	Media.getInstance = function(src, successCallback, errorCallback,
			statusCallback, positionCallback) {
		var MediaEntity = function() {

		};

		MediaEntity.prototype.play = function() {
			justepApp.exec(null, null, "Media", "startPlayingAudio", [this.id,
							this.src]);
		};

		/**
		 * Stop playing audio file.
		 */
		MediaEntity.prototype.stop = function() {
			return justepApp.exec(null, null, "Media", "stopPlayingAudio",
					[this.id]);
		};

		/**
		 * Seek or jump to a new time in the track..
		 */
		MediaEntity.prototype.seekTo = function(milliseconds) {
			justepApp.exec(null, null, "Media", "seekToAudio", [this.id,
							milliseconds]);
		};

		/**
		 * Pause playing audio file.
		 */
		MediaEntity.prototype.pause = function() {
			justepApp.exec(null, null, "Media", "pausePlayingAudio", [this.id]);
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
		 */
		MediaEntity.prototype.getCurrentPosition = function(success, fail) {
			justepApp.exec(success, fail, "Media", "getCurrentPositionAudio",
					[this.id]);
		};

		/**
		 * Start recording audio file.
		 */
		MediaEntity.prototype.startRecord = function() {
			justepApp.exec(null, null, "Media", "startRecordingAudio", [
							this.id, this.src]);
		};

		/**
		 * Stop recording audio file.
		 */
		MediaEntity.prototype.stopRecord = function() {
			justepApp
					.exec(null, null, "Media", "stopRecordingAudio", [this.id]);
		};

		/**
		 * Release the resources.
		 */
		MediaEntity.prototype.release = function() {
			justepApp.exec(null, null, "Media", "release", [this.id]);
		};

		/**
		 * Adjust the volume.
		 */
		MediaEntity.prototype.setVolume = function(volume) {
			justepApp.exec(null, null, "Media", "setVolume", [this.id, volume]);
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
	if (typeof justepApp.media == "undefined") {
		justepApp.Media = Media;
	}
});

justepApp.addPlugin(function() {
			if (typeof justepApp.network == "undefined") {
				var NetworkStatus = function() {
					this.code = null;
					this.message = "";
				}
				NetworkStatus.UNKNOWN = "unknown"; // Unknown connection type
				NetworkStatus.ETHERNET = "ethernet";
				NetworkStatus.WIFI = "wifi";
				NetworkStatus.CELL_2G = "2g"; // the default for iOS, for any cellular connection
				NetworkStatus.CELL_3G = "3g";
				NetworkStatus.CELL_4G = "4g";
				NetworkStatus.NONE = "none"; // NO connectivity

				var Network = function() {
					this.lastReachability = null;
				};

				Network.prototype.updateReachability = function(reachability) {
					this.lastReachability = reachability;
				};

				Network.prototype.isReachable = function(hostName,
						successCallback, options) {
					justepApp.exec(successCallback, null, "JustepAppNetwork",
							"isReachable", [hostName]);
				}
				justepApp.network = new Network();
				justepApp.NetworkStatus = NetworkStatus; 
			}
		});
		
justepApp.addPlugin(function() {
	if (typeof justepApp.notification === "undefined") {
		var Notification = function() {
		};

		Notification.prototype.alert = function(message, completeCallback,
				title, buttonLabel) {
			var _title = (title || "系统信息");
			var _buttonLabel = (buttonLabel || "确定");
			justepApp.exec(completeCallback, null, "Notification", "alert", [
							message, _title, _buttonLabel]);
		};

		Notification.prototype.confirm = function(message, resultCallback,
				title, buttonLabels) {
			var _title = (title || "系统提示");
			var _buttonLabels = (buttonLabels || "确定,取消");
			justepApp.exec(resultCallback, null, "Notification", "confirm", [
							message, _title, _buttonLabels]);
		};

		Notification.prototype.activityStart = function() {
			justepApp.exec(null, null, "Notification", "activityStart", [
							"Busy", "Please wait..."]);
		};

		Notification.prototype.activityStop = function() {
			justepApp.exec(null, null, "Notification", "activityStop", []);
		};

		Notification.prototype.progressStart = function(title, message) {
			justepApp.exec(null, null, "Notification", "progressStart", [title,
							message]);
		};

		Notification.prototype.progressValue = function(value) {
			justepApp
					.exec(null, null, "Notification", "progressValue", [value]);
		};

		Notification.prototype.progressStop = function() {
			justepApp.exec(null, null, "Notification", "progressStop", []);
		};

		Notification.prototype.blink = function(count, colour) {
			// NOT IMPLEMENTED
		};

		Notification.prototype.vibrate = function(mills) {
			justepApp.exec(null, null, "Notification", "vibrate", [mills]);
		};

		Notification.prototype.beep = function(count) {
			justepApp.exec(null, null, "Notification", "beep", [count]);
		};
		justepApp.notification = new Notification();
	}
});
/**
 * 配合x5附件组件包装的插件
 */
justepApp.addPlugin(function() {
	var Attachment = function () {};
	Attachment.prototype.uploadAttachment = function(initUploadUrlCallback,uploadComplatedCallback) {
		this.getUploadUrl = justepApp.checkFn(initUploadUrlCallback);
        this.uploadCallback = justepApp.checkFn(uploadComplatedCallback);
		justepApp.exec('Attachment','initUploader',[]);
	};
	Attachment.prototype.downloadAttachment = function(initDownloadUrlCallback) {
		this.getDownloadUrl = justepApp.checkFn(initDownloadUrlCallback);
        justepApp.exec('Attachment','downloadAttachment',[]);
	};
	Attachment.prototype.showDownloadList = function() {
		justepApp.exec('Attachment','showDownloadList',[]);
	};
	Attachment.prototype.browserAttachment = function(initBrowserUrlCallback,getDocNameCallback) {
		this.getBrowserUrl = justepApp.checkFn(initBrowserUrlCallback);
        this.getDocName = justepApp.checkFn(getDocNameCallback);
        var browserUrl = initBrowserUrlCallback();
        var docName = getDocNameCallback();
        justepApp.exec('Attachment','openAttachDlg',[browserUrl,docName]);
	};
    if (typeof justepApp.attachment == "undefined") {
    	justepApp.attachment = new Attachment();
    }
});
/**
 * x5 portal上提供的能力相关函数
 * 
 */
justepApp.addPlugin(function() {
			var Portal = function() {

			};

			Portal.prototype.hideToolbar = function() {
				justepApp.exec('Portal', 'hideToolbar', []);
			};

			Portal.prototype.showToolbar = function() {
				justepApp.exec('Portal', 'showToolbar', []);
			};

			Portal.prototype.switchPageTo = function(pageID) {
				justepApp.exec('Portal', 'switchPageTo', [pageID]);
			};

			Portal.prototype.refresh = function() {
				justepApp.exec('Portal', 'loadSystem', []);
			};

			Portal.prototype.exitApp = function(hide) {
				justepApp.exec('Portal', 'logOut', []);
			};

			Portal.prototype.openAppSetting = function(hide) {
				justepApp.exec('Portal', 'openSettingDlg', []);
			}

			Portal.prototype.setSettingInfo = function(settingInfo) {
				// TODO
			};

			Portal.prototype.showConver = function() {
				justepApp.exec('Portal', 'showConver', []);
			};

			Portal.prototype.removeConver = function() {
				justepApp.exec('Portal', 'removeConver', []);
			};
			if (typeof justepApp.portal == "undefined") {
				justepApp.portal = new Portal();
			}
		});
justepApp.addPlugin(function() {
			var Utils = function() {

			};

			Utils.prototype.getFullUrl = function(url) {
				return window.location.protocol + "//" + window.location.host
						+ url;
			};

			if (typeof justepApp.utils == "undefined") {
				justepApp.utils = new Utils();
			}
		});
