//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//

#import "JustepAppCommand.h"

@implementation JustepAppCommand

@synthesize arguments;
@synthesize options;
@synthesize command;
@synthesize className;
@synthesize methodName;

+ (JustepAppCommand *) initFromObject:(NSDictionary*)object
{
    JustepAppCommand *juc = [[[JustepAppCommand alloc] init] autorelease];
    juc.className = [object objectForKey:@"className"];
    juc.methodName = [object objectForKey:@"methodName"];
    juc.arguments = [object objectForKey:@"arguments"];
    juc.options = [object objectForKey:@"options"];
/**    juc.command = [url host];
	if([juc.command lowercaseString] isEqualToString:@"invokemethod"){
        
    }else{
        //废弃的用法
        NSString * fullUrl = [url description];
        int prefixLength = [[url scheme] length] + [@"://" length] + [juc.command length] + 1;
        
        int qsLength = [[url query] length];
        int pathLength = [fullUrl length] - prefixLength;
        
        
        if (qsLength > 0)
            pathLength = pathLength - qsLength - 1; // 1 is the "?" char
        
        else if ([fullUrl hasSuffix:@"/"] && pathLength > 0)
            pathLength -= 1; // 1 is the "/" char
        
        NSString *path = [fullUrl substringWithRange:NSMakeRange(prefixLength, pathLength)];
        
       
        NSMutableArray* arguments = [NSMutableArray arrayWithArray:[path componentsSeparatedByString:@"/"]];
        int i, arguments_count = [arguments count];
        for (i = 0; i < arguments_count; i++) {
            [arguments replaceObjectAtIndex:i withObject:[(NSString *)[arguments objectAtIndex:i]
                                                          stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
        juc.arguments = arguments;
        
        
        NSMutableDictionary* options = [NSMutableDictionary dictionaryWithCapacity:1];
        NSArray * options_parts = [NSArray arrayWithArray:[[url query] componentsSeparatedByString:@"&"]];
        int options_count = [options_parts count];
        
        for (i = 0; i < options_count; i++) {
            NSArray *option_part = [[options_parts objectAtIndex:i] componentsSeparatedByString:@"="];
            NSString *name = [(NSString *)[option_part objectAtIndex:0] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            NSString *value = [(NSString *)[option_part objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [options setObject:value forKey:name];
        }
        juc.options = options;
        
        NSArray* components = [juc.command componentsSeparatedByString:@"."];
        if (components.count == 2) {
            juc.className = [components objectAtIndex:0];
            juc.methodName = [components objectAtIndex:1];
        }
    }
    **/
    
    return juc;
}


- (void) dealloc
{
	[arguments release];
	[options release];
	[command release];
	[className release];
	[methodName release];
	
	[super dealloc];
}

@end
