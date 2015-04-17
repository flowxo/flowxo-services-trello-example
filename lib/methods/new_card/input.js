'use strict';

module.exports = function(options, done) {
  var client = new this.Client(options.credentials);

  client.getBoards(function(err, boards) {
    if(err) { return done(err); }

    done(null, [{
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
    }]);
  });
};
