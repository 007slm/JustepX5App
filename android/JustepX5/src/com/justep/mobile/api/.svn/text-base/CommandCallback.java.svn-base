package com.justep.mobile.api;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class CommandCallback {
	private final int status;
	private final String message;
	private boolean keepCallback = false;
	private String cast = null;

	public CommandCallback(Status status) {
		this.status = status.ordinal();
		this.message = "'" + CommandCallback.StatusMessages[this.status] + "'";
	}

	public CommandCallback(Status status, String message) {
		this.status = status.ordinal();
		this.message = JSONObject.quote(message);
	}

	public CommandCallback(Status status, JSONArray message, String cast) {
		this.status = status.ordinal();
		this.message = message.toString();
		this.cast = cast;
	}

	public CommandCallback(Status status, JSONObject message, String cast) {
		this.status = status.ordinal();
		this.message = message.toString();
		this.cast = cast;
	}

	public CommandCallback(Status status, JSONArray message) {
		this.status = status.ordinal();
		this.message = message.toString();
	}

	public CommandCallback(Status status, JSONObject message) {
		this.status = status.ordinal();
		this.message = message.toString();
	}

	public CommandCallback(Status status, int i) {
		this.status = status.ordinal();
		this.message = "" + i;
	}

	public CommandCallback(Status status, float f) {
		this.status = status.ordinal();
		this.message = "" + f;
	}

	public CommandCallback(Status status, boolean b) {
		this.status = status.ordinal();
		this.message = "" + b;
	}

	public void setKeepCallback(boolean b) {
		this.keepCallback = b;
	}

	public int getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}

	public boolean getKeepCallback() {
		return this.keepCallback;
	}

	public String getJSONString() {
		return "{status:" + this.status + ",message:" + this.message
				+ ",keepCallback:" + this.keepCallback + "}";
	}

	public String onSuccessString(String callbackId) {
		StringBuffer buf = new StringBuffer("");
		if (cast != null) {
			buf.append("var temp = " + cast + "(" + this.getJSONString()
					+ ");\n");
			buf.append("justepApp.onSuccess('" + callbackId + "',temp);");
		} else {
			buf.append("justepApp.onSuccess('" + callbackId + "',"
					+ this.getJSONString() + ");");
		}
		return buf.toString();
	}

	public String onErrorString(String callbackId) {
		return "justepApp.onError('" + callbackId + "', "
				+ this.getJSONString() + ");";
	}

	public static String[] StatusMessages = new String[] { "No result", "OK",
			"Class not found", "Illegal access", "Instantiation error",
			"Malformed url", "IO error", "Invalid action", "JSON error",
			"Error" };

	public enum Status {
		NO_RESULT, OK, CLASS_NOT_FOUND_EXCEPTION, ILLEGAL_ACCESS_EXCEPTION, INSTANTIATION_EXCEPTION, MALFORMED_URL_EXCEPTION, IO_EXCEPTION, INVALID_ACTION, JSON_EXCEPTION, ERROR, EXECUTING
	}
}
