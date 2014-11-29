var nconf = require('nconf');
var fs = require('fs');

// Then load the specified configurations from designated files
var cfgPath = __dirname + '/../config/';
var envFile = 'undefined.json';
var defaultFile = '_default.json';

var self = {};

// the configuration singleton
var configObject = function() {

      if ( configObject.prototype._singletonInstance ) {
      return configObject.prototype._singletonInstance;
    }

    configObject.prototype._singletonInstance = this;
    self = this;

    // load the configuration
    this.configLoad();

    // watch for file changes
    this.configWatch();
};

// define each action as a function available within the configuration
configObject.prototype = {

  // Get config
  get : function(cfg) {
    return nconf.get(cfg);
  },

  // Load the configuration
  configLoad : function() {
    // reset the configuration store
    nconf.reset();

    // Consider commandline arguments and environment variables, respectively.
    nconf.argv().env();

    // Provide default values for setting not provided above
    nconf.defaults({'env': 'prod'});

    envFile = nconf.get('env') +'.json'

    // Load the specified environment
    nconf.file(cfgPath + envFile);

    // Then load the _default configurations from a designated file
    nconf.file('default', cfgPath + defaultFile);

  },

  configWatch : function () {
    console.log('Watching : ' + cfgPath);
    fs.watch(cfgPath, { persistent: true }, self.configChange);
  },

  configChange : function(event, filename) {
    if (event == 'change') {
      if ( (filename == envFile) || (filename == defaultFile) ) {
        console.log("Reloading Configuration");
        self.configLoad();
      }
    }
  }

};

module.exports = new configObject();
