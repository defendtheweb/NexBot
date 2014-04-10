var Mustachify = function() {
	//
};

Mustachify.prototype = {
	baseURL: "http://mustachify.me/",
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!([\S]*) (.*)$/i)) {
			if (matches[1] === "mustachify") {
				var type = Math.floor(Math.random() * 6);

				if (matches[2].match(/^https?:\/\//i)) {
					irc.client.say(chan, this.baseURL+type+"?src="+encodeURIComponent(matches[2]));
				}
			}
		}
	}
};

module.exports = new Mustachify();