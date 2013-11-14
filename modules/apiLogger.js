var ApiLogger = function() {
    //Constructor
};

ApiLogger.prototype = {
    http: require('https'),
    querystring: require('querystring'),

    handle: function(from, chan, message) {
        var key = global.config.get('hackthis_api');

        var post_data = this.querystring.stringify({
            'nick' : from,
            'chan': chan,
            'msg': message
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: 'www.hackthis.co.uk',
            port: '443',
            path: '/?key='+key+'&api&action=irc.log',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': post_data.length
            }
        };

        // Set up the request
        var post_req = this.http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
    }
};

module.exports = new ApiLogger();
