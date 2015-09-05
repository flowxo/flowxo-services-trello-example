'use strict';

module.exports = function(options, done) {

  // We validate the input before continuing
  // Remember that even if a field is marked as required,
  // you can't guarantee that it isn't empty (as the user
  // might use a {{value}} from another task and that might
  // be empty).
  // Always validate as strongly as the API requires.
  // The SDK's validateScriptInput function makes it easy.

  var inputErr = this.validateScriptInput(options.input, {
    idBoard: {
      presence: {
        message: '^Board ID can\'t be blank'
      },
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: '^Board ID is not in the correct format (letters or numbers only)'
      }
    },
    idList: {
      presence: {
        message: '^List ID can\'t be blank'
      },
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: '^List ID is not in the correct format (letters or numbers only)'
      }
    },
    idMember: {
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: '^Member ID is not in the correct format (letters or numbers only)'
      }
    },
    name: {
      presence: true
    },
    due: {
      // fxoDateTime is a special validator that you can use
      // to make it easy to validate Flow XO 'datetime' type
      // fields.
      fxoDatetime: true
    }
  });

  if(inputErr) {
    return done(inputErr);
  }

  if(options.input.due) {
    // If we got here, 'options.input.due' contains a valid
    // Flow XO 'datetime' object, and options.input.due.parsed
    // contains a JS date object.  As our API expects an ISO 8601
    // date/time string, we convert it to a string.
    options.input.due = options.input.due.parsed.toISOString();
  }

  if(options.input.labels) {
    // Trim any whitespace between the commas.
    options.input.labels = options.input.labels.replace(/\s+/g, '');
  }

  // Prepare the API call to create the card
  var opt = {
    path: 'cards',
    method: 'POST',
    json: options.input,
    credentials: options.credentials
  };

  // Finally we make the request and create the card
  this.request(opt, function(err, body) {
    if(err) {
      done(err);
    } else {
      done(null, {
        id: body.id
      });
    }
  });
};
