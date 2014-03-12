var UserList = function() {
	//Constructor
	this.users = {};
	this.userModePrefix = {
		'q': '@',
		'a': '@',
		'o': '@',
		'h': '%',
		'v': '+',
		'default': ''
	};
}

UserList.prototype = {
	userExists: function(chan, who)
	{
		return (this.users[chan] !== undefined && this.users[chan][who] !== undefined);
	},
	getUserMode: function(chan, who)
	{
		return (this.users[chan][who] ? (this.userExists(chan, who)) : this.userModePrefix['default']);
	},
	editUserMode: function(chan, who, mode)
	{
		if (this.userExists(chan, who))
			this.users[chan][who] = (this.userModePrefix[mode] == this.users[chan][who]) ?
				this.userModePrefix['default'] :
				(this.userModePrefix[mode] || this.userModePrefix['default']);
	},
	getUsers: function(chan)
	{
		return ((chan !== undefined && this.users[chan] !== undefined) ? this.users[chan] : this.users);
	},
	addUser: function(chan, who, mode){
		if (this.users[chan] === undefined)
			this.users[chan] = {};
		if (this.users[chan][who] === undefined)
			this.users[chan][who] = mode || this.userModePrefix['default'];

	},
	deleteUser: function(chan, who){
		if (this.userExists(chan, who))
			delete this.users[chan][who];
	},
	renameUser: function(oldName, newName, chan){
			var userMode = '';
			if (this.userExists(chan, oldName))
			{
				userMode = this.users[chan][oldName];
				delete this.users[chan][oldName];
			}
			this.addUser(chan, newName, userMode);
	},
	init: function()
	{
		var irc = global.irc;
		var self = this;
		irc.client.on('join', function(chan, who){
			self.addUser(chan, who);
		});
		irc.client.on('nick', function(oldName, newName, chan){
			self.renameUser(oldName, newName, chan);
		});
		irc.client.on('part', function(chan, who){
			self.deleteUser(chan, who);
		});
		irc.client.on('quit', function(who, reason, chan){
			self.deleteUser(chan, who);
		});
		irc.client.on('names', function(chan, nicks){
			var nick;
			for (nick in nicks)
				self.addUser(chan, nick, nicks[nick]);
		});
		irc.client.on('+mode', function(chan, by, mode, who){
			console.log(mode);
			self.editUserMode(chan, who, mode);
		});
		irc.client.on('-mode', function(chan, by, mode, who){
			console.log(mode);
			self.editUserMode(chan, who, mode);
		});
		irc.client.send('NAMES');
	},
	// private message received
	handlePM: function(from, message) {
		var matches;
		if (matches = message.trimRight().match(/^!([\S]*)$/i)) {
			if (matches[1] == 'userlist')
			{
				irc.client.say(from, 'Users by Channels:');
				var chan;
				for (chan in this.users)
				{
					var user;
					var users = [];
					for (user in this.users[chan])
						users.push(this.users[chan][user] + user);
					irc.client.say(from,  chan + ': ' + JSON.stringify(users));
				}
			}
		}
	}
};

module.exports = new UserList();
