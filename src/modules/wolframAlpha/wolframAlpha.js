var wolframAlpha = function() {
	this.xml = require("node-xml-lite");
};

wolframAlpha.prototype = {
	http: require('http'),
	url: 'http://api.wolframalpha.com/v2/query?appid=7R2H46-KA8Y6J6LV6&input=',
	handle: function(from, chan, message) {
		var self = this,
			irc = global.irc;

		var matches;
		if (matches = message.match(/^!wa (.+)$/i)) {
			if (matches) {
				var term = matches[1];
				term = term.trim();

				var req = this.http.request(this.url + term, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						var obj = self.xml.parseString(body);
						if (obj && obj.attrib) {
							if (obj.attrib.numpods < 1) {
								irc.client.say(chan, "No result found");
							} else {
								var answer = obj.childs[1].childs[0].childs[0].childs[0];
								irc.client.say(chan, answer);
							}
						}
					});
				});
				req.end();
			}
		}
	}
};

module.exports = new wolframAlpha();
