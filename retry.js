var al = require('al-papi');
al.AlConfig('gswpcceJLA8PPQfntwDo');
var ar = new al.AlWebInsight()
    , mongoose = require("mongoose");
mongoose.connect('mongodb://wies:wies@alex.mongohq.com:10048/wies');
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectID
    , jobs = [], delay=0;

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

Site = mongoose.model("Site", siteSchema);
Site.find({keywords: []}, function(err, s){
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

        for (i = 0; i < s.length; i++) {
            job = {type: "url", payload: {url: s[i].url, id: s[i]._id}}
            jobs.push(job);
            console.log(jobs);

        }
        client.use("url", function(err, tname){
            client.put(0,i*1,0, JSON.stringify(jobs.shift()), continuer);
        });

    });

});


