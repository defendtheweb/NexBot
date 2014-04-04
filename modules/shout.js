var Shout = function() {
	var Loader = require('../loader.js');
	this.shoutFile = new Loader();
	this.shoutFile.load('data/shouts.json');
	this.shouts = this.shoutFile.data;
	this.prefixCmd = '@';
};

Shout.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		var self = this;
		var userList = global.modules['userlist'];

		//match on all text block prefixed by the shout's prefix.
		var regShoutMatch = new RegExp(this.prefixCmd + '(\\S+)','gi');
		var shoutMatch;

		//Execute till the time there is a potential shouts to parse.
		while ((shoutMatch= regShoutMatch.exec(message)) !== null)
		{
			//Check if shouts exists..
			if (self.shouts[shoutMatch[1]] !== undefined)
			{
				//check if shout is directed to users x.
				var userMatch;
				if (userMatch = message.substring(regShoutMatch.lastIndex).match(/^\s+([\S]+)/i)) {
					//if userlist module is not loaded then send as a targeted shouts anyway...
					if (!(userList === undefined || userList.userExists(chan, userMatch[1]))) {
						userMatch = null;
					}
				}
				irc.client.say(chan, userMatch ?
					userMatch[1] + ': ' + self.shouts[shoutMatch[1]] :
					self.shouts[shoutMatch[1]]);


			}
		}
	},
	handlePM: function(from, message) {
		var irc = global.irc;
		var self = this;
		var matches = message.match(/^shout list$/i);
		if (matches && matches.length >= 1) {
			for(var shout in self.shouts)
			{
				irc.client.say(from, shout);
			}
		}


		//check if user is authenticated
		if (global.config.get('admin').indexOf(from) >= 0) {
			/* 2 part */
			if (matches = message.trimRight().match(/^shout add (.*) ([\S]*)$/i)) {
				var key = matches[1],
					url = matches[2];

				// Save new shout in shouts.json
				this.shoutFile.set(key, url);
				this.shoutFile.save();

				// Add to loaded array of shouts
				this.shouts = this.shoutFile.data;

				irc.client.say(from, key + ' added');
			}
		}
	}
};

module.exports = new Shout();
