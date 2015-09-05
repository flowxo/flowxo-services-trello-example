'use strict';

var sdk = require('flowxo-sdk'),
  _ = require('lodash'),
  url = require('url'),
  request = require('request');

var service = new sdk.Service({
  serviceRoot: __dirname,
  name: 'Trello',
  slug: 'trello',
  auth: {
    type: 'oauth1',

    // The strategy key should return the Passport Strategy for your service.
    // Passport has numerous available strategies for popular services, normally named
    // e.g. passport-facebook, passport-twitter etc
    // Example:
    // strategy: require('passport-facebook').Strategy

    strategy: require('passport-trello').Strategy,

    // These options will be passed to the strategy when registering.
    // An OAuth 1.0 or 1.0a strategy requires `consumerKey` and `consumerSecret`
    // to be passed. Fill in your key and secret for this service in the
    // .env file and they will be populated at runtime below.
    // If your strategy requires any other options to be passed when registering,
    // add them below.

    options: {
      consumerKey: process.env.TRELLO_KEY,
      consumerSecret: process.env.TRELLO_SECRET,
      trelloParams: {
        scope: 'read,write',
        name: 'Flow XO',
        expiration: 'never'
      }
    },

    // Authentication parameters to be used.
    // These are sent when making an OAuth request.
    // For example, where an OAuth 2.0 API defines access scopes,
    // you may send
    // params:{
    //   scope: ['allow_email']
    // }

    params: {

    }
  }
});

// Attach any service level methods to your service here, then in your methods
// you'll be able to do this.request(..).

// Here, we create a wrapper for the https://github.com/request/request module.
// Because of course most API calls to the same service follow a similar pattern.
// We also want to centralise error handling.
service.request = function(options, done) {
  var opt = {
    url: url.format({
      protocol: 'https',
      host: 'api.trello.com',
      pathname: '/1/' + (options.path || ''),
      query: options.query || {}
    }),
    oauth: _.pick(options.credentials, ['token', 'token_secret', 'consumer_key', 'consumer_secret']),
    headers: {
      Accept: 'application/json',
    },
    method: options.method || 'GET',
    json: options.json || true
  };

  // Make the request
  request(opt, function(err, res, body) {
    if(err) {
      // Retryable error - possibly network related.  Flow XO will retry the
      // request when it sees standard JS error objects.
      // For retryable errors, the message is never exposed to the user.
      return done(err);
    }

    if(res.statusCode >= 200 && res.statusCode <= 299) {
      // 2xx means it was a success!
      return done(null, body);
    }

    if(res.statusCode === 401) {
      // 401 is an auth error.  Use an AuthError so that Flow XO can attempt
      // to refresh the OAuth token and retry (if the service allows).
      // With this type of error, the message *may* be shown to the user.
      return done(new sdk.Error.AuthError('Your service connection is not valid, please renew.'));
    }

    if(res.statusCode >= 400 && res.statusCode <= 499) {
      // Any other 4xx is a client error.
      // Return a ServiceError - don't run again.
      // The error message *will* be shown to the user.
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
        errorMessage = 'Something unexpected happened and the request didn\'t succeed.';
      }

      return done(new sdk.Error.ServiceError(errorMessage));
    }

    // Some other, retryable error occurred.
    // For retryable errors, the message is never exposed to the user,
    // so best to just return the HTTP status code and body to help with
    // debugging if necessary.
    return done(new Error(res.statusCode + ' ' + body));
  });
};

// Used by input.js scripts to build custom/dependant fields
service.getBoards = function(credentials, done) {
  this.request({
    path: 'members/me/boards',
    query: {
      filter: 'open',
      fields: 'name'
    },
    credentials: credentials
  }, done);
};

// Used by input.js scripts to build custom/dependant fields
service.getBoardMembers = function(credentials, boardId, done) {
  this.request({
    path: 'boards/' + boardId + '/members',
    query: {
      fields: 'fullName'
    },
    credentials: credentials
  }, done);
};

// Used by input.js scripts to build custom/dependant fields
service.getBoardLists = function(credentials, boardId, done) {
  this.request({
    path: 'boards/' + boardId + '/lists',
    query: {
      fields: 'name'
    },
    credentials: credentials
  }, done);
};

module.exports = service;
