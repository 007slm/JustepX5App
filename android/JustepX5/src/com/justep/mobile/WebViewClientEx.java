/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */
package com.justep.mobile;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Bitmap;
import android.net.Uri;
import android.net.http.SslError;
import android.view.Gravity;
import android.webkit.HttpAuthHandler;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.justep.mobile.api.Logger;
import com.justep.mobile.utils.AppEvent;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class WebViewClientEx extends WebViewClient {

	private static final String TAG = "JustepApp";
	PortalActivity ctx;
	private boolean doClearHistory = false;

	public WebViewClientEx(PortalActivity ctx) {
		this.ctx = ctx;
	}

	@Override
	public boolean shouldOverrideUrlLoading(WebView view, String url) {
		if (this.ctx.pluginManager.onOverrideUrlLoading(url)) {
		}
		// tel:110
		else if (url.startsWith(WebView.SCHEME_TEL)) {
			try {
				Intent intent = new Intent(Intent.ACTION_DIAL);
				intent.setData(Uri.parse(url));
				ctx.startActivity(intent);
			} catch (android.content.ActivityNotFoundException e) {
				Logger.e(TAG, "Error dialing " + url + ": " + e.toString());
			}
		} else if (url.startsWith("geo:")) {
			try {
				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setData(Uri.parse(url));
				ctx.startActivity(intent);
			} catch (android.content.ActivityNotFoundException e) {
				Logger.e(TAG, "Error showing map " + url + ": " + e.toString());
			}
		}
		// mailto:abc@corp.com
		else if (url.startsWith(WebView.SCHEME_MAILTO)) {
			try {
				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setData(Uri.parse(url));
				ctx.startActivity(intent);
			} catch (android.content.ActivityNotFoundException e) {
				Logger.e(TAG,
						"Error sending email " + url + ": " + e.toString());
			}
		}
		// sms:5551212?body=This is the message
		else if (url.startsWith("sms:")) {
			try {
				Intent intent = new Intent(Intent.ACTION_VIEW);
				String address = null;
				int parmIndex = url.indexOf('?');
				if (parmIndex == -1) {
					address = url.substring(4);
				} else {
					address = url.substring(4, parmIndex);

					Uri uri = Uri.parse(url);
					String query = uri.getQuery();
					if (query != null) {
						if (query.startsWith("body=")) {
							intent.putExtra("sms_body", query.substring(5));
						}
					}
				}
				intent.setData(Uri.parse("sms:" + address));
				intent.putExtra("address", address);
				intent.setType("vnd.android-dir/mms-sms");
				ctx.startActivity(intent);
			} catch (android.content.ActivityNotFoundException e) {
				Logger.e(TAG, "Error sending sms " + url + ":" + e.toString());
			}
		}else {
			if ("".equals(url) || url.equals("about:blank")|| url.contains("about:blank")) {
				if (url.contains("about:blank")) {
					int idx = url.indexOf("?");
					if (idx != -1) {
						ctx.appEventHandle(new AppEvent(url.substring(idx + 1)));
					}else{
						return false;
					}
				}
			} else {
				view.loadUrl(url);
			}
		}
		return true;
	}

	/**
	 * x5平台不会返回401 http code 所以暂时保留空实现
	 */
	@Override
	public void onReceivedHttpAuthRequest(WebView view,
			HttpAuthHandler handler, String host, String realm) {

	}

	@Override
	public void onPageStarted(WebView view, String url, Bitmap favicon) {
		view.clearHistory();
		this.doClearHistory = true;
	}

	@Override
	public void onPageFinished(WebView view, String url) {
		if(url != null && (url.indexOf("index.w")!=-1 || url.indexOf("mIndex.w")!=-1) ){
			super.onPageFinished(view, url);
			/**
			 * 如果你要使用推送能力配合好后台的推送服务器 启动下面的服务
			 */
			// ctx.startPushNotificationService();

			if (this.doClearHistory) {
				view.clearHistory();
				this.doClearHistory = false;
			}
			this.ctx.loadUrlTimeoutFlag++;
			this.ctx.daemonSignal ++;
			if (view == ctx.contentWebView && ctx.loadSuccess == false) {
				Thread t = new Thread(new Runnable() {
					public void run() {
						try {
							final int daemonThreadValue = ctx.daemonSignal;
							Thread.sleep(10000);
							ctx.runOnUiThread(new Runnable() {
								public void run() {
									/**
									 * 快速点击设置保存时候 页面没有加载完成 loadSuccess为false
									 * 但是上次延迟过来后发现没有加载成功
									 * 以为加载失败，会弹出设置页面
									 */
									if(!ctx.loadSuccess && daemonThreadValue == ctx.daemonSignal){
										// 20s 超时
										ctx.showErrorTip();
										ctx.loadSuccess = false;
										ctx.openSettingDlg();
									}
								}
							});
						} catch (InterruptedException e) {
						}
					}
				});
				t.start();
			}
		}
		
	}

	@Override
	public void onReceivedError(WebView view, int errorCode,
			String description, String failingUrl) {
		this.ctx.loadUrlTimeoutFlag++;
		this.ctx.onReceivedError(errorCode, description, failingUrl);
	}

	public void onReceivedSslError(WebView view, SslErrorHandler handler,
			SslError error) {
		final String packageName = this.ctx.getPackageName();
		final PackageManager pm = this.ctx.getPackageManager();
		ApplicationInfo appInfo;
		try {
			appInfo = pm.getApplicationInfo(packageName,
					PackageManager.GET_META_DATA);
			if ((appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
				handler.proceed();
				return;
			} else {
				super.onReceivedSslError(view, handler, error);
			}
		} catch (NameNotFoundException e) {
			super.onReceivedSslError(view, handler, error);
		}
	}
}
