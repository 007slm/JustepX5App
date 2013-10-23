//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//

#import "JustepAppBattery.h"


@interface JustepAppBattery(PrivateMethods)
- (void) updateOnlineStatus;
@end

@implementation JustepAppBattery

@synthesize state, level, callbackId;


- (void) updateBatteryStatus: (NSNotification*)notification
{
    NSDictionary* batteryData = [self getBatteryStatus];
    if (self.callbackId) {
        JustepAppCommandCallback *result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary:batteryData];
        [result setKeepCallbackAsBool:YES];
        [super execJS:[result onSuccessString:self.callbackId]];
    }
       
}
/* Get the current battery status and level.  Status will be unknown and level will be -1.0 if 
 * monitoring is turned off.
 */
- (NSDictionary*) getBatteryStatus
{
    
    UIDevice* currentDevice = [UIDevice currentDevice];
    UIDeviceBatteryState currentState = [currentDevice batteryState];
    
    BOOL isPlugged = FALSE; // UIDeviceBatteryStateUnknown or UIDeviceBatteryStateUnplugged
    if (currentState == UIDeviceBatteryStateCharging || currentState == UIDeviceBatteryStateFull) {
        isPlugged = TRUE;
    }
    float currentLevel = [currentDevice batteryLevel];
    
    if (currentLevel != self.level || currentState != self.state) {
        
        self.level = currentLevel;
        self.state = currentState;
    }
    
    // W3C spec says level must be null if it is unknown
    NSObject* w3cLevel = nil;
    if (currentState == UIDeviceBatteryStateUnknown || currentLevel == -1.0) {
        w3cLevel = [NSNull null];
    }
    else {
        w3cLevel = [NSNumber numberWithFloat:(currentLevel*100)];
    }
    NSMutableDictionary* batteryData = [NSMutableDictionary dictionaryWithCapacity:2];
    [batteryData setObject: [NSNumber numberWithBool: isPlugged] forKey:@"isPlugged"];
    [batteryData setObject: w3cLevel forKey:@"level"];
    return batteryData;
}

/* turn on battery monitoring*/
- (void) start:(NSString *)callbackId
{
    self.callbackId = callbackId;
    
    if ( [UIDevice currentDevice].batteryMonitoringEnabled == NO) {
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateBatteryStatus:) 
												 name:UIDeviceBatteryStateDidChangeNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateBatteryStatus:) 
												 name:UIDeviceBatteryLevelDidChangeNotification object:nil];
	}
	
}
/* turn off battery monitoring */
- (void) stop
{
    // callback one last time to clear the callback function on JS side
    if (self.callbackId) {
        JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary:[self getBatteryStatus]];
        [result setKeepCallbackAsBool:NO];
        [super execJS:[result onSuccessString:self.callbackId]];
    }
    self.callbackId = nil;
    [[UIDevice currentDevice] setBatteryMonitoringEnabled:NO];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceBatteryStateDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceBatteryLevelDidChangeNotification object:nil];
    
	
}

- (JustepAppPlugin *) initWithWebView:(UIWebView*)theWebView
{
    self = (JustepAppBattery*)[super initWithWebView:theWebView];
    if (self) {
		self.state = UIDeviceBatteryStateUnknown;
        self.level = -1.0;

    }
    return self;
}

- (void)dealloc
{
	[self stop]; 
													
    [super dealloc];
}

@end
