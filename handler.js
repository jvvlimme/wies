var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('0d3c6fae79e958c4b14969ab92f7d4de04d91efb');
var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');
var req = new al.AlWebInsight();
var mongoose = require("mongoose");
mongoose.connect('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID;
var http = require('http');
var $ = require('jquery');

module.exports = function(logger) {
    function UrlHandler() {
        this.type = "url";
    }

    UrlHandler.prototype.work = function(payload, callback) {
        //console.log(payload);
        alchemy.keywords(payload.url, {}, function(err, response) {
            if (err) throw err;

            // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
            var keywords = response.keywords;

            //console.log(payload);


            //console.log(pageData);
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
            var Site = mongoose.model('Site', siteSchema);
            if (typeof payload.url == "string") {
                Site.findById(payload.id, function(err, s){
                    s.keywords = keywords;
                    s.save( function(error, data){
                        if(error){
                            console.log(error);
                        }
                        else{
                            //console.log(data);
                        }
                    });

                });
            }
        });



        callback("success");
    }

    var handler = new UrlHandler();
    if (logger) handler.logger = logger;
    return handler;
}

