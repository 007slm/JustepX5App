//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//



#import "JustepAppCommandCallback.h"
#import "JSONKit.h"


@interface JustepAppCommandCallback()

-(JustepAppCommandCallback*) initWithStatus:(JustepAppCommandStatus)statusOrdinal message: (id) theMessage cast: (NSString*) theCast;

@end


@implementation JustepAppCommandCallback
@synthesize status, message, keepCallback, cast;

static NSArray* justepAppCommandStatusMsgs;

+(void) initialize
{
	justepAppCommandStatusMsgs = [[NSArray alloc] initWithObjects: @"No result",
									  @"OK",
									  @"Class not found",
									  @"Illegal access",
									  @"Instantiation error",
									  @"Malformed url",
									  @"IO error",
									  @"Invalid action",
									  @"JSON error",
									  @"Error",
									  nil];
}
+(void) releaseStatus
{
	if (justepAppCommandStatusMsgs != nil){
		[justepAppCommandStatusMsgs release];
		justepAppCommandStatusMsgs = nil;
	}
}
		
-(JustepAppCommandCallback*) init
{
	return [self initWithStatus: JustepAppCommandStatus_NO_RESULT message: nil cast: nil];
}
-(JustepAppCommandCallback*) initWithStatus:(JustepAppCommandStatus)statusOrdinal message: (id) theMessage cast: (NSString*) theCast{
	self = [super init];
	if(self) {
		status = [NSNumber numberWithInt: statusOrdinal];
		message = theMessage;
		cast = theCast;
		keepCallback = [NSNumber numberWithBool: NO];
	}
	return self;
}		
	
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [justepAppCommandStatusMsgs objectAtIndex: statusOrdinal] cast: nil] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsInt: (int) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithInt: theMessage] cast:nil] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDouble: (double) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithDouble: theMessage] cast:nil] autorelease];
}

+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}

+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsInt: (int) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithInt: theMessage] cast:theCast] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDouble: (double) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithDouble: theMessage] cast:theCast] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode 
{
    NSDictionary* errDict = [NSDictionary dictionaryWithObject:[NSNumber numberWithInt:errorCode] forKey:@"code"];
	return [[[self alloc] initWithStatus: statusOrdinal message: errDict cast:nil] autorelease];
}


-(void) setKeepCallbackAsBool:(BOOL)bKeepCallback
{
	[self setKeepCallback: [NSNumber numberWithBool:bKeepCallback]];
}

-(NSString*) toJSONString{
    NSString* resultString = [[NSDictionary dictionaryWithObjectsAndKeys:
                               self.status, @"status",
                               self.message ? self.message : [NSNull null], @"message",
                               self.keepCallback, @"keepCallback",
                               nil] JSONString];
	
	return resultString;
}
-(NSString*) onSuccessString: (NSString*) callbackId
{
	NSString* successCB;
	
	if ([self cast] != nil) {
		successCB = [NSString stringWithFormat: @"var temp = %@(%@);\njustepApp.onSuccess('%@',temp);", self.cast, [self toJSONString], callbackId];
	}
	else {
		successCB = [NSString stringWithFormat:@"justepApp.onSuccess('%@',%@);", callbackId, [self toJSONString]];			
	}
	
	return successCB;
}
-(NSString*) onErrorString: (NSString*) callbackId
{
	NSString* errorCB = nil;
	
	if ([self cast] != nil) {
		errorCB = [NSString stringWithFormat: @"var temp = %@(%@);\njustepApp.onError('%@',temp);", self.cast, [self toJSONString], callbackId];
	}
	else {
		errorCB = [NSString stringWithFormat:@"justepApp.onError('%@',%@);", callbackId, [self toJSONString]];
	}
    return errorCB;
}	
										 
-(void) dealloc
{
	status = nil;
	message = nil;
	keepCallback = nil;
	cast = nil;
	[super dealloc];
}
@end
