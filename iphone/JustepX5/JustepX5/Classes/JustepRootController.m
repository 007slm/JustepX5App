//
//  JustepRootController.m
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-8-14.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import "JustepRootController.h"
#define IS_IPAD UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad

@implementation JustepRootController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    return self;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
}

-(void)loadView{
    [super loadView];
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    
}

-(NSInteger) supportedInterfaceOrientations{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    
    int connectMobileUI=[defaults boolForKey:@"connectMobileUI"];
    
    if(IS_IPAD && connectMobileUI){
        return UIInterfaceOrientationMaskPortrait;
    }else if(IS_IPAD){
        return UIInterfaceOrientationMaskAll;
    }else{
        return UIInterfaceOrientationMaskPortrait;
    }
}

-(BOOL)shouldAutorotate{
    return YES;
}

@end

