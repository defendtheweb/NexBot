var Shout = function() {
	var Loader = require('../loader.js');
	this.shouts = new Loader();
	this.shouts.load('data/shouts.json');
	this.shouts = this.shouts.data;
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
					userMatch[1] + ": " + self.shouts[shoutMatch[1]] :
					self.shouts[shoutMatch[1]]);


			}
		}
		
		if (regShoutMatch.exec(message) === 'list')
		{
			for(var shout in self.shouts)
			{
				irc.client.say(chan, shout);
			}
		}
	}
};

module.exports = new Shout();
