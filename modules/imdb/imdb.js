var IMDB = function() {
	//Constructor
};

IMDB.prototype = {
	http: require('http'),
	handle: function(from, chan, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^!imdb (.+)$/i)) {
			var term = matches[1].trim();
			try {
				term = encodeURIComponent(term);
			} catch(e) {
				return;
			}

			var req = this.http.request('http://www.omdbapi.com/?t='+term, function(res) {
				res.setEncoding('utf8');
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});

				res.on('end', function(){
					if (body) {
						var obj;
						try {
							obj = JSON.parse(body);
						} catch(e) {
							return;
						}
						if (obj && obj.Title) {
							irc.client.say(chan, obj.Title + ' | Rating: ' + obj.imdbRating + ' | ' + obj.Plot);
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
};

module.exports = new IMDB();
