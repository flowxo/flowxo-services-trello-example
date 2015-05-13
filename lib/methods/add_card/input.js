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
    // Get the list of boards, and send all fields.
    client.getBoards(function(err, boards) {
      if(err) {
        return done(err);
      }

      // Create the boards field with the returned data
      var boardsField =
        self.getBoardsInputField(boards);

      // Create the other fields, but don't populate
      // them with options just yet. This will be
      // performed once the board has been selected.
      var membersField = self.getMembersInputField(),
          listsField = self.getListsInputField();

      // Set the members and lists fields as dependants
      // of the boards field. This will allow the core
      // to defer the display of the dependants until
      // the board has been selected.
      boardsField.dependants = [
        membersField.key,
        listsField.key
      ];

      // Return the fields in the correct order.
      respondWithFields([
        boardsField,
        membersField,
        listsField
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
        var boardId = target.value;

        // Use the passed boardId to get the members
        // and lists for this board.
        // Run these requests in parallel.
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
          // and lists fields, and return.
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
