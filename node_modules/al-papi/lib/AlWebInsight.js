var Util   = require('util');
var AlHttp = require('./AlHttp');

var AlWebInsight = function(_api_key) {
  this.api_key = _api_key;
  global.al_config.api_key = _api_key;
  AlHttp.call(this);
}

var AlWebInsight = function() {
  this.api_key = global.al_config.api_key;
  AlHttp.call(this);
}

Util.inherits(AlWebInsight, AlHttp);

AlWebInsight.prototype.post = function(params, callback) {
  if (params === undefined) { params = {}; }
  this._do_post(params, '/web/insight.json', callback);
};

AlWebInsight.prototype.get = function(params, callback) {
  if (params === undefined) { params = {}; }
  this._do_get(params, '/web/insight.json', callback);
};

module.exports = AlWebInsight;
