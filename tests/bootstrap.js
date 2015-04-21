'use strict';

var sdk = require('flowxo-sdk'),
  service = require('../lib');

var credentials = {};
try {
  credentials = require('../credentials');
} catch(e) {}

beforeEach(function() {
  this.service = service;

  // Clone the credentials so they can't be globally
  // overwritten by a test spec
  this.credentials = JSON.parse(JSON.stringify(credentials));

  this.runner = new sdk.ScriptRunner(service, {
    credentials: this.credentials
  });
});
