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

service.getBoardsInputField = function(boards) {
  boards = boards || [];

  return {
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
  };
};

service.getMembersInputField = function(members) {
  members = members || [];

  return {
    key: 'idMembers',
    label: 'Member',
    type: 'select',
    description: 'Choosing a member here will add them to the card.',
    input_options: members.map(function(member) {
      return {
        value: member.id,
        label: member.fullName
      };
    })
  };
};

service.getListsInputField = function(lists) {
  lists = lists || [];

  return {
    key: 'idList',
    label: 'List',
    type: 'select',
    required: true,
    input_options: lists.map(function(list) {
      return {
        value: list.id,
        label: list.name
      };
    })
  };
};

module.exports = service;
