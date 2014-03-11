var Profile = function() {
	//Constructor
}

Profile.prototype = {
	https: require('https'),
	api_key: global.config.get('hackthis_api'),
	debug: global.config.get('debug'),
	handle: function(from, chan, message) {
		var irc = global.irc;
		var matches;
		var debug = this.debug;
		if (matches = message.match(/^!([\S]*)( (.*))?$/i)) {
			if (matches[1] == 'profile') {
				var user = matches[2] || from;
				user = user.trim();

				var req = this.https.get('https://api.hackthis.co.uk/?api_key='+this.api_key+'&method=user.getInfo&user='+user, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function(){
						var obj = {};
						// Get the result and turn it into a JSON object.
						try {
							obj = JSON.parse(body);
						} catch (e) {
							if (debug)
								console.log("\033[33m[HackThis API]\033[0m " + e);
						}

						if (obj.data) {
							// Return the string.
							var result = obj.data.user + " | Score: " + obj.data.score + " | Posts: " + obj.data.posts + " | Consecutive: " + obj.data.consecutive;
							irc.client.say(chan, result);
						} else {
							irc.client.say(chan, "User not found");
						}
					});
				});

				req.on('error', function(e) {
					irc.client.say(chan, "Errm there's be an error");
				});
			}
		}
	}
};

module.exports = new Profile();
