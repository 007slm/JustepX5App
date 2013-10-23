//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//



#import <Foundation/Foundation.h>

typedef enum {
	JustepAppCommandStatus_NO_RESULT = 0,
	JustepAppCommandStatus_OK,
	JustepAppCommandStatus_CLASS_NOT_FOUND_EXCEPTION,
	JustepAppCommandStatus_ILLEGAL_ACCESS_EXCEPTION,
	JustepAppCommandStatus_INSTANTIATION_EXCEPTION,
	JustepAppCommandStatus_MALFORMED_URL_EXCEPTION,
	JustepAppCommandStatus_IO_EXCEPTION,
	JustepAppCommandStatus_INVALID_ACTION,
	JustepAppCommandStatus_JSON_EXCEPTION,
	JustepAppCommandStatus_ERROR
} JustepAppCommandStatus;
	
@interface JustepAppCommandCallback : NSObject {
	NSNumber* status;
	id message;
	NSNumber* keepCallback;
	NSString* cast;
	
}

@property (nonatomic, retain, readonly) NSNumber* status;
@property (nonatomic, retain, readonly) id message;
@property (nonatomic, retain)			NSNumber* keepCallback;
@property (nonatomic, retain, readonly) NSString* cast;

-(JustepAppCommandCallback *) init;
+(void) releaseStatus;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsInt: (int) theMessage;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDouble: (double) theMessage;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage cast: (NSString*) theCast;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage cast: (NSString*) theCast;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsInt: (int) theMessage cast: (NSString*) theCast;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDouble: (double) theMessage cast: (NSString*) theCast;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage cast: (NSString*) theCast;
+(JustepAppCommandCallback*) resultWithStatus: (JustepAppCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode;


 
-(void) setKeepCallbackAsBool: (BOOL) bKeepCallback;


-(NSString *) toJSONString;
-(NSString *) onSuccessString: (NSString*) callbackId;
-(NSString *) onErrorString: (NSString*) callbackId;

-(void) dealloc;
@end
