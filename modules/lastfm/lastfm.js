var _LastFmNode = require('lastfm').LastFmNode;

var LastFM = function() {
	//Constructor
	this.api = new _LastFmNode({
		api_key: global.config.get('lastfm_key'),
		secret: global.config.get('lastfm_secret')
	});
};

LastFM.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!([\S]*) (.*)$/i)) {
			if (matches[1] === "last.fm") {
				this.api.request("user.getrecenttracks", {
					user: matches[2],
					handlers: {
						success: function(data) {
							irc.client.say(chan, data.recenttracks.track[0].artist['#text'] + " - " + data.recenttracks.track[0].name);
						},
						error: function(error) {
							irc.client.say(chan, "Invalid last.fm username");
						}
					}
				});
			}
		} else if (matches = message.match(/^!([\S]*)$/i)) {
			if (matches[1] === "last.fm") {
				if (global.nicks.data[from] && global.nicks.data[from]['lastfm']) {
					this.api.request("user.getrecenttracks", {
						user: global.nicks.data[from]['lastfm'],
						handlers: {
							success: function(data) {
								irc.client.say(chan, data.recenttracks.track[0].artist['#text'] + " - " + data.recenttracks.track[0].name);
							},
							error: function(error) {
								irc.client.say(chan, "Errors everywhere!!");
							}
						}
					});
				} else {
					irc.client.say(from, "Please set your last.fm username. set last.fm <username>");	
				}
			}
		}
	},

	handlePM: function(from, message) {
		var matches;
		if (matches = message.match(/^([\S]*) (.*) (.*)$/i)) {
			if (!global.nicks.data[from]) {
				global.nicks.data[from] = {};
			}

			if (matches[1] === "set") {
				if (matches[2] === "last.fm") {
					global.nicks.data[from]['lastfm'] = matches[3];
					global.nicks.save();
					global.irc.client.say(from, "Set last.fm user name as " + global.nicks.data[from]['lastfm']);	
				}
			}
		}
	}
};

module.exports = new LastFM();