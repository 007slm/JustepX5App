package com.justep.mobile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.xmlpull.v1.XmlPullParserException;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.XmlResourceParser;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TableLayout;
import android.widget.Toast;

import com.justep.mobile.api.Logger;
import com.justep.mobile.api.PluginInterface;
import com.justep.mobile.push.cient.Constants;
import com.justep.mobile.push.cient.ServiceManager;
import com.justep.mobile.utils.AppEvent;
import com.justep.mobile.utils.MD5;
import com.justep.mobile.utils.PreferenceNode;
import com.justep.mobile.utils.PreferenceSet;
import com.justep.mobile.utils.StringUtils;
import com.justep.mobile.utils.command.CallbackServer;

/**
 * @author 007slm(007slm@163.com)
 * 
 */

public class PortalActivity extends Activity {

	public static String TAG = "JustepPortalActivity";

	protected WebViewClient webViewClient;

	public boolean bound = false;
	public CallbackServer callbackServer;
	public PluginManger pluginManager;
	protected boolean cancelLoadUrl = false;
	protected ProgressDialog spinnerDialog = null;

	private static int ACTIVITY_STARTING = 0;
	private static int ACTIVITY_RUNNING = 1;
	private static int ACTIVITY_EXITING = 2;
	private int activityState = 0; // 0=starting, 1=running (after 1st resume),
									// 2=shutting down

	// Plugin to call when activity result is received
	protected PluginInterface activityResultCallback = null;
	protected boolean activityResultKeepRunning;

	// Flag indicates that a loadUrl timeout occurred
	public int loadUrlTimeoutFlag = 0;
	public int loadUrlTimeoutValue = 20000;

	// Keep app running when pause is received. (default = true)
	// If true, then the JavaScript and native code continue to run in the
	// background
	// when another application (activity) is started.
	protected boolean keepRunning = true;

	// preferences read from JustepApp.xml
	protected PreferenceSet preferences;

	public WebView contentWebView;
	private WebView toolbarWebView;

	public String contentPageUrl;
	private String toolbarPageUrl;

	final private String F_URL = "url";
	final private String F_FIXEDLOGINURL = "fixedLoginUrl";
	
	final private String F_USERNAME = "userName";
	final private String F_PASSWORD = "password";

	final private String DF_URL = "demo.justep.com";
	final private String DF_FIXEDLOGINURL = "http://demo.justep.com/x5/mobileUI/portal/directLogin.w";
	final private String DF_USERNAME = "x5";// x5
	final private String DF_PASSWORD = "123456"; // 123456

	private SharedPreferences sharedPreferences;
	private SharedPreferences.Editor sharedEditor;

	protected boolean loadSuccess = false;

	public ValueCallback<Uri> mUploadMessage;

	protected AlertDialog settingDialog;
	Handler loadHandler; 
	
	public int daemonSignal = 1;
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//this.loadConfiguration();
		setVolumeControlStream(AudioManager.STREAM_MUSIC);
		setContentView(R.layout.main);
		final ImageView btn = ((ImageView) this.findViewById(R.id.button1));
		btn.setVisibility(8);
		btn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				View view = findViewById(R.id.webView2);
				if (view.getVisibility() == 8) {
					view.setVisibility(0);
					btn.setVisibility(8);
				} else {
					view.setVisibility(8);
					btn.setVisibility(0);
				}
			}
		});

		this.initContentWebView();
		this.initToolbarWebView();

		sharedPreferences = this.getSharedPreferences(Constants.X5SETTING,
				MODE_PRIVATE);
		sharedEditor = sharedPreferences.edit();
		spinnerStart("", getResources().getString(R.string.loadingTip));
		loadSystem();
		
	}

	public void switchPage(String pageId, String toolbarHeight) {
		if (toolbarHeight != null && !toolbarHeight.equals("")) {
			int height = Integer.parseInt(toolbarHeight);
			pluginManager.exec("JustepAppPortal", "setToolbarHeight", "", "["
					+ height + "]", false);
		}
		toolbarWebView.loadUrl("javascript:changeState(\"" + pageId + "\")");
		contentWebView.loadUrl("javascript:switchPageTo(\"" + pageId + "\")");
	}

	public void saveConfigInfo(String url, String userName, String password) {
		sharedEditor.putString(F_URL, url);
		sharedEditor.putString(F_USERNAME, userName);
		sharedEditor.putString(F_PASSWORD, password);
		sharedEditor.commit();
		if (isEmpty(contentWebView.getUrl())) {
			contentWebView.loadUrl(url);
		}
	}

	/**
	 * 兼容性保留 主要接收来自web页面的事件
	 * 
	 * @param event
	 */
	public void appEventHandle(final AppEvent event) {
		this.runOnUiThread(new Runnable() {
			public void run() {
				contentWebView.requestFocus();
				Log.i("event", event.getEventName());
				if ("hideToolbar".equals(event.getEventName())) {
					pluginManager.exec("Portal", "hideToolbar");
				} else if ("showToolbar".equals(event.getEventName())) {
					pluginManager.exec("Portal", "showToolbar");
				} else if ("switchPage".equals(event.getEventName())) {
					String pageId = event.getDataItem("pageId");
					String toolbarHeight = event.getDataItem("toolbarHeight");
					switchPage(pageId, toolbarHeight);
				} else if ("setToolbarHeight".equals(event.getEventName())) {
					int height = Integer.parseInt(event.getDataItem("height"));
					pluginManager.exec("Portal", "setToolbarHeight", "", "['"
							+ height + "']", false);
				} else if ("log".equals(event.getEventName())) {
					Log.i("log", event.getDataItem("msg"));
				} else if ("refresh".equals(event.getEventName())) {
					pluginManager.exec("Portal", "refresh");
				} else if ("exitApp".equals(event.getEventName())) {
					pluginManager.exec("Portal", "exitApp");
				} else if ("exit".equals(event.getEventName())) {
					pluginManager.exec("Portal", "refreshSystem");
				} else if ("saveConfigInfo".equals(event.getEventName())) {
					String url = event.getDataItem("url");
					String userName = event.getDataItem("userName");
					String password = event.getDataItem("password");
					pluginManager.exec("Portal", "saveConfigInfo", "", "['"
							+ url + "','" + userName + "','" + password + "']",
							false);
				} else if ("loginConfig".equals(event.getEventName())) {
					pluginManager.exec("Portal", "loginConfig");
				} else if ("showConver".equals(event.getEventName())) {
					pluginManager.exec("Portal", "showConver");
				} else if ("removeConver".equals(event.getEventName())) {
					pluginManager.exec("Portal", "removeConver");
				}
			}
		});
	}

	/**
	 * 打开配置对话框.
	 */
	public void openSettingDlg() {
		daemonSignal++;
		spinnerStop();
		if (settingDialog != null && settingDialog.isShowing()) {
			return;
		}

		Builder settingBuilder = new AlertDialog.Builder(this);
		settingBuilder.setTitle(R.string.settingDlgTitle);
		final TableLayout loginSettingForm = (TableLayout) getLayoutInflater()
				.inflate(R.layout.settingdlg, null);
		settingBuilder.setView(loginSettingForm);
		settingBuilder.setPositiveButton(R.string.save,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						String url = StringUtils
								.toBj(((EditText) loginSettingForm
										.findViewById(R.id.url)).getText()
										.toString());
						String newUser = ((EditText) loginSettingForm
								.findViewById(R.id.userName)).getText()
								.toString();
						String newPassword = ((EditText) loginSettingForm
								.findViewById(R.id.password)).getText()
								.toString();

						sharedEditor.putString(F_URL, url);
						sharedEditor.putString(F_USERNAME, newUser);
						sharedEditor.putString(F_PASSWORD, newPassword);
						sharedEditor.commit();
						contentWebView.clearView();
						dialog.dismiss();
						loadSystem();
					}
				});
		settingBuilder.setNegativeButton(R.string.close,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						System.out.println(loadSuccess);
						System.out.println(PortalActivity.this.loadSuccess);
						if (!loadSuccess) {
							confirmExit();
						}
					}
				});

		String url = sharedPreferences.getString(F_URL, DF_URL);
		url = StringUtils.toBj(url);
		String userName = sharedPreferences.getString(F_USERNAME, DF_USERNAME);
		String password = sharedPreferences.getString(F_PASSWORD, DF_PASSWORD);

		((EditText) loginSettingForm.findViewById(R.id.url)).setText(url);
		((EditText) loginSettingForm.findViewById(R.id.userName))
				.setText(userName);
		((EditText) loginSettingForm.findViewById(R.id.password))
				.setText(password);
		settingDialog = settingBuilder.create();
		settingDialog.show();		
	}

	/*
	 * 开始加载系统.
	 */
	public void loadSystem() {
		logout();
		spinnerStart("", getResources().getString(R.string.loadingTip));
		final String url = sharedPreferences.getString(F_URL, DF_URL);
		final PortalActivity me = PortalActivity.this;
		loadHandler = new Handler(){
			public void handleMessage(Message msg) {
				if(msg.getData().getInt("loadState") == 0){
					String fixedLoginUrl = sharedPreferences.getString(F_FIXEDLOGINURL, DF_FIXEDLOGINURL);
					String userName = sharedPreferences.getString(F_USERNAME, DF_USERNAME);
					String password = sharedPreferences.getString(F_PASSWORD, DF_PASSWORD);
					loadSuccess = false;
					if (isEmpty(url) || isEmpty(userName) || isEmpty(password)) {
						loadSuccess = false;
						showErrorTip();
						openSettingDlg();
					} else {
						MD5 md5 = new MD5();
						password = md5.getMD5ofStr(password);
						contentPageUrl = fixedLoginUrl + "?username=" + userName + "&password="
								+ password + "&time=" + System.currentTimeMillis();

						int idx = fixedLoginUrl.indexOf("/mobileUI/");
						if (idx == -1) {
							loadSuccess = false;
							showErrorTip();
							openSettingDlg();
							return;
						}
						String baseUrl = fixedLoginUrl.substring(0, idx);
						toolbarPageUrl = baseUrl + "/mobileUI/portal/mainToolbar.w?time="
								+ System.currentTimeMillis();
						me.runOnUiThread(new Runnable() {
							public void run() {
								if (contentWebView == null) {
									initContentWebView();
								}
								contentWebView.clearHistory();

								if (me.callbackServer == null) {
									me.callbackServer = new CallbackServer(PortalActivity.this);
									me.callbackServer.init(contentPageUrl);
								} else {
									me.callbackServer.reinit(contentPageUrl);
								}
								if (me.pluginManager == null) {
									me.pluginManager = createPluginManager();

								} else {
									me.pluginManager.reinit();
								}
								// Create a timeout timer for loadUrl
								final int currentLoadUrlTimeout = me.loadUrlTimeoutFlag;

								Runnable runnable = new Runnable() {
									public void run() {
										try {
											synchronized (this) {
												wait(me.loadUrlTimeoutValue);
											}
										} catch (InterruptedException e) {
											e.printStackTrace();
										}
										// If timeout, then stop loading and handle error
										if (me.loadUrlTimeoutFlag == currentLoadUrlTimeout) {
											me.onReceivedError(-6, "连接超时！", contentPageUrl);
										}
									}
								};
								Thread thread = new Thread(runnable);
								thread.start();

								contentWebView.loadUrl(contentPageUrl);
								toolbarWebView.loadUrl(toolbarPageUrl);
							}
							
							
							private PluginManger createPluginManager() {
								PluginManger pm = new PluginManger(me);
								/**
								 * 开始注册插件
								 */
								pm.pluginMap.put("Geolocation",
										"com.justep.mobile.utils.command.GeoBroker");
								pm.pluginMap.put("Device",
										"com.justep.mobile.utils.command.Device");
								pm.pluginMap.put("Accelerometer",
										"com.justep.mobile.utils.command.AccelListener");
								pm.pluginMap.put("Compass",
										"com.justep.mobile.utils.command.CompassListener");
								pm.pluginMap.put("Media",
										"com.justep.mobile.utils.command.AudioHandler");
								pm.pluginMap.put("Camera",
										"com.justep.mobile.utils.command.CameraLauncher");
								pm.pluginMap.put("Contacts",
										"com.justep.mobile.utils.command.ContactManager");
								pm.pluginMap.put("Crypto",
										"com.justep.mobile.utils.command.CryptoHandler");
								pm.pluginMap.put("File",
										"com.justep.mobile.utils.command.FileUtils");
								pm.pluginMap.put("Network Status",
										"com.justep.mobile.utils.command.NetworkManager");
								pm.pluginMap.put("Notification",
										"com.justep.mobile.utils.command.Notification");
								pm.pluginMap.put("Storage",
										"com.justep.mobile.utils.command.Storage");
								pm.pluginMap.put("Temperature",
										"com.justep.mobile.utils.command.TempListener");
								pm.pluginMap.put("FileTransfer",
										"com.justep.mobile.utils.command.FileTransfer");
								pm.pluginMap.put("Capture",
										"com.justep.mobile.utils.command.Capture");
								pm.pluginMap.put("Portal",
										"com.justep.mobile.utils.command.Portal");
								pm.pluginMap.put("Attachment",
										"com.justep.mobile.utils.command.Attachment");
								return pm;
							}
						});	
					}
				}else if(msg.getData().getInt("loadState") == 1){
					showErrorTip();
					openSettingDlg();
				}else if(msg.getData().getInt("loadState") == 2){
					if (me.spinnerDialog != null) {
						me.spinnerDialog.dismiss();
						me.spinnerDialog = null;
					}
				}
			};
		};
		new Thread(new Runnable() {
					@Override
					public void run() {
						Message msg = new Message();
			            Bundle b = new Bundle();// 存放数据
						if(rebuildUrl(url)){
							b.putInt("loadState",0);
				            msg.setData(b);
						}else{
							b.putInt("loadState",1);
				            msg.setData(b);
						}
						loadHandler.sendMessage(msg);
					}
		}).start();
	}
		
	
	
		
	public void startPushNotificationService() {
		ServiceManager serviceManager = new ServiceManager(PortalActivity.this);
		SharedPreferences x5SharedPrefs = getSharedPreferences(
				Constants.X5SETTING, Context.MODE_PRIVATE);
		String userName = x5SharedPrefs.getString(F_USERNAME, DF_USERNAME);
		String password = x5SharedPrefs.getString(F_PASSWORD, DF_PASSWORD);
		password = new MD5().getMD5ofStr(password);
		String xmppHost = "127.0.0.1";
		String xmppPort = "5222";
		try {
			URL u = new URL(sharedPreferences.getString(F_FIXEDLOGINURL, DF_FIXEDLOGINURL));
			xmppHost = u.getHost();
		} catch (MalformedURLException e) {
			e.printStackTrace();
		}
		serviceManager.initParam(Constants.API_KEY_VALUE, xmppHost, xmppPort,
				userName, password);
		serviceManager.setNotificationIcon(R.drawable.ic_launcher);
		serviceManager.startService();
	}

	private boolean isEmpty(String str) {
		return str == null || str.trim().equals("");
	}

	/**
	 * TODO: 一定是x5吗！！
	 */
	public boolean rebuildUrl(String url) {
		String fixedLoginUrl = "";
		String toolbarUrl = "";
		if (!url.startsWith("http")) {
			url = "http://" + url;
		}
		int idx = url.indexOf("/directLogin.w");
		if (idx == -1) {
			if (url.endsWith("/")) {
				url = url.substring(0, url.length()-1);
			}
			fixedLoginUrl = url + "/mobileUI/portal/directLogin.w";
			toolbarUrl = url + "/mobileUI/portal/mainToolbar.w?time="
					+ System.currentTimeMillis();
			int respCode = getRespStatus(toolbarUrl);
			if (respCode != 200) {
				toolbarUrl = url + "/x5/mobileUI/portal/mainToolbar.w?time="
						+ System.currentTimeMillis();
				int code = getRespStatus(toolbarUrl);
				if(code == 200){
					fixedLoginUrl = url + "/x5/mobileUI/portal/directLogin.w";
					sharedEditor.putString(F_FIXEDLOGINURL, fixedLoginUrl);
					sharedEditor.commit();
				}else{
					loadSuccess = false;
					return false;
				}
			}else{
				fixedLoginUrl = url + "/mobileUI/portal/directLogin.w";
				sharedEditor.putString(F_FIXEDLOGINURL, fixedLoginUrl);
				sharedEditor.commit();
			}
		}
		return true;
	}

	/** 获取http请求状态码 */
	private int getRespStatus(String url) {
		int status = -1;
		try {
			HttpHead head = new HttpHead(url);
			HttpParams httpParams = new BasicHttpParams();
			HttpConnectionParams.setConnectionTimeout(httpParams, 5000);
			HttpConnectionParams.setSoTimeout(httpParams, 5000);
			HttpClient client = new DefaultHttpClient(httpParams);
			HttpResponse resp = client.execute(head);
			status = resp.getStatusLine().getStatusCode();
		} catch (Exception e) {
		}
		return status;
	}

	/**
	 * 清除缓存 private void clearCache() { File file =
	 * CacheManager.getCacheFileBaseDir(); if (file.exists()) { if
	 * (file.isFile()) { file.delete(); } else { File[] files =
	 * file.listFiles(); if (files != null && files.length != 0) for (File f :
	 * files) { deleteFile(f); } file.delete(); } } webView.clearCache(true);
	 * webView.clearHistory(); webView.clearFormData();
	 * this.deleteDatabase("webview.db");
	 * this.deleteDatabase("webviewCache.db"); } private boolean deleteFile(File
	 * file) { if (file == null) return false; if (file.isFile()) { return
	 * file.delete(); } else { File[] files = file.listFiles(); if (files !=
	 * null && files.length != 0) for (File f : files) { if (!deleteFile(f)) {
	 * return false; } } file.delete(); } return true; }
	 **/

	public void clearCache() {
		if (contentWebView != null) {
			contentWebView.clearCache(true);
		}
		if (toolbarWebView != null) {
			toolbarWebView.clearCache(true);
		}
	}

	/** 退出系统 **/
	private void exit() {
		contentWebView.loadUrl("about:blank");
		// Activity专用的推退出
		// webView.clearCache(true);
		contentWebView.clearView();
		// webView.clearHistory();
		contentWebView.destroy();
		toolbarWebView.clearHistory();
		finish();
		// 通过结束进程
		android.os.Process.killProcess(android.os.Process.myPid());
		// 通过Activity自带的ActivityService来结束应用程序 系统会将，该包下的
		// ，所有进程，服务，全部杀掉，就可以杀干净了
		ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
		am.restartPackage(getPackageName());
		// 系统级别的退出 其中传递的状态码 表示退出的级别
		System.exit(-1);
	}
	
	public void logout(){
		contentWebView.loadUrl("javascript:justep.mobile.Portal.logout()");
		try {
			Thread.sleep(500);// 延迟执行，以便能调用注销方法
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public void confirmExit() {// 退出确认
		final AlertDialog.Builder ad = new AlertDialog.Builder(this);
		ad.setTitle(R.string.exit);
		ad.setMessage(R.string.quitTip);
		ad.setPositiveButton(R.string.ok,
				new DialogInterface.OnClickListener() {// 退出按钮
					@Override
					public void onClick(DialogInterface dialog, int i) {
						// TODO:不要采用js的退出
						contentWebView
								.loadUrl("javascript:justep.mobile.Portal.logout()");
						try {
							Thread.sleep(500);// 延迟执行，以便能调用注销方法
						} catch (InterruptedException e) {
							e.printStackTrace();
						}
						exit();
					}
				});
		ad.setNegativeButton(R.string.close,
				new DialogInterface.OnClickListener() {
					@Override
					public void onClick(DialogInterface dialog, int i) {
					}
				});
		ad.show();
		// endActivity();
	}

	/**
	 * End this activity by calling finish for activity
	 */
	public void endActivity() {
		this.activityState = ACTIVITY_EXITING;
		this.finish();
	}

	/** 初始化主页面视图 **/
	private void initContentWebView() {
		contentWebView = (WebView) this.findViewById(R.id.webView1);

		contentWebView.setWebChromeClient(new WebChromeClientEx(
				PortalActivity.this));
		contentWebView.setWebViewClient(new WebViewClientEx(this));
		contentWebView.setInitialScale(0);
		contentWebView.setScrollBarStyle(0);// 滚动条风格，为0就是不给滚动条留空间，滚动条覆盖在网页上
		contentWebView.setVerticalScrollBarEnabled(false);
		contentWebView.requestFocusFromTouch();

		// Enable JavaScript
		WebSettings settings = contentWebView.getSettings();
		settings.setJavaScriptEnabled(true);
		settings.setJavaScriptCanOpenWindowsAutomatically(true);

		// Set the nav dump for HTC
		settings.setNavDump(true);

		// 支持html5的localStorage
		settings.setDatabaseEnabled(true);
		String databasePath = this.getApplicationContext()
				.getDir("database", Context.MODE_PRIVATE).getPath();
		settings.setDatabasePath(databasePath);
		settings.setDomStorageEnabled(true);

		// Enable built-in geolocation
		settings.setGeolocationEnabled(true);

		// Clear cancel flag
		this.cancelLoadUrl = false;

		String version = android.os.Build.VERSION.RELEASE;
		if (version != null && version.indexOf("4.0") != -1) {
			this.clearCache();
		}
		contentWebView.addJavascriptInterface(new Object() {
			@SuppressWarnings("unused")
			public void eventHandle(String params) {
				appEventHandle(new AppEvent(params));
			}

			@SuppressWarnings("unused")
			public String getAndroidVersion() {
				return android.os.Build.VERSION.RELEASE;
			}

			@SuppressWarnings("unused")
			public void openAppSetting() {
				openSettingDlg();
			}

			@SuppressWarnings("unused")
			public void checkPage(String success) {
				if ("true".equalsIgnoreCase(success)) {
					loadSuccess = true;
					spinnerStop();
				} else {
					PortalActivity me = PortalActivity.this;
					me.runOnUiThread(new Runnable() {
						public void run() {
							showErrorTip("连接超时,似乎加载的页面不正常!请检查网络和配置");
							openSettingDlg();
						}
					});

				}

			}

		}, "nativeApp");
		contentWebView.addJavascriptInterface(new Object() {
			@SuppressWarnings("unused")
			public void testCall() {
				injectJSObject();
			}
		}, "justepApp");

		contentWebView
				.setDownloadListener(new JustepAppWebViewDownLoadListener());

		/**
		 * contentWebView.setWebViewClient(new WebViewClient() {
		 * 
		 * 
		 * 
		 * });
		 **/
	}

	private class JustepAppWebViewDownLoadListener implements DownloadListener {
		@Override
		public void onDownloadStart(String url, String userAgent,
				String contentDisposition, String mimetype, long contentLength) {
			Uri uri = Uri.parse(url);
			Intent intent = new Intent(Intent.ACTION_VIEW, uri);
			startActivity(intent);
			// pluginManager.exec("FileTransfer","download",null,"[url,'./justepDownload']",true);
			// pluginManager.exec("Attachment","downloadAttachment",null,"[url,'./justepDownload']",true);
		}
	}

	/** 初始化工具栏网页视图 **/
	private void initToolbarWebView() {
		toolbarWebView = (WebView) findViewById(R.id.webView2);
		toolbarWebView.getSettings().setJavaScriptEnabled(true);// 可用JS

		toolbarWebView.setScrollBarStyle(0);// 滚动条风格，为0就是不给滚动条留空间，滚动条覆盖在网页上
		toolbarWebView.setWebViewClient(new WebViewClient() {
			public boolean shouldOverrideUrlLoading(final WebView view,
					final String url) {
				if ("".equals(url) || url.equals("about:blank")
						|| url.contains("about:blank")) {
					if (url.contains("about:blank")) {
						int idx = url.indexOf("?");
						if (idx != -1) {
							appEventHandle(new AppEvent(url.substring(idx + 1)));
							Log.i("urlParams", url.substring(idx + 1));
						}
					}
					return true;
				}
				view.loadUrl(toolbarPageUrl);
				return true;
			}

		});
		toolbarWebView.setWebChromeClient(new WebChromeClient() {
			@Override
			public void onReceivedTitle(WebView view, String title) {
				super.onReceivedTitle(view, title);
				if (!title.isEmpty()
						&& (title.toLowerCase().contains("error") || title
								.equalsIgnoreCase(getResources().getString(
										R.string.fileNotFound)))) {
					// Stop "app loading" spinner if showing
					view.loadUrl("file:///android_asset/www/error.html");
				}
			}
		});
		toolbarWebView.addJavascriptInterface(new Object() {
			@SuppressWarnings("unused")
			public void testCall() {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						// 测试从js调java方法是否有问题
						toolbarWebView.loadUrl("javascript:testCall()");
					}
				});
			}

			@SuppressWarnings("unused")
			public void eventHandle(String params) {
				appEventHandle(new AppEvent(params));
			}
		}, "justepApp");
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		if (loadSuccess) {
			contentWebView.loadUrl("javascript:showSystemMenu()");
			return true;
		} else {
			menu.add(0, 0, 0, R.string.setting);
			menu.add(0, 1, 1, R.string.refresh);
			menu.add(0, 2, 2, R.string.exit);
			return super.onCreateOptionsMenu(menu);
		}
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		super.onOptionsItemSelected(item);
		switch (item.getItemId()) {
		case 0:
			openSettingDlg();
			break;
		case 1:
			pluginManager.exec("Portal", "refresh");
			break;
		case 2:
			confirmExit();
			break;
		}
		return true;
	}

	/**
	 * Cancel loadUrl before it has been loaded.
	 */
	public void cancelLoadUrl() {
		this.cancelLoadUrl = true;
	}

	@Override
	/**
	 * Called by the system when the device configuration changes while your activity is running. 
	 * 
	 * @param Configuration newConfig
	 */
	public void onConfigurationChanged(Configuration newConfig) {
		// don't reload the current page when the orientation is changed
		super.onConfigurationChanged(newConfig);
	}

	/**
	 * Get boolean property for activity.
	 * 
	 * @param name
	 * @param defaultValue
	 * @return
	 */
	public boolean getBooleanProperty(String name, boolean defaultValue) {
		Bundle bundle = this.getIntent().getExtras();
		if (bundle == null) {
			return defaultValue;
		}
		Boolean p = (Boolean) bundle.get(name);
		if (p == null) {
			return defaultValue;
		}
		return p.booleanValue();
	}

	/**
	 * Get int property for activity.
	 * 
	 * @param name
	 * @param defaultValue
	 * @return
	 */
	public int getIntegerProperty(String name, int defaultValue) {
		Bundle bundle = this.getIntent().getExtras();
		if (bundle == null) {
			return defaultValue;
		}
		Integer p = (Integer) bundle.get(name);
		if (p == null) {
			return defaultValue;
		}
		return p.intValue();
	}

	/**
	 * Get string property for activity.
	 * 
	 * @param name
	 * @param defaultValue
	 * @return
	 */
	public String getStringProperty(String name, String defaultValue) {
		Bundle bundle = this.getIntent().getExtras();
		if (bundle == null) {
			return defaultValue;
		}
		String p = bundle.getString(name);
		if (p == null) {
			return defaultValue;
		}
		return p;
	}

	/**
	 * Get double property for activity.
	 * 
	 * @param name
	 * @param defaultValue
	 * @return
	 */
	public double getDoubleProperty(String name, double defaultValue) {
		Bundle bundle = this.getIntent().getExtras();
		if (bundle == null) {
			return defaultValue;
		}
		Double p = (Double) bundle.get(name);
		if (p == null) {
			return defaultValue;
		}
		return p.doubleValue();
	}

	/**
	 * Set boolean property on activity.
	 * 
	 * @param name
	 * @param value
	 */
	public void setBooleanProperty(String name, boolean value) {
		this.getIntent().putExtra(name, value);
	}

	/**
	 * Set int property on activity.
	 * 
	 * @param name
	 * @param value
	 */
	public void setIntegerProperty(String name, int value) {
		this.getIntent().putExtra(name, value);
	}

	/**
	 * Set string property on activity.
	 * 
	 * @param name
	 * @param value
	 */
	public void setStringProperty(String name, String value) {
		this.getIntent().putExtra(name, value);
	}

	/**
	 * Set double property on activity.
	 * 
	 * @param name
	 * @param value
	 */
	public void setDoubleProperty(String name, double value) {
		this.getIntent().putExtra(name, value);
	}

	@Override
	/**
	 * Called when the system is about to start resuming a previous activity. 
	 */
	protected void onPause() {
		super.onPause();
		// Don't process pause if shutting down, since onDestroy() will be
		// called
		if (this.activityState == ACTIVITY_EXITING) {
			return;
		}
		if (contentWebView == null) {
			return;
		}
		// Send pause event to JavaScript
		// Forward to plugins
		if(this.pluginManager != null){
			this.pluginManager.onPause(this.keepRunning);
		}
		// If app doesn't want to run in background
		if (!this.keepRunning) {
			// Pause JavaScript timers (including setInterval)
			contentWebView.pauseTimers();
		}
	}

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		this.pluginManager.onNewIntent(intent);
	}

	@Override
	/**
	 * Called when the activity will start interacting with the user. 
	 */
	protected void onResume() {
		super.onResume();
		if (this.activityState == ACTIVITY_STARTING) {
			this.activityState = ACTIVITY_RUNNING;
			return;
		}

		if (contentWebView == null) {
			return;
		}

		// Send resume event to JavaScript
		// TODO :事件机制需要完善
		/*
		 * contentWebView .loadUrl(
		 * "javascript:try{JustepApp.fireDocumentEvent('resume');}catch(e){};");
		 */

		// Forward to plugins
		this.pluginManager.onResume(this.keepRunning
				|| this.activityResultKeepRunning);

		// If app doesn't want to run in background
		if (!this.keepRunning || this.activityResultKeepRunning) {

			// Restore multitasking state
			if (this.activityResultKeepRunning) {
				this.keepRunning = this.activityResultKeepRunning;
				this.activityResultKeepRunning = false;
			}

			// Resume JavaScript timers (including setInterval)
			contentWebView.resumeTimers();
		}
		if(!loadSuccess){
			loadSystem();
		}
	}

	@Override
	public void onDestroy() {
		super.onDestroy();

		if (contentWebView != null) {

			// Send destroy event to JavaScript
			contentWebView
					.loadUrl("javascript:try{justepApp.onDestroy.fire();}catch(e){};");

			// Load blank page so that JavaScript onunload is called
			contentWebView.loadUrl("about:blank");

			// Forward to plugins
			this.pluginManager.onDestroy();
		} else {
			this.endActivity();
		}
	}

	public void postMessage(String id, Object data) {
		this.pluginManager.postMessage(id, data);
	}

	/**
	 * Send JavaScript statement back to JavaScript. (This is a convenience
	 * method)
	 * 
	 * @param message
	 */
	public void execJS(String statement) {
		this.callbackServer.execJS(statement);
		// contentWebView.loadUrl("javascript:"+statement);
	}

	public void showWebPage(String url, boolean openExternal,
			boolean clearHistory, HashMap<String, Object> params) { // throws
																	// android.content.ActivityNotFoundException
																	// {
		Logger.d(TAG, "showWebPage(%s, %b, %b, HashMap", url, openExternal,
				clearHistory);

		// If loading into our webview
		if (!openExternal) {
			if (url.startsWith("file://")) {
				contentWebView.loadUrl(url);
			} else {
				Logger.w(
						TAG,
						"showWebPage: Cannot load URL into webview since it is not in white list.  Loading into browser instead. (URL="
								+ url + ")");
				try {
					Intent intent = new Intent(Intent.ACTION_VIEW);
					intent.setData(Uri.parse(url));
					this.startActivity(intent);
				} catch (android.content.ActivityNotFoundException e) {
					Logger.e(TAG, "Error loading url " + url, e);
				}
			}
		}

		// Load in default view intent
		else {
			try {
				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setData(Uri.parse(url));
				this.startActivity(intent);
			} catch (android.content.ActivityNotFoundException e) {
				Logger.e(TAG, "Error loading url " + url, e);
			}
		}
	}

	public void spinnerStart(final String title, final String message) {
		if (this.spinnerDialog == null) {
			final PortalActivity me = this;
			this.spinnerDialog = ProgressDialog.show(PortalActivity.this,
					title, message, true, true,
					new DialogInterface.OnCancelListener() {
						public void onCancel(DialogInterface dialog) {
							me.spinnerDialog = null;
						}
					});
		}
	}

	public void spinnerStop() {
		final PortalActivity me = this;
		new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Thread.sleep(2000);
				} catch (InterruptedException e) {
					
				}
				Message msg = new Message();
	            Bundle b = new Bundle();// 存放数据
	            b.putInt("loadState",2);
	            msg.setData(b);
				me.loadHandler.sendMessage(msg);
			}
		}).start();
		
	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		// If back key
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			confirmExit();
			return true;
		}

		/*
		 * TODO: 事件机制需要完善。 // If menu key else if (keyCode ==
		 * KeyEvent.KEYCODE_MENU) { contentWebView
		 * .loadUrl("javascript:justepApp.fireDocumentEvent('menubutton');");
		 * return super.onKeyDown(keyCode, event); }
		 * 
		 * // If search key else if (keyCode == KeyEvent.KEYCODE_SEARCH) {
		 * contentWebView
		 * .loadUrl("javascript:justepApp.fireDocumentEvent('searchbutton');");
		 * return true; }
		 */
		return false;
	}

	@Override
	public void startActivityForResult(Intent intent, int requestCode)
			throws RuntimeException {
		Logger.d(TAG, "JustepPortalActivity.startActivityForResult(intent,%d)",
				requestCode);
		super.startActivityForResult(intent, requestCode);
	}

	public void startActivityForResult(PluginInterface command, Intent intent,
			int requestCode) {
		this.activityResultCallback = command;
		this.activityResultKeepRunning = this.keepRunning;

		// If multitasking turned on, then disable it for activities that return
		// results
		if (command != null) {
			this.keepRunning = false;
		}

		// Start activity
		super.startActivityForResult(intent, requestCode);
	}

	@Override
	/**
	 *  old 根据requestCode处理上传
	 */
	protected void onActivityResult(int requestCode, int resultCode,
			Intent intent) {
		if (requestCode == Constants.FILECHOOSER_RESULTCODE) {
			if (null == mUploadMessage)
				return;
			Uri result = intent == null || resultCode != RESULT_OK ? null
					: intent.getData();
			mUploadMessage.onReceiveValue(result);
			mUploadMessage = null;
		} else {
			super.onActivityResult(requestCode, resultCode, intent);
			PluginInterface callback = this.activityResultCallback;
			if (callback != null) {
				callback.onActivityResult(requestCode, resultCode, intent);
			}

		}

	}

	private String getInjectJS() {
		StringBuffer sb = new StringBuffer();
		try {
			InputStreamReader inputReader = new InputStreamReader(
					getResources().getAssets().open("js/JustepApp.js"));
			BufferedReader br = new BufferedReader(inputReader);
			String line;
			while ((line = br.readLine()) != null) {
				sb.append(line);
				sb.append('\n');
			}
			return sb.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "alert('inject js error');";
	}

	public void injectJSObject() {
		runOnUiThread(new Runnable() {
			@Override
			public void run() {
				contentWebView.loadUrl("javascript:testCall();");
				String injectJS = getInjectJS();
				contentWebView.loadUrl("javascript:" + injectJS);
			}
		});
	}

	public void setActivityResultCallback(PluginInterface plugin) {
		this.activityResultCallback = plugin;
	}

	public void onReceivedError(final int errorCode, final String description,
			final String failingUrl) {
		final PortalActivity me = this;
		me.runOnUiThread(new Runnable() {
			public void run() {
				me.showWebPage("file:///android_asset/www/error.html", false,
						true, null);
				showErrorTip();
				
				me.loadSuccess = false;
				me.openSettingDlg();
			}
		});
	}

	private void loadConfiguration() {
		int id = getResources().getIdentifier("JustepApp", "xml",
				getPackageName());
		if (id == 0) {
			Logger.i("JustepAppLog", "JustepApp.xml missing. Ignoring...");
			return;
		}
		XmlResourceParser xml = getResources().getXml(id);
		int eventType = -1;
		while (eventType != XmlResourceParser.END_DOCUMENT) {
			if (eventType == XmlResourceParser.START_TAG) {
				String strNode = xml.getName();
				if (strNode.equals("preference")) {
					String name = xml.getAttributeValue(null, "name");
					String value = xml.getAttributeValue(null, "value");
					String readonlyString = xml.getAttributeValue(null,
							"readonly");

					boolean readonly = (readonlyString != null && readonlyString
							.equals("true"));

					Logger.i("JustepAppLog", "Found preference for %s", name);

					preferences.add(new PreferenceNode(name, value, readonly));
				}
			}
			try {
				eventType = xml.next();
			} catch (XmlPullParserException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	protected void showErrorTip(){
		showErrorTip("连接超时,请检查您的网络和配置信息!");
	}
	
	protected void showErrorTip(final String errorInfo) {
		if (settingDialog == null || !settingDialog.isShowing()) {
			runOnUiThread(new Runnable(){
				@Override
				public void run() {
					Toast toast = Toast.makeText(PortalActivity.this, errorInfo,
							Toast.LENGTH_LONG);
					toast.setGravity(Gravity.CENTER, 0, -50);
					toast.show();
				}
			});
		}	
	}

}
