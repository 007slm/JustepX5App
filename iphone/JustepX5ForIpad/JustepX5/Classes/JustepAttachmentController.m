//
//  JustepAttachmentController.m
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
//  附件浏览相关逻辑，采用单独的webview打开
//

#import "JustepAttachmentController.h"
#import <QuartzCore/QuartzCore.h>
@implementation JustepAttachmentController
@synthesize attachWebView,backItem,attachmentDelegate,HUD,navItem;


-(IBAction)back:(id)sender{
    [self.attachmentDelegate backHomePageFromAttachment];
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if(self){
        self.attachWebView.delegate = self;
    }
    return self;
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    
   self.attachWebView.scalesPageToFit = YES;
    
}

-(void)viewDidAppear:(BOOL)animated{
    NSString *docName = [self.attachmentDelegate getBrowserDocName];
    
    [self.navItem setTitle:docName];
    
    NSString *docUrl = [self.attachmentDelegate getBrowserDocUrl];
    
    NSURL *url = [NSURL URLWithString:docUrl];
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url]; 
    [request setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
    [request setTimeoutInterval:10];  
    [self.attachWebView loadRequest:request];

    HUD = [[MBProgressHUD showHUDAddedTo:self.attachWebView animated:YES] retain];
	HUD.delegate = self;
    [self performSelector:@selector(checkWebViewState) withObject:nil afterDelay:10];
}

-(void)checkWebViewState{
    if(HUD !=nil && self.attachWebView.loading == TRUE){
        [HUD hide:TRUE afterDelay:1];
    }
}

-(void)webViewDidFinishLoad:(UIWebView *)webView{
    [HUD hide:true afterDelay:1];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [HUD hide:true afterDelay:1];
    if ([error code] != NSURLErrorCancelled) {
        //NSString *message = [[[NSString alloc] initWithFormat:@"错误代码 %d",[error code]] autorelease];
            UIAlertView *alert = [[[UIAlertView alloc]
                                  initWithTitle:@"查看附件失败："
                                  message:@""
                                  delegate:self
                                  cancelButtonTitle:@"知道了!"
                                 otherButtonTitles:nil] autorelease];
            [alert show];
    }
}


- (void)viewDidUnload
{
    [super viewDidUnload];

    
}

#pragma mark MBProgressHUDDelegate methods

- (void)hudWasHidden:(MBProgressHUD *)hud {
	// Remove HUD from screen when the HUD was hidded
	[HUD removeFromSuperview];
	[HUD release];
	HUD = nil;
}


- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request 
 navigationType:(UIWebViewNavigationType)navigationType {
    return YES;
}    
@end
