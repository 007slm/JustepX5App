/**
 *
 * TODO:暂时webkit内核存在的问题，不要使用"-webkit-overflow-scrolling: touch".
 *
 * http://stackoverflow.com/questions/9801687/using-webkit-overflow-scrolling-touch-hides-content-while-scrolling-dragging
 * https://issues.apache.org/jira/browse/CB-593
 *
 * @author 007slm(007slm@163.com)
 * @support bbs.justep.com
 */

/**
 * 初始化justepApp
 */
;
(function (window) {
    if (!(/iphone|ipad/gi).test(navigator.appVersion)) {
        return;
    }
 if(typeof window.justepAppLoadId == "undefined" && (window.location.href.indexOf('mIndex.w') >0 || window.location.href.indexOf('index.w') >0)){
  window.justepAppLoadId = setInterval(function() {
        if (typeof(parent.top.justepApp) === 'object') {
            if (typeof(window.DeviceInfo == 'object')) {

                justepApp.addPlugin(function () {
                    if (typeof justepApp.device == "undefined"
                        || typeof justepApp.device.uuid == "undefined") {
                        alert(justepApp.device.uuid == "undefined");
                        var Device = function () {
                            try {
                                this.platform = DeviceInfo.platform;
                                this.version = DeviceInfo.version;
                                this.name = DeviceInfo.name;
                                this.JustepAppVersion = DeviceInfo.JustepAppVersion;
                                this.uuid = DeviceInfo.uuid;
                                justepApp.available = true;
                            } catch (e) {
                                justepApp.available = false;
                            }
                        }
                        justepApp.device = new Device();
                    }else if (justepApp.available && justepApp.device.uuid) {
                        clearInterval(window.justepAppLoadId);
                    }}
                )
            }

            return;
        }
    }, 1000);
 }

    /**
     * TODO:callback 的支持
     */
    justepApp = {
        "isIOS":true,
        "isMe":true,
        appEventHandler:{},
        "commandQueue":{
            requests:[],
            ready:true,
            commands:[],
            timer:null
        },
        "_plugins":[],
        "callbackId":0,
        "callbacks":{},
        "callbackStatus":{
            "NO_RESULT":0,
            "OK":1,
            "CLASS_NOT_FOUND_EXCEPTION":2,
            "ILLEGAL_ACCESS_EXCEPTION":3,
            "INSTANTIATION_EXCEPTION":4,
            "MALFORMED_URL_EXCEPTION":5,
            "IO_EXCEPTION":6,
            "INVALID_ACTION":7,
            "JSON_EXCEPTION":8,
            "ERROR":9
        },
        "checkFn":function (fn) {
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
        "createBridge":function () {
            var bridge = document.getElementById('JustepJsOcBridge');
            if (!bridge) {
                var JsOcBridge = document.createElement('iframe');
                JsOcBridge.style.width = '0px';
                JsOcBridge.id = 'JustepJsOcBridge';
                JsOcBridge.style.height = '0px';
                JsOcBridge.style.border = '0px solid red';
                JsOcBridge.style.position = 'absolute';
                JsOcBridge.style.top = '0px';
                document.body.appendChild(JsOcBridge);
                return JsOcBridge;
            }
            ;
            return bridge;
        },
        // 此方法为兼容方法，不推荐使用
        "eventHandle":function (params) {
            var bridge = window.justepApp.createBridge();
            bridge.src = 'about:blank?' + params;
        },
        // 此方法为兼容方法，不推荐使用
        "dispachAppEvent":function (event) {
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
        "getAndClearQueuedCommands":function () {
            json = JSON.stringify(justepApp.commandQueue.commands);
            justepApp.commandQueue.commands = [];
            return json;
        },
        "addPlugin":function (func) {
            var state = document.readyState;
            if (state != 'loaded' && state != 'complete')
                justepApp._plugins.push(func);
            else {
                func();
            }
        },
        /**
         *
         * successCallback,failCallback, className, methodName,
         * methodArgs,methodOptions 或者传递
         * ClassName.method,methodArgs,methodOptions
         *
         */
        "exec":function () {
            justepApp.commandQueue.requests.push(arguments);
            if (justepApp.commandQueue.timer == null) {
                justepApp.commandQueue.timer = setInterval(
                    justepApp.run_command, 10);
            }

        },
        /**
         * 执行本地代码命令的函数
         *
         * @private ios 实现
         */
        "run_command":function () {
            if (!justepApp.available) {
                alert("ERROR: 不能在justepApp初始化之前调用justepApp的命令");
                return;
            }
            if (!justepApp.commandQueue.ready) {
                return;
            }

            justepApp.commandQueue.ready = false;
            var args = justepApp.commandQueue.requests.shift();
            if (justepApp.commandQueue.requests.length == 0) {
                clearInterval(justepApp.commandQueue.timer);
                justepApp.commandQueue.timer = null;
            }
            // TODO:以后版本增加统一的成功和失败的回调处理逻辑，保留callback的js部分
            var callbackId = null;
            var successCallback, failCallback, className, methodName, methodArgs, methodOptions;
            if (typeof args[0] !== "string") {
                successCallback = args[0];
                failCallback = args[1];
                splitCommand = args[2].split(".");
                methodName = splitCommand.pop();
                className = splitCommand.join(".");
                methodArgs = Array.prototype.splice.call(args, 3);
                callbackId = 'VALID';
            } else {
                splitCommand = args[0].split(".");
                methodName = splitCommand.pop();
                className = splitCommand.join(".");
                methodArgs = Array.prototype.splice.call(args, 1);
            }

            var command = {
                "className":className,
                "methodName":methodName,
                "arguments":[]
            };

            if (successCallback || failCallback) {
                callbackId = 'callback' + '_' + className + '_' + methodName
                    + '_' + justepApp.callbackId++;
                justepApp.callbacks[callbackId] = {
                    success:successCallback,
                    fail:failCallback
                };
            }
            if (callbackId != null) {
                command.arguments.push(callbackId);
            }

            for (var i = 0; i < methodArgs.length; ++i) {
                var arg = methodArgs[i];
                if (arg == undefined || arg == null) {
                    continue;
                } else if (typeof(arg) == 'object') {
                    command.options = arg;
                } else {
                    command.arguments.push(arg);
                }
            }
            justepApp.commandQueue.commands.push(JSON.stringify(command));
            justepApp.createBridge().src = "justepApp://invokeMethod";
        },
        "onSuccess":function (callbackId, args) {
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
        "onError":function (callbackId, args) {
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
        "fireEvent":function (type, target, data) {
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
        "addEventHandler":function (evt, target, callback) {
            target = target || document;
            if (typeof justepApp.windowEventHandler[e] !== "undefined") {
                if (justepApp.windowEventHandler[e](evt, handler, true)) {
                    return;
                }
            }
            target.addEventListener.call(target, evt, handler, capture);
        },
        "removeEventHandler":function (evt, target, handler, capture) {
            if (typeof justepApp.appEventHandler[evt] !== "undefined") {
                delete justepApp.appEventHandler[evt];
            }
            target = target || document;
            if (typeof justepApp.documentEventHandler[e] !== "undefined") {
                if (justepApp.documentEventHandler[e](e, handler, false)) {
                    return;
                }
            }
            target.removeEventListener.call(target, evt, handler, capture);
        },
        "clone":function (obj) {
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
        "createUUID":function () {
            return justepApp.UUIDcreatePart(4) + '-'
                + justepApp.UUIDcreatePart(2) + '-'
                + justepApp.UUIDcreatePart(2) + '-'
                + justepApp.UUIDcreatePart(2) + '-'
                + justepApp.UUIDcreatePart(6);
        },
        "UUIDcreatePart":function (length) {
            var uuidpart = "";
            for (var i = 0; i < length; i++) {
                var uuidchar = parseInt((Math.random() * 256)).toString(16);
                if (uuidchar.length == 1) {
                    uuidchar = "0" + uuidchar;
                }
                uuidpart += uuidchar;
            }
            return uuidpart;
        }
    };

    (function () {
        var timer = setInterval(function () {
            var state = document.readyState;
            if (state != 'loaded' && state != 'complete') {
                return;
            }
            clearInterval(timer);
            justepApp.createBridge();
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
justepApp.addPlugin(function () {
    var Acceleration = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.timestamp = new Date().getTime();
    };

    var Accelerometer = function () {
        this.lastAcceleration = new Acceleration(0, 0, 0);
    };

    Accelerometer.prototype.getCurrentAcceleration = function (successCallback, errorCallback, options) {
        if (typeof successCallback == "function") {
            successCallback(this.lastAcceleration);
        }
    };

    Accelerometer.prototype._onAccelUpdate = function (x, y, z) {
        this.lastAcceleration = new Acceleration(x, y, z);
    };

    Accelerometer.prototype.watchAcceleration = function (successCallback, errorCallback, options) {
        var frequency = (options != undefined && options.frequency != undefined)
            ? options.frequency
            : 10000;
        var updatedOptions = {
            desiredFrequency:frequency
        }
        justepApp.exec("JustepAppAccelerometer.start", options);

        return setInterval(function () {
            justepApp.accelerometer.getCurrentAcceleration(
                successCallback, errorCallback, options);
        }, frequency);
    };

    Accelerometer.prototype.clearWatch = function (watchId) {
        justepApp.exec("JustepAppAccelerometer.stop");
        clearInterval(watchId);
    };
    if (typeof justepApp.accelerometer == "undefined") {
        justepApp.accelerometer = new Accelerometer();
        justepApp.Acceleration = Acceleration;
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

        var accelWin = function (acceleration) {
            var evt = document.createEvent('Events');
            evt.initEvent(devicemotionEvent);

            evt.acceleration = null;
            evt.rotationRate = null;
            evt.accelerationIncludingGravity = acceleration;

            var currentTime = new Date().getTime();
            evt.interval = (self.deviceMotionLastEventTimestamp == 0)
                ? 0
                : (currentTime - self.deviceMotionLastEventTimestamp);
            self.deviceMotionLastEventTimestamp = currentTime;

            if (windowDispatchAvailable) {
                window.dispatchEvent(evt);
            } else {
                document.dispatchEvent(evt);
            }
        };

        var accelFail = function () {

        };

        // override `window.addEventListener`
        window.addEventListener = function () {
            if (arguments[0] === devicemotionEvent) {
                ++(self.deviceMotionListenerCount);
                if (self.deviceMotionListenerCount == 1) { // start
                    self.deviceMotionWatchId = justepApp.accelerometer
                        .watchAcceleration(accelWin, accelFail, {
                            frequency:500
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
        window.removeEventListener = function () {
            if (arguments[0] === devicemotionEvent) {
                --(self.deviceMotionListenerCount);
                if (self.deviceMotionListenerCount == 0) { // stop
                    justepApp.accelerometer
                        .clearWatch(self.deviceMotionWatchId);
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

justepApp.addPlugin(function () {
    /**
     * This class contains information about the current battery status.
     *
     * @constructor
     */
    var Battery = function () {
        this._level = null;
        this._isPlugged = null;
        this._batteryListener = [];
        this._lowListener = [];
        this._criticalListener = [];
    };

    /**
     * Registers as an event producer for battery events.
     *
     * @param {Object}
     *            eventType
     * @param {Object}
     *            handler
     * @param {Object}
     *            add
     */
    Battery.prototype.eventHandler = function (eventType, handler, add) {
        var me = justepApp.battery;
        if (add) {
            // If there are no current registered event listeners start the
            // battery listener on native side.
            if (me._batteryListener.length === 0
                && me._lowListener.length === 0
                && me._criticalListener.length === 0) {
                justepApp
                    .exec(me._status, me._error, "JustepAppBattery.start:");
            }

            // Register the event listener in the proper array
            if (eventType === "batterystatus") {
                var pos = me._batteryListener.indexOf(handler);
                if (pos === -1) {
                    me._batteryListener.push(handler);
                }
            } else if (eventType === "batterylow") {
                var pos = me._lowListener.indexOf(handler);
                if (pos === -1) {
                    me._lowListener.push(handler);
                }
            } else if (eventType === "batterycritical") {
                var pos = me._criticalListener.indexOf(handler);
                if (pos === -1) {
                    me._criticalListener.push(handler);
                }
            }
        } else {
            // Remove the event listener from the proper array
            if (eventType === "batterystatus") {
                var pos = me._batteryListener.indexOf(handler);
                if (pos > -1) {
                    me._batteryListener.splice(pos, 1);
                }
            } else if (eventType === "batterylow") {
                var pos = me._lowListener.indexOf(handler);
                if (pos > -1) {
                    me._lowListener.splice(pos, 1);
                }
            } else if (eventType === "batterycritical") {
                var pos = me._criticalListener.indexOf(handler);
                if (pos > -1) {
                    me._criticalListener.splice(pos, 1);
                }
            }
            if (me._batteryListener.length === 0
                && me._lowListener.length === 0
                && me._criticalListener.length === 0) {
                justepApp.exec("JustepAppBattery.stop");
            }
        }
    };

    /**
     * Callback for battery status
     *
     * @param {Object}
     *            info keys: level, isPlugged
     */
    Battery.prototype._status = function (info) {
        if (info) {
            var me = this;
            if (me._level != info.level || me._isPlugged != info.isPlugged) {
                justepApp.fireEvent("batterystatus", window, info);

                if (info.level == 20 || info.level == 5) {
                    if (info.level == 20) {
                        justepApp.fireEvent("batterylow", window, info);
                    } else {
                        justepApp.fireEvent("batterycritical", window, info);
                    }
                }
            }
            me._level = info.level;
            me._isPlugged = info.isPlugged;
        }
    };

    // TODO :console 注册到本地代码中
    Battery.prototype._error = function (e) {
        console.log("Error initializing Battery: " + e);
    };

    Battery.prototype.monitor = function () {
        justepApp.addEventHandler("batterystatus",
            justepApp.battery.eventHandler);
        justepApp.addEventHandler("batterylow", justepApp.battery.eventHandler);
        justepApp.addEventHandler("batterycritical",
            justepApp.battery.eventHandler);
    };
    Battery.prototype.stop = function () {
        justepApp.removeEventHandler("batterystatus",
            justepApp.battery.eventHandler);
        justepApp.removeEventHandler("batterylow",
            justepApp.battery.eventHandler);
        justepApp.removeEventHandler("batterycritical",
            justepApp.battery.eventHandler);
    };

    if (typeof justepApp.battery === "undefined") {
        justepApp.battery = new Battery();
    }
});

justepApp.addPlugin(function () {
    /**
     * This class provides access to the device camera.
     *
     * @constructor
     */
    Camera = function () {

    }
    /**
     * Available Camera Options {boolean} allowEdit - true to allow
     * editing image, default = false {number} quality 0-100 (low to
     * high) default = 100 {Camera.DestinationType} destinationType
     * default = DATA_URL {Camera.PictureSourceType} sourceType default =
     * CAMERA {number} targetWidth - width in pixels to scale image
     * default = 0 (no scaling) {number} targetHeight - height in pixels
     * to scale image default = 0 (no scaling) {Camera.EncodingType} -
     * encodingType default = JPEG {boolean} correctOrientation - Rotate
     * the image to correct for the orientation of the device during
     * capture (iOS only) {boolean} saveToPhotoAlbum - Save the image to
     * the photo album on the device after capture (iOS only)
     */
    /**
     * Format of image that is returned from getPicture.
     *
     * Example: justepApp.camera.getPicture(success, fail, { quality:
			 * 80, destinationType: Camera.DestinationType.DATA_URL, sourceType:
			 * Camera.PictureSourceType.PHOTOLIBRARY})
     */
    Camera.DestinationType = {
        DATA_URL:0, // Return base64 encoded string
        FILE_URI:1
        // Return file uri
    };
    Camera.prototype.DestinationType = Camera.DestinationType;

    /**
     * Source to getPicture from.
     *
     * Example: justepApp.camera.getPicture(success, fail, { quality:
			 * 80, destinationType: Camera.DestinationType.DATA_URL, sourceType:
			 * Camera.PictureSourceType.PHOTOLIBRARY})
     */
    Camera.PictureSourceType = {
        PHOTOLIBRARY:0, // Choose image from picture library
        CAMERA:1, // Take picture from camera
        SAVEDPHOTOALBUM:2
        // Choose image from picture library
    };
    Camera.prototype.PictureSourceType = Camera.PictureSourceType;

    /**
     * Encoding of image returned from getPicture.
     *
     * Example: justepApp.camera.getPicture(success, fail, { quality:
			 * 80, destinationType: Camera.DestinationType.DATA_URL, sourceType:
			 * Camera.PictureSourceType.CAMERA, encodingType:
			 * Camera.EncodingType.PNG})
     */
    Camera.EncodingType = {
        JPEG:0, // Return JPEG encoded image
        PNG:1
        // Return PNG encoded image
    };
    Camera.prototype.EncodingType = Camera.EncodingType;

    /**
     * Type of pictures to select from. Only applicable when
     * PictureSourceType is PHOTOLIBRARY or SAVEDPHOTOALBUM
     *
     * Example: justepApp.camera.getPicture(success, fail, { quality:
			 * 80, destinationType: Camera.DestinationType.DATA_URL, sourceType:
			 * Camera.PictureSourceType.PHOTOLIBRARY, mediaType:
			 * Camera.MediaType.PICTURE})
     */
    Camera.MediaType = {
        PICTURE:0, // allow selection of still pictures only.
        // DEFAULT. Will return format specified via
        // DestinationType
        VIDEO:1, // allow selection of video only, ONLY RETURNS URL
        ALLMEDIA:2
        // allow selection from all media types
    };
    Camera.prototype.MediaType = Camera.MediaType;

    /**
     * Gets a picture from source defined by "options.sourceType", and
     * returns the image as defined by the "options.destinationType"
     * option.
     *
     * The defaults are sourceType=CAMERA and destinationType=DATA_URL.
     *
     * @param {Function}
     *            successCallback
     * @param {Function}
     *            errorCallback
     * @param {Object}
     *            options
     */
    Camera.prototype.getPicture = function (successCallback, errorCallback, options) {
        // successCallback required
        if (typeof successCallback != "function") {
            console
                .log("Camera Error: successCallback is not a function");
            return;
        }
        // errorCallback optional
        if (errorCallback && (typeof errorCallback != "function")) {
            console
                .log("Camera Error: errorCallback is not a function");
            return;
        }
        justepApp.exec(successCallback, errorCallback,
            "JustepAppCamera.getPicture:", options);
    };
    if (typeof justepApp.camera == "undefined") {
        justepApp.camera = new Camera();
    }
});

justepApp.addPlugin(function () {
    /**
     * The CaptureError interface encapsulates all errors in the Capture API.
     */
    function CaptureError() {
        this.code = null;
    };

    // Capture error codes
    CaptureError.CAPTURE_INTERNAL_ERR = 0;
    CaptureError.CAPTURE_APPLICATION_BUSY = 1;
    CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
    CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
    CaptureError.CAPTURE_NOT_SUPPORTED = 20;

    /**
     * The Capture interface exposes an interface to the camera and microphone
     * of the hosting device.
     */
    function Capture() {
        this.supportedAudioModes = [];
        this.supportedImageModes = [];
        this.supportedVideoModes = [];
    };

    /**
     * Launch audio recorder application for recording audio clip(s).
     *
     * @param {Function}
     *            successCB
     * @param {Function}
     *            errorCB
     * @param {CaptureAudioOptions}
     *            options
     *
     * No audio recorder to launch for iOS - return CAPTURE_NOT_SUPPORTED
     */
    Capture.prototype.captureAudio = function (successCallback, errorCallback, options) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppCapture.captureAudio:", options);
    };

    /**
     * Launch camera application for taking image(s).
     *
     * @param {Function}
     *            successCB
     * @param {Function}
     *            errorCB
     * @param {CaptureImageOptions}
     *            options
     */
    Capture.prototype.captureImage = function (successCallback, errorCallback, options) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppCapture.captureImage:", options);
    };

    /**
     * Casts a PluginResult message property (array of objects) to an array of
     * MediaFile objects (used in Objective-C)
     *
     * @param {PluginResult}
     *            pluginResult
     */
    Capture.prototype._castMediaFile = function (pluginResult) {
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

    /**
     * Launch device camera application for recording video(s).
     *
     * @param {Function}
     *            successCB
     * @param {Function}
     *            errorCB
     * @param {CaptureVideoOptions}
     *            options
     */
    Capture.prototype.captureVideo = function (successCallback, errorCallback, options) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppCapture.captureVideo:", options);
    };

    /**
     * Encapsulates a set of parameters that the capture device supports.
     */
    function ConfigurationData() {
        // The ASCII-encoded string in lower case representing the media type.
        this.type;
        // The height attribute represents height of the image or video in
        // pixels.
        // In the case of a sound clip this attribute has value 0.
        this.height = 0;
        // The width attribute represents width of the image or video in pixels.
        // In the case of a sound clip this attribute has value 0
        this.width = 0;
    };

    /**
     * Encapsulates all image capture operation configuration options.
     */
    var CaptureImageOptions = function () {
        // Upper limit of images user can take. Value must be equal or greater
        // than 1.
        this.limit = 1;
        // The selected image mode. Must match with one of the elements in
        // supportedImageModes array.
        this.mode = null;
    };

    /**
     * Encapsulates all video capture operation configuration options.
     */
    var CaptureVideoOptions = function () {
        // Upper limit of videos user can record. Value must be equal or greater
        // than 1.
        this.limit = 1;
        // Maximum duration of a single video clip in seconds.
        this.duration = 0;
        // The selected video mode. Must match with one of the elements in
        // supportedVideoModes array.
        this.mode = null;
    };

    /**
     * Encapsulates all audio capture operation configuration options.
     */
    var CaptureAudioOptions = function () {
        // Upper limit of sound clips user can record. Value must be equal or
        // greater than 1.
        this.limit = 1;
        // Maximum duration of a single sound clip in seconds.
        this.duration = 0;
        // The selected audio mode. Must match with one of the elements in
        // supportedAudioModes array.
        this.mode = null;
    };

    /**
     * Represents a single file.
     *
     * name {DOMString} name of the file, without path information fullPath
     * {DOMString} the full path of the file, including the name type
     * {DOMString} mime type lastModifiedDate {Date} last modified date size
     * {Number} size of the file in bytes
     */
    function MediaFile(name, fullPath, type, lastModifiedDate, size) {
        this.name = name || null;
        this.fullPath = fullPath || null;
        this.type = type || null;
        this.lastModifiedDate = lastModifiedDate || null;
        this.size = size || 0;
    }

    /**
     * Request capture format data for a specific file and type
     *
     * @param {Function}
     *            successCB
     * @param {Function}
     *            errorCB
     */
    MediaFile.prototype.getFormatData = function (successCallback, errorCallback) {
        if (typeof this.fullPath === "undefined" || this.fullPath === null) {
            errorCallback({
                "code":CaptureError.CAPTURE_INVALID_ARGUMENT
            });
        } else {
            justepApp.exec(successCallback, errorCallback,
                "JustepAppCapture.getFormatData:fromPath:withType:",
                this.fullPath, this.type);
        }
    };

    /**
     * @deprecated MediaFileData encapsulates format information of a media
     *             file.
     *
     * @param {DOMString}
     *            codecs
     * @param {long}
     *            bitrate
     * @param {long}
     *            height
     * @param {long}
     *            width
     * @param {float}
     *            duration
     */
    function MediaFileData(codecs, bitrate, height, width, duration) {
        this.codecs = codecs || null;
        this.bitrate = bitrate || 0;
        this.height = height || 0;
        this.width = width || 0;
        this.duration = duration || 0;
    }

    if (typeof justepApp.capture === "undefined") {
        justepApp.capture = new Capture();
        justepApp.CaptureAudioOptions = CaptureAudioOptions;
        justepApp.CaptureImageOptions = CaptureImageOptions;
        justepApp.CaptureVideoOptions = CaptureVideoOptions;
        justepApp.ConfigurationData = ConfigurationData;
        justepApp.MediaFile = MediaFile;
        justepApp.MediaFileData = MediaFileData;
    }
});
justepApp.addPlugin(function () {
    var CompassError = function () {
        this.code = null;
    };

    // Capture error codes
    CompassError.COMPASS_INTERNAL_ERR = 0;
    CompassError.COMPASS_NOT_SUPPORTED = 20;

    var CompassHeading = function () {
        this.magneticHeading = null;
        this.trueHeading = null;
        this.headingAccuracy = null;
        this.timestamp = null;
    }
    /**
     * This class provides access to device Compass data.
     *
     * @constructor
     */
    var Compass = function () {
        /**
         * List of compass watch timers
         */
        this.timers = {};
    };

    /**
     * Asynchronously acquires the current heading.
     *
     * @param {Function}
     *            successCallback The function to call when the heading
     *            data is available
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error getting the heading data.
     * @param {PositionOptions}
     *            options The options for getting the heading data (not
     *            used).
     */
    Compass.prototype.getCurrentHeading = function (successCallback, errorCallback, options) {
        // successCallback required
        if (typeof successCallback !== "function") {
            console
                .log("Compass Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console
                .log("Compass Error: errorCallback is not a function");
            return;
        }

        // Get heading
        justepApp.exec(successCallback, errorCallback,
            "JustepAppGeolocation.getCurrentHeading:", {});
    };

    /**
     * Asynchronously acquires the heading repeatedly at a given
     * interval.
     *
     * @param {Function}
     *            successCallback The function to call each time the
     *            heading data is available
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error getting the heading data.
     * @param {HeadingOptions}
     *            options The options for getting the heading data such
     *            as timeout and the frequency of the watch.
     */
    Compass.prototype.watchHeading = function (successCallback, errorCallback, options) {
        // Default interval (100 msec)
        var frequency = (options !== undefined)
            ? options.frequency
            : 100;

        // successCallback required
        if (typeof successCallback !== "function") {
            console
                .log("Compass Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console
                .log("Compass Error: errorCallback is not a function");
            return;
        }

        // Start watch timer to get headings
        var id = justepApp.createUUID();
        justepApp.compass.timers[id] = setInterval(function () {
            justepApp.exec(successCallback, errorCallback,
                "JustepAppGeolocation.getCurrentHeading:",
                {
                    repeats:1
                });
        }, frequency);

        return id;
    };

    /**
     * Clears the specified heading watch.
     *
     * @param {String}
     *            watchId The ID of the watch returned from
     *            #watchHeading.
     */
    Compass.prototype.clearWatch = function (id) {
        // Stop javascript timer & remove from timer list
        if (id && justepApp.compass.timers[id]) {
            clearInterval(justepApp.compass.timers[id]);
            delete justepApp.compass.timers[id];
        }
        if (justepApp.compass.timers.length == 0) {
            // stop the
            justepApp.exec("JustepAppGeolocation.stopHeading");
        }
    };

    /**
     * iOS only Asynchronously fires when the heading changes from the
     * last reading. The amount of distance required to trigger the
     * event is specified in the filter paramter.
     *
     * @param {Function}
     *            successCallback The function to call each time the
     *            heading data is available
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error getting the heading data.
     * @param {HeadingOptions}
     *            options The options for getting the heading data
     * @param {filter}
     *            number of degrees change to trigger a callback with
     *            heading data (float)
     *
     * In iOS this function is more efficient than calling watchHeading
     * with a frequency for updates. Only one watchHeadingFilter can be
     * in effect at one time. If a watchHeadingFilter is in effect,
     * calling getCurrentHeading or watchHeading will use the existing
     * filter value for specifying heading change.
     */
    Compass.prototype.watchHeadingFilter = function (successCallback, errorCallback, options) {

        if (options === undefined || options.filter === undefined) {
            console.log("Compass Error:  options.filter not specified");
            return;
        }

        // successCallback required
        if (typeof successCallback !== "function") {
            console
                .log("Compass Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console
                .log("Compass Error: errorCallback is not a function");
            return;
        }
        justepApp.exec(successCallback, errorCallback,
            "JustepAppGeolocation.watchHeadingFilter:", options);
    }
    Compass.prototype.clearWatchFilter = function () {
        justepApp.exec("JustepAppGeolocation.stopHeading");
    };
    if (typeof justepApp.compass == "undefined") {
        justepApp.compass = new Compass();
    }
});
/**
 * 通讯录 联系人
 */
justepApp.addPlugin(function () {
    /**
     * Contains information about a single contact.
     *
     * @param {DOMString}
     *            id unique identifier
     * @param {DOMString}
     *            displayName
     * @param {ContactName}
     *            name
     * @param {DOMString}
     *            nickname
     * @param {ContactField[]}
     *            phoneNumbers array of phone numbers
     * @param {ContactField[]}
     *            emails array of email addresses
     * @param {ContactAddress[]}
     *            addresses array of addresses
     * @param {ContactField[]}
     *            ims instant messaging user ids
     * @param {ContactOrganization[]}
     *            organizations
     * @param {DOMString}
     *            birthday contact's birthday
     * @param {DOMString}
     *            note user notes about contact
     * @param {ContactField[]}
     *            photos
     * @param {Array.
	 *            <ContactField>} categories
     * @param {ContactField[]}
     *            urls contact's web sites
     */
    var Contact = function (id, displayName, name, nickname, phoneNumbers, emails, addresses, ims, organizations, birthday, note, photos, categories, urls) {
        this.id = id || null;
        this.displayName = displayName || null;
        this.name = name || null; // ContactName
        this.nickname = nickname || null;
        this.phoneNumbers = phoneNumbers || null; // ContactField[]
        this.emails = emails || null; // ContactField[]
        this.addresses = addresses || null; // ContactAddress[]
        this.ims = ims || null; // ContactField[]
        this.organizations = organizations || null; // ContactOrganization[]
        this.birthday = birthday || null; // JS Date
        this.note = note || null;
        this.photos = photos || null; // ContactField[]
        this.categories = categories || null;
        this.urls = urls || null; // ContactField[]
    };

    /**
     * Converts Dates to milliseconds before sending to iOS
     */
    Contact.prototype.convertDatesOut = function () {
        var dates = new Array("birthday");
        for (var i = 0; i < dates.length; i++) {
            var value = this[dates[i]];
            if (value) {
                if (!value instanceof Date) {
                    try {
                        value = new Date(value);
                    } catch (exception) {
                        value = null;
                    }
                }
                if (value instanceof Date) {
                    value = value.valueOf();
                }
                this[dates[i]] = value;
            }
        }

    };
    /**
     * Converts milliseconds to JS Date when returning from iOS
     */
    Contact.prototype.convertDatesIn = function () {
        var dates = new Array("birthday");
        for (var i = 0; i < dates.length; i++) {
            var value = this[dates[i]];
            if (value) {
                try {
                    this[dates[i]] = new Date(parseFloat(value));
                } catch (exception) {
                    console.log("exception creating date");
                }
            }
        }
    };
    /**
     * Removes contact from device storage.
     *
     * @param successCB
     *            success callback
     * @param errorCB
     *            error callback (optional)
     */
    Contact.prototype.remove = function (successCB, errorCB) {
        if (this.id == null) {
            var errorObj = new ContactError();
            errorObj.code = ContactError.UNKNOWN_ERROR;
            errorCB(errorObj);
        } else {
            justepApp.exec(successCB, errorCB, "JustepAppContacts.remove:", {
                "contact":this
            });
        }
    };
    /**
     * iOS ONLY displays contact via iOS UI NOT part of W3C spec so no official
     * documentation
     *
     * @param errorCB
     *            error callback
     * @param options
     *            object allowsEditing: boolean AS STRING "true" to allow
     *            editing the contact "false" (default) display contact
     */
    Contact.prototype.display = function (errorCB, options) {
        if (this.id == null) {
            if (typeof errorCB == "function") {
                var errorObj = new ContactError();
                errorObj.code = ContactError.UNKNOWN_ERROR;
                errorCB(errorObj);
            }
        } else {
            justepApp.exec(null, errorCB,
                "JustepAppContacts.displayContact:withId:", this.id,
                options);
        }
    };

    /**
     * Creates a deep copy of this Contact. With the contact ID set to null.
     *
     * @return copy of this Contact
     */
    Contact.prototype.clone = function () {
        var clonedContact = justepApp.clone(this);
        clonedContact.id = null;
        // Loop through and clear out any id's in phones, emails, etc.
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

    /**
     * Persists contact to device storage.
     *
     * @param successCB
     *            success callback
     * @param errorCB
     *            error callback - optional
     */
    Contact.prototype.save = function (successCB, errorCB) {
        // don't modify the original contact
        var cloned = justepApp.clone(this);
        cloned.convertDatesOut();
        justepApp.exec(successCB, errorCB, "JustepAppContacts.save:", {
            "contact":cloned
        });
    };

    /**
     * Contact name.
     *
     * @param formatted
     * @param familyName
     * @param givenName
     * @param middle
     * @param prefix
     * @param suffix
     */
    var ContactName = function (formatted, familyName, givenName, middle, prefix, suffix) {
        this.formatted = formatted != "undefined" ? formatted : null;
        this.familyName = familyName != "undefined" ? familyName : null;
        this.givenName = givenName != "undefined" ? givenName : null;
        this.middleName = middle != "undefined" ? middle : null;
        this.honorificPrefix = prefix != "undefined" ? prefix : null;
        this.honorificSuffix = suffix != "undefined" ? suffix : null;
    };

    /**
     * Generic contact field.
     *
     * @param type
     * @param value
     * @param pref
     * @param id
     */
    var ContactField = function (type, value, pref, id) {
        this.type = type != "undefined" ? type : null;
        this.value = value != "undefined" ? value : null;
        this.pref = pref != "undefined" ? pref : null;
        this.id = id != "undefined" ? id : null;
    };

    /**
     * Contact address.
     *
     * @param pref -
     *            boolean is primary / preferred address
     * @param type -
     *            string - work, home…..
     * @param formatted
     * @param streetAddress
     * @param locality
     * @param region
     * @param postalCode
     * @param country
     */
    var ContactAddress = function (pref, type, formatted, streetAddress, locality, region, postalCode, country, id) {
        this.pref = pref != "undefined" ? pref : null;
        this.type = type != "undefined" ? type : null;
        this.formatted = formatted != "undefined" ? formatted : null;
        this.streetAddress = streetAddress != "undefined"
            ? streetAddress
            : null;
        this.locality = locality != "undefined" ? locality : null;
        this.region = region != "undefined" ? region : null;
        this.postalCode = postalCode != "undefined" ? postalCode : null;
        this.country = country != "undefined" ? country : null;
        this.id = id != "undefined" ? id : null;
    };

    /**
     * Contact organization.
     *
     * @param pref -
     *            boolean is primary / preferred address
     * @param type -
     *            string - work, home…..
     * @param name
     * @param dept
     * @param title
     */
    var ContactOrganization = function (pref, type, name, dept, title) {
        this.pref = pref != "undefined" ? pref : null;
        this.type = type != "undefined" ? type : null;
        this.name = name != "undefined" ? name : null;
        this.department = dept != "undefined" ? dept : null;
        this.title = title != "undefined" ? title : null;
    };

    /**
     * Contact account.
     *
     * @param domain
     * @param username
     * @param userid
     */
    /*
     * var ContactAccount = function(domain, username, userid) { this.domain =
     * domain != "undefined" ? domain : null; this.username = username !=
     * "undefined" ? username : null; this.userid = userid != "undefined" ?
     * userid : null; }
     */

    /**
     * Represents a group of Contacts.
     */
    var Contacts = function () {
        this.inProgress = false;
        this.records = new Array();
    };
    /**
     * Returns an array of Contacts matching the search criteria.
     *
     * @param fields
     *            that should be searched
     * @param successCB
     *            success callback
     * @param errorCB
     *            error callback (optional)
     * @param {ContactFindOptions}
     *            options that can be applied to contact searching
     * @return array of Contacts matching search criteria
     */
    Contacts.prototype.find = function (fields, successCB, errorCB, options) {
        if (successCB === null) {
            throw new TypeError("You must specify a success callback for the find command.");
        }
        if (fields === null || fields === "undefined"
            || fields.length === "undefined" || fields.length <= 0) {
            if (typeof errorCB === "function") {
                errorCB({
                    "code":ContactError.INVALID_ARGUMENT_ERROR
                });
            }
        } else {
            justepApp.exec(successCB, errorCB, "JustepAppContacts.search:", {
                "fields":fields,
                "findOptions":options
            });
        }
    };
    /**
     * need to turn the array of JSON strings representing contact objects into
     * actual objects
     *
     * @param array
     *            of JSON strings with contact data
     * @return call results callback with array of Contact objects This function
     *         is called from objective C Contacts.search() method.
     */
    Contacts.prototype._findCallback = function (pluginResult) {
        var contacts = new Array();
        try {
            for (var i = 0; i < pluginResult.message.length; i++) {
                var newContact = justepApp.contacts
                    .create(pluginResult.message[i]);
                newContact.convertDatesIn();
                contacts.push(newContact);
            }
            pluginResult.message = contacts;
        } catch (e) {
            console.log("Error parsing contacts: " + e);
        }
        return pluginResult;
    }

    /**
     * need to turn the JSON string representing contact object into actual
     * object
     *
     * @param JSON
     *            string with contact data Call stored results function with
     *            Contact object This function is called from objective C
     *            Contacts remove and save methods
     */
    Contacts.prototype._contactCallback = function (pluginResult) {
        var newContact = null;
        if (pluginResult.message) {
            try {
                newContact = justepApp.contacts.create(pluginResult.message);
                newContact.convertDatesIn();
            } catch (e) {
                console.log("Error parsing contact");
            }
        }
        pluginResult.message = newContact;
        return pluginResult;

    };
    /**
     * Need to return an error object rather than just a single error code
     *
     * @param error
     *            code Call optional error callback if found. Called from
     *            objective c find, remove, and save methods on error.
     */
    Contacts.prototype._errCallback = function (pluginResult) {
        var errorObj = new ContactError();
        errorObj.code = pluginResult.message;
        pluginResult.message = errorObj;
        return pluginResult;
    };
    // iPhone only api to create a new contact via the GUI
    Contacts.prototype.newContactUI = function (successCallback) {
        justepApp.exec(successCallback, null, "JustepAppContacts.newContact:");
    };
    // iPhone only api to select a contact via the GUI
    Contacts.prototype.chooseContact = function (successCallback, options) {
        justepApp.exec(successCallback, null,
            "JustepAppContacts.chooseContact:", options);
    };

    /**
     * This function creates a new contact, but it does not persist the contact
     * to device storage. To persist the contact to device storage, invoke
     * contact.save().
     *
     * @param properties
     *            an object who's properties will be examined to create a new
     *            Contact
     * @returns new Contact object
     */
    Contacts.prototype.create = function (properties) {
        var i;
        var contact = new Contact();
        for (i in properties) {
            if (contact[i] !== 'undefined') {
                contact[i] = properties[i];
            }
        }
        return contact;
    };

    /**
     * ContactFindOptions.
     *
     * @param filter
     *            used to match contacts against
     * @param multiple
     *            boolean used to determine if more than one contact should be
     *            returned
     */
    var ContactFindOptions = function (filter, multiple, updatedSince) {
        this.filter = filter || '';
        this.multiple = multiple || false;
    };

    /**
     * ContactError. An error code assigned by an implementation when an error
     * has occurred
     */
    var ContactError = function () {
        this.code = null;
    };

    /**
     * Error codes
     */
    ContactError.UNKNOWN_ERROR = 0;
    ContactError.INVALID_ARGUMENT_ERROR = 1;
    ContactError.TIMEOUT_ERROR = 2;
    ContactError.PENDING_OPERATION_ERROR = 3;
    ContactError.IO_ERROR = 4;
    ContactError.NOT_SUPPORTED_ERROR = 5;
    ContactError.PERMISSION_DENIED_ERROR = 20;
    if (typeof justepApp.contacts == "undefined") {
        justepApp.contacts = new Contacts();
        justepApp.Contact = Contact;
        justepApp.ContactField = ContactField;
        justepApp.ContactOrganization = ContactOrganization;
        justepApp.ContactFindOptions = ContactFindOptions;
        justepApp.ContactError = ContactError;
    }
});
/**
 * 硬件基本信息
 */
justepApp.addPlugin(function () {
    if (typeof justepApp.device == "undefined"
        || typeof justepApp.device.uuid == "undefined") {
        var Device = function () {
            this.platform = undefined;
            this.version = undefined;
            this.name = undefined;
            this.JustepAppVersion = undefined;
            this.uuid = undefined;
            try {
                this.platform = DeviceInfo.platform;
                this.version = DeviceInfo.version;
                this.name = DeviceInfo.name;
                this.JustepAppVersion = DeviceInfo.JustepAppVersion;
                this.uuid = DeviceInfo.uuid;
                justepApp.available = true;
            } catch (e) {
                justepApp.available = false;
            }
        }
        justepApp.device = new Device();
    }
});
/**
 * Add the FileSystem interface into the browser.
 */
justepApp.addPlugin(function () {
    /**
     * This class provides generic read and write access to the mobile device
     * file system. They are not used to read files from a server.
     */

    /**
     * This class provides some useful information about a file. This is the
     * fields returned when justepApp.fileMgr.getFileProperties() is called.
     */
    var FileProperties = function (filePath) {
        this.filePath = filePath;
        this.size = 0;
        this.lastModifiedDate = null;
    }
    /**
     * Represents a single file.
     *
     * name {DOMString} name of the file, without path information fullPath
     * {DOMString} the full path of the file, including the name type
     * {DOMString} mime type lastModifiedDate {Date} last modified date size
     * {Number} size of the file in bytes
     */
    var File = function (name, fullPath, type, lastModifiedDate, size) {
        this.name = name || null;
        this.fullPath = fullPath || null;
        this.type = type || null;
        this.lastModifiedDate = lastModifiedDate || null;
        this.size = size || 0;
    }
    /**
     * Create an event object since we can't set target on DOM event.
     *
     * @param type
     * @param target
     *
     */
    File._createEvent = function (type, target) {
        // Can't create event object, since we can't set target (its readonly)
        // var evt = document.createEvent('Events');
        // evt.initEvent("onload", false, false);
        var evt = {
            "type":type
        };
        evt.target = target;
        return evt;
    };

    var FileError = function () {
        this.code = null;
    }

    // File error codes
    // Found in DOMException
    FileError.NOT_FOUND_ERR = 1;
    FileError.SECURITY_ERR = 2;
    FileError.ABORT_ERR = 3;

    // Added by this specification
    FileError.NOT_READABLE_ERR = 4;
    FileError.ENCODING_ERR = 5;
    FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
    FileError.INVALID_STATE_ERR = 7;
    FileError.SYNTAX_ERR = 8;
    FileError.INVALID_MODIFICATION_ERR = 9;
    FileError.QUOTA_EXCEEDED_ERR = 10;
    FileError.TYPE_MISMATCH_ERR = 11;
    FileError.PATH_EXISTS_ERR = 12;

    // -----------------------------------------------------------------------------
    // File manager
    // -----------------------------------------------------------------------------

    var FileMgr = function () {
    }

    FileMgr.prototype.testFileExists = function (fileName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.testFileExists:withFileName:", fileName);
    };

    FileMgr.prototype.testDirectoryExists = function (dirName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.testDirectoryExists:withDirName:", dirName);
    };

    FileMgr.prototype.getFreeDiskSpace = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getFreeDiskSpace:");
    };

    FileMgr.prototype.write = function (fileName, data, position, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.write:withName:withData:withPosition:",
            fileName, data, position);
    };

    FileMgr.prototype.truncate = function (fileName, size, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.truncateFile:withName:withSize:", fileName,
            size);
    };

    FileMgr.prototype.readAsText = function (fileName, encoding, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.readFile:withName:withEncoding:", fileName,
            encoding);
    };

    FileMgr.prototype.readAsDataURL = function (fileName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.readAsDataURL:withName:", fileName);
    };

    justepApp.addPlugin(function () {
        if (typeof justepApp.fileMgr === "undefined") {
            justepApp.fileMgr = new FileMgr();
        }
    });

    // -----------------------------------------------------------------------------
    // File Reader
    // -----------------------------------------------------------------------------

    /**
     * This class reads the mobile device file system.
     *
     */
    FileReader = function () {
        this.fileName = "";

        this.readyState = 0;

        // File data
        this.result = null;

        // Error
        this.error = null;

        // Event handlers
        this.onloadstart = null; // When the read starts.
        this.onprogress = null; // While reading (and decoding) file or fileBlob
        // data, and reporting partial file data
        // (progess.loaded/progress.total)
        this.onload = null; // When the read has successfully completed.
        this.onerror = null; // When the read has failed (see errors).
        this.onloadend = null; // When the request has completed (either in
        // success or failure).
        this.onabort = null; // When the read has been aborted. For instance,
        // by invoking the abort() method.
    }

    // States
    FileReader.EMPTY = 0;
    FileReader.LOADING = 1;
    FileReader.DONE = 2;

    /**
     * Abort reading file.
     */
    FileReader.prototype.abort = function () {
        var evt;
        this.readyState = FileReader.DONE;
        this.result = null;

        // set error
        var error = new FileError();
        error.code = error.ABORT_ERR;
        this.error = error;

        // If error callback
        if (typeof this.onerror === "function") {
            evt = File._createEvent("error", this);
            this.onerror(evt);
        }
        // If abort callback
        if (typeof this.onabort === "function") {
            evt = File._createEvent("abort", this);
            this.onabort(evt);
        }
        // If load end callback
        if (typeof this.onloadend === "function") {
            evt = File._createEvent("loadend", this);
            this.onloadend(evt);
        }
    };

    /**
     * Read text file.
     *
     * @param file
     *            The name of the file
     * @param encoding
     *            [Optional] (see
     *            http://www.iana.org/assignments/character-sets)
     */
    FileReader.prototype.readAsText = function (file, encoding) {
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
            var evt = File._createEvent("loadstart", this);
            this.onloadstart(evt);
        }

        // Default encoding is UTF-8
        var enc = encoding ? encoding : "UTF-8";

        var me = this;

        // Read file
        justepApp.fileMgr.readAsText(this.fileName, enc,

            // Success callback
            function (r) {
                var evt;

                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // Save result
                me.result = decodeURIComponent(r);

                // If onload callback
                if (typeof me.onload === "function") {
                    evt = File._createEvent("load", me);
                    me.onload(evt);
                }

                // DONE state
                me.readyState = FileReader.DONE;

                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    evt = File._createEvent("loadend", me);
                    me.onloadend(evt);
                }
            },

            // Error callback
            function (e) {
                var evt;
                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // Save error
                me.error = e;

                // If onerror callback
                if (typeof me.onerror === "function") {
                    evt = File._createEvent("error", me);
                    me.onerror(evt);
                }

                // DONE state
                me.readyState = FileReader.DONE;

                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    evt = File._createEvent("loadend", me);
                    me.onloadend(evt);
                }
            });
    };

    /**
     * Read file and return data as a base64 encoded data url. A data url is of
     * the form: data:[<mediatype>][;base64],<data>
     *
     * @param file
     *            {File} File object containing file properties
     */
    FileReader.prototype.readAsDataURL = function (file) {
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
            var evt = File._createEvent("loadstart", this);
            this.onloadstart(evt);
        }

        var me = this;

        // Read file
        justepApp.fileMgr.readAsDataURL(this.fileName,

            // Success callback
            function (r) {
                var evt;

                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // Save result
                me.result = r;

                // If onload callback
                if (typeof me.onload === "function") {
                    evt = File._createEvent("load", me);
                    me.onload(evt);
                }

                // DONE state
                me.readyState = FileReader.DONE;

                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    evt = File._createEvent("loadend", me);
                    me.onloadend(evt);
                }
            },

            // Error callback
            function (e) {
                var evt;
                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // Save error
                me.error = e;

                // If onerror callback
                if (typeof me.onerror === "function") {
                    evt = File._createEvent("error", me);
                    me.onerror(evt);
                }

                // DONE state
                me.readyState = FileReader.DONE;

                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    evt = File._createEvent("loadend", me);
                    me.onloadend(evt);
                }
            });
    };

    /**
     * Read file and return data as a binary data.
     *
     * @param file
     *            The name of the file
     */
    FileReader.prototype.readAsBinaryString = function (file) {
        // TODO - Can't return binary data to browser.
        this.fileName = file;
    };

    /**
     * Read file and return data as a binary data.
     *
     * @param file
     *            The name of the file
     */
    FileReader.prototype.readAsArrayBuffer = function (file) {
        // TODO - Can't return binary data to browser.
        this.fileName = file;
    };

    // -----------------------------------------------------------------------------
    // File Writer
    // -----------------------------------------------------------------------------

    /**
     * This class writes to the mobile device file system.
     *
     * @param file
     *            {File} a File object representing a file on the file system
     */
    var FileWriter = function (file) {
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
        this.onprogress = null; // While writing the file, and reporting partial
        // file data
        this.onwrite = null; // When the write has successfully completed.
        this.onwriteend = null; // When the request has completed (either in
        // success or failure).
        this.onabort = null; // When the write has been aborted. For
        // instance, by invoking the abort() method.
        this.onerror = null; // When the write has failed (see errors).
    }

    // States
    FileWriter.INIT = 0;
    FileWriter.WRITING = 1;
    FileWriter.DONE = 2;

    /**
     * Abort writing file.
     */
    FileWriter.prototype.abort = function () {
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
            evt = File._createEvent("error", this);
            this.onerror(evt);
        }
        // If abort callback
        if (typeof this.onabort === "function") {
            evt = File._createEvent("abort", this);
            this.onabort(evt);
        }

        this.readyState = FileWriter.DONE;

        // If write end callback
        if (typeof this.onwriteend == "function") {
            evt = File._createEvent("writeend", this);
            this.onwriteend(evt);
        }
    };

    /**
     * @Deprecated: use write instead
     *
     * @param file
     *            to write the data to
     * @param text
     *            to be written
     * @param bAppend
     *            if true write to end of file, otherwise overwrite the file
     */
    FileWriter.prototype.writeAsText = function (file, text, bAppend) {
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        if (bAppend !== true) {
            bAppend = false; // for null values
        }

        this.fileName = file;

        // WRITING state
        this.readyState = FileWriter.WRITING;

        var me = this;

        // If onwritestart callback
        if (typeof me.onwritestart === "function") {
            var evt = File._createEvent("writestart", me);
            me.onwritestart(evt);
        }

        // Write file
        justepApp.fileMgr.writeAsText(file, text, bAppend,
            // Success callback
            function (r) {
                var evt;

                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save result
                me.result = r;

                // If onwrite callback
                if (typeof me.onwrite === "function") {
                    evt = File._createEvent("write", me);
                    me.onwrite(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            },

            // Error callback
            function (e) {
                var evt;

                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                me.error = e;

                // If onerror callback
                if (typeof me.onerror === "function") {
                    evt = File._createEvent("error", me);
                    me.onerror(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            });
    };

    /**
     * Writes data to the file
     *
     * @param text
     *            to be written
     */
    FileWriter.prototype.write = function (text) {
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        // WRITING state
        this.readyState = FileWriter.WRITING;

        var me = this;

        // If onwritestart callback
        if (typeof me.onwritestart === "function") {
            var evt = File._createEvent("writestart", me);
            me.onwritestart(evt);
        }

        // Write file
        justepApp.fileMgr.write(this.fileName, text, this.position,

            // Success callback
            function (r) {
                var evt;
                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // position always increases by bytes written because file would be
                // extended
                me.position += r;
                // The length of the file is now where we are done writing.
                me.length = me.position;

                // If onwrite callback
                if (typeof me.onwrite === "function") {
                    evt = File._createEvent("write", me);
                    me.onwrite(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            },

            // Error callback
            function (e) {
                var evt;

                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                me.error = e;

                // If onerror callback
                if (typeof me.onerror === "function") {
                    evt = File._createEvent("error", me);
                    me.onerror(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            });

    };

    /**
     * Moves the file pointer to the location specified.
     *
     * If the offset is a negative number the position of the file pointer is
     * rewound. If the offset is greater than the file size the position is set
     * to the end of the file.
     *
     * @param offset
     *            is the location to move the file pointer to.
     */
    FileWriter.prototype.seek = function (offset) {
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
     * @param size
     *            to chop the file at.
     */
    FileWriter.prototype.truncate = function (size) {
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }
        // what if no size specified?

        // WRITING state
        this.readyState = FileWriter.WRITING;

        var me = this;

        // If onwritestart callback
        if (typeof me.onwritestart === "function") {
            var evt = File._createEvent("writestart", me);
            me.onwritestart(evt);
        }

        // Write file
        justepApp.fileMgr.truncate(this.fileName, size,

            // Success callback
            function (r) {
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
                    evt = File._createEvent("write", me);
                    me.onwrite(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            },

            // Error callback
            function (e) {
                var evt;
                // If DONE (cancelled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                me.error = e;

                // If onerror callback
                if (typeof me.onerror === "function") {
                    evt = File._createEvent("error", me);
                    me.onerror(evt);
                }

                // DONE state
                me.readyState = FileWriter.DONE;

                // If onwriteend callback
                if (typeof me.onwriteend === "function") {
                    evt = File._createEvent("writeend", me);
                    me.onwriteend(evt);
                }
            });
    };

    var LocalFileSystem = function () {
    };

    // File error codes
    LocalFileSystem.TEMPORARY = 0;
    LocalFileSystem.PERSISTENT = 1;
    LocalFileSystem.RESOURCE = 2;
    LocalFileSystem.APPLICATION = 3;

    /**
     * Requests a filesystem in which to store application data.
     *
     * @param {int}
     *            type of file system being requested
     * @param {Function}
     *            successCallback is called with the new FileSystem
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    LocalFileSystem.prototype.requestFileSystem = function (type, size, successCallback, errorCallback) {
        if (type < 0 || type > 3) {
            if (typeof errorCallback == "function") {
                errorCallback({
                    "code":FileError.SYNTAX_ERR
                });
            }
        } else {
            justepApp.exec(successCallback, errorCallback,
                "JustepAppFile.requestFileSystem:withType:withSize:", type,
                size);
        }
    };

    /**
     *
     * @param {DOMString}
     *            uri referring to a local file in a filesystem
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    LocalFileSystem.prototype.resolveLocalFileSystemURI = function (uri, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.resolveLocalFileSystem:withURI:", uri);
    };

    /**
     * This function is required as we need to convert raw JSON objects into
     * concrete File and Directory objects.
     *
     * @param a
     *            JSON Objects that need to be converted to DirectoryEntry or
     *            FileEntry objects.
     * @returns an entry
     */
    LocalFileSystem.prototype._castFS = function (pluginResult) {
        var entry = null;
        entry = new DirectoryEntry();
        entry.isDirectory = pluginResult.message.root.isDirectory;
        entry.isFile = pluginResult.message.root.isFile;
        entry.name = pluginResult.message.root.name;
        entry.fullPath = pluginResult.message.root.fullPath;
        pluginResult.message.root = entry;
        return pluginResult;
    }

    LocalFileSystem.prototype._castEntry = function (pluginResult) {
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
    }

    LocalFileSystem.prototype._castEntries = function (pluginResult) {
        var entries = pluginResult.message;
        var retVal = [];
        for (i = 0; i < entries.length; i++) {
            retVal.push(justepApp.localFileSystem._createEntry(entries[i]));
        }
        pluginResult.message = retVal;
        return pluginResult;
    }

    LocalFileSystem.prototype._createEntry = function (castMe) {
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

    }

    LocalFileSystem.prototype._castDate = function (pluginResult) {
        if (pluginResult.message.modificationTime) {
            var metadataObj = new Metadata();

            metadataObj.modificationTime = new Date(pluginResult.message.modificationTime);
            pluginResult.message = metadataObj;
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
    }
    LocalFileSystem.prototype._castError = function (pluginResult) {
        var fileError = new FileError();
        fileError.code = pluginResult.message;
        pluginResult.message = fileError;
        return pluginResult;
    }

    /**
     * Information about the state of the file or directory
     *
     * {Date} modificationTime (readonly)
     */
    var Metadata = function () {
        this.modificationTime = null;
    };

    /**
     * Supplies arguments to methods that lookup or create files and directories
     *
     * @param {boolean}
     *            create file or directory if it doesn't exist
     * @param {boolean}
     *            exclusive if true the command will fail if the file or
     *            directory exists
     */
    var Flags = function (create, exclusive) {
        this.create = create || false;
        this.exclusive = exclusive || false;
    };

    /**
     * An interface representing a file system
     *
     * {DOMString} name the unique name of the file system (readonly)
     * {DirectoryEntry} root directory of the file system (readonly)
     */
    var FileSystem = function () {
        this.name = null;
        this.root = null;
    };

    /**
     * An interface representing a directory on the file system.
     *
     * {boolean} isFile always false (readonly) {boolean} isDirectory always
     * true (readonly) {DOMString} name of the directory, excluding the path
     * leading to it (readonly) {DOMString} fullPath the absolute full path to
     * the directory (readonly) {FileSystem} filesystem on which the directory
     * resides (readonly)
     */
    var DirectoryEntry = function () {
        this.isFile = false;
        this.isDirectory = true;
        this.name = null;
        this.fullPath = null;
        this.filesystem = null;
    };

    /**
     * Copies a directory to a new location
     *
     * @param {DirectoryEntry}
     *            parent the directory to which to copy the entry
     * @param {DOMString}
     *            newName the new name of the entry, defaults to the current
     *            name
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.copy:from:to:withNewName:", this.fullPath,
            parent, newName);
    };

    /**
     * Looks up the metadata of the entry
     *
     * @param {Function}
     *            successCallback is called with a Metadata object
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.getMetadata = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getMetadata:withFullPath:", this.fullPath);
    };

    /**
     * Gets the parent of the entry
     *
     * @param {Function}
     *            successCallback is called with a parent entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.getParent = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getParent:withFullPath:", this.fullPath);
    };

    /**
     * Moves a directory to a new location
     *
     * @param {DirectoryEntry}
     *            parent the directory to which to move the entry
     * @param {DOMString}
     *            newName the new name of the entry, defaults to the current
     *            name
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.move:from:to:withNewName:", this.fullPath,
            parent, newName);
    };

    /**
     * Removes the entry
     *
     * @param {Function}
     *            successCallback is called with no parameters
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.remove = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.remove:withFullPath:", this.fullPath);
    };

    /**
     * Returns a URI that can be used to identify this entry.
     *
     * @param {DOMString}
     *            mimeType for a FileEntry, the mime type to be used to
     *            interpret the file, when loaded through this URI.
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.toURI = function (mimeType, successCallback, errorCallback) {
        return "file://localhost" + this.fullPath;
    };

    /**
     * Creates a new DirectoryReader to read entries from this directory
     */
    DirectoryEntry.prototype.createReader = function (successCallback, errorCallback) {
        return new DirectoryReader(this.fullPath);
    };

    /**
     * Creates or looks up a directory
     *
     * @param {DOMString}
     *            path either a relative or absolute path from this directory in
     *            which to look up or create a directory
     * @param {Flags}
     *            options to create or excluively create the directory
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.getDirectory = function (subPath, options, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getDirectory:withFullPath:withSubPath:",
            this.fullPath, subPath, options);
    };

    /**
     * Creates or looks up a file
     *
     * @param {DOMString}
     *            path either a relative or absolute path from this directory in
     *            which to look up or create a file
     * @param {Flags}
     *            options to create or excluively create the file
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.getFile = function (subPath, options, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getFile:withFullPath:withSubPath:",
            this.fullPath, subPath, options);
    };

    /**
     * Deletes a directory and all of it's contents
     *
     * @param {Function}
     *            successCallback is called with no parameters
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.removeRecursively:withFullPath:", this.fullPath);
    };

    /**
     * An interface that lists the files and directories in a directory.
     */
    DirectoryReader = function (fullPath) {
        this.fullPath = fullPath || null;
    };

    /**
     * Returns a list of entries from a directory.
     *
     * @param {Function}
     *            successCallback is called with a list of entries
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.readEntries:withFullPath:", this.fullPath);
    }

    /**
     * An interface representing a directory on the file system.
     *
     * {boolean} isFile always true (readonly) {boolean} isDirectory always
     * false (readonly) {DOMString} name of the file, excluding the path leading
     * to it (readonly) {DOMString} fullPath the absolute full path to the file
     * (readonly) {FileSystem} filesystem on which the directory resides
     * (readonly)
     */
    var FileEntry = function () {
        this.isFile = true;
        this.isDirectory = false;
        this.name = null;
        this.fullPath = null;
        this.filesystem = null;
    };

    /**
     * Copies a file to a new location
     *
     * @param {DirectoryEntry}
     *            parent the directory to which to copy the entry
     * @param {DOMString}
     *            newName the new name of the entry, defaults to the current
     *            name
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.copy:from:to:withNewName:", this.fullPath,
            parent, newName);
    };

    /**
     * Looks up the metadata of the entry
     *
     * @param {Function}
     *            successCallback is called with a Metadata object
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.getMetadata = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getMetadata:withFullPath:", this.fullPath);
    };

    /**
     * Gets the parent of the entry
     *
     * @param {Function}
     *            successCallback is called with a parent entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.getParent = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getParent:withFullPath:", this.fullPath);
    };

    /**
     * Moves a directory to a new location
     *
     * @param {DirectoryEntry}
     *            parent the directory to which to move the entry
     * @param {DOMString}
     *            newName the new name of the entry, defaults to the current
     *            name
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.move:to:withNewName:", this.fullPath, parent,
            newName);
    };

    /**
     * Removes the entry
     *
     * @param {Function}
     *            successCallback is called with no parameters
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.remove = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.remove:withFullPath:", this.fullPath);
    };

    /**
     * Returns a URI that can be used to identify this entry.
     *
     * @param {DOMString}
     *            mimeType for a FileEntry, the mime type to be used to
     *            interpret the file, when loaded through this URI.
     * @param {Function}
     *            successCallback is called with the new entry
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.toURI = function (mimeType, successCallback, errorCallback) {
        return "file://localhost" + this.fullPath;
    };

    /**
     * Creates a new FileWriter associated with the file that this FileEntry
     * represents.
     *
     * @param {Function}
     *            successCallback is called with the new FileWriter
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
        this.file(function (filePointer) {
            var writer = new FileWriter(filePointer);
            if (writer.fileName == null || writer.fileName == "") {
                if (typeof errorCallback == "function") {
                    errorCallback({
                        "code":FileError.INVALID_STATE_ERR
                    });
                }
            }
            if (typeof successCallback == "function") {
                successCallback(writer);
            }
        }, errorCallback);
    };

    /**
     * Returns a File that represents the current state of the file that this
     * FileEntry represents.
     *
     * @param {Function}
     *            successCallback is called with the new File object
     * @param {Function}
     *            errorCallback is called with a FileError
     */
    FileEntry.prototype.file = function (successCallback, errorCallback) {
        justepApp.exec(successCallback, errorCallback,
            "JustepAppFile.getFileMetadata:withFullPath:", this.fullPath);
    };

    var pgLocalFileSystem = new LocalFileSystem();
    if (typeof justepApp.localFileSystem == "undefined") {
        justepApp.localFileSystem = pgLocalFileSystem;
    }
    if (typeof justepApp.requestFileSystem == "undefined") {
        justepApp.requestFileSystem = pgLocalFileSystem.requestFileSystem;
    }
    if (typeof justepApp.resolveLocalFileSystemURI == "undefined") {
        justepApp.resolveLocalFileSystemURI = pgLocalFileSystem.resolveLocalFileSystemURI;
    }
    justepApp.DirectoryEntry = DirectoryEntry;
    justepApp.DirectoryReader = DirectoryReader;
    justepApp.File = File;
    justepApp.FileEntry = FileEntry;
    justepApp.FileError = FileError;
    justepApp.FileReader = FileReader;
    justepApp.FileSystem = FileSystem;
    /**
     * var FileTransfer = function() {}
     *
     * var FileUploadResult = function() { this.bytesSent = 0; this.responseCode =
	 * null; this.response = null; }
     *
     * var FileTransferError = function(errorCode) { this.code = errorCode ||
	 * null; }
     *
     * FileTransferError.FILE_NOT_FOUND_ERR = 1;
     * FileTransferError.INVALID_URL_ERR = 2; FileTransferError.CONNECTION_ERR =
     * 3;
     *
     *
     * FileTransfer.prototype.upload = function(filePath, server,
     * successCallback, errorCallback, options) { if(!options.params) {
	 * options.params = {}; } options.filePath = filePath; options.server =
	 * server; if(!options.fileKey) { options.fileKey = 'file'; }
	 * if(!options.fileName) { options.fileName = 'image.jpg'; }
	 * if(!options.mimeType) { options.mimeType = 'image/jpeg'; }
	 * 
	 * if (typeof successCallback != "function") { console.log("FileTransfer
	 * Error: successCallback is not a function"); return; }
	 * 
	 * 
	 * if (errorCallback && (typeof errorCallback != "function")) {
	 * console.log("FileTransfer Error: errorCallback is not a function");
	 * return; }
	 * 
	 * justepApp.exec(successCallback, errorCallback, 'filetransfer', 'upload',
	 * [options]); };
     *
     * FileTransfer.prototype._castTransferError = function(pluginResult) { var
	 * fileError = new FileTransferError(pluginResult.message); //fileError.code =
	 * pluginResult.message; pluginResult.message = fileError; return
	 * pluginResult; }
     *
     * FileTransfer.prototype._castUploadResult = function(pluginResult) { var
	 * result = new FileUploadResult(); result.bytesSent =
	 * pluginResult.message.bytesSent; result.responseCode =
	 * pluginResult.message.responseCode; result.response =
	 * decodeURIComponent(pluginResult.message.response); pluginResult.message =
	 * result; return pluginResult; }
     *
     *
     * FileTransfer.prototype.download = function(source, target,
     * successCallback, errorCallback) { justepApp.exec(successCallback,
	 * errorCallback, 'Filetransfer', 'download', [source, target]); };
     *
     * FileUploadOptions = function(fileKey, fileName, mimeType, params) {
	 * this.fileKey = fileKey || null; this.fileName = fileName || null;
	 * this.mimeType = mimeType || null; this.params = params || null; }
     * justepApp.FileTransfer = FileTransfer; justepApp.FileTransferError =
     * FileTransferError; justepApp.FileUploadOptions = FileUploadOptions;
     * justepApp.FileUploadResult = FileUploadResult;
     */
    justepApp.FileWriter = FileWriter;
    justepApp.Flags = Flags;
    justepApp.LocalFileSystem = LocalFileSystem;
    justepApp.Metadata = Metadata;
});

justepApp.addPlugin(function () {
    /**
     * This class contains position information.
     *
     * @param {Object}
     *            lat
     * @param {Object}
     *            lng
     * @param {Object}
     *            acc
     * @param {Object}
     *            alt
     * @param {Object}
     *            altAcc
     * @param {Object}
     *            head
     * @param {Object}
     *            vel
     * @constructor
     */
    var Position = function (coords, timestamp) {
        this.coords = Coordinates.cloneFrom(coords);
        this.timestamp = timestamp || new Date().getTime();
    };

    Position.prototype.equals = function (other) {
        return (this.coords && other && other.coords
            && this.coords.latitude == other.coords.latitude && this.coords.longitude == other.coords.longitude);
    };

    Position.prototype.clone = function () {
        return new Position(this.coords ? this.coords.clone() : null,
            this.timestamp ? this.timestamp : new Date().getTime());
    }

    var Coordinates = function (lat, lng, alt, acc, head, vel, altAcc) {
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

    Coordinates.prototype.clone = function () {
        return new Coordinates(this.latitude, this.longitude, this.altitude,
            this.accuracy, this.heading, this.speed, this.altitudeAccuracy);
    };

    Coordinates.cloneFrom = function (obj) {
        return new Coordinates(obj.latitude, obj.longitude, obj.altitude,
            obj.accuracy, obj.heading, obj.speed, obj.altitudeAccuracy);
    };

    /**
     * This class specifies the options for requesting position data.
     *
     * @constructor
     */
    var PositionOptions = function (enableHighAccuracy, timeout, maximumAge) {
        /**
         * Specifies the desired position accuracy.
         */
        this.enableHighAccuracy = enableHighAccuracy || false;
        /**
         * The timeout after which if position data cannot be obtained the
         * errorCallback is called.
         */
        this.timeout = timeout || 10000;
        /**
         * The age of a cached position whose age is no greater than the
         * specified time in milliseconds.
         */
        this.maximumAge = maximumAge || 0;

        if (this.maximumAge < 0) {
            this.maximumAge = 0;
        }
    };

    /**
     * This class contains information about any GPS errors.
     *
     * @constructor
     */
    var PositionError = function (code, message) {
        this.code = code || 0;
        this.message = message || "";
    };

    PositionError.UNKNOWN_ERROR = 0;
    PositionError.PERMISSION_DENIED = 1;
    PositionError.POSITION_UNAVAILABLE = 2;
    PositionError.TIMEOUT = 3;

    /**
     * This class provides access to device GPS data.
     *
     * @constructor
     */
    var Geolocation = function () {
        // The last known GPS position.
        this.lastPosition = null;
        this.listener = null;
        this.timeoutTimerId = 0;

    };

    /**
     * Asynchronously aquires the current position.
     *
     * @param {Function}
     *            successCallback The function to call when the position data is
     *            available
     * @param {Function}
     *            errorCallback The function to call when there is an error
     *            getting the position data.
     * @param {PositionOptions}
     *            options The options for getting the position data such as
     *            timeout. PositionOptions.forcePrompt:Bool default false, -
     *            tells iPhone to prompt the user to turn on location services. -
     *            may cause your app to exit while the user is sent to the
     *            Settings app PositionOptions.distanceFilter:double aka Number -
     *            used to represent a distance in meters. PositionOptions {
	 *            desiredAccuracy:Number - a distance in meters < 10 = best
	 *            accuracy ( Default value ) < 100 = Nearest Ten Meters < 1000 =
	 *            Nearest Hundred Meters < 3000 = Accuracy Kilometers 3000+ =
	 *            Accuracy 3 Kilometers
	 * 
	 * forcePrompt:Boolean default false ( iPhone Only! ) - tells iPhone to
	 * prompt the user to turn on location services. - may cause your app to
	 * exit while the user is sent to the Settings app
	 * 
	 * distanceFilter:Number - The minimum distance (measured in meters) a
	 * device must move laterally before an update event is generated. -
	 * measured relative to the previously delivered location - default value:
	 * null ( all movements will be reported )
	 *  }
     *
     */

    Geolocation.prototype.getCurrentPosition = function (successCallback, errorCallback, options) {
        // create an always valid local success callback
        var win = successCallback;
        if (!win || typeof(win) != 'function') {
            win = function (position) {
            };
        }

        // create an always valid local error callback
        var fail = errorCallback;
        if (!fail || typeof(fail) != 'function') {
            fail = function (positionError) {
            };
        }

        var self = this;
        var totalTime = 0;
        var timeoutTimerId;

        // set params to our default values
        var params = new PositionOptions();

        if (options) {
            if (options.maximumAge) {
                // special case here if we have a cached value that is younger
                // than maximumAge
                if (this.lastPosition) {
                    var now = new Date().getTime();
                    if ((now - this.lastPosition.timestamp) < options.maximumAge) {
                        win(this.lastPosition); // send cached position
                        // immediately
                        return; // Note, execution stops here -jm
                    }
                }
                params.maximumAge = options.maximumAge;
            }
            if (options.enableHighAccuracy) {
                params.enableHighAccuracy = (options.enableHighAccuracy == true); // make
                // sure
                // it's
                // truthy
            }
            if (options.timeout) {
                params.timeout = options.timeout;
            }
        }

        var successListener = win;
        var failListener = fail;
        if (!this.locationRunning) {
            successListener = function (position) {
                win(position);
                self.stop();
            };
            errorListener = function (positionError) {
                fail(positionError);
                self.stop();
            };
        }

        this.listener = {
            "success":successListener,
            "fail":failListener
        };
        this.start(params);

        var onTimeout = function () {
            self.setError(new PositionError(PositionError.TIMEOUT,
                "Geolocation Error: Timeout."));
        };

        clearTimeout(this.timeoutTimerId);
        this.timeoutTimerId = setTimeout(onTimeout, params.timeout);
    };

    /**
     * Asynchronously aquires the position repeatedly at a given interval.
     *
     * @param {Function}
     *            successCallback The function to call each time the position
     *            data is available
     * @param {Function}
     *            errorCallback The function to call when there is an error
     *            getting the position data.
     * @param {PositionOptions}
     *            options The options for getting the position data such as
     *            timeout and the frequency of the watch.
     */
    Geolocation.prototype.watchPosition = function (successCallback, errorCallback, options) {
        // Invoke the appropriate callback with a new Position object every time
        // the implementation
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

        var intervalFunction = function () {

            var filterFun = function (position) {
                if (lastPos == null || !position.equals(lastPos)) {
                    // only call the success callback when there is a change in
                    // position, per W3C
                    successCallback(position);
                }

                // clone the new position, save it as our last position
                // (internal var)
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
     *
     * @param {String}
     *            watchId The ID of the watch returned from #watchPosition.
     */
    Geolocation.prototype.clearWatch = function (watchId) {
        clearInterval(watchId);
    };

    /**
     * Called by the geolocation framework when the current location is found.
     *
     * @param {PositionOptions}
     *            position The current position.
     */
    Geolocation.prototype.setLocation = function (position) {
        var _position = new Position(position.coords, position.timestamp);

        if (this.timeoutTimerId) {
            clearTimeout(this.timeoutTimerId);
            this.timeoutTimerId = 0;
        }

        this.lastError = null;
        this.lastPosition = _position;

        if (this.listener && typeof(this.listener.success) == 'function') {
            this.listener.success(_position);
        }

        this.listener = null;
    };

    /**
     * Called by the geolocation framework when an error occurs while looking up
     * the current position.
     *
     * @param {String}
     *            message The text of the error message.
     */
    Geolocation.prototype.setError = function (error) {
        var _error = new PositionError(error.code, error.message);

        this.locationRunning = false

        if (this.timeoutTimerId) {
            clearTimeout(this.timeoutTimerId);
            this.timeoutTimerId = 0;
        }

        this.lastError = _error;
        // call error handlers directly
        if (this.listener && typeof(this.listener.fail) == 'function') {
            this.listener.fail(_error);
        }
        this.listener = null;

    };

    Geolocation.prototype.start = function (positionOptions) {
        justepApp.exec("JustepAppGeolocation.startLocation", positionOptions);
        this.locationRunning = true

    };

    Geolocation.prototype.stop = function () {
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
/**
 * 日志插件 可以在app中记录本地日志,结合日志反馈，日志分析等功能可以更好的分析app的使用和问题定位
 */
justepApp.addPlugin(function () {
    if (typeof justepApp.logger == "undefined") {
        var Logger = function () {
            this.logLevel = Logger.INFO_LEVEL;
        };
        Logger.ALL_LEVEL = "INFO";
        Logger.INFO_LEVEL = "INFO";
        Logger.WARN_LEVEL = "WARN";
        Logger.ERROR_LEVEL = "ERROR";
        Logger.NONE_LEVEL = "NONE";

        Logger.prototype.setLevel = function (level) {
            this.logLevel = level;
        };

        Logger.prototype.processMessage = function (message) {
            if (typeof(message) != 'object') {
                return message;
            } else {
                function indent(str) {
                    return str.replace(/^/mg, "    ");
                }

                function makeStructured(obj) {
                    var str = "";
                    for (var i in obj) {
                        try {
                            if (typeof(obj[i]) == 'object') {
                                str += i + ":\n"
                                    + indent(makeStructured(obj[i])) + "\n";
                            } else {
                                str += i
                                    + " = "
                                    + indent(String(obj[i])).replace(
                                    /^    /, "") + "\n";
                            }
                        } catch (e) {
                            str += i + " = EXCEPTION: " + e.message + "\n";
                        }
                    }
                    return str;
                }

                return "Object:\n" + makeStructured(message);
            }
        };

        Logger.prototype.log = function (message) {
            if (justepApp.available) {
                justepApp.exec('JustepAppLogger.log', this
                    .processMessage(message), {
                    logLevel:Logger.INFO_LEVEL
                });
            } else {
                console.log(message);
            }

        };
        Logger.prototype.warn = function (message) {
            if (justepApp.available)
                justepApp.exec('JustepAppLogger.log', this
                    .processMessage(message), {
                    logLevel:Logger.WARN_LEVEL
                });
            else
                console.error(message);
        };
        Logger.prototype.error = function (message) {
            if (justepApp.available)
                justepApp.exec('JustepAppLogger.log', this
                    .processMessage(message), {
                    logLevel:Logger.ERROR_LEVEL
                });
            else
                console.error(message);
        };
        justepApp.logger = new Logger();
    }

});
/**
 * 地图插件 TODO：要不要默认集成google地图插件里，这是个问题!
 *
 */
justepApp.addPlugin(function () {
    if (typeof justepApp.map == "undefined") {
        var Map = function () {

        };

        Map.prototype.show = function (positions) {

        };
        justepApp.map = new Map();
    }
});
justepApp.addPlugin(function () {
    var Media = {
        // Media messages
        MEDIA_STATE:1,
        MEDIA_DURATION:2,
        MEDIA_POSITION:3,
        MEDIA_ERROR:9,

        // Media states
        MEDIA_NONE:0,
        MEDIA_STARTING:1,
        MEDIA_RUNNING:2,
        MEDIA_PAUSED:3,
        MEDIA_STOPPED:4,
        MEDIA_MSG:["None", "Starting", "Running", "Paused", "Stopped"]

    };
    Media.MediaError = function () {
        this.code = null, this.message = "";
    };
    Media.MediaError.MEDIA_ERR_ABORTED = 1;
    Media.MediaError.MEDIA_ERR_NETWORK = 2;
    Media.MediaError.MEDIA_ERR_DECODE = 3;
    Media.MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;
    /**
     * List of media objects. PRIVATE
     */
    Media.mediaObjects = {};

    /**
     * Get the media object. PRIVATE
     *
     * @param id
     *            The media object id (string)
     */
    Media.getMediaObject = function (id) {
        return Media.mediaObjects[id];
    };

    /**
     * Audio has status update. PRIVATE
     *
     * @param id
     *            The media object id (string)
     * @param msg
     *            The status message (int)
     * @param value
     *            The status code (int)
     */
    Media.onStatus = function (id, msg, value) {
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
     * This class provides access to the device media, interfaces to both sound
     * and video
     *
     * @param src
     *            The file name or url to play
     * @param successCallback
     *            The callback to be called when the file is done playing or
     *            recording. successCallback() - OPTIONAL
     * @param errorCallback
     *            The callback to be called if there is an error.
     *            errorCallback(int errorCode) - OPTIONAL
     * @param statusCallback
     *            The callback to be called when media status has changed.
     *            statusCallback(int statusCode) - OPTIONAL
     * @param positionCallback
     *            The callback to be called when media position has changed.
     *            positionCallback(long position) - OPTIONAL
     */
    Media.getInstance = function (src, successCallback, errorCallback, statusCallback, positionCallback) {
        var MediaEntity = function () {

        };
        /**
         * Start or resume playing audio file.
         */
        MediaEntity.prototype.play = function (options) {
            justepApp.exec("JustepAppSound.play:withSrc:", this.id, this.src,
                options);
        };

        /**
         * Stop playing audio file.
         */
        MediaEntity.prototype.stop = function () {
            justepApp.exec("JustepAppSound.stop:withSrc:", this.id, this.src);
        };

        /**
         * Pause playing audio file.
         */
        MediaEntity.prototype.pause = function () {
            justepApp.exec("JustepAppSound.pause:withSrc:", this.id, this.src);
        };

        /**
         * Seek or jump to a new time in the track..
         */
        MediaEntity.prototype.seekTo = function (milliseconds) {
            justepApp.exec("JustepAppSound.seekTo:withSrc:toTimeStamp:",
                this.id, this.src, milliseconds);
        };

        /**
         * Get duration of an audio file. The duration is only set for audio
         * that is playing, paused or stopped.
         *
         * @return duration or -1 if not known.
         */
        MediaEntity.prototype.getDuration = function () {
            return this._duration;
        };

        /**
         * Get position of audio.
         *
         * @return
         */
        MediaEntity.prototype.getCurrentPosition = function (successCB, errorCB) {
            var errCallback = (errorCB == undefined || errorCB == null)
                ? null
                : errorCB;
            justepApp.exec(successCB, errorCB,
                "JustepAppSound.getCurrentPosition:withId:withSrc:",
                this.id, this.src);
        };

        // iOS only. prepare/load the audio in preparation for playing
        MediaEntity.prototype.prepare = function (successCB, errorCB) {
            justepApp.exec(successCB, errorCB,
                "JustepAppSound.prepare:withId:withSrc:", this.id, this.src);
        };

        /**
         * Start recording audio file.
         */
        MediaEntity.prototype.startRecord = function () {
            justepApp.exec("JustepAppSound.startAudioRecord:withSrc:", this.id,
                this.src);
        };

        /**
         * Stop recording audio file.
         */
        MediaEntity.prototype.stopRecord = function () {
            justepApp.exec("JustepAppSound.stopAudioRecord:withSrc:", this.id,
                this.src);
        };

        /**
         * Release the resources.
         */
        MediaEntity.prototype.release = function () {
            justepApp
                .exec("JustepAppSound.release:withSrc:", this.id, this.src);
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
justepApp.addPlugin(function () {
    if (typeof justepApp.network == "undefined") {
        var NetworkStatus = function () {
            this.code = null;
            this.message = "";
        }
        NetworkStatus.UNKNOWN = "unknown"; // Unknown connection type
        NetworkStatus.ETHERNET = "ethernet";
        NetworkStatus.WIFI = "wifi";
        NetworkStatus.CELL_2G = "2g"; // the default for iOS, for any
        // cellular connection
        NetworkStatus.CELL_3G = "3g";
        NetworkStatus.CELL_4G = "4g";
        NetworkStatus.NONE = "none"; // NO connectivity

        var Network = function () {
            this.lastReachability = null;
        };

        Network.prototype.updateReachability = function (reachability) {
            this.lastReachability = reachability;
        };

        Network.prototype.isReachable = function (hostName, successCallback, options) {
            justepApp.exec(successCallback, null,
                "JustepAppNetwork.isReachable:withHost:", hostName,
                options);
        }
        justepApp.network = new Network();
        justepApp.NetworkStatus = NetworkStatus;
    }
});
justepApp.addPlugin(function () {
    /**
     * This class provides access to notifications on the device.
     */
    var Notification = function () {
    };

    /**
     * Open a native alert dialog, with a customizable title and button
     * text.
     *
     * @param {String}
     *            message Message to print in the body of the alert
     * @param {Function}
     *            completeCallback The callback that is called when user
     *            clicks on a button.
     * @param {String}
     *            title Title of the alert dialog (default: Alert)
     * @param {String}
     *            buttonLabel Label of the close button (default: OK)
     */
    Notification.prototype.alert = function (message, completeCallback, title, buttonLabel) {
        var _title = title;
        if (title == null || typeof title === 'undefined') {
            _title = "Alert";
        }
        var _buttonLabel = (buttonLabel || "OK");
        justepApp.exec(completeCallback, null,
            "JustepAppNotification.alert:withMessage:", message, {
                "title":_title,
                "buttonLabel":_buttonLabel
            });
    };

    /**
     * Open a native confirm dialog, with a customizable title and
     * button text. The result that the user selects is returned to the
     * result callback.
     *
     * @param {String}
     *            message Message to print in the body of the alert
     * @param {Function}
     *            resultCallback The callback that is called when user
     *            clicks on a button.
     * @param {String}
     *            title Title of the alert dialog (default: Confirm)
     * @param {String}
     *            buttonLabels Comma separated list of the labels of the
     *            buttons (default: 'OK,Cancel')
     */
    Notification.prototype.confirm = function (message, resultCallback, title, buttonLabels) {
        var _title = (title || "Confirm");
        var _buttonLabels = (buttonLabels || "OK,Cancel");
        this.alert(message, resultCallback, _title, _buttonLabels);
    };

    /**
     * Causes the device to blink a status LED.
     *
     * @param {Integer}
     *            count The number of blinks.
     * @param {String}
     *            colour The colour of the light.
     */
    Notification.prototype.blink = function (count, colour) {
        // NOT IMPLEMENTED
    };

    Notification.prototype.vibrate = function (mills) {
        justepApp.exec("JustepAppNotification.vibrate");
    };

    Notification.prototype.beep = function (count, volume) {
        justepApp.Media.getInstance('beep.wav').play();
    };
    if (typeof justepApp.notification == "undefined") {
        justepApp.notification = new Notification();
    }
});
justepApp.addPlugin(function () {
    /**
     * This class provides access to the device orientation. TODO:暂未完整实现
     *
     * @constructor
     */
    var Orientation = function () {
        /**
         * The current orientation, or null if the orientation hasn't
         * changed yet.
         */
        this.currentOrientation = null;
    }

    /**
     * Set the current orientation of the phone. This is called from the
     * device automatically.
     *
     * When the orientation is changed, the DOMEvent \c
     * orientationChanged is dispatched against the document element.
     * The event has the property \c orientation which can be used to
     * retrieve the device's current orientation, in addition to the \c
     * Orientation.currentOrientation class property.
     *
     * @param {Number}
     *            orientation The orientation to be set
     */
    Orientation.prototype.setOrientation = function (orientation) {
        Orientation.currentOrientation = orientation;
        justepApp.fireEvent('orientationChanged', document, {
            orientation:orientation
        });
    };

    /**
     * Asynchronously aquires the current orientation.
     *
     * @param {Function}
     *            successCallback The function to call when the
     *            orientation is known.
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error getting the orientation.
     */
    Orientation.prototype.getCurrentOrientation = function (successCallback, errorCallback) {
        // If the position is available then call success
        // If the position is not available then call error
    };

    /**
     * Asynchronously aquires the orientation repeatedly at a given
     * interval.
     *
     * @param {Function}
     *            successCallback The function to call each time the
     *            orientation data is available.
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error getting the orientation data.
     */
    Orientation.prototype.watchOrientation = function (successCallback, errorCallback) {
        // Invoke the appropriate callback with a new Position object
        // every time the implementation
        // determines that the position of the hosting device has
        // changed.
        this.getCurrentPosition(successCallback, errorCallback);
        return setInterval(function () {
            justepApp.orientation.getCurrentOrientation(
                successCallback, errorCallback);
        }, 10000);
    };

    /**
     * Clears the specified orientation watch.
     *
     * @param {String}
     *            watchId The ID of the watch returned from
     *            #watchOrientation.
     */
    Orientation.prototype.clearWatch = function (watchId) {
        clearInterval(watchId);
    };
    if (typeof justepApp.orientation == "undefined") {
        justepApp.orientation = new Orientation();
    }
    var self = this;
    var orientationchangeEvent = 'orientationchange';
    var newOrientationchangeEvent = 'orientationchange_pg';

    // backup original `window.addEventListener`,
    // `window.removeEventListener`
    var _addEventListener = window.addEventListener;
    var _removeEventListener = window.removeEventListener;

    window.onorientationchange = function () {
        justepApp.fireEvent(newOrientationchangeEvent, window);
    }

    // override `window.addEventListener`
    window.addEventListener = function () {
        if (arguments[0] === orientationchangeEvent) {
            arguments[0] = newOrientationchangeEvent;
        }
        return _addEventListener.apply(this, arguments);
    };

    // override `window.removeEventListener'
    window.removeEventListener = function () {
        if (arguments[0] === orientationchangeEvent) {
            arguments[0] = newOrientationchangeEvent;
        }
        return _removeEventListener.apply(this, arguments);
    };
});
justepApp.addPlugin(function () {
    /**
     * This class provides access to the device SMS functionality.
     *
     * @constructor
     */
    var Sms = function () {

    }

    /**
     * Sends an SMS message.
     *
     * @param {Integer}
     *            number The phone number to send the message to.
     * @param {String}
     *            message The contents of the SMS message to send.
     * @param {Function}
     *            successCallback The function to call when the SMS
     *            message is sent.
     * @param {Function}
     *            errorCallback The function to call when there is an
     *            error sending the SMS message.
     * @param {PositionOptions}
     *            options The options for accessing the GPS location
     *            such as timeout and accuracy.
     */
    Sms.prototype.send = function (number, message, successCallback, errorCallback, options) {
        // not sure why this is here when it does nothing????
    };
    if (typeof justepApp.sms == "undefined")
        justepApp.sms = new Sms();
});
justepApp.addPlugin(function () {
    /**
     * This class provides access to the telephony features of the
     * device.
     *
     * @constructor
     */
    var Telephony = function () {

    }

    /**
     * Calls the specifed number.
     *
     * @param {Integer}
     *            number The number to be called.
     */
    Telephony.prototype.call = function (number) {
        // not sure why this is here when it does nothing????
    };
    if (typeof justepApp.telephony == "undefined") {
        justepApp.telephony = new Telephony();
    }
});
/**
 * 配合x5附件组件包装的插件
 */
justepApp.addPlugin(function () {
    var Attachment = function () {
    };
    Attachment.prototype.uploadAttachment = function (initUploadUrlCallback, uploadComplatedCallback) {
        this.getUploadUrl = justepApp.checkFn(initUploadUrlCallback);
        this.uploadCallback = justepApp.checkFn(uploadComplatedCallback);
        justepApp.exec('JustepViewController.initUploader');
    };
    Attachment.prototype.downloadAttachment = function (initDownloadUrlCallback) {
        this.getDownloadUrl = justepApp.checkFn(initDownloadUrlCallback);
        justepApp.exec('JustepViewController.downloadAttachment');
    };
    Attachment.prototype.showDownloadList = function () {
        justepApp.exec('JustepViewController.showDownloadList');
    };
    Attachment.prototype.browserAttachment = function (initBrowserUrlCallback, getDocNameCallback) {
        this.getBrowserUrl = justepApp.checkFn(initBrowserUrlCallback);
        this.getDocName = justepApp.checkFn(getDocNameCallback);
        justepApp.exec('JustepViewController.openAttachDlg');
    };
    if (typeof justepApp.attachment == "undefined") {
        justepApp.attachment = new Attachment();
    }
});
/**
 * x5 portal上提供的能力相关函数
 *
 */
justepApp.addPlugin(function () {
    var Portal = function () {

    };

    Portal.prototype.hideToolbar = function () {
        justepApp.exec('JustepViewController.setToolBarHidden:', "YES");
    };

    Portal.prototype.showToolbar = function () {
        justepApp.exec('JustepViewController.setToolBarHidden:', "NO");
    };

    Portal.prototype.switchPageTo = function (pageID) {
        debugger;
        justepApp.exec('JustepViewController.switchPageTo:', pageID);
    };

    Portal.prototype.refresh = function () {
        justepApp.exec('JustepViewController.loadSystem');
    };

    Portal.prototype.exitApp = function (hide) {
        justepApp.exec('JustepViewController.logOut');
    };

    Portal.prototype.openAppSetting = function (hide) {
        justepApp.exec('JustepViewController.openSettingDlg');
    }

    Portal.prototype.setSettingInfo = function (settingInfo) {
        // TODO
    };

    Portal.prototype.showConver = function () {
        justepApp.exec('JustepViewController.showConver');
    };

    Portal.prototype.removeConver = function () {
        justepApp.exec('JustepViewController.removeConver');
    };
    if (typeof justepApp.portal == "undefined") {
        justepApp.portal = new Portal();
    }
});

justepApp.addPlugin(function () {
    var Utils = function () {

    };

    Utils.prototype.getFullUrl = function (url) {
        return window.location.protocol + "//" + window.location.host
            + url;
    };

    if (typeof justepApp.utils == "undefined") {
        justepApp.utils = new Utils();
    }
});
