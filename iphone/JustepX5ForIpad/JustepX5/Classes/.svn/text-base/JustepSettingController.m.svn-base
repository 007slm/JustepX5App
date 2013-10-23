//
//  JustepSettingContoller.m
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
//  配置信息页面相关逻辑
//

#import "JustepSettingController.h"

@implementation JustepSettingController
@synthesize delegate,url,username,password,setttingChanged,barItem;

-(IBAction)fieldChanged:(id)sender{
    self.setttingChanged = YES;
}

-(IBAction)doneEdit:(id)sender{
    [sender resignFirstResponder];
}

-(IBAction)back:(id)sender{
    if (self.setttingChanged) {
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setObject:[self.url text] forKey:@"url"];
        [defaults setObject:[self.username text] forKey:@"username"];
        [defaults setObject:[self.password text] forKey:@"password"];
        [defaults synchronize];
    }
    [self.delegate backHomePage:self.setttingChanged];
}


- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    return self;
}

- (void)viewDidLoad{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *userNameValue = [defaults objectForKey:@"username"];
    NSString *passwordValue = [defaults objectForKey:@"password"];
    NSString *urlValue = [defaults objectForKey:@"url"];
    self.setttingChanged = NO;

    [self.url setText:urlValue];
    [self.username  setText:userNameValue];
    [self.password  setText:passwordValue];
    self.url.returnKeyType=UIReturnKeyDone;
    self.username.returnKeyType=UIReturnKeyDone;
    self.password.returnKeyType=UIReturnKeyDone;
}


@end
