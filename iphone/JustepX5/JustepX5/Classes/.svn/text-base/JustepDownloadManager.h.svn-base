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

#import <Foundation/Foundation.h>

@protocol JustepDownloadManagerDelegate <NSObject>
- (void) downloadManagerDataDownloadFinished: (NSString *) fileName;
- (void) downloadManagerDidReceiveData: (NSString *) fileName;
- (void) downloadManagerDataDownloadFailed: (NSString *) reason;

@end

@interface JustepDownloadManager : NSObject{
	
@private
	id <JustepDownloadManagerDelegate> _delegate;
	
	NSString *_title;
	NSURL	*_fileURL;
	NSString *_fileName;
	
    
	NSUInteger _currentSize;
	
	NSNumber *_totalFileSize;
	UIProgressView *_progressView;
	UIAlertView *_progressAlertView;
	
	NSURLConnection *_URLConnection;
	
}

@property (nonatomic, assign) id <JustepDownloadManagerDelegate> delegate;
@property (nonatomic, retain) NSString *title;
@property (nonatomic, retain) NSURL *fileURL;
@property (nonatomic, retain) NSString *fileName;
@property (nonatomic, assign) NSUInteger currentSize;
@property (nonatomic, retain) NSNumber *totalFileSize;
@property (nonatomic, retain) UIProgressView *progressView;
@property (nonatomic, retain) UIAlertView *progressAlertView;
@property (nonatomic, retain) NSURLConnection *URLConnection;



- (void)start;
- (void)createProgressionAlertWithMessage:(NSString *)message;
- (void)writeToFile:(NSData *)data;
@end
