var utils = require('../../lib/utils.js');

var Profile = function() {
	//Constructor
};

Profile.prototype = {
	https: require('https'),
	api_key: global.config.get('wechall_api'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!([\S]*)( (.*))?$/i)) {
			if (matches[1] === "profile") {
				var user = matches[2] || from;
				user = user.trim();
				var self = this;

				var req = this.https.request('https://www.hackthis.co.uk/wechall/userscore.php?format=json&authkey='+this.api_key+'&username='+user, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						if (body) {
							if (body === '0') {
								irc.client.say(chan, "User not found");
								return;
							}
							var data = JSON.parse(body);
							// Return the string.
							var result = data.username + " | Rank: " + data.rank + " | Score: " + utils.addCommas(data.total_score) + " | Levels: " + data.challs_solved + '/' + data.chall_count + " | Profile: https://www.hackthis.co.uk/user/" + data.username;
							irc.client.say(chan, result);
						} else {
							irc.client.say(chan, "User not found");
						}
					});
				});
				req.end();

				req.on('error', function(e) {
					irc.client.say(chan, "Errm there's be an error");
				});
			}
		}
	}
};

module.exports = new Profile();
