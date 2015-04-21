'use strict';

var async = require('async');

module.exports = function(options, done) {
  var client = new this.Client(options.credentials);

  async.waterfall([
    function(cb) {
      client.getBoards(cb);
    },

    function(boards, cb) {
      async.parallel({
        members: function(cb) {
          client.getMembersForBoards(boards, cb);
        },
        lists: function(cb) {
          client.getListsForBoards(boards, cb);
        }
      }, cb);
    }

  ], function(err, results) {
    if(err) {
      return done(err);
    }

    done(null, [{
      key: 'idMembers',
      label: 'Member',
      type: 'select',
      description: 'Choosing a member here will add them to the card.',
      input_options: results.members.map(function(member) {
        return {
          value: member.id,
          label: member.fullName
        };
      })
    }, {
      key: 'idList',
      label: 'List',
      required: true,
      type: 'select',
      input_options: results.lists.map(function(list) {
        return {
          value: list.id,
          label: list.board + ' - ' + list.name
        };
      })
    }]);
  });
};
