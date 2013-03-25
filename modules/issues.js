var Issues = function() {
	//Constructor
};

Issues.prototype = {
	https: require('https'),

	handle: function(from, chan, message) {
		var irc = global.irc;

		if (message.length === '!issues'.length && message.indexOf('!issues') === 0) {
			var req = this.https.request('https://api.github.com/repos/HackThis/NexBot/issues', function(res) {
				var data = '';

				res.on('data', function(chunk) {
					data += chunk;
				});

				res.on('end', function() {
					// Get the result and turn it into a JSON object.
					try {
						var obj = JSON.parse(data);
						var count = obj.length;
						irc.client.say(chan, "NexBot has " + count + " open issue" + (count > 1 ? 's' : '') + " [http://git.io/hjkhrA]");
					} catch (e) {
						console.log(e);
					}
				});
			});

			req.end();

			req.on('error', function(error) {
				irc.client.say(chan, "Errm there's be an error");
				console.log(error);
			});
		}
	}
};

module.exports = new Issues();