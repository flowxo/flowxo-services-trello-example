'use strict';

describe('Trello Service', function() {
  describe('Configuration', function() {
    it('should be a service', function() {
      expect(this.service).to.be.a.flowxo.service;
    });

    it('should define a strategy', function() {
      expect(this.service.auth.strategy).to.exist;
    });

    it('should define strategy options', function() {
      expect(this.service.auth.options).to.have.all.keys('consumerKey', 'consumerSecret', 'trelloParams');
    });
  });

  it('should define a Client', function() {
    expect(this.service.Client).to.equal(require('../lib/client.js'));
  });

  describe('Get Boards Input Field', function() {
    it('should get boards input field with boards data', function() {
      var boards = [
        { id: '1', name: 'Board 1' },
        { id: '2', name: 'Board 2' }
      ];
      var field = this.service.getBoardsInputField(
        boards);

      expect(field).to.deep.equal({
        key: 'idBoard',
        label: 'Board',
        required: true,
        type: 'select',
        input_options: [
          { value: '1', label: 'Board 1' },
          { value: '2', label: 'Board 2' }
        ]
      });
    });

    it('should get boards input field without boards data', function() {
      var boards = [];
      var field = this.service.getBoardsInputField(
        boards);

      expect(field).to.deep.equal({
        key: 'idBoard',
        label: 'Board',
        required: true,
        type: 'select',
        input_options: []
      });
    });
  });

  describe('Get Members Input Field', function() {
    it('should get members input field with members data', function() {
      var members = [
        { id: '1', fullName: 'Member 1' },
        { id: '2', fullName: 'Member 2' }
      ];
      var field = this.service.getMembersInputField(
        members);

      expect(field).to.deep.equal({
        key: 'idMembers',
        label: 'Member',
        type: 'select',
        description: 'Choosing a member here will add them to the card.',
        input_options: [
          { value: '1', label: 'Member 1' },
          { value: '2', label: 'Member 2' }
        ]
      });
    });

    it('should get members input field without members data', function() {
      var members = [];
      var field = this.service.getMembersInputField(
        members);

      expect(field).to.deep.equal({
        key: 'idMembers',
        label: 'Member',
        type: 'select',
        description: 'Choosing a member here will add them to the card.',
        input_options: []
      });
    });
  });

  describe('Get Lists Input Field', function() {
    it('should get lists input field with lists data', function() {
      var lists = [
        { id: '1', name: 'List 1' },
        { id: '2', name: 'List 2' }
      ];
      var field = this.service.getListsInputField(
        lists);

      expect(field).to.deep.equal({
         key: 'idList',
        label: 'List',
        type: 'select',
        required: true,
        input_options: [
          { value: '1', label: 'List 1' },
          { value: '2', label: 'List 2' }
        ]
      });
    });

    it('should get lists input field without lists data', function() {
      var lists = [];
      var field = this.service.getListsInputField(
        lists);

      expect(field).to.deep.equal({
         key: 'idList',
        label: 'List',
        type: 'select',
        required: true,
        input_options: []
      });
    });
  });
});
