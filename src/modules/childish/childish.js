var Childish = function() {
	//Constructor
};

Childish.prototype = {

	handle: function(from, chan, message) {
		var matches = message.match(/(gay|cock|boobs|period)/i);
		if (matches) {
			global.irc.client.say(chan, "hehe, " + matches[1]);
		}
	}
};

module.exports = new Childish();
