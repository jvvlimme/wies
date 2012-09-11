
/*
 * GET home page.
 */

var job
    , jobs=[]
    , delay=0;

exports.index = function(req, res){
    res.render('index', { title: 'Website Analyzer' });
};

exports.al= function(req, res) {
	console.log(req.param["payload"]);
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
            job = {type: "url", payload: sites[i]}
            jobs.push(job);
        }
        client.use("url", function(err, tname){
            client.put(0,i*1,60, JSON.stringify(jobs.shift()), continuer);
        });

    });
    res.send("Processing Sites");
}


