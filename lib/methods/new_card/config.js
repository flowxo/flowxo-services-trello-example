'use strict';

var config = {
  name: 'New Card',
  slug: 'new_card',
  type: 'poller',
  kind: 'trigger',
  scripts: {
    input: require('./input'),
    run: require('./run')
  },
  fields: {
    output: [{
      key: 'id',
      label: 'Card ID'
    }, {
      key: 'idShort',
      label: 'Card Short ID'
    }, {
      key: 'idBoard',
      label: 'Board ID'
    }, {
      key: 'idList',
      label: 'List ID'
    }, {
      key: 'idAttachmentCover',
      label: 'Attachment Cover ID'
    }, {
      key: 'manualCoverAttachment',
      label: 'Manual Cover Attachment'
    }, {
      key: 'name',
      label: 'Name'
    }, {
      key: 'desc',
      label: 'Description'
    }, {
      key: 'closed',
      label: 'Archived'
    }, {
      key: 'dateLastActivity',
      label: 'Last Activity Date'
    }, {
      key: 'pos',
      label: 'Position'
    }, {
      key: 'due',
      label: 'Due'
    }, {
      key: 'url',
      label: 'URL'
    }, {
      key: 'shortUrl',
      label: 'Short URL'
    }, {
      key: 'email',
      label: 'Email'
    }, {
      key: 'subscribed',
      label: 'Subscribed'
    }, {
      key: 'badges__votes',
      label: 'Badge Votes'
    }, {
      key: 'badges__viewingMemberVoted',
      label: 'Badge Viewing Member Voted'
    }, {
      key: 'badges__subscribed',
      label: 'Badge Subscribed'
    }, {
      key: 'badges__fogbugz',
      label: 'Badge Fogbugz'
    }, {
      key: 'badges__checkItems',
      label: 'Badge Checklist Items'
    }, {
      key: 'badges__checkItemsChecked',
      label: 'Badge Checklist Items Checked'
    }, {
      key: 'badges__comments',
      label: 'Badge Comments'
    }, {
      key: 'badges__attachments',
      label: 'Badge Attachments'
    }, {
      key: 'badges__description',
      label: 'Badge Description'
    }, {
      key: 'badges__due',
      label: 'Badge Due'
    }, {
      key: 'labels__0__id',
      label: 'Label 0 ID'
    }, {
      key: 'labels__0__name',
      label: 'Label 0 Name'
    }, {
      key: 'labels__0__color',
      label: 'Label 0 Color'
    }, {
      key: 'labels__0__uses',
      label: 'Label 0 Uses'
    }, {
      key: 'labels__1__id',
      label: 'Label 1 ID'
    }, {
      key: 'labels__1__name',
      label: 'Label 1 Name'
    }, {
      key: 'labels__1__color',
      label: 'Label 1 Color'
    }, {
      key: 'labels__1__uses',
      label: 'Label 1 Uses'
    }, {
      key: 'labels__2__id',
      label: 'Label 2 ID'
    }, {
      key: 'labels__2__name',
      label: 'Label 2 Name'
    }, {
      key: 'labels__2__color',
      label: 'Label 2 Color'
    }, {
      key: 'labels__2__uses',
      label: 'Label 2 Uses'
    }, {
      key: 'members__0__id',
      label: 'Member 0 ID'
    }, {
      key: 'members__0__username',
      label: 'Member 0 Username'
    }, {
      key: 'members__0__initials',
      label: 'Member 0 Initials'
    }, {
      key: 'members__0__fullName',
      label: 'Member 0 Full Name'
    }, {
      key: 'members__1__id',
      label: 'Member 1 ID'
    }, {
      key: 'members__1__username',
      label: 'Member 1 Username'
    }, {
      key: 'members__1__initials',
      label: 'Member 1 Initials'
    }, {
      key: 'members__1__fullName',
      label: 'Member 1 Full Name'
    }, {
      key: 'members__2__id',
      label: 'Member 2 ID'
    }, {
      key: 'members__2__username',
      label: 'Member 2 Username'
    }, {
      key: 'members__2__initials',
      label: 'Member 2 Initials'
    }, {
      key: 'members__2__fullName',
      label: 'Member 2 Full Name'
    }, {
      key: 'idChecklists__0',
      label: 'Checklist 0 ID'
    }, {
      key: 'idChecklists__1',
      label: 'Checklist 1 ID'
    }, {
      key: 'idChecklists__2',
      label: 'Checklist 2 ID'
    }]
  }
};

module.exports = function(service) {
  service.registerMethod(config);
};
