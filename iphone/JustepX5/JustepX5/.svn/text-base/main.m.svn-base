//
//  main.m
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "JustepAppDelegate.h"
#import "JustepAppDelegatePad.h"
#define IS_IPAD UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad
int main(int argc, char *argv[])
{
    @autoreleasepool {
        /**
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        NSString *url = [defaults objectForKey:@"url"];
        if (url !=nil) {
            NSRange mobileRange = [url rangeOfString:@"/mobileUI/"];
            
            NSRange uiRange = [url rangeOfString:@"/UI/"];
            
            if (mobileRange.length > 0 ) {
                return UIApplicationMain(argc, argv, nil, NSStringFromClass([JustepAppDelegate class]));
            }
            if(uiRange.length > 0){
                return UIApplicationMain(argc, argv, nil, NSStringFromClass([JustepAppDelegatePad class]));
            }
        }
       **/
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];

        int connectMobileUI=[defaults boolForKey:@"connectMobileUI"];
        
        if(connectMobileUI){
            return UIApplicationMain(argc, argv, nil, NSStringFromClass([JustepAppDelegate class]));
        }
        if (IS_IPAD) {
            return UIApplicationMain(argc, argv, nil, NSStringFromClass([JustepAppDelegatePad class]));
            
        }else{
            return UIApplicationMain(argc, argv, nil, NSStringFromClass([JustepAppDelegate class]));
            
        }
    }
}
	