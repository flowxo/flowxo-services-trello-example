var chai = require('chai');
var sinonChai = require('sinon-chai');
var sdk = require('flowxo-sdk');

chai.use(sinonChai);
chai.use(sdk.Chai);

chai.should();

// Don't truncate assertion display:
// allows us to view the full error message
// when a spec fails
chai.config.truncateThreshold = 0;

// Show error stack on failed spec
chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.sinon = require('sinon');
