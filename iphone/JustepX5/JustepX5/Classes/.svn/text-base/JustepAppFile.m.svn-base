//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//
#import "JustepAppFile.h"
#import <JustepAppBridge/NSDictionaryExtension.h>
#import "JSONKit.h"
#import <JustepAppBridge/NSData+Base64.h>
#import <MobileCoreServices/MobileCoreServices.h>


@implementation JustepAppFile

@synthesize appDocsPath, appLibraryPath, appTempPath, persistentPath, temporaryPath, userHasAllowed;



-(id)initWithWebView:(UIWebView *)theWebView
{
	self = (JustepAppFile*)[super initWithWebView:theWebView];
	if(self)
	{
		// get the documents directory path
		NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
		self.appDocsPath = [paths objectAtIndex:0];
		
		paths = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES);
		self.appLibraryPath = [paths objectAtIndex:0];
		
		self.appTempPath =  [NSTemporaryDirectory() stringByStandardizingPath]; // remove trailing slash from NSTemporaryDirectory()
		
		self.persistentPath = [NSString stringWithFormat: @"/%@",[self.appDocsPath lastPathComponent]];
		self.temporaryPath = [NSString stringWithFormat: @"/%@",[self.appTempPath lastPathComponent]];
		//NSLog(@"docs: %@ - temp: %@", self.appDocsPath, self.appTempPath);
	}
	
	return self;
}

- (NSNumber*) checkFreeDiskSpace: (NSString*) appPath
{
	NSFileManager* fMgr = [[NSFileManager alloc] init];
	
	NSError* pError = nil;
	
	NSDictionary* pDict = [ fMgr attributesOfFileSystemForPath:appPath error:&pError ];
	NSNumber* pNumAvail = (NSNumber*)[ pDict objectForKey:NSFileSystemFreeSize ];
	[fMgr release];
	return pNumAvail;
}

// figure out if the pathFragment represents a persistent of temporary directory and return the full application path.
// returns nil if path is not persistent or temporary
-(NSString*) getAppPath: (NSString*)pathFragment
{
	NSString* appPath = nil;
	NSRange rangeP = [pathFragment rangeOfString:self.persistentPath];
	NSRange rangeT = [pathFragment rangeOfString:self.temporaryPath];
	
	if (rangeP.location != NSNotFound && rangeT.location != NSNotFound){
		// we found both in the path, return whichever one is first
		if (rangeP.length < rangeT.length) {
			appPath = self.appDocsPath;
		}else {
			appPath = self.appTempPath;
		}
	} else if (rangeP.location != NSNotFound) {
		appPath = self.appDocsPath;
	} else if (rangeT.location != NSNotFound){
		appPath = self.appTempPath;
	}
	return appPath;
}

- (void) requestFileSystem:(NSString *)callbackId withType:(NSString *)strType withSize:(NSString *)strSize
{



	unsigned long long size = [strSize longLongValue];

	int type = [strType intValue];
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	if (type > 1){
		result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
		NSLog(@"iOS only supports TEMPORARY and PERSISTENT file systems");
	} else {
		
		//NSString* fullPath = [NSString stringWithFormat:@"/%@", (type == 0 ? [self.appTempPath lastPathComponent] : [self.appDocsPath lastPathComponent])];
		NSString* fullPath = (type == 0 ? self.appTempPath  : self.appDocsPath);
		// check for avail space for size request
		NSNumber* pNumAvail = [self checkFreeDiskSpace: fullPath];
		//NSLog(@"Free space: %@", [NSString stringWithFormat:@"%qu", [ pNumAvail unsignedLongLongValue ]]);
		if (pNumAvail && [pNumAvail unsignedLongLongValue] < size) {
			result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: QUOTA_EXCEEDED_ERR cast: @"justepApp.localFileSystem._castError"];
			jsString = [result onErrorString:callbackId];
		}
		else {
			NSMutableDictionary* fileSystem = [NSMutableDictionary dictionaryWithCapacity:2];
			[fileSystem setObject: (type == TEMPORARY ? kW3FileTemporary : kW3FilePersistent)forKey:@"name"];
			NSDictionary* dirEntry = [self getDirectoryEntry: fullPath isDirectory: YES];
			[fileSystem setObject:dirEntry forKey:@"root"];
			result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsDictionary: fileSystem cast: @"justepApp.localFileSystem._castFS"];
			jsString = [result onSuccessString:callbackId];
		}
	}
	[self execJS: jsString];
	
}
/* Creates a dictionary representing an Entry Object
 *
 * IN:
 * NSString* fullPath of the entry 
 * FileSystem type 
 * BOOL isDirectory - YES if this is a directory, NO if is a file
 * OUT:
 * NSDictionary*
 Entry object
 *		bool as NSNumber isDirectory
 *		bool as NSNumber isFile
 *		NSString*  name - last part of path
 *		NSString* fullPath
 *		fileSystem = FileSystem object - !! ignored because creates circular reference FileSystem contains DirectoryEntry which contains FileSystem.....!!
 */
-(NSDictionary*) getDirectoryEntry: (NSString*) fullPath  isDirectory: (BOOL) isDir
{
	
	NSMutableDictionary* dirEntry = [NSMutableDictionary dictionaryWithCapacity:4];
	NSString* lastPart = [fullPath lastPathComponent];
	
	
	
	[dirEntry setObject:[NSNumber numberWithBool: !isDir]  forKey:@"isFile"];
	[dirEntry setObject:[NSNumber numberWithBool: isDir]  forKey:@"isDirectory"];
	//NSURL* fileUrl = [NSURL fileURLWithPath:fullPath];
	//[dirEntry setObject: [fileUrl absoluteString] forKey: @"fullPath"];
	[dirEntry setObject: fullPath forKey: @"fullPath"];
	[dirEntry setObject: lastPart forKey:@"name"];
	
	
	return dirEntry;
	
}
/*
 * Given a URI determine the File System information associated with it and return an appropriate W3C entry object
 * IN
 *	NSString* fileURI  - currently requires full file URI 
 * OUT
 *	Entry object
 *		bool isDirectory
 *		bool isFile
 *		string name
 *		string fullPath
 *		fileSystem = FileSystem object - !! ignored because creates circular reference FileSystem contains DirectoryEntry which contains FileSystem.....!!
 */
- (void) resolveLocalFileSystemURI:(NSString *)callbackId withURI:(NSString *)inputUri
{

    
	NSString* jsString = nil;
    
    // don't know if string is encoded or not so unescape 
    NSString* cleanUri = [inputUri stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	// now escape in order to create URL
    NSString* strUri = [cleanUri stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
	NSURL* testUri = [NSURL URLWithString:strUri];  
	JustepAppCommandCallback* result = nil;
	
	if (!testUri || ![testUri isFileURL]) {
		// issue ENCODING_ERR
		result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: ENCODING_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	} else {
		NSFileManager* fileMgr = [[NSFileManager alloc] init];
		NSString* path = [testUri path];
		//NSLog(@"url path: %@", path);
		BOOL	isDir = NO;
		// see if exists and is file or dir
		BOOL bExists = [fileMgr fileExistsAtPath:path isDirectory: &isDir];
		if (bExists) {
			// see if it contains docs path
			NSRange range = [path rangeOfString:self.appDocsPath];
			NSString* foundFullPath = nil;
			// there's probably an api or easier way to figure out the path type but I can't find it!
			if (range.location != NSNotFound &&  range.length == [self.appDocsPath length]){
				foundFullPath = self.appDocsPath;
			}else {
				// see if it contains the temp path
				range = [path rangeOfString:self.appTempPath];
				if (range.location != NSNotFound && range.length == [self.appTempPath length]){
					foundFullPath = self.appTempPath;
				}
			}
			if (foundFullPath == nil) {
				// error SECURITY_ERR - not one of the two paths types supported
				result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: SECURITY_ERR cast: @"justepApp.localFileSystem._castError"];
				jsString = [result onErrorString:callbackId];
			} else {
				NSDictionary* fileSystem = [self getDirectoryEntry: path isDirectory: isDir];
				result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: fileSystem cast: @"justepApp.localFileSystem._castEntry"];
				jsString = [result onSuccessString:callbackId];
								
			}
		
		} else {
			// return NOT_FOUND_ERR
			result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast: @"justepApp.localFileSystem._castError"];
			jsString = [result onErrorString:callbackId];
			
		}

		[fileMgr release];
	}
	if (jsString != nil){
		[self execJS:jsString];
	}

}
/* Part of DirectoryEntry interface,  creates or returns the specified directory
 * IN:
 *	NSString* fullPath - full path for this directory 
 *	NSString* path - directory to be created/returned; may be full path or relative path
 *	NSDictionary* - Flags object
 *		boolean as NSNumber create - 
 *			if create is true and directory does not exist, create dir and return directory entry
 *			if create is true and exclusive is true and directory does exist, return error
 *			if create is false and directory does not exist, return error
 *			if create is false and the path represents a file, return error
 *		boolean as NSNumber exclusive - used in conjunction with create
 *			if exclusive is true and create is true - specifies failure if directory already exists
 *			
 *			
 */
- (void) getDirectory:(NSString *)callbackId withFullPath:(NSString *)fullPath withSubPath:(NSString *)subPath withDict:(NSMutableDictionary *)options
{
	// add getDir to options and call getFile()
	if (!options){
		options = [NSMutableDictionary dictionaryWithCapacity:1];
	}
	[options setObject:[NSNumber numberWithInt:1] forKey:@"getDir"];
	
	[self getFile:callbackId withFullPath:fullPath withSubPath:subPath withDict:options];


}
/* Part of DirectoryEntry interface,  creates or returns the specified file
 * IN:
 *	NSString* fullPath - full path for this file 
 *	NSString* path - file to be created/returned; may be full path or relative path
 *	NSDictionary* - Flags object
 *		boolean as NSNumber create - 
 *			if create is true and file does not exist, create file and return File entry
 *			if create is true and exclusive is true and file does exist, return error
 *			if create is false and file does not exist, return error
 *			if create is false and the path represents a directory, return error
 *		boolean as NSNumber exclusive - used in conjunction with create
 *			if exclusive is true and create is true - specifies failure if file already exists
 *			
 *			
 */
- (void) getFile:(NSString *)callbackId withFullPath:(NSString *)fullPath withSubPath:(NSString *)subPath withDict:(NSMutableDictionary *)options
{
	NSString* jsString = nil;
	JustepAppCommandCallback* result = nil;
	BOOL bDirRequest = NO;
	BOOL create = NO;
	BOOL exclusive = NO;
	int errorCode = 0;  // !!! risky - no error code currently defined for 0
	
	if ([options valueForKeyIsNumber:@"create"]) {
		create = [(NSNumber*)[options valueForKey: @"create"] boolValue];
	}
	if ([options valueForKeyIsNumber:@"exclusive"]) {
		exclusive = [(NSNumber*)[options valueForKey: @"exclusive"] boolValue];
	}
	
	if ([options valueForKeyIsNumber:@"getDir"]) {
		// this will not exist for calls directly to getFile but will have been set by getDirectory before calling this method
		bDirRequest = [(NSNumber*)[options valueForKey: @"getDir"] boolValue];
	}
	// see if the requested path has invalid characters - should we be checking for  more than just ":"?
	if ([subPath rangeOfString: @":"].location != NSNotFound) {
		errorCode = ENCODING_ERR;
	}	else {
			
		// was full or relative path provided?
		NSRange range = [subPath rangeOfString:fullPath];
		BOOL bIsFullPath = range.location != NSNotFound;
		
		NSString* reqFullPath = nil;
		
		if (!bIsFullPath) {
			reqFullPath = [fullPath stringByAppendingPathComponent:subPath];
		} else {
			reqFullPath = subPath;
		}
		
		//NSLog(@"reqFullPath = %@", reqFullPath);
		NSFileManager* fileMgr = [[NSFileManager alloc] init];
		BOOL bIsDir;
		BOOL bExists = [fileMgr fileExistsAtPath: reqFullPath isDirectory: &bIsDir];
		if (bExists && create == NO && bIsDir == !bDirRequest) {
			// path exists and is of requested type  - return TYPE_MISMATCH_ERR
			errorCode = TYPE_MISMATCH_ERR;
		} else if (!bExists && create == NO) {
			// path does not exist and create is false - return NOT_FOUND_ERR
			errorCode = NOT_FOUND_ERR;
		} else if (bExists && create == YES && exclusive == YES) {
			// file/dir already exists and exclusive and create are both true - return PATH_EXISTS_ERR
			errorCode = PATH_EXISTS_ERR;
		} else { 
			// if bExists and create == YES - just return data
			// if bExists and create == NO  - just return data
			// if !bExists and create == YES - create and return data
			BOOL bSuccess = YES;
			NSError* pError = nil;
			if(!bExists && create == YES){
				if(bDirRequest) {
					// create the dir
					bSuccess = [ fileMgr createDirectoryAtPath:reqFullPath withIntermediateDirectories:NO attributes:nil error:&pError];
				} else {
					// create the empty file
					bSuccess = [ fileMgr createFileAtPath:reqFullPath contents: nil attributes:nil];
				}
			}
			if(!bSuccess){
				errorCode = ABORT_ERR;
				if (pError) {
					NSLog(@"error creating directory: %@", [pError localizedDescription]);
				}
			} else {
				//NSLog(@"newly created file/dir (%@) exists: %d", reqFullPath, [fileMgr fileExistsAtPath:reqFullPath]);
				// file existed or was created
				result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsDictionary: [self getDirectoryEntry: reqFullPath isDirectory: bDirRequest] cast: @"justepApp.localFileSystem._castEntry"];
				jsString = [result onSuccessString: callbackId];
			}
		} // are all possible conditions met?
		[fileMgr release];
	} 

	
	if (errorCode > 0) {
		// create error callback
		result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: errorCode cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	}
	
	
	
	[self execJS:jsString];
}
/* 
 * Look up the parent Entry containing this Entry. 
 * If this Entry is the root of its filesystem, its parent is itself.
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath
 * NSMutableDictionary* options
 *	empty
 */
- (void) getParent:(NSString *)callbackId withFullPath:(NSString *)fullPath
{

    
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	NSString* newPath = nil;
	
	
	if ([fullPath isEqualToString:self.appDocsPath] || [fullPath isEqualToString: self.appTempPath]){
		// return self
		newPath = fullPath;
		
	} else {
		// since this call is made from an existing Entry object - the parent should already exist so no additional error checking
		// remove last component and return Entry
		NSRange range = [fullPath rangeOfString:@"/" options: NSBackwardsSearch];
		newPath = [fullPath substringToIndex:range.location];
	}

	if(newPath){
		NSFileManager* fileMgr = [[NSFileManager alloc] init];
		BOOL bIsDir;
		BOOL bExists = [fileMgr fileExistsAtPath: newPath isDirectory: &bIsDir];
		if (bExists) {
			result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsDictionary: [self getDirectoryEntry:newPath isDirectory:bIsDir] cast: @"justepApp.localFileSystem._castEntry"];
			jsString = [result onSuccessString:callbackId];
		}
		[fileMgr release];
	}
	if (!jsString) {
		// invalid path or file does not exist
		result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString: callbackId];
	}
	[self execJS:jsString];

}
/*
 * get MetaData of entry
 * Currently MetaData only includes modificationTime.
 */
- (void) getMetadata:(NSString *)callbackId withFullPath:(NSString *)fullPath
{
	NSString* argPath = fullPath;
	NSString* testPath = argPath;
	
	NSFileManager* fileMgr = [[NSFileManager alloc] init];
	NSError* error = nil;
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	NSDictionary* fileAttribs = [fileMgr attributesOfItemAtPath:testPath error:&error];
	
	if (fileAttribs){
		NSDate* modDate = [fileAttribs fileModificationDate];
		if (modDate){
			NSNumber* msDate = [NSNumber numberWithDouble:[modDate timeIntervalSince1970]*1000];
			NSMutableDictionary* metadataDict = [NSMutableDictionary dictionaryWithCapacity:1];
			[metadataDict setObject:msDate forKey:@"modificationTime"];
			result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: metadataDict cast: @"justepApp.localFileSystem._castDate"];
			jsString = [result onSuccessString:callbackId];
		}
	} else {
		// didn't get fileAttribs
		FileError errorCode = ABORT_ERR;
		NSLog(@"error getting metadata: %@", [error localizedDescription]);
		if ([error code] == NSFileNoSuchFileError) {
			errorCode = NOT_FOUND_ERR;
		}
		// log [NSNumber numberWithDouble: theMessage] objCtype to see what it returns
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errorCode cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	}
	if (jsString){
		[self execJS:jsString];
	}
	[fileMgr release];
}

/* removes the directory or file entry
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath
 * NSMutableDictionary* options
 *	empty
 *
 * returns NO_MODIFICATION_ALLOWED_ERR  if is top level directory or no permission to delete dir
 * returns INVALID_MODIFICATION_ERR if is dir and is not empty
 * returns NOT_FOUND_ERR if file or dir is not found
*/
- (void) remove:(NSString *)callbackId withFullPath:(NSString *)fullPath
{
	
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	FileError errorCode = 0;  // !! 0 not currently defined 
	
	// error if try to remove top level (documents or tmp) dir
	if ([fullPath isEqualToString:self.appDocsPath] || [fullPath isEqualToString:self.appTempPath]){
		errorCode = NO_MODIFICATION_ALLOWED_ERR;
	} else {
		NSFileManager* fileMgr = [[ NSFileManager alloc] init];
		BOOL bIsDir = NO;
		BOOL bExists = [fileMgr fileExistsAtPath:fullPath isDirectory: &bIsDir];
		if (!bExists){
			errorCode = NOT_FOUND_ERR;
		}
		if (bIsDir &&  [[fileMgr contentsOfDirectoryAtPath:fullPath error: nil] count] != 0) {
			// dir is not empty
			errorCode = INVALID_MODIFICATION_ERR;
		}
		[fileMgr release];
	}
	if (errorCode > 0) {
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errorCode cast:@"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	} else {
		// perform actual remove
		jsString = [self doRemove: fullPath callback: callbackId];
	}
	[self execJS:jsString];

}
/* recurvsively removes the directory 
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath
 * NSMutableDictionary* options
 *	empty
 *
 * returns NO_MODIFICATION_ALLOWED_ERR  if is top level directory or no permission to delete dir
 * returns NOT_FOUND_ERR if file or dir is not found
 */
- (void) removeRecursively:(NSString *)callbackId withFullPath:(NSString *)fullPath
{

	
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	// error if try to remove top level (documents or tmp) dir
	if ([fullPath isEqualToString:self.appDocsPath] || [fullPath isEqualToString:self.appTempPath]){
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: NO_MODIFICATION_ALLOWED_ERR cast:@"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	} else {
		jsString = [self doRemove: fullPath callback: callbackId];
	}
	
	[self execJS:jsString];

}
/* remove the file or directory (recursively)
 * IN:
 * NSString* fullPath - the full path to the file or directory to be removed
 * NSString* callbackId
 * called from remove and removeRecursively - check all pubic api specific error conditions (dir not empty, etc) before calling
 */

- (NSString*) doRemove:(NSString*)fullPath callback: (NSString*)callbackId
{
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	BOOL bSuccess = NO;
	NSError* pError = nil;
	NSFileManager* fileMgr = [[ NSFileManager alloc] init];

	@try {
		bSuccess = [ fileMgr removeItemAtPath:fullPath error:&pError];
		if (bSuccess) {
			JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK ];
			jsString = [result onSuccessString:callbackId];
		} else {
			// see if we can give a useful error
			FileError errorCode = ABORT_ERR;
			NSLog(@"error getting metadata: %@", [pError localizedDescription]);
			if ([pError code] == NSFileNoSuchFileError) {
				errorCode = NOT_FOUND_ERR;
			} else if ([pError code] == NSFileWriteNoPermissionError) {
				errorCode = NO_MODIFICATION_ALLOWED_ERR;
			}
			
			result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errorCode cast: @"justepApp.localFileSystem._castError"];
			jsString = [result onErrorString:callbackId];
		}
	} @catch (NSException* e) { // NSInvalidArgumentException if path is . or ..
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: SYNTAX_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];	
	}
	@finally {
		[fileMgr release];
		return jsString;
	}
}
- (void) copy:(NSString *)callbackId from:(NSString *)fullPath to:(NSString *)parent withNewName:(NSString *)newName
{
    
    [self doCopyMove:callbackId from:fullPath to:parent withNewName:newName withDict:[[[NSMutableDictionary alloc] initWithCapacity:0] autorelease]  isCopy:YES];
}
- (void) move:(NSString *)callbackId from:(NSString *)fullPath to:(NSString *)parent withNewName:(NSString *)newName
{
    [self doCopyMove:callbackId from:fullPath to:parent withNewName:newName withDict:[[[NSMutableDictionary alloc] initWithCapacity:0] autorelease] isCopy:NO];
}
/**
 * Helpfer function to check to see if the user attempted to copy an entry into its parent without changing its name, 
 * or attempted to copy a directory into a directory that it contains directly or indirectly.
 * 
 * IN: 
 *  NSString* srcDir
 *  NSString* destinationDir
 * OUT:
 *  YES copy/ move is allows
 *  NO move is onto itself
 */	
-(BOOL) canCopyMoveSrc: (NSString*) src ToDestination: (NSString*) dest
{
    // This weird test is to determine if we are copying or moving a directory into itself.  
    // Copy /Documents/myDir to /Documents/myDir-backup is okay but
    // Copy /Documents/myDir to /Documents/myDir/backup not okay
    BOOL copyOK = YES;
    NSRange range = [dest rangeOfString:src];
    
    if (range.location != NSNotFound) {
        NSRange testRange = {range.length-1, ([dest length] - range.length)};
        NSRange resultRange = [dest rangeOfString: @"/" options: 0 range: testRange];
        if (resultRange.location != NSNotFound){
            copyOK = NO;
        }
    }
    return copyOK;
    
}
/* Copy/move a file or directory to a new location
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath of entry
 *  2 - NSString* newName the new name of the entry, defaults to the current name
 *	NSMutableDictionary* options - DirectoryEntry to which to copy the entry
 *	BOOL - bCopy YES if copy, NO if move
 * 
 */
- (void) doCopyMove:(NSString *)callbackId from:(NSString *)fullPath to:(NSString *)parent withNewName:(NSString *)newName withDict:(NSMutableDictionary *)options isCopy:(BOOL)bCopy
{
	// arguments
    NSString* srcFullPath = fullPath;

    // use last component from appPath if new name not provided
    if(newName == nil || newName == NULL){
        newName = [srcFullPath lastPathComponent];
    }
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	FileError errCode = 0;  // !! Currently 0 is not defined, use this to signal error !!
		
	NSString* destRootPath = nil;
	NSString* key = @"fullPath";
	if([options valueForKeyIsString:key]){
	   destRootPath = [options objectForKey:@"fullPath"];
	}
	
	if (!destRootPath) {
		// no destination provided
		errCode = NOT_FOUND_ERR;
	} else if ([newName rangeOfString: @":"].location != NSNotFound) {
		// invalid chars in new name
		errCode = ENCODING_ERR;
	} else {
		NSString* newFullPath = [destRootPath stringByAppendingPathComponent: newName];
		if ( [newFullPath isEqualToString:srcFullPath] ){
			// source and destination can not be the same 
			errCode = INVALID_MODIFICATION_ERR;
		} else {
			NSFileManager* fileMgr = [[NSFileManager alloc] init];
			
			BOOL bSrcIsDir = NO;
			BOOL bDestIsDir = NO;
			BOOL bNewIsDir = NO;
			BOOL bSrcExists = [fileMgr fileExistsAtPath: srcFullPath isDirectory: &bSrcIsDir];
			BOOL bDestExists= [fileMgr fileExistsAtPath: destRootPath isDirectory: &bDestIsDir];
			BOOL bNewExists = [fileMgr fileExistsAtPath:newFullPath isDirectory: &bNewIsDir];
			if (!bSrcExists || !bDestExists) {
				// the source or the destination root does not exist
				errCode = NOT_FOUND_ERR;
			} else if (bSrcIsDir && (bNewExists && !bNewIsDir)) {
				// can't copy/move dir to file 
				errCode = INVALID_MODIFICATION_ERR;
			} else { // no errors yet
				NSError* error = nil;
				BOOL bSuccess = NO;
				if (bCopy){
					if (bSrcIsDir && ![self canCopyMoveSrc: srcFullPath ToDestination: newFullPath]/*[newFullPath hasPrefix:srcFullPath]*/) {
						// can't copy dir into self
						errCode = INVALID_MODIFICATION_ERR;
					} else if (bNewExists) {
						// the full destination should NOT already exist if a copy
						errCode = PATH_EXISTS_ERR;
					}  else {
						bSuccess = [fileMgr copyItemAtPath: srcFullPath toPath: newFullPath error: &error];
					}
				} else { // move 
					// iOS requires that destination must not exist before calling moveTo
					// is W3C INVALID_MODIFICATION_ERR error if destination dir exists and has contents
					// 
					if (!bSrcIsDir && (bNewExists && bNewIsDir)){
						// can't move a file to directory
						errCode = INVALID_MODIFICATION_ERR;
					} else if (bSrcIsDir && ![self canCopyMoveSrc: srcFullPath ToDestination: newFullPath] ) { //[newFullPath hasPrefix:srcFullPath]){
						// can't move a dir into itself
						errCode = INVALID_MODIFICATION_ERR;	
					} else if (bNewExists) {
						if (bNewIsDir && [[fileMgr contentsOfDirectoryAtPath:newFullPath error: NULL] count] != 0){
							// can't move dir to a dir that is not empty
							errCode = INVALID_MODIFICATION_ERR;
							newFullPath = nil;  // so we won't try to move
						} else {
							// remove destination so can perform the moveItemAtPath
							bSuccess = [fileMgr removeItemAtPath:newFullPath error: NULL];
							if (!bSuccess) {
								errCode = INVALID_MODIFICATION_ERR; // is this the correct error?
								newFullPath = nil;
							}
						}
					} else if (bNewIsDir && [newFullPath hasPrefix:srcFullPath]) {
						// can't move a directory inside itself or to any child at any depth;
						errCode = INVALID_MODIFICATION_ERR;
						newFullPath = nil;
					}
						
					if (newFullPath != nil) {
						bSuccess = [fileMgr moveItemAtPath: srcFullPath toPath: newFullPath error: &error];
					}
				}
				if (bSuccess) {
					// should verify it is there and of the correct type???
					NSDictionary* newEntry = [self getDirectoryEntry: newFullPath isDirectory:bSrcIsDir]; //should be the same type as source
					result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: newEntry cast: @"justepApp.localFileSystem._castEntry"];
					jsString = [result onSuccessString:callbackId];
				}
				else {
					errCode = INVALID_MODIFICATION_ERR; // catch all
					if (error) {
						if ([error code] == NSFileReadUnknownError || [error code] == NSFileReadTooLargeError) {
							errCode = NOT_READABLE_ERR;
						} else if ([error code] == NSFileWriteOutOfSpaceError){
							errCode = QUOTA_EXCEEDED_ERR;
						} else if ([error code] == NSFileWriteNoPermissionError){
							errCode = NO_MODIFICATION_ALLOWED_ERR;
						}
					}
				}			
			}
			[fileMgr release];	
		}
	}
	if (errCode > 0) {
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errCode cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	}
	
	
	if (jsString){
		[self execJS: jsString];
	}
	
}

- (void) getFileMetadata:(NSString *)callbackId withFullPath:(NSString *)fullPath
{

    
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	

	if (fullPath) {
		NSFileManager* fileMgr = [[NSFileManager alloc] init];
		BOOL bIsDir = NO;
		// make sure it exists and is not a directory
		BOOL bExists = [fileMgr fileExistsAtPath:fullPath isDirectory: &bIsDir];
		if(!bExists || bIsDir){
			result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast:@"justepApp.localFileSystem._castError"];
			jsString = [result onErrorString:callbackId];
		} else {
			// create dictionary of file info
			NSError* error = nil;
			NSDictionary* fileAttrs = [fileMgr attributesOfItemAtPath:fullPath error:&error];
			NSMutableDictionary* fileInfo = [NSMutableDictionary dictionaryWithCapacity:5];
			[fileInfo setObject: [NSNumber numberWithUnsignedLongLong:[fileAttrs fileSize]] forKey:@"size"];
			[fileInfo setObject:fullPath forKey:@"fullPath"];
			[fileInfo setObject: @"" forKey:@"type"]; // can't easily get the mimetype unless create URL, send request and read response so skipping
			[fileInfo setObject: [fullPath lastPathComponent] forKey:@"name"];
			NSDate* modDate = [fileAttrs fileModificationDate];
			NSNumber* msDate = [NSNumber numberWithDouble:[modDate timeIntervalSince1970]*1000];
			[fileInfo setObject:msDate forKey:@"lastModifiedDate"];
			result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: fileInfo cast: @"justepApp.localFileSystem._castDate"];
			jsString = [result onSuccessString:callbackId];
		}
		[fileMgr release];
	}
	
	[self execJS:jsString];
}

- (void) readEntries:(NSString *)callbackId withFullPath:(NSString *)fullPath
{
	
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	NSFileManager* fileMgr = [[ NSFileManager alloc] init];
	NSError* error = nil;
	NSArray* contents = [fileMgr contentsOfDirectoryAtPath:fullPath error: &error];
	if (contents) {
		NSMutableArray* entries = [NSMutableArray arrayWithCapacity:1];
		if ([contents count] > 0){
			// create an Entry (as JSON) for each file/dir
			for (NSString* name in contents) {
				// see if is dir or file
				NSString* entryPath = [fullPath stringByAppendingPathComponent:name];
				BOOL bIsDir = NO;
				[fileMgr fileExistsAtPath:entryPath isDirectory: &bIsDir];
				NSDictionary* entryDict = [self getDirectoryEntry:entryPath isDirectory:bIsDir];
				[entries addObject:entryDict];
			}
		}
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsArray: entries cast: @"justepApp.localFileSystem._castEntries"];
		jsString = [result onSuccessString:callbackId];
	} else {
		// assume not found but could check error for more specific error conditions
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	} 

	[fileMgr release];
	
	[self execJS: jsString];
	
}
/* read and return file data 
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath
 *	2 - NSString* encoding - NOT USED,  iOS reads and writes using UTF8!
 * NSMutableDictionary* options
 *	empty
 */
- (void) readFile:(NSString *)callbackId withName:(NSString *)fileName withEncoding:(NSString *)encoding
{

	NSString* argPath = fileName;
    
	//NSString* encoding = [arguments objectAtIndex:2];   // not currently used
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	NSFileHandle* file = [ NSFileHandle fileHandleForReadingAtPath:argPath];
	
	if(!file){
		// invalid path entry
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: NOT_FOUND_ERR cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	} else {
		NSData* readData = [ file readDataToEndOfFile];
		
		[file closeFile];
        NSString* pNStrBuff = nil;
		if (readData) {
            pNStrBuff = [[NSString alloc] initWithBytes: [readData bytes] length: [readData length] encoding: NSUTF8StringEncoding];
        } else {
            // return empty string if no data
            pNStrBuff = [[NSString alloc] initWithString: @""];
        }
        
        
        result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsString: [ pNStrBuff stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] ];
        jsString = [result onSuccessString:callbackId];
        [ pNStrBuff release ];
        
		
	}
	if (jsString){
		[self execJS: jsString];
	}
	

}
/* Read content of text file and return as base64 encoded data url.
 * IN: 
 * NSArray* arguments
 *	0 - NSString* callbackId
 *	1 - NSString* fullPath
 * NSMutableDictionary* options
 *	empty
 * 
 * Determines the mime type from the file extension, returns ENCODING_ERR if mimetype can not be determined. 
 */
 
- (void) readAsDataURL:(NSString *)callbackId withName:(NSString *)fileName
{

	NSString* argPath = fileName;
    
	FileError errCode = ABORT_ERR; 
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	
	if(!argPath){
		errCode = SYNTAX_ERR;
	} else {
		NSString* mimeType = [self getMimeTypeFromPath:argPath];
		if (!mimeType) {
			// can't return as data URL if can't figure out the mimeType
			errCode = ENCODING_ERR;
		} else {
			NSFileHandle* file = [ NSFileHandle fileHandleForReadingAtPath:argPath];
			NSData* readData = [ file readDataToEndOfFile];
			[file closeFile];
			if (readData) {
				NSString* output = [NSString stringWithFormat:@"data:%@;base64,%@", mimeType, [readData base64EncodedString]];
				result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsString: output];
				jsString = [result onSuccessString:callbackId];
			} else {
				errCode = NOT_FOUND_ERR;
			}
		}
	}
	if (!jsString){
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errCode cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	}
	//NSLog(@"readAsDataURL return: %@", jsString);
	[self execJS:jsString];
		
	
}
/* helper function to get the mimeType from the file extension
 * IN:
 *	NSString* fullPath - filename (may include path)
 * OUT:
 *	NSString* the mime type as type/subtype.  nil if not able to determine
 */
-(NSString*) getMimeTypeFromPath: (NSString*) fullPath
{	
	
	NSString* mimeType = nil;
	if(fullPath) {
		CFStringRef typeId = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension,(CFStringRef)[fullPath pathExtension], NULL);
		if (typeId) {
			mimeType = (NSString*)UTTypeCopyPreferredTagWithClass(typeId,kUTTagClassMIMEType);
			if (mimeType) {
				[mimeType autorelease];
				//NSLog(@"mime type: %@", mimeType);
			} else {
                // special case for m4a
                if ([(NSString*)typeId rangeOfString: @"m4a-audio"].location != NSNotFound){
                    mimeType = @"audio/mp4";
                } else if ([[fullPath pathExtension] rangeOfString:@"wav"].location != NSNotFound){
                    mimeType = @"audio/wav";
                }
            }
			CFRelease(typeId);
		}
	}
	return mimeType;
}

- (void) truncateFile:(NSString *)callbackId withName:(NSString *)fileName withSize:(NSString *)size
{
	NSString* argPath = fileName;
	unsigned long long pos = (unsigned long long)[size longLongValue];
	
	NSString *appFile = argPath; //[self getFullPath:argPath];
	
	unsigned long long newPos = [ self truncateFile:appFile atPosition:pos];
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: newPos];
	[self execJS:[result onSuccessString: callbackId]];
	 
}

- (unsigned long long) truncateFile:(NSString*)filePath atPosition:(unsigned long long)pos
{

	unsigned long long newPos = 0UL;
	
	NSFileHandle* file = [ NSFileHandle fileHandleForWritingAtPath:filePath];
	if(file)
	{
		[file truncateFileAtOffset:(unsigned long long)pos];
		newPos = [ file offsetInFile];
		[ file synchronizeFile];
		[ file closeFile];
	}
	return newPos;
} 

/* write
 * IN:
 * NSArray* arguments
 *  0 - NSString* callbackId
 *  1 - NSString* file path to write to
 *  2 - NSString* data to write
 *  3 - NSNumber* position to begin writing 
 */
- (void) write:(NSString *)callbackId withName:(NSString *)fileName withData:(NSString *)data withPosition:(NSString *)position
{


	NSString* argPath = fileName;
	NSString* argData = data;
	unsigned long long pos = (unsigned long long)[position longLongValue];
	
	NSString* fullPath = argPath; //[self getFullPath:argPath];
	
	[self truncateFile:fullPath atPosition:pos];
	
	[self writeToFile: fullPath withData:argData append:YES callback: callbackId];
}
- (void) writeToFile:(NSString*)filePath withData:(NSString*)data append:(BOOL)shouldAppend callback: (NSString*) callbackId
{	
	JustepAppCommandCallback* result = nil;
	NSString* jsString = nil;
	FileError errCode = INVALID_MODIFICATION_ERR; 
	int bytesWritten = 0;
	NSData* encData = [ data dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
	if (filePath) {
		NSOutputStream* fileStream = [NSOutputStream outputStreamToFileAtPath:filePath append:shouldAppend ];
		if (fileStream) {
			NSUInteger len = [ encData length ];
			[ fileStream open ];
			
			bytesWritten = [ fileStream write:[encData bytes] maxLength:len];
			
			[ fileStream close ];
			if (bytesWritten > 0) {
				result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: bytesWritten];
				jsString = [result onSuccessString:callbackId];
			//} else {
				// can probably get more detailed error info via [fileStream streamError]
				//errCode already set to INVALID_MODIFICATION_ERR;
				//bytesWritten = 0; // may be set to -1 on error
			}
		} // else fileStream not created return INVALID_MODIFICATION_ERR
	} else {
		// invalid filePath
		errCode = NOT_FOUND_ERR;
	}
	if(!jsString) {
		// was an error 
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: errCode cast: @"justepApp.localFileSystem._castError"];
		jsString = [result onErrorString:callbackId];
	}
	[self execJS: jsString];
	
}

- (void) testFileExists:(NSString *)callbackId withFileName:(NSString *)fileName
{
	NSString* argPath = fileName;
    
	NSString* jsString = nil;
	// Get the file manager
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	NSString *appFile = argPath; //[ self getFullPath: argPath];
	
	BOOL bExists = [fMgr fileExistsAtPath:appFile];
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: ( bExists ? 1 : 0 )];
	// keep original format of returning 0 or 1 to success  callback
	jsString = [result onSuccessString: callbackId];
	

	[self execJS: jsString];
}

- (void) testDirectoryExists:(NSString *)callbackId withDirName:(NSString *)dirName
{
    NSString* argPath = dirName;
	
	NSString* jsString = nil;
	// Get the file manager
	NSFileManager* fMgr = [[NSFileManager alloc] init];
	NSString *appFile = argPath; //[self getFullPath: argPath];
	BOOL bIsDir = NO;
	BOOL bExists = [fMgr fileExistsAtPath:appFile isDirectory: &bIsDir];
	
	
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: ( (bExists && bIsDir) ? 1 : 0 )];
	// keep original format of returning 0 or 1 to success callback
	jsString = [result onSuccessString: callbackId];
	[fMgr release];
	[self execJS: jsString];
}

// Returns number of bytes available via callback
- (void) getFreeDiskSpace:(NSString *)callbackId withDict:(NSMutableDictionary *)options
{

    
    // no arguments
    
	NSNumber* pNumAvail = [self checkFreeDiskSpace:self.appDocsPath];
	
	NSString* strFreeSpace = [NSString stringWithFormat:@"%qu", [ pNumAvail unsignedLongLongValue ] ];
	//NSLog(@"Free space is %@", strFreeSpace );
	
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsString: strFreeSpace];
	[self execJS:[result onSuccessString: callbackId]];
	
}

-(void) dealloc
{
	self.appDocsPath = nil;
	self.appLibraryPath = nil;
	self.appTempPath = nil;
	self.persistentPath = nil;
	self.temporaryPath = nil;
	
	[super dealloc];
}





@end
