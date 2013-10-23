//
//  JustepX5
//
//  Created by 007slm(007slm@163.com)
//
//  Created by 007slm on 12-6-5.
//  Copyright (c) 2012年 Justep. All rights reserved.
// on 12-6-8.
//

#import "JustepAppContacts.h"
#import <UIKit/UIKit.h>
#import <JustepAppBridge/NSDictionaryExtension.h>
#import "JustepAppNotification.h"


@implementation ContactsPicker

@synthesize allowsEditing;
@synthesize callbackId;
@synthesize selectedId;

@end
@implementation NewContactsController

@synthesize callbackId;

@end

@implementation JustepAppContacts


-(JustepAppPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (JustepAppContacts*)[super initWithWebView:(UIWebView*)theWebView];
	return self;
}


// overridden to clean up Contact statics
-(void)onAppTerminate
{
	//NSLog(@"Contacts::onAppTerminate");
	[JustepAppContact releaseDefaults];
}


// iPhone only method to create a new contact through the GUI
- (void) newContact:(NSString *)callbackId withDict:(NSMutableDictionary*)options;
{	
	

	NewContactsController* npController = [[[NewContactsController alloc] init] autorelease];
	
	ABAddressBookRef ab = ABAddressBookCreate();
	npController.addressBook = ab; // a CF retaining assign
    CFRelease(ab);
    
	npController.newPersonViewDelegate = self;
	npController.callbackId = callbackId;

	UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
    
    if ([self.appViewController respondsToSelector:@selector(presentViewController:::)]) {
        [self.appViewController presentViewController:navController animated:YES completion:nil];        
    } else {
        [self.appViewController presentModalViewController:navController animated:YES ];
    }              
}

- (void) newPersonViewController:(ABNewPersonViewController*)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{

	ABRecordID recordId = kABRecordInvalidID;
	NewContactsController* newCP = (NewContactsController*) newPersonViewController;
	NSString* callbackId = newCP.callbackId;
	
	if (person != NULL) {
			//return the contact id
			recordId = ABRecordGetRecordID(person);
	}

    if ([newPersonViewController respondsToSelector:@selector(presentingViewController)]) { 
        [[newPersonViewController presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[newPersonViewController parentViewController] dismissModalViewControllerAnimated:YES];
    }        
    
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt:  recordId];
	//jsString = [NSString stringWithFormat: @"%@(%d);", newCP.jsCallback, recordId];
	[self execJS: [result onSuccessString:callbackId]];
	
}

- (void) displayContact:(NSString *)callbackId withId:(NSString *)contactId withDict:(NSMutableDictionary *)options
{
	ABRecordID recordID = kABRecordInvalidID;

	
	recordID = [contactId intValue];
	
	bool bEdit = [options isKindOfClass:[NSNull class]] ? false : [options existsValue:@"true" forKey:@"allowsEditing"];
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	ABRecordRef rec = ABAddressBookGetPersonWithRecordID(addrBook, recordID);
	if (rec) {
		DisplayContactViewController* personController = [[[DisplayContactViewController alloc] init] autorelease];
		personController.displayedPerson = rec;
		personController.personViewDelegate = self;
		personController.allowsEditing = NO;
		
        // create this so DisplayContactViewController will have a "back" button.
        UIViewController* parentController = [[[UIViewController alloc] init] autorelease];
        UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:parentController] autorelease];

        [navController pushViewController:personController animated:YES];

        if ([self.appViewController respondsToSelector:@selector(presentViewController:::)]) {
            [self.appViewController presentViewController:navController animated:YES completion:nil];        
        } else {
            [self.appViewController presentModalViewController:navController animated:YES ];
        }              

		if (bEdit) {
            // create the editing controller and push it onto the stack
            ABPersonViewController* editPersonController = [[[ABPersonViewController alloc] init] autorelease];
            editPersonController.displayedPerson = rec;
            editPersonController.personViewDelegate = self;
            editPersonController.allowsEditing = YES; 
            [navController pushViewController:editPersonController animated:YES];
        }
	} 
	else 
	{
		// no record, return error
		JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt:  UNKNOWN_ERROR];
		[self execJS:[result onErrorString:callbackId]];
		
	}
	CFRelease(addrBook);
}
								   
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue
{
	return YES;
}
	
- (void) chooseContact:(NSString *)callbackId withDict:(NSMutableDictionary*)options
{

	
	ContactsPicker* pickerController = [[[ContactsPicker alloc] init] autorelease];
	pickerController.peoplePickerDelegate = self;
	pickerController.callbackId = callbackId;
	pickerController.selectedId = kABRecordInvalidID;
	pickerController.allowsEditing = (BOOL)[options existsValue:@"true" forKey:@"allowsEditing"];
	
    if ([self.appViewController respondsToSelector:@selector(presentViewController:::)]) {
        [self.appViewController presentViewController:pickerController animated:YES completion:nil];        
    } else {
        [self.appViewController presentModalViewController:pickerController animated:YES ];
    }              
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
	
	ContactsPicker* picker = (ContactsPicker*)peoplePicker;
	ABRecordID contactId = ABRecordGetRecordID(person);
	picker.selectedId = contactId; // save so can return when dismiss

	
	if (picker.allowsEditing) {
		
		ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
		personController.displayedPerson = person;
		personController.personViewDelegate = self;
		personController.allowsEditing = picker.allowsEditing;
		
		
		[peoplePicker pushViewController:personController animated:YES];
	} else {
		// return the contact Id
		JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus: JustepAppCommandStatus_OK messageAsInt: contactId];
		[self execJS:[result onSuccessString: picker.callbackId]];
		
        if ([picker respondsToSelector:@selector(presentingViewController)]) { 
            [[picker presentingViewController] dismissViewControllerAnimated:YES completion:nil];
        } else {
            [[picker parentViewController] dismissModalViewControllerAnimated:YES];
        }        
	}
	return NO;
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifier
{
	return YES;
}

- (void) peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker
{
	// return contactId or invalid if none picked
	ContactsPicker* picker = (ContactsPicker*)peoplePicker;
	JustepAppCommandCallback* result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsInt: picker.selectedId];
	[self execJS:[result onSuccessString:picker.callbackId]];
	
    if ([peoplePicker respondsToSelector:@selector(presentingViewController)]) { 
        [[peoplePicker presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[peoplePicker parentViewController] dismissModalViewControllerAnimated:YES];
    }        
}

- (void) search:(NSString *)callbackId withDict:(NSMutableDictionary*)options
{
	NSString* jsString = nil;

	
	
	NSArray* fields = [options valueForKey:@"fields"];
	NSDictionary* findOptions = [options valueForKey:@"findOptions"];
	
	ABAddressBookRef  addrBook = nil;
	NSArray* foundRecords = nil;
	

	addrBook = ABAddressBookCreate();
	// get the findOptions values
	BOOL multiple = NO; // default is false
	NSString* filter = nil;
	if (![findOptions isKindOfClass:[NSNull class]]){
		id value = nil;
		filter = (NSString*)[findOptions objectForKey:@"filter"];
		value = [findOptions objectForKey:@"multiple"];
		if ([value isKindOfClass:[NSNumber class]]){
			// multiple is a boolean that will come through as an NSNumber
			multiple = [(NSNumber*)value boolValue];
			//NSLog(@"multiple is: %d", multiple);
		}
	}

	NSDictionary* returnFields = [[JustepAppContact class] calcReturnFields: fields];
	
	NSMutableArray* matches = nil;
	if (!filter || [filter isEqualToString:@""]){ 
		// get all records 
		foundRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
		if (foundRecords && [foundRecords count] > 0){
			// create Contacts and put into matches array
            // doesn't make sense to ask for all records when multiple == NO but better check
			int xferCount = multiple == YES ? [foundRecords count] : 1;
			matches = [NSMutableArray arrayWithCapacity:xferCount];
			for(int k = 0; k<xferCount; k++){
				JustepAppContact* xferContact = [[[JustepAppContact alloc] initFromABRecord:(ABRecordRef)[foundRecords objectAtIndex:k]] autorelease];
				[matches addObject:xferContact];
				xferContact = nil;
				
			}
		}
	} else {
		foundRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
		matches = [NSMutableArray arrayWithCapacity:1];
		BOOL bFound = NO;
		int testCount = [foundRecords count];
		for(int j=0; j<testCount; j++){
			JustepAppContact* testContact = [[[JustepAppContact alloc] initFromABRecord: (ABRecordRef)[foundRecords objectAtIndex:j]] autorelease];
			if (testContact){
				bFound = [testContact foundValue:filter inFields:returnFields];
				if(bFound){
					[matches addObject:testContact];
				}
				testContact = nil;
			}
		}
	}

	NSMutableArray* returnContacts = [NSMutableArray arrayWithCapacity:1];
	
	if (matches != nil && [matches count] > 0){
		// convert to JS Contacts format and return in callback
        // - returnFields  determines what properties to return
		NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init]; 
		int count = multiple == YES ? [matches count] : 1;
		for(int i = 0; i<count; i++){
			JustepAppContact *newContact = [matches objectAtIndex:i];
			NSDictionary* aContact = [newContact toDictionary: returnFields];
			[returnContacts addObject:aContact];
		}
		[pool release];
	}
	JustepAppCommandCallback* result = nil;
    // return found contacts (array is empty if no contacts found)
    result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsArray: returnContacts  cast: @"justepApp.contacts._findCallback"];
    jsString = [result onSuccessString:callbackId];
    // NSLog(@"findCallback string: %@", jsString);
	

	if(addrBook){
		CFRelease(addrBook);
	}
	if (foundRecords){
		[foundRecords release];
	}
	
	if(jsString){
		[self execJS:jsString];
    }
	return;
	
	
}
- (void) save:(NSString *)callbackId withDict:(NSMutableDictionary*)options
{

	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	BOOL bUpdate = NO;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	JustepAppCommandCallback* result = nil;	
	
	NSMutableDictionary* contactDict = [options valueForKey:@"contact"];
	
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	NSNumber* cId = [contactDict valueForKey:kW3ContactId];
	JustepAppContact* aContact = nil; 
	ABRecordRef rec = nil;
	if (cId && ![cId isKindOfClass:[NSNull class]]){
		rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
		if (rec){
			aContact = [[JustepAppContact alloc] initFromABRecord: rec ];
			bUpdate = YES;
		}
	}
	if (!aContact){
		aContact = [[JustepAppContact alloc] init]; 			
	}
	
	bSuccess = [aContact setFromContactDict: contactDict asUpdate: bUpdate];
	if (bSuccess){
		if (!bUpdate){
			bSuccess = ABAddressBookAddRecord(addrBook, [aContact record], &error);
		}
		if (bSuccess) {
			bSuccess = ABAddressBookSave(addrBook, &error);
		}
		if (!bSuccess){  // need to provide error codes
			bIsError = TRUE;
			errCode = IO_ERROR; 
		} else {
			
			// give original dictionary back?  If generate dictionary from saved contact, have no returnFields specified
			// so would give back all fields (which W3C spec. indicates is not desired)
			// for now (while testing) give back saved, full contact
			NSDictionary* newContact = [aContact toDictionary: [JustepAppContact defaultFields]];
			//NSString* contactStr = [newContact JSONRepresentation];
			result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: newContact cast: @"justepApp.contacts._contactCallback" ];
			jsString = [result onSuccessString:callbackId];
		}
	} else {
		bIsError = TRUE;
		errCode = IO_ERROR; 
	}
	[aContact release];	
	CFRelease(addrBook);
		
	if (bIsError){
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_ERROR messageAsInt: errCode cast:@"justepApp.contacts._errCallback" ];
		jsString = [result onErrorString:callbackId];
	}
	
	if(jsString){
		[self execJS: jsString];
		//[webView stringByEvaluatingJavaScriptFromString:jsString];
	}
	
	
}	
- (void) remove: (NSString *)callbackId withDict:(NSMutableDictionary*)options
{

	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	ABAddressBookRef addrBook = nil;
	ABRecordRef rec = nil;
	JustepAppCommandCallback* result = nil;
	
	NSMutableDictionary* contactDict = [options valueForKey:@"contact"];
	addrBook = ABAddressBookCreate();	
	NSNumber* cId = [contactDict valueForKey:kW3ContactId];
	if (cId && ![cId isKindOfClass:[NSNull class]] && [cId intValue] != kABRecordInvalidID){
		rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
		if (rec){
			bSuccess = ABAddressBookRemoveRecord(addrBook, rec, &error);
			if (!bSuccess){
				bIsError = TRUE;
				errCode = IO_ERROR; 
			} else {
				bSuccess = ABAddressBookSave(addrBook, &error);
				if(!bSuccess){
					bIsError = TRUE;
					errCode = IO_ERROR;
				}else {
					// set id to null
					[contactDict setObject:[NSNull null] forKey:kW3ContactId];
					result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_OK messageAsDictionary: contactDict cast: @"justepApp.contacts._contactCallback"];
					jsString = [result onSuccessString:callbackId];
					//NSString* contactStr = [contactDict JSONRepresentation];
				}
			}						
		} else {
			// no record found return error
			bIsError = TRUE;
			errCode = UNKNOWN_ERROR;
		}
		
	} else {
		// invalid contact id provided
		bIsError = TRUE;
		errCode = INVALID_ARGUMENT_ERROR;
	}
	

	if (addrBook){
		CFRelease(addrBook);
	}
	if (bIsError){
		result = [JustepAppCommandCallback resultWithStatus:JustepAppCommandStatus_ERROR messageAsInt: errCode cast: @"justepApp.contacts._errCallback"];
		 jsString = [result onErrorString:callbackId];
	}
	if (jsString){
		[self execJS:jsString];
	}	
		
	return;
		
}

- (void)dealloc
{
	/*ABAddressBookUnregisterExternalChangeCallback(addressBook, addressBookChanged, self);

	if (addressBook) {
		CFRelease(addressBook);
	}
	*/
	
    [super dealloc];
}

@end

/* ABPersonViewController does not have any UI to dismiss.  Adding navigationItems to it does not work properly
 * The navigationItems are lost when the app goes into the background.  The solution was to create an empty
 * NavController in front of the ABPersonViewController. This will cause the ABPersonViewController to have a back button. By subclassing the ABPersonViewController, we can override viewDidDisappear and take down the entire NavigationController.
 */ 
@implementation DisplayContactViewController
@synthesize contactsPlugin;


- (void)viewWillDisappear: (BOOL)animated
{
    [super viewWillDisappear: animated];
    
    if ([self respondsToSelector:@selector(presentingViewController)]) { 
        [[self presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[self parentViewController] dismissModalViewControllerAnimated:YES];
    }        
    
}
-(void) dealloc
{
    self.contactsPlugin=nil;
    [super dealloc];
}

@end

