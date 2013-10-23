//
//  JustepUploader.h
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

#import <UIKit/UIKit.h>
#import "JustepFinderController.h"


@protocol JustepUploaderDelegate
- (void)uploadComplete:(NSString *)docServerResponse;
-(NSString *)getDocServerUrl;
-(void)pickerDisAppear;
-(void)pickerAppear:(UIViewController *)picker;
@end

@interface JustepUploader :UIViewController<UIActionSheetDelegate,UINavigationControllerDelegate,UIImagePickerControllerDelegate,UITextFieldDelegate,JustepFinderControllerDelegate,UIPopoverControllerDelegate>

@property (retain,nonatomic) id<JustepUploaderDelegate> uploaderCallback;
@property (retain,nonatomic) NSData *fileData;
@property (retain,nonatomic) NSString *fileName,*docServerResponse;
@property (strong, nonatomic) UINavigationController *navController;
@property (strong, nonatomic) UIPopoverController *popController;
@property (strong, nonatomic) UITextField *fileNameTextFiled;

-(void)uploadCurrentFileWithUrl:(NSString *)serverUrl;
-(void)beginUpload;

@end

