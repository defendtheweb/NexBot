var YouTube = function() {
	//Constructor
};

YouTube.prototype = {
	https: require('https'),
	api_key: global.config.get('youtube_api'),
	regex: new RegExp(/(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/(watch\?v=)?([^\s]+)/),
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!([\S]*) (.+)$/i)) {
			if (matches[1] === "youtube") {
				var term = matches[2];
				term = term.trim();
				var self = this;

				var req = this.https.request('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key='+this.api_key+'&q='+term, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						if (body != 0) {
							var obj = JSON.parse(body);
							if (obj && obj.items && obj.items.length > 0) {
								// Return the string.
								var result = obj.items[0].snippet.title + ' | https://www.youtube.com/watch?v=' + obj.items[0].id.videoId;
								irc.client.say(chan, result);
							} else {
								irc.client.say(chan, "No videos found");
							}
						} else {
							irc.client.say(chan, "No videos found");
						}
					});
				});
				req.end();

				req.on('error', function(e) {
					irc.client.say(chan, "Errm there's be an error");
				});
			}
		} else {
			// use regex to find ids
			var results = this.regex.exec(message);
			if (results) {
				console.log(results);
				id = results[5].trim();
				var self = this;

				var req = this.https.request('https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id='+id+'&key='+this.api_key, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						if (body != 0) {
							var obj = JSON.parse(body);
							if (obj && obj.items && obj.items.length > 0) {
								// Return the string.
								var result = obj.items[0].snippet.title + ' | Views: ' + self.addCommas(obj.items[0].statistics.viewCount) + ' | Ratin: ' + obj.items[0].statistics.likeCount + '/' + obj.items[0].statistics.dislikeCount;
								irc.client.say(chan, result);
							}
						}
					});
				});
				req.end();

				req.on('error', function(e) {
					irc.client.say(chan, "Errm there's be an error");
				});
			}
		}
	},
	addCommas: function(nStr) {
	    nStr += '';
	    x = nStr.split('.');
	    x1 = x[0];
	    x2 = x.length > 1 ? '.' + x[1] : '';
	    var rgx = /(\d+)(\d{3})/;
	    while (rgx.test(x1)) {
	            x1 = x1.replace(rgx, '$1' + ',' + '$2');
	    }
	    return x1 + x2;
	}
};

module.exports = new YouTube();
