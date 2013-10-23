//
//  JustepViewController.m
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


#import "JustepViewController.h"
#define IS_IPAD UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad


@implementation JustepViewController

@synthesize contentWebView,toolBarWebView,injectedJsOcBridge,webViewsLoaded,contentRequest,toolBarRequest,toolBarWebViewHidden,orientation,settingController,contentUrlStr,homeImage,settingError,uploader,download,attachmentController,HUD,deviceTokenStr,notificationJs,commandObjects,invokedURL,navController;

- (id) initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self != nil) {
        commandObjects = [[NSMutableDictionary alloc] initWithCapacity:4];
        [commandObjects setObject:self forKey:@"JustepViewController"];
    }
    return self;
}


-(id) getCommandInstance:(NSString *)className
{
    id obj = [commandObjects objectForKey:className];
    if (!obj) {
        obj = [[[NSClassFromString(className) alloc] initWithWebView:contentWebView] autorelease];
        
        [commandObjects setObject:obj forKey:className];
		
    }
    return obj;
}

- (BOOL) execute:(JustepAppCommand *)command
{
	if (command.className == nil) {
		return NO;
	}
    
    NSObject *obj = nil;
	
    if([command.className isEqualToString:@"JustepViewController"]){
        obj = self;
    }else {
        obj = [self getCommandInstance:command.className];
    }
    [obj performSelector:command.methodName withParams:command.arguments withOptions:command.options];
	return YES;
}

#pragma mark 下载附件相关的回调
- (void) downloadManagerDataDownloadFinished: (NSString *) fileName{
    /**
    NSFileManager *fileManager = [NSFileManager defaultManager] ;
    //在这里获取应用程序Documents文件夹里的文件及文件夹列表
    NSArray *documentPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    
    
    NSString *documentDir = [documentPaths objectAtIndex:0];
    
    
    
    //NSLog(@"documentDir %@",documentDir);
    
    NSError *error = nil;

    
    //fileList便是包含有该文件夹下所有文件的文件名及文件夹名的数组
    NSArray *fileList = [fileManager contentsOfDirectoryAtPath:documentDir error:&error];
    NSMutableArray *dirArray = [[[NSMutableArray alloc] init] autorelease];
    BOOL isDir = NO;
    
    //在上面那段程序中获得的fileList中列出文件夹名
    for (NSString *file in fileList) {
        NSString *path = [documentDir stringByAppendingPathComponent:file];
        [fileManager fileExistsAtPath:path isDirectory:(&isDir)];
        if (isDir) {
            [dirArray addObject:file];
        }
        isDir = NO;
    }
  
    
    NSString *loadedInfo = [[NSString alloc] initWithFormat:@"documentDir %@ Every Thing in the dir:%@ All folders:%@",documentDir,fileList,dirArray];
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
	
	hud.mode = MBProgressHUDModeText;
    
	hud.labelText = @"下载完成";
	hud.detailsLabelText = loadedInfo;
	
	hud.removeFromSuperViewOnHide = YES;
	[hud hide:YES afterDelay:10];
    **/
//    [BWStatusBarOverlay setAnimation:BWStatusBarOverlayAnimationTypeFromTop];
//    [BWStatusBarOverlay setBackgroundColor:[UIColor blackColor]];
//    [BWStatusBarOverlay showSuccessWithMessage:@"下载完成" duration:4 animated:YES];
    
    [MPNotificationView notifyWithText:@"下载完成" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:4];

}

- (void) downloadManagerDataDownloadFailed: (NSString *) reason{
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
	
	hud.mode = MBProgressHUDModeText;

	hud.labelText = @"下载失败";
	hud.detailsLabelText = reason;
	
	hud.removeFromSuperViewOnHide = YES;
	[hud hide:YES afterDelay:3];
}

#define kDocumentFolder					[NSHomeDirectory() stringByAppendingPathComponent:@"Documents"]
-(void) downloadManagerDidReceiveData: (NSString *) fileName{
    NSString *convertedFileName = [[[NSString alloc] initWithFormat:@"decodeURI('%@')",fileName] autorelease];
   convertedFileName =  [self.contentWebView stringByEvaluatingJavaScriptFromString:convertedFileName];
   self.download.fileName =[kDocumentFolder stringByAppendingPathComponent:convertedFileName];
}


-(void) switchPageTo:(NSString *)pageId{
    [toolBarWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"javascript:changeState('%@')",pageId]];
    [contentWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"javascript:switchPageTo('%@')",pageId]];
}


#pragma mark - eventHandle
/**
 用来处理页面派发过来的事件
 废弃的兼容函数
**/ 
-(void) eventHandle:(JustepAppEvent *)eventData{
    if([@"hideToolbar" isEqualToString:[eventData event]]){
        [self setToolBarHidden:YES];
    }else if([@"showToolbar" isEqualToString:[eventData event]]){
        [self setToolBarHidden:NO];
    }else if([@"switchPage" isEqualToString:[eventData event]]){
        //[self fixIndexScale];
        NSString *pageId = [eventData.data objectForKey:@"pageId"];
        [self switchPageTo:pageId];
    }else if([@"log" isEqualToString:[eventData event]]){
        NSLog(@"%@",[eventData.data objectForKey:@"msg"]);
    }else if([@"refresh" isEqualToString:eventData.event]){
        [self loadSystem];
    }else if([@"exitApp" isEqualToString:eventData.event]){
        [self logOut];        
    }else if([@"saveConfigInfo" isEqualToString:eventData.event]){
        /**
        NSString *url = [eventData.data objectForKey:@"url"];
        NSString *userName = [eventData.data objectForKey:@"userName"];
        NSString *password = [eventData.data objectForKey:@"password"];
        
        editor.putString(F_URL, url);
        editor.putString(F_USERNAME, userName);
        editor.putString(F_PASSWORD, password);
        editor.commit();
        if(isEmpty(webView.getUrl())){
            webView.loadUrl(url);
        } 
        **/
    }else if([@"loginConfig" isEqualToString:eventData.event]){
        [self openSettingDlg];
    }else if([@"uploadAttachment" isEqualToString:eventData.event]){
        [self initUploader];
        
    }else if([@"downloadAttachment" isEqualToString:eventData.event]){
        [self downloadAttachment];
    }else if([@"showDownloadList" isEqualToString:eventData.event]){
        [self showDownloadList];
    }else if([@"browserAttachment" isEqualToString:eventData.event]){
        [self openAttachDlg];
    }else if([@"showConver" isEqualToString:eventData.event]){
        [self showConver];
    }else if([@"removeConver" isEqualToString:eventData.event]){
        [self removeConver];
    }
}

-(void)showConver{
    HUD = [[MBProgressHUD showHUDAddedTo:self.contentWebView animated:YES] retain];
    HUD.delegate = self;
    [self performSelector:@selector(checkWebViewState) withObject:nil afterDelay:10];
}


-(void)removeConver{
    if(HUD !=nil && ![HUD isHidden])
        [HUD hide:YES];
}

-(void)checkWebViewState{
    if(HUD !=nil){
        [HUD hide:TRUE];
    }
}

- (void)hudWasHidden:(MBProgressHUD *)hud {
	// Remove HUD from screen when the HUD was hidded
	[HUD removeFromSuperview];
	[HUD release];
	HUD = nil;
}

-(void)showDownloadList{
    JustepFinderController *finder = [[JustepFinderController alloc] initWithStyle:UITableViewStylePlain];
    
    self.navController = [[[UINavigationController alloc]
                           initWithRootViewController:finder] autorelease];
    if([[[UIDevice currentDevice] systemVersion] floatValue]< 5.0f){
        [finder viewDidAppear:YES];
    }
    
    finder.delegate = self;
    [self presentModalViewController:navController animated:YES];
    
}

-(void)finderPickerController:(JustepFinderController *)finder didFinishPickingFileWithInfo:(NSString *)filePath{
    [finder dismissModalViewControllerAnimated:YES];
    
}

- (void)finderPickerControllerDidCancel:(JustepFinderController *)finder{
    //[picker.view removeFromSuperview];
    [finder dismissModalViewControllerAnimated:YES];
}


-(NSString *)getBrowserDocUrl{
    NSString *browserUrl =  [contentWebView stringByEvaluatingJavaScriptFromString:@"justepApp.attachment.getBrowserUrl()"];
    return browserUrl;
    
}
-(NSString *)getBrowserDocName{
    NSString *docName =  [contentWebView stringByEvaluatingJavaScriptFromString:@"justepApp.attachment.getDocName()"];
    return docName;
}


-(void)downloadAttachment{
    self.download = [[[JustepDownloadManager alloc]init] autorelease];
	download.title=@"附件下载中";
    NSString *downloadUrl =  [contentWebView stringByEvaluatingJavaScriptFromString:@"justepApp.attachment.getDownloadUrl()"];
	download.fileURL=[NSURL URLWithString:downloadUrl];
	download.delegate = self;
	[download start];
}

-(void)logoutAction{
    NSString *logOutStr = @"justep.mobile.Portal.logout();";
    [contentWebView stringByEvaluatingJavaScriptFromString:logOutStr];
}

-(void)logOut{
    [self logoutAction];
   // [BWStatusBarOverlay showSuccessWithMessage:@"注销成功！" duration:10 animated:true];

    [MPNotificationView notifyWithText:@"注销成功！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
    
    self.settingError=YES;
    [self openSettingDlg];
    [self.settingController.barItem setTitle:@"登录"];
}

-(void) initUploader{
    if(self.uploader ==nil){
        if(UIScreenHeight   == 460 || UIScreenWidth == 480){
            self.uploader = [[[JustepUploader alloc] initWithNibName:@"JustepUploader"  bundle:nil] autorelease];
        }else if(IS_IPAD){
            self.uploader = [[[JustepUploader alloc] initWithNibName:@"JustepUploaderPad"  bundle:nil] autorelease];
        }else{
            self.uploader = [[[JustepUploader alloc] initWithNibName:@"JustepUploader5"  bundle:nil] autorelease];
        }
        [self.view insertSubview:self.uploader.view belowSubview:self.contentWebView];
    }
    
    [self.view bringSubviewToFront:self.uploader.view];
    [self.uploader beginUpload];
    self.uploader.uploaderCallback = self;
}

-(NSString *)getDocServerUrl{
    
    NSString *serverUrl =  [contentWebView stringByEvaluatingJavaScriptFromString:@"justepApp.attachment.getUploadUrl()"];
    //NSLog(@"serverUrl is %@",serverUrl);
    return serverUrl;
}

-(void)uploadComplete:(NSString *)docServerResponse{
//    UIAlertView *alert = [[[UIAlertView alloc]
//                          initWithTitle:@"文档服务返回的信息："
//                          message:docServerResponse
//                          delegate:self
//                          cancelButtonTitle:@"知道了!"
//                          otherButtonTitles:nil] autorelease];
//    [alert show];
    [contentWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"justepApp.attachment.uploadCallback('%@','%@')",docServerResponse,self.uploader.fileName]];
    

}

-(void)pickerAppear:(UIViewController *)picker{
    [self presentModalViewController:picker animated:YES];
}

-(void)pickerDisAppear{
    [[UIApplication sharedApplication] setStatusBarHidden:NO];
    [self.view sendSubviewToBack:self.uploader.view];
    [self.view bringSubviewToFront:self.contentWebView];
    [self.view bringSubviewToFront:self.toolBarWebView];
    [self.view bringSubviewToFront:self.homeImage];
    
}

///**双击屏幕时会调用此方法,放大和缩小图片**
-(IBAction)handleTaJustepAppesture:(UIGestureRecognizer*)sender{
    //判断imageView的内容模式是否是UIViewContentModeScaleAspectFit,该模式是原比例，按照图片原时比例显示大小
    if(self.toolBarWebViewHidden){
        //NSLog(@"image view click");
        self.toolBarWebViewHidden = NO;
        homeImage.frame = CGRectMake(0,0,0,0);
        [self setToolBarHidden:NO];
    }  
}  

-(void)setToolBarHidden:(BOOL)hide{
   
    
    // 480 * 300 landscape
    // 320 * 460 portrait
    if(homeImage == NULL){
        homeImage = [[UIImageView alloc] initWithFrame:CGRectMake(0,0,0,0)];
        
        homeImage.image = [UIImage imageNamed:@"ShowToolbar.png"];
        [homeImage setUserInteractionEnabled:YES];
        [self.view addSubview:homeImage];
        
        
        //homeImage点击手势
        UITapGestureRecognizer *taJustepAppesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(handleTaJustepAppesture:)];
        //设置手势点击数 点下  
        taJustepAppesture.numberOfTapsRequired=1;  
        // imageView添加手势识别  
        [homeImage addGestureRecognizer:taJustepAppesture];  
        //释放内存  
        [taJustepAppesture release];
        
    }
   
        [toolBarWebView setHidden:hide]; 
        if(orientation == UIInterfaceOrientationPortrait || orientation == UIInterfaceOrientationPortraitUpsideDown){
            if(hide){
                homeImage.frame = CGRectMake(UIScreenWidth-homeImageWidth,UIScreenHeight-homeImageHeight-4,homeImageWidth,homeImageHeight);
                toolBarWebView.frame = CGRectMake(0, UIScreenHeight-toolbarWebViewHeight,UIScreenWidth, 0);
                contentWebView.frame = CGRectMake(0,0, UIScreenWidth, UIScreenHeight);
            }else{
                toolBarWebView.frame = CGRectMake(0, UIScreenHeight-toolbarWebViewHeight, UIScreenWidth, toolbarWebViewHeight);
                homeImage.frame = CGRectMake(UIScreenWidth-homeImageWidth,UIScreenHeight-homeImageHeight-4,0,0);
                contentWebView.frame = CGRectMake(0, 0, UIScreenWidth, UIScreenHeight-toolbarWebViewHeight);
                
            }
        }else if(orientation == UIInterfaceOrientationLandscapeLeft || orientation == UIInterfaceOrientationLandscapeRight){
            //横向 home在左边
            if(hide){
                toolBarWebView.frame = CGRectMake(0, 0, UIScreenWidth, 0);
                homeImage.frame = CGRectMake(UIScreenWidth-homeImageWidth,UIScreenHeight-homeImageHeight-4,homeImageWidth,homeImageHeight);
                contentWebView.frame = CGRectMake(0, 0, UIScreenWidth, UIScreenHeight);
                
                
            }else{
                //NSLog(@" contenet hide %d",[contentWebView.]);
                toolBarWebView.frame = CGRectMake(0, UIScreenHeight-toolbarWebViewHeight, UIScreenWidth, toolbarWebViewHeight);
                homeImage.frame = CGRectMake(UIScreenWidth-homeImageWidth,UIScreenHeight-homeImageHeight-4,0,0);
                contentWebView.frame = CGRectMake(0, 0, UIScreenWidth, UIScreenHeight-toolbarWebViewHeight);
            }
        }
        self.toolBarWebViewHidden = hide;
}

#pragma mark 初始化访问参数并加载
-(int)buildRequest{
    NSString *language = [self getCurrentLanguage];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *userName = [defaults stringForKey:@"username"];
    NSString *password = [defaults objectForKey:@"password"];
    NSString *url = [defaults stringForKey:@"url"];
    
    if (url !=nil) {
        NSRange range = [url rangeOfString:@"/mobileUI/"];
        
        if (range.length <= 0 ) {
            NSRange httpRange = [url rangeOfString:@"http:"];
            if(httpRange.length <= 0){
                url = [NSString stringWithFormat:@"http://%@/x5/mobileUI/portal/directLogin.w",url];
            }else{
                url = [NSString stringWithFormat:@"%@/x5/mobileUI/portal/directLogin.w",url];
            }
        }
    }else if(userName == nil && password == nil && url == nil){
        userName = @"x5";
        password = @"123456";
        url = @"http://demo.justep.com/x5/mobileUI/portal/directLogin.w";
        [defaults setObject:userName forKey:@"username"];
        [defaults setObject:password forKey:@"password"];
        [defaults setObject:@"demo.justep.com" forKey:@"url"];
        [defaults synchronize];
    }else if(userName == nil || password == nil || url == nil){
        self.settingError = YES;
       // [BWStatusBarOverlay showSuccessWithMessage:@"连接信息不能为空！" duration:10 animated:true];
        [MPNotificationView notifyWithText:@"连接信息不能为空！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
        [self openSettingDlg];
        return NO;
    }
    
    
    password = [self md5:password];
    NSRange range = [url rangeOfString:@"/mobileUI/"];
    int index = -1;
    if (range.length > 0 ) {
        index = range.location;
        
        NSString *toolBarUrlStr = [[[[url substringToIndex:index] stringByAppendingString:@"/mobileUI/portal/mainToolbar.w?language="] stringByAppendingString:language] stringByAppendingString:@"&isIOS=true"];
        
        NSString *encodedUsername = (NSString *)CFURLCreateStringByAddingPercentEscapes(NULL, (CFStringRef)userName, NULL, (CFStringRef)@"!*'();:@&=+$,/?%#[]", kCFStringEncodingUTF8);
        
        contentUrlStr = [[[[[[[url stringByAppendingString:@"?username="] stringByAppendingString:encodedUsername] stringByAppendingString:@"&password="] stringByAppendingString:password] stringByAppendingString:@"&language="] stringByAppendingString:language] stringByAppendingString:@"&isIOS=true"];
        /**
         UIAlertView *alert = [[UIAlertView alloc]
         initWithTitle:@"你配置的信息是："
         message:contentUrlStr
         delegate:self
         cancelButtonTitle:@"知道了!"
         otherButtonTitles:nil];
         [alert show];
         **/
        self.contentRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:contentUrlStr] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20];
        
        self.toolBarRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:toolBarUrlStr] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20];
        
        Reachability *r = [Reachability reachabilityWithHostName:[[toolBarRequest URL] host]];
        
        switch ([r currentReachabilityStatus]) {
            case NotReachable:
                // 没有网络连接
                self.settingError = YES;
//                [BWStatusBarOverlay showSuccessWithMessage:@"好像没有网络连接到服务器！" duration:10 animated:true];
                [MPNotificationView notifyWithText:@"好像没有网络连接到服务器！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
                [self openSettingDlg];
                return NO;
                break;
            case ReachableViaWWAN:
                // 使用3G网络
                break;
            case ReachableViaWiFi:
                // 使用WiFi网络
                
                break;
        }
        return YES;
    }else{
//        [BWStatusBarOverlay showSuccessWithMessage:@"连接地址不正确！" duration:10 animated:true];
        [MPNotificationView notifyWithText:@"连接地址不正确！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
        self.settingError = YES;
        [self openSettingDlg];
        return NO;
    }
    return YES;
}


#pragma mark - md5

-(NSString *)md5:(NSString *)str {
    const char *cStr = [str UTF8String];
    unsigned char result[16];
    CC_MD5( cStr, strlen(cStr), result );
    return [NSString stringWithFormat:
            @"%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X",
            result[0], result[1], result[2], result[3],
            result[4], result[5], result[6], result[7],
            result[8], result[9], result[10], result[11],
            result[12], result[13], result[14], result[15]
            ];
}

-(void)loadSystem{
    [self logoutAction];
    self.injectedJsOcBridge = NO;
    if([self buildRequest]){
        [[NSURLCache sharedURLCache] removeAllCachedResponses];
        [toolBarWebView loadRequest:self.toolBarRequest];
        NSHTTPURLResponse *response =nil;
        NSError *error = nil;
        NSData *responseData = [NSURLConnection sendSynchronousRequest:self.contentRequest returningResponse:&response error:&error];
        if(error != nil){
           //[BWStatusBarOverlay showSuccessWithMessage:@"连接服务器失败！" duration:10 animated:true];
            
            [MPNotificationView notifyWithText:@"连接服务器失败！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
            self.settingError = YES;
            [self openSettingDlg];
        }else if (response == nil){
           //[BWStatusBarOverlay showSuccessWithMessage:@"连接服务器无响应！" duration:10 animated:true];
            [MPNotificationView notifyWithText:@"连接服务器无响应！" detail:"" andDuration:10];
            self.settingError = YES;
            [self openSettingDlg];
        }else if ([response statusCode] != 200){
           //[BWStatusBarOverlay showSuccessWithMessage:@"获取服务器数据失败！" duration:10 animated:true];
            [MPNotificationView notifyWithText:@"获取服务器数据失败！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
           self.settingError = YES;
           [self openSettingDlg];
        } else {
            [contentWebView loadData:responseData MIMEType:[response MIMEType] 
                    textEncodingName:[response textEncodingName] 
                             baseURL:[response URL]];
            self.settingError = NO;
        }
    }
}

-(void)openSettingDlg{
    [UIView beginAnimations:@"suckEffect" context:nil];
    [UIView setAnimationDuration:1.00];
    
    [UIView setAnimationCurve:UIViewAnimationCurveEaseInOut];
    
    if(self.settingController == nil){
        if(UIScreenHeight == 460){
          self.settingController = [[[JustepSettingController alloc] initWithNibName:@"JustepSettingController" bundle:nil] autorelease];
        }else  if(IS_IPAD){
            self.settingController = [[[JustepSettingController alloc] initWithNibName:@"JustepSettingControllerMobilePad" bundle:nil] autorelease];
        }else{
            self.settingController = [[[JustepSettingController alloc] initWithNibName:@"JustepSettingController5" bundle:nil] autorelease];
        }

        self.settingController.delegate = self;
    }
   
    
    [self.view insertSubview:self.settingController.view atIndex:2];
    
    if(self.settingError == YES){
       [self.settingController.barItem setTitle:@"登录"];
    }else{
       [self.settingController.barItem setTitle:@"返回/登录"];
    }
    CATransition *animation = [CATransition animation];
    
    animation.delegate = self;  
    animation.duration = 1.0f;       //动画执行时间  
    
    animation.type = kCATransitionPush;
    animation.subtype = kCATransitionFromRight;  
    // 这里添加你对UIView所做改变的代码  
    [[self.view layer] addAnimation:animation forKey:@"animation"];
    [animation endProgress];
    [UIView commitAnimations];
    
  
}


#pragma mark 返回首页
   
-(void)backHomePage:(int)settingChanged{
    
    CATransition *animation = [CATransition animation];
    
    animation.delegate = self;  
    animation.duration = 1.0f;       //动画执行时间  
    [self.settingController.view removeFromSuperview];
    animation.type = kCATransitionPush;  
    animation.subtype = kCATransitionFromLeft;  
    // 这里添加你对UIView所做改变的代码  
    [[self.view layer] addAnimation:animation forKey:@"animation"];
    if(settingChanged){
        [self loadSystem];
    }else if(self.settingError == YES){
        [self loadSystem];
    }
    [self.settingController.barItem setTitle:@"返回/登录"];
    [animation endProgress];
    [UIView commitAnimations];
}

-(void)backHomePageFromAttachment{
    CATransition *animation = [CATransition animation];
    
    animation.delegate = self;  
    animation.duration = 1.0f;   
    //动画执行时间  
    
    [self.attachmentController.attachWebView loadHTMLString:@"加载中。。。" baseURL:nil];
    [self.attachmentController.view removeFromSuperview];
    animation.type = kCATransitionPush;  
    animation.subtype = kCATransitionFromLeft;  
    // 这里添加你对UIView所做改变的代码  
    [[self.view layer] addAnimation:animation forKey:@"animation"];
    [animation endProgress];
    [UIView commitAnimations];
}


#pragma mark 附件相关
-(void)openAttachDlg{
    if(self.attachmentController == nil){
        if(IS_IPAD){
            self.attachmentController = [[[JustepAttachmentController alloc] initWithNibName:@"JustepAttachmentControllerPad" bundle:nil] autorelease];
            
        }else{
            self.attachmentController = [[[JustepAttachmentController alloc] initWithNibName:@"JustepAttachmentController" bundle:nil] autorelease];
            
        }
        self.attachmentController.attachmentDelegate = self;
        [self.attachmentController.attachWebView.scrollView setBounces:FALSE];
    }

    [self.view.window.rootViewController.view insertSubview:self.attachmentController.view atIndex:4];
    
    
    float version = [[[UIDevice currentDevice] systemVersion] floatValue];
    if(version < 5.0f){
        [self.attachmentController viewDidAppear:YES];   
    }
    [UIView beginAnimations:@"suckEffect" context:nil];
    [UIView setAnimationDuration:1.25];
    [UIView setAnimationCurve:UIViewAnimationCurveEaseInOut];
    CATransition *animation = [CATransition animation];
    animation.delegate = self;
    animation.duration = 1.0f;//动画执行时间
    animation.type = kCATransitionPush;  
    animation.subtype = kCATransitionFromRight;  
    // 这里添加你对UIView所做改变的代码  
    [[self.view.window.rootViewController.view layer] addAnimation:animation forKey:@"animation"];
    [UIView commitAnimations];
}

-(void)checkPage{
    NSString *isAppHomePageFun =@"typeof justep;";
    NSString *isX5Page = [contentWebView stringByEvaluatingJavaScriptFromString:isAppHomePageFun];
    if([isX5Page isEqualToString:@"undefined"]){
        //[BWStatusBarOverlay showSuccessWithMessage:@"首页不是合法的w页面！" duration:10 animated:true];
        [MPNotificationView notifyWithText:@"首页不是合法的w页面！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
        self.settingError = YES;
        [self openSettingDlg];
        return;
    }
}

#pragma mark - 注入js-oc桥

-(void)injectJsOcBridge{
    if (self.settingError == YES) {
        return;
    }
    NSDictionary *deviceProperties = [[self getCommandInstance:@"JustepAppDevice"] deviceProperties];
    NSMutableString *result = [[NSMutableString alloc] initWithFormat:@"DeviceInfo = %@;", [deviceProperties JSONFragment]];
    NSLog(@"Device initialization: %@", result);
    [contentWebView stringByEvaluatingJavaScriptFromString:result];
    [result release];
    
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"JustepApp" ofType:@"js"];
    NSString *injectBridge = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
    
    NSString *isAppHomePageFun =@"testCall();";
    NSString *injectDeviceToken = [[[NSString alloc] initWithFormat:@"window.justepApp.deviceToken = '%@';",deviceTokenStr] autorelease];
        
    NSString *isX5Page = [contentWebView stringByEvaluatingJavaScriptFromString:isAppHomePageFun];
    if(![isX5Page isEqualToString:@"true"]){
        //[BWStatusBarOverlay showSuccessWithMessage:@"服务器页面不正常！" duration:10 animated:true];
        [MPNotificationView notifyWithText:@"服务器页面不正常！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
        self.settingError = YES;
        [self openSettingDlg];
        return;
    }
    [contentWebView stringByEvaluatingJavaScriptFromString:injectBridge];
    [toolBarWebView stringByEvaluatingJavaScriptFromString:injectBridge];
    [contentWebView stringByEvaluatingJavaScriptFromString:injectDeviceToken];
    [toolBarWebView stringByEvaluatingJavaScriptFromString:injectDeviceToken];
    
}


#pragma mark 获取当前机器语言
//TODO 多语言能力暂未实现。
-(NSString *) getCurrentLanguage{
    @try {
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults]; 
        NSArray *languages = [defaults objectForKey:@"AppleLanguages"];
        
        NSString *currentLanguage = [languages objectAtIndex:0];
        return currentLanguage;
    }
    @catch (NSException *exception) {
        //NSLog(@"get language erro %@", [exception name]);
        return @"zh_CN";
    }
}



#pragma mark - gestureRecognizer
/**
-(void)reportHorizontalSwipe:(UIGestureRecognizer *)recognizer {

    UIAlertView *alert = [[UIAlertView alloc]
                          initWithTitle:@"我检测到一个手势："
                          message:[NSString stringWithFormat:@"%d指头在水平移动",[recognizer numberOfTouches]]
                          delegate:self
                          cancelButtonTitle:@"好呀!"
                          otherButtonTitles:nil];
    [alert show];
    NSString *injectSwipe = [[NSString alloc] initWithFormat:@"justep.webApp.reportGesture('%@','%d')",@"horizontal",[recognizer numberOfTouches]];
    
    [contentWebView stringByEvaluatingJavaScriptFromString:injectSwipe];
    [injectSwipe release];
}

-(void)reportVerticalSwipe:(UIGestureRecognizer *)recognizer {
   
   UIAlertView *alert = [[UIAlertView alloc]
                          initWithTitle:@"我检测到一个手势："
                          message:[NSString stringWithFormat:@"%d指头在垂直移动",[recognizer numberOfTouches]]
                          delegate:self
                          cancelButtonTitle:@"好呀!"
                          otherButtonTitles:nil];
   [alert show];

   NSString *injectSwipe = [[NSString alloc] initWithFormat:@"justep.webApp.reportGesture('%@','%d')",@"vertical",[recognizer numberOfTouches]];
    [contentWebView stringByEvaluatingJavaScriptFromString:injectSwipe];
   [injectSwipe release];
}
**/


#pragma mark - View lifecycle

- (void)viewDidLoad{
    [super viewDidLoad];
    /**
    UISwipeGestureRecognizer *vertical;
    UISwipeGestureRecognizer *horizontal;
    
    for (NSUInteger touchCount = 1; touchCount <= 5 ; touchCount++) {
        vertical =[[[UISwipeGestureRecognizer alloc]
                                              initWithTarget:self action:@selector(reportVerticalSwipe:)] autorelease];
        vertical.direction = UISwipeGestureRecognizerDirectionUp|UISwipeGestureRecognizerDirectionDown;
        vertical.numberOfTouchesRequired = touchCount;
        [self.view addGestureRecognizer:vertical];
        
        horizontal =[[[UISwipeGestureRecognizer alloc]
                                                initWithTarget:self action:@selector(reportHorizontalSwipe:)] autorelease];
        horizontal.direction = UISwipeGestureRecognizerDirectionLeft|UISwipeGestureRecognizerDirectionRight;
        horizontal.numberOfTouchesRequired = touchCount;
        [self.view addGestureRecognizer:horizontal];
    }**/
    
    if((!webViewsLoaded) && [contentWebView hash] && [toolBarWebView hash]){
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(appBecomeActive:)
                                                     name:UIApplicationDidBecomeActiveNotification object:nil];
        
        
        self.settingError = NO;
        self.webViewsLoaded = 1;
        contentWebView.delegate = self;
        toolBarWebView.delegate = self;

        [self loadSystem];

    }
   

}

#pragma mark 从后切换回来
-(void)appBecomeActive:(NSNotification *)notification{
    NSLog(@"becomeActive ");
    if(self.settingError == NO){
        NSString *isHomePage =  [contentWebView stringByEvaluatingJavaScriptFromString:@"testCall();"];
        if([isHomePage isEqualToString:@"true"]){
            [(JustepAppDelegate *)[[UIApplication sharedApplication] delegate] judgeShouldLoadNewVersion];
            [self handleRemoteNotification];
            
        }
    }
    
}


#pragma mark 处理推送
-(void)handleRemoteNotification{
    NSLog(@"handle收到推送消息：%@",notificationJs);
    [self.view bringSubviewToFront:self.view];
    [self performSelector:@selector(execPushNotification) withObject:nil afterDelay:1];
   
}

-(void)execPushNotification{
    [contentWebView stringByEvaluatingJavaScriptFromString:notificationJs];
     self.notificationJs=@""; 
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return NO;
    
    /** 不支持转向
    
    float version = [[[UIDevice currentDevice] systemVersion] floatValue];
    if(version < 5.0f){
        
    }
    
    //[self setToolBarHidden:toolBarWebViewHidden];
    if(interfaceOrientation == UIInterfaceOrientationPortraitUpsideDown){
        //竖直 home键在上面的拿法 不支持
        return NO;
    }else{
        orientation = interfaceOrientation;
        [self setToolBarHidden:toolBarWebViewHidden];
        return YES;
    }
     **/
}

#pragma mark 根据url处理事件
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request 
 navigationType:(UIWebViewNavigationType)navigationType {

    NSURL *url = [request URL];
    // 兼容以前about：blank的情况
    if (([[url absoluteString] hasPrefix:@"about:blank?"])) {
        
        JustepAppEvent *event =[[JustepAppEvent alloc] init:[[request URL] absoluteString]];
        if([[[request URL] absoluteString] rangeOfString:@"settingError=true"].location !=NSNotFound){
            self.settingError = YES;
        }
        [self eventHandle:event];
        [event autorelease];
        //[self fixIndexScale];
        return NO;
    }else if ([[[url scheme] lowercaseString] isEqualToString:@"justepapp"]) {
        
        
        [webView stringByEvaluatingJavaScriptFromString:
         @"justepApp.commandQueue.ready = false"];
        
        NSString* queuedCommandsJSON = [webView stringByEvaluatingJavaScriptFromString:
                                        @"justepApp.getAndClearQueuedCommands()"];
        
        
        
        [webView stringByEvaluatingJavaScriptFromString:@"justepApp.commandQueue.ready = true;"];

       
            NSArray* queuedCommands =[queuedCommandsJSON objectFromJSONString];
            
       
            for (NSString* commandJson in queuedCommands) {
                
                JustepAppCommand *jac =[JustepAppCommand initFromObject:
                                        [commandJson mutableObjectFromJSONString]];
                
                [self execute:jac];
                
            }
        
        return NO;
	}
    return YES;
}

+(NSString *) applicationDocumentsDirectory{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *basePath = ([paths count] >0) ? [paths objectAtIndex:0] :nil ;
    return basePath;
}


#pragma mark 如果app支持缩放的话，需要在某些情况还原到默认大小
-(void)fixIndexScale{
    
    UIScrollView *scroll=[self.contentWebView scrollView];
    int fixCount = 0;
    
//  NSString *scaleValue =  [contentWebView stringByEvaluatingJavaScriptFromString:@"new FlameViewportScale().getScale()"];
//    
//    NSString *zoomValue = [[NSString alloc] initWithFormat:@"contentWebView.bounds.size.width is %f and scroll.contentSize.width is %f and scaleValue is %@",self.contentWebView.bounds.size.width,scroll.contentSize.width,scaleValue];
//    UIAlertView *alert = [[[UIAlertView alloc]
//                           initWithTitle:@"content zoom is ："
//                           message:zoomValue
//                           delegate:self
//                           cancelButtonTitle:@"知道了!"
//                           otherButtonTitles:nil] autorelease];
//    [alert show];

        
    
    
//    float newZoom = [scaleValue floatValue];
//    float lastZoom = 1.0f;
//    while (newZoom != lastZoom &&fixCount < 3) {
//        //float zoom=self.contentWebView.bounds.size.width/scroll.contentSize.width;
//        lastZoom = newZoom;
//        [scroll setZoomScale:newZoom animated:YES]; 
//        fixCount++;
//        newZoom = [[contentWebView stringByEvaluatingJavaScriptFromString:@"new FlameViewportScale().getScale()"] floatValue];
//    }
    
    while (self.contentWebView.bounds.size.width != scroll.contentSize.width &&fixCount < 3) {
                float zoom=self.contentWebView.bounds.size.width/scroll.contentSize.width;
                [scroll setZoomScale:zoom animated:YES]; 
                fixCount++;
        //      newZoom = [[contentWebView stringByEvaluatingJavaScriptFromString:@"new FlameViewportScale().getScale()"] floatValue];
    }
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
	NSLog(@"In handleOpenURL");
	if (!url) { return NO; }
	
	NSLog(@"URL = %@", [url absoluteURL]);
	invokedURL = url;
	
	return YES;
}




- (void)webViewDidFinishLoad:(UIWebView *)webView{
    if(self.injectedJsOcBridge == NO && [webView isEqual:contentWebView] && self.settingError == NO){
        NSString *viewUrl = webView.request.URL.absoluteString;
        NSRange indexRang = [viewUrl rangeOfString:@"mIndex.w"];
        if(indexRang.length > 0){
           [self injectJsOcBridge];
           self.injectedJsOcBridge = YES;
        }else{
            [self checkPage];
        }
        
    }
    [HUD hide:YES];
}

-(void)dealloc{
    if(uploader !=nil){
        [uploader release];  
    }
   
    contentUrlStr = nil;
    contentWebView.delegate =nil;
    toolBarWebView.delegate =nil;
    if(contentUrlStr != nil){
        [contentUrlStr release];    
    }
    contentWebView  =nil;
    [contentWebView release];
    toolBarWebView = nil;
    [toolBarWebView release];
    contentRequest = nil;
    [contentRequest release];
    toolBarRequest = nil;
    [toolBarRequest release];
    [invokedURL release];
    [super dealloc];
}

@end