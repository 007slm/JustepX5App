//
//  JustepFinderController.h
//  Nav
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-9-14.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MPNotificationView.h"


@class JustepFinderController;
@protocol JustepFinderControllerDelegate

- (void)finderPickerControllerDidCancel:(JustepFinderController *)finder;
-(void)finderPickerController:(JustepFinderController *)finder didFinishPickingFileWithInfo:(NSString *)filePath;

@end



@interface JustepFinderController : UITableViewController
- (IBAction)toggleEdit:(id)sender;
- (IBAction)toggleBack:(id)sender;
@property (strong, nonatomic) id<JustepFinderControllerDelegate> delegate;
@property (strong, nonatomic) NSMutableArray *list;
@property (strong, nonatomic) UIImage *rowImage;
@property (strong,nonatomic) NSString *documentDir;

@end
