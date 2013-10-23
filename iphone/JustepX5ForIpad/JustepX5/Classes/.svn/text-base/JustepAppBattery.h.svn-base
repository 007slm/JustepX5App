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
#import "JustepAppPlugin.h"
#import "JustepAppCommandCallback.h"


@interface JustepAppBattery : JustepAppPlugin {
	UIDeviceBatteryState state;
    float level; 
	NSString* callbackId;
}

@property (nonatomic) UIDeviceBatteryState state;
@property (nonatomic) float level;
@property (retain) NSString* callbackId;

- (void) updateBatteryStatus:(NSNotification*)notification;
- (NSDictionary*) getBatteryStatus;
- (void) start:(NSString *)callbackId;
- (void) stop;
- (void)dealloc;
@end
