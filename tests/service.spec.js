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
});
