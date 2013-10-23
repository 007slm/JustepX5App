//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//
#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>

#import "JustepAppPlugin.h"


enum MediaError {
	MEDIA_ERR_ABORTED = 1,
	MEDIA_ERR_NETWORK = 2,
	MEDIA_ERR_DECODE = 3,
	MEDIA_ERR_NONE_SUPPORTED = 4
};
typedef NSUInteger MediaError;

enum MediaStates {
	MEDIA_NONE = 0,
	MEDIA_STARTING = 1,
	MEDIA_RUNNING = 2,
	MEDIA_PAUSED = 3,
	MEDIA_STOPPED = 4
};
typedef NSUInteger MediaStates;

enum MediaMsg {
	MEDIA_STATE = 1,
	MEDIA_DURATION = 2,
    MEDIA_POSITION = 3,
	MEDIA_ERROR = 9
};
typedef NSUInteger MediaMsg;

@interface AudioPlayer : AVAudioPlayer
{
	NSString* mediaId;
}
@property (nonatomic,copy) NSString* mediaId;
@end

#ifdef __IPHONE_3_0
@interface AudioRecorder : AVAudioRecorder
{
	NSString* mediaId;
}
@property (nonatomic,copy) NSString* mediaId;
@end
#endif
	
@interface JustepAppAudioFile : NSObject
{
	NSString* resourcePath;
	NSURL* resourceURL;
	AudioPlayer* player;
#ifdef __IPHONE_3_0
	AudioRecorder* recorder;
#endif
}

@property (nonatomic, retain) NSString* resourcePath;
@property (nonatomic, retain) NSURL* resourceURL;
@property (nonatomic, retain) AudioPlayer* player;

#ifdef __IPHONE_3_0
@property (nonatomic, retain) AudioRecorder* recorder;
#endif

@end

@interface JustepAppSound : JustepAppPlugin <AVAudioPlayerDelegate, AVAudioRecorderDelegate>
{
	NSMutableDictionary* soundCache;
    AVAudioSession* avSession;
}
@property (nonatomic, retain) NSMutableDictionary* soundCache;
@property (nonatomic, retain) AVAudioSession* avSession;

- (void) play:(NSString *)soundId withSrc:(NSString *)src withDict:(NSMutableDictionary*)options;
- (void) pause:(NSString *)soundId withSrc:(NSString *)src;
- (void) stop:(NSString *)soundId withSrc:(NSString *)src;
- (void) release:(NSString *)soundId withSrc:(NSString *)src;
- (void) getCurrentPosition:(NSString *)callbackId withId:(NSString *)soundId withSrc:(NSString *)src;
- (void) prepare:(NSString *)callbackId withId:(NSString *)soundId withSrc:(NSString *)src;
- (BOOL) hasAudioSession;

// helper methods
- (JustepAppAudioFile*) audioFileForResource:(NSString*) resourcePath withId: (NSString*)mediaId;
- (BOOL) prepareToPlay: (JustepAppAudioFile*) audioFile withId: (NSString*)mediaId;
- (NSString*) createMediaErrorWithCode: (MediaError) code message: (NSString*) message;

- (void) startAudioRecord:(NSString *)soundId withSrc:(NSString *)src;
- (void) stopAudioRecord:(NSString *)soundId withSrc:(NSString *)src;;

@end
