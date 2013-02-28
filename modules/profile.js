var Profile = function() {
	//Constructor
}

Profile.prototype = {
	https: require('https'),
	api_key: global.config.get('hackthis_api'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		if (matches = message.match(/^!([\S]*)( (.*))?$/i)) {
			if (matches[1] == "profile") {
				user = matches[2] || from;
				user = user.trim();

				var req = this.https.request('https://api.hackthis.co.uk/?api_key='+this.api_key+'&method=user.getInfo&user='+user, function(res) {
					res.on('data', function(d) {
						// Get the result and turn it into a JSON object.
						var obj = JSON.parse(d);

						if (obj.data) {
							// Return the string.
							var result = obj.data.user + " | Score: " + obj.data.score + " | Posts: " + obj.data.posts + " | Consecutive: " + obj.data.consecutive;
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