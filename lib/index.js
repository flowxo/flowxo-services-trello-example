'use strict';

var sdk = require('flowxo-sdk');

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

/*
  Attach any service level methods to your service here, for example
    service.request = function(options){
      //...
    }

  then in your methods you'll be able to do
    this.request({id: 123});
*/

service.Client = require('./client');

module.exports = service;
