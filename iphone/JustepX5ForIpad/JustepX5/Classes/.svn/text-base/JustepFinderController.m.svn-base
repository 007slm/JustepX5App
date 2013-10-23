//
//  JustepFinderController.m
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
//  JustepApp 内部finder逻辑
//

#import "JustepFinderController.h"
#import "JustepFile.h"
#import "JustepFileDetailController.h"

@implementation JustepFinderController
@synthesize rowImage;
@synthesize list;
@synthesize documentDir,delegate;



- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.tableView reloadData];
}

/**
- (NSString *)tableView:(UITableView *)tableView titleForDeleteConfirmationButtonForRowAtIndexPath:(NSIndexPath *)indexPath{
    return @"上传";
} 
**/
- (IBAction)toggleBack:(id)sender {
    [self.delegate finderPickerControllerDidCancel:self];
}



- (IBAction)toggleEdit:(id)sender {
    [self.tableView setEditing:!self.tableView.editing animated:YES];
    if (self.tableView.editing)
        [self.navigationItem.rightBarButtonItem setTitle:@"确定"];
    else
        [self.navigationItem.rightBarButtonItem setTitle:@"删除"];
}


- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    
     return YES;
//    if (indexPath.section == 0) {
//       
//    }else {
//        return YES;
//    }
}


-(UITableViewCellEditingStyle) tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath{
        return UITableViewCellEditingStyleDelete;
}


- (void)viewDidLoad {
    [super viewDidLoad];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    //在这里获取应用程序Documents文件夹里的文件及文件夹列表
    NSArray *documentPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    self.documentDir = [NSString stringWithFormat:@"%@",[documentPaths objectAtIndex:0]];
    NSError *error = nil;
    
  
    //fileList便是包含有该文件夹下所有文件的文件名及文件夹名的数组
     NSArray *fileList = [fileManager contentsOfDirectoryAtPath:documentDir error:&error] ;
    
    self.list = [[[NSMutableArray alloc] init] autorelease];
    
    for (int i =0; i < fileList.count; i++) {
        NSString *fileName = [fileList objectAtIndex:i];
        NSString *filePath = [documentDir  
                              stringByAppendingPathComponent:fileName];
        
        NSDictionary * attributes = [fileManager attributesOfItemAtPath:filePath error:nil];
        
        JustepFile *file = [[[JustepFile alloc] init] autorelease];
        file.name = fileName;
        NSDateFormatter *dateFormatter = [[[NSDateFormatter alloc] init] autorelease];
        [dateFormatter setDateFormat: @"yyyy-MM-dd HH:mm:ss"]; 
        file.size = [NSString stringWithFormat:@"%@",[attributes valueForKey:@"NSFileSize"]];
        file.creatTime = [dateFormatter stringFromDate:[attributes valueForKey:@"NSFileCreationDate"]];
        file.lastModifyTime = [dateFormatter stringFromDate:[attributes valueForKey:@"NSFileModificationDate"]];
        file.fileType = [attributes valueForKey:@"NSFileType"];
        [self.list addObject:file];
    }
    self.navigationItem.rightBarButtonItem = [[[UIBarButtonItem alloc]
                                              initWithTitle:@"删除"
                                              style:UIBarButtonItemStyleBordered
                                              target:self
                                              action:@selector(toggleEdit:)] autorelease];
    self.navigationItem.leftBarButtonItem = [[[UIBarButtonItem alloc]
                                   initWithTitle:@"取消"
                                   style:UIBarButtonItemStyleBordered
                                   target:self
                                   action:@selector(toggleBack:)] autorelease];
}


//-(void) describeDictionary:(NSDictionary *)dict
//{
//    NSArray *keys;
//    int i, count;
//    id key, value;
//    
//    keys = [dict allKeys];
//    count = [keys count];
//    for (i = 0; i < count; i++)
//    {
//        key = [keys objectAtIndex: i];
//        value = [dict objectForKey: key];
//        NSLog (@"Key: %@ for value: %@", key, value);
//    }
//}


#pragma mark -
#pragma mark Table Data Source Methods
- (NSInteger)tableView:(UITableView *)tableView
 numberOfRowsInSection:(NSInteger)section {
    return [list count];
}

-(IBAction)upload:(id)sender{
    UIButton *senderButton = (UIButton *)sender;
    UITableViewCell *buttonCell =
    (UITableViewCell *)[senderButton superview];
    NSUInteger buttonRow = [[self.tableView
                             indexPathForCell:buttonCell] row];
    JustepFile *file = [list objectAtIndex:buttonRow];
    [[self delegate] finderPickerController:self didFinishPickingFileWithInfo:file.name];
}

@class JustepUploader;
- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString *JustepFinderCellIdentifier =
    @"JustepFinderCellIdentifier";
    
    UITableViewCell *cell = [tableView
                             dequeueReusableCellWithIdentifier:JustepFinderCellIdentifier];
    NSUInteger row = [indexPath row];
    JustepFile *file = [self.list objectAtIndex:row];
    
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] 
                initWithStyle:UITableViewCellStyleDefault
                reuseIdentifier:JustepFinderCellIdentifier] autorelease];
        if([self.delegate isKindOfClass:[JustepUploader class]]){
            UIImage *buttonUpImage = [UIImage imageNamed:@"ButtonUp.png"];
            UIImage *buttonDownImage = [UIImage imageNamed:@"ButtonDown.png"];
            UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
            button.frame = CGRectMake(0.0, 0.0, buttonUpImage.size.width,
                                      buttonUpImage.size.height);
            [button setBackgroundImage:buttonUpImage
                              forState:UIControlStateNormal];
            [button setBackgroundImage:buttonDownImage
                              forState:UIControlStateHighlighted];
            [button setTitle:@"上传" forState:UIControlStateNormal];
            [button addTarget:self action:@selector(upload:)
             forControlEvents:UIControlEventTouchUpInside];
            cell.accessoryView = button;
        }
        
    }
    
    cell.textLabel.text = file.name;
    cell.detailTextLabel.text = [NSString stringWithFormat:@"%@Byte",
                                 file.size];
    return cell;
}

#pragma mark -
#pragma mark Table View Data Source Methods
- (void)tableView:(UITableView *)tableView
commitEditingStyle:(UITableViewCellEditingStyle)editingStyle
forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) { 
        NSFileManager *defaultManager;
        defaultManager = [NSFileManager defaultManager];
        NSUInteger row = [indexPath row];
        
        JustepFile *file =[self.list objectAtIndex:row];
        NSError **error = nil;
        if([defaultManager  removeItemAtPath:[documentDir stringByAppendingPathComponent:file.name] error:error]){
            [self.list removeObjectAtIndex:row];
            [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath]
                             withRowAnimation:UITableViewRowAnimationAutomatic];  
            
        }else{
            //[BWStatusBarOverlay showSuccessWithMessage:@"删除文件失败" duration:3 animated:YES];
            [MPNotificationView notifyWithText:@"删除文件失败" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:3];
            
        }
        
        
    }else if (editingStyle == UITableViewCellEditingStyleInsert){
        
    }
   
}

//查看文件
- (void)tableView:(UITableView *)tableView
accessoryButtonTappedForRowWithIndexPath:(NSIndexPath *)indexPath {
    NSUInteger row = [indexPath row];
    JustepFile *file = [self.list objectAtIndex:row];
    [[self delegate] finderPickerController:self didFinishPickingFileWithInfo:file.name];

}




//点击行 出上传按钮上传
#pragma mark -
#pragma mark Table Delegate Methods
- (void)tableView:(UITableView *)tableView
didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    NSUInteger row = [indexPath row];
    JustepFile *file = [self.list objectAtIndex:row];
    
    JustepFileDetailController *detailController =
    [[[JustepFileDetailController alloc] initWithStyle:UITableViewStyleGrouped] autorelease];
    detailController.title = file.name;
    detailController.documentDir = self.documentDir;
    detailController.file = file;
    [self.navigationController pushViewController:detailController
                                         animated:YES];
    
    
   }
    

@end
