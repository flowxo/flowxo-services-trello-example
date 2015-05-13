'use strict';

var sdk = require('flowxo-sdk'),
  ServiceError = sdk.Error.ServiceError;

describe('New Card', function() {
  var sandbox, clientStub;

  beforeEach(function() {
    // Use a sandbox for our stubs, so they can be
    // automatically removed after each spec
    sandbox = sinon.sandbox.create();
    clientStub = sandbox.stub(this.service, 'Client');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Run Script', function() {
    it('should return new card IDs', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        getBoardLatestCardIds: function(boardId, done) {
          // Should have removed non-word chars
          expect(boardId).to.equal('boardId');
          done(null, ['1', '2', '3']);
        },
        getCard: function(cardId, done) {
          done(null, {
            id: cardId,
            name: 'card-' + cardId
          });
        }
      });

      var options = {
        credentials: {},
        input: {
          idBoard: 'boardId%()'
        }
      };

      // Initialise the poll cache with empty data.
      this.runner.setPollerCache('new_card', []);

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;

        expect(clientStub).to.have.been.calledWith(options.credentials);

        expect(output).to.be.an('array');
        expect(output).to.have.length(3);
        expect(output).to.deep.equal([{
          id: '1',
          name: 'card-1'
        }, {
          id: '2',
          name: 'card-2'
        }, {
          id: '3',
          name: 'card-3'
        }]);
        done();
      });
    });

    it('should return an error if the boardId is not defined', function(done) {
      var options = {
        input: {}
      };

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'run', options, function(err) {
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('Cannot run: no boardId specified. Are you sure you selected a valid board from the dropdown menu?');
        done();
      });
    });

    it('should return an error when retrieving latest card IDs', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        getBoardLatestCardIds: function(boardId, done) {
          done('Error');
        }
      });

      var options = {
        credentials: {},
        input: {
          idBoard: 'boardId'
        }
      };

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'run', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });

    it('should return an error when retriving card details', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        getBoardLatestCardIds: function(boardId, done) {
          done(null, ['1', '2', '3']);
        },
        getCard: function(cardId, done) {
          done('Error');
        }
      });

      var options = {
        credentials: {},
        input: {
          idBoard: 'boardId'
        }
      };

      // Initialise the poll cache with empty data.
      this.runner.setPollerCache('new_card', []);

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'run', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });
  });

  describe('Custom Input Script', function() {
    it('should present boards as a select option', function(done) {
      var boards = [{
        id: '1',
        name: 'Board'
      }];

      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done(null, boards);
        }
      });

      var options = {
        credentials: {}
      };

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'input', options, function(err, output) {
        expect(err).to.be.null;

        expect(clientStub).to.have.been.calledWith(options.credentials);

        expect(output).to.deep.equal([{
          key: 'idBoard',
          label: 'Board',
          required: true,
          type: 'select',
          input_options: [{
            label: 'Board',
            value: '1'
          }]
        }]);
        done();
      });
    });

    it('should handle an error from the call to getBoards', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done('Error');
        }
      });

      var options = {};

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('new_card', 'input', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });
  });
});
