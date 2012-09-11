var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('0d3c6fae79e958c4b14969ab92f7d4de04d91efb');
var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');
var req = new al.AlWebInsight();
var mongoose = require("mongoose"), db = mongoose.createConnection('mongodb://wies:wies@alex.mongohq.com:10048/wies');


module.exports = function(logger) {
    function UrlHandler() {
        this.type = "url";
    }

    UrlHandler.prototype.work = function(payload, callback) {
       // console.log(payload);
	alchemy.keywords(payload, {}, function(err, response) {
            if (err) throw err;

            // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
            var keywords = response.keywords;
            db.once('open', function () {
                var siteSchema = new Schema({
                    url: String,
                    title: String,
                    description: String,
                    keywords: [{
                        keyword: String,
                        relevance: Number
                    }]
                });

                var site = mongoose.model('site', siteSchema);
            });

            console.log(keywords);

            var resp =  req.post({'url':payload, 'callback':'http://requestb.in/1hxkzel1'}, function(response){
	    	 

  if (response.success) {
    //console.log(response.body);
  }
  else {
    console.log(response.errorMessage);
  }
            }); console.log(resp);
            callback("success");
	});
    }
    var handler = new UrlHandler();
    if (logger) handler.logger = logger;
    return handler;
}

