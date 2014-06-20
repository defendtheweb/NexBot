var LastSeen = function() {
	//Constructor
};

LastSeen.prototype = {
	// public message received
	handle: function(from, chan, message) {
		var irc = global.irc;
		var matches;
		if (matches = message.match(/^!([\S]*)( (.*))?$/i)) {
			if (matches[1] === 'lastseen') {
				var user = (matches[2] || from).trim();
				irc.client.whois(user, function(info){
					if (info.idle !== undefined)
					{
						var lastSeen = new Date();
						lastSeen.setSeconds(lastSeen.getSeconds() - info.idle);
						irc.client.say(chan, user + ' was last seen on ' + lastSeen);
					}
					else {
						irc.client.say(chan, user + ' has never been seen.');
					}
				});
			}
		}
	}
};

module.exports = new LastSeen();
