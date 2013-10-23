//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//

#import "JustepAppAccelerometer.h"

@implementation JustepAppAccelerometer

// defaults to 100 msec
#define kAccelerometerInterval      100 
// max rate of 40 msec
#define kMinAccelerometerInterval    40  
// min rate of 1/sec
#define kMaxAccelerometerInterval   1000




- (void)startWithDict:(NSMutableDictionary*)options{
	
	NSTimeInterval desiredFrequency_num = kAccelerometerInterval;
	
	if ([options objectForKey:@"frequency"]) 
	{
		int nDesFreq = [(NSString *)[options objectForKey:@"frequency"] intValue];
		// Special case : returns 0 if int conversion fails
		if(nDesFreq == 0)
		{
			nDesFreq = desiredFrequency_num;
		}
		else if(nDesFreq < kMinAccelerometerInterval) 
		{
			nDesFreq = kMinAccelerometerInterval;
		}
		else if(nDesFreq > kMaxAccelerometerInterval)
		{
			nDesFreq = kMaxAccelerometerInterval;
		}
		desiredFrequency_num = nDesFreq;
	}
	UIAccelerometer* pAccel = [UIAccelerometer sharedAccelerometer];
	// accelerometer expects fractional seconds, but we have msecs
	pAccel.updateInterval = desiredFrequency_num / 1000;
	if(!_bIsRunning)
	{
		pAccel.delegate = self;
		_bIsRunning = YES;
	}
}


- (void)stop
{
	UIAccelerometer*  theAccelerometer = [UIAccelerometer sharedAccelerometer];
	theAccelerometer.delegate = nil;
	_bIsRunning = NO;
}


/**
 * Sends Accel Data back to the Device.
 */
- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration 
{
	if(_bIsRunning)
	{
		NSString * jsCallBack = nil;
		jsCallBack = [[NSString alloc] initWithFormat:@"justepApp.accelerometer._onAccelUpdate(%f,%f,%f);", acceleration.x, acceleration.y, acceleration.z];
		[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
		[jsCallBack release];
	}
}



@end
