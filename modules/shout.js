var Shout = function() {
	var Loader = require('../loader.js');
	this.shouts = new Loader();
	this.shouts.load('data/shouts.js');
	this.shouts = this.shouts.data;
};

Shout.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		var self = this;

		var matches, shout;
		if (matches = message.trimRight().match(/^!([\S]*)$/i)) {
			for (shout in self.shouts) {
				if (matches[1] === shout) {
					irc.client.say(chan, self.shouts[shout]);
					break;
				}
			}
		/* Check for a user parameter in the form of !<shout><space><username> */
		}else if (matches = message.trimRight().match(/^!\S* \S*$/i)) {
			var parameters = message.split(" ");
			for (shout in self.shouts) {
				/* Use Substr to remove the prefixed '!' */
				if (parameters[0].substr(1) === shout) {
					irc.client.say(chan, parameters[1] + ": " + self.shouts[shout]);
					break;
				}
			}
		}
	}
};

module.exports = new Shout();