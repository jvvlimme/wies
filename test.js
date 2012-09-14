var http = require('http');
var $ = require('jquery'); 
var options = {
    host: 'www.standaard.be',
    port: 80,
    path: '/',
    method: 'GET'
  };

  var req = http.get(options, function(res) {
    var pageData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      pageData += chunk;
    });

    res.on('end', function(){
       var pd = $(pageData);
	console.log(pd.find('title').text());
	console.log(pd.find('meta[name="description"]').attr("content"));
    });
  });
