justepApp.addPlugin(function() {
	if (typeof justepApp.network == "undefined") {
    	var NetworkStatus = function () {
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
		
		Network.prototype.isReachable = function(hostName, successCallback, options) {
			justepApp.exec(successCallback,null,"JustepAppNetwork.isReachable:withHost:", hostName , options);
		}
		justepApp.network = new Network();
    }
});