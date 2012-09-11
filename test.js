var fivebeans = require('fivebeans');
var client = new fivebeans.client('0.0.0.0', 11300);
client.connect(function(err)
{
    	if (err) {console.log ("error") } else { 
	client.use("test");
	client.put(0,0,0, "test",function(err, jobid) {
		console.log(jobid);
	}); 
	 
	}
});

