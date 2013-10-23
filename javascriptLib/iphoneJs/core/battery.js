justepApp.addPlugin(function() {
	/**
	 * This class contains information about the current battery status.
	 * @constructor
	 */
	var Battery = function() {
	    this._level = null;
	    this._isPlugged = null;
	    this._batteryListener = [];
	    this._lowListener = [];
	    this._criticalListener = [];
	};

	/**
	 * Registers as an event producer for battery events.
	 * 
	 * @param {Object} eventType
	 * @param {Object} handler
	 * @param {Object} add
	 */
	Battery.prototype.eventHandler = function(eventType, handler, add) {
	    var me = justepApp.battery;
	    if (add) {
	        // If there are no current registered event listeners start the battery listener on native side.
	        if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
	            justepApp.exec(me._status, me._error, "JustepAppBattery.start:");
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
	        if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
	            justepApp.exec("JustepAppBattery.stop");
	        }
	    }
	};

	/**
	 * Callback for battery status
	 * 
	 * @param {Object} info			keys: level, isPlugged
	 */
	Battery.prototype._status = function(info) {
		if (info) {
			var me = this;
			if (me._level != info.level || me._isPlugged != info.isPlugged) {
				justepApp.fireEvent("batterystatus", window, info);	


				if (info.level == 20 || info.level == 5) {
					if (info.level == 20) {
						justepApp.fireEvent("batterylow", window, info);
					}
					else {
						justepApp.fireEvent("batterycritical", window, info);
					}
				}
			}
			me._level = info.level;
			me._isPlugged = info.isPlugged;	
		}
	};

	//TODO :console 注册到本地代码中
	Battery.prototype._error = function(e) {
	    console.log("Error initializing Battery: " + e);
	};

	Battery.prototype.monitor = function(){
		justepApp.addEventHandler("batterystatus", justepApp.battery.eventHandler);
	    justepApp.addEventHandler("batterylow", justepApp.battery.eventHandler);
	    justepApp.addEventHandler("batterycritical", justepApp.battery.eventHandler);
	};
	Battery.prototype.stop = function(){
		justepApp.removeEventHandler("batterystatus", justepApp.battery.eventHandler);
	    justepApp.removeEventHandler("batterylow", justepApp.battery.eventHandler);
	    justepApp.removeEventHandler("batterycritical", justepApp.battery.eventHandler);
	};
	
    if (typeof justepApp.battery === "undefined") {
        justepApp.battery = new Battery();
    }
});
