'use strict';

var config = {
  name: 'Add a Card',
  slug: 'add_a_card',
  type: 'action',
  kind: 'task',
  scripts: {
    input: require('./input'),
    run: require('./run')
  },
  fields: {
    input: [{
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true
    }, {
      key: 'desc',
      label: 'Description',
      type: 'textarea'
    }, {
      key: 'pos',
      label: 'Position',
      type: 'select',
      input_options: [{
        value: 'top',
        label: 'Top'
      }, {
        value: 'bottom',
        label: 'Bottom'
      }]
    }, {
      key: 'due',
      label: 'Due',
      type: 'datetime'
    }, {
      key: 'labels',
      label: 'Labels',
      type: 'text',
      description: 'A comma-separated list of blue, green, orange, purple, red, yellow or all.'
    }, {
      key: 'urlSource',
      label: 'Copy Card URL',
      type: 'text',
      description: 'The URL of a card that you want to copy (you must have access to it).'
    }, {
      key: 'idCardSource',
      label: 'Copy Card ID',
      type: 'text',
      description: 'The ID of a card that you want to copy (you must have access to it).'
    }],
    output: [{
      key: 'id',
      label: 'Card ID'
    }]
  }
};

module.exports = function(service) {
  service.registerMethod(config);
};
