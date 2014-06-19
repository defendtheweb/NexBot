var Hash = function() {
	//Constructor
	this.apiEndpoint = 'https://api.leakdb.net/?j={q}';
};

Hash.prototype = {
	https: require('https'),
	debug: global.config.get('debug'),
	apiKey: global.config.get('wordnik_api'),
	handle: function(from, chan, message) {
		var irc = global.irc;
		var matches;
		if (matches = message.trimRight().match(/^!([\S]*) ([\S]+)$/i)) {
			if (matches[1] === 'hash') {
				var self = this;
				this.getHash(matches[2].toLowerCase(), chan);
			}
		}
	},
	getHash: function(hash, chan)
	{
		var self = this;
		this.https.get(this.apiEndpoint.replace("{q}", hash.trim()), function(res) {
			res.setEncoding('utf8');
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function(){
				var result = {};
				try {
					result = JSON.parse(body);
				} catch (ex) {
					return;
				}
				
				if (result.found) {
					if (result.type != plaintext) {
						global.irc.client.say(chan, result.plaintext + ' | ' + result.type);
					} else {

					}
				} else {
					var res = 'Hash not found';

					if (result.type) {
						res += ' | Possible type: ';
						var len = result.type.length;
						for (var i = 0; i < arrayLength; i++) {
							res += result.type[i] + ', ';
						}
						res = res.substring(0, res.length-1);
					}
					global.irc.client.say(chan, res);
				}
			});

		}).on('error', function(error) {
			//
		});
	},
};

module.exports = new Hash();
