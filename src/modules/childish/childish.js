var Childish = function() {
	//Constructor
};

Childish.prototype = {

	handle: function(from, chan, message) {
		var matches = message.match(/(gay|cock|boobs|period)/i);
		if (matches) {
			global.irc.client.say(chan, "hehe, " + matches[1]);
		}

		var matches = message.match(/serious/i);
		if (matches) {
			global.irc.client.send('NICK', 'Sirius');
			global.irc.client.say(chan, "You're not serious, I'm Sirius!");
			global.irc.client.send('NICK', 'NexBot');
		}
	}

};

module.exports = new Childish();
