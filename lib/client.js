'use strict';

var async = require('async'),
    request = require('request'),
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
    oauth: this.credentials,
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

TrelloClient.prototype.getLatestCardIdsForBoard = function(boardId, done) {
  this._request({
    path: 'boards/' + boardId + '/actions',
    query: {
      filter: 'createCard'
    }
  }, function(err, data) {
    if(err) { return done(err); }

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

TrelloClient.prototype.getMembersForBoards = function(boards, done) {
  if(!boards || !boards.length) {
    return done(null, []);
  }

  var self = this;
  var alreadySeen = {},
      dedupedMembers = [],
      requestErr = null;

  boards.forEach(function(board) {
    self._request({
      path: 'boards/' + board.id + '/members',
      query: {
        fields: 'fullName'
      }
    }, function(err, members) {
      if(err) {
        requestErr = err;
        return false; // Break out of loop
      }

      // Loop through the members, checking which
      // are new, and add them.
      members.forEach(function(member) {
        if(!alreadySeen[member.id]) {
          dedupedMembers.push(member);
          alreadySeen[member.id] = true;
        }
      });
    });
  });

  done(requestErr, dedupedMembers);
};

TrelloClient.prototype.getListsForBoards = function(boards, done) {
  var self = this;

  // For each board, get all lists, and add to the overall
  // lists array.
  //
  var allLists = [];

  async.each(boards, function(board, cb) {
    // For each board, get the lists, and output
    // the lists in the correct format.
    self._request({
      path: 'boards/' + board.id + '/lists',
      query: {
        fields: 'name'
      }
    }, function(err, lists) {
      if(err) { return cb(err); }
      lists.forEach(function(list) {
        list.board = board.name;
        allLists.push(list);
      });

      cb();
    });
  }, function(err) {
    if(err) { return done(err); }
    done(null, allLists);
  });
};

TrelloClient.prototype.newCard = function(card, done) {
  this._request({
    path: 'cards',
    method: 'POST',
    json: card
  }, function(err, response) {
    if(err) { return done(err); }
    done(null, { id: response.id });
  });
};

module.exports = TrelloClient;
