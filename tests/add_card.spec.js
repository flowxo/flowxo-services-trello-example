'use strict';

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
          expect(card).to.deep.equal({ name: 'Card 1' });
          done(null, { id: '1' });
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
        expect(output).to.deep.equal({ id: '1' });
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
          expect(card).to.deep.equal({ due: nowStr });
          done(null, { id: '1' });
        }
      });

      var options = {
        credentials: {},
        input: {
          due: {
            parsed: now
          }
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;
        expect(clientStub).to.have.been.calledWith(options.credentials);
        expect(output).to.deep.equal({ id: '1' });
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
            labels: 'red,yellow,green'
          });
          done(null, { id: '1' });
        }
      });

      var options = {
        credentials: {},
        input: {
          labels: 'red, yellow ,  green'
        }
      };

      this.runner.run('add_a_card', 'run', options, function(err, output) {
        expect(err).not.to.exist;
        expect(clientStub).to.have.been.calledWith(options.credentials);
        expect(output).to.deep.equal({ id: '1' });
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

      var options = {};

      this.runner.run('add_a_card', 'run', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });
  });

  describe('Custom Input Script', function() {
    it('should present members and lists as select options', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done(null, []);
        },
        getMembersForBoards: function(boards, done) {
          done(null, [{
            id: 'member-1',
            fullName: 'Bob Holness'
          }]);
        },
        getListsForBoards: function(boards, done) {
          done(null, [{
            id: 'list-1',
            name: 'Doing',
            board: 'Holiday'
          }]);
        }
      });

      var options = { credentials: {} };

      // Run the script with the runner,
      // available at `this.runner`.
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
            label: 'Holiday - Doing'
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
      this.runner.run('add_a_card', 'input', options, function(err) {
        expect(err).to.equal('Error');
        done();
      });
    });

    it('should handle an error from the call to getMembersForBoards', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done(null, []);
        },
        getMembersForBoards: function(boards, done) {
          done('Error');
        },
        getListsForBoards: function(boards, done) {
          done(null, []);
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

    it('should handle an error from the call to getListsForBoards', function(done) {
      // The Client is stubbed so we can test
      // the run script in isolation.
      clientStub.returns({
        getBoards: function(done) {
          done(null, []);
        },
        getMembersForBoards: function(boards, done) {
          done(null, []);
        },
        getListsForBoards: function(boards, done) {
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
  });
});
