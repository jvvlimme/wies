
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('0d3c6fae79e958c4b14969ab92f7d4de04d91efb');
var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');
var req = new al.AlWebInsight();
var mongoose = require("mongoose"), db = mongoose.createConnection('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID;
var http = require('http');
var $ = require('jquery');

module.exports = function(logger) {
    function UrlHandler() {
        this.type = "url";
    }

    UrlHandler.prototype.work = function(payload, callback) {
         console.log(payload);
        alchemy.keywords(payload, {}, function(err, response) {
            if (err) throw err;

            // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
            var keywords = response.keywords;

            var options = {
                host: payload.substr(7, payload.length),
                port: 80,
                path: '/',
                method: 'GET'
            }
		//console.log(payload);
            var req = http.get(options, function(res) {
                var pageData = "";
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    pageData += chunk;
                });

                res.on('end', function(){
                console.log(pageData);    
		var siteSchema = new Schema({
                        url: {
                            type: String,
                            index: { unique: true },
                            required: true
                        },
                        title: String,
                        description: String,
                        keywords: [{
                            text: String,
                            relevance: String
                        }]
                    });
                    var Site = db.model('Site', siteSchema);
                    var s = new Site();

                    s.url = payload;
                    s.keywords = keywords;
                    pd = $(pageData);
                    s.title = $(pageData).find("title").text();
                	console.log(pd.find('title').text());    
		s.description = $(pageData).find("meta[name='description']").attr("content");
                    
			console.log("s:"+s);
		    s.save( function(error, data){
                        if(error){
                            console.log(error);
                        }
                        else{
                            console.log(data);
                        }
                    });
                });
            });


/*
            var resp =  req.post({'url':payload, 'callback':'http://184.106.69.90:4000/al'}, function(response){


                if (response.success) {
                    //console.log(response.body);
                }
                else {
                    //console.log(response.errorMessage);
                }
            }); //console.log(resp);*/
            callback("success");
        });
    }
    var handler = new UrlHandler();
    if (logger) handler.logger = logger;
    return handler;
}



