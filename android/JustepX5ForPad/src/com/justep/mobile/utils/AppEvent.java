package com.justep.mobile.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * 解析通过nativeApp dispatch函数过来的事件
 * 
 * @author 007slm(007slm@163.com)
 * 
 */
public class AppEvent {
	String event;
	String callback;
	Map<String, String> data = new HashMap<String, String>();

	public AppEvent() {
	}

	public AppEvent(String urlParams) {
		String[] params = urlParams.split("&");
		for (int i = 0; i < params.length; i++) {
			String param = params[i];
			int idx = param.indexOf("=");
			String key = param.substring(0, idx);
			String value = param.substring(idx + 1);
			if ("event".equals(key)) {
				event = value;
			} else if ("callback".equals(key)) {
				callback = value;
			} else {
				data.put(key, value);
			}
		}
	}

	public void setEventName(String name) {
		this.event = name;
	}

	public String getEventName() {
		return this.event;
	}

	public String getCallback() {
		return this.callback;
	}

	public String getDataAsStr() {
		return "";
	}

	public String getDataItem(String key) {
		return data.get(key);
	}
}
