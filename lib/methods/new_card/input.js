'use strict';

module.exports = function(options, done) {

  // This method expects the user to select the board that they
  // want to look for new cards in.  Of course, each account has
  // their own list of boards, so we need to generate this field
  // dynamically (we call these 'custom fields').

  // We created a method (in index.js) that fetches boards
  this.getBoards(options.credentials, function(err, boards) {
    if(err) {
      return done(err);
    } else {

      // Now we simply need to turn the array of boards into
      // an inputs array containing a single Flow XO 'select'
      // type field.

      var inputs = [{
        key: 'idBoard',
        label: 'Board',
        required: true,
        type: 'select',
        input_options: boards.map(function(board) {
          return {
            label: board.name,
            value: board.id
          };
        })
      }];

      // And lastly, pass this through to our callback
      done(null, inputs);
    }
  });
};
