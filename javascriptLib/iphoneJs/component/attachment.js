/**
 * 配合x5附件组件包装的插件
 */
justepApp.addPlugin(function() {
	var Attachment = function () {};
	Attachment.prototype.uploadAttachment = function(initUploadUrlCallback,uploadComplatedCallback) {
		this.getUploadUrl = justepApp.checkFn(initUploadUrlCallback);
        this.uploadCallback = justepApp.checkFn(uploadComplatedCallback);
		justepApp.exec('JustepViewController.initUploader');
	};
	Attachment.prototype.downloadAttachment = function(initDownloadUrlCallback) {
		this.getDownloadUrl = justepApp.checkFn(initDownloadUrlCallback);
        justepApp.exec('JustepViewController.downloadAttachment');
	};
	Attachment.prototype.showDownloadList = function() {
		justepApp.exec('JustepViewController.downloadAttachment');
	};
	Attachment.prototype.browserAttachment = function(initBrowserUrlCallback,getDocNameCallback) {
		this.getBrowserUrl = justepApp.checkFn(initBrowserUrlCallback);
        this.getDocName = justepApp.checkFn(getDocNameCallback);
        justepApp.exec('JustepViewController.openAttachDlg');
	};
    if (typeof justepApp.attachment == "undefined") {
    	justepApp.attachment = new Attachment();
    }
});