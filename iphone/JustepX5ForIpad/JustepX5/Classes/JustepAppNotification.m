//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//


#import "JustepAppNotification.h"
#import <JustepAppBridge/NSDictionaryExtension.h>


@implementation JustepAppNotification


- (void)alert:(NSString *)callbackId withMessage:(NSString *)message withDict:(NSMutableDictionary*)options;
{
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
	
	if (!title)
        title = @"Alert";
	if (!button)
        button = @"OK";
	
	JustepAppAlertView *alertView = [[JustepAppAlertView alloc]
							  initWithTitle:title
							  message:message 
							  delegate:self 
							  cancelButtonTitle:nil 
							  otherButtonTitles:nil];
	
	[alertView setCallbackId:callbackId];
	NSArray* labels = [ button componentsSeparatedByString:@","];
	
	int count = [ labels count ];
	
	for(int n = 0; n < count; n++)
	{
		[ alertView addButtonWithTitle:[labels objectAtIndex:n]];
	}
	
	[alertView show];
	[alertView release];
}


- (void)prompt:(NSString *)callbackId withMessage:(NSString *)message withDict:(NSMutableDictionary *)options
{
	
	
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
    
    if (!title)
        title = @"Alert";
    if (!button)
        button = @"OK";
    
	JustepAppAlertView *openURLAlert = [[JustepAppAlertView alloc]
								 initWithTitle:title
								 message:message delegate:self cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert setCallbackId: callbackId];
	[openURLAlert show];
	[openURLAlert release];
}

/**
 Callback invoked when an alert dialog's buttons are clicked.   
 Passes the index + label back to JS
 */

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    //NSString *buttonLabel = [alertView buttonTitleAtIndex:buttonIndex];
	
	JustepAppAlertView* appAlertView = (JustepAppAlertView*) alertView;
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: ++buttonIndex]; 
	[self execJS:[result onSuccessString: [appAlertView callbackId]]];
	//NSString * jsCallBack = [NSString stringWithFormat:@"justepApp.notification._alertCallback(%d,\"%@\");", ++buttonIndex, buttonLabel];    
    //[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}
 
- (void)vibrate
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

@end

@implementation JustepAppAlertView
@synthesize callbackId;

- (void) dealloc
{
	if (callbackId) {
		[callbackId release];
	}
	
	
	[super dealloc];
}
@end