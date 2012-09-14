var mongoose = require("mongoose"), db = mongoose.createConnection('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID
    , http = require('http')
    , $ = require('jquery')
    , dourl = require('url');

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

module.exports = function(logger) {
    function Crawler() {
        this.type = "crawl";
    }

    Crawler.prototype.work = function(payload, callback) {
        var options = {
            host: dourl.parse(payload.url).host,
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

                Site = mongoose.model("Site", siteSchema);

                Site.findById(payload.id, function(err, s) {
                    s.title = pd.find('title').text();
                    s.description = pd.find('meta[name="description"]').attr("content");
                    s.save();
                });

            });
        });
        callback("success");
    }

    var handler = new Crawler();
    if (logger) handler.logger = logger;
    return handler;

}
