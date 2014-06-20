var say = function() {
};

say.prototype = {
	handlePM: function(from, message) {
		var irc = global.irc;
		var self = this;
		var matches;

		//check if user is authenticated
		if (global.config.get('admin').indexOf(from) >= 0) {
			/* 2 part */
			if (matches = message.trimRight().match(/^say ([\S]+) (.*)$/i)) {
				var chan = matches[1],
				msg = matches[2];

				irc.client.say(chan, msg);
			}
		}
	}
};

module.exports = new say();
