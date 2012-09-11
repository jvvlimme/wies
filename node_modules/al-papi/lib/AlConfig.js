var Util = require('util');

var AlConfig = function(_api_key) {
  this.api_key     = _api_key;
  global.al_config = { "api_key" : _api_key };
};

module.exports = AlConfig;
