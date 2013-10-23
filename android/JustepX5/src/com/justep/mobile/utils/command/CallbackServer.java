package com.justep.mobile.utils.command;

import java.io.UnsupportedEncodingException;

import com.justep.mobile.PortalActivity;

/**
 * 
 * 
 * @author 007slm(007slm@163.com) 参考其他开源框架保留的一种js通知方案，暂时保留，并不作为默认实现方案
 * 
 */
public class CallbackServer{

	
	private boolean active;
	
	private PortalActivity ctx;

	/**
	 * Constructor.
	 */
	public CallbackServer(PortalActivity ctx) {
		// System.out.println("CallbackServer()");
		this.ctx = ctx;
	}

	public void init(String url) {
		this.active = false;
		//x5 暂时不支持从本地加载 所以一直采用callbackServer
		if ((url != null) && !url.startsWith("file://")) {
			this.startServer();
		}
	}

	/**
	 * Re-init when loading a new HTML page into webview.
	 * 
	 * @param url
	 *            The URL of the JustepApp app being loaded
	 */
	public void reinit(String url) {
		this.stopServer();
		this.init(url);
	}

	public void startServer() {
		this.active = true;
		// System.out.println("CallbackServer.startServer()");
	}

	/**
	 * Restart the server on a new thread.
	 */
	public void restartServer() {

		// Stop server
		this.stopServer();

		// Start server again
		this.startServer();
	}

	/**
	 * Stop server. This stops the thread that the server is running on.
	 */
	public void stopServer() {
		this.active = false;
	}

	/**
	 * Destroy
	 */
	public void destroy() {
		this.stopServer();
	}

	/**
	 * Add a JavaScript statement to the list.
	 * 
	 * @param statement
	 */
	public void execJS(String statement) {
		try {
			if(this.active){
				ctx.contentWebView.loadUrl("javascript:" + encode(statement, "UTF-8"));
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}

	static final String digits = "0123456789ABCDEF";

	/**
	 * This will encode the return value to JavaScript. We revert the encoding
	 * for common characters that don't require encoding to reduce the size of
	 * the string being passed to JavaScript.
	 * 
	 * @param s
	 *            to be encoded
	 * @param enc
	 *            encoding type
	 * @return encoded string
	 */
	public static String encode(String s, String enc)
			throws UnsupportedEncodingException {
		if (s == null || enc == null) {
			throw new NullPointerException();
		}
		// check for UnsupportedEncodingException
		"".getBytes(enc);

		// Guess a bit bigger for encoded form
		StringBuilder buf = new StringBuilder(s.length() + 16);
		int start = -1;
		for (int i = 0; i < s.length(); i++) {
			char ch = s.charAt(i);
			if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
					|| (ch >= '0' && ch <= '9')
					|| " .-*_'(),<>=?@[]{}:~\"\\/;!".indexOf(ch) > -1) {
				if (start >= 0) {
					convert(s.substring(start, i), buf, enc);
					start = -1;
				}
				if (ch != ' ') {
					buf.append(ch);
				} else {
					buf.append(' ');
				}
			} else {
				if (start < 0) {
					start = i;
				}
			}
		}
		if (start >= 0) {
			convert(s.substring(start, s.length()), buf, enc);
		}
		return buf.toString();
	}

	private static void convert(String s, StringBuilder buf, String enc)
			throws UnsupportedEncodingException {
		byte[] bytes = s.getBytes(enc);
		for (int j = 0; j < bytes.length; j++) {
			buf.append('%');
			buf.append(digits.charAt((bytes[j] & 0xf0) >> 4));
			buf.append(digits.charAt(bytes[j] & 0xf));
		}
	}

	/* end */
}
