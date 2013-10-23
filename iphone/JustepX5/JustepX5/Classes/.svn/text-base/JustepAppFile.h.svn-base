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
#import "JustepAppPlugin.h"

enum FileError {
	NOT_FOUND_ERR = 1,
    SECURITY_ERR = 2,
    ABORT_ERR = 3,
    NOT_READABLE_ERR = 4,
    ENCODING_ERR = 5,
    NO_MODIFICATION_ALLOWED_ERR = 6,
    INVALID_STATE_ERR = 7,
    SYNTAX_ERR = 8,
    INVALID_MODIFICATION_ERR = 9,
    QUOTA_EXCEEDED_ERR = 10,
    TYPE_MISMATCH_ERR = 11,
    PATH_EXISTS_ERR = 12
};
typedef int FileError;

enum FileSystemType {
	TEMPORARY = 0,
	PERSISTENT = 1
};
typedef int FileSystemType;

@interface JustepAppFile : JustepAppPlugin {
	
	NSString *appDocsPath;	
	NSString *appLibraryPath;	
	NSString *appTempPath;
	NSString *persistentPath;
	NSString *temporaryPath;
	
	BOOL userHasAllowed;

}
- (NSNumber*) checkFreeDiskSpace: (NSString*) appPath;
-(NSString*) getAppPath: (NSString*)pathFragment;
//-(NSString*) getFullPath: (NSString*)pathFragment;
- (void) requestFileSystem:(NSString *)callbackId withType:(NSString *)type withSize:(NSString *)size;
-(NSDictionary*) getDirectoryEntry: (NSString*) fullPath isDirectory: (BOOL) isDir;
- (void) resolveLocalFileSystemURI:(NSString *)callbackId withURI:(NSString *)uri;
- (void) getDirectory:(NSString *)callbackId withFullPath:(NSString *)fullPath withSubPath:(NSString *)subPath withDict:(NSMutableDictionary *)options;
- (void) getFile:(NSString *)callbackId withFullPath:(NSString *)fullPath withSubPath:(NSString *)subPath withDict:(NSMutableDictionary*)options;
- (void) getParent:(NSString *)callbackId withFullPath:(NSString *)fullPath;
- (void) getMetadata:(NSString *)callbackId withFullPath:(NSString *)fullPath;
- (void) removeRecursively:(NSString *)callbackId withFullPath:(NSString *)fullPath;
- (void) remove:(NSString *)callbackId withFullPath:(NSString *)fullPath;
- (NSString*) doRemove:(NSString*)fullPath callback: (NSString*)callbackId;
- (void) copy:(NSString *)callbackId from:(NSString *)fullPath to:(NSString *)parent withNewName:(NSString *)newName;
- (void) move:(NSString *)callbackId from:(NSString *)fullPath to:(NSString  *)parent withNewName:(NSString *)newName;
-(BOOL) canCopyMoveSrc: (NSString*) src ToDestination: (NSString*) dest;
- (void) doCopyMove:(NSString *)callbackId from:(NSString *)fullPath to:(NSString *)parent
        withNewName:(NSString *)newName   withDict:(NSMutableDictionary*)options  isCopy:(BOOL)bCopy;
//- (void) toURI:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFileMetadata:(NSString *)callbackId withFullPath:(NSString *)fullPath;
- (void) readEntries:(NSString *)callbackId withFullPath:(NSString *)fullPath;

- (void) readFile:(NSString *)callbackId withName:(NSString *)fileName withEncoding:(NSString *)encoding;
- (void) readAsDataURL:(NSString *)callbackId withName:(NSString *)fileName;
-(NSString*) getMimeTypeFromPath: (NSString*) fullPath;
- (void) write:(NSString *)callbackId withName:(NSString *)fileName withData:(NSString *)data withPosition:(NSString *)position;
- (void) testFileExists:(NSString *)callbackId withFileName:(NSString *)fileName;
- (void) testDirectoryExists:(NSString *)callbackId withDirName:(NSString *)dirName;
//- (void) createDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
//- (void) deleteDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
//- (void) deleteFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFreeDiskSpace:(NSString *)callbackId withDict:(NSMutableDictionary*)options;
- (void) truncateFile:(NSString *)callbackId withName:(NSString *)fileName withSize:(NSString *)size;



//- (BOOL) fileExists:(NSString*)fileName;
//- (BOOL) directoryExists:(NSString*)dirName;
- (void) writeToFile:(NSString*)fileName withData:(NSString*)data append:(BOOL)shouldAppend callback: (NSString*) callbackId;
- (unsigned long long) truncateFile:(NSString*)filePath atPosition:(unsigned long long)pos;


@property (nonatomic, retain)NSString *appDocsPath;
@property (nonatomic, retain)NSString *appLibraryPath;
@property (nonatomic, retain)NSString *appTempPath;
@property (nonatomic, retain)NSString *persistentPath;
@property (nonatomic, retain)NSString *temporaryPath;
@property BOOL userHasAllowed;

@end

#define kW3FileTemporary @"temporary"
#define kW3FilePersistent @"persistent"