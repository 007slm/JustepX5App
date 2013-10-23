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

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Activity for displaying the notification details view.
 * 
 * @author|editor 007slm (007slm@163.com)
 */
public class NotificationDetailsActivity extends Activity {

	private static final String LOGTAG = LogUtil
			.makeLogTag(NotificationDetailsActivity.class);

	private String callbackActivityPackageName;

	private String callbackActivityClassName;

	public NotificationDetailsActivity() {
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		SharedPreferences sharedPrefs = this.getSharedPreferences(
				Constants.SHARED_PREFERENCE_NAME, Context.MODE_PRIVATE);
		callbackActivityPackageName = sharedPrefs.getString(
				Constants.CALLBACK_ACTIVITY_PACKAGE_NAME, "");
		callbackActivityClassName = sharedPrefs.getString(
				Constants.CALLBACK_ACTIVITY_CLASS_NAME, "");

		Intent intent = getIntent();
		String notificationId = intent
				.getStringExtra(Constants.NOTIFICATION_ID);
		String notificationApiKey = intent
				.getStringExtra(Constants.NOTIFICATION_API_KEY);
		String notificationTitle = intent
				.getStringExtra(Constants.NOTIFICATION_TITLE);
		String notificationMessage = intent
				.getStringExtra(Constants.NOTIFICATION_MESSAGE);
		String notificationUri = intent
				.getStringExtra(Constants.NOTIFICATION_URI);
		Log.d(LOGTAG, "notificationId=" + notificationId);
		Log.d(LOGTAG, "notificationApiKey=" + notificationApiKey);
		Log.d(LOGTAG, "notificationTitle=" + notificationTitle);
		Log.d(LOGTAG, "notificationMessage=" + notificationMessage);
		Log.d(LOGTAG, "notificationUri=" + notificationUri);

		Intent homeIntent;
		if (notificationUri != null
				&& notificationUri.length() > 0
				&& (notificationUri.startsWith("http:")
						|| notificationUri.startsWith("https:")
						|| notificationUri.startsWith("tel:") || notificationUri
							.startsWith("geo:"))) {
			homeIntent = new Intent(Intent.ACTION_VIEW,
					Uri.parse(notificationUri));
		} else {
			/**
			 * 这样写可以回到进入后台时候的原始页面，不会启动新进程
			 */
			homeIntent = new Intent(Intent.ACTION_MAIN);

			homeIntent.addCategory(Intent.CATEGORY_LAUNCHER);

			Bundle bundle = new Bundle();
			bundle.putString(Constants.NOTIFICATION_ID, notificationId);
			bundle.putString(Constants.NOTIFICATION_API_KEY, notificationApiKey);
			bundle.putString(Constants.NOTIFICATION_TITLE, notificationTitle);
			bundle.putString(Constants.NOTIFICATION_MESSAGE,
					notificationMessage);
			bundle.putString(Constants.NOTIFICATION_URI, notificationUri);
			homeIntent.putExtras(bundle);

			homeIntent.setClassName(callbackActivityPackageName,
					callbackActivityClassName);

			homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
					| Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);

		}

		NotificationDetailsActivity.this.startActivity(homeIntent);
		NotificationDetailsActivity.this.finish();

		/*
		 * View rootView = createView(notificationTitle, notificationMessage,
		 * notificationUri);
		 */
		// setContentView(rootView);
	}

	@SuppressWarnings("unused")
	@Deprecated
	private View createView(final String title, final String message,
			final String uri) {

		LinearLayout linearLayout = new LinearLayout(this);
		linearLayout.setBackgroundColor(0xffeeeeee);
		linearLayout.setOrientation(LinearLayout.VERTICAL);
		linearLayout.setPadding(5, 5, 5, 5);
		LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.FILL_PARENT,
				LinearLayout.LayoutParams.FILL_PARENT);
		linearLayout.setLayoutParams(layoutParams);

		TextView textTitle = new TextView(this);
		textTitle.setText(title);
		textTitle.setTextSize(18);
		// textTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
		textTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
		textTitle.setTextColor(0xff000000);
		textTitle.setGravity(Gravity.CENTER);

		layoutParams = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.FILL_PARENT,
				LinearLayout.LayoutParams.WRAP_CONTENT);
		layoutParams.setMargins(30, 30, 30, 0);
		textTitle.setLayoutParams(layoutParams);
		linearLayout.addView(textTitle);

		TextView textDetails = new TextView(this);
		textDetails.setText(message);
		textDetails.setTextSize(14);
		// textTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
		textDetails.setTextColor(0xff333333);
		textDetails.setGravity(Gravity.CENTER);

		layoutParams = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.FILL_PARENT,
				LinearLayout.LayoutParams.WRAP_CONTENT);
		layoutParams.setMargins(30, 10, 30, 20);
		textDetails.setLayoutParams(layoutParams);
		linearLayout.addView(textDetails);

		Button okButton = new Button(this);
		okButton.setText("Ok");
		okButton.setWidth(100);

		okButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View view) {
				Intent intent;
				if (uri != null
						&& uri.length() > 0
						&& (uri.startsWith("http:") || uri.startsWith("https:")
								|| uri.startsWith("tel:") || uri
									.startsWith("geo:"))) {
					intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
				} else {
					/**
					 * 这样写可以回到进入后台时候的原始页面，不会启动新进程
					 */
					intent = new Intent(Intent.ACTION_MAIN);

					intent.addCategory(Intent.CATEGORY_LAUNCHER);

					intent.setClassName(callbackActivityPackageName,
							callbackActivityClassName);

					intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
							| Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);

				}

				NotificationDetailsActivity.this.startActivity(intent);
				NotificationDetailsActivity.this.finish();
			}
		});

		Button settingButton = new Button(this);
		settingButton.setText("setting");
		settingButton.setWidth(100);

		settingButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View view) {
				ServiceManager
						.viewNotificationSettings(NotificationDetailsActivity.this);
			}
		});

		LinearLayout innerLayout = new LinearLayout(this);
		innerLayout.setGravity(Gravity.CENTER);
		innerLayout.addView(okButton);
		innerLayout.addView(settingButton);

		linearLayout.addView(innerLayout);

		return linearLayout;
	}
}
