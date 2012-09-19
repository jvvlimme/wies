var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('0d3c6fae79e958c4b14969ab92f7d4de04d91efb');
var bs = require('nodestalker')
    , conn = bs.Client();

var mongoose = require("mongoose");
mongoose.connect('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID

conn.watch("url").onSuccess(function(data){
    function reserve() {
        conn.reserve().onSuccess(function(job) {
            console.log(job);
            var j = JSON.parse(job.data);

            alchemy.keywords(j.payload.url, {}, function(err, response) {
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
                if (typeof j.payload.url == "string") {
                    Site.findById(j.payload.id, function(err, s){
                        s.keywords = keywords;
                        s.save( function(error, data){
                            if(error){
                                console.log(error);
                            }
                            else{
                                conn.deleteJob(job.id).onSuccess(function(msg){
                                    console.log("Retrieved keywords for:" + j.payload.url);

                                });
                            }
                        });

                    });
                }
            });
            reserve();
        });
    }
    reserve()
});



