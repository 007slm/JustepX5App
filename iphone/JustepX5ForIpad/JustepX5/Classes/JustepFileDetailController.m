//
//  JustepFileDetailController.m
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

#import "JustepFileDetailController.h"


@implementation JustepFileDetailController

@synthesize file;
@synthesize fieldLabels;
@synthesize tempValues;
@synthesize currentTextField;
@synthesize documentDir;

- (IBAction)cancel:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

- (IBAction)save:(id)sender {
    if (currentTextField != nil) {
        NSNumber *tagAsNum = [NSNumber numberWithInt:currentTextField.tag];
        [tempValues setObject:currentTextField.text forKey:tagAsNum];
    }
    for (NSNumber *key in [tempValues allKeys]) {
        switch ([key intValue]) {
            case kFileNameRowIndex:
            {
                NSString *newFileName = [NSString stringWithFormat:@"%@",[tempValues objectForKey:key]];
                
                NSString *newPath= [documentDir  
                                    stringByAppendingPathComponent:newFileName];  
                
                NSString *oldPath= [documentDir  
                                    stringByAppendingPathComponent:file.name];  
                
                NSFileManager *fileManager = [NSFileManager defaultManager];
                
                NSError *error = nil;
                if ([fileManager moveItemAtPath:oldPath toPath:newPath error:&error] == YES) {
                    file.name = [tempValues objectForKey:key]; 
                } else{

                    [MPNotificationView notifyWithText:@"名字修改失败" detail:@"" image:[UIImage imageNamed:@"Logo.png"] andDuration:3];
                }
                break; 
            }
            default:
                break;
        }
    }
    [self.navigationController popViewControllerAnimated:YES];
    
    NSArray *allControllers = self.navigationController.viewControllers;
    UITableViewController *parent = [allControllers lastObject];
    [parent.tableView reloadData];
}

- (IBAction)textFieldDone:(id)sender {
    UITableViewCell *cell =
    (UITableViewCell *)[[sender superview] superview];
    UITableView *table = (UITableView *)[cell superview];
    NSIndexPath *textFieldIndexPath = [table indexPathForCell:cell];
    NSUInteger row = [textFieldIndexPath row];
    row++;
    if (row >= kNumberOfEditableRows) {
        row = 0;
    }
    NSIndexPath *newPath = [NSIndexPath indexPathForRow:row inSection:0];
    UITableViewCell *nextCell = [self.tableView
                                 cellForRowAtIndexPath:newPath];
    UITextField *nextField = nil;
    for (UIView *oneView in nextCell.contentView.subviews) {
        if ([oneView isMemberOfClass:[UITextField class]])
            nextField = (UITextField *)oneView;
    }
    [nextField becomeFirstResponder];
}

#pragma mark -
- (void)viewDidLoad {
    [super viewDidLoad];
    
    
    
    self.navigationItem.leftBarButtonItem = [[[UIBarButtonItem alloc] 
                                     initWithTitle:@"取消"
                                     style:UIBarButtonItemStylePlain
                                     target:self
                                     action:@selector(cancel:)] autorelease];
    
    
   self.navigationItem.rightBarButtonItem = [[[UIBarButtonItem alloc] 
                                   initWithTitle:@"保存"
                                   style:UIBarButtonItemStyleDone
                                   target:self
                                   action:@selector(save:)] autorelease];
   
    
    
}

-(void)dealloc{
    [super dealloc];
    self.tempValues = nil;
    self.fieldLabels = nil;

}
#pragma mark -
#pragma mark Table Data Source Methods
- (NSInteger)tableView:(UITableView *)tableView
 numberOfRowsInSection:(NSInteger)section {
    return kNumberOfEditableRows;
}

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    self.tempValues =  [NSMutableDictionary dictionary];
    static NSString *JustepFileDetailCellIdentifier = @"JustepFileDetailCellIdentifier";
    
   NSArray *array  = [[NSArray alloc] initWithObjects:@"名称:", @"创建时间:",
                         @"修改时间:",@"大小(Byte):",nil];
    
    self.fieldLabels = array;
    [array release];
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:
                             JustepFileDetailCellIdentifier];
    NSUInteger row = [indexPath row];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc]
                initWithStyle:UITableViewCellStyleDefault
                reuseIdentifier:JustepFileDetailCellIdentifier] autorelease];
        UILabel *label = [[[UILabel alloc] initWithFrame:
                          CGRectMake(10, 10, 75, 25)] autorelease];
        label.textAlignment = UITextAlignmentRight;
        label.tag = kLabelTag;
        label.font = [UIFont boldSystemFontOfSize:14];
        [cell.contentView addSubview:label];
        UITextField *textField = [[[UITextField alloc] initWithFrame:
                                  CGRectMake(90, 12, 200, 25)] autorelease];

        if(row == kFileNameRowIndex){
            textField.clearsOnBeginEditing = NO;
            textField.returnKeyType = UIReturnKeyDone;
            [textField setDelegate:self];
            [textField addTarget:self
                          action:@selector(textFieldDone:)
                forControlEvents:UIControlEventEditingDidEndOnExit];

        }else{
           
            textField.enabled = FALSE;
           
        }
        [cell.contentView addSubview:textField];      
    }
    
    
    UILabel *label = (UILabel *)[cell viewWithTag:kLabelTag];
    UITextField *textField = nil;
    for (UIView *oneView in cell.contentView.subviews) {
        if ([oneView isMemberOfClass:[UITextField class]]){
            textField = (UITextField *)oneView;
            break;
        }   
    }
    label.text = [fieldLabels objectAtIndex:row];
    NSNumber *rowAsNum = [NSNumber numberWithInt:row];
    if ([[tempValues allKeys] containsObject:rowAsNum]){
         textField.text = [tempValues objectForKey:rowAsNum];
    }else if(textField != nil){
        switch (row) {
            case kFileNameRowIndex:
                textField.text = file.name;
                break;
            case kCreatTimeRowIndex:
                textField.text = file.creatTime;
                break;
            case kLastModifyTimeRowIndex:
                textField.text = file.lastModifyTime;
                break;
            case kSizeIndex:
                textField.text = file.size;
                break;
            default:
                break;
        } 
    }
       
    
   
    if (currentTextField == textField) {
        currentTextField = nil;
    }
    textField.tag = row;
    return cell;
}

#pragma mark -
#pragma mark Table Delegate Methods
- (NSIndexPath *)tableView:(UITableView *)tableView
  willSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    return nil;
}

#pragma mark Text Field Delegate Methods
- (void)textFieldDidBeginEditing:(UITextField *)textField {
    self.currentTextField = textField;
}

- (void)textFieldDidEndEditing:(UITextField *)textField {
    NSNumber *tagAsNum = [NSNumber numberWithInt:textField.tag];
    [tempValues setObject:textField.text forKey:tagAsNum];
}

@end
