/**
 * 初始化justepApp
 */
;(function(window){
   
	if (typeof(parent.top.justepApp) === 'object'){
		return;
	}
		
	if (typeof(DeviceInfo) != 'object'){
		DeviceInfo = {};
	}
	/**
	 * TODO:callback 的支持
	 */
	justepApp = {
		"isIOS":true,
		appEventHandler:{},
	    "commandQueue": {
	    	requests:[],
	        ready: true,
	        commands: [],
	        timer: null
	    },
	    "_plugins": [],
	    "callbackId" : 0,
	    "callbacks" : {},
	    "callbackStatus" : {
	        "NO_RESULT": 0,
	        "OK": 1,
	        "CLASS_NOT_FOUND_EXCEPTION": 2,
	        "ILLEGAL_ACCESS_EXCEPTION": 3,
	        "INSTANTIATION_EXCEPTION": 4,
	        "MALFORMED_URL_EXCEPTION": 5,
	        "IO_EXCEPTION": 6,
	        "INVALID_ACTION": 7,
	        "JSON_EXCEPTION": 8,
	        "ERROR": 9
	     },
	    "checkFn": function (fn){
	      /**
			 * 不支持采用怪异的参数传递方案 比如：(function(){alert(1231)}) if (fn) { var m =
			 * fn.toString().match(/^\s*function\s+([^\s\(]+)/); return m ? m[1] :
			 * "alert"; } else { return null; }
			 * 
			 */
	      if(typeof fn === "function"){
	    	  return fn;
	      }else{
	    	  if(!fn){
	    		return null;
	    	  }else if(fn && (typeof fn.toString === 'function')){
	    		alert('参数传递不正常fn:['+ fn.toString() + '],fn type [ ' + (typeof fn) + ']');
	    	  }
	      }
		},
	    "createBridge" : function(){
	    	var bridge = document.getElementById('JustepJsOcBridge');
	        if(!bridge){
	        	var JsOcBridge = document.createElement('iframe');
		        JsOcBridge.style.width='0px';
		        JsOcBridge.id='JustepJsOcBridge';
		        JsOcBridge.style.height='0px';
		        JsOcBridge.style.border='0px solid red';
		        document.body.appendChild(JsOcBridge);
		        return JsOcBridge; 
	        };
	        return bridge;
	    },
		// 此方法为兼容方法，不推荐使用
		"eventHandle" : function(params){
			var bridge = window.justepApp.createBridge();
	        bridge.src = 'about:blank?'+params;
	    },
	    // 此方法为兼容方法，不推荐使用
	    "dispachAppEvent" : function(event){
            event = event ||{};
            var eData = [];
            if (typeof {} === "object"){
                for(var p in event){
                    eData.push(p+"="+event[p]);
                }
            }else if(typeof {} === "string"){
                eData.push("event="+event);
            }
            eData.push("time="+new Date().getTime());
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
		    else{
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
		    if (justepApp.commandQueue.timer == null){
		    	justepApp.commandQueue.timer = setInterval(justepApp.run_command, 10);
		    }
		        
		},
		/**
		 * 执行本地代码命令的函数
		 * 
		 * @private ios 实现
		 */
        "run_command":function(){
            if (!justepApp.available) {
		        alert("ERROR: 不能在justepApp初始化之前调用justepApp的命令");
		        return;
		    }
			if (!justepApp.commandQueue.ready){
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
	        var successCallback,failCallback, className, methodName, methodArgs,methodOptions;
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
		        "className": className,
		        "methodName": methodName,
		        "arguments": []
		    };
		    
		    if (successCallback || failCallback) {
		        callbackId = 'callback'+'_'+className + '_' + methodName + '_' + justepApp.callbackId++;
		        justepApp.callbacks[callbackId] ={success:successCallback,fail:failCallback};
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
		"onSuccess" : function(callbackId, args) {
		    if (justepApp.callbacks[callbackId]) {
		        if (args.status == justepApp.callbackStatus.OK) {
		            try {
		                if (justepApp.callbacks[callbackId].success) {
		                       justepApp.callbacks[callbackId].success(args.message);
		                }
		            }catch (e) {
		                console.log("Error in success callback: "+callbackId+" = "+e);
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
		        }catch (e) {
		            console.log("Error in error callback: "+callbackId+" = "+e);
		        }
		        if (!args.keepCallback) {
		            delete justepApp.callbacks[callbackId];
		        }
		    }
		},
		"fireEvent":function(type,target,data){
			var e = document.createEvent('Events');
		    e.initEvent(type,false,false);
		    if (data) {
		        for (var i in data) {
		            e[i] = data[i];
		        }
		    }
		    target = target || document;
		    target.dispatchEvent(e);
		},
		"addEventHandler" : function(evt,target, callback) {
		    target = target || document;
		    if (typeof justepApp.windowEventHandler[e] !== "undefined") {
		        if (justepApp.windowEventHandler[e](evt, handler, true)) {
		            return;
		        }
		    }
		    target.addEventListener.call(target, evt, handler, capture);  
		},
		"removeEventHandler" : function(evt,target, handler, capture) {
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
		"clone" : function(obj) {
		    if(!obj) { 
		        return obj;
		    }

		    if(obj instanceof Array){
		        var retVal = new Array();
		        for(var i = 0; i < obj.length; ++i){
		            retVal.push(justepApp.clone(obj[i]));
		        }
		        return retVal;
		    }

		    if (obj instanceof Function) {
		        return obj;
		    }

		    if(!(obj instanceof Object)){
		        return obj;
		    }
		    
		    if (obj instanceof Date) {
		        return obj;
		    }

		    retVal = new Object();
		    for(i in obj){
		        if(!(i in retVal) || retVal[i] != obj[i]) {
		            retVal[i] = justepApp.clone(obj[i]);
		        }
		    }
		    return retVal;
		},
		"createUUID" : function() {
		    return justepApp.UUIDcreatePart(4) + '-' +
		        justepApp.UUIDcreatePart(2) + '-' +
		        justepApp.UUIDcreatePart(2) + '-' +
		        justepApp.UUIDcreatePart(2) + '-' +
		        justepApp.UUIDcreatePart(6);
		},
		"UUIDcreatePart" : function(length) {
		    var uuidpart = "";
		    for (var i=0; i<length; i++) {
		        var uuidchar = parseInt((Math.random() * 256)).toString(16);
		        if (uuidchar.length == 1) {
		            uuidchar = "0" + uuidchar;
		        }
		        uuidpart += uuidchar;
		    }
		    return uuidpart;
		}
	};

		
	(function() {
	    var timer = setInterval(function() {
	        var state = document.readyState;
	        if (state != 'loaded' && state != 'complete'){
	        	return;
	        }
	        clearInterval(timer);
	        justepApp.createBridge();
	        while (justepApp._plugins.length > 0) {
	            var __plugin = justepApp._plugins.shift();
	            try {
	            	__plugin();
	            } catch(e) {
	                if (typeof justepApp.logger !== "undefined" && typeof(justepApp.logger['log']) == 'function')
	                	justepApp.logger.log("添加plugin失败:" + justepApp.logger.processMessage(e));
	                else{
	                	alert("添加plugin失败:" + e.message);
	                }
	            }
	        }
	        justepApp.fireEvent('justepAppReady',window)
	    }, 1);
	})();
	
	
	

})(window);