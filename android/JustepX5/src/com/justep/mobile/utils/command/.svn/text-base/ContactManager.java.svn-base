package com.justep.mobile.utils.command;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.justep.mobile.api.PluginAbstractImpl;
import com.justep.mobile.api.CommandCallback;
import android.util.Log;

/**
 * @author 007slm(007slm@163.com)
 * 
 */
public class ContactManager extends PluginAbstractImpl {

	private ContactAccessor contactAccessor;
	private static final String LOG_TAG = "Contact Query";

	public static final int UNKNOWN_ERROR = 0;
	public static final int INVALID_ARGUMENT_ERROR = 1;
	public static final int TIMEOUT_ERROR = 2;
	public static final int PENDING_OPERATION_ERROR = 3;
	public static final int IO_ERROR = 4;
	public static final int NOT_SUPPORTED_ERROR = 5;
	public static final int PERMISSION_DENIED_ERROR = 20;

	public ContactManager() {
	}

	@Override
	public boolean isJsonMode(String action) {
		return true;
	}

	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";

		/**
		 * Check to see if we are on an Android 1.X device. If we are return an
		 * error as we do not support this as of JustepApp 1.0.
		 */
		if (android.os.Build.VERSION.RELEASE.startsWith("1.")) {
			JSONObject res = null;
			try {
				res = new JSONObject();
				res.put("code", NOT_SUPPORTED_ERROR);
				res.put("message",
						"Contacts are not supported in Android 1.X devices");
			} catch (JSONException e) {
				// This should never happen
				Log.e(LOG_TAG, e.getMessage(), e);
			}
			return new CommandCallback(CommandCallback.Status.ERROR, res);
		}

		/**
		 * Only create the contactAccessor after we check the Android version or
		 * the program will crash older phones.
		 */
		if (this.contactAccessor == null) {
			this.contactAccessor = new ContactAccessorSdk5(this.webView,
					this.ctx);
		}

		try {
			if (action.equals("search")) {
				JSONArray res = contactAccessor.search(args.getJSONArray(0),
						args.optJSONObject(1));
				return new CommandCallback(status, res,
						"justepApp.contacts.cast");
			} else if (action.equals("save")) {
				String id = contactAccessor.save(args.getJSONObject(0));
				if (id != null) {
					JSONObject res = contactAccessor.getContactById(id);
					if (res != null) {
						return new CommandCallback(status, res);
					}
				}
			} else if (action.equals("remove")) {
				if (contactAccessor.remove(args.getString(0))) {
					return new CommandCallback(status, result);
				}
			}
			// If we get to this point an error has occurred
			JSONObject r = new JSONObject();
			r.put("code", UNKNOWN_ERROR);
			return new CommandCallback(CommandCallback.Status.ERROR, r);
		} catch (JSONException e) {
			Log.e(LOG_TAG, e.getMessage(), e);
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}
}
