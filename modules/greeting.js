var Greeting = function() {
	//Constructor
}

Greeting.prototype = {
	greeting: global.config.get("greeting"),
	join: function(chan, nick, message) {
		if (this.greeting instanceof Array) {
			greet = this.greeting[Math.floor(Math.random()*this.greeting.length)];
		} else {
			greet = this.greeting;
		}
		
		if (nick != global.config.get("nick"))
			if (global.config.get("greeting-ignore").indexOf(nick) < 0)
				irc.client.say(chan, greet + " " + nick);
	}
};

module.exports = new Greeting();