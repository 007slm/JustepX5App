//
//  JustepAppDelegatePad.h
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegatePad.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-5.


#import <UIKit/UIKit.h>
#import "JSON.h"
#import "JustepAppPlugin.h"

@class JustepAttachmentController;
@class JustepViewControllerPad;
@class JustepRootController;

@interface JustepAppDelegatePad : UIResponder <UIApplicationDelegate>

#pragma mark 基本属性
@property (strong, nonatomic) UIWindow *window;
@property (strong, nonatomic) NSURLConnection *conn;
@property (strong, nonatomic) JustepViewControllerPad *viewController;
@property (strong, nonatomic) JustepRootController *rootController;


#pragma mark 版本升级
@property (strong,nonatomic)  NSMutableData *itunesVersionData;
@property (strong,nonatomic) NSString *trackViewUrl;



- (NSString*) pathForResource:(NSString*)resourcepath;
+ (NSString*) wwwFolderName;
+ (NSString*) pathForResource:(NSString*)resourcepath;
-(void)judgeShouldLoadNewVersion;


@end
