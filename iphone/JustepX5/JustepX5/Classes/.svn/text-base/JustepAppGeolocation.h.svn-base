//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import "JustepAppPlugin.h"

enum HeadingStatus {
	HEADINGSTOPPED = 0,
    HEADINGSTARTING,
	HEADINGRUNNING,
    HEADINGERROR
};
typedef NSUInteger HeadingStatus;


@interface JustepAppHeadingData : NSObject {
    HeadingStatus     headingStatus;
    BOOL              headingRepeats;
    CLHeading*        headingInfo;
    NSMutableArray*   headingCallbacks;
    NSString*         headingFilter;
    
}

@property (nonatomic, assign) HeadingStatus headingStatus;
@property (nonatomic, assign) BOOL headingRepeats;
@property (nonatomic, retain) CLHeading* headingInfo;
@property (nonatomic, retain) NSMutableArray* headingCallbacks;
@property (nonatomic, retain) NSString* headingFilter;

@end

@interface JustepAppGeolocation : JustepAppPlugin <CLLocationManagerDelegate> {

    @private BOOL              __locationStarted;
    JustepAppHeadingData*    headingData;
}

@property (nonatomic, retain) CLLocationManager *locationManager;
@property (nonatomic, retain) JustepAppHeadingData* headingData;


- (BOOL) hasHeadingSupport;

- (void)startLocationWithDict:(NSMutableDictionary*)options;

- (void)stopLocation;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error;

- (BOOL) isLocationServicesEnabled;


- (void)getCurrentHeading:(NSString *)callbackId withDict:(NSMutableDictionary*)options;
- (void)returnHeadingInfo: (NSString*) callbackId keepCallback: (BOOL) bRetain;

- (void)stopHeading;
- (void) startHeadingWithFilter: (CLLocationDegrees) filter;
- (void)locationManager:(CLLocationManager *)manager
	   didUpdateHeading:(CLHeading *)heading;

- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager;

@end


