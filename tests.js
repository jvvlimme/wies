var phantom = require("phantom")
    , gm = require("gm")
    , client = require("nodestalker").Client();

var tube = "screenshot";

client.watch(tube).onSuccess(function(data) {
    function resJob() {
        client.reserve().onSuccess(function(job){
            console.log(job);
            client.deleteJob(job.id).onSuccess(function(msg){
                console.log("Finished Job: ", job);
            });
        });
    }
resJob();
});

