var Imgur = function() {
	var Loader = require('../../loader.js');
	this.cmd = '!imgur';
	this.includeNSFW = false;
};

// Gets an image from IMGUR. Possible improvements is to enable/disable nsfw and request gifs.
// https://api.imgur.com/models/gallery_image

Imgur.prototype = {
	https: require('https'),
	// An array of images/albums returned from the imgur api
	_cachedResults: [],

	_displayResult: function(chan, imgur) {
		var irc = global.irc;
		irc.client.say(chan, 
			imgur['title'] + " - " + imgur['link'] + " \u000303" + 
			imgur['ups'] + "\u000f\u2934 \u000304" + 
			imgur['downs'] + "\u000f\u2935"); 
	},

	_doImgurRequest: function(callback) {
		var options = {
			hostname: "api.imgur.com",
			path: "/3/gallery/random/random/",
			headers: {
				Authorization: 'Client-ID c4c9e4ba4074384',
				Accept: 'application/json'
			}
		};

		this.https.get(options, function(res) {
			var buffered_data = '';
			res.on('data', function(d) {
				buffered_data += d.toString();
			});

			res.on('end', function(){
				if (res.statusCode === 200) {
					var results;
					try {
						results = JSON.parse(buffered_data)['data'];
					} catch (e) {
						return;
					}
					if(Array.isArray(results)) {
						callback(results);
					}
				} else {
					console.log("Imgur request failed, status code: " + res.statusCode);
					console.log("Returned body: " + buffered_data);
				}				
			});
		}).on('error', function(e) {
			console.error(e);
		});
	},

	handle: function(from, chan, message) {
		if (message.length === this.cmd.length && message.indexOf(this.cmd) === 0) {
			if(this._cachedResults.length > 0) {
				// We have cached results, display one of them
				this._displayResult(chan, this._cachedResults.shift());
			} else {
				var _this = this;
				this._doImgurRequest(function(results) {
					// Filter the results and add all that pass
					// the filter to the array of cached results
					_this._cachedResults = results.filter(function(ele) {
						if(ele['is_album'] === true) {
							return false;
						} else if(!_this.includeNSFW && ele['nsfw']) {
							return false;
						} else { 
							return true;
						}
					}).concat(_this._cachedResults);
					
					if(_this._cachedResults.length > 0) {
						_this._displayResult(chan, _this._cachedResults.shift());
					}
				});
			}
		}
	}
};

module.exports = new Imgur();
