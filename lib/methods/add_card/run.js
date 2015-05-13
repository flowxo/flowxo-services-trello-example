'use strict';

module.exports = function(options, done) {
  // Try and format the input data
  var inputData = options.input;

  // Input validation
  var inputErr = this.validateScriptInput(inputData, {
    name: {
      presence: true
    },
    due: {
      fxoDatetime: {
        required: true
      }
    }
  });
  if(inputErr) {
    return done(inputErr);
  }

  if(inputData.due) {
    inputData.due = inputData.due.parsed.toISOString();
  }

  if(inputData.labels) {
    // Trim any whitespace between the commas.
    inputData.labels = inputData.labels.replace(/\s+/g, '');
  }

  // Make the API call
  var client = new this.Client(options.credentials);
  client.newCard(inputData, done);
};
