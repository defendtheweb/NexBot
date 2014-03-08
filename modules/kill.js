var Kill = function() {
	//Constructor
	this.killList = [];
	this.hasInit = false;
    this.triggerMsg = 'THEBOTDOESNTLIKEYOU';
    this.deadMsg = 'You\'re dead to me.';
    this.chanOnKillMsg = '{user} has been slain !';
    this.chanOnRaiseMsg = '{user} has been raised !';
}

var ExtIrcClientKick = function(chan, who, why){
    this.send('KICK', chan, who, why);
};

Kill.prototype = {
	// public message received
	handle: function(from, chan, message) {
	
		//Add listener only once
		if (!this.hasInit)
		{
			var irc = global.irc;
            var killList = this.killList;
            var deadMsg = this.deadMsg;
            var triggerMsg = this.triggerMsg;
            var chanOnKillMsg = this.chanOnKillMsg;

			irc.client.kick = ExtIrcClientKick;
			irc.client.addListener('join', function(chan, who){
				if (killList.indexOf(who) >= 0)
					irc.client.kick(chan, who, deadMsg);
			});

            irc.client.addListener('kick', function(chan, nick, by, reason, message){
                if (by == global.config.get('nick') && reason == triggerMsg)
                {
                    killList.push(nick);
                    irc.client.say(chan, chanOnKillMsg.replace('{user}', nick));
                }
            });
			this.hasInit = true;
		}

		//check if user is authenticated
		if (config.get('admin').indexOf(from) >= 0) {
			/* 2 part */
			if (matches = message.trimRight().match(/^!([\S]*) (.*)$/i)) {
				if (matches[1] == 'kill') {
					var userId = this.killList.indexOf(matches[2]);
					(userId >= 0) ? this.raiseUser(userId, chan) : this.killUser(matches[2], chan);
				}
			}
		}
	},
	killUser: function(who, chan){
		global.irc.client.kick(chan, who, this.triggerMsg);
	},
	raiseUser: function(userId, chan)
	{
		global.irc.client.say(chan, this.chanOnRaiseMsg.replace('{user}', this.killList[userId]));
		this.killList.splice(userId, 1);
	}
};

module.exports = new Kill();
