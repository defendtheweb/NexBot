var Shout = function() {
	var Loader = require('../loader.js');
	this.shouts = new Loader();
	this.shouts.load('data/shouts.js');
	this.shouts = this.shouts.data;
}

Shout.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		var self = this;

		if (matches = message.trimRight().match(/^!([\S]*)$/i)) {
			for (shout in self.shouts) {
				if (matches[1] === shout) {
					irc.client.say(chan, self.shouts[shout]);
					break;
				}
			}
		}
	}
};

module.exports = new Shout();