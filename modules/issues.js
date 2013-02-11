var Issues = function() {
	//Constructor
}

Issues.prototype = {
	https: require('https'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		if (matches = message.match(/^!([\S]*)$/i)) {
			if (matches[1] == "issues") {
				var req = this.https.request('https://api.github.com/repos/HackThis/NexBot/issues', function(res) {
					res.on('data', function(d) {
						// Get the result and turn it into a JSON object.
						var obj = JSON.parse(d);
						// Count number of issues
						var count = obj.length;
						// Return the string.
						irc.client.say(chan, "NexBot has " + count + " open issue" + (count==1?'':'s'));
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