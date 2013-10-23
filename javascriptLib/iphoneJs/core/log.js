/**
 * 日志插件 可以在app中记录本地日志,结合日志反馈，日志分析等功能可以更好的分析app的使用和问题定位
 */
justepApp.addPlugin(function() {
	if (typeof justepApp.logger == "undefined") {
		var Logger = function () {
			this.logLevel = Logger.INFO_LEVEL;
		};
		Logger.ALL_LEVEL    = "INFO";
		Logger.INFO_LEVEL   = "INFO";
		Logger.WARN_LEVEL   = "WARN";
		Logger.ERROR_LEVEL  = "ERROR";
		Logger.NONE_LEVEL   = "NONE";
															
		Logger.prototype.setLevel = function(level) {
		    this.logLevel = level;
		};
		
		Logger.prototype.processMessage = function(message) {
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
								str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
							} else {
								str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
							}
						} catch(e) {
							str += i + " = EXCEPTION: " + e.message + "\n";
						}
					}
					return str;
				}
				return "Object:\n" + makeStructured(message);
			}
		};
		
		Logger.prototype.log = function(message) {
			if (justepApp.available){
				justepApp.exec('JustepAppLogger.log',
						this.processMessage(message),
						{logLevel: Logger.INFO_LEVEL}
				);
			}else{
				console.log(message);
			}
			
		};
		Logger.prototype.warn = function(message) {
			if (justepApp.available)
				justepApp.exec('JustepAppLogger.log',
						this.processMessage(message),
						{ logLevel:Logger.WARN_LEVEL}
				);
			else
				console.error(message);
		};
		Logger.prototype.error = function(message) {
			if (justepApp.available)
				justepApp.exec('JustepAppLogger.log',
						this.processMessage(message),
						{ logLevel:Logger.ERROR_LEVEL}
				);
			else
				console.error(message);
		};
		justepApp.logger = new Logger();
	}
	
});