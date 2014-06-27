var Imgur = function() {
	var Loader = require('../../loader.js');
	this.cmd = '!imgur';
};

// Gets an image from IMGUR. Possible improvements is to enable/disable nsfw and request gifs.
/*
	id: 'vLANG',
    title: 'SCUMBAG DALE',
    description: null,
    datetime: 1318883409,
    type: 'image/jpeg',
    animated: false,
    width: 609,
    height: 1028,
    size: 88130,
    views: 301746,
    bandwidth: 26592874980,
    vote: null,
    favorite: false,
    nsfw: false,
    section: 'pics',
    account_url: null,
    link: 'http://i.imgur.com/vLANG.jpg',
    ups: 317,
    downs: 19,
    score: 448,
    is_album: false
*/


Imgur.prototype = {
	https: require('https'),

	handle: function(from, chan, message) {
		var irc = global.irc;

		if (message.length === this.cmd.length && message.indexOf(this.cmd) === 0) {
			var buffered_data = '',
				options = {
					hostname: "api.imgur.com",
					path: "/3/gallery/random/random/",
					headers: {
						Authorization: 'Client-ID c4c9e4ba4074384',
						Accept: 'application/json'
					}
				};
			this.https.get(options, function(res) {
				// Get the full reply
				res.on('data', function(d) {
					buffered_data += d.toString();
				});

				res.on('end', function(){
					// Probably add some better support for performance calls here, as it gets 56 results from Imgur then randomly selects one, it will do this each time because imgur give us 56 random images then update it every hour.
					var imgur = JSON.parse(buffered_data).data[Math.floor(Math.random() * (JSON.parse(buffered_data).data.length - 1))];
					irc.client.say(chan, imgur.title + " - " + imgur.link + " \u000303" + imgur.ups + "\u000f\u2934 \u000304" + imgur.downs + "\u000f\u2935"); 
				});
			}).on('error', function(e) {
				console.error(e);
			});
		}
	}
};

module.exports = new Imgur();
