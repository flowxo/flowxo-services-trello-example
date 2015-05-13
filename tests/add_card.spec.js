'use strict';

var ServiceError = require('flowxo-sdk').Error.ServiceError;

describe('Add a Card', function() {
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
    it('should call the newCard client method', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        newCard: function(card, done) {
          // Should have removed non-word chars
          expect(card).to.deep.equal({
            name: 'Card 1'
          });
          done(null, {
            id: '1'
          });
        }
      });

      var options = {
        credentials: {},
        input: {
          name: 'Card 1'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;
        expect(clientStub).to.have.been.calledWith(options.credentials);
        expect(output).to.deep.equal({
          id: '1'
        });
        done();
      });
    });

    it('should ensure there is a name', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      var options = {
        credentials: {},
        input: {
          labels: 'red, yellow ,  green'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err) {
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('Name can\'t be blank');
        done();
      });
    });

    it('should ensure the due date is valid', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      var options = {
        credentials: {},
        input: {
          name: 'name',
          due: {
            valid: false
          },
          labels: 'red, yellow ,  green'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err) {
        expect(err).to.exist;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('Due is not a valid datetime input');
        done();
      });
    });

    it('should send a parsed due date', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      var now = new Date(),
        nowStr = now.toISOString();

      clientStub.returns({
        newCard: function(card, done) {
          // Should have removed non-word chars
          expect(card).to.deep.equal({
            name: 'name',
            due: nowStr
          });
          done(null, {
            id: '1'
          });
        }
      });

      var options = {
        credentials: {},
        input: {
          name: 'name',
          due: {
            valid: true,
            parsed: now
          }
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;
        expect(clientStub).to.have.been.calledWith(options.credentials);
        expect(output).to.deep.equal({
          id: '1'
        });
        done();
      });
    });

    it('should strip any whitespace in the labels', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        newCard: function(card, done) {
          // Should have removed non-word chars
          expect(card).to.deep.equal({
            name: 'name',
            labels: 'red,yellow,green'
          });
          done(null, {
            id: '1'
          });
        }
      });

      var options = {
        credentials: {},
        input: {
          name: 'name',
          labels: 'red, yellow ,  green'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;
        expect(clientStub).to.have.been.calledWith(options.credentials);
        expect(output).to.deep.equal({
          id: '1'
        });
        done();
      });
    });

    it('should return any error from the client API call', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation, without making any
      // actual API calls.
      clientStub.returns({
        newCard: function(card, done) {
          done('Error');
        }
      });

      var options = {
        input: {
          name: 'name'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });
  });

  describe('Custom Input Script', function() {
    it('should return the boards, lists and members fields, with the boards field populated, on first load', function(done) {
      // The Client is stubbed so we can test
      // the input script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done(null, [{ id: 'board-1', name: 'Board 1' }]);
        }
      });

      var options = { credentials: {} };

      // Run the script with the runner
      this.runner.run('add_a_card', 'input', options, function(err, output) {
        expect(err).to.be.null;

        expect(clientStub).to.have.been.calledWith(options.credentials);

        expect(output).to.deep.equal([{
          key: 'idBoard',
          label: 'Board',
          required: true,
          type: 'select',
          input_options: [{
            value: 'board-1',
            label: 'Board 1'
          }],
          dependants: [ 'idMembers', 'idList' ]
        }, {
          key: 'idMembers',
          label: 'Member',
          type: 'select',
          description: 'Choosing a member here will add them to the card.',
          input_options: []
        }, {
          key: 'idList',
          label: 'List',
          required: true,
          type: 'select',
          input_options: []
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
      this.runner.run('add_a_card', 'input', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });

    it('should return the populated lists and members fields when the script is run from a change in the board value', function(done) {
      // The Client is stubbed so we can test
      // the input script in isolation.
      clientStub.returns({
        getBoardMembers: function(boardId, done) {
          expect(boardId).to.equal('1');
          done(null, [{
            id: 'member-1',
            fullName: 'Bob Holness'
          }]);
        },
        getBoardLists: function(boardId, done) {
          expect(boardId).to.equal('1');
          done(null, [{
            id: 'list-1',
            name: 'Doing'
          }]);
        }
      });

      var options = {
        credentials: {},
        input: {
          target: {
            field: 'idBoard',
            value: '1'
          }
        }
      };

      // Run the script with the runner
      this.runner.run('add_a_card', 'input', options, function(err, output) {
        expect(err).to.be.null;

        expect(clientStub).to.have.been.calledWith(options.credentials);

        expect(output).to.deep.equal([{
          key: 'idMembers',
          label: 'Member',
          type: 'select',
          description: 'Choosing a member here will add them to the card.',
          input_options: [{
            value: 'member-1',
            label: 'Bob Holness'
          }]
        }, {
          key: 'idList',
          label: 'List',
          required: true,
          type: 'select',
          input_options: [{
            value: 'list-1',
            label: 'Doing'
          }]
        }]);

        done();
      });
    });

    it('should handle an error from the call to getBoardMembers', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoardMembers: function(boards, done) {
          done('Error');
        },
        getBoardLists: function(boards, done) {
          done(null, []);
        }
      });

      var options = {
        credentials: {},
        input: {
          target: {
            field: 'idBoard',
            value: '1'
          }
        }
      };

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('add_a_card', 'input', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });

    it('should handle an error from the call to getBoardLists', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoardMembers: function(boards, done) {
          done(null, []);
        },
        getBoardLists: function(boards, done) {
          done('Error');
        }
      });

      var options = {
        credentials: {},
        input: {
          target: {
            field: 'idBoard',
            value: '1'
          }
        }
      };

      // Run the script with the runner,
      // available at `this.runner`.
      this.runner.run('add_a_card', 'input', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });

    it('should return an empty array if the target field was not recognised', function(done) {
      var options = {
        input: {
          target: {
            field: 'unknown',
            value: '1'
          }
        }
      };

      // Run the script with the runner
      this.runner.run('add_a_card', 'input', options, function(err, output) {
        expect(err).to.be.null;
        expect(output).to.deep.equal([]);
        done();
      });
    });
  });
});
