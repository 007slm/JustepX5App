package com.justep.mobile.api;

import org.json.JSONArray;
import org.json.JSONObject;

import android.content.Intent;
import android.webkit.WebView;

import com.justep.mobile.PortalActivity;

/**
 * @author 007slm(007slm@163.com)
 */

public abstract class PluginAbstractImpl implements PluginInterface {

	public String id;
	public WebView webView; // WebView object
	public PortalActivity ctx; // JustepAppActivity object

	public abstract CommandCallback execute(String action, JSONArray args,
			String callbackId);

	public boolean isJsonMode(String action) {
		return false;
	}

	public void setContext(PortalActivity ctx) {
		this.ctx = ctx;
	}

	public void setWebView(WebView webView) {
		this.webView = webView;
	}

	public void onPause(boolean multitasking) {
	}

	public void onResume(boolean multitasking) {
	}

	public void onNewIntent(Intent intent) {
	}

	public void onDestroy() {
	}

	public void onMessage(String id, Object data) {
	}

	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
	}

	public boolean onOverrideUrlLoading(String url) {
		return false;
	}

	public void execJS(String statement) {
		this.ctx.execJS(statement);
	}

	public void success(CommandCallback pluginResult, String callbackId) {
		this.ctx.execJS(pluginResult.onSuccessString(callbackId));
	}

	public void success(JSONObject message, String callbackId) {
		this.ctx.execJS(new CommandCallback(CommandCallback.Status.OK, message)
				.onSuccessString(callbackId));
	}

	public void success(String message, String callbackId) {
		this.ctx.execJS(new CommandCallback(CommandCallback.Status.OK, message)
				.onSuccessString(callbackId));
	}

	public void error(CommandCallback pluginResult, String callbackId) {
		this.ctx.execJS(pluginResult.onErrorString(callbackId));
	}

	/**
	 * 异常情况会返回Status.ERROR的回调
	 * 
	 * @param message
	 *            异常信息
	 * @param callbackId
	 *            异常回调的id
	 */
	public void error(JSONObject message, String callbackId) {
		this.ctx.execJS(new CommandCallback(CommandCallback.Status.ERROR,
				message).onErrorString(callbackId));
	}

	/**
	 * Helper for error callbacks that just returns the Status.ERROR by default
	 * 异常情况会返回Status.ERROR的回调
	 * 
	 * @param message
	 *            异常信息
	 * @param callbackId
	 *            异常回调的id
	 */
	public void error(String message, String callbackId) {
		this.ctx.execJS(new CommandCallback(CommandCallback.Status.ERROR,
				message).onErrorString(callbackId));
	}
}
