package com.justep.mobile.utils.command;

import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.webkit.WebView;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.RelativeLayout.LayoutParams;

import com.justep.mobile.PortalActivity;
import com.justep.mobile.R;
import com.justep.mobile.api.CommandCallback;
import com.justep.mobile.api.Logger;
import com.justep.mobile.api.PluginAbstractImpl;
import com.justep.mobile.utils.command.Attachment;

/**
 * @author 007slm(007slm@163.com) portal提供的能力
 */
public class Portal extends PluginAbstractImpl {
	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";
		try {
			if (action.equals("loadSystem")) {
				this.refreshSystem();
			}else if (action.equals("refresh")) {
				this.refreshSystem();
			} else if (action.equals("exitApp")) {
				this.exitApp();
			} else if (action.equals("exit")) {
				this.exitApp();
			} else if (action.equals("saveConfigInfo")) {
				this.saveConfigInfo(args.getString(0), args.getString(1),
						args.getString(2));
			} else if (action.equals("loginConfig")) {
				this.ctx.openSettingDlg();
			} else if (action.equals("showConver")) {
				showConver();
			} else if (action.equals("removeConver")) {
				removeConver();
			} else if (action.equals("isBackbuttonOverridden")) {
				boolean b = this.isBackbuttonOverridden();
				return new CommandCallback(status, b);
			}
			return new CommandCallback(status, result);
		} catch (JSONException e) {
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}

	private void refreshSystem() {
		PortalActivity portalActivity = ((PortalActivity) this.ctx);
		portalActivity.clearCache();
		portalActivity.loadSystem();
	}

	private void saveConfigInfo(String url, String userName, String password) {
		this.ctx.saveConfigInfo(url, userName, password);
	}

	protected void removeConver() {
		this.ctx.pluginManager.exec("Notification", "activityStop");
	}

	protected void showConver() {
		this.ctx.pluginManager.exec("Notification", "activityStart", "",
				"['','加载中...']", false);
	}

	public int px2dip(float pxValue) {
		final float scale = ctx.getResources().getDisplayMetrics().density;
		return (int) (pxValue / scale + 0.5f);
	}

	public int dip2px(float dpValue) {
		final float scale = ctx.getResources().getDisplayMetrics().density;
		return (int) (dpValue * scale + 0.5f);
	}

	/**
	 * Clear the resource cache.
	 */
	public void clearCache() {
		((PortalActivity) this.ctx).clearCache();
	}

	/**
	 * Load the url into the webview.
	 * 
	 * @param url
	 * @param props
	 *            Properties that can be passed in to the JustepPortalActivity
	 *            activity (i.e. loadingDialog, wait, ...)
	 * @throws JSONException
	 */
	public void loadUrl(String url, JSONObject props) throws JSONException {
		Logger.d("JustepAppPortal", "App.loadUrl(" + url + "," + props + ")");
		int wait = 0;
		boolean openExternal = false;
		boolean clearHistory = false;

		// If there are properties, then set them on the Activity
		HashMap<String, Object> params = new HashMap<String, Object>();
		if (props != null) {
			JSONArray keys = props.names();
			for (int i = 0; i < keys.length(); i++) {
				String key = keys.getString(i);
				if (key.equals("wait")) {
					wait = props.getInt(key);
				} else if (key.equalsIgnoreCase("openexternal")) {
					openExternal = props.getBoolean(key);
				} else if (key.equalsIgnoreCase("clearhistory")) {
					clearHistory = props.getBoolean(key);
				} else {
					Object value = props.get(key);
					if (value == null) {

					} else if (value.getClass().equals(String.class)) {
						params.put(key, (String) value);
					} else if (value.getClass().equals(Boolean.class)) {
						params.put(key, (Boolean) value);
					} else if (value.getClass().equals(Integer.class)) {
						params.put(key, (Integer) value);
					}
				}
			}
		}

		// If wait property, then delay loading

		if (wait > 0) {
			try {
				synchronized (this) {
					this.wait(wait);
				}
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		((PortalActivity) this.ctx).showWebPage(url, openExternal,
				clearHistory, params);
	}

	/**
	 * Cancel loadUrl before it has been loaded.
	 */
	public void cancelLoadUrl() {
		((PortalActivity) this.ctx).cancelLoadUrl();
	}

	/**
	 * Override the default behavior of the Android back button. If overridden,
	 * when the back button is pressed, the "backKeyDown" JavaScript event will
	 * be fired.
	 * 
	 * @param override
	 *            T=override, F=cancel override
	 */
	public void overrideBackbutton(boolean override) {
		Logger.i(
				"JustepPortalActivity",
				"WARNING: Back Button Default Behaviour will be overridden.  The backbutton event will be fired!");
		((PortalActivity) this.ctx).bound = override;
	}

	/**
	 * Return whether the Android back button is overridden by the user.
	 * 
	 * @return boolean
	 */
	public boolean isBackbuttonOverridden() {
		return ((PortalActivity) this.ctx).bound;
	}

	/**
	 * Exit the Android application.
	 */
	public void exitApp() {
		((PortalActivity) this.ctx).confirmExit();
		// ((JustepPortalActivity)this.ctx).endActivity();
	}

}
