//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//
#import "JustepAppGeolocation.h"

#import "JustepViewController.h"

#pragma mark Constants

#define kJustepAppGeolocationErrorDomain          @"kJustepAppGeolocationErrorDomain"
#define kJustepAppGeolocationDesiredAccuracyKey   @"desiredAccuracy"
#define kJustepAppGeolocationForcePromptKey       @"forcePrompt"
#define kJustepAppGeolocationDistanceFilterKey    @"distanceFilter"
#define kJustepAppGeolocationFrequencyKey         @"frequency"

#pragma mark -
#pragma mark Categories

@interface NSError(JSONMethods)

- (NSString*) JSONRepresentation;

@end

@interface CLLocation(JSONMethods)

- (NSString*) JSONRepresentation;

@end


@interface CLHeading(JSONMethods)

- (NSString*) JSONRepresentation;

@end

#pragma mark -
#pragma mark JustepAppHeadingData

@implementation JustepAppHeadingData

@synthesize headingStatus, headingRepeats, headingInfo, headingCallbacks, headingFilter;
-(JustepAppHeadingData*) init
{
    self = (JustepAppHeadingData*)[super init];
    if (self) 
	{
        self.headingRepeats = NO;
        self.headingStatus = HEADINGSTOPPED;
        self.headingInfo = nil;
        self.headingCallbacks = nil;
        self.headingFilter = nil;
    }
    return self;
}
-(void) dealloc 
{
    self.headingInfo = nil;
    self.headingCallbacks = nil;
    self.headingFilter = nil;
    [super dealloc];  
}

@end

#pragma mark -
#pragma mark JustepAppGeolocation

@implementation JustepAppGeolocation

@synthesize locationManager, headingData;

- (JustepAppPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (JustepAppGeolocation *)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
        __locationStarted = NO;
        self.headingData = nil;        
    }
    return self;
}

- (BOOL) hasHeadingSupport
{
	BOOL headingInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(headingAvailable)]; // iOS 3.x
	BOOL headingClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(headingAvailable)]; // iOS 4.x
	
	if (headingInstancePropertyAvailable) { // iOS 3.x
		return [(id)self.locationManager headingAvailable];
	} else if (headingClassPropertyAvailable) { // iOS 4.x
		return [CLLocationManager headingAvailable];
	} else { // iOS 2.x
		return NO;
	}
}

- (BOOL) isAuthorized
{
	BOOL authorizationStatusClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
    if (authorizationStatusClassPropertyAvailable)
    {
        NSUInteger authStatus = [CLLocationManager authorizationStatus];
        return  (authStatus == kCLAuthorizationStatusAuthorized) || (authStatus == kCLAuthorizationStatusNotDetermined);
    }
    
    // by default, assume YES (for iOS < 4.2)
    return YES;
}

- (BOOL) isLocationServicesEnabled
{
	BOOL locationServicesEnabledInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(locationServicesEnabled)]; // iOS 3.x
	BOOL locationServicesEnabledClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(locationServicesEnabled)]; // iOS 4.x
    
	if (locationServicesEnabledClassPropertyAvailable) 
	{ // iOS 4.x
		return [CLLocationManager locationServicesEnabled];
	} 
	else if (locationServicesEnabledInstancePropertyAvailable) 
	{ // iOS 2.x, iOS 3.x
		return [(id)self.locationManager locationServicesEnabled];
	} 
	else 
	{
		return NO;
	}
}

- (void) startLocationWithDict:(NSMutableDictionary *)options
{
    if (![self isLocationServicesEnabled])
	{
		BOOL forcePrompt = NO;
		// if forcePrompt is true iPhone will still show the "Location Services not active." Settings | Cancel prompt.
		if ([options objectForKey:kJustepAppGeolocationForcePromptKey]) 
		{
			forcePrompt = [[options objectForKey:kJustepAppGeolocationForcePromptKey] boolValue];
		}
        
		if (!forcePrompt)
		{
            NSError* error = [NSError errorWithDomain:kJustepAppGeolocationErrorDomain code:1 userInfo:
                              [NSDictionary dictionaryWithObject:@"Location services is not enabled" forKey:NSLocalizedDescriptionKey]];
            NSLog(@"%@", [error JSONRepresentation]);
            
			NSString* jsCallback = [NSString stringWithFormat:@"justepApp.geolocation.setError(%@);", [error JSONRepresentation]]; 
			[super execJS:jsCallback];
            
			return;
		}
    }
    if (![self isAuthorized]) 
    {
        NSUInteger code = -1;
        BOOL authStatusAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
        if (authStatusAvailable) {
            code = [CLLocationManager authorizationStatus];
        }
        
        NSError* error = [NSError errorWithDomain:NSCocoaErrorDomain code:code userInfo:
                          [NSDictionary dictionaryWithObject:@"App is not authorized for Location Services" forKey:NSLocalizedDescriptionKey]];
        NSLog(@"%@", [error JSONRepresentation]);

        NSString* jsCallback = [NSString stringWithFormat:@"justepApp.geolocation.setError(%@);", [error JSONRepresentation]];
        [super execJS:jsCallback];
        
        return;
    }
	
    // Tell the location manager to start notifying us of location updates. We
    // first stop, and then start the updating to ensure we get at least one
    // update, even if our location did not change.
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;

    if ([options objectForKey:kJustepAppGeolocationDistanceFilterKey]) 
	{
        CLLocationDistance distanceFilter = [(NSString *)[options objectForKey:kJustepAppGeolocationDistanceFilterKey] doubleValue];
        self.locationManager.distanceFilter = distanceFilter;
    }
    
    if ([options objectForKey:kJustepAppGeolocationDesiredAccuracyKey]) 
    {
        int desiredAccuracy_num = [(NSString *)[options objectForKey:kJustepAppGeolocationDesiredAccuracyKey] integerValue];
        CLLocationAccuracy desiredAccuracy = kCLLocationAccuracyBest;
        
        if (desiredAccuracy_num < 10) {
            desiredAccuracy = kCLLocationAccuracyBest;
        }
        else if (desiredAccuracy_num < 100) {
            desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
        }
        else if (desiredAccuracy_num < 1000) {
            desiredAccuracy = kCLLocationAccuracyHundredMeters;
        }
        else if (desiredAccuracy_num < 3000) {
            desiredAccuracy = kCLLocationAccuracyKilometer;
        }
        else {
            desiredAccuracy = kCLLocationAccuracyThreeKilometers;
        }
        
        self.locationManager.desiredAccuracy = desiredAccuracy;
    }
}

- (void) stopLocation
{
    if (__locationStarted)
	{
		if (![self isLocationServicesEnabled]) {
			return;
        }
    
		[self.locationManager stopUpdatingLocation];
		__locationStarted = NO;
	}
}

- (void) locationManager:(CLLocationManager *)manager
							didUpdateToLocation:(CLLocation *)newLocation
							fromLocation:(CLLocation *)oldLocation
{
	
    NSString* jsCallback = [NSString stringWithFormat:@"justepApp.geolocation.setLocation(%@);", [newLocation JSONRepresentation]];
    [super execJS:jsCallback];
}
// called to get the current heading
// Will call location manager to startUpdatingHeading if necessary

- (void)getCurrentHeading:(NSString *)callbackId withDict:(NSMutableDictionary *)options
{

    NSNumber* repeats = [options valueForKey:@"repeats"];  // indicates this call will be repeated at regular intervals
    
    if ([self hasHeadingSupport] == NO) 
    {
        JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageToErrorObject:20];
        [super execJS:[result onErrorString:callbackId]];
    } else {
       // heading retrieval does is not affected by disabling locationServices and authorization of app for location services
        if (!self.headingData) {
            self.headingData = [[[JustepAppHeadingData alloc] init] autorelease];
        }
        JustepAppHeadingData* hData = self.headingData;
        
        if (repeats != nil) {
            hData.headingRepeats = YES;
        }
        if (!hData.headingCallbacks) {
            hData.headingCallbacks = [NSMutableArray arrayWithCapacity:1];
        }
        // add the callbackId into the array so we can call back when get data
        [hData.headingCallbacks addObject:callbackId]; 
        
        if (hData.headingStatus != HEADINGRUNNING && hData.headingStatus != HEADINGERROR) {
            // Tell the location manager to start notifying us of heading updates
            [self startHeadingWithFilter: 0.2];
        }
        else {
            [self returnHeadingInfo: callbackId keepCallback:NO]; 
        }
    }
  
          
} 
// called to request heading updates when heading changes by a certain amount (filter)
- (void)watchHeadingFilter:(NSString *)callbackId withDict:(NSMutableDictionary*)options
{

    NSNumber* filter = [options valueForKey:@"filter"];
    JustepAppHeadingData* hData = self.headingData;
    if ([self hasHeadingSupport] == NO) {
        JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageToErrorObject:20];
        [super execJS:[result onErrorString:callbackId]];
    } else {
        if (!hData) {
            self.headingData = [[[JustepAppHeadingData alloc] init] autorelease];
            hData = self.headingData;
        }
        if (hData.headingStatus != HEADINGRUNNING) {
            // Tell the location manager to start notifying us of heading updates
            [self startHeadingWithFilter: [filter doubleValue]];
        } else {
            // if already running check to see if due to existing watch filter
            if (hData.headingFilter && ![hData.headingFilter isEqualToString:callbackId]){
                // new watch filter being specified
                // send heading data one last time to clear old successCallback
                [self returnHeadingInfo:hData.headingFilter keepCallback: NO];
            } 
            
        }
        // save the new filter callback and update the headingFilter setting
        hData.headingFilter = callbackId;
        // check if need to stop and restart in order to change value???
        self.locationManager.headingFilter = [filter doubleValue];
    } 
}
- (void)returnHeadingInfo: (NSString*) callbackId keepCallback: (BOOL) bRetain
{
    JustepAppCommandCallback* result = nil;
    NSString* jsString = nil;
    JustepAppHeadingData* hData = self.headingData;
    
    if (hData && hData.headingStatus == HEADINGERROR) {
        // return error
        result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageToErrorObject:0];
        jsString = [result onErrorString:callbackId];
    } else if (hData && hData.headingStatus == HEADINGRUNNING && hData.headingInfo) {
        // if there is heading info, return it
        CLHeading* hInfo = hData.headingInfo;
        NSMutableDictionary* returnInfo = [NSMutableDictionary dictionaryWithCapacity:4];
        NSNumber* timestamp = [NSNumber numberWithDouble:([hInfo.timestamp timeIntervalSince1970]*1000)];
        [returnInfo setObject:timestamp forKey:@"timestamp"];
        [returnInfo setObject:[NSNumber numberWithDouble: hInfo.magneticHeading] forKey:@"magneticHeading"];
        id trueHeading = __locationStarted ? (id)[NSNumber numberWithDouble:hInfo.trueHeading]:(id)[NSNull null];
        [returnInfo setObject:trueHeading forKey:@"trueHeading"];
        [returnInfo setObject:[NSNumber numberWithDouble: hInfo.headingAccuracy] forKey:@"headingAccuracy"];
        
        result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: returnInfo];
        [result setKeepCallbackAsBool:bRetain];

        jsString = [result onSuccessString:callbackId];
    }
    if (jsString) {
        [super execJS:jsString];
    }
    
    
}

- (void) stopHeading
{
    JustepAppHeadingData* hData = self.headingData;
    if (hData && hData.headingStatus != HEADINGSTOPPED)
	{
		if (hData.headingFilter) {
            // callback one last time to clear callback
            [self returnHeadingInfo:hData.headingFilter keepCallback:NO];
            hData.headingFilter = nil;
        }
        [self.locationManager stopUpdatingHeading];		
        self.headingData = nil;
	}
}	


// helper method to check the orientation and start updating headings
- (void) startHeadingWithFilter: (CLLocationDegrees) filter
{
    if ([self.locationManager respondsToSelector: @selector(headingOrientation)]) {
        UIDeviceOrientation currentOrientation = [[UIDevice currentDevice] orientation];
        if (currentOrientation != UIDeviceOrientationUnknown) {
            /**
             JustepViewController* viewController = (JustepViewController *)self.appViewController;
            **/ 
            //TODO ：等待多方向支持
            
        }
    }
    self.locationManager.headingFilter = filter;
    [self.locationManager startUpdatingHeading];
    self.headingData.headingStatus = HEADINGSTARTING;
}
- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager
{
	return YES;
}

- (void) locationManager:(CLLocationManager *)manager
						didUpdateHeading:(CLHeading *)heading
{
    JustepAppHeadingData* hData = self.headingData;
    // save the data for next call into getHeadingData
    hData.headingInfo = heading;
    
    if (hData.headingStatus == HEADINGSTARTING) {
        hData.headingStatus = HEADINGRUNNING; // so returnHeading info will work
        //this is the first update
        for (NSString* callbackId in hData.headingCallbacks) {
            [self returnHeadingInfo:callbackId keepCallback:NO];
        }
        [hData.headingCallbacks removeAllObjects];
        if (!hData.headingRepeats && !hData.headingFilter) {
            [self stopHeading];
        }
    }
    if (hData.headingFilter) {
        [self returnHeadingInfo: hData.headingFilter keepCallback:YES];
    }
    hData.headingStatus = HEADINGRUNNING;  // to clear any error

}
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"locationManager::didFailWithError %@", [error localizedFailureReason]);
	NSString* jsCallback = @"";
	
    // Compass Error
	if ([error code] == kCLErrorHeadingFailure)
	{
		JustepAppHeadingData* hData = self.headingData;
        if (hData) {
            if (hData.headingStatus == HEADINGSTARTING) {
                // heading error during startup - report error
                for (NSString* callbackId in hData.headingCallbacks) {
                    JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageToErrorObject:0];
                    [super execJS: [result onErrorString:callbackId]];
                }
                [hData.headingCallbacks removeAllObjects];
            } // else for frequency watches next call to getCurrentHeading will report error
            else if (hData.headingFilter) {
                JustepAppCommandCallback* resultFilter = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageToErrorObject:0];
                [super execJS: [resultFilter onErrorString:hData.headingFilter]];
            }
            hData.headingStatus = HEADINGERROR;
        }
	} 
    // Location Error
	else 
	{
		/*
			W3C PositionError
			 PositionError.UNKNOWN_ERROR = 0;  // equivalent to kCLErrorLocationUnknown=0
			 PositionError.PERMISSION_DENIED = 1; // equivalent to kCLErrorDenied=1
			 PositionError.POSITION_UNAVAILABLE = 2; // equivalent to kCLErrorNetwork=2
		 
			(any other errors are translated to PositionError.UNKNOWN_ERROR)
		 */
		if (error.code > kCLErrorNetwork) {
            error = [NSError errorWithDomain:error.domain code:kCLErrorLocationUnknown userInfo:error.userInfo];
		}
		
		jsCallback = [NSString stringWithFormat:@"justepApp.geolocation.setError(%@);", [error JSONRepresentation]];
	}
	
    [super execJS:jsCallback];
    
	[self.locationManager stopUpdatingLocation];
    __locationStarted = NO;
}

- (void) dealloc 
{
	self.locationManager.delegate = nil;
	self.locationManager = nil;
    self.headingData = nil;
	[super dealloc];
}

@end

#pragma mark -
#pragma mark CLLocation(JSONMethods)

@implementation CLLocation(JSONMethods)

- (NSString*) JSONRepresentation
{
	return [NSString stringWithFormat:
            @"{ timestamp: %.00f, \
                coords: { latitude: %f, longitude: %f, altitude: %.02f, heading: %.02f, speed: %.02f, accuracy: %.02f, altitudeAccuracy: %.02f } \
              }",
            [self.timestamp timeIntervalSince1970] * 1000.0,
            self.coordinate.latitude,
            self.coordinate.longitude,
            self.altitude,
            self.course,
            self.speed,
            self.horizontalAccuracy,
            self.verticalAccuracy
			];
}

@end


#pragma mark NSError(JSONMethods)

@implementation NSError(JSONMethods)

- (NSString*) JSONRepresentation
{
    return [NSString stringWithFormat:
            @"{ code: %d, message: '%@'}", 
			self.code, 
			[self localizedDescription]
            ];
}

@end
