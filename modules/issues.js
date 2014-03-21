var Issues = function () {
    //Constructor
};

Issues.prototype = {
    https: require('https'),

    handle: function (from, chan, message) {
        var irc = global.irc;
        if (message.length === '!issues'.length && message.indexOf('!issues') === 0) {
            var req = this.https.request({
                host: 'api.github.com',
                path: '/repos/HackThis/NexBot/issues',
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
                            irc.client.say(chan, "NexBot has " + count + " open issue" + (count > 1 ? 's' : '') + " [http://git.io/hjkhrA]");
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
    }
};

module.exports = new Issues();
