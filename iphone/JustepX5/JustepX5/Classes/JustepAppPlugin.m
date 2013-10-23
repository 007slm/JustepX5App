//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//


#import "JustepAppPlugin.h"


@implementation JustepAppPlugin
@synthesize webView;


-(JustepAppPlugin *) initWithWebView:(UIWebView*)theWebView
{
    self = [super init];
    if (self)
        [self setWebView:theWebView];
    return self;
}

- (void)dealloc{
    [super dealloc];
}


-(JustepAppDelegate *) appDelegate{
    
	return (JustepAppDelegate *)[[UIApplication sharedApplication] delegate];
}


-(JustepViewController *) appViewController{
	return [(JustepViewController *)[self appDelegate] viewController];
}
- (NSString*) execJS:(NSString*)javascript{
	return [self.webView stringByEvaluatingJavaScriptFromString:javascript];
}

- (NSString*) success:(JustepAppCommandCallback *)justepAppCommandCallback callbackId:(NSString*)callbackId
{
	return [self execJS:[NSString stringWithFormat:@"setTimeout(function() { %@; }, 0);", [justepAppCommandCallback onSuccessString:callbackId]]];
}

- (NSString*) error:(JustepAppCommandCallback *)justepAppCommandCallback callbackId:(NSString *)callbackId{
	return [self execJS:[NSString stringWithFormat:@"setTimeout(function() { %@; }, 0);", [justepAppCommandCallback onErrorString:callbackId]]];
}



@end