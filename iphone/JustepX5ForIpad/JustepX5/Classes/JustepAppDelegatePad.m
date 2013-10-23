//
//  JustepAppDelegatePad.m
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegatePad.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#define IS_IPAD UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad

#import "JustepAppDelegatePad.h"
#import "JustepViewControllerPad.h"
#import "JustepRootController.h"

@implementation JustepAppDelegatePad

@synthesize window = _window;
@synthesize viewController = _viewController,rootController;
@synthesize itunesVersionData,trackViewUrl;
@synthesize conn;


#pragma mark dealloc
- (void)dealloc
{
    [_window release];
    [_viewController release];
    [super dealloc];
    [conn release];
    [itunesVersionData release];
    
}
#pragma mark 初始化x5 app
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]] autorelease];
    
    self.viewController = [[[JustepViewControllerPad alloc] initWithNibName:@"JustepViewControllerPad" bundle:nil] autorelease];
    //self.rootController = [[[JustepRootController alloc] initWithNibName:@"JustepRootControllerPad" bundle:nil] autorelease];
    
    
    
    [self.window setRootViewController:self.viewController];
    [self.window makeKeyAndVisible];
    //[self.rootController.view insertSubview:self.viewController.view atIndex:1];
    self.viewController.contentWebView.scalesPageToFit = YES;
    
    self.viewController.injectedJsOcBridge = NO;
    self.viewController.injectedAgentJsOcBridge = NO;
    self.viewController.webViewsLoaded = NO;
    
    /**
     隐藏webview后面阴影
     **/
    if([[[self.viewController.contentWebView subviews] objectAtIndex:0] isKindOfClass:[UIScrollView class]]){
        [[[self.viewController.contentWebView subviews] objectAtIndex:0] setBounces:FALSE];
    }
    /**
    for (UIView *view in [self.webview subviews]){
        if ([view isKindOfClass:[UIScrollView class]]){
            for (UIView *shadowView in view.subviews){
                // 上下滚动出边界时的黑色的图片 也就是拖拽后的上下阴影
                if ([shadowView isKindOfClass:[UIImageView class]]){
                    shadowView.hidden = YES;
                }
            }
        }
    }**/
    
    
    
    self.viewController.notificationJs =@"";
    [self judgeShouldLoadNewVersion];
    
    //[[UIApplication sharedApplication] registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
    
    //初始化共享目录
    
    //NSFileManager *defaultManager = [NSFileManager defaultManager];
    //NSString *docsDir = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    //[defaultManager createDirectoryAtPath:[docsDir stringByAppendingPathComponent:@"/config/"] withIntermediateDirectories:false attributes:nil error:NULL];
    
    return YES;
}


- (NSString*) pathForResource:(NSString*)resourcepath
{
    return [[self class] pathForResource:resourcepath];
}

+ (NSString*) wwwFolderName
{
    return @"www";
}
+ (NSString*) pathForResource:(NSString*)resourcepath
{
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
    
    NSString* directoryPartsJoined =[directoryParts componentsJoinedByString:@"/"];
    NSString* directoryStr = [self wwwFolderName];
    
    if ([directoryPartsJoined length] > 0) {
        directoryStr = [NSString stringWithFormat:@"%@/%@", [self wwwFolderName], [directoryParts componentsJoinedByString:@"/"]];
    }
    
    return [mainBundle pathForResource:filename
                                ofType:@""
                           inDirectory:directoryStr];
}

/**
#pragma mark 推送消息
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    const unsigned *tokenBytes = [deviceToken bytes];
    NSString *deviceTokenStr = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                          ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                          ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                          ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];		
    
    NSLog(@"deviceToken: %@", deviceToken);
    
    self.viewController.deviceTokenStr = deviceTokenStr;
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"Error in registration. Error: %@", error);
    UIAlertView* alert = [[UIAlertView alloc] initWithTitle:@"注册失败"
                                                    message:[error description]
                                                   delegate:self
                                          cancelButtonTitle:@"关闭"
                                          otherButtonTitles:@"更新状态",nil];
    [alert show];
    [alert release];
    self.viewController.deviceTokenStr = @"";
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{

    
    NSLog(@"收到推送消息：%@",[[userInfo objectForKey:@"aps"] objectForKey:@"alert"]);
    NSDictionary *apsDic = [userInfo objectForKey:@"aps"];
    NSString *alert = [apsDic objectForKey:@"alert"];
    NSString *detail = [apsDic objectForKey:@"detail"];
   
    UIApplicationState state = [application applicationState];
    if (state == UIApplicationStateActive) {
        NSString *message = [[userInfo objectForKey:@"aps"] objectForKey:@"alert"];
        
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"x5"
                                                        message:message
                                                       delegate:self
                                              cancelButtonTitle:@"知道了"
                                              otherButtonTitles:nil];
        
    
        [alert show];
        [alert release];
    } else {
        NSString *pushNotification = [[[NSString alloc] initWithFormat:@"justepApp.notification.pushNotification('%@','%@');",alert,detail] autorelease];
        self.viewController.notificationJs= pushNotification;
    }
}
**/
#pragma mark 版本升级
- (void)judgeShouldLoadNewVersion{
    //测试 appid：490595663
    //x5 appid 541487259
    NSString *post=nil;
    post=[[NSString alloc]initWithFormat:@"id=%@",@"541487259"];
    NSData *postData=[post dataUsingEncoding:NSASCIIStringEncoding allowLossyConversion:YES];
    NSString *postLength=[NSString stringWithFormat:@"%d",[postData length]];
    NSMutableURLRequest *request=[[NSMutableURLRequest alloc]init];
    [request setURL:[NSURL URLWithString:@"http://itunes.apple.com/lookup?"]];
    [request setHTTPMethod:@"POST"];
    [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:postData];    
    
    itunesVersionData=[[NSMutableData alloc] initWithData:nil];
    conn=[[NSURLConnection alloc]initWithRequest:request delegate:self];
    [request release];
    [post release];
}

-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    //NSLog(@"didReceiveData");
    [itunesVersionData appendData:data];
}

-(void) connectionDidFinishLoading:(NSURLConnection *)connection{
    //NSLog(@"%@",[[[NSString alloc] initWithData:itunesVersionData encoding:NSUTF8StringEncoding]autorelease]);
    
    NSString *jsonString=[[NSString alloc] initWithData:itunesVersionData encoding:NSUTF8StringEncoding];
    NSDictionary *jsonData=[jsonString JSONValue];
    NSArray *infoArrays=[jsonData objectForKey:@"results"];
    if([infoArrays count] > 0){
        NSDictionary *releaseInfo=[infoArrays objectAtIndex:0];
        NSString *lastVersion =[releaseInfo objectForKey:@"version"];
        trackViewUrl=[[releaseInfo objectForKey:@"trackViewUrl"]retain];
        NSString *note=[releaseInfo objectForKey:@"releaseNotes"];
        
        [jsonString release];   
        NSString *version =[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"];
        float currentVersion = [version floatValue];
        float newVersion = [lastVersion floatValue];
        
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        int notifyUpdate=[defaults boolForKey:@"notifyUpdate"];
        if (currentVersion < newVersion && notifyUpdate) {
            
            //***************UIAlertView方法*******************//
            UIAlertView *alert = [[UIAlertView alloc]
                                  initWithTitle:@"发现新版本\n 是否现在更新："
                                  message:note
                                  delegate:self
                                  cancelButtonTitle:@"下次再说" otherButtonTitles:@"现在更新", nil
                                  ];
            [alert show];
            [alert release];
            
        }
    }else{
        [jsonString  release];
    }
}
    
-(void) connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
   [itunesVersionData release];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex{
   if (buttonIndex == 0) {
      return;
   }else if (buttonIndex == 1) {
       [[UIApplication sharedApplication] openURL:[NSURL URLWithString:trackViewUrl]] ;
   }
}

-(void) applicationWillTerminate:(UIApplication *)application{
    if(self.viewController && self.viewController.contentWebView){
        [self.viewController logoutAction];
    }
}

@end
