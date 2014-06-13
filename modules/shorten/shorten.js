var Shorten = function() {
	//Constructor
};

Shorten.prototype = {
	https: require('https'),
	querystring: require('querystring'),
	api_key: global.config.get('youtube_api'),
	regex: new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/),
	handlePM: function(from, message) {
		var irc = global.irc;

		var matches;
		if (matches = message.match(/^([\S]*) ([\S]+)( (.+))?$/i)) {
			if (matches[1] === "shorten" || matches[1] === "s") {

				var url = matches[2].trim();
				var self = this;

				  // Build the post string from an object
				  var post_data = JSON.stringify({
				      'longUrl' : url
				  });

				  // An object of options to indicate where to post to
				  var post_options = {
				      host: 'www.googleapis.com',
				      port: '443',
				      path: '/urlshortener/v1/url?key='+this.api_key,
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
						if (body != 0) {
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
					irc.client.say(chan, "Errm there's be an error");
				});
			}
		}
	}
};

module.exports = new Shorten();
