/*
 * GET home page.
 */

var job
    , jobs=[]
    , delay=0;

var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');

var ar = new al.AlWebInsight()
    , mongoose = require("mongoose");
mongoose.connect('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID;

exports.index = function(req, res){
    res.render('index', { title: 'Website Analyzer' });
};

exports.al = function(req, res) {
    // console.log("url:" + req.body.url + "date_created: " + req.body.date_created);
    ar.get({'url': req.body.url, 'date_created': req.body.date_created, 'time_created': req.body.time_created}, function(response) {
        console.log(response.body.results.head_data.meta_data.title);
        console.log(response.body.results.head_data.meta_data.description);
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

        Site.findOne({"url": req.body.url}).exec(function(err, s) {
            s.title = response.body.results.head_data.meta_data.title;
            s.description = response.body.results.head_data.meta_data.description;
            s.save(function(err) {
                if (err) {console.log(err);}
            });
        });
    });

}

exports.show = function(req, res) {
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
    Site.find().sort('_id').exec(function(err, sites) {
        res.render("results", {title: "Results", Sites: sites});
    });
}

exports.start = function(req, res) {
    var fivebeans = require('fivebeans');
    var client = new fivebeans.client('0.0.0.0', 11300);
    if (typeof req.param('sitelist') != "string") { res.send("Error Processing Input"); process.exit(0)}
    var sites = req.param('sitelist').split(/\r\n|\r|\n/);

    client.connect(function(err) {

        var doneEmittingJobs = function()
        {
            console.log('We reached our completion callback. Now closing down.');
        };

        var continuer = function(err, jobid)
        {
            console.log('emitted job id: ' + jobid);
            if (jobs.length === 0)
                return doneEmittingJobs();
            delay++;
            client.put(0, delay, 0, JSON.stringify(jobs.shift()), continuer);
        };

        if (err) console.log("Error connecting to Beanstalk");

        for (i = 0; i < sites.length; i++) {
            if (sites[i].length > 8) {
                job = {type: "url", payload: sites[i]}
                jobs.push(job);
            }
        }
        client.use("url", function(err, tname){
            client.put(0,i*1,60, JSON.stringify(jobs.shift()), continuer);
        });

    });
    res.send("Processing Sites");
}

