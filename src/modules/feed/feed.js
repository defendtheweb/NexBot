var Feed = function() {
    // Array of channels each event should be sent to
    this.events = [];
    this.events['join'] = ['#feed'];
    this.events['level'] = ['#feed'];
    this.events['article'] = ['#hackthis', '#feed'];
    this.events['forum_post'] = ['#hackthis', '#feed'];
    this.events['comment'] = ['#hackthis', '#feed'];

    this.jsdom = require('jsdom');
    this.request = require('request');

    // Setup socket
    this.setupSocket();
};

Feed.prototype = {
    setupSocket: function() {
        var self = this,
            socketio = require('socket.io-client');

        this.socket = socketio.connect('wss://hackthis.co.uk:8080/', { forceNew: true, timeout: 1000, secure: true, debug: true });

        this.socket.on('feed', function (event) {
            if (event instanceof Array) {
                return false;
            }

            if (event && event.type) {

                if (event.type == 'level' && event.title[0] === 'M') {
                    return;
                }

                switch(event.type) {
                    case "join":
                        result = "\x02\x0303[User]\x03\x0F " + event.username + " has just joined"; break;
                    case "level":
                        result = "\x02\x0303[Level]\x03\x0F " + event.username + " completed " + event.title; break;
                    case "article":
                        result = "\x02\x0303[Article]\x03\x0F " + event.title + " - https://www.hackthis.co.uk" + event.uri; break;
                    case "forum_post":
                        result = "\x02\x0303[Forum]\x03\x0F New post in " + event.title + " by " + event.username + " - https://www.hackthis.co.uk"+ event.uri;
                        self.latestForumURI = "https://www.hackthis.co.uk" + event.uri;
                        self.latestForum = "\x02\x0303[Forum]\x03\x0F " + event.title + " by " + event.username + " - https://www.hackthis.co.uk"+ event.uri;
                        break;
                    case "comment":
                        result = "\x02\x0303[Comment]\x03\x0F " + event.username + " commented on " + event.title + " - https://www.hackthis.co.uk" + event.uri; break;
                }

                var channels = self.events[event.type];
                if (channels) {
                    var channelsLength = channels.length;
                    for (var i = 0; i < channelsLength; i++) {
                        irc.client.say(channels[i], result);
                    }
                }

		if (event.type == "level" && (event.title == 'Real 6' || event.title == 'Crypt 8' || event.title == 'Crypt 7')) {
			irc.client.say('#hackthis', result);
	        }
	    }
        });
    },
    handle: function(from, chan, message) {
        var irc = global.irc,
            self = this;

        var matches;
        if (matches = message.match(/^!feed read$/i)) {
            if (matches) {

                self.jsdom.env(this.latestForumURI, ['http://code.jquery.com/jquery-1.6.min.js'], function(err, window) {
                    var $ = window.jQuery,
                        body = $('.post-list li[data-id]:last .post_body:not(.karma)').clone().children('.post_signature').remove().end().text();

                    irc.client.say(chan, self.latestForum);
                    irc.client.say(chan, body.trim());
                });

            }
        }
    }
};

module.exports = new Feed();

