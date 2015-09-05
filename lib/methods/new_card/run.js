'use strict';

var async = require('async');

module.exports = function(options, done) {
  var self = this;

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
    }
  });

  if(inputErr) {
    return done(inputErr);
  }

  // We now need to fetch the most recent Trello cards to
  // see if we have any new ones.
  // Usually, we'd call the cards API and get a reverse time
  // ordered list of cards (newest first).
  // Trello is a little different, we first have to use the
  // actions API to get a reverse time ordered list of actions
  // of type 'createCard'.

  // Prepare the request
  var opt = {
    path: 'boards/' + options.input.idBoard + '/actions',
    query: {
      filter: 'createCard'
    },
    credentials: options.credentials
  };

  // Now we make the request
  this.request(opt, function(err, data) {
    if(err) {
      done(err);
    } else {

      // Next, do a little housekeeping to turn the array
      // into a simple list of [{ id: .. }, { id: .. }], ..

      var cardIds = data.reduce(function(results, item) {
        if(item && item.data && item.data.card && item.data.card.id) {
          results.push({
            id: item.data.card.id
          });
        }
        return results;
      }, []);

      // Now, we use the options.poller helper function to
      // filter out any ID's that we've processed before, we
      // simply pass in the array and tell options.poller
      // what property holds the 'id'.

      options.poller(cardIds, 'id', function(err, newCardIds) {
        if(err) {
          done(err);
        } else {

          // So we now have a list of [{ id: .. }, { id: .. }], ..
          // in newCardIds that ONLY contains new ID's.
          // Loop through, getting the card from the API,
          // and returning the results.
          // The order of the returned cards doesn't matter,
          // but we should limit the number of concurrent API
          // connections with `mapLimit`.

          // Using async here to help us manage this
          async.mapLimit(newCardIds, 5, function(card, cb) {
            // Prepare the request to fetch a single card
            var opt = {
              path: 'cards/' + card.id,
              query: {
                members: true,
                fields: 'badges,closed,dateLastActivity,desc,due,email,idBoard,idChecklists,idList,idShort,idAttachmentCover,manualCoverAttachment,labels,name,pos,shortLink,shortUrl,url'
              },
              credentials: options.credentials
            };

            // Now we make the request and return it to the async callback (cb)
            self.request(opt, cb);
            // Async then hands off the list of cards to the method's callback (done)
          }, done);
        }
      });
    }
  });
};
