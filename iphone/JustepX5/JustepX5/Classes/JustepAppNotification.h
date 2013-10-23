
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
#import <UIKit/UIKit.h>
#import <AudioToolbox/AudioServices.h>
#import "JustepAppPlugin.h"


@interface JustepAppNotification : JustepAppPlugin <UIAlertViewDelegate>{
}

- (void)alert:(NSString *)callbackId withMessage:(NSString *)message withDict:(NSMutableDictionary *)options; // confirm is just a variant of alert
- (void)vibrate;

@end

@interface JustepAppAlertView : UIAlertView {
	NSString *callBackId;
}
@property(nonatomic, retain) NSString *callbackId;

-(void) dealloc;

@end