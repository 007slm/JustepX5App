//
//  JustepAttachmentController.h
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-8-13.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MBProgressHUD.h"
@protocol JustepAttachmentControllerDelegate
- (void)backHomePageFromAttachment;
-(NSString *)getBrowserDocUrl;
-(NSString *)getBrowserDocName;
@end
@interface JustepAttachmentController:UIViewController<UIWebViewDelegate,MBProgressHUDDelegate>


@property (retain,nonatomic) IBOutlet UIWebView *attachWebView;
@property (retain,nonatomic) IBOutlet UIBarButtonItem *backItem;
@property (retain,nonatomic) IBOutlet UINavigationItem *navItem;
@property (retain,nonatomic) id<JustepAttachmentControllerDelegate> attachmentDelegate;
@property (retain,nonatomic) MBProgressHUD *HUD;


-(IBAction)back:(id)sender;


@end
