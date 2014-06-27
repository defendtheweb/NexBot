var Shorten = function() {
	//Constructor
};

Shorten.prototype = {
	https: require('https'),
	querystring: require('querystring'),
	api_key: global.config.get('youtube_api'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!shorten stats ([\S]+)?$/i)) {
			var url = matches[1].trim();

			var req = this.https.request('https://www.googleapis.com/urlshortener/v1/url?shortUrl='+url+'&key='+this.api_key+'&projection=FULL', function(res) {
				res.setEncoding('utf8');
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});

				res.on('end', function(){
					if (body) {
						var obj = JSON.parse(body);
						if (obj && obj.longUrl) {
							// Return the string.
							var result = obj.longUrl + ' | Clicks: ' + obj.analytics.allTime.shortUrlClicks;
							
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
	},
	handlePM: function(from, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^([\S]*) ([\S]+)( (.+))?$/i)) {
			if (matches[1] === "shorten" || matches[1] === "s") {

				var url = matches[2].trim();

                // Build the post string from an object
                var post_data = JSON.stringify({
                    'longUrl': url
                });

                // An object of options to indicate where to post to
                var post_options = {
                    host: 'www.googleapis.com',
                    port: '443',
                    path: '/urlshortener/v1/url?key=' + this.api_key,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

				var req = this.https.request(post_options, function(res) {
					res.setEncoding('utf8');
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});

					res.on('end', function(){
						console.log(body);
						if (body) {
							var obj = JSON.parse(body);
							if (obj && obj.id) {
								// Return the string.
								var result = obj.id;

								if (matches[4]) {
									irc.client.say(matches[4], from + ': ' + result);
								} else {
									irc.client.say(from, result);
								}
							}
						}
					});
				});
				req.write(post_data);
				req.end();

				req.on('error', function(e) {
					irc.client.say(from, "Errm there's be an error");
				});
			}
		}
	}
};

module.exports = new Shorten();
