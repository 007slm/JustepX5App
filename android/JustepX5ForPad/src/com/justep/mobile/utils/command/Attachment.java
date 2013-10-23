package com.justep.mobile.utils.command;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Environment;
import android.util.Log;
import android.webkit.URLUtil;

import com.justep.mobile.R;
import com.justep.mobile.api.CommandCallback;
import com.justep.mobile.api.PluginAbstractImpl;
import com.justep.mobile.utils.DialogUtils;
import com.justep.mobile.utils.ResourceIntent;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class Attachment extends PluginAbstractImpl {
	private String fileName = "";
	private String fileExt = "";

	@Override
	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";
		try {
			if (action.equals("uploadAttachment")) {
				// TODO: uploadAttachment();
			} else if (action.equals("downloadAttachment")) {
				downloadWebFile(args.getString(0));
			} else if (action.equals("openAttachDlg")) {
				openAttachment(args.getString(0));
			} else if (action.equals("showDownloadList")) {
				// TODO:
			}
			return new CommandCallback(status, result);
		} catch (JSONException e) {
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}

	private File downloadWebFile(String url) {
		HttpURLConnection conn = null;
		FileOutputStream fos = null;
		File downloadFile = null;
		try {
			URL myURL = new URL(url);
			/* 创建连接 */
			conn = (HttpURLConnection) myURL.openConnection();
			conn.connect();
			String contentDis = conn.getHeaderField("Content-Disposition");
			if (contentDis != null && (!"".equals(contentDis.trim()))) {
				Pattern pattern = Pattern.compile("filename=\"((.+)(\\..+))\"");
				Matcher matcher = pattern.matcher(contentDis);
				while (matcher.find()) {
					fileName = matcher.group(2);
					fileExt = matcher.group(3);
				}
			}
			
			fileName =java.net.URLDecoder.decode(fileName, "utf-8");
			if(fileName.length() > 300){
				fileName = fileName.substring(0, 300);
			}
			
			/* InputStream 下载文件 */
			InputStream is = conn.getInputStream();
			if (is == null) {
				throw new RuntimeException("stream is null");
			}
			/* 创建临时文件 */
			// tempFile = File.createTempFile(fileName,
			// fileExt,context.getFilesDir());
			downloadFile = createDownloadFileInSD(fileName + fileExt);

			/* 将文件写入暂存盘 */
			fos = new FileOutputStream(downloadFile);
			byte buf[] = new byte[128];
			do {
				int numread = is.read(buf);
				if (numread <= 0) {
					break;
				}
				fos.write(buf, 0, numread);
			} while (true);
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (conn != null) {
				conn.disconnect();
			}
			if (fos != null) {
				try {
					fos.flush();
					fos.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}

		}
		return downloadFile;

	}

	public File createDownloadFileInSD(String fileName) {
		return createFileInSD(fileName, "/Justep/download/");
	}

	private File createFileInSD(String fileName, String parentDir) {
		String sdStatus = Environment.getExternalStorageState();
		File file = null;
		if (!sdStatus.equals(Environment.MEDIA_MOUNTED)) {
			Log.d("TestFile", "SD card is not avaiable/writeable right now.");
		}
		try {
			String pathName = Environment.getExternalStorageDirectory()
					+ parentDir;
			File path = new File(pathName);
			file = new File(pathName + fileName);
			if (!path.exists()) {
				if (path.mkdirs()) {
					Log.i("create success", path.toString());
				} else {
					throw new RuntimeException("创建文件目录失败:" + path.toString());
				}
			}
			if (file.exists() && file.isDirectory()) {
				file.delete();
			}
			if (!file.exists()) {
				Log.d("TestFile", "Create the file:" + fileName);
				if (file.createNewFile()) {
					Log.i("create success", file.toString());
				} else {
					throw new RuntimeException("创建文件失败:" + file.toString());
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return file;
	}

	private boolean checkEndsWithInStringArray(String[] fileEndings) {
		for (String aEnd : fileEndings) {
			if (fileExt.endsWith(aEnd))
				return true;
		}
		return false;
	}

	public void openAttachment(String path) {
		File file = null;
		if (URLUtil.isNetworkUrl(path)) {
			file = downloadWebFile(path);
		} else {
			file = new File(path);
		}
		openAttachment(file);
	}

	public void downloadAttachment(String path) {
		File file = downloadWebFile(path);
	}

	public void openAttachment(File file) {
		Resources resources = ctx.getResources();
		Intent intent = null;
		if (file != null && file.isFile()) {
			String fileName = file.toString();
			if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingImage))) {
				intent = ResourceIntent.getImageFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingWebText))) {
				intent = ResourceIntent.getHtmlFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingPackage))) {
				intent = ResourceIntent.getApkFileIntent(file);

			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingAudio))) {
				intent = ResourceIntent.getAudioFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingVideo))) {
				intent = ResourceIntent.getVideoFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingText))) {
				intent = ResourceIntent.getTextFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingPdf))) {
				intent = ResourceIntent.getPdfFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingWord))) {
				intent = ResourceIntent.getWordFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingExcel))) {
				intent = ResourceIntent.getExcelFileIntent(file);
			} else if (checkEndsWithInStringArray(resources
					.getStringArray(R.array.fileEndingPPT))) {
				intent = ResourceIntent.getPPTFileIntent(file);
			} else {
				DialogUtils.showMessage(ctx, "缺少识别程序", "无法打开(" + fileName
						+ ")，请安装相应的软件！", 0, new OnClickListener() {
					@Override
					public void onClick(DialogInterface dialog, int which) {

					}
				});

				return;
			}
		} else {
			DialogUtils.showMessage(ctx, "缺少识别程序", "无法识别的文件", 0,
					new OnClickListener() {
						@Override
						public void onClick(DialogInterface dialog, int which) {

						}
					});
			return;
		}
		ctx.startActivity(intent);
	}

}
