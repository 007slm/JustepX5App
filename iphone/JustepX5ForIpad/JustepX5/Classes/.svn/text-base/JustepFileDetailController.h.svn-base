//
//  JustepFileDetailController.h
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
#import "JustepFile.h"
#import "MPNotificationView.h"
// 暂时不提供目录的展示和修改名称
#define kNumberOfEditableRows         4
#define kFileNameRowIndex 0
#define kCreatTimeRowIndex 1
#define kLastModifyTimeRowIndex 2
#define kSizeIndex 3
#define kFileTypeIndex 4

#define kLabelTag                     4096

@interface JustepFileDetailController : UITableViewController<UITextFieldDelegate> {
    NSArray *fieldLabels;
    NSMutableDictionary *tempValues;
}



@property (strong, nonatomic) JustepFile *file;
@property (retain,nonatomic) NSArray *fieldLabels;
@property (retain, nonatomic) NSMutableDictionary *tempValues;
@property (strong, nonatomic) UITextField *currentTextField;
@property (strong, nonatomic) NSString *documentDir;

- (IBAction)cancel:(id)sender;
- (IBAction)save:(id)sender;
- (IBAction)textFieldDone:(id)sender;
@end
