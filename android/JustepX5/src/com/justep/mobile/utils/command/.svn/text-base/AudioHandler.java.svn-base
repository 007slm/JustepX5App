package com.justep.mobile.utils.command;

import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.media.AudioManager;

import com.justep.mobile.api.PluginAbstractImpl;
import com.justep.mobile.api.CommandCallback;

/**
 * @author 007slm(007slm@163.com) 播放或录音(audioPlayer)的辅助类 音频文件可能来自本地或者http流 Audio
 *         formats supported (已经测试过的): .mp3, .wav
 * 
 *         本地音频文件支持位置: android_asset: /android_asset/sound.mp3 sdcard: sound.mp3
 */
public class AudioHandler extends PluginAbstractImpl {

	public static String TAG = "AudioHandler";
	HashMap<String, AudioPlayer> players; // Audio player object
	ArrayList<AudioPlayer> pausedForPhone; // Audio players that were paused
											// when phone call came in

	public AudioHandler() {
		this.players = new HashMap<String, AudioPlayer>();
		this.pausedForPhone = new ArrayList<AudioPlayer>();
	}

	public CommandCallback execute(String action, JSONArray args,
			String callbackId) {
		CommandCallback.Status status = CommandCallback.Status.OK;
		String result = "";

		try {
			if (action.equals("startRecordingAudio")) {
				this.startRecordingAudio(args.getString(0), args.getString(1));
			} else if (action.equals("stopRecordingAudio")) {
				this.stopRecordingAudio(args.getString(0));
			} else if (action.equals("startPlayingAudio")) {
				this.startPlayingAudio(args.getString(0), args.getString(1));
			} else if (action.equals("seekToAudio")) {
				this.seekToAudio(args.getString(0), args.getInt(1));
			} else if (action.equals("pausePlayingAudio")) {
				this.pausePlayingAudio(args.getString(0));
			} else if (action.equals("stopPlayingAudio")) {
				this.stopPlayingAudio(args.getString(0));
			} else if (action.equals("setVolume")) {
				try {
					this.setVolume(args.getString(0),
							Float.parseFloat(args.getString(1)));
				} catch (NumberFormatException nfe) {
					// no-op
				}
			} else if (action.equals("getCurrentPositionAudio")) {
				float f = this.getCurrentPositionAudio(args.getString(0));
				return new CommandCallback(status, f);
			} else if (action.equals("getDurationAudio")) {
				float f = this.getDurationAudio(args.getString(0),
						args.getString(1));
				return new CommandCallback(status, f);
			} else if (action.equals("release")) {
				boolean b = this.release(args.getString(0));
				return new CommandCallback(status, b);
			}
			return new CommandCallback(status, result);
		} catch (JSONException e) {
			e.printStackTrace();
			return new CommandCallback(CommandCallback.Status.JSON_EXCEPTION);
		}
	}

	public boolean isJsonMode(String action) {
		if (action.equals("getCurrentPositionAudio")) {
			return true;
		} else if (action.equals("getDurationAudio")) {
			return true;
		}
		return false;
	}

	public void onDestroy() {
		for (AudioPlayer audio : this.players.values()) {
			audio.destroy();
		}
		this.players.clear();
	}

	public void onMessage(String id, Object data) {
		// If phone message
		if (id.equals("telephone")) {
			// If phone ringing, then pause playing
			if ("ringing".equals(data) || "offhook".equals(data)) {

				// Get all audio players and pause them
				for (AudioPlayer audio : this.players.values()) {
					if (audio.getState() == AudioPlayer.MEDIA_RUNNING) {
						this.pausedForPhone.add(audio);
						audio.pausePlaying();
					}
				}

			}
			// If phone idle, then resume playing those players we paused
			else if ("idle".equals(data)) {
				for (AudioPlayer audio : this.pausedForPhone) {
					audio.startPlaying(null);
				}
				this.pausedForPhone.clear();
			}
		}
	}

	/**
	 * 释放player来释放内存
	 * 
	 * @param id
	 *            The id of the audio player
	 */
	private boolean release(String id) {
		if (!this.players.containsKey(id)) {
			return false;
		}
		AudioPlayer audio = this.players.get(id);
		this.players.remove(id);
		audio.destroy();
		return true;
	}

	public void startRecordingAudio(String id, String file) {
		// If already recording, then just return;
		if (this.players.containsKey(id)) {
			return;
		}
		AudioPlayer audio = new AudioPlayer(this, id);
		this.players.put(id, audio);
		audio.startRecording(file);
	}

	public void stopRecordingAudio(String id) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			audio.stopRecording();
			this.players.remove(id);
		}
	}

	public void startPlayingAudio(String id, String file) {
		AudioPlayer audio = this.players.get(id);
		if (audio == null) {
			audio = new AudioPlayer(this, id);
			this.players.put(id, audio);
		}
		audio.startPlaying(file);
	}

	public void seekToAudio(String id, int milliseconds) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			audio.seekToPlaying(milliseconds);
		}
	}

	public void pausePlayingAudio(String id) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			audio.pausePlaying();
		}
	}

	public void stopPlayingAudio(String id) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			audio.stopPlaying();
			// audio.destroy();
			// this.players.remove(id);
		}
	}

	/**
	 * 
	 * 当前进度
	 * 
	 * @param id
	 *            The id of the audio player
	 * @return position in msec
	 */
	public float getCurrentPositionAudio(String id) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			return (audio.getCurrentPosition() / 1000.0f);
		}
		return -1;
	}

	/**
	 * Get the duration of the audio file. 总时间
	 * 
	 * @param id
	 *            The id of the audio player
	 * @param file
	 *            The name of the audio file.
	 * @return The duration in msec.
	 */
	public float getDurationAudio(String id, String file) {

		// Get audio file
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			return (audio.getDuration(file));
		}

		// If not already open, then open the file
		else {
			audio = new AudioPlayer(this, id);
			this.players.put(id, audio);
			return (audio.getDuration(file));
		}
	}

	/**
	 * 音频输出设备
	 * 
	 * @param output
	 *            1=earpiece(耳机), 2=speaker(外音)
	 */
	public void setAudioOutputDevice(int output) {
		AudioManager audiMgr = (AudioManager) this.ctx
				.getSystemService(Context.AUDIO_SERVICE);
		if (output == 2) {
			audiMgr.setRouting(AudioManager.MODE_NORMAL,
					AudioManager.ROUTE_SPEAKER, AudioManager.ROUTE_ALL);
		} else if (output == 1) {
			audiMgr.setRouting(AudioManager.MODE_NORMAL,
					AudioManager.ROUTE_EARPIECE, AudioManager.ROUTE_ALL);
		} else {
			System.out
					.println("AudioHandler.setAudioOutputDevice() Error: Unknown output device.");
		}
	}

	public int getAudioOutputDevice() {
		AudioManager audiMgr = (AudioManager) this.ctx
				.getSystemService(Context.AUDIO_SERVICE);
		if (audiMgr.getRouting(AudioManager.MODE_NORMAL) == AudioManager.ROUTE_EARPIECE) {
			return 1;
		} else if (audiMgr.getRouting(AudioManager.MODE_NORMAL) == AudioManager.ROUTE_SPEAKER) {
			return 2;
		} else {
			return -1;
		}
	}

	public void setVolume(String id, float volume) {
		AudioPlayer audio = this.players.get(id);
		if (audio != null) {
			audio.setVolume(volume);
		} else {
			System.out
					.println("AudioHandler.setVolume() Error: Unknown Audio Player "
							+ id);
		}
	}
}
