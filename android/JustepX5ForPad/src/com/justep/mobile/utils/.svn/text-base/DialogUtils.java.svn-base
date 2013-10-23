package com.justep.mobile.utils;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.text.Html;

/**
 * @author 007slm(007slm@163.com)
 */
public class DialogUtils {

	public static void showMessage(Context context, String title,
			String message, int icon, DialogInterface.OnClickListener ackHandler) {
		AlertDialog.Builder builder = new AlertDialog.Builder(context);
		builder.setTitle(title);
		builder.setMessage(Html.fromHtml(message));
		builder.setCancelable(false);
		builder.setPositiveButton("确定", ackHandler);
		// builder.setIcon(icon);
		builder.show();
	}

	public static void showYesNoPrompt(Context _context, String title,
			String message, OnClickListener onYesListener,
			OnClickListener onNoListener) {
		AlertDialog.Builder builder = new AlertDialog.Builder(_context);
		builder.setTitle(title);
		builder.setIcon(android.R.drawable.ic_dialog_info); // lame icon
		builder.setMessage(message);
		builder.setCancelable(false);
		builder.setPositiveButton("确定", onYesListener);
		builder.setNegativeButton("取消", onNoListener);
		builder.show();
	}

	public static void AlertDialog(final Context ctx, final CharSequence title,
			final CharSequence message) {
		new AlertDialog.Builder(ctx)
				// .setIcon(R.drawable.icon)
				.setTitle(title)
				.setMessage(message)
				.setPositiveButton("Dismiss",
						new DialogInterface.OnClickListener() {
							public void onClick(DialogInterface dialog,
									int whichButton) {
							}
						}).show();
	}

	/*
	 * public static void showToastInThread(final Context ctx,final CharSequence
	 * message) { Handler handler = new Handler(); handler.post(new Runnable() {
	 * 
	 * @Override public void run() { Toast.makeText(ctx, message,
	 * Toast.LENGTH_LONG).show(); } }); }
	 * 
	 * public static void showToast(final Context ctx,final CharSequence
	 * message) { Toast.makeText(ctx, message, Toast.LENGTH_LONG).show(); }
	 * 
	 * public static void showToastInCenter(final Context ctx,final CharSequence
	 * message) { Toast toast = Toast.makeText(ctx, message, Toast.LENGTH_LONG);
	 * toast.setGravity(Gravity.CENTER, 0, 0); toast.show(); }
	 * 
	 * public static void showToastWithImage(final Context ctx,final
	 * CharSequence message) { Toast toast = Toast.makeText(ctx,message,
	 * Toast.LENGTH_LONG); toast.setGravity(Gravity.CENTER, 0, 0); LinearLayout
	 * toastView = (LinearLayout) toast.getView(); ImageView imageCodeProject =
	 * new ImageView(ctx); imageCodeProject.setImageResource(R.drawable.icon);
	 * toastView.addView(imageCodeProject, 0); toast.show(); }
	 */
}
