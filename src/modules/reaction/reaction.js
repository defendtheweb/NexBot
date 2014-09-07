var Reaction = function() {
    this.jsdom = require('jsdom');
    this.request = require('request');
};

Reaction.prototype = {
    handle: function(from, chan, message) {
        var self = this,
            matches = message.match(/^#(.+)/i);

        if (matches) {
            console.log('Reaction: ' + matches[1]);

            self.jsdom.env('http://www.reactiongifs.com/?s=' + matches[1], ['http://code.jquery.com/jquery-1.6.min.js'], function(err, window) {
                var $ = window.jQuery,
                src = $($('.entry img').get().sort(function() {
                    return Math.round(Math.random()) - 0.5;
                }).slice(0,1)).attr('src');

                global.irc.client.say(chan, src);
            });

        }
    }
};

module.exports = new Reaction();
