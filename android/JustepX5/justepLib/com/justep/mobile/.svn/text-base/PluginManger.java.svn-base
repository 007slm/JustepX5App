package com.justep.mobile;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Intent;
import android.util.Log;
import android.webkit.WebView;

import com.justep.mobile.api.CommandCallback;
import com.justep.mobile.api.PluginInterface;

/**
 * @author 007slm(007slm@163.com)
 * 
 * PluginManager is exposed to JavaScript in the JustepApp WebView.
 * Calling native plugin code can be done by calling PluginManager.exec(...)
 * from JavaScript.
 */
public final class PluginManger {
	
	private HashMap<String, PluginInterface> plugins = new HashMap<String,PluginInterface>();
	private final PortalActivity ctx;
	private final WebView appWebView;
	
    protected HashMap<String, String> pluginMap = new HashMap<String,String>();

	public PluginManger(PortalActivity ctx) {
		this.ctx = ctx;
		this.appWebView = ctx.contentWebView;
	}
	
	public void reinit() {
	    this.onPause(false);
	    this.onDestroy();
	    this.plugins = new HashMap<String, PluginInterface>();
	}
	
	public String exec(final String className, final String action, final boolean async) {
		return this.exec(className, action, "", "[]", async);
	}
	

	public String exec(final String className, final String action) {
		return this.exec(className, action, "", "[]", false);
	}
	
	/**
	 * Receives a request for execution and fulfills it by finding the appropriate
	 * Java class and calling it's execute method.
	 * 
	 * PluginManager.exec can be used either synchronously or async. In either case, a JSON encoded 
	 * string is returned that will indicate if any errors have occurred when trying to find
	 * or execute the class denoted by the clazz argument.
	 * 
	 * @param service 		String containing the service to run
	 * @param action 		String containt the action that the class is supposed to perform. This is
	 * 						passed to the plugin execute method and it is up to the plugin developer 
	 * 						how to deal with it.
	 * @param callbackId 	String containing the id of the callback that is execute in JavaScript if
	 * 						this is an async plugin call.
	 * @param args 			An Array literal string containing any arguments needed in the
	 * 						plugin execute method.
	 * @param async 		Boolean indicating whether the calling JavaScript code is expecting an
	 * 						immediate return value. If true, either JustepApp.callbackSuccess(...) or 
	 * 						JustepApp.callbackError(...) is called once the plugin code has executed.
	 * 
	 * @return 				JSON encoded string with a response message and status.
	 */
	public String exec(final String className, final String action, final String callbackId, final String jsonArgs, final boolean async) {
		CommandCallback cr = null;
		boolean runAsync = async;
		try {
			final JSONArray args = new JSONArray(jsonArgs);
			final PluginInterface plugin = this.getPlugin(className);
			final PortalActivity ctx = this.ctx;
			if (plugin != null) {
				runAsync = async && !plugin.isJsonMode(action);
				if (runAsync) {
					// Run this on a different thread so that this one can return back to JS
					try {
						// Call execute on the plugin so that it can do it's thing
						cr = plugin.execute(action, args, callbackId);
						int status = cr.getStatus();

						// If no result to be sent and keeping callback, then no need to sent back to JavaScript
						if ((status == CommandCallback.Status.NO_RESULT.ordinal()) && cr.getKeepCallback()) {
							return "";	
						}

						// Check the success (OK, NO_RESULT & !KEEP_CALLBACK)
						else if ((status == CommandCallback.Status.OK.ordinal()) || (status == CommandCallback.Status.NO_RESULT.ordinal())) {
							return cr.onSuccessString(callbackId);
						} 
						
						// If error
						else {
							return cr.onSuccessString(callbackId);
						}
					} catch (Exception e) {
						cr = new CommandCallback(CommandCallback.Status.ERROR, e.getMessage());
						return cr.onErrorString(callbackId);
					}
				} else {
					// Call execute on the plugin so that it can do it's thing
					cr = plugin.execute(action, args, callbackId);
					// If no result to be sent and keeping callback, then no need to sent back to JavaScript
					if ((cr.getStatus() == CommandCallback.Status.NO_RESULT.ordinal()) && cr.getKeepCallback()) {
						return "";
					}
				}
			}
		} catch (JSONException e) {
			System.out.println("ERROR: "+e.toString());
			cr = new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
		// if async we have already returned at this point unless there was an error...
		if (runAsync) {
			if (cr == null) {
				cr = new CommandCallback(CommandCallback.Status.CLASS_NOT_FOUND_EXCEPTION);				
			}
			return cr.onErrorString(callbackId);
		}
		return ( cr != null ? cr.getJSONString() : "{ status: 0, message: 'all good' }" );
	}
	
	/**
	 * Get the class.
	 * 
	 * @param clazz
	 * @return
	 * @throws ClassNotFoundException
	 */
	@SuppressWarnings("unchecked")
	private Class getClassByName(final String pluginName) throws ClassNotFoundException {
		String clazz = pluginMap.get(pluginName);
		Class c = null;
		if (clazz != null) {
			c = Class.forName(clazz);
		}else{
			c = Class.forName("com.justep.mobile.utils.command."+pluginName);
		}
		return c;
	}

	/**
	 * Get the interfaces that a class implements and see if it implements the
	 * com.justep.mobile.api.Plugin interface.
	 * 
	 * @param c The class to check the interfaces of.
	 * @return Boolean indicating if the class implements com.justep.mobile.api.Plugin
	 */
	@SuppressWarnings("unchecked")
	private boolean isJustepAppPlugin(Class c) {
		if (c != null) {
			return com.justep.mobile.api.PluginAbstractImpl.class.isAssignableFrom(c) || com.justep.mobile.api.PluginInterface.class.isAssignableFrom(c);
		}
		return false;
	}

    /**
     * Add plugin to be loaded and cached.  This creates an instance of the plugin.
     * If plugin is already created, then just return it.
     * 
     * @param className				The class to load
     * @param clazz					The class object (must be a class object of the className)
     * @param callbackId			The callback id to use when calling back into JavaScript
     * @return						The plugin
     */
	@SuppressWarnings("unchecked")
	private PluginInterface addPlugin(String pluginName, String className) {
		try {
			
			Class c = getClassByName(className);
			if (isJustepAppPlugin(c)) {
				PluginInterface plugin = (PluginInterface)c.newInstance();
				this.plugins.put(className, plugin);
				plugin.setContext(this.ctx);
				plugin.setWebView(this.appWebView);
				return plugin;
			}
    	} catch (Exception e) {
    		  e.printStackTrace();
    		  System.out.println("Error adding plugin "+className+".");
    	}
    	return null;
    }
    
    /**
     * Get the loaded plugin.
     * 
     * If the plugin is not already loaded then load it.
     * 
     * @param className				The class of the loaded plugin.
     * @return
     */
    private PluginInterface getPlugin(String pluginName) {
		
    	if (this.plugins.containsKey(pluginName)) {
    		return this.plugins.get(pluginName);
    	} else {
	    	return this.addPlugin(pluginName, pluginName);
	    }
    }
    
    
    /**
     * Called when the system is about to start resuming a previous activity. 
     * 
     * @param multitasking		Flag indicating if multitasking is turned on for app
     */
    public void onPause(boolean multitasking) {
        for (PluginInterface plugin : this.plugins.values()) {
            plugin.onPause(multitasking);
        }
    }
    
    /**
     * Called when the activity will start interacting with the user. 
     * 
     * @param multitasking		Flag indicating if multitasking is turned on for app
     */
    public void onResume(boolean multitasking) {
        for (PluginInterface plugin : this.plugins.values()) {
            plugin.onResume(multitasking);
        }
    }

    /**
     * The final call you receive before your activity is destroyed. 
     */
    public void onDestroy() {
        for (PluginInterface plugin : this.plugins.values()) {
            plugin.onDestroy();
        }
    }

    /**
     * Send a message to all plugins. 
     * 
     * @param id            The message id
     * @param data          The message data
     */
    public void postMessage(String id, Object data) {
        for (PluginInterface plugin : this.plugins.values()) {
            plugin.onMessage(id, data);
        }
    }

    /**
     * Called when the activity receives a new intent. 
     */    
    public void onNewIntent(Intent intent) {
        for (PluginInterface plugin : this.plugins.values()) {
            plugin.onNewIntent(intent);
        }
    }

    /**
     * Called when the URL of the webview changes.
     * 
     * @param url The URL that is being changed to.
     * @return Return false to allow the URL to load, return true to prevent the URL from loading.
     */
    public boolean onOverrideUrlLoading(String url) {
    	if(!url.isEmpty() && url.toLowerCase().startsWith("justepApp")){
    		Iterator<Entry<String, String>> it = this.pluginMap.entrySet().iterator();
            while (it.hasNext()) {
                HashMap.Entry<String, String> pairs = it.next();
                if (url.startsWith(pairs.getKey())) {
                	return this.getPlugin(pairs.getValue()).onOverrideUrlLoading(url);
                }
            }
    	}
    	return false;
    }
	
}
