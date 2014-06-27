var _Groove = require('../../lib/groove.js');

var Grooveshark = function() {
	//Constructor
	this.api = new _Groove(global.config.get('groove'));

	//Check if lastfm module is loaded
	if (!global.modules['lastfm']) {
		console.log("\033[31m[Grooveshark] \033[0mlastfm module required for some features");
	}
};

Grooveshark.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		var api = this.api;

		var matches;
		if (matches = message.match(/^!([\S]*) (.*)$/i)) {
			if (matches[1] === "groove") {
				this.api.shorten(matches[2], function(err, response) {
					if (err) {
						irc.client.say(from, "Groove error!");
					} else {
						var url = response.Url;
						var artist = response.ArtistName;
						var song = response.SongName;
						irc.client.say(chan, artist + ' - ' + song + ' : '+url);
					}
				});
			}
		} else if (matches = message.match(/^!([\S]*)$/i)) {
			if (matches[1] === "groove") {
				if (global.nicks.data[from] && global.nicks.data[from]['lastfm']) {
					//Requires lastfm module to be loaded
					if (global.modules['lastfm']) {
						var request = global.modules['lastfm'].api.request("user.getrecenttracks", {
							user: global.nicks.data[from]['lastfm'],
							handlers: {
								success: function(data) {
									api.shorten(data.recenttracks.track[0].artist['#text'] + ' ' + data.recenttracks.track[0].name, function(err, response) {
										if (err) {
											irc.client.say(from, "Groove error!");
										}

										var url = response.Url;
										var artist = response.ArtistName;
										var song = response.SongName;
										irc.client.say(chan, artist + ' - ' + song + ' : '+url);
									});
								},
								error: function(error) {
									irc.client.say(chan, "Errors everywhere!!");
								}
							}
						});
					}
				} else {
					irc.client.say(from, "Please set your last.fm username, type: set last.fm <username>");
				}
			}
		}
	}
};

module.exports = new Grooveshark();