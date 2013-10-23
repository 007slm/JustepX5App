//
//  JustepDownloadManager.h
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//  JustepAppDelegate.h
//  JustepX5
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-9-13.
//  Copyright (c) 2012年 Justep. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "JustepDownloadManager.h"

#define DELEGATE_CALLBACK(X, Y) if (self.delegate && [self.delegate respondsToSelector:@selector(X)]) [self.delegate performSelector:@selector(X) withObject:Y];
#define kIMGCancel @"Cancel.png"

@implementation JustepDownloadManager


- (void)start
{
	if (_fileURL == nil) {
		
		return;
	}
	NSURLRequest *request = [NSURLRequest requestWithURL:_fileURL];
	self.URLConnection = [NSURLConnection connectionWithRequest:request delegate:self];
	if (_URLConnection) {
		[self createProgressionAlertWithMessage:_title];
	} else {
	}
}

- (void)createProgressionAlertWithMessage:(NSString *)message 
{	
	self.progressAlertView = [[[UIAlertView alloc] initWithTitle:message
                                                         message:NSLocalizedString(@"下载中。。。",nil) 
                                                        delegate:self 
                                               cancelButtonTitle:nil
                                               otherButtonTitles:nil] autorelease];
    
	// Create the progress bar and add it to the alert
    self.progressView = [[[UIProgressView alloc] initWithFrame:CGRectMake(30.0f, 80.0f, 225.0f, 90.0f)] autorelease];
    [_progressView setProgressViewStyle:UIProgressViewStyleBar];
	[_progressAlertView addSubview:_progressView];
	
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(90.0f, 90.0f, 225.0f, 40.0f)];
    label.backgroundColor = [UIColor clearColor];
    label.textColor = [UIColor whiteColor];
    label.font = [UIFont systemFontOfSize:12.0f];
    label.text = @"";
    label.tag = 1;
    [_progressAlertView addSubview:label];
	[label release];
	
	UIButton *btnCancelLoad = [[UIButton alloc] initWithFrame:CGRectMake(235, 4, 38, 37)];
	[btnCancelLoad setBackgroundColor:[UIColor clearColor]];
	[btnCancelLoad setImage:[UIImage imageNamed:kIMGCancel] forState:UIControlStateNormal];
	[btnCancelLoad addTarget:self action:@selector(cancelLoadAction:) forControlEvents:UIControlEventTouchUpInside];
	[_progressAlertView addSubview:btnCancelLoad];
	[btnCancelLoad release];
	
    [_progressAlertView show];
}

-(void)cancelLoadAction:(UIButton *)sender{
	[_URLConnection cancel];
	NSError *error;
	NSString *filePath=[NSString stringWithFormat:@"%@",_fileName];
	if([[NSFileManager defaultManager] fileExistsAtPath:filePath]){
		[[NSFileManager defaultManager] removeItemAtPath:filePath error:&error];
	}
	[_progressAlertView dismissWithClickedButtonIndex:0 animated:YES];
    
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
    
	self.currentSize = 0;
    self.totalFileSize = [NSNumber numberWithLongLong:[response expectedContentLength]];
	
	// Check for bad connection
	if ([response expectedContentLength] < 0)
	{
		NSString *reason = [NSString stringWithFormat:@"无效的URL [%@]", [_fileURL absoluteString]];
		DELEGATE_CALLBACK(downloadManagerDataDownloadFailed:, reason);
		[connection cancel];
		return;
	}
	
	if ([response suggestedFilename])
		DELEGATE_CALLBACK(downloadManagerDidReceiveData:, [response suggestedFilename]);
	
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data 
{
	self.currentSize = self.currentSize + [data length];
	NSNumber *resourceLength = [NSNumber numberWithUnsignedInteger:self.currentSize];
	
    NSNumber *progress = [NSNumber numberWithFloat:([resourceLength floatValue] / [_totalFileSize floatValue])];
    self.progressView.progress = [progress floatValue];
	
    const unsigned int bytes = 1024 ;
    UILabel *label = (UILabel *)[_progressAlertView viewWithTag:1];
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    [formatter setNumberStyle:NSNumberFormatterDecimalStyle];
    [formatter setPositiveFormat:@"##0.00"];
    NSNumber *partial = [NSNumber numberWithFloat:([resourceLength floatValue] / bytes)];
    NSNumber *total = [NSNumber numberWithFloat:([_totalFileSize floatValue] / bytes)];
    label.text = [NSString stringWithFormat:@"%@ KB / %@ KB", [formatter stringFromNumber:partial], [formatter stringFromNumber:total]];
    [formatter release];
	
	[self writeToFile:data];
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error 
{
    [_progressAlertView dismissWithClickedButtonIndex:0 animated:YES];
	NSString *reason = [NSString stringWithFormat:@"无效的URL [%@]", [_fileURL absoluteString]];
    DELEGATE_CALLBACK(downloadManagerDataDownloadFailed:, reason);
	
}
-(void)writeToFile:(NSData *)data{
	NSString *filePath=[NSString stringWithFormat:@"%@",_fileName];
	if([[NSFileManager defaultManager] fileExistsAtPath:filePath] == NO){
		[[NSFileManager defaultManager] createFileAtPath:filePath contents:nil attributes:nil];
	}
	FILE *file = fopen([_fileName UTF8String], [@"ab+" UTF8String]);
	if(file != NULL){
		fseek(file, 0, SEEK_END);
	}
	int readSize = [data length];
	fwrite((const void *)[data bytes], readSize, 1, file);
	fclose(file);
}



- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
	
	DELEGATE_CALLBACK(downloadManagerDataDownloadFinished:, _fileName);
	[_progressAlertView dismissWithClickedButtonIndex:0 animated:YES];
    
}

@synthesize delegate = _delegate;
@synthesize title = _title;
@synthesize fileURL = _fileURL;
@synthesize fileName = _fileName;
@synthesize currentSize = _currentSize;
@synthesize totalFileSize = _totalFileSize;
@synthesize progressView = _progressView;
@synthesize progressAlertView = _progressAlertView;
@synthesize URLConnection = _URLConnection;

- (void)dealloc
{
    _delegate = nil;
    [_title release];
    [_fileURL release];
    [_fileName release];
    [_totalFileSize release];
    [_progressView release];
    [_progressAlertView release];
    [_URLConnection release];
	
    [super dealloc];
}


@end








