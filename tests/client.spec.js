'use strict';

var nock = require('nock'),
    sdk = require('flowxo-sdk'),
    AuthError = sdk.Error.AuthError,
    ServiceError = sdk.Error.ServiceError,
    Client = require('../lib/client.js');

// Test specs should not test against the live API.
// The API should be mocked, and the specs should
// validate that our logic handles these responses
// in the correct way.

// Before each test, reset nock
beforeEach(nock.cleanAll);

describe('Client', function() {
  var client, sandbox;

  beforeEach(function() {
    client = new Client(this.credentials);

    // Use a sandbox for our stubs, so they can be
    // automatically removed after each spec
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Base Request', function() {
    // Every Trello API call is proxied through the
    // `_request` method on the client.
    // This makes every other method easy to test,
    // as the `_request` method can be easily mocked.
    //
    // The `_request` method itself is tested against a
    // mock version of the API by using `nock`.

    it('should return json data', function(done) {
      // Setup our mocked 200 response
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(200, { hello: 'world' });

      var options = {};

      // Make the request - will hit the mocked API
      // and return the data as programmed above
      client._request(options, function(err, data) {
        expect(err).to.be.null;
        expect(data).to.deep.equal({
          hello: 'world'
        });
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should parse a string of json data', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(200, '{ "hello": "world" }');

      var options = {};

      // Make the request - will hit the mocked API
      // and return the data as programmed above
      client._request(options, function(err, data) {
        expect(err).to.be.null;
        expect(data).to.deep.equal({
          hello: 'world'
        });
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle a JSON parse error', function(done) {
      // Setup our mocked 200 response
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(200, 'this is some odd JSON data');

      var options = {};

      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(Error);
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle authentication error', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(401);

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(AuthError);
        expect(err.message).to.equal('Your service connection is not valid, please renew.');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle an invalid ObjectID error', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(400, 'invalid objectId');

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('You used a record ID that doesn\'t exist.');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle an invalid ID error', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(400, 'invalid id');

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('You used a record ID that doesn\'t exist.');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle a generic 4xx error with an error message', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(404, 'something went wrong');

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('Something went wrong');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle a generic 4xx error without an error message', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(404);

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(ServiceError);
        expect(err.message).to.equal('Something unexpected happened and the request didn\'t succeed.');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle a generic 5xx error with an error message', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(500, 'something went wrong');

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Error connecting to Trello: Something went wrong');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should handle a generic 5xx error without an error message', function(done) {
      var scope =
        nock('https://api.trello.com/1')
          .get('/')
          .reply(504);

      var options = {};
      client._request(options, function(err, data) {
        expect(err).to.be.defined;
        expect(data).to.be.undefined;
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Error connecting to Trello: An unexpected error occurred.');
        expect(scope.isDone()).to.be.true;
        done();
      });
    });
  });

  describe('Get Boards', function() {
    it('should retrieve boards for the logged-in user', function() {
      // Our boards as returned from the API.
      var boardsFromAPI = [{
        id: '1',
        name: 'board-1'
      }];

      // Mock the `client._request` object.
      var clientMock = sandbox.mock(client);

      // Add an expectation on the mocked request.
      var requestExpect = clientMock.expects('_request');

      // Expect that the mock is called with certain arguments.
      // This is testing that the `getBoards` method is calling
      // the `request` method with the correct arguments.
      requestExpect.withArgs({
          path: 'members/me/boards',
          query: {
            filter: 'open',
            fields: 'name'
          }
        }, sinon.match.func);

      // Program the mock to respond successfully, with the
      // raw boards array
      requestExpect.yields(null, boardsFromAPI);

      // Create an expectation for the `getBoards` callback.
      var cbExpect = sinon.expectation.create();

      // Expect that the getBoards callback is called with
      // the boards re-mapped as shown.
      cbExpect.withArgs(null, [{
        id: '1',
        name: 'board-1'
      }]);

      // Call the method under test.
      client.getBoards(cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      clientMock.verify();
      cbExpect.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Stub out the `client._request` object.
      // We use a stub instead of a mock, since we
      // don't care what is passed to the request,
      // we just want to program its behaviour.
      var requestStub = sandbox.stub(client, '_request');

      // Program the stub to respond with an error.
      requestStub.yields(requestError);

      // Create an expectation for the `getBoards` callback.
      var cbExpect = sinon.expectation.create();

      // Expect that the getBoards callback is called with
      // the error.
      cbExpect.withArgs(requestError);

      // Call the method under test.
      client.getBoards(cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });

  describe('Get Latest Card IDs for Board', function() {
    it('should retrieve latest card IDs for a board for the logged-in user', function() {
      // Our cards as returned from the API.
      var dataFromAPI = [{
        data: {
          card: {
            id: 'card-1'
          }
        }
      }];

      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/board-1/actions',
            query: {
              filter: 'createCard'
            }
          }, sinon.match.func)
        .yields(null, dataFromAPI);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, ['card-1']);

      // Call the method under test with some dummy data.
      client.getLatestCardIdsForBoard('board-1', cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      clientMock.verify();
      cbExpect.verify();
    });

    it('should return an empty array if there are no cards', function() {
      // Our cards as returned from the API.
      var dataFromAPI = [{
        data: {}
      }];

      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/board-1/actions',
            query: {
              filter: 'createCard'
            }
          }, sinon.match.func)
        .yields(null, dataFromAPI);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, []);

      // Call the method under test with some dummy data.
      client.getLatestCardIdsForBoard('board-1', cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      clientMock.verify();
      cbExpect.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Create the stub and expectation
      sandbox
        .stub(client, '_request')
        .yields(requestError);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(requestError);

      // Call the method under test.
      client.getLatestCardIdsForBoard('board-1', cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });

  describe('Get Card', function() {
    it('should retrieve card by card ID', function() {
      // Our card as returned from the API.
      var dataFromAPI = {
        id: '1',
        name: 'Card 1'
      };

      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'cards/1',
            query: {
              members: true,
              fields: 'badges,closed,dateLastActivity,desc,due,email,idBoard,idChecklists,idList,idShort,idAttachmentCover,manualCoverAttachment,labels,name,pos,shortLink,shortUrl,url'
            }
          }, sinon.match.func)
        .yields(null, dataFromAPI);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, dataFromAPI);

      // Call the method under test with some dummy data.
      client.getCard('1', cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      clientMock.verify();
      cbExpect.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Create the stub and expectation
      sandbox
        .stub(client, '_request')
        .yields(requestError);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(requestError);

      // Call the method under test.
      client.getCard('1', cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });

  describe('Get Members for Boards', function() {
    it('should retrieve all members for the passed boards', function() {
      // Our board members as returned from the API.
      var board1Members = [
        { id: '1', fullName: 'Bob Holness' },
        { id: '2', fullName: 'Bruce Forsyth' }
      ];
      var board2Members = [
        { id: '1', fullName: 'Bob Holness' },
        { id: '3', fullName: 'Keith Chegwin' }
      ];

      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/1/members',
            query: {
              fields: 'fullName'
            }
          }, sinon.match.func)
        .yields(null, board1Members);

      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/2/members',
            query: {
              fields: 'fullName'
            }
          }, sinon.match.func)
        .yields(null, board2Members);

      // Bob Holness should be deduplicated
      var expectedMembersOutput = [
        { id: '1', fullName: 'Bob Holness' },
        { id: '2', fullName: 'Bruce Forsyth' },
        { id: '3', fullName: 'Keith Chegwin' }
      ];
      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, expectedMembersOutput);

      // Call the method under test with some dummy data.
      var boards = [{ id: '1' }, { id: '2' }];
      client.getMembersForBoards(boards, cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      cbExpect.verify();
      clientMock.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Create the stub and expectation
      sandbox
        .stub(client, '_request')
        .yields(requestError);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(requestError);

      // Call the method under test.
      client.getMembersForBoards([{ id: '1' }], cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });

  describe('Get Lists for Boards', function() {
    it('should retrieve all lists for the passed boards', function() {
      // Our board members as returned from the API.
      var board1Lists = [
        { id: '1', name: 'Doing' },
        { id: '2', name: 'Done' }
      ];
      var board2Lists = [
        { id: '3', name: 'Doing' },
        { id: '4', name: 'Done' }
      ];

      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/1/lists',
            query: {
              fields: 'name'
            }
          }, sinon.match.func)
        .yields(null, board1Lists);

      clientMock
        .expects('_request')
        .withArgs({
            path: 'boards/2/lists',
            query: {
              fields: 'name'
            }
          }, sinon.match.func)
        .yields(null, board2Lists);

      // Bob Holness should be deduplicated
      var expectedListsOutput = [
        { id: '1', board: 'Holidays', name: 'Doing' },
        { id: '2', board: 'Holidays', name: 'Done' },
        { id: '3', board: 'DIY', name: 'Doing' },
        { id: '4', board: 'DIY', name: 'Done' }
      ];
      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, expectedListsOutput);

      // Call the method under test with some dummy data.
      var boards = [{
        id: '1',
        name: 'Holidays'
      }, {
        id: '2',
        name: 'DIY'
      }];
      client.getListsForBoards(boards, cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      cbExpect.verify();
      clientMock.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Create the stub and expectation
      sandbox
        .stub(client, '_request')
        .yields(requestError);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(requestError);

      // Call the method under test.
      var boards = [{
        id: '1',
        name: 'Holidays'
      }, {
        id: '2',
        name: 'DIY'
      }];
      client.getListsForBoards(boards, cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });

  describe('New Card', function() {
    it('should create a new card', function() {
      // Setup the mocks and expectations
      var clientMock = sandbox.mock(client);
      clientMock
        .expects('_request')
        .withArgs({
            path: 'cards',
            method: 'POST',
            json: { name: 'New Card' }
          }, sinon.match.func)
        .yields(null, { id: '1' });

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(null, { id: '1' });

      // Call the method under test with some dummy data.
      client.newCard({ name: 'New Card' }, cbExpect);

      // Expect that the mock and the callback performed
      // as programmed above.
      cbExpect.verify();
      clientMock.verify();
    });

    it('should return the error from the request', function() {
      var requestError = new Error();

      // Create the stub and expectation
      sandbox
        .stub(client, '_request')
        .yields(requestError);

      var cbExpect =
        sinon
          .expectation
          .create()
          .withArgs(requestError);

      // Call the method under test.
      client.newCard({ name: 'New Card' }, cbExpect);

      // Expect that the callback performed
      // as programmed above.
      cbExpect.verify();
    });
  });
});
