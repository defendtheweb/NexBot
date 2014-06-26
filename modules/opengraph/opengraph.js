var opengraph = function() {
    //Constructor
};

opengraph.prototype = {
    og: require('open-graph'),
    regex: new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[$
    handle: function(from, chan, message) {
        var irc = global.irc;

        // use regex to find ids
        var results = this.regex.exec(message);
        if (results) {
            var uri = results[0].trim();

            var result = '';

            this.og(uri, function(err, meta){
                if (meta.title) {
                    result = meta.title;
                }

                if (meta.description) {
                    if (result) {
                        result += ' | ';
                    }
                    result += meta.title;
                }

                if (meta.site_name) {
                    if (result) {
                        result += ' [' + meta.site_name + ']';
                    } else {
                        result += meta.site_name;
                    }
                }

                if (result) {
                    irc.client.say(chan, result);
                }
            });
        }
    }
};

module.exports = new opengraph();
