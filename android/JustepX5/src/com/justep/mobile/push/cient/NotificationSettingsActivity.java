/*
 * Copyright 2010 the original author or authors.
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

import android.content.Context;
import android.os.Bundle;
import android.preference.CheckBoxPreference;
import android.preference.Preference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceManager;
import android.preference.PreferenceScreen;
import android.util.Log;

/**
 * Activity for displaying the notification setting view.
 * 
 * @author|editor 007slm (007slm@163.com)
 */
public class NotificationSettingsActivity extends PreferenceActivity {

	private static final String LOGTAG = LogUtil
			.makeLogTag(NotificationSettingsActivity.class);

	public NotificationSettingsActivity() {
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setPreferenceScreen(createPreferenceHierarchy());
		setPreferenceDependencies();

		CheckBoxPreference notifyPref = (CheckBoxPreference) getPreferenceManager()
				.findPreference(Constants.SETTINGS_NOTIFICATION_ENABLED);
		if (notifyPref.isChecked()) {
			notifyPref.setTitle("Notifications Enabled");
		} else {
			notifyPref.setTitle("Notifications Disabled");
		}
	}

	private PreferenceScreen createPreferenceHierarchy() {
		Log.d(LOGTAG, "createSettingsPreferenceScreen()...");

		PreferenceManager preferenceManager = getPreferenceManager();
		preferenceManager
				.setSharedPreferencesName(Constants.SHARED_PREFERENCE_NAME);
		preferenceManager.setSharedPreferencesMode(Context.MODE_PRIVATE);

		PreferenceScreen root = preferenceManager.createPreferenceScreen(this);

		// PreferenceCategory prefCat = new PreferenceCategory(this);
		// // inlinePrefCat.setTitle("");
		// root.addPreference(prefCat);

		CheckBoxPreference notifyPref = new CheckBoxPreference(this);
		notifyPref.setKey(Constants.SETTINGS_NOTIFICATION_ENABLED);
		notifyPref.setTitle("推送");
		notifyPref.setSummaryOn("接收推送通知");
		notifyPref.setSummaryOff("关闭推送通知");
		notifyPref.setDefaultValue(Boolean.TRUE);
		notifyPref
				.setOnPreferenceChangeListener(new Preference.OnPreferenceChangeListener() {
					public boolean onPreferenceChange(Preference preference,
							Object newValue) {
						boolean checked = Boolean.valueOf(newValue.toString());
						if (checked) {
							preference.setTitle("Notifications Enabled");
						} else {
							preference.setTitle("Notifications Disabled");
						}
						return true;
					}
				});

		CheckBoxPreference soundPref = new CheckBoxPreference(this);
		soundPref.setKey(Constants.SETTINGS_SOUND_ENABLED);
		soundPref.setTitle("声音");
		soundPref.setSummary("推送消息来的时候播放声音");
		soundPref.setDefaultValue(Boolean.TRUE);
		// soundPref.setDependency(Constants.SETTINGS_NOTIFICATION_ENABLED);

		CheckBoxPreference vibratePref = new CheckBoxPreference(this);
		vibratePref.setKey(Constants.SETTINGS_VIBRATE_ENABLED);
		vibratePref.setTitle("振动");
		vibratePref.setSummary("推送消息来的时候有振动效果");
		vibratePref.setDefaultValue(Boolean.TRUE);
		// vibratePref.setDependency(Constants.SETTINGS_NOTIFICATION_ENABLED);

		root.addPreference(notifyPref);
		root.addPreference(soundPref);
		root.addPreference(vibratePref);

		// prefCat.addPreference(notifyPref);
		// prefCat.addPreference(soundPref);
		// prefCat.addPreference(vibratePref);
		// root.addPreference(prefCat);

		return root;
	}

	private void setPreferenceDependencies() {
		Preference soundPref = getPreferenceManager().findPreference(
				Constants.SETTINGS_SOUND_ENABLED);
		if (soundPref != null) {
			soundPref.setDependency(Constants.SETTINGS_NOTIFICATION_ENABLED);
		}
		Preference vibratePref = getPreferenceManager().findPreference(
				Constants.SETTINGS_VIBRATE_ENABLED);
		if (vibratePref != null) {
			vibratePref.setDependency(Constants.SETTINGS_NOTIFICATION_ENABLED);
		}
	}

}
