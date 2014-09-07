var Conduct = function() {
	var codes = ['answers to all levels will be my own work, unless otherwise instructed.',
				 'I will not share answers to any level.',
				 'I will not participate in, condone or encourage unlawful activity, including any breach of copyright, defamation, or contempt of court.',
				 'As the HackThis!! community’s first language is English, I will always post contributions in English to enable all to understand',
				 'I will not use HackThis!! to advertise products or services for profit or gain.',
				 'I will not use racist, sexist, homophobic, sexually explicit or abusive terms or images, or swear words or language that is likely to cause offence.'];
};

Conduct.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!conduct (\d+)$/i)) {
			var index = parseInt(matches[1]) - 1;
			if (index < this.codes.length) {
				var msg = this.codes[index];

				if (index != 3) {
					msg = "As a HackThis!! member " + msg;
				}

				irc.client.say(chan, msg);
			}
		}
	}
};

module.exports = new Conduct();