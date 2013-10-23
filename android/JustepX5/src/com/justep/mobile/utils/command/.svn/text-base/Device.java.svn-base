package com.justep.mobile.utils.command;

import java.util.TimeZone;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.telephony.TelephonyManager;

import com.justep.mobile.PortalActivity;
import com.justep.mobile.api.CommandCallback;
import com.justep.mobile.api.Logger;
import com.justep.mobile.api.PluginAbstractImpl;

/**
 * @author 007slm(007slm@163.com)
 * 
 */
public class Device extends PluginAbstractImpl {
	public static final String TAG = "Device";

	public static String JustepAppVersion = "1.0"; // JustepApp version
	public static String platform = "Android"; // Device OS
	public static String uuid; // Device UUID

	BroadcastReceiver telephonyReceiver = null;

	/**
	 * Constructor.
	 */
	public Device() {
	}

	/**
	 * Sets the context of the Command. This can then be used to do things like
	 * get file paths associated with the Activity.
	 * 
	 * @param ctx
	 *            The context of the main Activity.
	 */
	public void setContext(PortalActivity ctx) {
		super.setContext(ctx);
		Device.uuid = getUuid();
		this.initTelephonyReceiver();
	}

	/**
	 * Executes the request and returns PluginResult.
	 * 
	 * @param action
	 *            The action to execute.
	 * @param args
	 *            JSONArry of arguments for the plugin.
	 * @param callbackId
	 *            The callback id used when calling back into JavaScript.
	 * @return A PluginResult object with a status and message.
	 */
	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";

		try {
			if (action.equals("getDeviceInfo")) {
				JSONObject r = new JSONObject();
				r.put("uuid", Device.uuid);
				r.put("version", this.getOSVersion());
				r.put("platform", Device.platform);
				r.put("name", this.getProductName());
				r.put("justepAppVersion", Device.JustepAppVersion);
				return new CommandCallback(status, r);
			} else {
				return new CommandCallback(status, result);
			}

		} catch (JSONException e) {
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}

	/**
	 * Identifies if action to be executed returns a value and should be run
	 * synchronously.
	 * 
	 * @param action
	 *            The action to execute
	 * @return T=returns value
	 */
	public boolean isJsonMode(String action) {
		if (action.equals("getDeviceInfo")) {
			return true;
		}
		return false;
	}

	/**
	 * Unregister receiver.
	 */
	public void onDestroy() {
		this.ctx.unregisterReceiver(this.telephonyReceiver);
	}

	/**
	 * Listen for telephony events: RINGING, OFFHOOK and IDLE Send these events
	 * to all plugins using DroidGap.onMessage("telephone", "ringing" |
	 * "offhook" | "idle")
	 */
	private void initTelephonyReceiver() {
		IntentFilter intentFilter = new IntentFilter();
		intentFilter.addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED);
		final PortalActivity myctx = this.ctx;
		this.telephonyReceiver = new BroadcastReceiver() {

			@Override
			public void onReceive(Context context, Intent intent) {

				// If state has changed
				if ((intent != null)
						&& intent.getAction().equals(
								TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {
					if (intent.hasExtra(TelephonyManager.EXTRA_STATE)) {
						String extraData = intent
								.getStringExtra(TelephonyManager.EXTRA_STATE);
						if (extraData
								.equals(TelephonyManager.EXTRA_STATE_RINGING)) {
							Logger.i(TAG, "Telephone RINGING");
							myctx.postMessage("telephone", "ringing");
						} else if (extraData
								.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {
							Logger.i(TAG, "Telephone OFFHOOK");
							myctx.postMessage("telephone", "offhook");
						} else if (extraData
								.equals(TelephonyManager.EXTRA_STATE_IDLE)) {
							Logger.i(TAG, "Telephone IDLE");
							myctx.postMessage("telephone", "idle");
						}
					}
				}
			}
		};

		// Register the receiver
		this.ctx.registerReceiver(this.telephonyReceiver, intentFilter);
	}

	/**
	 * Get the OS name.
	 * 
	 * @return
	 */
	public String getPlatform() {
		return Device.platform;
	}

	/**
	 * Get the device's Universally Unique Identifier (UUID).
	 * 
	 * @return
	 */
	public String getUuid() {
		String uuid = Settings.Secure.getString(this.ctx.getContentResolver(),
				android.provider.Settings.Secure.ANDROID_ID);
		return uuid;
	}

	/**
	 * Get the JustepApp version.
	 * 
	 * @return
	 */
	public String getJustepAppVersion() {
		return Device.JustepAppVersion;
	}

	public String getModel() {
		String model = android.os.Build.MODEL;
		return model;
	}

	public String getProductName() {
		String productname = android.os.Build.PRODUCT;
		return productname;
	}

	/**
	 * Get the OS version.
	 * 
	 * @return
	 */
	public String getOSVersion() {
		String osversion = android.os.Build.VERSION.RELEASE;
		return osversion;
	}

	public String getSDKVersion() {
		String sdkversion = android.os.Build.VERSION.SDK;
		return sdkversion;
	}

	public String getTimeZoneID() {
		TimeZone tz = TimeZone.getDefault();
		return (tz.getID());
	}

}
