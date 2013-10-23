//
//  JustepUploader.m
//  JustepUploader
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-8-31.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import "JustepUploader.h"
#define isPad (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
@implementation JustepUploader


@synthesize fileData,fileName,docServerResponse,uploaderCallback,navController,popController;

-(void)viewDidLoad{
    
    [super viewDidLoad];
    
}

#pragma mark 上传
-(void)uploadCurrentFileWithUrl:(NSString *)serverUrl{
    NSMutableURLRequest *request = [[[NSMutableURLRequest alloc] init] autorelease];
	[request setURL:[NSURL URLWithString:serverUrl]];
	[request setHTTPMethod:@"POST"];
	NSString *boundary = @"---------------------------14737809831466499882746641449";
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@",boundary];
	[request addValue:contentType forHTTPHeaderField: @"Content-Type"];
	
	NSMutableData *body = [NSMutableData data];
	[body appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];	
	[body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"userfile\"; filename=\"%@\"\r\n",fileName] dataUsingEncoding:NSUTF8StringEncoding]];
    //文档服务是通过后缀判断content-type 所以这里类型那个可以传stram
	[body appendData:[@"Content-Type: application/octet-stream\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
	[body appendData:[NSData dataWithData:fileData]];
	[body appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	[request setHTTPBody:body];
    //TODO:异常处理
    NSError *error = nil;
	NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:&error];
    if(error){
        NSString *message = [[NSString alloc] initWithFormat:@"原因[%@],地址描述[%@]",[error description],serverUrl];
        UIAlertView *alert = [[[UIAlertView alloc]
                              initWithTitle:@"连接文档服务上传失败"
                              message:message
                              delegate:self
                              cancelButtonTitle:@"确定" otherButtonTitles:nil, nil
                              ] autorelease];
        [alert show];
        [message release];
            
    }
	NSString *returnString = [[[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding] autorelease];
    [self.uploaderCallback uploadComplete:returnString];
    
}



#define TEXTFILE 9999
#define ACTIONSHEET 8888
-(void)beginUpload{
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    self.fileName = nil;
    UIActionSheet* actionSheet = [[UIActionSheet alloc]
                                  initWithTitle:@"请选择文件来源"
                                  delegate:self
                                  cancelButtonTitle:@"取消"
                                  destructiveButtonTitle:nil
                                  otherButtonTitles:@"照相机",@"摄像机",@"本地相簿",@"本地视频",@"文档",nil];
    actionSheet.tag = ACTIONSHEET;
    
     
     [actionSheet showInView:self.view];
     [actionSheet setBackgroundColor:[UIColor blackColor]];
     [actionSheet release];
}



#pragma mark - 选择不同附件类型逻辑
#pragma UIActionSheet Delegate
- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex
{  
    NSDateFormatter *formatter = [[[NSDateFormatter alloc] init] autorelease];
    [formatter setDateFormat:@"MMddhhmmss"];
    NSString *currentDateStr = [formatter stringFromDate:[NSDate date]];
    switch (buttonIndex) {
        case 0://照相机
        {   UIImagePickerController *imagePicker = [[UIImagePickerController alloc] init];
            
            imagePicker.view.frame = CGRectMake(0, 0, 500, 500);
            imagePicker.delegate = self;
            imagePicker.allowsEditing = YES;
            imagePicker.sourceType = UIImagePickerControllerSourceTypeCamera;
            imagePicker.mediaTypes =  [[[NSArray alloc] initWithObjects: (NSString *) @"public.image", nil] autorelease];
            if(self.fileName != nil){
                self.fileName = [self.fileName stringByAppendingString:@".jpg"];
            }else{
                self.fileName = [NSString stringWithFormat:@"img%@.jpg", currentDateStr];
            }
            
            [self.uploaderCallback pickerAppear:imagePicker];
            [imagePicker release];
        }
            break;
        case 1://摄像机
        {                 UIImagePickerController *imagePicker = [[UIImagePickerController alloc] init];
            imagePicker.delegate = self;
            imagePicker.allowsEditing = YES;
            imagePicker.sourceType = UIImagePickerControllerSourceTypeCamera;
            imagePicker.mediaTypes = [[[NSArray alloc] initWithObjects: (NSString *) @"public.movie", nil] autorelease];
            imagePicker.videoQuality = UIImagePickerControllerQualityTypeLow;
            
            if(self.fileName != nil){
                self.fileName = [self.fileName stringByAppendingString:@".mov"];
            }else{

                self.fileName = [NSString stringWithFormat:@"mov%@.jpg", currentDateStr];
            }
        
            [self.uploaderCallback pickerAppear:imagePicker];

            [imagePicker release];
        }
            break;
        case 2://本地相簿
        {                UIImagePickerController *imagePicker = [[UIImagePickerController alloc] init];
            imagePicker.delegate = self;
            imagePicker.allowsEditing = YES;
            imagePicker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
            imagePicker.mediaTypes =  [[[NSArray alloc] initWithObjects: (NSString *) @"public.image", nil] autorelease];
            
            if(isPad){
                
                UIPopoverController *popover = [[UIPopoverController alloc] initWithContentViewController:imagePicker];
                popover.delegate = self;
                self.popController = popover;
                
                
                [popController presentPopoverFromRect:CGRectMake(0, 0,500, 500) inView:self.view permittedArrowDirections:UIPopoverArrowDirectionAny animated:YES];
                
                
                [popover release];
                
            }else{
                [self presentModalViewController:imagePicker animated:YES];
            }
            [imagePicker release];
        }
            break;
        case 3://本地视频
        {               UIImagePickerController *imagePicker = [[UIImagePickerController alloc] init];
            imagePicker.delegate = self;
            imagePicker.allowsEditing = YES;
            imagePicker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
            imagePicker.mediaTypes =  [[[NSArray alloc] initWithObjects: (NSString *) @"public.movie", nil] autorelease];            
            if(isPad){
                
                UIPopoverController *popover = [[UIPopoverController alloc] initWithContentViewController:imagePicker];
                popover.delegate = self;
                self.popController = popover;
                
                
                [popController presentPopoverFromRect:CGRectMake(0, 0, 500, 500) inView:self.view permittedArrowDirections:UIPopoverArrowDirectionAny animated:YES];
                
                
                [popover release];
                
            }else{
                [self presentModalViewController:imagePicker animated:YES];
            }
            [imagePicker release];
        }
            break;
        case 4://文档
        {
            
            JustepFinderController *finder = [[JustepFinderController alloc] initWithStyle:UITableViewStylePlain];
            
            self.navController = [[[UINavigationController alloc]
                                  initWithRootViewController:finder] autorelease];
            if([[[UIDevice currentDevice] systemVersion] floatValue]< 5.0f){
                [finder viewDidAppear:YES];                
            }

            finder.delegate = self;
            
            
            
            [self.uploaderCallback pickerAppear:navController];
            
            
        }
            break;    
        case 5://取消
        {
            [[self uploaderCallback] pickerDisAppear];
        }
            break;
        default:
            break;
    }
}
-(void)popoverControllerDidDismissPopover:(UIPopoverController *)popoverController{
    [self.uploaderCallback pickerDisAppear];
}

#pragma mark 本地上传

-(void)finderPickerController:(JustepFinderController *)finder didFinishPickingFileWithInfo:(NSString *)filePath{
    
    self.fileName = filePath;
    
    //获取文件路径
    NSArray *documentPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentDir = [NSString stringWithFormat:@"%@",[documentPaths objectAtIndex:0]];
    
    NSString *fileFullPath= [documentDir  
                        stringByAppendingPathComponent:filePath];
    
    //获取数据 
    self.fileData = [NSData dataWithContentsOfFile:fileFullPath];
    
 
    [finder dismissModalViewControllerAnimated:YES];
    [self uploadCurrentFileWithUrl:[self.uploaderCallback getDocServerUrl]];
    [self.uploaderCallback pickerDisAppear];
}

- (void)finderPickerControllerDidCancel:(JustepFinderController *)finder 
{
    
    //[picker.view removeFromSuperview];
    [finder dismissModalViewControllerAnimated:YES];
    [self.uploaderCallback pickerDisAppear];
    
}

#pragma mark 图片或者视频

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info{
    if ([[info objectForKey:UIImagePickerControllerMediaType] isEqualToString:(NSString*)@"public.image"]) {
        UIImage  *img = [info objectForKey:UIImagePickerControllerEditedImage];
        self.fileData = UIImageJPEGRepresentation(img, 1.0);
        
    } else if ([[info objectForKey:UIImagePickerControllerMediaType] isEqualToString:(NSString*)@"public.movie"]) {
        NSString *videoPath = [[info objectForKey:UIImagePickerControllerMediaURL] path];
        self.fileData = [NSData dataWithContentsOfFile:videoPath]; 
    }
    if([info valueForKey:UIImagePickerControllerReferenceURL]!=nil){
        NSURL *selectedPath = [info objectForKey:@"UIImagePickerControllerReferenceURL"];
        
        if(self.fileName != nil && !([self.fileName rangeOfString:@"."].length > 0)){
           NSString *selectedNameExt = [selectedPath pathExtension];
           self.fileName = [[self.fileName stringByAppendingString:@"."] stringByAppendingString:selectedNameExt];
        }else{
            NSString *selectedName = [selectedPath lastPathComponent];
            self.fileName = selectedName;
        }
    }
    
    [picker dismissModalViewControllerAnimated:YES];
    
    [self uploadCurrentFileWithUrl:[self.uploaderCallback getDocServerUrl]];
    if(isPad){
        [self.popController dismissPopoverAnimated:YES];
    }
    [self.uploaderCallback pickerDisAppear];
}



- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker 
{
    [picker dismissModalViewControllerAnimated:YES];
    if(isPad){
        [self.popController dismissPopoverAnimated:YES];
    }
    [self.uploaderCallback pickerDisAppear];
}

@end
