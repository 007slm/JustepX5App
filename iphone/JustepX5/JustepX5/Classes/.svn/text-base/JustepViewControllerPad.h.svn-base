//
//  JustepViewControllerPad.h
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
#import "JustepSettingController.h"
#import "JustepUploader.h"
#import "JustepDownloadManager.h"
#import "Reachability.h"
#import "JustepAttachmentController.h"
#import "MBProgressHUD.h"
#import "JustepWebView.h"

#import "JustepAppCommand.h"
#import "JustepAppDelegate.h"
#import "JustepAppPlugin.h"
#import <objc/objc-sync.h>
#import "JustepAppEvent.h"
#import "JustepSettingController.h"
#import <QuartzCore/QuartzCore.h>
#import <CommonCrypto/CommonDigest.h>
#import <objc/objc-sync.h>
#import <JustepAppBridge/NSObject+PerformSelector.h>
#import "JSONKit.h"
#import "MGTileMenuView.h"
#import "MPNotificationView.h"

#define UIScreenHeight ([[UIScreen mainScreen] bounds].size.height)
#define UIScreenWidth  ([[UIScreen mainScreen] bounds].size.width)
#define settingImageWidth 80
#define settingImageHeight 80

/**
 
 特别注意：
    这个接口是实现x5 app的基本初始化类，
    这个接口必须继承基类JustepBaseViewController
    contentWebView是展现x5页面的主要webview必须采用JustepWebView实现
  **/
@interface JustepViewControllerPad:UIViewController <UIWebViewDelegate,JustepSettingControllerDelegate,JustepUploaderDelegate,JustepDownloadManagerDelegate,JustepAttachmentControllerDelegate,MBProgressHUDDelegate,MGTileMenuDelegate,JustepFinderControllerDelegate,UIGestureRecognizerDelegate>{
    
    //contentWebView 必须采用JustepWebView实现 扩展了UIWebView的能力和为x5特性增加了部分能力
    JustepWebView *contentWebView;


    int injectedJsOcBridge;
    int injectedAgentJsOcBridge;
    int webViewsLoaded;
    int settingError;
    NSURLRequest *contentRequest;
    


    UIInterfaceOrientation orientation;
    JustepSettingController *settingController;
    JustepAttachmentController *attachmentController;
    JustepDownloadManager *download;
    NSString *contentUrlStr;
    NSURL *invokedURL;
}
@property (strong, nonatomic) MGTileMenuController *tileController;
@property (retain,nonatomic) MBProgressHUD *HUD;
@property (retain,nonatomic) NSArray *tileMenuTitle;
@property (retain,nonatomic) NSArray *tileMenuAction;
@property (retain,nonatomic) NSArray *tileMenuRGBA;


@property (retain,nonatomic) UIImageView *settingImage;
@property (strong,nonatomic) NSString *contentUrlStr;
@property (strong,nonatomic) NSString *contentBeforeAngentUrl;
@property (strong,nonatomic) JustepDownloadManager *download;
@property (strong,nonatomic) JustepSettingController *settingController;
@property (strong,nonatomic) JustepAttachmentController *attachmentController;
@property (strong, nonatomic) UINavigationController *navController;

@property (retain,nonatomic) JustepUploader *uploader;
@property UIInterfaceOrientation orientation;
@property (retain,nonatomic) NSURLRequest *contentRequest;

@property int injectedJsOcBridge;
@property int injectedAgentJsOcBridge;
@property int webViewsLoaded;
@property (retain,nonatomic) NSString *deviceTokenStr;
@property (retain,nonatomic) NSString *notificationJs;

@property int settingError;

@property (nonatomic, retain) NSURL *invokedURL;
@property (nonatomic, retain) NSMutableDictionary *commandObjects;


@property (retain,nonatomic) IBOutlet JustepWebView *contentWebView;

/**
-(void)reportHorizontalSwipe:(UIGestureRecognizer *)recongnizer;
-(void)reportVerticalSwipe:(UIGestureRecognizer *)recongnizer;
**/



-(void)injectJsOcBridge;


+(NSString *) applicationDocumentsDirectory;

#pragma eventHandle
-(void)openSettingDlg;

-(void)openAttachDlg;
-(void)fixIndexScale;




-(void)loadSystem;
-(void)logoutAction;
-(void)initUploader;
-(void)downloadAttachment;

-(void)showConver;
-(void)removeConver;


#pragma buildRequestParam
-(int)buildRequest;
-(NSString *)md5:(NSString *)str;

- (id) getCommandInstance:(NSString *)className;

- (BOOL) execute:(JustepAppCommand *)command;
@end
