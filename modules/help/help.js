var Help = function() {
	//Constructor
};

Help.prototype = {

	// private message recieved
	handlePM: function(from, message) {
		var matches = message.match(/^help(?: ([a-zA-Z]+))?$/i);
		if (matches) {
			if (matches[1]) {
				var fs = require('fs');
				fs.readFile( __dirname + '/../'+matches[1]+'/README.md', function (err, data) {
					if (err) {
						global.irc.client.say(from, "Help not found for module `" + matches[1] + "`");
					} else {
						var help = data.toString();
						//highlight code
						help = help.replace(/(?:```)(.+)(?:```)/g, "\u0002$1\u000F");
						// highlight titles
						help = help.replace(/(?:#+) (.+)\n/g, "\u0002$1\u000F\n");
						// replace links
						help = help.replace(/\[.+]\((.+)\)/g, "$1");

						global.irc.client.say(from, help);
					}
				});
			} else {
				var modules = '';

				var count = global.modules.length;
				for(var index in global.modules) {
					modules += index + ', ';
				}
				modules = modules.substring(0, modules.length-2);

				global.irc.client.say(from, "\u0002Loaded modules:\u000F " + modules);
			}
		}
	},

	handle: function(from, chan, message) {
		
	}
};

module.exports = new Help();
