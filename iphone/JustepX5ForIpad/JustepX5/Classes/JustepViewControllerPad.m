//
//  JustepViewControllerPad.m
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


#import "JustepViewControllerPad.h"


@implementation JustepViewControllerPad

@synthesize contentWebView,injectedJsOcBridge,injectedAgentJsOcBridge,webViewsLoaded,contentRequest,orientation,settingController,contentUrlStr,settingError,uploader,download,attachmentController,HUD,deviceTokenStr,notificationJs,commandObjects,invokedURL,tileController,settingImage,tileMenuTitle,tileMenuAction,tileMenuRGBA,navController;

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
    id obj = [commandObjects objectForKey:className] ;
    if (!obj) {
        obj = [[NSClassFromString(className) alloc]  initWithWebView:contentWebView];
        
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
	
    if([command.className isEqualToString:@"JustepViewControllerPad"]){
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
//    [BWStatusBarOverlay setBackgroundColor:[UIColor blueColor]];
//    [BWStatusBarOverlay setAnimation:BWStatusBarOverlayAnimationTypeFromTop];
//    
//    [BWStatusBarOverlay showSuccessWithMessage:@"下载完成" duration:4 animated:YES];
    
    [MPNotificationView notifyWithText:@"下载完成!" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:4];
    
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


#pragma mark - eventHandle
/**
 用来处理页面派发过来的事件
 废弃的兼容函数
**/ 
-(void) eventHandle:(JustepAppEvent *)eventData{
    if([@"log" isEqualToString:[eventData event]]){
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

- (void)finderPickerControllerDidCancel:(JustepFinderController *)finder
{
    
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
    NSString *logoutUrl = @"justep.Portal.logout();";
    [contentWebView stringByEvaluatingJavaScriptFromString:logoutUrl];
    
}

-(void)logOut{
    [self logoutAction];
  //  [BWStatusBarOverlay showSuccessWithMessage:@"注销成功！" duration:10 animated:true];
    [MPNotificationView notifyWithText:@"注销成功！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
    self.settingError=YES;
    [self openSettingDlg];
    [self.settingController.barItem setTitle:@"登录"];
}

-(void) initUploader{
    if(self.uploader ==nil){
        self.uploader = [[[JustepUploader alloc] initWithNibName:@"JustepUploaderPad"  bundle:nil] autorelease];
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
    [self presentModalViewController:picker animated:YES ];
}


-(void)pickerDisAppear{
    [self.view sendSubviewToBack:self.uploader.view];
    [self.view bringSubviewToFront:self.contentWebView];
    [self.view bringSubviewToFront:self.settingImage];
}

#pragma mark 初始化访问参数并加载
-(int)buildRequest{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *userName = [defaults objectForKey:@"username"];
    NSString *password = [defaults objectForKey:@"password"];
    NSString *url = [defaults objectForKey:@"url"];
    
    if (url !=nil) {
        NSRange range = [url rangeOfString:@"/UI/"];
        
        if (range.length <= 0 ) {
            NSRange httpRange = [url rangeOfString:@"http:"];
            if(httpRange.length <= 0){
                url = [NSString stringWithFormat:@"http://%@/x5/UI/portal2/process/portal/DirectLogin.j",url];
            }else{
                url = [NSString stringWithFormat:@"%@/x5/UI/portal2/process/portal/DirectLogin.j",url];
            }
            
        }
    }else if(userName == nil && password == nil && url == nil){
        userName = @"x5";
        password = @"123456";
        url = @"http://demo.justep.com/x5/UI/portal2/process/portal/DirectLogin.j";
        
        [defaults setObject:userName forKey:@"username"];
        [defaults setObject:password forKey:@"password"];
        [defaults setObject:@"demo.justep.com" forKey:@"url"];
        [defaults synchronize];
        
        
    }else if(userName == nil || password == nil || url == nil){
        self.settingError = YES;
        //[BWStatusBarOverlay showSuccessWithMessage:@"连接信息不能为空！" duration:10 animated:true];
        [MPNotificationView notifyWithText:@"连接信息不能为空！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
        [self openSettingDlg];
        return NO;
    }
    password = [self md5:password];
    NSRange range = [url rangeOfString:@"/UI/"];
    
    if (range.length > 0 ) {
        NSDate *now =[NSDate date];
        NSDateFormatter *formatter = [[[NSDateFormatter alloc]init] autorelease];
        [formatter setDateFormat:@"yyyy-MM-dd"];
        NSString *str = [formatter stringFromDate:now];
        
        NSString *encodedUsername = (NSString *)CFURLCreateStringByAddingPercentEscapes(NULL, (CFStringRef)userName, NULL, (CFStringRef)@"!*'();:@&=+$,/?%#[]", kCFStringEncodingUTF8);
        
        contentUrlStr = [[[[[[url stringByAppendingString:@"?username="] stringByAppendingString:encodedUsername] stringByAppendingString:@"&password="] stringByAppendingString:password] stringByAppendingString:@"&loginDate="] stringByAppendingString:str];
        
        self.contentRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:contentUrlStr] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
        Reachability *r = [Reachability reachabilityWithHostName:[[contentRequest URL] host]];
        
        switch ([r currentReachabilityStatus]) {
            case NotReachable:
                // 没有网络连接
                self.settingError = YES;
                //[BWStatusBarOverlay showSuccessWithMessage:@"好像没有网络连接到服务器！" duration:10 animated:true];
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
        //[BWStatusBarOverlay showSuccessWithMessage:@"连接地址不正确！" duration:10 animated:true];
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

-(void)loadIndexContent{
    self.injectedJsOcBridge = NO;
    self.injectedAgentJsOcBridge = NO;
    if([self buildRequest]){
        //[[NSURLCache sharedURLCache] removeAllCachedResponses];
        NSHTTPURLResponse *response =nil;
        NSError *error = nil;
        NSData *responseData = [NSURLConnection sendSynchronousRequest:self.contentRequest returningResponse:&response error:&error];
        if(error != nil){
            [MPNotificationView notifyWithText:@"连接服务器失败！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
            self.settingError = YES;
            [self openSettingDlg];
        }else if (response == nil){
            [MPNotificationView notifyWithText:@"连接服务器无响应！" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:10];
            self.settingError = YES;
            [self openSettingDlg];
        }else if ([response statusCode] != 200){
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

-(void)loadSystem{
    [self logoutAction];
    [self performSelector:@selector(loadIndexContent) withObject:nil afterDelay:1];
}

-(void)openSettingDlg{
    [UIView beginAnimations:@"suckEffect" context:nil];
    [UIView setAnimationDuration:1.00];
    
    [UIView setAnimationCurve:UIViewAnimationCurveEaseInOut];
    
    if(self.settingController == nil){
        self.settingController = [[[JustepSettingController alloc] initWithNibName:@"JustepSettingControllerPad" bundle:nil] autorelease];
        self.settingController.delegate = self;
    }
   
    
    [self.view insertSubview:self.settingController.view atIndex:2];
    self.view.autoresizingMask = YES;
    if(self.settingError == YES){
       [self.settingController.barItem setTitle:@"登录"];
    }else{
       [self.settingController.barItem setTitle:@"返回/登录"];
    }
    [self changeSubViewLocation:nil];
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
        self.attachmentController = [[[JustepAttachmentController alloc] initWithNibName:@"JustepAttachmentControllerPad" bundle:nil] autorelease];
        self.attachmentController.attachmentDelegate = self;
        [self.attachmentController.attachWebView.scrollView setBounces:FALSE];
        
    }

    [self.view insertSubview:self.attachmentController.view atIndex:4];
    
    
    float version = [[[UIDevice currentDevice] systemVersion] floatValue];
    if(version < 5.0f){
        [self.attachmentController viewDidAppear:YES];   
    }
    [self changeSubViewLocation:0];
    [UIView beginAnimations:@"suckEffect" context:nil];
    [UIView setAnimationDuration:1.25];
    [UIView setAnimationCurve:UIViewAnimationCurveEaseInOut];
    CATransition *animation = [CATransition animation];
    animation.delegate = self;
    animation.duration = 1.0f;//动画执行时间
    animation.type = kCATransitionPush;  
    animation.subtype = kCATransitionFromRight;  
    // 这里添加你对UIView所做改变的代码  
    [[self.view layer] addAnimation:animation forKey:@"animation"];
    [UIView commitAnimations];
}

-(void)checkPage{
    NSString *isAppHomePageFun =@"typeof justep;";
    NSString *isX5Page = [contentWebView stringByEvaluatingJavaScriptFromString:isAppHomePageFun];
    if([isX5Page isEqualToString:@"undefined"]){
      //  [BWStatusBarOverlay showSuccessWithMessage:@"首页不是合法的w页面！" duration:10 animated:true];
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
    
    NSString *isAppHomePageFun =@"window.justep?true:false";
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
    [contentWebView stringByEvaluatingJavaScriptFromString:injectDeviceToken];
    
}

-(void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration{
    if(settingImage == NULL){
        settingImage = [[UIImageView alloc] initWithFrame:CGRectMake(UIScreenWidth-settingImageWidth,UIScreenHeight-settingImageHeight-20,settingImageWidth,settingImageHeight)];
        settingImage.image = [UIImage imageNamed:@"CloseButton@2x.png"];
        [settingImage setUserInteractionEnabled:YES];
        [self.view addSubview:settingImage];
        //settingImage点击手势
        UITapGestureRecognizer *taJustepAppesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(handleSettingGesture:)];
        //设置手势点击数 点下
        taJustepAppesture.numberOfTapsRequired=1;
        // imageView添加手势识别
        [settingImage addGestureRecognizer:taJustepAppesture];
        //释放内存
        [taJustepAppesture release];
    }else{
        settingImage.frame = CGRectMake(UIScreenWidth-settingImageWidth,UIScreenHeight-settingImageHeight-20,settingImageWidth,settingImageHeight);
    }
    [self changeSubViewLocation:toInterfaceOrientation];
    
}


-(void) changeSubViewLocation:(UIInterfaceOrientation) toInterfaceOrientation {
    if(!toInterfaceOrientation){
        UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
        if(UIInterfaceOrientationIsLandscape(orientation)){
            toInterfaceOrientation = UIInterfaceOrientationLandscapeLeft;
        }else if(UIInterfaceOrientationIsPortrait(orientation)) {
            toInterfaceOrientation = UIInterfaceOrientationPortrait;
        }
    }
    // 纵向
    if(toInterfaceOrientation == UIInterfaceOrientationPortrait || toInterfaceOrientation == UIInterfaceOrientationPortraitUpsideDown){
        
        if(settingImage){
            settingImage.frame = CGRectMake(UIScreenWidth-settingImageWidth,UIScreenHeight-settingImageHeight-20,settingImageWidth,settingImageHeight);
            
        }
        if(settingController){
            settingController.view.frame = CGRectMake(0,0,UIScreenWidth,UIScreenHeight-20);
        }
        if(attachmentController){
            attachmentController.view.frame = CGRectMake(0,0,UIScreenWidth,UIScreenHeight-20);
            
            
        }
    //横向
    }else{
        if(settingImage){
            settingImage.frame = CGRectMake(UIScreenHeight-settingImageWidth,UIScreenWidth-settingImageHeight-20,settingImageWidth,settingImageHeight);
        }
        if(settingController){
            settingController.view.frame = CGRectMake(0,0,UIScreenHeight,UIScreenWidth - 20);
        }
        if(attachmentController){
           attachmentController.view.frame = CGRectMake(0,0,UIScreenHeight,UIScreenWidth - 20);
            
            
            
        }
    }
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
    if((!webViewsLoaded) && [contentWebView hash]){
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(appBecomeActive:)
                                                     name:UIApplicationDidBecomeActiveNotification object:nil];
        
        self.settingError = NO;
        self.webViewsLoaded = 1;
        contentWebView.delegate = self;
        [self loadSystem];
        if(settingImage == NULL){
            settingImage = [[UIImageView alloc] initWithFrame:CGRectMake(UIScreenWidth-settingImageWidth,UIScreenHeight-settingImageHeight-20,settingImageWidth,settingImageHeight)];
            
            settingImage.image = [UIImage imageNamed:@"CloseButton@2x.png"];
            [settingImage setUserInteractionEnabled:YES];
            [self.view addSubview:settingImage];
            
            
            //settingImage点击手势
            UITapGestureRecognizer *taJustepAppesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(handleSettingGesture:)];
            //设置手势点击数 点下
            taJustepAppesture.numberOfTapsRequired=1;
            // imageView添加手势识别
            [settingImage addGestureRecognizer:taJustepAppesture];
            //释放内存
            [taJustepAppesture release];
            
        }
    }
    [self changeSubViewLocation:nil];

}

-(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer{
    return YES;
}

#pragma mark 从后切换回来
-(void)appBecomeActive:(NSNotification *)notification{
    NSLog(@"becomeActive ");
    if(self.settingError == NO){
        NSString *isHomePage =  [contentWebView stringByEvaluatingJavaScriptFromString:@"window.justep?true:false"];
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
       return YES;
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
    while (self.contentWebView.bounds.size.width != scroll.contentSize.width &&fixCount < 3) {
                float zoom=self.contentWebView.bounds.size.width/scroll.contentSize.width;
                [scroll setZoomScale:zoom animated:YES]; 
                fixCount++;
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
    NSString *viewUrl = webView.request.URL.absoluteString;
    NSRange indexRang = [viewUrl rangeOfString:@"index.w"];
    
    if(self.injectedJsOcBridge == NO && [webView isEqual:contentWebView] && self.settingError == NO){
        if(indexRang.length > 0){
           [self injectJsOcBridge];
           self.injectedJsOcBridge = YES;
        }else{
            [self checkPage];
        }
    }
    
    if([viewUrl rangeOfString:@"index.w?agent="].length > 0 && self.injectedAgentJsOcBridge == NO){
        [self injectJsOcBridge];
         self.injectedAgentJsOcBridge = YES;
    }
    [HUD hide:YES];
}

-(void)dealloc{
    if(uploader !=nil){
        [uploader release];  
    }
   
    contentUrlStr = nil;
    contentWebView.delegate =nil;
    settingImage = nil;
    if(contentUrlStr != nil){
        [contentUrlStr release];    
    }
    contentWebView  =nil;
    [contentWebView release];
   
   
    contentRequest = nil;
    [contentRequest release];
    [invokedURL release];
    [super dealloc];
}

#pragma mark - TileMenu delegate

-(void) initMGTileMenuByConfig{
    NSString *urlStr =[contentUrlStr stringByReplacingOccurrencesOfString:@"DirectLogin.j" withString:@"JustepAppConfig.json"];
    NSURL *url = [NSURL URLWithString:urlStr];
    NSError *error = nil;
    NSString *json2 = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
    NSDictionary *tileMenuDic = [json2 objectFromJSONStringWithParseOptions:JKParseOptionLooseUnicode error:&error];
    if(tileMenuDic){
        id *tileMenu = [tileMenuDic objectForKey:@"tileMenu_ios"];
        self.tileMenuTitle = [tileMenu objectForKey:@"tileMenuTitle"];
        self.tileMenuAction = [tileMenu objectForKey:@"tileMenuAction"];
        self.tileMenuRGBA = [tileMenu objectForKey:@"tileMenuRGBA"];
    }
}

- (void)tileMenu:(MGTileMenuController *)tileMenu didActivateTile:(NSInteger)tileNumber
{
	if(self.tileMenuAction){
        NSString *command = [self.tileMenuAction objectAtIndex:tileNumber];
        
        NSRange range = [command rangeOfString:@"javascript:"];
        if (range.length <= 0 ) {
            SEL selector = NSSelectorFromString(command);
            [self performSelector:selector];
        }else{
            [contentWebView stringByEvaluatingJavaScriptFromString:[command substringFromIndex:range.length]];
        }
        
    }else{
        NSString *command = nil;
        if(tileNumber == 0){
            command = @"openSettingDlg";
        }else if(tileNumber == 1){
            command = @"loadSystem";
            
        }else if(tileNumber == 2){
            command = @"logOut";
        }
        if(command != nil){
            SEL selector = NSSelectorFromString(command);
            [self performSelector:selector];
        }
        
    }
    
    [settingImage setHidden:false];
    [tileController dismissMenu];
    
}

- (NSInteger)numberOfTilesInMenu:(MGTileMenuController *)tileMenu
{
    if(tileMenuTitle){
        return [tileMenuTitle count];
    }else{
        return 3;
    }
}

- (NSString *)titleForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
    NSArray *labels = [NSArray arrayWithObjects:
					   @"设置",
					   @"刷新",
					   @"注销",
					   nil];
    if(tileMenuTitle && tileNumber >=0 && tileNumber < [tileMenuTitle count]){
        return [tileMenuTitle objectAtIndex:tileNumber];
    }
    
	if (tileNumber >= 0 && tileNumber < labels.count) {
		return [labels objectAtIndex:tileNumber];
	}
	return @"按钮";
}

-(UIColor *) rgba:(NSArray *)values{
    return [UIColor colorWithRed:[[values objectAtIndex:0] doubleValue]/255.0 green:[[values objectAtIndex:1] doubleValue]/255.0 blue:[[values objectAtIndex:2] doubleValue]/255.0 alpha:[[values objectAtIndex:3] doubleValue]];
}

-(UIColor *) colorForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu{
    if([self tileMenuRGBA] && tileNumber >=0 && tileNumber <[[self tileMenuRGBA] count]){
        NSString *rgba = [self.tileMenuRGBA objectAtIndex:tileNumber];
        NSArray *rgbaArray =[rgba  componentsSeparatedByString:@"/"];
        return  [self performSelector:@selector(rgba:) withObject:rgbaArray];
    }else{
        return nil;
    }
    
}

- (UIImage *)imageForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
    //	NSArray *images = [NSArray arrayWithObjects:
    //					   @"gear",
    //					   @"refresh",
    //					   @"logout",
    //					   nil];
    //	if (tileNumber >= 0 && tileNumber < images.count) {
    //		return [UIImage imageNamed:[images objectAtIndex:tileNumber]];
    //	}
	return nil;
}

- (NSString *)labelForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
	/**
    NSArray *labels = [NSArray arrayWithObjects:
					   @"setting",
					   @"refresh",
					   @"logout",
					   nil];
	if (tileNumber >= 0 && tileNumber < labels.count) {
		return [labels objectAtIndex:tileNumber];
	}
	**/
	return @"lable";
}


- (NSString *)descriptionForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
	//NSArray *hints = [NSArray arrayWithObjects:
    //                  @"setting",
    //                  @"refresh",
    //                  @"logout",
    //                  nil];
	//if (tileNumber >= 0 && tileNumber < hints.count) {
	//	return [hints objectAtIndex:tileNumber];
	//}
	return @"tile";
}



- (UIImage *)backgroundImageForTile:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
	//return [UIImage imageNamed:@"blue_gradient"];
    return nil;
}


- (BOOL)isTileEnabled:(NSInteger)tileNumber inMenu:(MGTileMenuController *)tileMenu
{
//	if (tileNumber == 2 || tileNumber == 6) {
//		return NO;
//	}
	
	return YES;
}

- (void)tileMenuDidDismiss:(MGTileMenuController *)tileMenu
{
    [settingImage setHidden:false];
    self.tileController = nil;
}


#pragma mark - Gesture handling


- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch
{
	// Ensure that only touches on our own view are sent to the gesture recognisers.
//	if (touch.view == self.contentWebView) {
//		return YES;
//	}
	
	return YES;
}

- (void)handleSettingGesture:(UIGestureRecognizer *)gestureRecognizer{
        CGPoint loc = [gestureRecognizer locationInView:self.view];
        if (!tileController || tileController.isVisible == NO) {
			if (!tileController) {
                [self initMGTileMenuByConfig];
				tileController = [[MGTileMenuController alloc] initWithDelegate:self];
				tileController.dismissAfterTileActivated = NO;
                
			}
            [settingImage setHidden:true];
			[tileController displayMenuCenteredOnPoint:loc inView:self.contentWebView];
		}else{
            if (!CGRectContainsPoint(tileController.view.frame, loc)) {
				[tileController dismissMenu];
			}
        }
}

@end