/*
 * Copyright (C) 2010 Moduad Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.justep.mobile.push.cient;

import java.util.ArrayList;
import java.util.Properties;

import com.justep.mobile.utils.DialogUtils;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningServiceInfo;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.util.Log;

/**
 * This class is to manage the notificatin service and to load the
 * configuration.
 * 
 * @author|editor 007slm (007slm@163.com)
 */
public final class ServiceManager {

	private static final String LOGTAG = LogUtil
			.makeLogTag(ServiceManager.class);

	private Context context;

	private SharedPreferences sharedPrefs;

	private Properties props;

	private String version = "0.5.0";

	private String apiKey;

	private String xmppHost;

	private String xmppPort;

	private String callbackActivityPackageName;

	private String callbackActivityClassName;

	public ServiceManager(Context context) {
		this.context = context;

		if (context instanceof Activity) {
			Log.i(LOGTAG, "Callback Activity...");
			Activity callbackActivity = (Activity) context;
			callbackActivityPackageName = callbackActivity.getPackageName();
			callbackActivityClassName = callbackActivity.getClass().getName();
		}
		// Log.i(LOGTAG, "sharedPrefs=" + sharedPrefs.toString());
	}

	public void initParam(String apiKey, String xmppHost, String xmppPort,
			String x5Username, String x5Password) {
		// {XMPP_PASSWORD=E10ADC3949BA59ABBE56E057F20F883E,
		// CALLBACK_ACTIVITY_CLASS_NAME=com.justep.mobile.JustepPortalActivity,
		// VERSION=0.5.0, NOTIFICATION_ICON=2130837508, XMPP_HOST=192.168.1.49,
		// XMPP_PORT=5222, CALLBACK_ACTIVITY_PACKAGE_NAME=com.justep.mobile,
		// DEVICE_ID=null, XMPP_USERNAME=pushTest02,
		// X5_PASSWORD=E10ADC3949BA59ABBE56E057F20F883E, X5_USERNAME=pushTest02,
		// EMULATOR_DEVICE_ID=EMU-2026592154649904666,
		// API_KEY=x5.com.justep.mobile.x5.push.apiKey}
		sharedPrefs = context.getSharedPreferences(
				Constants.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
		String oldHost = sharedPrefs
				.getString(Constants.XMPP_HOST, "127.0.0.1");
		int oldPort = sharedPrefs.getInt(Constants.XMPP_PORT, 5222);
		String oldUserName = sharedPrefs.getString(Constants.X5_USERNAME, "");
		String oldPassword = sharedPrefs.getString(Constants.X5_PASSWORD, "");
		Editor editor = sharedPrefs.edit();
		if (oldHost.equals(xmppHost) && oldUserName.equals(x5Username)
				&& oldPassword.equals(x5Password)) {
			if (isRunning(context, Constants.NOTIFICATION_SERVICE_NAME)) {
				editor.putBoolean("needConnect", false);
			} else {
				editor.putBoolean("needConnect", true);
			}
		} else {
			stopService();
			// DialogUtils.showToast(context, "参数有变化，重启服务");
			editor.putBoolean("needConnect", true);
			editor.putString(Constants.API_KEY, apiKey);
			editor.putString(Constants.VERSION, version);
			editor.putString(Constants.XMPP_HOST, xmppHost);
			editor.putInt(Constants.XMPP_PORT, Integer.parseInt(xmppPort));
			editor.putString(Constants.CALLBACK_ACTIVITY_PACKAGE_NAME,
					callbackActivityPackageName);
			editor.putString(Constants.CALLBACK_ACTIVITY_CLASS_NAME,
					callbackActivityClassName);
			editor.putString(Constants.X5_USERNAME, x5Username);
			editor.putString(Constants.X5_PASSWORD, x5Password);
		}
		editor.commit();

	}

	public void startService() {
		if (sharedPrefs.getBoolean("needConnect", true)) {
			Thread serviceThread = new Thread(new Runnable() {
				@Override
				public void run() {
					Intent intent = NotificationService.getIntent();
					context.startService(intent);
				}
			});
			serviceThread.start();
		}

	}

	public void stopService() {
		if (isRunning(context, Constants.NOTIFICATION_SERVICE_NAME)) {
			Intent intent = NotificationService.getIntent();
			context.stopService(intent);
		}
	}

	public boolean isRunning(Context c, String serviceName) {
		ActivityManager myAM = (ActivityManager) c
				.getSystemService(Context.ACTIVITY_SERVICE);

		ArrayList<RunningServiceInfo> runningServices = (ArrayList<RunningServiceInfo>) myAM
				.getRunningServices(40);
		// 获取最多40个当前正在运行的服务，放进ArrList里,以现在手机的处理能力，要是超过40个服务，估计已经卡死，所以不用考虑超过40个该怎么办
		for (int i = 0; i < runningServices.size(); i++)// 循环枚举对比
		{
			if (runningServices.get(i).service.getClassName().toString()
					.equals(serviceName)) {
				return true;
			}
		}
		return false;
	}

	public void setNotificationIcon(int iconId) {
		Editor editor = sharedPrefs.edit();
		editor.putInt(Constants.NOTIFICATION_ICON, iconId);
		editor.commit();
	}

	// public void viewNotificationSettings() {
	// Intent intent = new Intent().setClass(context,
	// NotificationSettingsActivity.class);
	// context.startActivity(intent);
	// }

	public static void viewNotificationSettings(Context context) {
		Intent intent = new Intent().setClass(context,
				NotificationSettingsActivity.class);
		context.startActivity(intent);
	}

}
