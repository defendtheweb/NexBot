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
		if (matches = message.trimRight().match(/^!([\S]*) ([\S]+)(?: (.+))?$/i)) {
			if (matches[1] === 'hash') {
				var self = this;
				var type = '';
				var hash = matches[2].toLowerCase();

				if (matches[3]) {
					type = hash;
					hash = matches[3].toLowerCase();
				}

				this.getHash(hash, type, chan);
			}
		}
	},
	getHash: function(hash, type, chan)
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

				if (result.found === "true") {
					if (result.type !== 'plaintext') {
						global.irc.client.say(chan, result.hashes[0].plaintext + ' | ' + result.type);
					} else {
						if (type === '') {
							global.irc.client.say(chan, 'Invalid hash');
						} else if (result.hashes[0][type]) {
							global.irc.client.say(chan, result.hashes[0].plaintext + ' | ' + result.hashes[0][type]);
						} else {
							global.irc.client.say(chan, type + ' is not supported');
						}
					}
				} else {
					var res = 'Hash not found';

					if (result.type) {
						res += ' | Possible type: ';

						if (result.type instanceof Array) {
							var len = result.type.length;
							for (var i = 0; i < len; i++) {
								res += result.type[i] + ', ';
							}
							res = res.substring(0, res.length-2);
						} else {
							res += result.type;
						}
					}
					global.irc.client.say(chan, res);
				}
			});

		}).on('error', function(error) {
			//
		});
	}
};

module.exports = new Hash();
