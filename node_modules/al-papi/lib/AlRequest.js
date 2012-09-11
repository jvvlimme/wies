var Util   = require('util');
var AlHttp = require('./AlHttp');

var AlRequest = function(_api_key) {
  this.api_key = _api_key;
  global.al_config.api_key = _api_key;
  AlHttp.call(this);
}

var AlRequest = function() {
  this.api_key = global.al_config.api_key;
  AlHttp.call(this);
}

Util.inherits(AlRequest, AlHttp);

AlRequest.prototype.post = function(params, callback) {
  if (params === undefined) { params = {}; }
  var priority = params['priority'];
  var relativePath;
  if (priority === undefined) {
    relativePath = '/keywords.json';
  }
  else {
    delete params['priority'];
    relativePath = '/keywords/priority.json';
  }

  this._do_post(params, relativePath, callback);
};

AlRequest.prototype.priority_post = function(params, callback) {
  if (params === undefined) { params = {}; }
  params['priority'] = true;
  this._do_post(params, '/keywords/priority.json', callback);
};

AlRequest.prototype.get = function(params, callback) {
  if (params === undefined) { params = {}; }
  this._do_get(params, '/keywords/get.json', callback);
};

module.exports = AlRequest;
