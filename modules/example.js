var Example = function() {
	//Constructor
}

Example.prototype = {
	// public message recieved
	handle: function(from, chan, message) {
		irc.client.say(chan, "Hello channel");
	},
	
	// private message recieved
	handlePM: function(from, message) {
		irc.client.say(from, "Hello " + from);
	}
};

module.exports = new Example();
