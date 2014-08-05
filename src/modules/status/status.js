var Status = function() {
	//Constructor
};

Status.prototype = {
	http: require('http'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!status r6$/i)) {
			var req = this.http.request('http://85.159.213.101:6459/?api=JVE9KrDufcKKpKqD75qaZk6dMYrYi5TqBPueDO3c&target=ping', function(res) {
				res.setEncoding('utf8');
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});

				res.on('end', function(){
					if (body === 'pong') {
						irc.client.say(chan, "Status: online");
					} else {
						irc.client.say(chan, "Status: offline");
					}
				});
			});
			req.end();

			req.on('error', function(e) {
				irc.client.say(chan, "Status: offline");
			});
		} else if (matches = message.match(/^!status b7$/i)) {
	        	var req = this.http.request({ 'hostname': 'www.hackthis.co.uk', 'port':6776}, function(res) {
	           	     res.setEncoding('utf8');
	           	     var body = '';
	           	     res.on('data', function(chunk) {
	               	         body += chunk;
	               	 });
	
		                res.on('end', function(){
					console.log('end');
					console.log(body);
		                        if (body === 'Welcome weary traveller. I believe you are looking for this: mapthat') {
		                                irc.client.say(chan, "Status: online");
		                        } else {
		                                irc.client.say(chan, "Status: offline");
		                        }
		                });
		        });
		        req.end();	

	        	req.on('error', function(e) {
				console.log('error');
       	 		        irc.client.say(chan, "Status: offline");
       		 	});
		}
	}
};

module.exports = new Status();

