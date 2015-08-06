'use strict';

var async = require('async');

module.exports = function(options, done) {
  var self = this;

  var respondWithFields = function(fields) {
    done(null, fields || []);
  };

  var client = new self.Client(options.credentials);

  // If the script was run in response to a field
  // being selected, the `target` option will be set.
  var target = options.input && options.input.target;
  if(!target) {
    // No field selected - this is an initial load.
    // Get the list of boards, and return.
    client.getBoards(function(err, boards) {
      if(err) {
        return done(err);
      }

      // Create the boards field with the returned data
      var boardsField =
        self.getBoardsInputField(boards);

      // Set the boardsField as having dependants.
      // This will signal to the core that when a board
      // is selected, this `input.js` file will be called again
      // with the corresponding board value.
      boardsField.dependants = true;

      // Return the fields in the correct order.
      respondWithFields([
        boardsField
      ]);

    });

  } else {
    // A field was selected on the UI, and so we should
    // return a partial response, containing just the
    // fields we are interested in.
    // `target` contains the following properties:
    //  - `field` - the field which was changed,
    //              causing this request.
    //  - `value` - the new value which was selected.
    switch(target.field) {
      case 'idBoard':
        // The board was changed, get the new boardId.
        // Input validation
        var inputErr = self.validateScriptInput(target, {
          value: {
            presence: {
              message: '^Board ID can\'t be blank'
            }
          }
        });

        if(inputErr) {
          return done(inputErr);
        }

        // Use the passed boardId to get the members
        // and lists for this board.
        // Run these requests in parallel.
        var boardId = target.value;
        async.parallel({
          members: function(cb) {
            client.getBoardMembers(boardId, cb);
          },
          lists: function(cb) {
            client.getBoardLists(boardId, cb);
          }
        }, function(err, results) {
          // If there was any error, return this.
          if(err) {
            return done(err);
          }

          // Use the results to populate the members
          // and lists fields, and return just these fields.
          respondWithFields([
            self.getMembersInputField(results.members),
            self.getListsInputField(results.lists)
          ]);
        });

        break;

      default:
        // The target field does not correspond to
        // a valid field, return nothing.
        respondWithFields([]);
    }
  }
};
