package com.justep.mobile.utils.command;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.justep.mobile.api.PluginAbstractImpl;
import com.justep.mobile.api.CommandCallback;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class BatteryListener extends PluginAbstractImpl {

	private static final String LOG_TAG = "BatteryManager";

	BroadcastReceiver receiver;

	private String batteryCallbackId = null;

	public BatteryListener() {
		this.receiver = null;
	}

	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.INVALID_ACTION;
		String result = "Unsupported Operation: " + action;

		if (action.equals("start")) {
			if (this.batteryCallbackId != null) {
				return new CommandCallback(CommandCallback.Status.ERROR,
						"Battery listener already running.");
			}
			this.batteryCallbackId = callbackId;

			// We need to listen to power events to update battery status
			IntentFilter intentFilter = new IntentFilter();
			intentFilter.addAction(Intent.ACTION_BATTERY_CHANGED);
			if (this.receiver == null) {
				this.receiver = new BroadcastReceiver() {
					@Override
					public void onReceive(Context context, Intent intent) {
						updateBatteryInfo(intent);
					}
				};
				ctx.registerReceiver(this.receiver, intentFilter);
			}

			// Don't return any result now, since status results will be sent
			// when events come in from broadcast receiver
			CommandCallback pluginResult = new CommandCallback(
					CommandCallback.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			return pluginResult;
		}

		else if (action.equals("stop")) {
			removeBatteryListener();
			this.sendUpdate(new JSONObject(), false); // release status callback
														// in JS side
			this.batteryCallbackId = null;
			return new CommandCallback(CommandCallback.Status.OK);
		}

		return new CommandCallback(status, result);
	}

	public void onDestroy() {
		removeBatteryListener();
	}

	private void removeBatteryListener() {
		if (this.receiver != null) {
			try {
				this.ctx.unregisterReceiver(this.receiver);
				this.receiver = null;
			} catch (Exception e) {
				Log.e(LOG_TAG,
						"Error unregistering battery receiver: "
								+ e.getMessage(), e);
			}
		}
	}

	private JSONObject getBatteryInfo(Intent batteryIntent) {
		JSONObject obj = new JSONObject();
		try {
			obj.put("level", batteryIntent.getIntExtra(
					android.os.BatteryManager.EXTRA_LEVEL, 0));
			obj.put("isPlugged", batteryIntent.getIntExtra(
					android.os.BatteryManager.EXTRA_PLUGGED, -1) > 0 ? true
					: false);
		} catch (JSONException e) {
			Log.e(LOG_TAG, e.getMessage(), e);
		}
		return obj;
	}

	private void updateBatteryInfo(Intent batteryIntent) {
		sendUpdate(this.getBatteryInfo(batteryIntent), true);
	}

	/**
	 * 通知js端状态状态发生变化
	 * 
	 * @param connection
	 *            the network info to set as justepApp.connection
	 */
	private void sendUpdate(JSONObject info, boolean keepCallback) {
		if (this.batteryCallbackId != null) {
			CommandCallback result = new CommandCallback(
					CommandCallback.Status.OK, info);
			result.setKeepCallback(keepCallback);
			this.success(result, this.batteryCallbackId);
		}
	}
}
