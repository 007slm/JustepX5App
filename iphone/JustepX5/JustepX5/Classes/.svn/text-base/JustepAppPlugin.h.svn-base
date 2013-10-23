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
#import "JustepAppDelegate.h"
#import "JustepAppCommandCallback.h"

@class JustepAppDelegate;
@class JustepViewController;

@interface JustepAppPlugin : NSObject {
    UIWebView*    webView;
}
@property (nonatomic, retain) UIWebView *webView;

/**
 * 知道我这个commond对那个webview操作
 */

-(JustepAppPlugin *) initWithWebView:(UIWebView*)theWebView;
/**
 * 知道我这个commond对那个View操作
 */

-(JustepAppDelegate *) appDelegate;
/**
 * 知道我这个commond对那个ViewController操作
 */
-(JustepViewController *) appViewController;

- (NSString*) execJS:(NSString*)javascript;
- (NSString*) success:(JustepAppCommandCallback *)JustepAppCommandCallback callbackId:(NSString*)callbackId;
- (NSString*) error:(JustepAppCommandCallback *)JustepAppCommandCallback callbackId:(NSString*)callbackId;


@end
