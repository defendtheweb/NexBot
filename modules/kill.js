var Kill = function() {
	//Constructor
	this.killList = [];
	this.isListenning = false;
}

Kill.prototype = {
	// public message recieved
	handle: function(from, chan, message) {
	
		//Add listener only once
		if (!this.isListenning)
		{
			var irc = global.irc;
			var killList = this.killList;
			irc.client.addListener('join', function(chan, who){
				if (killList.indexOf(who) >= 0)
					irc.client.kick(chan, who);
			});
			this.isListenning = true;
		}

		//check if user is authenticated
		if (config.get('admin').indexOf(from) >= 0) {
			/* 2 part */
			if (matches = message.trimRight().match(/^!([\S]*) (.*)$/i)) {
				if (matches[1] == "kill") {
					var userId = this.killList.indexOf(matches[2]);
					(userId >= 0) ? this.raiseUser(userId, chan) : this.killUser(matches[2], chan);
				}
			}
		}
	},
	killUser: function(userName, chan){
		var irc = global.irc;
		irc.client.kick(chan, userName);
		this.killList.push(userName);
		irc.client.say(chan, userName + " has been slain !");
	},
	raiseUser: function(userId, chan)
	{
		var irc = global.irc;
		irc.client.say(chan, this.killList[userId] + " has been raised !");
		this.killList.splice(userId, 1);
	}
};

module.exports = new Kill();
