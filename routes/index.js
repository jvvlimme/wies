/*
 * GET home page.
 */

var job
    , jobs=[]
    , jobs2=[]
    , jobs3=[]
    , delay=0;

var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');

var ar = new al.AlWebInsight()
    , mongoose = require("mongoose");
mongoose.connect('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID;

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

var fivebeans = require('fivebeans');
var client = new fivebeans.client('0.0.0.0', 11300);

exports.index = function(req, res){
    res.render('index', { title: 'Website Analyzer' });
};

exports.show = function(req, res) {
    var Site = mongoose.model('Site', siteSchema);
    Site.find().sort('_id').exec(function(err, sites) {
        res.render('results', {title: 'Results', Sites: sites});
    });
}

exports.start = function(req, res) {
    if (typeof req.param('sitelist') != "string") { res.send("Error Processing Input"); process.exit(0)}
    var sites = req.param('sitelist').split(/\r\n|\r|\n/);

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
    var continuer2 = function(err, jobid)
    {
        console.log('emitted job id: ' + jobid);
        if (jobs2.length === 0)
            return doneEmittingJobs();
        delay++;
        client.put(0, delay, 0, JSON.stringify(jobs2.shift()), continuer2);
    };
    var continuer3 = function(err, jobid)
    {
        console.log('emitted job id: ' + jobid);
        if (jobs3.length === 0)
            return doneEmittingJobs();
        delay++;
        client.put(0, delay, 0, JSON.stringify(jobs3.shift()), continuer3);
    };

    client.connect(function(err) {

        if (err) console.log("Error connecting to Beanstalk");

        for (i = 0; i < sites.length; i++) {
            if (typeof sites[i] == "string") {
                var Site = mongoose.model('Site', siteSchema);
                var s = new Site();
                s.url = sites[i];
                s.save();

                if (sites[i].length > 8) {
                    job = {type: "url", payload: {url: sites[i], id: s._id}}
                    job2 = {type: "crawl", payload: {url: sites[i], id:s._id}}
                    job3 = {type: "screenshot", payload: {url: sites[i], id:s._id}}
                    jobs.push(job);
                    jobs2.push(job2);
                    jobs3.push(job3);
                }
            }
        }
        client.use("url", function(err, tname){
            client.put(0,i*1,0, JSON.stringify(jobs.shift()), continuer);
            client.put(0, i*1,0, JSON.stringify(jobs2.shift()), continuer2);
        });

        client.use("screenshot", function(err, tname) {
            client.put(0, i*1,0, JSON.stringify(jobs3.shift()), continuer3);
        });

    });
    res.redirect("/results");
}

