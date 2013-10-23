/*
       Licensed to the Apache Software Foundation (ASF) under one

       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */
package com.justep.mobile.utils.command;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

import com.justep.mobile.PortalActivity;
import com.justep.mobile.api.CommandCallback;
import com.justep.mobile.api.PluginAbstractImpl;

/**
 * @author 007slm(007slm@163.com) 加速度监听类 acceleration values x,y,z.
 */
public class AccelListener extends PluginAbstractImpl implements
		SensorEventListener {

	public static int STOPPED = 0;
	public static int STARTING = 1;
	public static int RUNNING = 2;
	public static int ERROR_FAILED_TO_START = 3;

	public float TIMEOUT = 30000; // Timeout in msec to shut off listener

	float x, y, z; // most recent acceleration values
	long timestamp; // time of most recent value
	int status; // status of listener
	long lastAccessTime; // time the value was last retrieved

	private SensorManager sensorManager;// Sensor manager
	Sensor mSensor; // Acceleration sensor returned by sensor manager

	public AccelListener() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.timestamp = 0;
		this.setStatus(AccelListener.STOPPED);
	}

	public void setContext(PortalActivity ctx) {
		super.setContext(ctx);
		this.sensorManager = (SensorManager) ctx
				.getSystemService(Context.SENSOR_SERVICE);
	}

	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";

		try {
			if (action.equals("getStatus")) {
				int i = this.getStatus();
				return new CommandCallback(status, i);
			} else if (action.equals("start")) {
				int i = this.start();
				return new CommandCallback(status, i);
			} else if (action.equals("stop")) {
				this.stop();
				return new CommandCallback(status, 0);
			} else if (action.equals("getAcceleration")) {
				// If not running, then this is an async call, so don't worry
				// about waiting
				if (this.status != AccelListener.RUNNING) {
					int r = this.start();
					if (r == AccelListener.ERROR_FAILED_TO_START) {
						return new CommandCallback(
								CommandCallback.Status.IO_EXCEPTION,
								AccelListener.ERROR_FAILED_TO_START);
					}
					// Wait until running
					long timeout = 2000;
					while ((this.status == STARTING) && (timeout > 0)) {
						timeout = timeout - 100;
						try {
							Thread.sleep(100);
						} catch (InterruptedException e) {
							e.printStackTrace();
						}
					}
					if (timeout == 0) {
						return new CommandCallback(
								CommandCallback.Status.IO_EXCEPTION,
								AccelListener.ERROR_FAILED_TO_START);
					}
				}
				this.lastAccessTime = System.currentTimeMillis();
				JSONObject r = new JSONObject();
				r.put("x", this.x);
				r.put("y", this.y);
				r.put("z", this.z);
				r.put("timestamp", this.timestamp);
				return new CommandCallback(status, r);
			} else if (action.equals("setTimeout")) {
				try {
					float timeout = Float.parseFloat(args.getString(0));
					this.setTimeout(timeout);
					return new CommandCallback(status, 0);
				} catch (NumberFormatException e) {
					status = CommandCallback.Status.INVALID_ACTION;
					e.printStackTrace();
				} catch (JSONException e) {
					status = CommandCallback.Status.JSON_EXCEPTION;
					e.printStackTrace();
				}
			} else if (action.equals("getTimeout")) {
				float f = this.getTimeout();
				return new CommandCallback(status, f);
			}
			return new CommandCallback(status, result);
		} catch (JSONException e) {
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}

	public boolean isJsonMode(String action) {
		if (action.equals("getStatus")) {
			return true;
		} else if (action.equals("getAcceleration")) {
			// Can only return value if RUNNING
			if (this.status == RUNNING) {
				return true;
			}
		} else if (action.equals("getTimeout")) {
			return true;
		}
		return false;
	}

	public void onDestroy() {
		this.stop();
	}

	/**
	 * 
	 * 开始监听设备加速度
	 * 
	 * @return status of listener
	 */
	public int start() {

		if ((this.status == AccelListener.RUNNING)
				|| (this.status == AccelListener.STARTING)) {
			return this.status;
		}

		List<Sensor> list = this.sensorManager
				.getSensorList(Sensor.TYPE_ACCELEROMETER);

		if ((list != null) && (list.size() > 0)) {
			this.mSensor = list.get(0);
			this.sensorManager.registerListener(this, this.mSensor,
					SensorManager.SENSOR_DELAY_FASTEST);
			this.setStatus(AccelListener.STARTING);
			this.lastAccessTime = System.currentTimeMillis();
		} else {
			this.setStatus(AccelListener.ERROR_FAILED_TO_START);
		}

		return this.status;
	}

	/**
	 * 停止监听
	 */
	public void stop() {
		if (this.status != AccelListener.STOPPED) {
			this.sensorManager.unregisterListener(this);
		}
		this.setStatus(AccelListener.STOPPED);
	}

	/**
	 * 当传感器灵敏度变化时
	 * 
	 * @param sensor
	 * @param accuracy
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
	}

	public void onSensorChanged(SensorEvent event) {

		// Only look at accelerometer events
		if (event.sensor.getType() != Sensor.TYPE_ACCELEROMETER) {
			return;
		}

		// If not running, then just return
		if (this.status == AccelListener.STOPPED) {
			return;
		}

		// Save time that event was received
		this.timestamp = System.currentTimeMillis();
		this.x = event.values[0];
		this.y = event.values[1];
		this.z = event.values[2];

		this.setStatus(AccelListener.RUNNING);

		// If values haven't been read for TIMEOUT time, then turn off
		// accelerometer sensor to save power
		if ((this.timestamp - this.lastAccessTime) > this.TIMEOUT) {
			this.stop();
		}
	}

	/**
	 * 设置调用getX()的超时时间，如果超时调用不到就关闭传感器
	 * 
	 * @param timeout
	 *            Timeout in msec.
	 */
	public void setTimeout(float timeout) {
		this.TIMEOUT = timeout;
	}

	public float getTimeout() {
		return this.TIMEOUT;
	}

	/**
	 * 
	 * 设置发送到js的状态
	 * 
	 * @param status
	 */
	private void setStatus(int status) {
		this.status = status;
	}

	public int getStatus() {
		return this.status;
	}

}
