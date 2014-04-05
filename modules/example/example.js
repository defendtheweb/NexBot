var Example = function() {
	//Constructor
};

Example.prototype = {
	// public message recieved
	handle: function(from, chan, message) {
		global.irc.client.say(chan, "Hello channel");
	},
	
	// private message recieved
	handlePM: function(from, message) {
		global.irc.client.say(from, "Hello " + from);
	}
};

module.exports = new Example();
