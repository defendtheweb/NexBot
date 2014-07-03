var Excuses = function() {
	//Constructor
};

Excuses.prototype = {
	https: require('https'),
	url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20data.html.cssselect%20where%20url%3D%22www.programmerexcuses.com%22%20and%20css%3D%22center%20a%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=',
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!excuse(s?)$/i)) {
			if (matches) {
				var req = this.https.request(this.url, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						if (body !== 0) {
							var obj = JSON.parse(body);
							if (obj && obj.query && obj.query.count === 1) {
								irc.client.say(chan, obj.query.results.results.a.content);
							}
						}
					});
				});
				req.end();
			}
		}
	}
};

module.exports = new Excuses();
