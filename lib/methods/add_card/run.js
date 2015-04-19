'use strict';

var sdk = require('flowxo-sdk'),
    ServiceError = sdk.Error.ServiceError;

module.exports = function(options, done) {
  // Try and format the input data
  var inputData = options.input;

  var due = inputData.due;
  if(due) {
    if(!due.valid) {
      return done(new ServiceError('Input due date was invalid: ' + due.input));
    }
    inputData.due = due.parsed.toISOString();
  }

  if(inputData.labels) {
    // Trim any whitespace between the commas.
    inputData.labels = inputData.labels.replace(/\s+/g, '');
  }

  // Make the API call
  var client = new this.Client(options.credentials);
  client.newCard(inputData, done);
};
