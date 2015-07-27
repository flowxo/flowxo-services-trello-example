'use strict';

var request = require('request'),
  _ = require('lodash'),
  url = require('url'),
  sdk = require('flowxo-sdk'),
  AuthError = sdk.Error.AuthError,
  ServiceError = sdk.Error.ServiceError;

function TrelloClient(credentials) {
  this.credentials = credentials;
}

var genErrorMessage = function(body, fallback) {
  // Build the error message.
  var errorMessage;

  var trimmed = _.isString(body) && body.trim();
  if(trimmed === 'invalid objectId' || trimmed === 'invalid id') {
    errorMessage = 'You used a record ID that doesn\'t exist.';

  } else if(trimmed) {
    // Uppercase the message
    errorMessage =
      trimmed.charAt(0).toUpperCase() +
      trimmed.slice(1);

  } else {
    errorMessage = fallback;
  }

  return errorMessage;
};

TrelloClient.prototype._request = function(options, done) {
  var opt = {
    url: url.format({
      protocol: 'https',
      host: 'api.trello.com',
      pathname: '/1/' + (options.path || ''),
      query: options.query || {}
    }),
    oauth: _.pick(this.credentials, ['token', 'token_secret', 'consumer_key', 'consumer_secret']),
    headers: {
      Accept: 'application/json',
    },
    method: options.method || 'GET',
    json: options.json || true
  };

  // Make the request
  request(opt, function(err, res, body) {
    if(err) {
      // Retryable error - possibly network related.
      return done(err);
    }

    if(res.statusCode >= 200 && res.statusCode <= 299) {
      // 2xx means it was a success!
      return done(null, body);
    }

    if(res.statusCode === 401) {
      // 401 is an auth error.
      return done(new AuthError('Your service connection is not valid, please renew.'));
    }

    var errorMessage;

    if(res.statusCode >= 400 && res.statusCode <= 499) {
      // Any other 4xx is a client error.
      // Return a ServiceError - don't run again.
      errorMessage = genErrorMessage(body, 'Something unexpected happened and the request didn\'t succeed.');
      return done(new ServiceError(errorMessage));
    }

    // Some other, retryable error occurred.
    errorMessage = genErrorMessage(body, 'An unexpected error occurred.');
    return done(new Error('Error connecting to Trello: ' + errorMessage));
  });
};

TrelloClient.prototype.getBoards = function(done) {
  this._request({
    path: 'members/me/boards',
    query: {
      filter: 'open',
      fields: 'name'
    }
  }, done);
};

TrelloClient.prototype.getBoardMembers = function(boardId, done) {
  this._request({
    path: 'boards/' + boardId + '/members',
    query: {
      fields: 'fullName'
    }
  }, done);
};

TrelloClient.prototype.getBoardLists = function(boardId, done) {
  this._request({
    path: 'boards/' + boardId + '/lists',
    query: {
      fields: 'name'
    }
  }, done);
};

TrelloClient.prototype.getBoardLatestCardIds = function(boardId, done) {
  this._request({
    path: 'boards/' + boardId + '/actions',
    query: {
      filter: 'createCard'
    }
  }, function(err, data) {
    if(err) {
      return done(err);
    }

    var cardIds = data.reduce(function(results, item) {
      if(item && item.data && item.data.card && item.data.card.id) {
        results.push(item.data.card.id);
      }
      return results;
    }, []);
    done(null, cardIds);
  });
};

TrelloClient.prototype.getCard = function(cardId, done) {
  this._request({
    path: 'cards/' + cardId,
    query: {
      members: true,
      fields: 'badges,closed,dateLastActivity,desc,due,email,idBoard,idChecklists,idList,idShort,idAttachmentCover,manualCoverAttachment,labels,name,pos,shortLink,shortUrl,url'
    }
  }, done);
};

TrelloClient.prototype.newCard = function(card, done) {
  this._request({
    path: 'cards',
    method: 'POST',
    json: card
  }, function(err, response) {
    if(err) {
      return done(err);
    }
    done(null, {
      id: response.id
    });
  });
};

module.exports = TrelloClient;
