//
//  AppEvent.m
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-6.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import "JustepAppEvent.h"


@implementation JustepAppEvent

@synthesize event,callback,data;

#pragma mark 解析url为AppEvent对象
- (id)init:(NSString *)param {
    self = [super init];
    if (self) {
        data  = [NSMutableDictionary dictionaryWithCapacity:10];
        param = [param stringByReplacingOccurrencesOfString:@"about:blank?" withString:@""];
        NSArray *paramArray = [param componentsSeparatedByString:@"&"];
        for (int i = 0; i<[paramArray count]; i++) {
            NSString *paramItem = [paramArray objectAtIndex:i];
            NSRange range = [paramItem rangeOfString:@"="];
            int index = -1;
            if (range.length > 0 ) {
                index = range.location;
            }
            NSString *key = [paramItem substringToIndex:index];
            NSString *value = [paramItem substringFromIndex:index+1];
            if([@"event" isEqualToString:key]){
                event = value;
            }else if([@"callback" isEqualToString:key]){
                callback = value;
            }else{
                [data setObject:value forKey:key];
            }
        }
    }
    return self;
}
@end
