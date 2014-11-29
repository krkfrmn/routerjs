// load the configuration settings
var config = require('./config');

var self = {};

// the log singleton
var logObject = function() {

      if ( logObject.prototype._singletonInstance ) {
      return logObject.prototype._singletonInstance;
    }

    logObject.prototype._singletonInstance = this;
    self = this;

};

// define each action as a function available within the configuration
logObject.prototype = {

  msg : function(msg) {
    if (config.get('config:verbose:console'))
      console.log(msg);
  },

  err : function(msg) {
    if (config.get('config:verbose:errors'))
      console.error(msg);
  }

};

module.exports = new logObject();
