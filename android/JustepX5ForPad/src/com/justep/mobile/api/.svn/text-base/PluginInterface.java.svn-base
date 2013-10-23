package com.justep.mobile.api;

import org.json.JSONArray;

import android.content.Intent;
import android.webkit.WebView;

import com.justep.mobile.PortalActivity;

/**
 * @author 007slm(007slm@163.com)
 * 
 *         PluginManager会通过调用execute方法来调用每个实现了plugin能力的插件
 */
public interface PluginInterface {

	/**
	 * 处理请求并返回结果
	 * 
	 * @param action
	 *            请求调用的action
	 * @param args
	 *            请求调用action的参数
	 * @param callbackId
	 *            回调的id
	 * @return
	 */
	CommandCallback execute(String action, JSONArray args, String callbackId);

	/**
	 * 在给onJsPrompt提供返回值的时候 返回值是否是json格式
	 * 
	 * 为true json格式，通过var v = 执行后得到执行信息 为false 直接为可执行的js片段
	 * 
	 * @param action
	 * @return
	 */
	public boolean isJsonMode(String action);

	/**
	 * 
	 * 给plugin注入上下文，比如获取文件路径就需要获得PortalActivity
	 * 
	 * @param ctx
	 *            一般为PortalActivity的实例
	 */
	void setContext(PortalActivity ctx);

	/**
	 * 插件关联的webview
	 * 
	 * @param webView
	 *            The JustepApp WebView
	 */
	void setWebView(WebView webView);

	void onPause(boolean multitasking);

	void onResume(boolean multitasking);

	void onNewIntent(Intent intent);

	void onDestroy();

	/**
	 * 发送消息到plugin的时候调用
	 * 
	 * @param id
	 *            message id
	 * @param data
	 *            message data
	 */
	public void onMessage(String id, Object data);

	void onActivityResult(int requestCode, int resultCode, Intent intent);

	boolean onOverrideUrlLoading(String url);
}
