/**
 * x5 portal上提供的能力相关函数
 * 
 */
justepApp.addPlugin(function() {
	var Portal = function () {
		
	};
	
	Portal.prototype.hideToolbar = function() {
		justepApp.exec('JustepViewController.setToolBarHidden:', "YES");
	};
	
	Portal.prototype.showToolbar = function() {
		justepApp.exec('JustepViewController.setToolBarHidden:', "NO");
	};
	
	Portal.prototype.switchPageTo = function(pageID) {
                debugger;
		justepApp.exec('JustepViewController.switchPageTo:', pageID);
	};
	
	Portal.prototype.refresh = function() {
		justepApp.exec('JustepViewController.loadSystem');
	};
	
	Portal.prototype.exitApp = function(hide) {
		justepApp.exec('JustepViewController.logOut');
	};
	
	Portal.prototype.openAppSetting = function(hide) {
		justepApp.exec('JustepViewController.openSettingDlg');
	}
	
	Portal.prototype.setSettingInfo = function(settingInfo) {
		// TODO
	};
	
	Portal.prototype.showConver = function() {
		justepApp.exec('JustepViewController.showConver');
	};
	
	Portal.prototype.removeConver = function() {
		justepApp.exec('JustepViewController.removeConver');
	};
    if (typeof justepApp.portal == "undefined") {
    	justepApp.portal = new Portal();
    }
});