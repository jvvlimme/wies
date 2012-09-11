var Util        = require('util');
var Events      = require('events');
var request     = require('request');
var QueryString = require('querystring');
var Util        = require('util');
var AlResponse  = require('./AlResponse');

var AlHttp = function() {
  Events.EventEmitter.call(this);

  /** @private */
  this.baseUrl      = "http://api.authoritylabs.com";
  this.api_key      = global.al_config.api_key;
  this._connections = {};
}

Util.inherits(AlHttp, Events.EventEmitter);

AlHttp.prototype._do_post = function(params, relativePath, callback) {
  params['auth_token'] = this.api_key;

  var queryParams = QueryString.stringify(params);
  var apiUrl      = this.baseUrl + relativePath;

  if (queryParams != undefined && queryParams.length > 0)
      apiUrl += '?' + queryParams;

  var requestOptions = { method: 'POST', url: apiUrl };
  var alResponse     = new AlResponse(params, apiUrl);
  var httpRequest    = request.post(requestOptions);

  this._connections[httpRequest.hash] = { callback: callback, data: '', httpRequest: httpRequest, alResponse: alResponse };
  this._createEventListenersForRequest(httpRequest);
}

AlHttp.prototype._do_get = function(params, relativePath, callback) {
  params['auth_token'] = this.api_key;
  var queryParams      = QueryString.stringify(params);
  var apiUrl           = this.baseUrl + relativePath;

  if (queryParams != undefined && queryParams.length > 0)
      apiUrl += '?' + queryParams;

  var requestOptions = { method: 'GET', url: apiUrl };
  var alResponse     = new AlResponse(params, apiUrl);
  var httpRequest    = request.get(requestOptions);

  this._connections[httpRequest.hash] = { callback: callback, data: '', httpRequest: httpRequest, alResponse: alResponse };
  this._createEventListenersForRequest(httpRequest);
}

/**
 * Returns the connection object associated with the specified key.
 *
 * @private
 * @this {Client}
 * @param {String} aKey
 * @return The connection object or null.
 */
AlHttp.prototype._connectionForKey = function(aKey) {
  var connection = this._connections[aKey];

  return connection === undefined ? null : connection;
};


// 
// EVENT METHODS
// 

/**
 * Creates listeners that respond to events triggered by the specified 
 * request object.
 *
 * @private
 * @this {AlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 */
AlHttp.prototype._createEventListenersForRequest = function(aRequest) {
  var self = this;

  aRequest.on('close', function() {
    self._requestDidClose(aRequest);
  });
    
  aRequest.on('data', function(data) {
    self._requestDidReceiveData(aRequest, data);
  });
    
  aRequest.on('end', function() {
    self._requestDidEnd(aRequest);
  });

  aRequest.on('error', function(error) {
    self._requestDidFailWithError(aRequest, error);
  });

  aRequest.on('response', function(aResponse) {
    self._requestDidReceiveResponse(aRequest, aResponse);
  });
};

/**
 * Removes the connection object associated with the specified key.
 *
 * @private
 * @this {AlHttp}
 * @param {String} aKey
 */
AlHttp.prototype._removeConnectionForKey = function(aKey) {
  if (this._connectionForKey(aKey))
    delete this._connections[aKey];
};

/**
 *
 *
 * @private
 * @this {StreamAlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 */
AlHttp.prototype._requestDidClose = function(aRequest) {
  var connection = this._connectionForKey(aRequest.hash);

  if (connection !== undefined) {
    var error      = undefined;
    var result     = null;
    var alResponse = connection.alResponse;

    try {
      result             = JSON.parse(connection.data);
      alResponse.body    = result;
      alResponse.success = true;
    }
    catch (e) {
      error = e;
      alResponse.success      = false;
      alResponse.errorMessage = e.message;
    }
    console.log('_requestDidClose');
    connection.callback(alResponse);
    this._removeConnectionForKey(aRequest.hash);
  }
};

/**
 *
 *
 * @private
 * @this {StreamAlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 */
AlHttp.prototype._requestDidEnd = function(aRequest) {
  var connection = this._connectionForKey(aRequest.hash);

  if (connection != undefined) {
    var error      = undefined;
    var result     = null;
    var alResponse = connection.alResponse;

    try {
        result = JSON.parse(connection.data);
        alResponse.body = result;
        alResponse.success = true;
    }
    catch (e) {
        error = e;
        alResponse.success      = false;
        alResponse.errorMessage = e.message;
    }
    
    console.log('_requestDidEnd');
    connection.callback(alResponse);
    this._removeConnectionForKey(aRequest.hash);
  }
};

/**
 * Handles a request failure.
 *
 * @private
 * @this {StreamAlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 * @param {Error} aError
 */
AlHttp.prototype._requestDidFailWithError = function(aRequest, aError) {
  var connection = this._connectionForKey(aRequest.hash);

  if (connection !== undefined) {
    var alResponse          = connection.alResponse;
    alResponse.success      = false;
    alResponse.errorMessage = aError.message;

    console.log('_requestDidFailWithError');
    connection.callback(alResponse);
    this._removeConnectionForKey(aRequest.hash);
  }
};

/**
 * Handles data received from the server.
 *
 * @private
 * @this {StreamAlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 * @param {Buffer} aData
 */
AlHttp.prototype._requestDidReceiveData = function(aRequest, aData) {
  var connection = this._connectionForKey(aRequest.hash);

  if (connection == undefined) return;

  var receivedData = connection['data'] + aData.toString('utf8');
  connection['data'] = receivedData;
};

/**
 * Handles a response by the server.
 *
 * @private
 * @this {StreamAlHttp}
 * @param {http.AlHttpRequest} aRequest The request object.
 * @param {http.AlHttpResponse} aResponse The response object.
 */
AlHttp.prototype._requestDidReceiveResponse = function(aRequest, aResponse) {
  var connection = this._connectionForKey(aRequest.hash);

  if (connection !== undefined) {
    connection['data'] = '';
    console.log('connection in did receive response')
    var alResponse        = connection.alResponse;
    alResponse.statusCode = aResponse.statusCode;
    connection.alResponse = alResponse;
  }

  var error = null;
  if (aResponse.statusCode != 200) {
    error = new Error();
    error.code = aResponse.statusCode;
    console.log(aResponse);
  }

  console.log('_requestDidReceiveResponse');

  switch(aResponse.statusCode) {
    case 304:
      error.message = 'Not Modified.';
      break;
    case 400:
      error.message = 'Bad Request';
      break;
    case 401:
      error.message = 'Unauthorized';
      break;
    case 403:
      error.message = 'Forbidden';
      break;
    case 404:
      error.message = 'Not Found';
      break;
    case 406:
      error.message = 'Not Acceptable';
      break;
    case 420:
      error.message = 'Enhance Your Calm';
      break;
    case 500:
      error.message = 'Internal Server Error';
      break;
    case 502:
      error.message = 'Bad Gateway';
      break;
    case 503:
      error.message = 'Service Unavailable';
      break;
  }

  if (error != undefined) {
    this._requestDidFailWithError(aRequest, error);
    return;
  }
};

module.exports = AlHttp