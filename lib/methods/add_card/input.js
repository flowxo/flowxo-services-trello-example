'use strict';

module.exports = function(options, done) {
  var self = this;
  options.input = options.input || {};

  // Before trying to understand this, take a look at the simpler
  // input.js script for the 'New Card' method.

  // This method expects the user to select the board that they
  // want to create a new card in, and *then* (dependant on which
  // board they select), optionally allow them to select a list
  // and/or a member on that board.
  // To do this, we use 'dependant fields'.

  // If the script was run in response to a field
  // being selected, the 'target' and 'fields' options
  // will be set.

  if(!options.input.target) {

    // No field selected - this is an initial load.
    // Get the list of boards, and return.

    // We created a method (in index.js) that fetches boards
    this.getBoards(options.credentials, function(err, boards) {
      if(err) {
        done(err);
      } else {

        // Now we simply need to turn the array of boards into
        // an inputs array containing a single Flow XO 'select'
        // type field.

        var fields = [{
          key: 'idBoard',
          label: 'Board',
          required: true,
          type: 'select',

          // Set the idBoard field as having dependants.
          // This signals that when a board is selected, this
          // input.js file will be called again with 'target'
          // and 'fields' options set.
          dependants: true,

          input_options: boards.map(function(board) {
            return {
              label: board.name,
              value: board.id
            };
          })
        }];

        // And lastly (for now), pass this through to our callback
        done(null, fields);
      }
    });

  } else {

    // This time, input.js is being run again to fetch dependant
    // field(s).  We should return a partial response, containing
    // just the dependant fields we now want to show.
    //  - 'target' is the key of the field that changed.
    //  - 'fields' is a hashmap of all input fields
    //    containing data collected so far.

    switch(options.input.target) {
      case 'idBoard':

        // The board was changed (in fact, for this method, the only
        // dependant field request we expect).

        // Check the input is valid
        var inputErr = this.validateScriptInput(options.input.fields, {
          idBoard: {
            presence: {
              message: '^Board ID can\'t be blank'
            },
            format: {
              pattern: '[a-z0-9]+',
              flags: 'i',
              message: '^Board ID is not in the correct format (letters or numbers only)'
            }
          }
        });

        if(inputErr) {
          return done(inputErr);
        }

        // We created a method (in index.js) that fetches the board's lists
        this.getBoardLists(options.credentials, options.input.fields.idBoard, function(err, lists) {
          if(err) {
            done(err);
          } else {
            // Same for board members, we have a method in index.js
            self.getBoardMembers(options.credentials, options.input.fields.idBoard, function(err, members) {
              if(err) {
                done(err);
              } else {

                // Now we simply need to turn the arrays of members and lists
                // into an inputs array containing a 2 Flow XO 'select'
                // type fields.
                var fields = [{
                  key: 'idList',
                  label: 'List',
                  type: 'select',
                  required: true,
                  input_options: lists.map(function(list) {
                    return {
                      value: list.id,
                      label: list.name
                    };
                  })
                }, {
                  key: 'idMembers',
                  label: 'Member',
                  type: 'select',
                  description: 'Choosing a member here will add them to the card.',
                  input_options: members.map(function(member) {
                    return {
                      value: member.id,
                      label: member.fullName
                    };
                  })
                }];

                // And lastly, pass this through to our callback
                done(null, fields);
              }
            });
          }
        });
        break;

        // Of course, you could switch on more target fields if you
        // needed to.  You can even 'chain' dependant fields so a
        // dependant field causes another dependant field to show
        // up.

      default:

        // The target field does not correspond to a valid field,
        // return nothing.  For convention only, this should never
        // get called.

        done(null, []);
    }
  }
};
