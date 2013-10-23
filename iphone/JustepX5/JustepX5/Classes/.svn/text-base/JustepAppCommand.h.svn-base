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


@interface JustepAppCommand : NSObject {
	NSString* command;
	NSString* className;
	NSString* methodName;
	NSMutableArray* arguments;
	NSMutableDictionary* options;
}

@property(retain) NSMutableArray* arguments;
@property(retain) NSMutableDictionary* options;
@property(copy) NSString* command;
@property(copy) NSString* className;
@property(copy) NSString* methodName;

+ (JustepAppCommand *) initFromObject:(NSDictionary*)object;

- (void) dealloc;

@end
