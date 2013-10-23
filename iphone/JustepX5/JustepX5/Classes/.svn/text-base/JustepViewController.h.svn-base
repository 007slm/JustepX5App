//
//  JustepViewController.h
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


#define UIScreenHeight ([[UIScreen mainScreen] applicationFrame].size.height)
#define UIScreenWidth  ([[UIScreen mainScreen] applicationFrame].size.width)
#define homeImageWidth 33
#define homeImageHeight 34
#define toolbarWebViewHeight 50

/**
 
 特别注意：
    这个接口是实现x5 app的基本初始化类，
    这个接口必须继承基类JustepBaseViewController
    contentWebView是展现x5页面的主要webview必须采用JustepWebView实现
  **/
@interface JustepViewController:UIViewController <UIWebViewDelegate,JustepSettingControllerDelegate,JustepUploaderDelegate,JustepDownloadManagerDelegate,
    JustepAttachmentControllerDelegate,JustepFinderControllerDelegate,JustepAttachmentControllerDelegate,MBProgressHUDDelegate>{
    
    //contentWebView 必须采用JustepWebView实现 扩展了UIWebView的能力和为x5特性增加了部分能力
    JustepWebView *contentWebView;
    UIWebView *toolBarWebView;

    int injectedJsOcBridge;
    
    int webViewsLoaded;
    int settingError;
    NSURLRequest *contentRequest;
    
    NSURLRequest *toolBarRequest;
    int toolBarWebViewHidden;
    UIInterfaceOrientation orientation;
    JustepSettingController *settingController;
    JustepAttachmentController *attachmentController;
    JustepDownloadManager *download;
    NSString *contentUrlStr;
    NSURL *invokedURL;
}

@property (retain,nonatomic) MBProgressHUD *HUD;
@property (retain,nonatomic) UIImageView *homeImage;
@property (strong,nonatomic) NSString *contentUrlStr;
@property (strong,nonatomic) JustepDownloadManager *download;
@property (strong,nonatomic) JustepSettingController *settingController;
@property (strong,nonatomic) JustepAttachmentController *attachmentController;

@property (retain,nonatomic) JustepUploader *uploader;
@property UIInterfaceOrientation orientation;
@property (retain,nonatomic) NSURLRequest *contentRequest;
@property (retain,nonatomic) NSURLRequest *toolBarRequest;
@property int injectedJsOcBridge;

@property int webViewsLoaded;
@property (retain,nonatomic) NSString *deviceTokenStr;
@property (retain,nonatomic) NSString *notificationJs;

@property int settingError;
@property int toolBarWebViewHidden;
@property (nonatomic, retain) NSURL *invokedURL;
@property (nonatomic, retain) NSMutableDictionary *commandObjects;


@property (retain,nonatomic) IBOutlet JustepWebView *contentWebView;
@property (retain,nonatomic) IBOutlet UIWebView *toolBarWebView;
@property (strong, nonatomic) UINavigationController *navController;

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
-(void)switchPageTo:(NSString *)pageId;

-(void)setToolBarHidden:(BOOL)hide;


-(void)loadSystem;
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
