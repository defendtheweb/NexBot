var Issues = function() {
	//Constructor
}

Issues.prototype = {
	https: require('https'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		if (matches = message.match(/^!([\S]*)$/i)) {
			if (matches[1] == "issues") {
				var req = this.https.request('https://api.github.com/repos/HackThis/NexBot', function(res) {
					res.on('data', function(d) {
						// Get the result and turn it into a JSON object.
						var obj = JSON.parse(d);
						// Return the string.
						irc.client.say(chan, "NexBot has " + obj.open_issues_count + " open issues");
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

module.exports = new Issues();