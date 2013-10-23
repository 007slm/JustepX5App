package com.justep.mobile;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.DialogInterface.OnClickListener;
import android.net.Uri;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions.Callback;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.EditText;

import com.justep.mobile.api.Logger;
import com.justep.mobile.push.cient.Constants;
import com.justep.mobile.utils.DialogUtils;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class WebChromeClientEx extends WebChromeClient {

	private String TAG = "JustepAppLog";
	private long MAX_QUOTA = 100 * 1024 * 1024;
	private PortalActivity ctx;
	private static final int EVENTPREKEYLENGTH = 10;

	public WebChromeClientEx(Context ctx) {
		this.ctx = (PortalActivity) ctx;
		// this.ctx.contentWebView.setDownloadListener(new
		// JustepAppWebViewDownLoadListener());
	}
	// 4.1.2
	public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture){
		 openFileChooser(uploadMsg);
	}
	
	//<3.0
	public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
		openFileChooser(uploadMsg);
	}

	// 3.0+
	public void openFileChooser(ValueCallback<Uri> uploadMsg) { // 文件上传功能
		ctx.mUploadMessage = uploadMsg;
		if (ctx.mUploadMessage == null) {
			return;
		}
		Intent i = new Intent(Intent.ACTION_GET_CONTENT);
		i.addCategory(Intent.CATEGORY_OPENABLE);
		i.setType("*/*");
		ctx.startActivityForResult(Intent.createChooser(i, "Image Browser"),
				Constants.FILECHOOSER_RESULTCODE);
	}
	
	
	@Override
	public void onReceivedTitle(WebView view, String title) {
		super.onReceivedTitle(view, title);
		this.ctx.loadUrlTimeoutFlag++;
		if (!title.isEmpty()
				&& (title.toLowerCase().contains("error")
						|| title.toLowerCase().contains("404") || title
							.equalsIgnoreCase(ctx.getResources().getString(
									R.string.fileNotFound)))) {
			ctx.loadSuccess = false;
			this.ctx.onReceivedError(404,
					ctx.getResources().getString(R.string.fileNotFound),
					view.getUrl());
		}

	}
	
	
	
	@Override
	public boolean onJsAlert(WebView view, String url, String message,
			final JsResult result) {
		AlertDialog.Builder dlg = new AlertDialog.Builder(this.ctx);
		dlg.setMessage(message);
		// 防止alert影响返回按钮
		dlg.setCancelable(true);
		dlg.setPositiveButton(android.R.string.ok,
				new AlertDialog.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.confirm();
					}
				});
		dlg.setOnCancelListener(new DialogInterface.OnCancelListener() {
			public void onCancel(DialogInterface dialog) {
				result.confirm();
			}
		});
		dlg.setOnKeyListener(new DialogInterface.OnKeyListener() {
			public boolean onKey(DialogInterface dialog, int keyCode,
					KeyEvent event) {
				if (keyCode == KeyEvent.KEYCODE_BACK) {
					result.confirm();
					return false;
				} else
					return true;
			}
		});
		dlg.create();
		dlg.show();
		return true;
	}

	@Override
	public boolean onJsConfirm(WebView view, String url, String message,
			final JsResult result) {
		AlertDialog.Builder dlg = new AlertDialog.Builder(this.ctx);
		dlg.setMessage(message);
		dlg.setCancelable(true);
		dlg.setPositiveButton(android.R.string.ok,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.confirm();
					}
				});
		dlg.setNegativeButton(android.R.string.cancel,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.cancel();
					}
				});
		dlg.setOnCancelListener(new DialogInterface.OnCancelListener() {
			public void onCancel(DialogInterface dialog) {
				result.cancel();
			}
		});
		dlg.setOnKeyListener(new DialogInterface.OnKeyListener() {
			public boolean onKey(DialogInterface dialog, int keyCode,
					KeyEvent event) {
				if (keyCode == KeyEvent.KEYCODE_BACK) {
					result.cancel();
					return false;
				} else
					return true;
			}
		});
		dlg.create();
		dlg.show();
		return true;
	}

	@Override
	public void onProgressChanged(WebView view, int progress) {
		String url = view.getUrl();
		if(progress == 100 && url != null && (url.indexOf("index.w")!=-1 || url.indexOf("mIndex.w")!=-1)){
			if (view == ctx.contentWebView) {
				/**
				 * 404的时候 能过来 有可能报找不到网页 也可能是 titile为空 当titile为空时候，并且是mIndex.w时候
				 */
				if (ctx.getResources().getString(R.string.fileNotFound)
						.equals(view.getTitle())) {
					ctx.showErrorTip();
					ctx.loadSuccess = false;
					ctx.openSettingDlg();
				} else if(ctx.loadSuccess == false){
					ctx.contentWebView
							.loadUrl("javascript:if(window.nativeApp && typeof window.nativeApp.checkPage == 'function'){var isInApp =  (typeof window.justep == 'undefined')?'false':'true'; window.nativeApp.checkPage(isInApp)};");
				}
			}
		}
		super.onProgressChanged(view, progress);
	}

	@Override
	public boolean onJsPrompt(WebView view, String url, String message,
			String defaultValue, JsPromptResult result) {
		boolean reqOk = false;
		//looks like x5 web applicaiton url
		if (url.startsWith("file://")
				|| url.indexOf(this.ctx.contentPageUrl.substring(0, 10)) == 0) {
			reqOk = true;
		}
		// prompt(this.stringify(args), "justepApp:"+this.stringify([service,
		// action, callbackId, true]));
		if (reqOk
				&& defaultValue != null
				&& defaultValue.length() > 3
				&& defaultValue.substring(0, EVENTPREKEYLENGTH).toLowerCase()
						.equals("justepapp:")) {
			JSONArray array;
			try {
				array = new JSONArray(defaultValue.substring(EVENTPREKEYLENGTH));
				String service = array.getString(0);
				String action = array.getString(1);
				String callbackId = array.getString(2);
				boolean async = array.getBoolean(3);
				String r = ctx.pluginManager.exec(service, action, callbackId,
						message, async);
				result.confirm(r);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		// Polling for JavaScript messages
		else if (reqOk && defaultValue != null
				&& defaultValue.equals("justepApp_poll:")) {
			System.out.println("justepApp_poll");
			/*String r = ctx.callbackServer.getJavascript();
			result.confirm(r);*/
		}
		// Calling into CallbackServer
		else if (reqOk && defaultValue != null
				&& defaultValue.equals("justepApp_callbackServer:")) {
			String r = "";
			/*if (message.equals("usePolling")) {
				r = "" + ctx.callbackServer.usePolling();
			} else if (message.equals("restartServer")) {
				ctx.callbackServer.restartServer();
			} else if (message.equals("getPort")) {
				r = Integer.toString(ctx.callbackServer.getPort());
			} else if (message.equals("getToken")) {
				r = ctx.callbackServer.getToken();
			}*/
			result.confirm(r);
		}// Show dialog
		else {
			final JsPromptResult res = result;
			AlertDialog.Builder dlg = new AlertDialog.Builder(this.ctx);
			dlg.setMessage(message);
			final EditText input = new EditText(this.ctx);
			if (defaultValue != null) {
				input.setText(defaultValue);
			}
			dlg.setView(input);
			dlg.setCancelable(false);
			dlg.setPositiveButton(android.R.string.ok,
					new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int which) {
							String usertext = input.getText().toString();
							res.confirm(usertext);
						}
					});
			dlg.setNegativeButton(android.R.string.cancel,
					new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int which) {
							res.cancel();
						}
					});
			dlg.create();
			dlg.show();
		}
		return true;
	}

	/**
	 * 本地存储数据库大小变化的情况
	 * @param url
	 * @param databaseIdentifier
	 * @param currentQuota
	 * @param estimatedSize
	 * @param totalUsedQuota
	 * @param quotaUpdater
	 */
	@Override
	public void onConsoleMessage(String message, int lineNumber, String sourceID) {
		Logger.d(TAG, "%s: Line %d : %s", sourceID, lineNumber, message);
		String version = android.os.Build.VERSION.RELEASE;
		try{
			if(!version.startsWith("4.")){
				message = message.replaceAll("(\n)", "\\\\n");
				ctx.contentWebView.loadUrl("javascript:if(onerror){onerror('"+message+"','"+sourceID+"',"+lineNumber+")}");	
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		super.onConsoleMessage(message, lineNumber, sourceID);
	}

	@Override
	public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
		if (consoleMessage.message() != null){
			Logger.d(TAG, consoleMessage.message());
		}	
		return super.onConsoleMessage(consoleMessage);
	}

	@Override
	public void onGeolocationPermissionsShowPrompt(String origin,
			Callback callback) {
		super.onGeolocationPermissionsShowPrompt(origin, callback);
		callback.invoke(origin, true, false);
	}
}
