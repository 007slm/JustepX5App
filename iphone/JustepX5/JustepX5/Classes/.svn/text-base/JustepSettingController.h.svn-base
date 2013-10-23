//
//  JustepSettingContoller.h
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import <UIKit/UIKit.h>
#define IS_IPAD UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad
@class JustepSettingController;
@protocol JustepSettingControllerDelegate
- (void)backHomePage:(int)settingChanged;
@end

@interface JustepSettingController : UIViewController

@property (retain,nonatomic) IBOutlet id<JustepSettingControllerDelegate> delegate;
@property (retain,nonatomic) IBOutlet UITextField *url;
@property (retain,nonatomic) IBOutlet UITextField *username;
@property (retain,nonatomic) IBOutlet UITextField *password;
@property (nonatomic) int setttingChanged;
@property (retain,nonatomic) IBOutlet UIBarButtonItem *barItem;


-(IBAction)back:(id)sender;
-(IBAction)doneEdit:(id)sender;
-(IBAction)fieldChanged:(id)sender;

@end
