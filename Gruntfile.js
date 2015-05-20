// Generated on 2015-04-15 using generator-flowxo 1.0.0
'use strict';

module.exports = function(grunt) {

  // Fix grunt options
  // Can remove if using grunt 0.5
  // https://github.com/gruntjs/grunt/issues/908
  require('nopt-grunt-fix')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load the Flow XO tasks
  grunt.loadNpmTasks('flowxo-sdk');

  // Define the configuration for all the tasks
  grunt.initConfig({
    env: {
      src: '.env'
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false,
          require: './tests/helpers'
        },
        src: ['tests/bootstrap.js', 'tests/**/*.spec.js']
      }
    },
    watch: {
      js: {
        options: {
          spawn: true,
          interrupt: false,
          debounceDelay: 250
        },
        files: ['lib/**/*.js', 'tests/**/*.spec.js'],
        tasks: ['jshint', 'test']
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      },
      tests: {
        src: ['tests/**/*.js'],
      }
    },
    jsbeautifier: {
      options: {
        config: '.jsbeautifyrc'
      },
      source: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      },
      tests: {
        src: ['tests/**/*.js'],
      }
    },
    flowxo: {
      options: {
        credentialsFile: 'credentials.json',
        getService: function() {
          return require('./lib');
        },
      },
      init: {},
      auth: {},
      run: {
        options: {
          runsFolder: 'runs',
        }
      }
    }
  });

  // Initialise the SDK
  grunt.registerTask('init', ['flowxo:init']);

  // Authentication Tasks
  grunt.registerTask('auth', ['env', 'flowxo:auth']);

  // Run Tasks
  grunt.registerTask('run', ['env', 'flowxo:run']);

  // Test Tasks
  grunt.registerTask('test', ['env', 'mochaTest']);

  // Preflight Tasks
  grunt.registerTask('preflight', ['env', 'jsbeautifier', 'jshint', 'test']);

  // Default Task
  grunt.registerTask('default', ['preflight', 'watch']);
};
