var fivebeans = require('fivebeans');
var client = new fivebeans.client('0.0.0.0', 11300);
client.connect(function(err){
    	console.log(err);
	client.stats_tube("url", function(err, payload){
        console.log(payload);
    });   
});
