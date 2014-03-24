var Issues = function () {
    //Constructor
};

Issues.prototype = {
    https: require('https'),

    handle: function (from, chan, message) {
        if (matches = message.match(/^!([\S]*) ([A-Za-z0-9./]+)$/i)) {
            if (matches[1] === "issues") {
                this.request(chan, matches[2]);
            }
        } else if (matches = message.match(/^!([\S]*)$/i)) {
            if (matches[1] === "issues") {
                this.request(chan, 'HackThis/NexBot');
            }
        }
    },

    request: function (chan, repo) {
        var irc = global.irc;
        var req = this.https.request({
            host: 'api.github.com',
            path: '/repos/'+repo+'/issues',
            headers: {
                'User-Agent': 'hackthis/NexBot'
            }
        }, function (res) {
            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                if (res.statusCode === 200) {
                    try {
                        var obj = JSON.parse(data);
                        var count = obj.length;
                        irc.client.say(chan, repo + " has " + count + " open issue" + (count > 1 ? 's' : '') + " [http://git.io/hjkhrA]");
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    console.log("Issues request failed, response code: " + res.statusCode);
                    console.log("Returned body: " + data);
                }
            });
        });

        req.end();

        req.on('error', function (error) {
            irc.client.say(chan, "Errm there's be an error");
        });      
    }
};

module.exports = new Issues();
