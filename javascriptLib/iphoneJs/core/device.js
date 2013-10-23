/**
 * 硬件基本信息 
 */
justepApp.addPlugin(function() {
	var Device = function () {
        this.platform = null;
	    this.version  = null;
	    this.name     = null;
	    this.gap      = null;
	    this.uuid     = null;
	    try {
	       this.platform = DeviceInfo.platform;
	       this.version  = DeviceInfo.version;
	       this.name     = DeviceInfo.name;
	       this.gap      = DeviceInfo.gap;
	       this.uuid     = DeviceInfo.uuid;
           justepApp.available = true;
	    } catch(e) {
            justepApp.available = false;
	    }
	}
	if (typeof justepApp.device == "undefined"){
	    justepApp.device = new Device();
	}
    
});