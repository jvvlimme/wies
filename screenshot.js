var phantom = require('phantom')
    , gm = require('gm')
    , bs = require('nodestalker')
    , conn = bs.Client();

conn.watch("screenshot").onSuccess(function(data){
    function reserve () {
        conn.reserve().onSuccess(function(job) {
            var j = JSON.parse(job.data);
            phantom.create(function(ph) {
                ph.createPage(function(page) {
                    page.viewportSize = { width: 1024, height: 768 };
                    page.open(j.payload.url, function(status) {
                        if (status !== 'success') {
                            console.log('Unable to load the address!');
                        } else {
                            var dest = "/home/wies/wies/public/img/"+j.payload.id+".png";
                            setTimeout(function () {
                                page.render(dest, function() {
                                    gm(dest).crop(1024,768,0,0).resize(270).write(dest, function(err){ if (err) console.log(err); });
                                    conn.deleteJob(job.id).onSuccess(function(msg){});
                                    console.log("Site:" +j.payload.url+" thumbnailed");
                                    reserve();
                                });

                            }, 2000);
                        }
                    });
                });
            });
        });
    }
    reserve();
});



