'use strict';

module.exports = function(options, done) {
  var self = this;

  // Fetch the list of boards, and return as a field.
  var client = new self.Client(options.credentials);
  client.getBoards(function(err, boards) {
    if(err) {
      return done(err);
    }

    done(null, [
      self.getBoardsInputField(boards)
    ]);
  });
};
