var Numbers = function() {
	//
};

Numbers.prototype = {
	http: require('http'),
	url: "http://http://numbersapi.com/",
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!# (\d+)$/i)) {
			if (matches[1]) {
				var req = this.http.request(this.url + matches[1], function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function() {
						irc.client.say(chan, body);
					});
				});
				req.end();
			}
		}
	}
};

module.exports = new Numbers();
