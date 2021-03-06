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
#import <AddressBook/ABAddressBook.h>
#import <AddressBookUI/AddressBookUI.h>
#import "JustepAppPlugin.h"
#import "JustepAppContact.h"

@interface JustepAppContacts : JustepAppPlugin <ABNewPersonViewControllerDelegate, 
									   ABPersonViewControllerDelegate,
									   ABPeoplePickerNavigationControllerDelegate
									  > 
{
	ABAddressBookRef addressBook;
}



/*
 * newContact - create a new contact via the GUI
 *
 * arguments:
 *	1: successCallback: this is the javascript function that will be called with the newly created contactId 
 */
- (void) newContact:(NSString *)callbackId withDict:(NSMutableDictionary*)options;

/*
 * displayContact  - IN PROGRESS
 *
 * arguments:
 *	1: recordID of the contact to display in the iPhone contact display
 *	2: successCallback - currently not used
 *  3: error callback
 * options:
 *	allowsEditing: set to true to allow the user to edit the contact - currently not supported
 */
- (void) displayContact:(NSString *)callbackId withId:(NSString *)contatctId withDict:(NSMutableDictionary*)options;

/*
 * chooseContact
 *	
 * arguments:
 *	1: this is the javascript function that will be called with the contact data as a JSON object (as the first param)
 * options:
 *	allowsEditing: set to true to not choose the contact, but to edit it in the iPhone contact editor
 */
- (void) chooseContact:(NSString *)callbackId withDict:(NSMutableDictionary*)options;

- (void) newPersonViewController:(ABNewPersonViewController *)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person;
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue;

/*
 * search - searchs for contacts.  Only person records are currently supported.
 *
 * arguments:
 *  1: successcallback - this is the javascript function that will be called with the array of found contacts
 *  2:  errorCallback - optional javascript functiont to be called in the event of an error with an error code.
 * options:  dictionary containing ContactFields and ContactFindOptions 
 *	fields - ContactFields array
 *  findOptions - ContactFindOptions object as dictionary
 *
 */
- (void) search:(NSString *)callbackId withDict:(NSMutableDictionary*)options;
/* 
 * save - saves a new contact or updates and existing contact
 *
 * arguments:
 *  1: success callback - this is the javascript function that will be called with the JSON representation of the saved contact
 *		search calls a fixed justepApp.service.contacts._findCallback which then calls the succes callback stored before making the call into obj. c
 *  
 */
- (void) save:(NSString *)callbackId withDict:(NSMutableDictionary*)options;
/*
 * remove - removes a contact from the address book
 * 
 * arguments:
 *  1:  1: successcallback - this is the javascript function that will be called with a (now) empty contact object
 *  
 * options:  dictionary containing Contact object to remove
 *	contact - Contact object as dictionary
 */
- (void) remove: (NSString *)callbackId withDict:(NSMutableDictionary*)options;

- (void) dealloc;

@end

@interface ContactsPicker : ABPeoplePickerNavigationController
{
	BOOL allowsEditing;
	NSString* callbackId;
	ABRecordID selectedId;
}

@property BOOL allowsEditing;
@property (copy) NSString* callbackId;
@property ABRecordID selectedId;

@end

@interface NewContactsController : ABNewPersonViewController
{
	NSString* callbackId;
}
@property (copy) NSString* callbackId;
@end

/* ABPersonViewController does not have any UI to dismiss.  Adding navigationItems to it does not work properly,  thenavigationItems are lost when the app goes into the background.  
    The solution was to create an empty NavController in front of the ABPersonViewController. This
    causes the ABPersonViewController to have a back button. By subclassing the ABPersonViewController,
    we can override viewWillDisappear and take down the entire NavigationController at that time.
 */ 
@interface DisplayContactViewController : ABPersonViewController
{
    
}
@property (nonatomic,retain) JustepAppPlugin* contactsPlugin;




@end
