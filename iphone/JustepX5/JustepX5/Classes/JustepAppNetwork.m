//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//



#import "Reachability.h"
#import "JustepAppNetwork.h"
#import <JustepAppBridge/NSDictionaryExtension.h>

@implementation JustepAppNetwork

- (void) isReachable:(NSString *)callbackId withHost:(NSString *)hostName withDict:(NSMutableDictionary *)options
{
	if ([options existsValue:@"true" forKey:@"isIpAddress"]) {
        //TODO:根据hostname 生成ip + port
        
        
        struct sockaddr_in address;
        memset(&address ,0,sizeof(address));
        address.sin_len = sizeof(address);
        address.sin_family = AF_INET;
        address.sin_port = htons(8080);
        address.sin_addr.s_addr = inet_addr("127.0.0.1");
        
        [Reachability reachabilityWithAddress:&address];
	} else {
		[Reachability reachabilityWithHostName:hostName];
	}
	
	//[[Reachability sharedReachability] setNetworkStatusNotificationsEnabled:YES];
	[self updateReachability:callbackId];
    
    //[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:@"kNetworkReachabilityChangedNotification" object:nil];
}

- (void)reachabilityChanged:(NSNotification *)note
{
    [self updateReachability:nil];
}

- (void)updateReachability:(NSString*)callback
{
    /**
	NSString* jsCallback = @"justepApp.network.updateReachability";
    
	if (callback)
		jsCallback = callback;
	
	
     NSString* status = [[NSString alloc] initWithFormat:@"%@({ hostName: '%@', ipAddress: '%@', remoteHostStatus: %d, internetConnectionStatus: %d, localWiFiConnectionStatus: %d  });",
						jsCallback,
						[[Reachability sharedReachability] hostName],
						[[Reachability sharedReachability] address],
					   [[Reachability sharedReachability] remoteHostStatus],
					   [[Reachability sharedReachability] internetConnectionStatus],
					   [[Reachability sharedReachability] localWiFiConnectionStatus]];
	
     
     [webView stringByEvaluatingJavaScriptFromString:status];
     [status release];
	**/
    
}

@end
