//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//

#import "JustepAppLogger.h"

@implementation JustepAppLogger

- (void)log:(NSString *)message withDict:(NSMutableDictionary*)options
{

    NSString* log_level = @"INFO";
    if ([options objectForKey:@"logLevel"])
        log_level = [options objectForKey:@"logLevel"];

    NSLog(@"[%@] %@", log_level, message);
   
}

@end
