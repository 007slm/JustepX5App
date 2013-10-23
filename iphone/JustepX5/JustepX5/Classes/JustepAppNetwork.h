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

@class Reachability;

@interface JustepAppNetwork : JustepAppPlugin {
		
}

- (void) isReachable:(NSString *)callback withHost:(NSString *)hostName withDict:(NSMutableDictionary*)options;

- (void) reachabilityChanged:(NSNotification *)note;
- (void) updateReachability:(NSString*)callback;

@end
