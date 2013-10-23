package com.justep.mobile.utils.command;

import java.io.File;
import java.io.IOException;

import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaRecorder;
import android.os.Environment;
import android.util.Log;

/**
 * @author 007slm(007slm@163.com) AudioPlayer 一个player实例同时只能播放或者录音一个file
 * 
 * 
 *         异步返回的(通过execJs来回调)
 */
public class AudioPlayer implements OnCompletionListener, OnPreparedListener,
		OnErrorListener {

	private static final String LOG_TAG = "AudioPlayer";

	// AudioPlayer states
	public static int MEDIA_NONE = 0;
	public static int MEDIA_STARTING = 1;
	public static int MEDIA_RUNNING = 2;
	public static int MEDIA_PAUSED = 3;
	public static int MEDIA_STOPPED = 4;

	// AudioPlayer message ids
	private static int MEDIA_STATE = 1;
	private static int MEDIA_DURATION = 2;
	private static int MEDIA_POSITION = 3;
	private static int MEDIA_ERROR = 9;

	// Media error codes
	private static int MEDIA_ERR_NONE_ACTIVE = 0;
	private static int MEDIA_ERR_ABORTED = 1;
	private static int MEDIA_ERR_NETWORK = 2;
	private static int MEDIA_ERR_DECODE = 3;
	private static int MEDIA_ERR_NONE_SUPPORTED = 4;

	private AudioHandler handler; // The AudioHandler object
	private String id; // The id of this player (used to identify Media object
						// in JavaScript)
	private int state = MEDIA_NONE; // State of recording or playback
	private String audioFile = null; // File name to play or record to
	private float duration = -1; // Duration of audio

	private MediaRecorder recorder = null; // Audio recording object
	private String tempFile = null; // Temporary recording file name

	private MediaPlayer mPlayer = null; // Audio player object
	private boolean prepareOnly = false;

	public AudioPlayer(AudioHandler handler, String id) {
		this.handler = handler;
		this.id = id;
		this.tempFile = Environment.getExternalStorageDirectory()
				.getAbsolutePath() + "/tmprecording.mp3";
	}

	public void destroy() {

		// Stop any play or record
		if (this.mPlayer != null) {
			if ((this.state == MEDIA_RUNNING) || (this.state == MEDIA_PAUSED)) {
				this.mPlayer.stop();
				this.setState(MEDIA_STOPPED);
			}
			this.mPlayer.release();
			this.mPlayer = null;
		}
		if (this.recorder != null) {
			this.stopRecording();
			this.recorder.release();
			this.recorder = null;
		}
	}

	public void startRecording(String file) {
		if (this.mPlayer != null) {
			Log.d(LOG_TAG, "AudioPlayer Error: Can't record in play mode.");
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
		}

		// Make sure we're not already recording
		else if (this.recorder == null) {
			this.audioFile = file;
			this.recorder = new MediaRecorder();
			this.recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
			this.recorder.setOutputFormat(MediaRecorder.OutputFormat.DEFAULT); // THREE_GPP);
			this.recorder.setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT); // AMR_NB);
			this.recorder.setOutputFile(this.tempFile);
			try {
				this.recorder.prepare();
				this.recorder.start();
				this.setState(MEDIA_RUNNING);
				return;
			} catch (IllegalStateException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
		} else {
			Log.d(LOG_TAG, "AudioPlayer Error: Already recording.");
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
		}
	}

	/**
	 * 
	 * 移动临时记录文件到指定名字的地方
	 * 
	 * @param file
	 */
	public void moveFile(String file) {

		/* this is a hack to save the file as the specified name */
		File f = new File(this.tempFile);
		f.renameTo(new File("/sdcard/" + file));
	}

	/**
	 * 停止录音并保存
	 */
	public void stopRecording() {
		if (this.recorder != null) {
			try {
				if (this.state == MEDIA_RUNNING) {
					this.recorder.stop();
					this.setState(MEDIA_STOPPED);
				}
				this.moveFile(this.audioFile);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	public void startPlaying(String file) {
		if (this.recorder != null) {
			Log.d(LOG_TAG, "AudioPlayer Error: Can't play in record mode.");
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
		}

		// If this is a new request to play audio, or stopped
		else if ((this.mPlayer == null) || (this.state == MEDIA_STOPPED)) {
			try {
				// If stopped, then reset player
				if (this.mPlayer != null) {
					this.mPlayer.reset();
				}
				// Otherwise, create a new one
				else {
					this.mPlayer = new MediaPlayer();
				}
				this.audioFile = file;

				// If streaming file
				if (this.isStreaming(file)) {
					this.mPlayer.setDataSource(file);
					this.mPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
					this.setState(MEDIA_STARTING);
					this.mPlayer.setOnPreparedListener(this);
					this.mPlayer.prepareAsync();
				}

				// If local file
				else {
					if (file.startsWith("/android_asset/")) {
						String f = file.substring(15);
						android.content.res.AssetFileDescriptor fd = this.handler.ctx
								.getBaseContext().getAssets().openFd(f);
						this.mPlayer.setDataSource(fd.getFileDescriptor(),
								fd.getStartOffset(), fd.getLength());
					} else {
						this.mPlayer.setDataSource("/sdcard/" + file);
					}
					this.setState(MEDIA_STARTING);
					this.mPlayer.setOnPreparedListener(this);
					this.mPlayer.prepare();

					// Get duration
					this.duration = getDurationInSeconds();
				}
			} catch (Exception e) {
				e.printStackTrace();
				this.handler
						.execJS("JustepApp.Media.onStatus('" + this.id + "', "
								+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
			}
		}

		// If we have already have created an audio player
		else {

			// If player has been paused, then resume playback
			if ((this.state == MEDIA_PAUSED) || (this.state == MEDIA_STARTING)) {
				this.mPlayer.start();
				this.setState(MEDIA_RUNNING);
			} else {
				Log.d(LOG_TAG,
						"AudioPlayer Error: startPlaying() called during invalid state: "
								+ this.state);
				this.handler
						.execJS("JustepApp.Media.onStatus('" + this.id + "', "
								+ MEDIA_ERROR + ", " + MEDIA_ERR_ABORTED + ");");
			}
		}
	}

	public void seekToPlaying(int milliseconds) {
		if (this.mPlayer != null) {
			this.mPlayer.seekTo(milliseconds);
			Log.d(LOG_TAG, "Send a onStatus update for the new seek");
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_POSITION + ", " + milliseconds / 1000.0f + ");");
		}
	}

	public void pausePlaying() {

		// If playing, then pause
		if (this.state == MEDIA_RUNNING) {
			this.mPlayer.pause();
			this.setState(MEDIA_PAUSED);
		} else {
			Log.d(LOG_TAG,
					"AudioPlayer Error: pausePlaying() called during invalid state: "
							+ this.state);
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_NONE_ACTIVE + ");");
		}
	}

	public void stopPlaying() {
		if ((this.state == MEDIA_RUNNING) || (this.state == MEDIA_PAUSED)) {
			this.mPlayer.stop();
			this.setState(MEDIA_STOPPED);
		} else {
			Log.d(LOG_TAG,
					"AudioPlayer Error: stopPlaying() called during invalid state: "
							+ this.state);
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_ERROR + ", " + MEDIA_ERR_NONE_ACTIVE + ");");
		}
	}

	/**
	 * 播放完成
	 * 
	 * @param mPlayer
	 *            收到播放完成时间的player
	 */
	public void onCompletion(MediaPlayer mPlayer) {
		this.setState(MEDIA_STOPPED);
	}

	public long getCurrentPosition() {
		if ((this.state == MEDIA_RUNNING) || (this.state == MEDIA_PAUSED)) {
			int curPos = this.mPlayer.getCurrentPosition();
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_POSITION + ", " + curPos / 1000.0f + ");");
			return curPos;
		} else {
			return -1;
		}
	}

	public boolean isStreaming(String file) {
		if (file.contains("http://") || file.contains("https://")) {
			return true;
		} else {
			return false;
		}
	}

	public float getDuration(String file) {

		// Can't get duration of recording
		if (this.recorder != null) {
			return (-2); // not allowed
		}

		// If audio file already loaded and started, then return duration
		if (this.mPlayer != null) {
			return this.duration;
		}

		// If no player yet, then create one
		else {
			this.prepareOnly = true;
			this.startPlaying(file);

			// This will only return value for local, since streaming
			// file hasn't been read yet.
			return this.duration;
		}
	}

	/**
	 * 准备好播放后被调用
	 * 
	 * @param mPlayer
	 */
	public void onPrepared(MediaPlayer mPlayer) {
		// Listen for playback completion
		this.mPlayer.setOnCompletionListener(this);

		// If start playing after prepared
		if (!this.prepareOnly) {

			// Start playing
			this.mPlayer.start();

			// Set player init flag
			this.setState(MEDIA_RUNNING);
		}

		// Save off duration
		this.duration = getDurationInSeconds();
		this.prepareOnly = false;

		// Send status notification to JavaScript
		this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
				+ MEDIA_DURATION + "," + this.duration + ");");

	}

	/**
	 * By default Android returns the length of audio in mills but we want
	 * seconds
	 * 
	 * @return length of clip in seconds
	 */
	private float getDurationInSeconds() {
		return (this.mPlayer.getDuration() / 1000.0f);
	}

	/**
	 * 
	 * @param mPlayer
	 *            the MediaPlayer the error pertains to
	 * @param errorType
	 *            the type of error that has occurred: (MEDIA_ERROR_UNKNOWN,
	 *            MEDIA_ERROR_SERVER_DIED)
	 * @param errorCode
	 *            an extra code, specific to the error.
	 */
	public boolean onError(MediaPlayer mPlayer, int errorType, int errorCode) {
		Log.d(LOG_TAG, "AudioPlayer.onError(" + errorType + ", " + errorCode
				+ ")");

		// TODO: Not sure if this needs to be sent?
		this.mPlayer.stop();
		this.mPlayer.release();

		// Send error notification to JavaScript
		this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
				+ MEDIA_ERROR + ", " + errorType + ");");
		return false;
	}

	private void setState(int state) {
		if (this.state != state) {
			this.handler.execJS("JustepApp.Media.onStatus('" + this.id + "', "
					+ MEDIA_STATE + ", " + state + ");");
		}

		this.state = state;
	}

	public int getState() {
		return this.state;
	}

	public void setVolume(float volume) {
		this.mPlayer.setVolume(volume, volume);
	}
}
