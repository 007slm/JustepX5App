justepApp.addPlugin(function() {	/**
	 * This class provides access to the device SMS functionality.
	 * 
	 * @constructor
	 */
	var Sms = function() {

	}

	/**
	 * Sends an SMS message.
	 * 
	 * @param {Integer}
	 *            number The phone number to send the message to.
	 * @param {String}
	 *            message The contents of the SMS message to send.
	 * @param {Function}
	 *            successCallback The function to call when the SMS message is sent.
	 * @param {Function}
	 *            errorCallback The function to call when there is an error sending
	 *            the SMS message.
	 * @param {PositionOptions}
	 *            options The options for accessing the GPS location such as timeout
	 *            and accuracy.
	 */
	Sms.prototype.send = function(number, message, successCallback, errorCallback,
			options) {
		// not sure why this is here when it does nothing????
	};
	if (typeof justepApp.sms == "undefined")
		justepApp.sms = new Sms();
});