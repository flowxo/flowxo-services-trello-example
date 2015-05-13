'use strict';

var async = require('async');

module.exports = function(options, done) {
  // Input validation
  var inputErr = this.validateScriptInput(options.input, {
    idBoard: {
      presence: {
        message: '^Board ID can\'t be blank'
      }
    }
  });

  if(inputErr) {
    return done(inputErr);
  }

  var boardId = options.input.idBoard;
  boardId = boardId.replace(/\W+/g, '');

  var client = new this.Client(options.credentials);

  async.waterfall([
    function(cb) {
      // Grab all the latest card IDs.
      client.getBoardLatestCardIds(boardId, cb);
    },

    function(cardIds, cb) {
      // Check if any of these ids have not been seen before
      // by the poller.
      // Each item of the cardIds array is the ID string,
      // but the poller expects them in the format
      // `{ id: 'id' }`, so we should map the array.
      var pollerData = cardIds.map(function(id) {
        return {
          id: id
        };
      });

      options.poller(pollerData, cb);
    },

    function(newCards, cb) {
      // The poller has returned each new card.
      // Loop through, getting the card from the API,
      // and returning the results.
      // The order of the returned cards doesn't matter,
      // but we should limit the number of concurrent API
      // connections with `mapLimit`.
      async.mapLimit(newCards, 5, function(card, cb) {
        client.getCard(card.id, cb);
      }, cb);
    }

    // The results will be passed to the `done` callback.
  ], done);
};
