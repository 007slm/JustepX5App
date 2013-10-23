package com.justep.mobile.utils.command;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * @author 007slm(007slm@163.com) 上传结果
 */
public class FileUploadResult {

	private long bytesSent = 0; // bytes sent
	private int responseCode = -1; // HTTP response code
	private String response = null; // HTTP response

	public long getBytesSent() {
		return bytesSent;
	}

	public void setBytesSent(long bytes) {
		this.bytesSent = bytes;
	}

	public int getResponseCode() {
		return responseCode;
	}

	public void setResponseCode(int responseCode) {
		this.responseCode = responseCode;
	}

	public String getResponse() {
		return response;
	}

	public void setResponse(String response) {
		this.response = response;
	}

	public JSONObject toJSONObject() throws JSONException {
		return new JSONObject("{bytesSent:" + bytesSent + ",responseCode:"
				+ responseCode + ",response:" + JSONObject.quote(response)
				+ "}");
	}
}
