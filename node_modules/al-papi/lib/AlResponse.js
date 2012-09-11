var Util = require('util');

var AlResponse = function(params, url) {
  this.params       = params;
  this.url          = url;
  this.body         = {}
  this.success      = false;
  this.errorMessage = null;
  this.statusCode   = null;
}

module.exports = AlResponse;
